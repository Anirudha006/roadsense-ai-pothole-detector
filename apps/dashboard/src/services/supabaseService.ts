// RoadSense AI (Team Number: 07)
// Supabase Cloud Storage & Database Integration Service

const metaEnv = (import.meta as any).env || {};
const SUPABASE_URL = metaEnv.VITE_SUPABASE_URL || 'https://qqzmzjhuhsusbixuhrjb.supabase.co';
const SUPABASE_ANON_KEY = metaEnv.VITE_SUPABASE_ANON_KEY || 'sb_publishable_p7VjDkLhxJKghjnCVc8RXQ_Z-n3FAel';

export interface CloudUploadPayload {
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
  imageUrl: string;
}

export class SupabaseService {
  private static getHeaders() {
    return {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation',
    };
  }

  /**
   * Health check to ping the Supabase PostGIS endpoint
   */
  static async checkConnection(): Promise<{ connected: boolean; latencyMs: number; error?: string }> {
    const start = performance.now();
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/pothole_training_images?select=id&limit=1`, {
        method: 'GET',
        headers: this.getHeaders(),
      });
      const latencyMs = Math.round(performance.now() - start);
      if (response.ok) {
        return { connected: true, latencyMs };
      }
      return { connected: false, latencyMs, error: `HTTP ${response.status}: ${response.statusText}` };
    } catch (err) {
      return { connected: false, latencyMs: 0, error: err instanceof Error ? err.message : 'Network failure' };
    }
  }

  /**
   * Insert a newly surveyed pothole into the PostGIS database
   */
  static async insertPotholeRecord(data: CloudUploadPayload): Promise<boolean> {
    try {
      const pointWkt = `POINT(${data.longitude} ${data.latitude})`;
      const payload = {
        hazard_id: data.hazardId,
        image_url: data.imageUrl,
        gps_location: pointWkt,
        latitude: data.latitude,
        longitude: data.longitude,
        altitude: data.altitude ?? 762.0,
        speed_kmh: data.speedKmh ?? 0.0,
        heading: data.heading ?? 0.0,
        confidence: data.confidence,
        severity: data.severity,
        bbox: data.bbox ?? null,
        yolo_label: data.yoloLabel ?? null,
      };

      const res = await fetch(`${SUPABASE_URL}/rest/v1/pothole_training_images`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(payload),
      });

      return res.ok;
    } catch (e) {
      console.warn('[SupabaseService] Offline or fallback mode:', e);
      return false;
    }
  }

  /**
   * Fetch all cloud-synced training image records from Supabase
   */
  static async fetchTrainingRecords(): Promise<any[]> {
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/pothole_training_images?order=created_at.desc&limit=100`, {
        method: 'GET',
        headers: this.getHeaders(),
      });
      if (res.ok) {
        return await res.json();
      }
      return [];
    } catch {
      return [];
    }
  }
}
