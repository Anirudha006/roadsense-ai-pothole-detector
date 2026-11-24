# RoadSense AI - Driver PWA Documentation (Phase 3)

## 1. Overview
The **RoadSense AI Driver PWA** (`apps/driver-pwa`) is a mobile-first Progressive Web Application engineered for edge inference, driver safety, and minimal driver distraction. It detects potholes and road hazards in real-time, computes their spatial distance ahead using flat-road pinhole projection, and sounds urgent spoken and audio warnings dynamically calibrated to the vehicle's driving speed.

---

## 2. Architecture & Design Principles

### Core Principle: Glanceable Safety (< 1 Second Comprehension)
A driver travelling at highway speeds (80–100 km/h) cannot decipher detailed graphs or small fonts.
- **Audible First:** Web Speech API voice announcements in **English, Kannada, and Hindi** accompanied by dual-tone synthesized chime warnings and haptic vibration.
- **Glanceable UI:** Massive bold km/h speed badge, color-coded dynamic warning horizon pill, and high-contrast alert banner sliding from the top.
- **Minimal Mode:** Extraneous buttons and telemetry automatically fade when travelling above 10 km/h.
- **Screen Wake Lock:** Prevents screen dimming or locking during active trips.

---

## 3. Web Worker Edge AI Inference
To keep UI rendering locked at 60 FPS without jank:
- **Dedicated Web Worker:** `src/workers/detector.worker.ts` handles:
  1. Input frame letterboxing to $640 \times 640$ with aspect-ratio padding ($114, 114, 114$).
  2. Planar RGB normalization ($[0, 1]$ Float32Array).
  3. `onnxruntime-web` execution (WebAssembly SIMD + multi-threading).
  4. Non-Maximum Suppression (NMS) with IoU thresholding (0.45) and confidence filtering.
  5. Distance calculation and physical hazard area estimation ($A_{\text{m}^2}$).
- **Zero UI Blocking:** The main React thread captures canvas frames and dispatches them via Transferable Buffers to the worker.

---

## 4. Kinematic Speed-Adaptive Dynamic Alert Distance

### Formula:
$$D_{\text{alert}} = \max\left(D_{\text{min}},\, v \cdot t_{\text{react}} + \frac{v^2}{2 \mu g}\right)$$

Where:
- $D_{\text{min}} = 20\text{ m}$ (safety floor).
- $t_{\text{react}} = 1.5\text{ s}$ (driver perception-reaction time).
- $\mu = 0.65$ (average coefficient of friction on wet/dry asphalt).
- $g = 9.81\text{ m/s}^2$ (gravitational acceleration).

### Real Measured Distance Horizon:
| Speed ($v$) | Stopping Horizon ($D_{\text{alert}}$) | Base Paper (Neeralkatti 2025) Fixed Alert | RoadSense AI Improvement |
| :--- | :--- | :--- | :--- |
| **30 km/h** | **20.0 m** (floor applied) | 30.0 m | Eliminates premature/nuisance alerts |
| **50 km/h** | **36.0 m** | 30.0 m | +6m safety margin |
| **80 km/h** | **71.9 m (~72 m)** | 30.0 m (Leaves only 1.35s!) | **+42m (+140% reaction distance)** |
| **100 km/h** | **102.3 m (~102 m)** | 30.0 m (Imminent collision!) | **+72m (+241% reaction distance)** |

---

## 5. Demo / Viva Simulation Lab Mode
For project viva, reviews, and evaluation without sitting in a moving vehicle:
1. **Interactive Road Simulator:** Canvas perspective engine rendering approaching dashed lines, road texture, and realistic potholes and cracks travelling towards the car.
2. **Speed Override Slider (20 to 100 km/h):** Instantly demonstrates dynamic alert distance expansion from $20\text{m} \to 72\text{m} \to 102\text{m}$ in real time.
3. **Compare Screen:** Direct side-by-side comparison between Base Paper (fixed 30m) and RoadSense AI (speed-adaptive).
4. **Seed ~200 Hazards Button:** Instantly generates realistic geo-located hazard clusters around **Bengaluru** (MG Road, Indiranagar, Domlur) or **Hubballi** (Vidyanagar, Gokul Road) with varied severities, verification counts, and ward tags.
5. **500m Radar Mini Map View:** Solves the critical traffic occlusion limitation highlighted in IEEE Paper 2 by caching and plotting upcoming cloud hazards within 500 meters of the vehicle.

---

## 6. How to Run Locally

### Start Development Server:
```powershell
npm run dev:driver
```
Opens at `http://localhost:5173`.

### Production Build:
```powershell
npm run build:driver
```

### Preview Production Build:
```powershell
npm run preview:driver
```
