import urllib.parse
import json

def get_svg_data_uri(lat, lon, speed, conf, id_num, severity):
    sev_color = "#FB7185" if severity == "critical" else ("#FBBF24" if severity == "medium" else "#34D399")
    svg = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 260" width="400" height="260">
  <defs>
    <radialGradient id="crater-{id_num}" cx="48%" cy="52%" r="45%">
      <stop offset="0%" stop-color="#0a0a0c" />
      <stop offset="65%" stop-color="#18181b" />
      <stop offset="90%" stop-color="#27272a" />
      <stop offset="100%" stop-color="#3f3f46" />
    </radialGradient>
    <pattern id="asphalt-{id_num}" width="16" height="16" patternUnits="userSpaceOnUse">
      <rect width="16" height="16" fill="#22272e" />
      <circle cx="3" cy="4" r="1.2" fill="#161b22" />
      <circle cx="11" cy="12" r="1.4" fill="#323944" />
      <circle cx="14" cy="3" r="1.0" fill="#1c2128" />
    </pattern>
  </defs>
  <rect width="400" height="260" fill="url(#asphalt-{id_num})" />
  <path d="M 330 0 L 360 260 L 345 260 L 320 0 Z" fill="#f8fafc" opacity="0.45" />
  <path d="M 70 80 Q 95 105 125 110 T 175 140" stroke="#0f172a" stroke-width="2.5" fill="none" opacity="0.8" />
  <path d="M 280 90 Q 240 120 220 135 T 190 170" stroke="#0f172a" stroke-width="2" fill="none" opacity="0.75" />
  <ellipse cx="185" cy="135" rx="65" ry="42" fill="url(#crater-{id_num})" stroke="#09090b" stroke-width="3" />
  <ellipse cx="180" cy="132" rx="45" ry="28" fill="#070709" />
  <rect x="110" y="85" width="150" height="98" fill="none" stroke="{sev_color}" stroke-width="2" stroke-dasharray="4,2" />
  <rect x="110" y="67" width="110" height="18" fill="{sev_color}" rx="3" />
  <text x="115" y="80" font-family="monospace" font-size="10" fill="#ffffff" font-weight="bold">POTHOLE {conf:.0%}</text>
  <rect x="0" y="215" width="400" height="45" fill="rgba(15,23,42,0.92)" />
  <text x="12" y="233" font-family="monospace" font-size="11" fill="#14b8a6" font-weight="bold">GPS: {lat:.6f} N, {lon:.6f} E | ALT: 762m</text>
  <text x="12" y="249" font-family="monospace" font-size="10" fill="#94a3b8">ID: {id_num} | SPEED: {speed} km/h | CONF: {conf:.0%} | YOLO11n</text>
