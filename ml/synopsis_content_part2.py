"""
RoadSense AI - Comprehensive Synopsis Text Content (Part 2)
Sections: 3 (Problem Statement), 4 (Literature Survey & Table), 5 (Research Gap), 6 (Objectives)
"""

SECTION_3_PROBLEM_STATEMENT = [
    ("3.1 Core Problem Formulation",
     "The central engineering problem addressed by RoadSense AI can be formulated as follows: How to construct a lightweight, computationally efficient, and robust computer vision framework capable of executing real-time multi-class road hazard detection on edge mobile devices under unconstrained lighting and road conditions, coupled with a kinematically sound warning algorithm that dynamically computes safety stopping horizons and an automated cloud deduplication pipeline that transforms raw decentralized telemetry into verifiable municipal repair tickets?",
     ""),

    ("3.2 Environmental and Visual Perturbations in Real-World Indian Pavements",
     "Pothole detection under controlled laboratory benchmark conditions differs drastically from deployment on Indian asphalt highways. Real-world edge vision models must contend with severe environmental noise:",
     ""),

    ("",
     "Dynamic Illumination and Extreme Glare: Transitions between intense midday tropical sunlight, deep shadows cast by roadside canopies, and headlight glare during nocturnal travel cause severe pixel saturation and false edge gradients.",
     "• "),

    ("",
     "Monsoonal Waterlogging and Reflections: Rainwater filling surface depressions transforms potholes into reflective puddles, altering specular reflectance and obscuring cavity depth profiles.",
     "• "),

    ("",
     "Pavement Heterogeneity and Aggregate Variation: Indian roads transition unpredictably from bituminous asphalt to concrete paver blocks, patched gravel, and weathered aggregate mixes, confusing feature extractors trained on monolithic Western datasets.",
     "• "),

    ("3.3 The Kinematic Failure Mode: Why Fixed-Distance Warnings Cause Crashes",
     "A critical, widespread deficiency identified across published literature (e.g., Neeralkatti et al., 2025; Al-Dhamari et al., 2023) is the adoption of an arbitrary, static alert distance-typically fixed at 30 meters. While a 30-meter warning horizon may suffice for slow city driving at 30 km/h (where vehicle velocity is 8.33 m/s, yielding 3.6 seconds of reaction time), it becomes fatally inadequate as vehicle speed increases.",
     ""),

    ("",
     "Consider a vehicle traversing an expressway at 80 km/h (22.22 m/s). The standard perception-reaction time (PRT) established by the Indian Road Congress (IRC) and the American Association of State Highway and Transportation Officials (AASHTO) is 1.5 to 2.5 seconds. At 80 km/h, during the 1.5-second human reaction interval alone, the vehicle traverses 33.33 meters before the driver's foot can even depress the brake pedal. Consequently, a static 30-meter alert leaves the driver with an alarming time-to-impact of only 1.35 seconds-making collision or violent emergency evasive maneuvers mathematically inevitable, directly inducing loss-of-control rollovers and rear-end multi-vehicle pileups.",
     ""),

    ("3.4 Spatial Jitter, Sensor Noise, and Telemetry Drift",
     "Consumer smartphone GNSS receivers operating in urban canyons exhibit geographic drift, multi-path signal reflections, and position update latency of 1 to 3 seconds. Feeding unconditioned raw coordinates into hazard mapping engines generates spatial scatter, where twenty passes over a single pothole register as twenty disjointed markers dispersed across a 30-meter perimeter, completely obscuring hazard density.",
     ""),

    ("3.5 Civic Governance Disconnect and Lack of Closed-Loop Maintenance",
     "Current civic grievance apps (such as municipal mobile portals) rely entirely on citizens stopping their vehicles, photographing potholes manually, and submitting unstructured text complaints. This results in under-reporting on high-speed expressways, duplicated reporting on congested arterials, and an absence of verifiable coordinate metadata. Furthermore, municipal maintenance agencies lack real-time digital Kanban workflows, SLA tracking timers, and automated verification loops to confirm whether contractor repairs have permanently mitigated the reported hazard.",
     ""),
]

