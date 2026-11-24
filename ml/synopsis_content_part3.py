"""
RoadSense AI - Comprehensive Synopsis Text Content (Part 3)
Sections: 7 (Methodology), 8 (Architecture), 9 (Tools & Requirements), 10 (Outcomes), 11 (Timeline), 12 (References)
"""

SECTION_7_METHODOLOGY = [
    ("7.1 Unified Multi-Source Dataset Aggregation & Domain Augmentation Pipeline",
     "Deep learning models exhibit severe performance degradation when deployed in environments unseen during training. To ensure high generalization across Indian road conditions, RoadSense AI constructs a unified dataset synthesizing imagery from four prominent sources: the Pune Road Pothole Dataset (Mendeley), the Indian Pothole Dataset (IPD), the Road Damage Dataset (RDD2022 India subset), and custom smartphone dashcam recordings collected across Karnataka corridors (Bengaluru, Mysuru, and Hubballi). All annotations are standardized into a unified YOLO four-class taxonomy: (0) pothole, (1) longitudinal_crack, (2) alligator_crack, and (3) rutting.",
     ""),

    ("",
     "To simulate the intense visual noise of Indian monsoon and summer driving, a domain-specific augmentation pipeline is integrated: random horizontal flipping (p=0.5), HSV color jitter (Hue ±0.015, Saturation ±0.7, Value ±0.4), random perspective warping (degrees ±10, shear ±2.0), synthetic motion blur simulating vehicle vibrations, and procedural rain streak overlay with localized brightness attenuation.",
     ""),

    ("7.2 Custom Architectural Design: YOLOv11n + ScConv + SPPFCSPC",
     "While default YOLOv11n features efficient depthwise convolutions, road pavement defects exhibit extreme spatial redundancy (large regions of monotonous asphalt texture) paired with subtle, high-frequency boundary fissures. To optimize feature extraction efficiency, RoadSense AI introduces two architectural innovations registered directly into the Ultralytics module registry:",
     ""),

    ("",
     "1. Spatial and Channel Reconstruction Convolution (ScConv): Replaces standard C3k2 convolutional bottlenecks in the backbone and neck with ScConv units comprising two decoupled operations: (a) Spatial Reconstruction Unit (SRU), which utilizes Group Normalization and spatial feature scoring to suppress background asphalt redundancy and emphasize cavity boundary contours; and (b) Channel Reconstruction Unit (CRU), which splits feature channels into high-variance and low-variance partitions, utilizing split-transform-fuse operations to extract multi-receptive context while eliminating inter-channel parameter redundancy.",
     ""),

    ("",
     "2. Spatial Pyramid Pooling Fast Cross Stage Partial Channel (SPPFCSPC): Replaces standard SPPF pooling at the deepest backbone stage. SPPFCSPC integrates Cross Stage Partial (CSP) branching with sequential pooling kernels (5x5, 9x9, 13x13 equivalent), exponentially expanding the effective receptive field without parameter inflation. This enables the network to accurately differentiate large, shallow aggregate depressions from deep, hazardous potholes.",
     ""),

    ("",
     "3. Model Quantization and Cross-Platform Export: The trained PyTorch model (loss = CIoU box regression + BCE classification + Distribution Focal Loss) is exported to ONNX format (Opset 17, simplified via onnxslim) for browser WebAssembly execution, and quantized to TensorFlow Lite (TFLite) FP16 and INT8 Post-Training Quantization (PTQ) with a representative calibration set for edge hardware deployment.",
     ""),

    ("7.3 Geospatial Sensor Fusion & Dynamic Safety Logic",
     "The mathematical core of RoadSense AI bridges computer vision detections with vehicular physics:",
     ""),

    ("",
     "A. Metric ENU 2D Linear Kalman Filter: Raw WGS84 spherical coordinates (latitude φ, longitude λ) suffer from degree-scale trigonometric non-linearities when filtered directly. RoadSense AI projects incoming GPS points onto a local East-North-Up (ENU) tangent plane centered at initial coordinate (φ0, λ0):\n"
     "   x_East = (λ - λ0) · R_Earth · cos(φ0) · (π / 180)\n"
     "   y_North = (φ - φ0) · R_Earth · (π / 180)\n"
     "The 4D state vector x = [x, y, vx, vy]^T tracks position and velocity in meters and m/s. The prediction step models constant-velocity motion: x_k = F·x_{k-1}, P_k = F·P_{k-1}·F^T + Q. The measurement update incorporates GNSS accuracy as measurement covariance R. Transforming filtered state back to WGS84 delivers smooth vehicular speed and heading with sub-meter spatial stability.",
     ""),

    ("",
     "B. Kinematic Speed-Adaptive Dynamic Alert Horizon: Grounded in Stopping Sight Distance (SSD) mechanics, the warning threshold D_alert is computed dynamically at each telemetry step:\n"
     "   D_alert = max(D_min, v · t_react + v² / (2 · μ · g))\n"
     "Where D_min = 20.0 m (minimum geometric floor), v is instantaneous vehicle speed in m/s (v_kmh / 3.6), t_react = 1.5 s (human perception-reaction time), μ = 0.65 (asphalt friction coefficient), and g = 9.81 m/s². Evaluating this formula yields: 20.0m at 30 km/h, 36.0m at 50 km/h, ~72.0m at 80 km/h, and ~102.3m at 100 km/h-guaranteeing motorists an invariant 3.0+ seconds of deceleration time.",
     ""),

    ("",
     "C. Flat-Road Pinhole Camera Geo-Projection: The base paper assumes hazard location matches vehicle location. RoadSense AI implements a geometric pinhole camera model assuming a locally planar road surface. Given calibrated camera height h (default 1.2 m), downward pitch angle θ_tilt (default 10°), and vertical field of view θ_vfov (default 55°), the ground distance ahead d_ahead is derived from the normalized bounding-box bottom coordinate y_bottom (where y=0.5 is optical center):\n"
     "   θ_offset = (y_bottom - 0.5) · θ_vfov\n"
     "   d_ahead = h / tan(θ_tilt + θ_offset)\n"
     "Projecting d_ahead along vehicle heading θ_heading via spherical destination equations yields true geographic coordinates (φ_hazard, λ_hazard) of the road cavity.",
     ""),

    ("7.4 Client-Side Edge Inference & PWA Architecture",
     "The driver client is engineered as a mobile-first Progressive Web Application (PWA). Video frames captured from the smartphone camera are transferred via OffscreenCanvas Transferable Buffers to a dedicated Web Worker executing ONNX Runtime WebAssembly. This offloads heavy model inference from the UI thread, ensuring zero frame drops and maintaining 60 FPS UI responsiveness. If the projected hazard distance falls within D_alert, the application activates multi-modal warnings: a slide-in high-contrast visual banner, synthesized dual-tone audio chime (Web Audio API), haptic double-pulse vibration (Navigator Vibration API), and spoken multilingual warnings in English, Kannada, or Hindi (Web Speech Synthesis API).",
     ""),

    ("7.5 Cloud Infrastructure, Spatial Deduplication & Ticket Lifecycle",
     "Validated hazard detections are queued locally in browser IndexedDB with exponential backoff synchronization. Upon cloud arrival, a serverless Cloud Function executes spatial clustering: incoming hazards are hashed into Geohash-7 buckets (~153m grid) and compared via Haversine distance. If a matching defect exists within a 5-meter radius, the system increments its verificationCount and updates its lastSeen timestamp. Hazards achieving 3+ independent passes are promoted to 'Verified' status and automatically transition into the municipal maintenance Kanban workflow with automated repair SLA timers.",
     ""),
]

