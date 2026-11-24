"""
Test script to verify forward and backward passes of custom SPPFCSPC and ScConv modules.
Verifies:
1. SPPFCSPC forward pass + backward gradient propagation.
2. ScConv forward pass + backward gradient propagation.
3. Registration into Ultralytics namespace.
"""

import sys
from pathlib import Path

# Fix Windows console UTF-8 output
if sys.platform == 'win32':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

import torch
import torch.nn as nn

# Add project root to sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent))

from ml.modules.custom_modules import SPPFCSPC, ScConv, register_custom_modules

def test_modules():
    print("=" * 70)
    print("RoadSense AI: Custom Module Forward & Backward Pass Verification")
    print("=" * 70)

    device = torch.device("cpu")
    print(f"Testing on device: {device}")

    # 1. Test SPPFCSPC
    print("\n[1/3] Testing SPPFCSPC (c1=64, c2=128)...")
    sppf_cspc = SPPFCSPC(c1=64, c2=128).to(device)
    dummy_input = torch.randn(2, 64, 128, 128, device=device, requires_grad=True)

    out = sppf_cspc(dummy_input)
    print(f"  Input shape:  {list(dummy_input.shape)}")
    print(f"  Output shape: {list(out.shape)}")
    assert out.shape == (2, 128, 128, 128), f"Unexpected output shape: {out.shape}"

    # Backward pass
    loss = out.sum()
    loss.backward()
    assert dummy_input.grad is not None, "SPPFCSPC backward pass failed to compute input gradients!"
    print("  [OK] Forward pass verified")
    print("  [OK] Backward pass verified (gradients propagated cleanly)")

    # 2. Test ScConv
    print("\n[2/3] Testing ScConv (c1=128, c2=128)...")
    scconv = ScConv(c1=128, c2=128).to(device)
    dummy_input2 = torch.randn(2, 128, 64, 64, device=device, requires_grad=True)

    out2 = scconv(dummy_input2)
    print(f"  Input shape:  {list(dummy_input2.shape)}")
    print(f"  Output shape: {list(out2.shape)}")
    assert out2.shape == (2, 128, 64, 64), f"Unexpected output shape: {out2.shape}"

    # Backward pass
    loss2 = out2.sum()
    loss2.backward()
    assert dummy_input2.grad is not None, "ScConv backward pass failed to compute input gradients!"
    print("  [OK] Forward pass verified")
    print("  [OK] Backward pass verified (gradients propagated cleanly)")

    # 3. Test Ultralytics Registration
    print("\n[3/3] Testing Ultralytics Module Registration...")
    success, msg = register_custom_modules()
    print(f"  Status: {msg}")
    assert success, "Registration failed!"

    import ultralytics.nn.modules as modules
    assert hasattr(modules, 'SPPFCSPC'), "ultralytics.nn.modules does not have SPPFCSPC"
    assert hasattr(modules, 'ScConv'), "ultralytics.nn.modules does not have ScConv"
    print("  [OK] SPPFCSPC verified in ultralytics.nn.modules")
    print("  [OK] ScConv verified in ultralytics.nn.modules")

    print("\n" + "=" * 70)
    print("ALL CUSTOM MODULE TESTS PASSED SUCCESSFULLY!")
    print("=" * 70)

if __name__ == "__main__":
    test_modules()