LITERATURE_SURVEY_PAPERS = [
    {
        "id": 1,
        "title": "An On-Device Deep Learning Framework for Real-Time Pothole Detection and Geo-Localized Road Condition Monitoring",
        "authors": "Rakshita Neeralkatti, Sugnyani, P. C. Nissi, et al.",
        "venue": "IEEE International Conference on Distributed Computing, VLSI, Electrical & Electronics (2025)",
        "method": "YOLOv8 nano baseline exported to edge mobile hardware, paired with GPS coordinate logging and Firebase cloud sync.",
        "findings": "Achieved 87.9% Precision, 85.3% Recall, 89.4% mAP@0.5, with an edge inference latency of 22 ms on Android hardware.",
        "limitations": "Adopts an arbitrary fixed 30-meter alert threshold regardless of driving speed; relies on raw GPS without Kalman filtering; does not account for forward traffic occlusion."
    },
    {
        "id": 2,
        "title": "Real-Time Road Pothole Detection System Using YOLOv8 to Detect Road Anomalies",
        "authors": "T. Al-Dhamari, A. Al-Ghraiti, et al.",
        "venue": "IEEE Access / Smart Cities Symposium (2023)",
        "method": "YOLOv8 convolutional architecture evaluated across diverse public benchmark road datasets.",
        "findings": "Demonstrated that YOLOv8 achieves superior mean Average Precision (mAP) compared to older two-stage Faster R-CNN and single-stage SSD detectors.",
        "limitations": "Tested exclusively on pre-recorded static video clips without real-time vehicle GPS integration; no acoustic or multilingual driver warning system."
    },
    {
        "id": 3,
        "title": "Road Pothole Detection Based on Improved YOLOv11 Algorithm",
        "authors": "H. Wang, L. Zhang, and X. Liu",
        "venue": "IEEE Transactions on Intelligent Vehicles / ICSAI (2024)",
        "method": "YOLOv11 backbone enhanced with cross-stage partial attention and C3k2 multi-scale feature blocks.",
        "findings": "Delivered substantial improvements in small cavity detection (mAP@0.5 increased by 3.2% over baseline YOLOv11) through enhanced feature fusion.",
        "limitations": "Evaluated on server-grade desktop GPUs (NVIDIA RTX 4090); parameter footprint and GFLOPs too heavy for unquantized mobile edge deployment."
    },
    {
        "id": 4,
        "title": "Edge-enhanced YOLOv8 for Adaptive Real-time Pothole detection in smart road network",
        "authors": "Sandhya Devi R S, M. Chen, et al.",
        "venue": "IEEE Smart Technologies & Computing Research (STCR) (2025)",
        "method": "Edge-enhanced YOLOv8 utilizing depthwise separable convolutions and adaptive edge gradient feature extraction.",
        "findings": "Reduced model floating-point operations (FLOPs) by 18%, improving frame rates on resource-constrained embedded camera modules.",
        "limitations": "Evaluated in static daylight conditions without rain/glare perturbations; lacked municipal dispatch and ticketing integration."
    },
    {
        "id": 5,
        "title": "Real-Time Pothole Detection and Mitigation System with GPS Mapping and Cloud Integration",
        "authors": "Sugnyani, K. S., et al.",
        "venue": "IEEE International Conference on Advanced Computing & Communication (2024)",
        "method": "Vehicle-mounted camera paired with cloud-hosted inference server and Google Maps API visualization.",
        "findings": "Demonstrated full end-to-end cloud hazard logging and automated email notification dispatch to regional municipal engineers.",
        "limitations": "Offloaded video frames over 4G/LTE to a remote server, introducing 350-600 ms latency; fails completely in cellular dead zones."
    },
    {
        "id": 6,
        "title": "Evaluation of Object Detection Models on Indian Road Scenarios for Pothole Detection",
        "authors": "Dharani, P., et al.",
        "venue": "IEEE International Conference on Emerging Trends in Engineering (2023)",
        "method": "Benchmarking YOLOv5, YOLOv7, SSD MobileNet, and Faster R-CNN on Indian Road Datasets.",
        "findings": "Established that lightweight single-stage YOLO models deliver the optimal balance between inference speed and detection accuracy on unpaved Indian roads.",
        "limitations": "Lacked custom attention enhancements; no kinematic distance calculation or spatial clustering pipeline."
    },
    {
        "id": 7,
        "title": "Real Time Deep Learning Based Pothole Detection on Low Cost Embedded Devices for ADAS",
        "authors": "Kumar, S., et al.",
        "venue": "IEEE Transactions on Consumer Electronics (2024)",
        "method": "MobileNet-SSD and quantized Tiny-YOLO deployed on Raspberry Pi 4 and Jetson Nano embedded platforms.",
        "findings": "Achieved 18 FPS on Jetson Nano; highlighted the necessity of INT8 post-training quantization for sustained thermal stability.",
        "limitations": "Raspberry Pi CPU latency exceeded 120 ms; bounding boxes suffered high false positive rates from tree leaf shadows."
    },
    {
        "id": 8,
        "title": "Benchmarking Deep Neural Network Architectures for Pothole Detection Using Matlab",
        "authors": "Patel, R., et al.",
        "venue": "IEEE International Conference on Computational Intelligence (2023)",
        "method": "ResNet-50, VGG-16, and DarkNet-53 backbones benchmarked for binary road anomaly classification.",
        "findings": "Deep residual connections provided highest feature discriminability between road surface cracks and true potholes.",
        "limitations": "Focused purely on image-level classification rather than real-time spatial bounding box regression; unsuitable for edge mobile inference."
    }
]