SECTION_8_ARCHITECTURE = [
    ("8.1 Layered Architecture Overview",
     "RoadSense AI is organized into five tightly coupled architectural tiers: (1) Sensor & Perception Layer, (2) Edge Compute & State Estimation Layer, (3) Client Presentation & Warning Layer, (4) Cloud Synchronization & Spatial Clustering Layer, and (5) Municipal GIS & Maintenance Analytics Layer.",
     ""),

    ("8.2 End-to-End System Block Diagram",
     "The comprehensive block diagram of RoadSense AI illustrates the flow of video frames, geospatial telemetry, edge neural inference, multi-modal driver warnings, and cloud maintenance integration:\n\n"
     "+-----------------------------------------------------------------------------+\n"
     "|                        EDGE CLIENT: SMARTPHONE PWA                          |\n"
     "|                                                                             |\n"
     "|  +--------------------+   Frames    +------------------------------------+  |\n"
     "|  |  Smartphone Camera | ----------> |   Web Worker: ONNX Runtime Web     |  |\n"
     "|  |  (1280x720 30 FPS) |             |   - Letterbox 640x640 Normalization|  |\n"
     "|  +--------------------+             |   - YOLOv11n-ScConv-SPPFCSPC       |  |\n"
     "|                                     |   - NMS & Severity Scoring Engine  |  |\n"
     "|  +--------------------+  Raw GPS    +-----------------+------------------+  |\n"
     "|  |  GNSS Receiver     | --------+                     | Detections          |\n"
     "|  +--------------------+         |                     v                     |\n"
     "|                                 v           +----------------------------+  |\n"
     "|                     +---------------------+ | Flat-Road Pinhole Model    |  |\n"
     "|                     | 2D ENU Kalman Filter| | - Distance Ahead: d=h/tanθ |  |\n"
     "|                     | - State: [x,y,vx,vy]| | - Hazard Lat/Lon Projection|  |\n"
     "|                     +-----------+---------+ +--------------+-------------+  |\n"
     "|                                 | Speed v                  | Hazard Point   |\n"
     "|                                 v                          v                |\n"
     "|                     +----------------------------------------------------+  |\n"
     "|                     | Kinematic Dynamic Safety Warning Engine            |  |\n"
     "|                     | D_alert = max(20m, v·t_react + v²/(2μg))           |  |\n"
     "|                     | Decision: Is d_ahead <= D_alert?                   |  |\n"
     "|                     +---------------------------+------------------------+  |\n"
     "|                                                 | Yes (Trigger Alert)       |\n"
     "|                                                 v                           |\n"
     "|                     +----------------------------------------------------+  |\n"
     "|                     | Multi-Modal Glanceable Driver Warning System       |  |\n"
     "|                     | - Audio Chime (Web Audio API)                      |  |\n"
     "|                     | - Voice TTS: English, Kannada, Hindi (Web Speech)  |  |\n"
     "|                     | - Haptic Vibration (250ms double pulse)            |  |\n"
     "|                     | - Top Slide-in Coral/Amber Visual Alert Banner     |  |\n"
     "|                     | - 500m Traffic-Occlusion Radar Mini Map            |  |\n"
     "|                     +---------------------------+------------------------+  |\n"
     "|                                                 | Queued Detections         |\n"
     "|                                                 v                           |\n"
     "|                     +----------------------------------------------------+  |\n"
     "|                     | Offline-First IndexedDB Storage & Sync Queue       |  |\n"
     "|                     +---------------------------+------------------------+  |\n"
     "+-------------------------------------------------|---------------------------+\n"
     "                                                  | HTTPS / Cloud Sync        \n"
     "                                                  v                           \n"
     "+-----------------------------------------------------------------------------+\n"
     "|                    CLOUD BACKEND & SPATIAL DEDUPLICATION                    |\n"
     "|                                                                             |\n"
     "|  +-----------------------------------------------------------------------+  |\n"
     "|  | Serverless Spatial Deduplication Engine (Cloud Function)              |  |\n"
     "|  | - Geohash-7 Spatial Indexing (153m Grid)                              |  |\n"
     "|  | - 5-Meter Haversine Neighbor Clustering                               |  |\n"
     "|  | - Verification Consensus: Count >= 3 -> Status: 'Verified'            |  |\n"
     "|  +----------------------------------+------------------------------------+  |\n"
     "|                                     |                                       |\n"
     "|                                     v                                       |\n"
     "|  +-----------------------------------------------------------------------+  |\n"
     "|  | Cloud Firestore NoSQL Database & Storage                              |  |\n"
     "|  | Collections: /hazards, /tickets, /trips, /wards, /audit_logs          |  |\n"
     "|  +----------------------------------+------------------------------------+  |\n"
     "+-------------------------------------|---------------------------------------+\n"
     "                                      | Real-Time Firestore Sync              \n"
     "                                      v                                       \n"
     "+-----------------------------------------------------------------------------+\n"
     "|                   MUNICIPAL GIS DASHBOARD (DESKTOP / WEB)                   |\n"
     "|                                                                             |\n"
     "|  +-------------------+  +--------------------+  +------------------------+  |\n"
     "|  | Interactive GIS   |  | Maintenance Kanban |  | Analytics & Budget     |  |\n"
     "|  | Leaflet Heatmaps  |  | Ticket Dispatch    |  | Repair Cost Calculator |  |\n"
     "|  | Cluster Markers   |  | Contractor SLAs    |  | Ward Pavement Index    |  |\n"
     "|  +-------------------+  +--------------------+  +------------------------+  |\n"
     "+-----------------------------------------------------------------------------+",
     ""),

    ("8.3 Data Flow and Event Processing Lifecycle",
     "The data lifecycle unfolds in four deterministic stages: (1) Ingestion: Camera frames are captured at 720p, letterboxed to 640x640, and normalized while GPS coordinates are sampled at 2 Hz; (2) Edge Processing: Neural inference runs in 25-35 ms, detecting bounding boxes and classes; (3) Fusion & Safety Decision: The bottom-edge projection calculates ground distance ahead, compared against kinematic D_alert; if danger is imminent, multi-sensory alerts fire in under 100 ms total latency; (4) Civic Ingestion: On trip completion or when network connectivity is established, queued records upload to Firestore, where 5-meter spatial clustering merges duplicate passes into verified municipal repair tickets.",
     ""),
]

