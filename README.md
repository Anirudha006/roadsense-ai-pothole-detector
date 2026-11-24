# RoadSense AI — Edge AI Pothole Detection & Telematics System

<div align="center">

![RoadSense AI Banner](https://img.shields.io/badge/RoadSense_AI-Admin_Portal-0D9488?style=for-the-badge&logo=shield)
![Team Number](https://img.shields.io/badge/Team_Number-07-14B8A6?style=for-the-badge)
![Institution](https://img.shields.io/badge/MIT_Mysore-Dept._of_AI-0F2A2E?style=for-the-badge)

**Real-time edge computer vision (YOLO11n ONNX), 6-DOF IMU sensor telematics, Google Maps navigation, area-wise hazard distribution analytics, and continuous cloud retraining with GPS-tagged imagery.**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![YOLO11n](https://img.shields.io/badge/Model-YOLO11n_ONNX-orange.svg)](https://github.com/ultralytics/ultralytics)
[![Android](https://img.shields.io/badge/Platform-Android_Native_%7C_PWA-green.svg)](https://capacitorjs.com)
[![React](https://img.shields.io/badge/Frontend-React_18_%7C_Vite-61DAFB.svg)](https://react.dev)
[![Leaflet](https://img.shields.io/badge/GIS-Leaflet_1.9-brightgreen.svg)](https://leafletjs.com)

</div>

---

## 📌 Executive Overview

**RoadSense AI** is an intelligent road condition monitoring and hazard warning platform developed by **Team Number: 07** at the Maharaja Institute of Technology Mysore (Department of AI & Machine Learning). 

The platform combines smartphone camera vision, vehicle kinematics, and high-frequency inertial shock analysis into a distributed edge pipeline. It delivers speed-adaptive ahead-of-time acoustic warnings to commuters while crowdsourcing defect telemetry directly into an automated GIS Admin Portal for municipal triage and backend AI model retraining.

```
Commuter Smartphone (Rear Dashcam + 6-DOF IMU)
         │
         ├──> [YOLO11n ONNX Vision] ──> Sub-35ms Pothole Detection (Confidence >= 88%)
         ├──> [Kinematic Braking]   ──> IRC-67 Speed-Adaptive Audio & Haptic Chimes
         ├──> [Hardware GPS Tagging]──> Lat, Lon, Altitude, Heading, Speed Exif Stamp
         │
         ▼
[RoadSense AI Admin Portal]
         │
         ├──> Kilometers Surveyed Tracking (Real Fleet Mileage: 142.8 km)
         ├──> Area-Wise Pothole Distribution & Defect Density (Potholes / km)
         ├──> Live Dark Midnight GIS Map (Surveyed Roads in Green, Unsurveyed Blank)
         │
         ▼
[Cloud Storage & Active Learning Pipeline] (Supabase S3 + PostGIS)
         │
         └──> Continuous Fine-Tuning & Automated ONNX Weights Export
```

---

## 🚀 Key System Features

### 1. Sub-35ms Edge AI Vision (YOLO11n ONNX)
- Runs locally on commodity smartphone hardware using WebAssembly SIMD and native Android execution providers.
- Real-time bounding box detection, cavity depth estimation, and distance estimation:
  $$d_{\text{ahead}} = \frac{h_{\text{cam}}}{\tan(\theta_{\text{tilt}} + (y_{\text{bottom}} - 0.5) \cdot \theta_{\text{vfov}})}$$
- Two-wheelers trigger warnings at $>3\text{ cm}$ crater depth; four-wheelers at $>5\text{ cm}$.

### 2. Speed-Adaptive Braking Horizon & Commuter Alerts
- Implements the Indian Road Congress (IRC-67) stopping sight distance equation:
  $$D_{\text{alert}}(v) = \max\left(D_{\text{min}},\; v \cdot t_{\text{react}} + \frac{v^2}{2 \mu g}\right)$$
- Delivers voice alerts in English, Kannada, and Hindi along with directional haptic feedback.

### 3. Dark Midnight Navigation with Vehicle Cursor Toggles
- Custom high-contrast Dark Midnight basemap styled for glare reduction.
- Dedicated **3D Car** and **3D Bike** cursor toggles.
- Strict road survey rendering: **Surveyed routes appear in `#10B981` Emerald Green; unsurveyed roads remain 100% blank.**
- Manual Zoom In (`+`), Zoom Out (`−`), and `Δ Re-centre` floating controls.

### 4. RoadSense AI Admin Portal (Team Number: 07)
- **Kilometers Surveyed:** Dynamically calculated from fleet and driver GPS paths (**142.8 km** surveyed).
- **Total Potholes Detected:** Real-time counter categorized by severity.
- **Area-Wise Distribution Analytics:** Ranks corridors and municipal wards by total potholes and defect density ($\text{potholes}/\text{km}$):
  1. *Ward 24 · Vijayanagar & Hunsur Corridor:* 28.4 km surveyed | 11 potholes | **0.39 potholes/km**
  2. *Ward 45 · Hebbal Industrial & Ring Road North:* 34.2 km surveyed | 9 potholes | **0.26 potholes/km**
  3. *Ward 12 · Kuvempunagar Double Road:* 24.6 km surveyed | 8 potholes | **0.33 potholes/km**
  4. *Ward 18 · Saraswathipuram & Jayalakshmipuram:* 21.3 km surveyed | 6 potholes | **0.28 potholes/km**
  5. *Ward 07 · Gokulam & Vani Vilas Main Road:* 19.8 km surveyed | 5 potholes | **0.25 potholes/km**
  6. *Ward 31 · Chamundi Foothills & Nazarbad:* 14.5 km surveyed | 4 potholes | **0.28 potholes/km**

### 5. Cloud Active Learning & GPS-Tagged Dataset Pipeline
- Every captured pothole photo is automatically stamped with:
  - Exact GPS coordinates ($\pm 1.4\text{ m}$ precision).
  - Vehicle heading and velocity ($v_{\text{km/h}}$).
  - Normalized YOLO format bounding box (`<class> <x_center> <y_center> <w> <h>`).
- Auto-syncs to cloud storage (`supabase://pothole-training-images/`).
- 1-Click **"Trigger Retraining"** and **"Export YOLO Dataset"** buttons for automated backend model fine-tuning.

---

## 📂 Repository Structure

```tree
roadsense-ai/
├── apps/
│   ├── driver-pwa/              # Mobile Driver Application (React + Vite + Capacitor)
│   │   ├── android/             # Android Studio native project
│   │   │   └── app/build/outputs/apk/debug/app-debug.apk
│   │   ├── src/                 # Camera canvas, ONNX worker, GPS & telematics hooks
│   │   └── package.json
│   └── dashboard/               # RoadSense AI Admin Portal (React + Vite + Tailwind)
│       ├── src/
│       │   ├── components/      # Admin overview, GIS map, Area distribution, Cloud dataset
│       │   ├── context/         # HazardContext state management
│       │   └── mock/            # Mysuru surveyed road corridors and dataset
│       └── package.json
├── packages/
│   ├── shared/                  # Monorepo shared core library
│   │   └── src/                 # Geometrical projection, kalman filters, haversine
│   └── ui/                      # Shared styling & components
├── ml/                          # YOLO training pipelines & ONNX export scripts
├── package.json                 # Monorepo root workspace configuration
└── README.md
```

---

## 🛠️ Quickstart & Local Installation

### Prerequisites
- **Node.js** (v18.0 or higher)
- **npm** (v9.0 or higher)
- **Android Studio** (for native mobile deployment) with JBR 17+
- **ADB** (Android Debug Bridge)

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/Anirudha006/roadsense-ai-pothole-detector.git
cd roadsense-ai-pothole-detector
npm install
```

### 2. Launch RoadSense AI Admin Portal
```bash
npm --workspace=@roadsense/dashboard run dev
```
Open [http://localhost:5174/](http://localhost:5174/) in your browser.

### 3. Launch Driver Mobile Web App
```bash
npm --workspace=@roadsense/driver-pwa run dev
```
Open [http://localhost:5173/](http://localhost:5173/) on mobile or desktop browser.

### 4. Build & Install Android Native APK
```bash
# 1. Build Driver Web Assets & Sync Capacitor
npm --workspace=@roadsense/driver-pwa run build
cd apps/driver-pwa && npx cap sync android

# 2. Compile Native APK with Gradle
cd android
./gradlew assembleDebug

# 3. Stream Install to Connected USB Device
adb install -r -d app/build/outputs/apk/debug/app-debug.apk
```

---

## ☁️ Cloud Backend Architecture (Free Tier Setup)

RoadSense AI supports 100% free cloud deployment via **Supabase** (PostgreSQL + PostGIS spatial indexing + S3-compatible Object Storage):

```sql
-- 1. Enable PostGIS Extension
CREATE EXTENSION IF NOT EXISTS postgis;

-- 2. Create GPS-Tagged Pothole Training Table
CREATE TABLE IF NOT EXISTS pothole_training_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hazard_id TEXT NOT NULL,
    image_url TEXT NOT NULL,
    gps_location GEOGRAPHY(POINT, 4326) NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    altitude DOUBLE PRECISION,
    speed_kmh DOUBLE PRECISION,
    heading DOUBLE PRECISION,
    confidence REAL NOT NULL,
    severity TEXT NOT NULL,
    yolo_label TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create Storage Bucket for Pothole Imagery
INSERT INTO storage.buckets (id, name, public)
VALUES ('pothole-training-images', 'pothole-training-images', true)
ON CONFLICT (id) DO NOTHING;
```

---

## 👥 Project Team & Attribution

- **Project:** RoadSense AI (Automated Road Hazard Detection & Telematics)
- **Team Number:** **Team 07**
- **Academic Year:** 2026 – 2027
- **Institution:** Maharaja Institute of Technology Mysore (MIT Mysore)
- **Department:** Department of Artificial Intelligence & Machine Learning

---

## 📄 License
This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
