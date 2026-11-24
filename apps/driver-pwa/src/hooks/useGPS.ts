import { useState, useEffect, useRef } from 'react';
import { GPSKalmanFilter, calculateAlertDistance, GPSPoint, KalmanState } from '@roadsense/shared';
import { telemetrySimulator } from '../services/telemetry-simulator';

export interface GPSState {
  lat: number;
  lon: number;
  speedKmh: number;
  heading: number;
  accuracy: number;
  alertDistanceMeters: number;
  isLocked: boolean;
  isSimulated: boolean;
}

export function useGPS(isSimulationMode = false, speedOverrideKmh?: number) {
  const [gpsState, setGpsState] = useState<GPSState>({
    lat: 12.3667, // MIT Mysore / Mysore default
    lon: 76.6212,
    speedKmh: 0,
    heading: 0,
    accuracy: 5,
    alertDistanceMeters: 20,
    isLocked: false,
    isSimulated: isSimulationMode,
  });

  const kalmanRef = useRef<GPSKalmanFilter>(new GPSKalmanFilter());

  useEffect(() => {
    kalmanRef.current.reset();

    if (isSimulationMode) {
      telemetrySimulator.start();

      const handleTelemetry = (pt: GPSPoint) => {
        const effectiveSpeed = speedOverrideKmh !== undefined ? speedOverrideKmh : (pt.speedKmh || 40);
        const kState: GPSPoint = kalmanRef.current.update({
          lat: pt.lat,
          lon: pt.lon,
          accuracy: pt.accuracy,
          speedKmh: effectiveSpeed,
          heading: pt.heading,
          timestamp: pt.timestamp,
        });
        const alertCalc = calculateAlertDistance(effectiveSpeed);

        setGpsState({
          lat: kState.lat,
          lon: kState.lon,
          speedKmh: effectiveSpeed,
          heading: pt.heading || 45,
          accuracy: pt.accuracy || 3,
          alertDistanceMeters: alertCalc.alertDistanceMeters,
          isLocked: true,
          isSimulated: true,
        });
      };

      telemetrySimulator.onTelemetry(handleTelemetry);

      return () => {
        telemetrySimulator.stop();
      };
    } else {
      if (typeof navigator === 'undefined' || !('geolocation' in navigator)) {
        return;
      }

      const watchId = navigator.geolocation.watchPosition(
        (pos) => {
          // Real mobile GPS: speed is in m/s; convert to km/h if >= 0.5 m/s (~1.8 km/h)
          const rawSpeedKmh =
            pos.coords.speed !== null && pos.coords.speed >= 0.5
              ? Math.round(pos.coords.speed * 3.6)
              : 0;

          // In real mode, never force a fake simulated speed!
          const effectiveSpeed = rawSpeedKmh;

          const rawPoint: GPSPoint = {
            lat: pos.coords.latitude,
            lon: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
            speedKmh: effectiveSpeed,
            heading: pos.coords.heading || 0,
            timestamp: pos.timestamp,
          };

          const kState: GPSPoint = kalmanRef.current.update(rawPoint);
          const alertCalc = calculateAlertDistance(effectiveSpeed);

          setGpsState({
            lat: kState.lat,
            lon: kState.lon,
            speedKmh: effectiveSpeed,
            heading: pos.coords.heading || 0,
            accuracy: pos.coords.accuracy,
            alertDistanceMeters: alertCalc.alertDistanceMeters,
            isLocked: true,
            isSimulated: false,
          });
        },
        (err) => {
          console.warn('Geolocation warning:', err.message);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 1000,
        }
      );

      return () => {
        navigator.geolocation.clearWatch(watchId);
      };
    }
  }, [isSimulationMode, speedOverrideKmh]);

  return gpsState;
}