</svg>"""
    return "data:image/svg+xml;utf8," + urllib.parse.quote(svg)

# 6 surveyed Mysuru areas
wards_data = [
    {
        "id": "ward-02",
        "name": "Ward 24 · Vijayanagar (1st & 2nd Stage) & Hunsur Corridor",
        "code": "MCC-W24",
        "engineerName": "Er. S. Manjunath (AE)",
        "phone": "+91 94481 23002",
        "polygonCenter": [12.3382, 76.6025],
        "totalHazards": 11,
        "criticalHazards": 5,
        "surveyedKm": 28.4
    },
    {
        "id": "ward-06",
        "name": "Ward 45 · Hebbal Industrial & Ring Road North",
        "code": "MCC-W45",
        "engineerName": "Er. K. Suresh (AEE)",
        "phone": "+91 94481 23006",
        "polygonCenter": [12.3552, 76.6189],
        "totalHazards": 9,
        "criticalHazards": 4,
        "surveyedKm": 34.2
    },
    {
        "id": "ward-01",
        "name": "Ward 12 · Kuvempunagar Double Road Corridors",
        "code": "MCC-W12",
        "engineerName": "Er. Rajesh Gowda (AEE)",
        "phone": "+91 94481 23001",
        "polygonCenter": [12.2855, 76.6267],
        "totalHazards": 8,
        "criticalHazards": 3,
        "surveyedKm": 24.6
    },
    {
        "id": "ward-04",
        "name": "Ward 18 · Saraswathipuram & Jayalakshmipuram",
        "code": "MCC-W18",
        "engineerName": "Er. C. Venkatesh (AE)",
        "phone": "+91 94481 23004",
        "polygonCenter": [12.3068, 76.6358],
        "totalHazards": 6,
        "criticalHazards": 2,
        "surveyedKm": 21.3
    },
    {
        "id": "ward-03",
        "name": "Ward 07 · Gokulam & Vani Vilas Main Road",
        "code": "MCC-W07",
        "engineerName": "Er. Deepa Murthy (AE)",
        "phone": "+91 94481 23003",
        "polygonCenter": [12.3275, 76.6341],
        "totalHazards": 5,
        "criticalHazards": 1,
        "surveyedKm": 19.8
    },
    {
        "id": "ward-05",
        "name": "Ward 31 · Chamundi Foothills & Nazarbad Stretch",
        "code": "MCC-W31",
        "engineerName": "Er. P. Kumar (AE)",
        "phone": "+91 94481 23005",
        "polygonCenter": [12.2985, 76.6712],
        "totalHazards": 4,
        "criticalHazards": 1,
        "surveyedKm": 14.5
    }
]

# Real Pothole and defect points across the surveyed routes
hazards_spec = [
    # Ward 02 (Vijayanagar & Hunsur Road) - 11 Hazards
    {"id": "haz-mys-001", "lat": 12.336400, "lon": 76.612100, "ward": "ward-02", "sev": "critical", "score": 88, "conf": 0.94, "speed": 56.4, "head": 84.2, "area": 0.85, "status": "in_progress", "class": "pothole"},
    {"id": "haz-mys-002", "lat": 12.339800, "lon": 76.604500, "ward": "ward-02", "sev": "critical", "score": 82, "conf": 0.91, "speed": 62.0, "head": 90.0, "area": 0.62, "status": "assigned", "class": "pothole"},
    {"id": "haz-mys-007", "lat": 12.341500, "lon": 76.598200, "ward": "ward-02", "sev": "critical", "score": 89, "conf": 0.95, "speed": 48.0, "head": 110.0, "area": 0.92, "status": "reported", "class": "pothole"},
    {"id": "haz-mys-008", "lat": 12.334200, "lon": 76.615000, "ward": "ward-02", "sev": "critical", "score": 86, "conf": 0.92, "speed": 52.5, "head": 88.0, "area": 0.70, "status": "verified", "class": "pothole"},
    {"id": "haz-mys-009", "lat": 12.331500, "lon": 76.618500, "ward": "ward-02", "sev": "critical", "score": 79, "conf": 0.88, "speed": 54.0, "head": 85.0, "area": 0.55, "status": "reported", "class": "pothole"},
    {"id": "haz-mys-010", "lat": 12.343000, "lon": 76.595000, "ward": "ward-02", "sev": "medium", "score": 62, "conf": 0.85, "speed": 42.0, "head": 95.0, "area": 0.40, "status": "assigned", "class": "pothole"},
    {"id": "haz-mys-011", "lat": 12.337000, "lon": 76.609000, "ward": "ward-02", "sev": "medium", "score": 58, "conf": 0.84, "speed": 50.0, "head": 82.0, "area": 0.45, "status": "reported", "class": "pothole"},
    {"id": "haz-mys-012", "lat": 12.338500, "lon": 76.606000, "ward": "ward-02", "sev": "medium", "score": 55, "conf": 0.82, "speed": 46.0, "head": 89.0, "area": 0.38, "status": "in_progress", "class": "pothole"},
    {"id": "haz-mys-013", "lat": 12.335000, "lon": 76.614000, "ward": "ward-02", "sev": "low", "score": 38, "conf": 0.86, "speed": 55.0, "head": 86.0, "area": 0.28, "status": "verified", "class": "pothole"},
    {"id": "haz-mys-014", "lat": 12.345000, "lon": 76.591000, "ward": "ward-02", "sev": "low", "score": 35, "conf": 0.83, "speed": 60.0, "head": 92.0, "area": 0.25, "status": "reported", "class": "pothole"},
    {"id": "haz-mys-015", "lat": 12.332000, "lon": 76.617000, "ward": "ward-02", "sev": "low", "score": 32, "conf": 0.80, "speed": 48.0, "head": 84.0, "area": 0.22, "status": "repaired", "class": "pothole"},

    # Ward 06 (Hebbal Industrial & Ring Road North) - 9 Hazards
    {"id": "haz-mys-005", "lat": 12.357100, "lon": 76.614500, "ward": "ward-06", "sev": "critical", "score": 92, "conf": 0.96, "speed": 74.8, "head": 45.0, "area": 1.12, "status": "assigned", "class": "pothole"},
    {"id": "haz-mys-006", "lat": 12.353300, "lon": 76.623100, "ward": "ward-06", "sev": "critical", "score": 85, "conf": 0.90, "speed": 68.2, "head": 50.0, "area": 0.95, "status": "in_progress", "class": "pothole"},
    {"id": "haz-mys-016", "lat": 12.359000, "lon": 76.611000, "ward": "ward-06", "sev": "critical", "score": 89, "conf": 0.93, "speed": 72.0, "head": 42.0, "area": 0.88, "status": "reported", "class": "pothole"},
    {"id": "haz-mys-017", "lat": 12.351000, "lon": 76.626000, "ward": "ward-06", "sev": "critical", "score": 78, "conf": 0.89, "speed": 65.0, "head": 55.0, "area": 0.72, "status": "verified", "class": "pothole"},
    {"id": "haz-mys-018", "lat": 12.361000, "lon": 76.608000, "ward": "ward-06", "sev": "medium", "score": 64, "conf": 0.84, "speed": 70.0, "head": 40.0, "area": 0.52, "status": "assigned", "class": "pothole"},
    {"id": "haz-mys-019", "lat": 12.349000, "lon": 76.629000, "ward": "ward-06", "sev": "medium", "score": 60, "conf": 0.82, "speed": 62.0, "head": 58.0, "area": 0.48, "status": "in_progress", "class": "pothole"},
    {"id": "haz-mys-020", "lat": 12.363000, "lon": 76.605000, "ward": "ward-06", "sev": "medium", "score": 56, "conf": 0.81, "speed": 75.0, "head": 38.0, "area": 0.44, "status": "reported", "class": "pothole"},
    {"id": "haz-mys-021", "lat": 12.347000, "lon": 76.632000, "ward": "ward-06", "sev": "low", "score": 36, "conf": 0.85, "speed": 58.0, "head": 60.0, "area": 0.30, "status": "verified", "class": "pothole"},
    {"id": "haz-mys-022", "lat": 12.355000, "lon": 76.619000, "ward": "ward-06", "sev": "low", "score": 30, "conf": 0.79, "speed": 66.0, "head": 48.0, "area": 0.25, "status": "repaired", "class": "pothole"},

    # Ward 01 (Kuvempunagar Double Road Corridors) - 8 Hazards
    {"id": "haz-mys-003", "lat": 12.288200, "lon": 76.621400, "ward": "ward-01", "sev": "critical", "score": 78, "conf": 0.89, "speed": 42.1, "head": 172.5, "area": 0.74, "status": "reported", "class": "pothole"},
    {"id": "haz-mys-004", "lat": 12.282900, "lon": 76.631800, "ward": "ward-01", "sev": "critical", "score": 81, "conf": 0.91, "speed": 38.0, "head": 260.0, "area": 0.80, "status": "assigned", "class": "pothole"},
    {"id": "haz-mys-023", "lat": 12.286000, "lon": 76.624000, "ward": "ward-01", "sev": "critical", "score": 75, "conf": 0.87, "speed": 40.0, "head": 180.0, "area": 0.65, "status": "in_progress", "class": "pothole"},
    {"id": "haz-mys-024", "lat": 12.290000, "lon": 76.619000, "ward": "ward-01", "sev": "medium", "score": 62, "conf": 0.85, "speed": 45.0, "head": 165.0, "area": 0.46, "status": "verified", "class": "pothole"},
    {"id": "haz-mys-025", "lat": 12.284000, "lon": 76.629000, "ward": "ward-01", "sev": "medium", "score": 58, "conf": 0.83, "speed": 36.0, "head": 250.0, "area": 0.42, "status": "reported", "class": "pothole"},
    {"id": "haz-mys-026", "lat": 12.281000, "lon": 76.634000, "ward": "ward-01", "sev": "medium", "score": 54, "conf": 0.81, "speed": 35.0, "head": 270.0, "area": 0.39, "status": "assigned", "class": "pothole"},
    {"id": "haz-mys-027", "lat": 12.292000, "lon": 76.616000, "ward": "ward-01", "sev": "low", "score": 38, "conf": 0.84, "speed": 48.0, "head": 160.0, "area": 0.28, "status": "verified", "class": "pothole"},
    {"id": "haz-mys-028", "lat": 12.287000, "lon": 76.623000, "ward": "ward-01", "sev": "low", "score": 33, "conf": 0.80, "speed": 41.0, "head": 175.0, "area": 0.24, "status": "repaired", "class": "pothole"},

    # Ward 04 (Saraswathipuram & Jayalakshmipuram) - 6 Hazards
    {"id": "haz-mys-029", "lat": 12.308000, "lon": 76.634000, "ward": "ward-04", "sev": "critical", "score": 83, "conf": 0.92, "speed": 38.0, "head": 95.0, "area": 0.76, "status": "reported", "class": "pothole"},
    {"id": "haz-mys-030", "lat": 12.305000, "lon": 76.638000, "ward": "ward-04", "sev": "critical", "score": 77, "conf": 0.88, "speed": 34.0, "head": 120.0, "area": 0.68, "status": "assigned", "class": "pothole"},
    {"id": "haz-mys-031", "lat": 12.310000, "lon": 76.632000, "ward": "ward-04", "sev": "medium", "score": 64, "conf": 0.85, "speed": 40.0, "head": 85.0, "area": 0.48, "status": "in_progress", "class": "pothole"},
    {"id": "haz-mys-032", "lat": 12.304000, "lon": 76.640000, "ward": "ward-04", "sev": "medium", "score": 59, "conf": 0.83, "speed": 32.0, "head": 130.0, "area": 0.42, "status": "verified", "class": "pothole"},
    {"id": "haz-mys-033", "lat": 12.312000, "lon": 76.630000, "ward": "ward-04", "sev": "low", "score": 35, "conf": 0.82, "speed": 42.0, "head": 80.0, "area": 0.27, "status": "reported", "class": "pothole"},
    {"id": "haz-mys-034", "lat": 12.306000, "lon": 76.636000, "ward": "ward-04", "sev": "low", "score": 31, "conf": 0.79, "speed": 36.0, "head": 105.0, "area": 0.22, "status": "repaired", "class": "pothole"},

    # Ward 03 (Gokulam & Vani Vilas Main Road) - 5 Hazards
    {"id": "haz-mys-035", "lat": 12.329000, "lon": 76.632000, "ward": "ward-03", "sev": "critical", "score": 79, "conf": 0.90, "speed": 35.0, "head": 15.0, "area": 0.72, "status": "reported", "class": "pothole"},
    {"id": "haz-mys-036", "lat": 12.326000, "lon": 76.636000, "ward": "ward-03", "sev": "medium", "score": 62, "conf": 0.86, "speed": 38.0, "head": 25.0, "area": 0.45, "status": "assigned", "class": "pothole"},
    {"id": "haz-mys-037", "lat": 12.331000, "lon": 76.630000, "ward": "ward-03", "sev": "medium", "score": 58, "conf": 0.84, "speed": 32.0, "head": 10.0, "area": 0.40, "status": "in_progress", "class": "pothole"},
    {"id": "haz-mys-038", "lat": 12.324000, "lon": 76.638000, "ward": "ward-03", "sev": "low", "score": 37, "conf": 0.81, "speed": 40.0, "head": 30.0, "area": 0.29, "status": "verified", "class": "pothole"},
    {"id": "haz-mys-039", "lat": 12.327000, "lon": 76.634000, "ward": "ward-03", "sev": "low", "score": 30, "conf": 0.78, "speed": 36.0, "head": 20.0, "area": 0.21, "status": "repaired", "class": "pothole"},

    # Ward 05 (Chamundi Foothills & Nazarbad Stretch) - 4 Hazards
    {"id": "haz-mys-040", "lat": 12.299500, "lon": 76.670000, "ward": "ward-05", "sev": "critical", "score": 82, "conf": 0.91, "speed": 44.0, "head": 140.0, "area": 0.75, "status": "reported", "class": "pothole"},
    {"id": "haz-mys-041", "lat": 12.297000, "lon": 76.673000, "ward": "ward-05", "sev": "medium", "score": 61, "conf": 0.85, "speed": 40.0, "head": 155.0, "area": 0.44, "status": "assigned", "class": "pothole"},
    {"id": "haz-mys-042", "lat": 12.301000, "lon": 76.668000, "ward": "ward-05", "sev": "medium", "score": 55, "conf": 0.82, "speed": 46.0, "head": 130.0, "area": 0.38, "status": "verified", "class": "pothole"},
    {"id": "haz-mys-043", "lat": 12.296000, "lon": 76.675000, "ward": "ward-05", "sev": "low", "score": 33, "conf": 0.80, "speed": 38.0, "head": 160.0, "area": 0.25, "status": "repaired", "class": "pothole"},
]

out = []
out.append("import type { Hazard, Ticket, WardInfo, MaintenanceCrew, ActivityLog, TrainingImageRecord } from '../types';\n")

out.append("export const WARDS_DATA: WardInfo[] = " + json.dumps(wards_data, indent=2) + ";\n")

crews_data = [
  {
    "id": "crew-01",
    "name": "Rapid Pothole Patching Squad #4",
    "company": "City Infrastructure Direct Labor",
    "activeTickets": 4,
    "completedTickets": 38,
    "phone": "+91 98450 11221",
    "rating": 4.8
  },
  {
    "id": "crew-02",
    "name": "State Highway Maintenance Division #12",
    "company": "PWD Hunsur Highway Division",
    "activeTickets": 5,
    "completedTickets": 52,
    "phone": "+91 98450 11222",
    "rating": 4.6
  },
  {
    "id": "crew-03",
    "name": "Express Asphalt Unit #2",
    "company": "Ring Road Infrastructure Unit",
    "activeTickets": 3,
    "completedTickets": 29,
    "phone": "+91 98450 11223",
    "rating": 4.9
  },
  {
    "id": "crew-04",
    "name": "Nagarjuna Infra & Road Solutions",
    "company": "Empaneled Asphalt Contractor",
    "activeTickets": 4,
    "completedTickets": 44,
    "phone": "+91 98450 11224",
    "rating": 4.4
  }
]
out.append("export const CREWS_DATA: MaintenanceCrew[] = " + json.dumps(crews_data, indent=2) + ";\n")

out.append("const NOW = Date.now();\nconst HOUR = 3600 * 1000;\nconst DAY = 24 * HOUR;\n\n")

hazards_list = []
training_records_list = []

for idx, h in enumerate(hazards_spec):
    img_uri = get_svg_data_uri(h["lat"], h["lon"], h["speed"], h["conf"], h["id"], h["sev"])
    # Normalized bounding box
    bbox = {
        "x": 0.275,
        "y": 0.327,
        "width": 0.375,
        "height": 0.377
    }
    yolo_ann = f"0 {bbox['x'] + bbox['width']/2:.3f} {bbox['y'] + bbox['height']/2:.3f} {bbox['width']:.3f} {bbox['height']:.3f}"
    
    hazard_obj = {
        "id": h["id"],
        "lat": h["lat"],
        "lon": h["lon"],
        "geohash": "tdr1" + str(idx).zfill(3),
        "class": h["class"],
        "severity": h["sev"],
        "severityScore": h["score"],
        "confidence": h["conf"],
        "speedKmh": h["speed"],
        "heading": h["head"],
        "firstSeen": 1732400000000 - (idx * 3600000),
        "lastSeen": 1732450000000 - (idx * 300000),
        "verificationCount": 1 + (idx % 12),
        "status": h["status"],
        "wardId": h["ward"],
        "estimatedAreaM2": h["area"],
        "reporterHash": f"edge-fleet-{str(idx).zfill(3)}",
        "imageUrl": img_uri
    }
    hazards_list.append(hazard_obj)
    
    ward_obj = next((w for w in wards_data if w["id"] == h["ward"]), None)
    ward_name = ward_obj["name"] if ward_obj else "Mysuru Corridor"
    
    training_rec = {
        "id": f"train-img-{str(idx+1).zfill(3)}",
        "hazardId": h["id"],
        "imageUrl": img_uri,
        "lat": h["lat"],
        "lon": h["lon"],
        "altitude": 762.5,
        "heading": h["head"],
        "speedKmh": h["speed"],
        "timestamp": 1732450000000 - (idx * 300000),
        "confidence": h["conf"],
        "severity": h["sev"],
        "areaName": ward_name,
        "boundingBox": bbox,
        "cloudStatus": "synced",
        "cloudStorageUrl": f"supabase://pothole-training-images/2026-11/pothole_gps_{h['lat']:.4f}_{h['lon']:.4f}.jpg",
        "yoloAnnotation": yolo_ann
    }
    training_records_list.append(training_rec)

out.append("export const INITIAL_HAZARDS: Hazard[] = " + json.dumps(hazards_list, indent=2) + ";\n\n")
out.append("export const INITIAL_TRAINING_RECORDS: TrainingImageRecord[] = " + json.dumps(training_records_list, indent=2) + ";\n\n")

tickets_data = [
  {
    "id": "tkt-2026-081",
    "hazardId": "haz-mys-001",
    "wardId": "ward-02",
    "priority": "critical",
    "status": "in_progress",
    "assignedTo": "crew-02",
    "dueDate": 1732500000000,
    "createdAt": 1732300000000,
    "updatedAt": 1732450000000,
    "notes": "Severe 0.85m² pothole on Hunsur Road inbound lane. Heavy morning commuter traffic. Cold mix asphalt patch deployed.",
    "estimatedCostInr": 1230
  },
  {
    "id": "tkt-2026-082",
    "hazardId": "haz-mys-002",
    "wardId": "ward-02",
    "priority": "high",
    "status": "assigned",
    "assignedTo": "crew-02",
    "dueDate": 1732520000000,
    "createdAt": 1732350000000,
    "updatedAt": 1732420000000,
    "notes": "Near Vijayanagar water tank junction. Crew scheduled for night compaction.",
    "estimatedCostInr": 900
  },
  {
    "id": "tkt-2026-083",
    "hazardId": "haz-mys-003",
    "wardId": "ward-01",
    "priority": "critical",
    "status": "reported",
    "dueDate": 1732520000000,
    "createdAt": 1732440000000,
    "updatedAt": 1732440000000,
    "notes": "Kuvempunagar double road corner. Multiple two-wheeler swerve alerts registered.",
    "estimatedCostInr": 1070
  },
  {
    "id": "tkt-2026-084",
    "hazardId": "haz-mys-005",
    "wardId": "ward-06",
    "priority": "critical",
    "status": "assigned",
    "assignedTo": "crew-03",
    "dueDate": 1732510000000,
    "createdAt": 1732380000000,
    "updatedAt": 1732430000000,
    "notes": "Hebbal Ring Road high-speed stretch. Vehicle velocity > 70 km/h. Needs urgent polymer asphalt filling.",
    "estimatedCostInr": 1620
  },
  {
    "id": "tkt-2026-085",
    "hazardId": "haz-mys-006",
    "wardId": "ward-06",
    "priority": "medium",
    "status": "in_progress",
    "assignedTo": "crew-03",
    "dueDate": 1732550000000,
    "createdAt": 1732320000000,
    "updatedAt": 1732400000000,
    "notes": "Rutting depression along outer truck lane.",
    "estimatedCostInr": 3050
  }
]
out.append("export const INITIAL_TICKETS: Ticket[] = " + json.dumps(tickets_data, indent=2) + ";\n\n")

logs_data = [
  {
    "id": "log-01",
    "timestamp": 1732454000000,
    "hazardId": "haz-mys-005",
    "type": "cloud_sync",
    "message": "Pothole photo on Hebbal Ring Road synced to Supabase Storage with live GPS tag (Lat: 12.357100, Lon: 76.614500).",
    "actor": "Cloud Pipeline Agent",
    "severity": "critical"
  },
  {
    "id": "log-02",
    "timestamp": 1732452000000,
    "ticketId": "tkt-2026-081",
    "type": "status_change",
    "message": "Work Order #081 on Hunsur Road moved to 'In Progress' by Highway Division #12.",
    "actor": "Admin Desk",
    "severity": "critical"
  },
  {
    "id": "log-03",
    "timestamp": 1732448000000,
    "hazardId": "haz-mys-007",
    "type": "detection",
    "message": "New critical pothole detected on Vijayanagar Hunsur Road (Area: 0.92 m², Speed: 48 km/h). GPS attached.",
    "actor": "Driver App (YOLO11n)",
    "severity": "critical"
  },
  {
    "id": "log-04",
    "timestamp": 1732440000000,
    "hazardId": "haz-mys-022",
    "type": "repair_verified",
    "message": "Pothole on Ring Road verified as REPAIRED after clean sensor traversals.",
    "actor": "Audit Engine",
    "severity": "low"
  }
]
out.append("export const INITIAL_LOGS: ActivityLog[] = " + json.dumps(logs_data, indent=2) + ";\n")

with open("D:/projects/IEEE pothole/roadsense-ai/apps/dashboard/src/mock/mysore-data.ts", "w", encoding="utf-8") as f:
    f.write("".join(out))

print("Successfully written mysore-data.ts!")
