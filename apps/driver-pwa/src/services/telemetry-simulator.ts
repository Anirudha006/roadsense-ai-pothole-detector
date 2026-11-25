import { GPSPoint, Hazard, DefectClass, SeverityLevel } from '@roadsense/shared';

export interface SimConfig {
  city: 'Bengaluru' | 'Hubballi';
  simulatedSpeedKmh: number;
  overrideSpeed: boolean;
  spawnHazardFrequencySec: number;
}

// Pre-defined realistic route coordinates
export const SIM_ROUTES = {
  Bengaluru: [
    { lat: 12.971598, lon: 77.594562, heading: 45 },  // MG Road
    { lat: 12.973210, lon: 77.597120, heading: 50 },  // Trinity Circle
    { lat: 12.975450, lon: 77.602340, heading: 55 },  // Old Airport Rd
    { lat: 12.978120, lon: 77.609500, heading: 60 },  // Indiranagar 100ft Rd
    { lat: 12.982400, lon: 77.618900, heading: 65 },  // Domlur Flyover
    { lat: 12.986700, lon: 77.625400, heading: 70 },  // Embassy Golf Links
    { lat: 12.991200, lon: 77.632100, heading: 75 },  // Bellandur Junction
  ],
  Hubballi: [
    { lat: 15.364708, lon: 75.123955, heading: 30 },  // Vidyanagar Road
    { lat: 15.368920, lon: 75.127810, heading: 35 },  // Shirur Park
    { lat: 15.373400, lon: 75.132100, heading: 40 },  // KIMS Circle
    { lat: 15.378900, lon: 75.138700, heading: 45 },  // Gokul Road
    { lat: 15.384200, lon: 75.144500, heading: 50 },  // Airport Road
  ],
};

export class TelemetrySimulator {
  private config: SimConfig = {
    city: 'Bengaluru',
    simulatedSpeedKmh: 45,
    overrideSpeed: true,
    spawnHazardFrequencySec: 6,
  };

  private currentRouteIndex = 0;
  private currentProgress = 0.0;
  private isRunning = false;
  private listeners: ((point: GPSPoint) => void)[] = [];
  private intervalId: any = null;

  public setSpeed(speedKmh: number) {
    this.config.simulatedSpeedKmh = Math.max(10, Math.min(120, speedKmh));
  }

  public getSpeed(): number {
    return this.config.simulatedSpeedKmh;
  }

  public setCity(city: 'Bengaluru' | 'Hubballi') {
    this.config.city = city;
    this.currentRouteIndex = 0;
    this.currentProgress = 0;
  }

  public getCity(): 'Bengaluru' | 'Hubballi' {
    return this.config.city;
  }

  public onTelemetry(cb: (point: GPSPoint) => void) {
    this.listeners.push(cb);
  }

  public start() {
    if (this.isRunning) return;
    this.isRunning = true;

    const route = SIM_ROUTES[this.config.city];
    const updateFreqMs = 500; // 2 Hz updates

    this.intervalId = setInterval(() => {
      const stepDistMeters = (this.config.simulatedSpeedKmh / 3.6) * (updateFreqMs / 1000);
      
      const p1 = route[this.currentRouteIndex];
      const p2 = route[(this.currentRouteIndex + 1) % route.length];

      // Interpolate coordinates
      this.currentProgress += 0.02 * (this.config.simulatedSpeedKmh / 40);
      if (this.currentProgress >= 1.0) {
        this.currentProgress = 0.0;
        this.currentRouteIndex = (this.currentRouteIndex + 1) % route.length;
      }

      const lat = p1.lat + (p2.lat - p1.lat) * this.currentProgress;
      const lon = p1.lon + (p2.lon - p1.lon) * this.currentProgress;
      const heading = p1.heading;

      const pt: GPSPoint = {
        lat,
        lon,
        accuracy: 3.5 + Math.random() * 2.0,
        speedKmh: this.config.simulatedSpeedKmh,
        heading,
        timestamp: Date.now(),
      };

      this.listeners.forEach((fn) => fn(pt));
    }, updateFreqMs);
  }

  public stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
  }

  /**
   * Generates ~200 realistic hazards scattered around Bengaluru or Hubballi
   */
  public static generateSeedHazards(city: 'Bengaluru' | 'Hubballi' = 'Bengaluru', count = 200): Hazard[] {
    const center = city === 'Bengaluru' 
      ? { lat: 12.9716, lon: 77.5946, name: 'Bengaluru' } 
      : { lat: 15.3647, lon: 75.1240, name: 'Hubballi' };

    const classes: DefectClass[] = ['pothole', 'longitudinal_crack', 'alligator_crack', 'rutting'];
    const severities: SeverityLevel[] = ['low', 'medium', 'critical'];
    const wards = ['Ward 104 - Central', 'Ward 82 - Metro East', 'Ward 150 - Tech Corridor', 'Ward 28 - North Valley'];

    const hazards: Hazard[] = [];
    const now = Date.now();

    for (let i = 0; i < count; i++) {
      // Gaussian jitter within ~5km radius
      const latOffset = (Math.random() - 0.5) * 0.08;
      const lonOffset = (Math.random() - 0.5) * 0.08;

      const defectClass = classes[Math.floor(Math.random() * classes.length)];
      const severity = severities[Math.floor(Math.random() * severities.length)];
      const conf = Math.round((0.65 + Math.random() * 0.32) * 100) / 100;
      const score = severity === 'critical' ? 70 + Math.floor(Math.random() * 28) : severity === 'medium' ? 40 + Math.floor(Math.random() * 28) : 15 + Math.floor(Math.random() * 24);
      const area = Math.round((0.15 + Math.random() * 0.85) * 100) / 100;
      const verifications = Math.floor(Math.random() * 7) + 1;
      const firstSeen = now - Math.floor(Math.random() * 14 * 86400000);

      const widthCm = Math.round(Math.sqrt((area * 4) / Math.PI) * 100);
      const lengthCm = Math.round(widthCm * (0.85 + Math.random() * 0.3));
      const depthCm = Math.round((severity === 'critical' ? 5.5 + Math.random() * 4.0 : severity === 'medium' ? 3.0 + Math.random() * 1.8 : 1.8 + Math.random() * 1.0) * 10) / 10;
      const riskFactor = severity === 'critical' ? 'HIGH' : severity === 'medium' ? 'MEDIUM' : 'LOW';

      hazards.push({
        id: `hz_${city.toLowerCase()}_${i + 1}`,
        lat: center.lat + latOffset,
        lon: center.lon + lonOffset,
        class: defectClass,
        severity,
        severityScore: score,
        confidence: conf,
        speedKmh: Math.floor(25 + Math.random() * 55),
        heading: Math.floor(Math.random() * 360),
        firstSeen,
        lastSeen: firstSeen + Math.floor(Math.random() * 3 * 86400000),
        verificationCount: verifications,
        status: verifications >= 3 ? 'verified' : 'reported',
        wardId: wards[Math.floor(Math.random() * wards.length)],
        estimatedAreaM2: area,
        estimatedDepthCm: depthCm,
        widthCm,
        lengthCm,
        riskFactor,
        reporterHash: `drv_${Math.floor(1000 + Math.random() * 9000)}`,
      });
    }

    return hazards;
  }
}

export const telemetrySimulator = new TelemetrySimulator();
