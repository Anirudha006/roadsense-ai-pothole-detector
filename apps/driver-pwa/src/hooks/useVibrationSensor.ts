/**
 * RoadSense AI - Device Motion & Vibration Sensor Hook
 * Captures accelerometer and gyroscope data from mobile hardware or viva simulation.
 * Filters stationary handling and distinguishes potholes from speed breakers.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  VibrationReading,
  VibrationClassification,
  VehicleType,
  analyzeVibrationSequence,
} from '@roadsense/shared';

export interface UseVibrationSensorReturn {
  isSupported: boolean;
  isListening: boolean;
  currentG: number;
  lastClassification: VibrationClassification | null;
  sampleHistory: VibrationReading[];
  startListening: () => Promise<boolean>;
  stopListening: () => void;
  simulateImpact: (type: 'pothole' | 'speed_bump' | 'smooth', speedKmh?: number) => VibrationClassification;
}

export function useVibrationSensor(
  vehicleType: VehicleType = 'four_wheeler',
  currentSpeedKmh: number = 0,
  onPotholeDetected?: (classification: VibrationClassification) => void
): UseVibrationSensorReturn {
  const [isSupported, setIsSupported] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [currentG, setCurrentG] = useState(1.0);
  const [lastClassification, setLastClassification] = useState<VibrationClassification | null>(null);
  const [sampleHistory, setSampleHistory] = useState<VibrationReading[]>([]);

  const bufferRef = useRef<VibrationReading[]>([]);
  const lastDetectionTimeRef = useRef<number>(0);
  const listenerActiveRef = useRef<boolean>(false);

  // Auto-listen on mount so G-force is live immediately on phone
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const hasMotion = 'DeviceMotionEvent' in window;
    setIsSupported(hasMotion);

    const handleMotion = (event: DeviceMotionEvent) => {
      const acc = event.accelerationIncludingGravity || event.acceleration;
      if (!acc) return;

      const rawAx = acc.x ?? 0;
      const rawAy = acc.y ?? 0;
      const rawAz = acc.z ?? 9.80665;

      const reading: VibrationReading = {
        ax: rawAx,
        ay: rawAy,
        az: rawAz,
        gx: event.rotationRate?.alpha || 0,
        gy: event.rotationRate?.beta || 0,
        gz: event.rotationRate?.gamma || 0,
        timestamp: Date.now(),
        speedKmh: currentSpeedKmh,
      };

      const g = Math.sqrt(rawAx * rawAx + rawAy * rawAy + rawAz * rawAz) / 9.80665;
      if (!isNaN(g) && g > 0.1 && g < 10) {
        setCurrentG(Number(g.toFixed(2)));
      }

      // Sliding 15-sample buffer (~300ms at 50Hz)
      bufferRef.current.push(reading);
      if (bufferRef.current.length > 20) {
        bufferRef.current.shift();
      }

      // Analyze every 5 samples
      if (bufferRef.current.length >= 8) {
        const result = analyzeVibrationSequence(bufferRef.current, vehicleType);
        setLastClassification(result);

        // Only trigger alerts if moving (speed >= 10 km/h) to prevent stationary false alerts
        const now = Date.now();
        if (result.isPothole && currentSpeedKmh >= 10 && now - lastDetectionTimeRef.current > 3000) {
          lastDetectionTimeRef.current = now;
          onPotholeDetected?.(result);
        }
      }
    };

    try {
      window.addEventListener('devicemotion', handleMotion, { passive: true });
      listenerActiveRef.current = true;
      setIsListening(true);
    } catch (e) {
      console.warn('Could not register devicemotion listener:', e);
    }

    return () => {
      window.removeEventListener('devicemotion', handleMotion);
      listenerActiveRef.current = false;
      setIsListening(false);
    };
  }, [currentSpeedKmh, vehicleType, onPotholeDetected]);

  // Request permissions and start hardware motion capture (iOS / manual fallback)
  const startListening = useCallback(async (): Promise<boolean> => {
    if (typeof window === 'undefined') return false;

    if (typeof (DeviceMotionEvent as any).requestPermission === 'function') {
      try {
        const response = await (DeviceMotionEvent as any).requestPermission();
        if (response !== 'granted') {
          console.warn('DeviceMotionEvent permission denied by user');
          return false;
        }
      } catch (err) {
        console.error('Error requesting DeviceMotionEvent permission:', err);
        return false;
      }
    }

    setIsListening(true);
    return true;
  }, []);

  const stopListening = useCallback(() => {
    setIsListening(false);
  }, []);

  // Simulation method for viva presentations & desktop browser testing
  const simulateImpact = useCallback(
    (type: 'pothole' | 'speed_bump' | 'smooth', speed: number = currentSpeedKmh): VibrationClassification => {
      const g = 9.80665;
      const now = Date.now();
      let mockSamples: VibrationReading[] = [];

      if (type === 'pothole') {
        const peak = vehicleType === 'two_wheeler' ? 1.65 : 2.35;
        mockSamples = [
          { ax: 0, ay: 0, az: g, speedKmh: speed, timestamp: now - 150 },
          { ax: 0, ay: 0, az: 0.40 * g, speedKmh: speed, timestamp: now - 100 },
          { ax: 0, ay: 0, az: peak * g, speedKmh: speed, timestamp: now - 50 },
          { ax: 0, ay: 0, az: g, speedKmh: speed, timestamp: now },
        ];
        setCurrentG(peak);
      } else if (type === 'speed_bump') {
        mockSamples = [
          { ax: 0, ay: 0, az: g, speedKmh: speed, timestamp: now - 150 },
          { ax: 0, ay: 0, az: 1.45 * g, speedKmh: speed, timestamp: now - 100 },
          { ax: 0, ay: 0, az: 0.90 * g, speedKmh: speed, timestamp: now - 50 },
          { ax: 0, ay: 0, az: g, speedKmh: speed, timestamp: now },
        ];
        setCurrentG(1.45);
      } else {
        mockSamples = [
          { ax: 0, ay: 0, az: g, speedKmh: speed, timestamp: now - 100 },
          { ax: 0, ay: 0, az: 1.02 * g, speedKmh: speed, timestamp: now - 50 },
          { ax: 0, ay: 0, az: 0.98 * g, speedKmh: speed, timestamp: now },
        ];
        setCurrentG(1.0);
      }

      setSampleHistory((prev) => [...prev.slice(-20), ...mockSamples]);
      const result = analyzeVibrationSequence(mockSamples, vehicleType);
      setLastClassification(result);

      if (result.isPothole && speed >= 10) {
        onPotholeDetected?.(result);
      }

      return result;
    },
    [currentSpeedKmh, vehicleType, onPotholeDetected]
  );

  return {
    isSupported,
    isListening,
    currentG,
    lastClassification,
    sampleHistory,
    startListening,
    stopListening,
    simulateImpact,
  };
}