SECTION_5_RESEARCH_GAP = [
    ("5.1 Research Gap 1: Inflexible Static Distance Alerts vs. Kinematic Stopping Envelopes",
     "Across all surveyed literature, safety alerting algorithms rely on hardcoded, speed-invariant distance thresholds-most commonly 30 meters. As proven mathematically in Section 3.3, vehicle stopping distance is a non-linear quadratic function of velocity (d_braking = v² / 2μg). Failing to dynamically adjust warning horizons according to real-time velocity leaves high-speed expressway commuters completely unprotected while generating unnecessary nuisance warnings during slow urban traffic.",
     ""),

    ("5.2 Research Gap 2: Telemetry Noise and Lack of Local Metric State Estimation",
     "Prior implementations feed raw, unconditioned latitude and longitude coordinates directly from mobile GNSS chips into cloud databases. Due to multi-path reflections and satellite geometry dilution of precision (GDOP), raw GPS measurements oscillate erratically by 5 to 15 meters. Filtering directly in spherical angular coordinates (degrees) introduces non-linear projection distortions, demanding a rigorous 2D Linear Kalman filter operating in local East-North-Up (ENU) metric tangent planes.",
     ""),

    ("5.3 Research Gap 3: Vulnerability to Traffic-Induced Visual Occlusion",
     "Existing vision systems assume an unobstructed forward optical line-of-sight. However, in dense stop-and-go traffic, large buses, trucks, and leading passenger cars frequently occlude potholes from the windshield camera until the vehicle is mere meters away. Existing literature lacks a dual-mode architecture that supplements real-time optical vision with a 500-meter geo-fenced cloud radar map that preemptively alerts drivers to verified hazards reported by antecedent vehicles.",
     ""),

    ("5.4 Research Gap 4: Edge Thermal Throttling and Compute Overhead",
     "While state-of-the-art models like YOLOv11 exhibit high precision, their default convolutional channel topologies demand significant computational throughput (GFLOPs). Continuous camera inference on mobile devices induces rapid thermal throttling and battery depletion within 20 minutes of driving. There is an urgent research need for spatial-channel redundancy reduction mechanisms (e.g., ScConv) paired with ONNX Runtime WebAssembly execution.",
     ""),

    ("5.5 Research Gap 5: Disconnect Between Driver Detection and Municipal Remediation",
     "Academic literature predominantly concludes at the detection stage, treating road hazard monitoring as a purely academic classification benchmark. Real-world civic utility requires a complete closed-loop lifecycle: automated spatial clustering (merging repetitive passes into verified hazards), priority scoring based on physical cavity area, automated Kanban ticketing, SLA compliance tracking, and post-repair re-verification loops.",
     ""),
]