SECTION_9_TOOLS = [
    ("9.1 Hardware Requirements",
     "The system is architected for dual-environment execution across consumer edge devices and cloud infrastructure:",
     ""),

    ("",
     "Edge Client Mobile Device: Android 10+ or iOS 14+ smartphone; Octa-core CPU (ARM Cortex-A76 / Kryo 460 or higher); minimum 4 GB RAM; integrated 12 MP camera; GNSS receiver supporting A-GPS/GLONASS.",
     "• "),

    ("",
     "Model Development & Training Workstation: Intel Core i5/i7 (11th Gen+) or AMD Ryzen 7; minimum 16 GB system RAM; NVIDIA GPU (RTX 3060/4060 or Google Colab T4/V100 Cloud GPU) with CUDA 12.1+ compute capability.",
     "• "),

    ("",
     "Cloud Hosting & Municipal Workstation: Modern desktop browser (Google Chrome 115+, Firefox 115+, Edge) supporting WebGL 2.0 and WebAssembly SIMD; cloud infrastructure hosted on Google Cloud Platform / Firebase.",
     "• "),

    ("9.2 Software Requirements and Framework Stack",
     "The software ecosystem combines cutting-edge machine learning libraries with modern web standards:",
     ""),

    ("",
     "Programming Languages: Python 3.11/3.13 (model architecture, training, and evaluation scripts); TypeScript 5.6 (strictly typed edge PWA and shared algorithmic libraries); JavaScript/Node.js 22/24.",
     "• "),

    ("",
     "Deep Learning Frameworks: PyTorch 2.14+, Ultralytics YOLOv8/YOLOv11 SDK, ONNX 1.23, ONNX Runtime Web 1.20 (WASM/WebGL execution), and Google LiteRT (TFLite Quantization).",
     "• "),

    ("",
     "Web & Client Technologies: React 18, Vite 5.4, Tailwind CSS 3.4, Lucide React, HTML5 Canvas API, Web Audio API, Web Speech Synthesis API, Navigator Wake Lock API, and Leaflet 1.9.",
     "• "),

    ("",
     "Cloud & Database Infrastructure: Google Firebase Authentication (RBAC: Admin, Engineer, Viewer, Driver), Cloud Firestore NoSQL Database, Firebase Cloud Storage, and Serverless Cloud Functions.",
     "• "),

    ("9.3 Dataset Specifications",
     "Training draws upon an aggregated corpus of 4,800+ annotated road pavement images spanning diverse road conditions across the Indian subcontinent: Pune Road Pothole Dataset (Mendeley Data, 600 high-resolution images), Indian Pothole Dataset (IPD, 1,200 multi-class images), Road Damage Dataset (RDD2022 India subset, 2,500 annotated frames), and 500 local Karnataka dashcam recordings.",
     ""),
]

