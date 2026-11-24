import { EARTH_RADIUS_METERS } from '../constants/index.ts';
import type { GPSPoint } from '../types/index.ts';

export interface KalmanFilterConfig {
  /** Process noise factor for velocity changes (default: 3.0 m/s^2) */
  processNoise: number;
  /** Measurement noise variance when accuracy is not reported (default: 5.0 m) */
  measurementNoise: number;
}

const DEFAULT_KALMAN_CONFIG: KalmanFilterConfig = {
  processNoise: 3.0,
  measurementNoise: 5.0,
};

/**
 * 2D Linear Kalman Filter for smoothing noisy GPS latitude/longitude trajectories.
 * Transforms coordinates into a local East-North-Up (ENU) tangent plane in meters
 * to maintain linearity and numerical precision.
 */
export class GPSKalmanFilter {
  private config: KalmanFilterConfig;
  private isInitialized = false;

  // Local ENU origin reference
  private lat0 = 0;
  private lon0 = 0;
  private cosLat0 = 1;

  // State vector: [x, y, vx, vy] in meters and m/s
  private state = [0, 0, 0, 0];

  // Covariance matrix 4x4
  private P: number[][] = [
    [10, 0, 0, 0],
    [0, 10, 0, 0],
    [0, 0, 10, 0],
    [0, 0, 0, 10],
  ];

  private lastTimestampMs = 0;

  constructor(config: Partial<KalmanFilterConfig> = {}) {
    this.config = { ...DEFAULT_KALMAN_CONFIG, ...config };
  }

  /**
   * Projects WGS84 (lat, lon) to local tangent plane (East, North) in meters.
   */
  private toLocalMeters(lat: number, lon: number): [number, number] {
    const dLatRad = ((lat - this.lat0) * Math.PI) / 180;
    const dLonRad = ((lon - this.lon0) * Math.PI) / 180;

    const northMeters = dLatRad * EARTH_RADIUS_METERS;
    const eastMeters = dLonRad * EARTH_RADIUS_METERS * this.cosLat0;

    return [eastMeters, northMeters];
  }

  /**
   * Projects local tangent plane (East, North) back to WGS84 (lat, lon).
   */
  private toGeoCoords(eastMeters: number, northMeters: number): [number, number] {
    const lat = this.lat0 + ((northMeters / EARTH_RADIUS_METERS) * 180) / Math.PI;
    const lon = this.lon0 + ((eastMeters / (EARTH_RADIUS_METERS * this.cosLat0)) * 180) / Math.PI;

    return [lat, lon];
  }

  /**
   * Resets the filter state.
   */
  public reset(): void {
    this.isInitialized = false;
    this.state = [0, 0, 0, 0];
    this.lastTimestampMs = 0;
    this.P = [
      [10, 0, 0, 0],
      [0, 10, 0, 0],
      [0, 0, 10, 0],
      [0, 0, 0, 10],
    ];
  }

  /**
   * Ingests a raw GPS measurement and outputs a smoothed GPS point.
   */
  public update(raw: GPSPoint): GPSPoint {
    const now = raw.timestamp || Date.now();

    if (!this.isInitialized) {
      this.lat0 = raw.lat;
      this.lon0 = raw.lon;
      this.cosLat0 = Math.cos((this.lat0 * Math.PI) / 180);

      this.state = [0, 0, 0, 0];
      this.lastTimestampMs = now;
      this.isInitialized = true;

      return { ...raw };
    }

    // Time difference in seconds
    let dt = (now - this.lastTimestampMs) / 1000;
    this.lastTimestampMs = now;

    // Guard against anomalous delta-time
    if (dt <= 0 || dt > 10) {
      dt = 1.0;
    }

    // 1. PREDICTION STEP
    // x_k = x_{k-1} + vx * dt
    // y_k = y_{k-1} + vy * dt
    const [x, y, vx, vy] = this.state;
    this.state = [x + vx * dt, y + vy * dt, vx, vy];

    // Process noise covariance Q
    const qVal = this.config.processNoise;
    const dt2 = dt * dt;
    const dt3 = dt2 * dt * 0.5;
    const dt4 = dt2 * dt2 * 0.25;

    // Update covariance P = F * P * F^T + Q
    // Simplified continuous white noise acceleration model:
    this.P[0][0] += 2 * dt * this.P[2][0] + dt2 * this.P[2][2] + dt4 * qVal;
    this.P[1][1] += 2 * dt * this.P[3][1] + dt2 * this.P[3][3] + dt4 * qVal;
    this.P[2][2] += dt2 * qVal;
    this.P[3][3] += dt2 * qVal;
    this.P[0][2] += dt * this.P[2][2] + dt3 * qVal;
    this.P[2][0] = this.P[0][2];
    this.P[1][3] += dt * this.P[3][3] + dt3 * qVal;
    this.P[3][1] = this.P[1][3];

    // 2. MEASUREMENT UPDATE STEP
    const [zx, zy] = this.toLocalMeters(raw.lat, raw.lon);

    // Measurement noise variance R from reported GPS accuracy or default
    const rVar = Math.max(1.0, Math.pow(raw.accuracy || this.config.measurementNoise, 2));

    // Innovation (residual)
    const yx = zx - this.state[0];
    const yy = zy - this.state[1];

    // Innovation covariance S = H * P * H^T + R
    const Sx = this.P[0][0] + rVar;
    const Sy = this.P[1][1] + rVar;

    // Kalman gain K = P * H^T * S^-1
    const Kx0 = this.P[0][0] / Sx;
    const Kx2 = this.P[2][0] / Sx;

    const Ky1 = this.P[1][1] / Sy;
    const Ky3 = this.P[3][1] / Sy;

    // Updated state
    this.state[0] += Kx0 * yx;
    this.state[2] += Kx2 * yx;

    this.state[1] += Ky1 * yy;
    this.state[3] += Ky3 * yy;

    // Updated covariance P = (I - K * H) * P
    this.P[0][0] *= 1 - Kx0;
    this.P[2][0] *= 1 - Kx0;
    this.P[2][2] -= Kx2 * this.P[0][2];

    this.P[1][1] *= 1 - Ky1;
    this.P[3][1] *= 1 - Ky1;
    this.P[3][3] -= Ky3 * this.P[1][3];

    // Convert smoothed local ENU meters back to WGS84 coordinates
    const [smoothedLat, smoothedLon] = this.toGeoCoords(this.state[0], this.state[1]);

    // Calculate smoothed speed in km/h from estimated velocity
    const vMagMps = Math.sqrt(this.state[2] * this.state[2] + this.state[3] * this.state[3]);
    const smoothedSpeedKmh = vMagMps * 3.6;

    // Heading from velocity vector (if moving > 2 km/h)
    let smoothedHeading = raw.heading;
    if (smoothedSpeedKmh > 2.0) {
      const headingRad = Math.atan2(this.state[0], this.state[1]); // atan2(East, North)
      smoothedHeading = ((headingRad * 180) / Math.PI + 360) % 360;
    }

    return {
      lat: Number(smoothedLat.toFixed(7)),
      lon: Number(smoothedLon.toFixed(7)),
      accuracy: Math.sqrt(Math.min(this.P[0][0], this.P[1][1])),
      speedKmh: Number(smoothedSpeedKmh.toFixed(1)),
      heading: smoothedHeading !== undefined ? Number(smoothedHeading.toFixed(1)) : undefined,
      altitude: raw.altitude,
      timestamp: now,
    };
  }
}

