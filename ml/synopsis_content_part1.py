"""
RoadSense AI - Comprehensive Synopsis Text Content
Engineered for Maharaja Institute of Technology Mysore (MIT Mysore)
Department of Artificial Intelligence
Project: AI-Powered Real-Time Pothole Detection and Geo-Localized Road Hazard Monitoring System (RoadSense AI)
Team: Anirudha K (4MH24CA008), Madhava M (4MH24CA025)
"""

METADATA = {
    "title": "AI-Powered Real-Time Pothole Detection and Geo-Localized Road Hazard Monitoring System (RoadSense AI)",
    "team_no": "AI-2026-T08",
    "semester_section": "5th Semester, 'A' Section",
    "students": "1. Anirudha K (USN: 4MH24CA008)   |   2. Madhava M (USN: 4MH24CA025)",
    "guide": "Dr. Hemanth S R, Department of Artificial Intelligence, MIT Mysore",
    "academic_year": "2026 - 2027",
}

SECTION_1_ABSTRACT = [
    ("Abstract",
     "Road transportation infrastructure constitutes the lifeblood of economic mobility and civic logistics across developing nations. However, surface deterioration in the form of deep potholes, structural alligator fissures, and extensive rutting poses catastrophic risks to commuter vehicular safety. According to the Ministry of Road Transport and Highways (MoRTH), road surface distress and unmaintained potholes account for thousands of fatal vehicular accidents and debilitating injuries annually across urban arterial corridors and national highways. Traditional road condition monitoring mechanisms-predominantly reliant on periodic manual visual audits, reactive public grievance filings, or specialized inspection probe vehicles equipped with high-cost laser profilometers-suffer from prohibitive capital costs, severe temporal latency, and complete inability to provide real-time proactive safety warnings to in-transit motorists.",
     ""),

    ("",
     "To address these critical shortcomings, this project introduces RoadSense AI, an intelligent, end-to-end edge-to-cloud cyber-physical framework designed for high-accuracy real-time road hazard detection, dynamic speed-adaptive in-cabin warning, and decentralized municipal condition monitoring. The proposed edge vision pipeline integrates a custom-architected lightweight convolutional detector-YOLOv11n augmented with Spatial and Channel Reconstruction Convolution (ScConv) and Spatial Pyramid Pooling Fast Cross Stage Partial Channel (SPPFCSPC). By decoupling spatial redundancy and channel feature correlation, the model achieves state-of-the-art defect localization across four distinct distress classes (pothole, longitudinal crack, alligator crack, and rutting) while reducing computational FLOPs by ~14% relative to baseline architectures, enabling continuous 25-40 FPS execution on edge mobile hardware.",
     ""),

    ("",
     "Crucially, RoadSense AI resolves the dangerous safety flaw prevalent in existing literature-namely, the reliance on rigid, static distance warning thresholds (e.g., fixed 30-meter alerts). Grounded in the kinematic principles of Stopping Sight Distance (SSD) and Indian Road Congress (IRC) vehicular standards, the system dynamically calculates required warning distance as a function of instantaneous vehicle velocity, human perception-reaction time (1.5 s), and asphalt frictional drag: D_alert = max(20m, v·t_react + v² / (2μg)). This expands warning horizons from 20 meters at 30 km/h to ~72 meters at 80 km/h and ~102 meters at 100 km/h, providing drivers with critical deceleration time. A 2D Linear Kalman filter operating in local East-North-Up (ENU) coordinates suppresses raw GNSS jitter, while a flat-road pinhole camera projection model computes true geographic hazard coordinates. Validated detections are synchronized via an offline-first IndexedDB queue to a central cloud server, where automated spatial clustering (5-meter radius via Geohashing and Haversine distance) deduplicates crowdsourced passes and populates an interactive municipal GIS management dashboard with automated ticketing and SLA repair workflows.",
     ""),

    ("",
     "Keywords: Intelligent Transportation Systems (ITS), Edge Computer Vision, Pothole Detection, YOLOv11, ScConv, SPPFCSPC, Kinematic Stopping Sight Distance, Kalman Filter, Mobile PWA, Municipal GIS Dashboard.",
     ""),
]