SECTION_10_OUTCOMES = [
    ("10.1 Technical and Algorithmic Outcomes",
     "The deployment of RoadSense AI is projected to achieve the following quantified technical benchmarks:",
     ""),

    ("",
     "High Detection Precision on Indian Roads: Attain a mean Average Precision (mAP@0.5) of ≥ 89.5% and mAP@0.5:0.95 of ≥ 62.0% across all four distress classes (pothole, longitudinal crack, alligator crack, and rutting).",
     "1. "),

    ("",
     "Real-Time Edge Inference Latency: Achieve sub-35 millisecond neural inference latency on mobile CPU/GPU via ONNX WebAssembly, delivering a sustained 25-30 frames per second (FPS).",
     "2. "),

    ("",
     "Sub-100ms End-to-End Safety Alerting: Guarantee that the total latency from the moment a pothole enters camera view to the activation of acoustic/voice alerts does not exceed 100 milliseconds.",
     "3. "),

    ("",
     "Sub-Meter Spatial Coordinate Precision: The local ENU Kalman filter suppresses raw GNSS jitter from ±12 meters down to under ±2.5 meters, enabling reliable pinhole camera coordinate projection.",
     "4. "),

    ("10.2 System and User Experience Outcomes",
     "1. Glanceable Driver Experience: Motorists receive hands-free, multilingual spoken alerts (English, Kannada, Hindi) that require zero screen interaction while in transit, complying with international driver distraction standards (NHTSA).\n"
     "2. 500m Occlusion Mitigation: Preemptively alerts drivers to occluded potholes hidden behind preceding buses or trucks via cached cloud radar data.\n"
     "3. Offline Resilience: Motorists traveling through rural connectivity dead zones experience uninterrupted detection and local IndexedDB logging.",
     ""),

    ("10.3 Societal and Civic Governance Deliverables",
     "1. Transparent Public Asset Management: Replaces opaque paper grievance logs with a verifiable GIS heatmap detailing pothole severity, verification counts, and contractor repair SLAs.\n"
     "2. Economic Cost Savings: Enables municipal authorities to transition from costly reactive road reconstruction to early preventative crack sealing, saving up to 70% in civic asphalt maintenance expenditures.\n"
     "3. Commuter Accident Preemption: Provides motorists with critical stopping distances, drastically curtailing tire blowouts, rim deformation, and fatal two-wheeler loss-of-control accidents.",
     ""),
]