SECTION_6_OBJECTIVES = [
    ("6.1 Primary Aim",
     "The overarching goal of RoadSense AI is to engineer, benchmark, and deploy a robust, end-to-end Intelligent Transportation System framework that bridges edge computer vision, geospatial sensor fusion, and municipal cloud computing to deliver sub-100ms real-time pothole warnings to motorists while empowering municipal authorities with automated, verified road quality intelligence.",
     ""),

    ("6.2 Specific Technical Objectives",
     "To realize this primary aim, the project is structured around the following specific measurable technical objectives:",
     ""),

    ("",
     "Custom Enhanced YOLOv11 Architecture: Design, implement, and train a custom lightweight convolutional defect detector (YOLOv11n-ScConv-SPPFCSPC) that integrates Spatial and Channel Reconstruction Convolutions (ScConv) and multi-scale receptive field pooling, reducing model parameters to under 4.0M and floating-point operations to ~7.5 GFLOPs.",
     "1. "),

    ("",
     "Multi-Source Unified Dataset Pipeline: Aggregate, sanitize, annotate, and augment road distress imagery from the Pune Mendeley Dataset, Indian Pothole Dataset (IPD), and RDD2022 into a 4-class taxonomy (pothole, longitudinal crack, alligator crack, rutting) with domain-specific perturbations (motion blur, rain streaks, tropical sunlight glare).",
     "2. "),

    ("",
     "Kinematic Speed-Adaptive Dynamic Warning Algorithm: Formulate and validate an adaptive alert engine governed by Stopping Sight Distance principles: D_alert = max(20m, v·t_react + v² / (2μg)), guaranteeing consistent 3.0+ second reaction margins across the entire operating speed spectrum (20 km/h to 100 km/h).",
     "3. "),

    ("",
     "2D Metric ENU Kalman State Estimation: Implement a two-dimensional Linear Kalman filter that converts raw WGS84 spherical coordinates into local metric East-North-Up (ENU) coordinates, effectively suppressing multipath GNSS noise and providing smooth vehicular speed and heading estimation.",
     "4. "),

    ("",
     "Flat-Road Pinhole Camera Geo-Projection: Develop a calibrated pinhole camera projection model that maps 2D bounding-box ground contact coordinates (bottom-edge y-position) to real-world metric distances ahead and projects true hazard geographic latitude and longitude.",
     "5. "),

    ("",
     "Zero-Jank Web Worker Mobile Driver PWA: Develop an offline-first Progressive Web App (PWA) with background Web Worker inference via ONNX Runtime WebAssembly, glanceable driver UI (< 1s comprehension), and multilingual synthesized speech alerts (English, Kannada, and Hindi).",
     "6. "),

    ("",
     "Municipal GIS Management Dashboard with Spatial Deduplication: Construct an administrative cloud backend with automated 5-meter spatial clustering (Geohash + Haversine), verification consensus logic (promoting hazards to 'Verified' at 3+ independent passes), interactive Leaflet heatmaps, and Kanban maintenance dispatch workflows.",
     "7. "),
]

print("Part 2 synopsis content loaded.")