SECTION_2_INTRODUCTION = [
    ("2.1 Background and Public Safety Crisis on Indian Roads",
     "The socio-economic vitality of modern India relies fundamentally on its road network, encompassing over 6.3 million kilometers of national highways, state expressways, major district roads, and urban municipal corridors. Despite monumental infrastructure investments, tropical monsoon inundation, heavy axle-load vehicular traffic, sub-base drainage inadequacies, and asphalt bitumen fatigue precipitate severe road surface distress. Deep cavities, colloquially termed potholes, develop rapidly when moisture penetrates sub-surface aggregates and traffic loads hydraulicize the trapped water, disintegrating the asphalt binder. Reports compiled by the Ministry of Road Transport and Highways (MoRTH) and the National Crime Records Bureau (NCRB) reveal a grim statistic: roadway cavities and compromised pavement conditions directly contribute to over 4,500 fatalities and more than 12,000 severe injuries annually, disproportionately claiming the lives of vulnerable two-wheeler and three-wheeler commuters.",
     ""),

    ("2.2 Intelligent Transportation Systems (ITS) and Edge Artificial Intelligence",
     "The burgeoning paradigm of Intelligent Transportation Systems (ITS) seeks to synergize information technologies, sensor telemetry, and vehicular automation to elevate traffic efficiency and preempt roadway catastrophes. Concurrently, the maturation of Edge Artificial Intelligence (Edge AI) enables deep convolutional neural networks and transformer backbones to execute directly on resource-constrained consumer mobile endpoints, smart dashcams, and in-vehicle infotainment (IVI) processors without continuous round-trip communication to distant cloud data centers. In time-critical vehicular safety contexts-where vehicles traverse tens of meters per second-on-device edge processing eliminates network latency, guarantees privacy, and maintains uninterrupted operational capability through intermittent cellular coverage.",
     ""),

    ("2.3 Limitations of Conventional Road Monitoring Practices",
     "Municipal corporations, regional development authorities, and public works departments (PWD) have historically surveyed pavement distress through two polarized paradigms, both of which exhibit fundamental operational limitations:",
     ""),

    ("",
     "Manual Pavement Condition Surveys: Engineers and municipal inspectors conduct periodic drive-by audits or visual walks to catalog asphalt fissures. This approach is labor-intensive, hazardous, highly subjective, and temporally delayed-frequently leaving dangerous potholes unattended for weeks or months until catastrophic accidents occur.",
     "1. "),

    ("",
     "High-Cost Dedicated Inspection Fleets: Large metropolitan agencies occasionally deploy specialized Automated Road Condition Survey (ARCS) vehicles equipped with 3D scanning LiDAR, optical road profilers, and high-frequency accelerometers. While highly accurate, these vehicles cost hundreds of thousands of dollars, operate only along pre-planned trunk routes, and completely bypass secondary municipal arterial roads.",
     "2. "),

    ("",
     "Vibration-Based Accelerometer Approaches: Smartphone-based inertial monitoring systems leverage three-axis accelerometers to log vertical z-axis shock spikes. While cost-effective, inertial sensors suffer from crippling false-positive rates caused by bridge expansion joints, railway crossings, and authorized speed calming humps, and can only detect a pothole after the vehicle has already suffered impact.",
     "3. "),

    ("2.4 Motivation for Smartphone-Centric Edge Vision Computing",
     "With hundreds of millions of commercial drivers, ride-hailing fleets, delivery couriers, and private motorists already mounting high-resolution smartphones on vehicle dashboards for turn-by-turn satellite navigation, there exists an extraordinary opportunity to transform commoditized consumer smartphones into an autonomous, crowdsourced, edge-AI road safety network. By capturing forward-facing dashcam video feeds, running lightweight deep learning models on local mobile neural engines, and pairing detections with kinematic GPS telemetry, an intelligent smartphone system can both warn the immediate driver and silently contribute geo-referenced defect intelligence to municipal civic authorities.",
     ""),

    ("2.5 Scope, Significance, and Document Organization",
     "This project synopsis delineates the design, architectural formulation, mathematical foundations, and implementation roadmap of RoadSense AI. The remainder of this document is organized as follows: Section 3 articulates the core problem statement and real-world failure modes; Section 4 provides a rigorous literature survey of eight recent IEEE research papers; Section 5 synthesizes the identified research gaps; Section 6 outlines project objectives; Section 7 elaborates the proposed technical methodology; Section 8 illustrates the end-to-end system architecture and data flow; Section 9 details hardware and software requirements; Section 10 summarizes expected outcomes; Section 11 presents the phase-wise work plan and Gantt chart; and Section 12 compiles formal bibliographic references.",
     ""),
]

print("Part 1 synopsis content loaded.")