SECTION_11_TIMELINE = [
    ("11.1 Phase-Wise Work Plan Breakdown",
     "The project lifecycle spans seven rigorous development phases executed across the academic calendar:",
     ""),

    ("",
     "Milestone 1 (Weeks 1-2): Topic Selection, Literature Survey of 8 IEEE Papers, Base Paper Justification, Problem Formulation, and Synopsis Preparation.",
     "• "),

    ("",
     "Milestone 2 (Weeks 3-4): Dataset Collection (Pune, IPD, RDD2022), Annotation Standardization, Multi-Class Label Alignment, and Domain-Specific Augmentation Pipeline.",
     "• "),

    ("",
     "Milestone 3 (Weeks 5-6): Model Architecture Engineering, Custom Ultralytics Module Registration (ScConv, SPPFCSPC), Training Pipeline Setup, and Baseline Comparative Benchmarking.",
     "• "),

    ("",
     "Milestone 4 (Weeks 7-8): Model Optimization, Post-Training Quantization (ONNX Opset 17, TFLite FP16/INT8), and PyTorch-to-Web Worker Export Validation.",
     "• "),

    ("",
     "Milestone 5 (Weeks 9-10): Edge Driver PWA Development, Web Worker Inference Integration, 2D ENU Kalman Filter Implementation, Pinhole Projection, and Web Speech Multilingual Voice Warning System.",
     "• "),

    ("",
     "Milestone 6 (Weeks 11-12): Cloud Backend Implementation, Geohash-7 Spatial Deduplication Cloud Function, Firebase Firestore Database Integration, and Offline-First IndexedDB Sync Queue.",
     "• "),

    ("",
     "Milestone 7 (Weeks 13-14): Municipal GIS Dashboard Development (Leaflet Map, Kanban Tickets, Heatmaps), End-to-End System Integration Testing, Field Dashcam Validation, Documentation, and Final Viva Presentation.",
     "• "),
]

TIMELINE_TABLE_ROWS = [
    ("Phase 1: Research & Synopsis", "Weeks 1-2", "Complete Literature Survey, Select Base Paper, Author Synopsis", "Approved Synopsis"),
    ("Phase 2: Dataset Engineering", "Weeks 3-4", "Merge Pune, IPD, RDD2022, Apply Domain Augmentations", "Unified data.yaml (4.8k images)"),
    ("Phase 3: Model Engineering", "Weeks 5-6", "Implement ScConv + SPPFCSPC, Train YOLOv8n vs YOLOv11n", "Trained PyTorch Checkpoints"),
    ("Phase 4: Export & Quantization", "Weeks 7-8", "Export ONNX Opset 17, TFLite FP16 & INT8 PTQ Calibration", "pothole_detector.onnx (12MB)"),
    ("Phase 5: Driver PWA & Safety", "Weeks 9-10", "Web Worker Inference, Kalman Filter, Kinematic Alert, Voice TTS", "Functional Driver PWA App"),
    ("Phase 6: Cloud & Deduplication", "Weeks 11-12", "Firebase Auth, Firestore Schemas, 5m Clustering Cloud Function", "Cloud Sync & Dedupe Engine"),
    ("Phase 7: Dashboard & Viva", "Weeks 13-14", "Leaflet GIS Dashboard, Kanban Tickets, Viva Demo Script, Report", "Final Project Report & Viva"),
]

