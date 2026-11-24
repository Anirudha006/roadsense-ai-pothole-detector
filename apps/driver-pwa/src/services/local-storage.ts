import { Hazard, Trip, AlertConfig } from '@roadsense/shared';

export interface AppSettings {
  voiceAlertsEnabled: boolean;
  soundChimeEnabled: boolean;
  hapticsEnabled: boolean;
  language: 'en' | 'kn' | 'hi';
  riskFactorFilter: 'high_only' | 'medium_high' | 'all';
  confThreshold: number;
  reactionTimeSec: number;
  cameraHeightMeters: number;
  cameraTiltDegrees: number;
  privacyBlurEnabled: boolean;
  minimalModeAbove10Kmh: boolean;
  wifiOnlySync: boolean;
}

export const DEFAULT_SETTINGS: AppSettings = {
  voiceAlertsEnabled: true,
  soundChimeEnabled: true,
  hapticsEnabled: true,
  language: 'en',
  riskFactorFilter: 'high_only',
  confThreshold: 0.45,
  reactionTimeSec: 1.5,
  cameraHeightMeters: 1.2,
  cameraTiltDegrees: 10.0,
  privacyBlurEnabled: true,
  minimalModeAbove10Kmh: true,
  wifiOnlySync: false,
};

const DB_NAME = 'roadsense_driver_db';
const DB_VERSION = 1;

class LocalStorageService {
  private dbPromise: Promise<IDBDatabase> | null = null;

  constructor() {
    this.initDB();
  }

  private initDB(): Promise<IDBDatabase> {
    if (this.dbPromise) return this.dbPromise;

    this.dbPromise = new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !('indexedDB' in window)) {
        reject(new Error('IndexedDB not supported'));
        return;
      }

      const req = indexedDB.open(DB_NAME, DB_VERSION);

      req.onupgradeneeded = (e: any) => {
        const db = req.result;
        if (!db.objectStoreNames.contains('trips')) {
          db.createObjectStore('trips', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('offline_hazards')) {
          db.createObjectStore('offline_hazards', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('cached_hazards')) {
          db.createObjectStore('cached_hazards', { keyPath: 'id' });
        }
      };

      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });

    return this.dbPromise;
  }

  // --- Settings ---
  public getSettings(): AppSettings {
    try {
      const stored = localStorage.getItem('roadsense_settings');
      if (stored) return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
    } catch (e) {
      // fallback
    }
    return DEFAULT_SETTINGS;
  }

  public saveSettings(settings: AppSettings): void {
    try {
      localStorage.setItem('roadsense_settings', JSON.stringify(settings));
    } catch (e) {
      console.warn('Failed to save settings:', e);
    }
  }

  // --- Trips ---
  public async saveTrip(trip: Trip): Promise<void> {
    const db = await this.initDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('trips', 'readwrite');
      tx.objectStore('trips').put(trip);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  public async getTrips(): Promise<Trip[]> {
    const db = await this.initDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('trips', 'readonly');
      const req = tx.objectStore('trips').getAll();
      req.onsuccess = () => resolve(req.result.sort((a: Trip, b: Trip) => b.startTime - a.startTime));
      req.onerror = () => reject(req.error);
    });
  }

  // --- Offline Hazard Queue (Sync Queue) ---
  public async queueHazard(hazard: Hazard): Promise<void> {
    const db = await this.initDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('offline_hazards', 'readwrite');
      tx.objectStore('offline_hazards').put(hazard);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  public async getQueuedHazards(): Promise<Hazard[]> {
    const db = await this.initDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('offline_hazards', 'readonly');
      const req = tx.objectStore('offline_hazards').getAll();
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  public async clearQueuedHazard(id: string): Promise<void> {
    const db = await this.initDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('offline_hazards', 'readwrite');
      tx.objectStore('offline_hazards').delete(id);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  // --- Cached Known Hazards (for 500m mini map radar) ---
  public async cacheHazards(hazards: Hazard[]): Promise<void> {
    const db = await this.initDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('cached_hazards', 'readwrite');
      const store = tx.objectStore('cached_hazards');
      hazards.forEach((h) => store.put(h));
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  public async getCachedHazards(): Promise<Hazard[]> {
    const db = await this.initDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('cached_hazards', 'readonly');
      const req = tx.objectStore('cached_hazards').getAll();
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }
}

export const localStorageService = new LocalStorageService();
