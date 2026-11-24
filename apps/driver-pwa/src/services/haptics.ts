/**
 * RoadSense AI - Haptic Vibration Service
 */
export class HapticService {
  public static trigger(severity: 'low' | 'medium' | 'critical' = 'medium') {
    if (typeof window === 'undefined' || !('vibrate' in navigator)) return;

    try {
      if (severity === 'critical') {
        navigator.vibrate([250, 100, 250]);
      } else if (severity === 'medium') {
        navigator.vibrate([180]);
      } else {
        navigator.vibrate([80]);
      }
    } catch (e) {
      // Haptics might be blocked if page not focused
    }
  }
}