SECTION_12_REFERENCES = [
    ("1. Rakshita Neeralkatti, Sugnyani, P. C. Nissi, and S. Devi, \"An On-Device Deep Learning Framework for Real-Time Pothole Detection and Geo-Localized Road Condition Monitoring,\" in Proc. IEEE International Conference on Distributed Computing, VLSI, Electrical & Electronics Applications (ICDVEEE), Bengaluru, India, 2025, pp. 1-6. [Selected Base Paper]", ""),
    ("2. T. Al-Dhamari, A. Al-Ghraiti, and H. Al-Qadami, \"Real-Time Road Pothole Detection System Using YOLOv8 to Detect Road Anomalies,\" in Proc. IEEE International Conference on Smart Cities, Automation & Intelligent Transportation, Dubai, UAE, 2023, pp. 112-117.", ""),
    ("3. H. Wang, L. Zhang, and X. Liu, \"Road Pothole Detection Based on Improved YOLOv11 Algorithm,\" in Proc. IEEE International Conference on Systems, Artificial Intelligence and Computer Applications (ICSAI), Shanghai, China, 2024, pp. 45-51.", ""),
    ("4. Sandhya Devi R S, M. Chen, and K. R. Raman, \"Edge-enhanced YOLOv8 for Adaptive Real-time Pothole detection in smart road network,\" in Proc. IEEE International Conference on Smart Technologies & Computing Research (STCR), Singapore, 2025, pp. 88-94.", ""),
    ("5. Sugnyani, K. S. Rao, and P. C. Nissi, \"Real-Time Pothole Detection and Mitigation System with GPS Mapping and Cloud Integration,\" in Proc. IEEE International Conference on Advanced Computing and Communication Systems (ICACCS), Coimbatore, India, 2024, pp. 201-207.", ""),
    ("6. P. Dharani, V. Sneha, and K. Vignesh, \"Evaluation of Object Detection Models on Indian Road Scenarios for Pothole Detection,\" in Proc. IEEE International Conference on Emerging Trends in Engineering, Science and Technology, Chennai, India, 2023, pp. 310-316.", ""),
    ("7. S. Kumar, A. Sharma, and R. Banerjee, \"Real Time Deep Learning Based Pothole Detection on Low Cost Embedded Devices for ADAS,\" IEEE Transactions on Consumer Electronics, vol. 70, no. 2, pp. 412-420, May 2024.", ""),
    ("8. R. Patel, S. Joshi, and M. Trivedi, \"Benchmarking Deep Neural Network Architectures for Pothole Detection Using Matlab,\" in Proc. IEEE International Conference on Computational Intelligence & Communication Networks, Ahmedabad, India, 2023, pp. 78-84.", ""),
    ("9. J. Redmon, S. Divvala, R. Girshick, and A. Farhadi, \"You Only Look Once: Unified, Real-Time Object Detection,\" in Proc. IEEE Conference on Computer Vision and Pattern Recognition (CVPR), Las Vegas, NV, USA, 2016, pp. 779-788.", ""),
    ("10. Indian Roads Congress (IRC), \"Guidelines on Geometric Design of Rural Highways (IRC:73) and Stopping Sight Distance Standards,\" New Delhi, India: Indian Roads Congress, Tech. Rep. IRC:73-2018, 2018.", ""),
    ("11. Ministry of Road Transport and Highways (MoRTH), \"Road Accidents in India - 2022,\" Transport Research Wing, Ministry of Road Transport and Highways, Government of India, New Delhi, Tech. Rep., Oct. 2023.", ""),
    ("12. G. Welch and G. Bishop, \"An Introduction to the Kalman Filter,\" University of North Carolina at Chapel Hill, Chapel Hill, NC, USA, Tech. Rep. TR 95-041, 2006.", ""),
]

print("Part 3 synopsis content loaded.")
