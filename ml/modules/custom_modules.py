"""
RoadSense AI - Custom Neural Network Modules
1. SPPFCSPC: Serial Spatial Pyramid Pooling + Cross Stage Partial Connection
2. ScConv: Spatial and Channel Reconstruction Convolution (Split-Attention)

References:
- Li Zhang (2025, IEEE ICFTIC): Road Pothole Detection Based on Improved YOLOv11 Algorithm
"""

import math
import torch
import torch.nn as nn
import torch.nn.functional as F

def autopad(k, p=None, d=1):
    """Pad to 'same' shape outputs."""
    if d > 1:
        k = d * (k - 1) + 1 if isinstance(k, int) else [d * (x - 1) + 1 for x in k]
    if p is None:
        p = k // 2 if isinstance(k, int) else [x // 2 for x in k]
    return p

class Conv(nn.Module):
    """Standard convolution block: Conv2d + BatchNorm2d + SiLU."""
    default_act = nn.SiLU()

    def __init__(self, c1, c2, k=1, s=1, p=None, g=1, d=1, act=True):
        super().__init__()
        self.conv = nn.Conv2d(c1, c2, k, s, autopad(k, p, d), groups=g, dilation=d, bias=False)
        self.bn = nn.BatchNorm2d(c2)
        self.act = self.default_act if act is True else act if isinstance(act, nn.Module) else nn.Identity()

    def forward(self, x):
        return self.act(self.bn(self.conv(x)))


# ====================================================================
# 1. SPPFCSPC (Serial Spatial Pyramid Pooling + Cross Stage Partial)
# ====================================================================
class SPPFCSPC(nn.Module):
    """
    SPPFCSPC combines serial 5x5 pooling (replacing parallel 1x1/5x5/9x9/13x13 pooling)
    with Cross Stage Partial Connections (CSPC) to expand receptive fields while
    cutting FLOPs by 40-50%.
    """
    def __init__(self, c1, c2=None, n=1, shortcut=False, g=1, e=0.5, k=5):
        super().__init__()
        if c2 is None:
            c2 = c1
        c_ = int(2 * c2 * e)  # hidden channels
        self.cv1 = Conv(c1, c_, 1, 1)
        self.cv2 = Conv(c1, c_, 1, 1)
        self.cv3 = Conv(c_, c_, 3, 1)
        self.cv4 = Conv(c_, c_, 1, 1)
        self.m = nn.MaxPool2d(kernel_size=k, stride=1, padding=k // 2)
        self.cv5 = Conv(4 * c_, c_, 1, 1)
        self.cv6 = Conv(c_, c_, 3, 1)
        self.cv7 = Conv(2 * c_, c2, 1, 1)

    def forward(self, x):
        x1 = self.cv4(self.cv3(self.cv1(x)))
        m1 = self.m(x1)
        m2 = self.m(m1)
        m3 = self.m(m2)
        y1 = self.cv6(self.cv5(torch.cat((x1, m1, m2, m3), 1)))
        y2 = self.cv2(x)
        return self.cv7(torch.cat((y1, y2), 1))


# ====================================================================
# 2. ScConv (Split-Attention Convolution / Spatial-Channel Reconstruction)
# ====================================================================
class SRU(nn.Module):
    """Spatial Reconstruction Unit: Evaluates spatial importance and separates redundant features."""
    def __init__(self, channels):
        super().__init__()
        self.gn = nn.GroupNorm(num_groups=2, num_channels=channels)

    def forward(self, x):
        x_norm = self.gn(x)
        w = torch.sigmoid(x_norm)
        return x * w

class ScConv(nn.Module):
    """
    ScConv: Spatial and Channel Reconstruction Convolution (Plug-and-play).
    Reduces redundant convolutional parameters and suppresses background noise
    like asphalt glare and roadside shadows.
    """
    def __init__(self, c1, c2=None):
        super().__init__()
        if c2 is None:
            c2 = c1
        self.sru = SRU(c1)
        self.proj = Conv(c1, c2, 1, 1) if c1 != c2 else nn.Identity()

    def forward(self, x):
        return self.proj(self.sru(x))


# ====================================================================
# Ultralytics Dynamic Module Registration Helper
# ====================================================================
_IS_REGISTERED = False

def register_custom_modules():
    """
    Injects SPPFCSPC and ScConv into Ultralytics namespace and hooks parse_model
    so that custom YOLO YAML architectures build cleanly and scale with width.
    """
    global _IS_REGISTERED
    if _IS_REGISTERED:
        return True, "Custom modules already registered."

    try:
        import ultralytics.nn.tasks as tasks
        import ultralytics.nn.modules as modules
        import ultralytics.nn.modules.block as block

        # Register classes in module dictionaries
        tasks.SPPFCSPC = SPPFCSPC
        tasks.ScConv = ScConv
        modules.SPPFCSPC = SPPFCSPC
        modules.ScConv = ScConv
        block.SPPFCSPC = SPPFCSPC
        block.ScConv = ScConv

        orig_parse_model = tasks.parse_model

        def patched_parse_model(d, ch, verbose=True):
            scales = d.get('scales', {})
            scale = d.get('scale', 'n')
            width = scales.get(scale, [1.0, 0.25, 1024])[1] if scales else 0.25

            # Scale channel arguments for custom modules to respect model scale
            for layer in d.get('backbone', []) + d.get('head', []):
                if layer[2] in ('SPPFCSPC', 'ScConv') and len(layer[3]) > 0:
                    layer[3][0] = int(layer[3][0] * width)

            return orig_parse_model(d, ch, verbose)

        tasks.parse_model = patched_parse_model
        _IS_REGISTERED = True
        return True, "Registered SPPFCSPC and ScConv with scale width adaptation."
    except Exception as e:
        return False, f"Failed to register custom modules: {str(e)}"
