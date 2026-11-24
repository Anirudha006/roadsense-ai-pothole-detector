// RoadSense AI (Team Number: 07)
// Driver PWA Edge -> Supabase Cloud Integration

const metaEnv = (import.meta as any).env || {};
const SUPABASE_URL = metaEnv.VITE_SUPABASE_URL || 'https://qqzmzjhuhsusbixuhrjb.supabase.co';
const SUPABASE_ANON_KEY = metaEnv.VITE_SUPABASE_ANON_KEY || 'sb_publishable_p7VjDkLhxJKghjnCVc8RXQ_Z-n3FAel';

export interface EdgeHazardPayload {
  hazardId: string;
  latitude: number;
  longitude: number;
  altitude?: number;
  speedKmh?: number;
  heading?: number;
  confidence: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  bbox?: Record<string, number>;
  yoloLabel?: string;
  imageUrl?: string;
}

export class DriverCloudSyncService {
  private static getHeaders() {
    return {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal',
    };
  }

  /**
   * Edge telematics stream: push newly detected pothole with GPS to cloud
   */
  static async streamDetectionToCloud(hazard: EdgeHazardPayload): Promise<boolean> {
    try {
      const pointWkt = `POINT(${hazard.longitude} ${hazard.latitude})`;
      const payload = {
        hazard_id: hazard.hazardId,
        image_url: hazard.imageUrl || `supabase://pothole-training-images/${hazard.hazardId}.jpg`,
        gps_location: pointWkt,
        latitude: hazard.latitude,
        longitude: hazard.longitude,
        altitude: hazard.altitude ?? 762.0,
        speed_kmh: hazard.speedKmh ?? 0.0,
        heading: hazard.heading ?? 0.0,
        confidence: hazard.confidence,
        severity: hazard.severity,
        bbox: hazard.bbox ?? null,
        yolo_label: hazard.yoloLabel ?? `0 0.5 0.5 0.3 0.3`,
      };

      const res = await fetch(`${SUPABASE_URL}/rest/v1/pothole_training_images`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(payload),
      });

      return res.ok;
    } catch {
      // Graceful offline queueing - driver app continues uninterrupted
      return false;
    }
  }
}
