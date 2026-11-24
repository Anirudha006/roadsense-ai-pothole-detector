/**
 * RoadSense AI - Screen Wake Lock Service
 * Prevents screen from dimming or locking while driver is on an active trip
 */
class WakeLockService {
  private sentinel: any = null;

  public async acquire(): Promise<boolean> {
    if (typeof window === 'undefined' || !('wakeLock' in navigator)) return false;

    try {
      this.sentinel = await (navigator as any).wakeLock.request('screen');
      this.sentinel.addEventListener('release', () => {
        this.sentinel = null;
      });
      return true;
    } catch (e) {
      console.warn('Wake Lock request failed:', e);
      return false;
    }
  }

  public async release(): Promise<void> {
    if (this.sentinel) {
      try {
        await this.sentinel.release();
      } catch (e) {
        // ignore
      }
      this.sentinel = null;
    }
  }
}

export const wakeLockService = new WakeLockService();
