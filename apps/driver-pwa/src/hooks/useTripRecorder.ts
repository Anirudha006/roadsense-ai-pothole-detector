import { useState, useRef, useEffect, useCallback } from 'react';
import { Trip, GPSPoint, Hazard, haversineDistance } from '@roadsense/shared';
import { localStorageService } from '../services/local-storage';

export function useTripRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [currentTrip, setCurrentTrip] = useState<Trip | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [hazardCount, setHazardCount] = useState(0);

  const timerRef = useRef<any>(null);
  const lastPointRef = useRef<GPSPoint | null>(null);

  const startTrip = useCallback(() => {
    const newTrip: Trip = {
      id: `trip_${Date.now()}`,
      startTime: Date.now(),
      totalDistanceMeters: 0,
      potholesDetected: 0,
      path: [],
      syncStatus: 'pending',
    };

    setCurrentTrip(newTrip);
    setIsRecording(true);
    setElapsedSeconds(0);
    setHazardCount(0);
    lastPointRef.current = null;

    timerRef.current = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
  }, []);

  const addGPSPoint = useCallback(
    (pt: GPSPoint) => {
      if (!isRecording || !currentTrip) return;

      setCurrentTrip((prev) => {
        if (!prev) return prev;

        let addedDist = 0;
        if (lastPointRef.current) {
          addedDist = haversineDistance(
            lastPointRef.current.lat,
            lastPointRef.current.lon,
            pt.lat,
            pt.lon
          );
        }
        lastPointRef.current = pt;

        const updatedTrip: Trip = {
          ...prev,
          totalDistanceMeters: Math.round(prev.totalDistanceMeters + addedDist),
          path: [...prev.path, pt],
        };

        return updatedTrip;
      });
    },
    [isRecording, currentTrip]
  );

  const recordHazard = useCallback(
    async (hazard: Hazard) => {
      if (!isRecording || !currentTrip) return;

      setHazardCount((prev) => prev + 1);
      setCurrentTrip((prev) => (prev ? { ...prev, potholesDetected: prev.potholesDetected + 1 } : null));

      // Queue for offline sync
      await localStorageService.queueHazard(hazard);
    },
    [isRecording, currentTrip]
  );

  const stopTrip = useCallback(async () => {
    if (!currentTrip) return null;

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    const completedTrip: Trip = {
      ...currentTrip,
      endTime: Date.now(),
      potholesDetected: hazardCount,
    };

    await localStorageService.saveTrip(completedTrip);
    setIsRecording(false);
    setCurrentTrip(null);

    return completedTrip;
  }, [currentTrip, hazardCount]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  return {
    isRecording,
    currentTrip,
    elapsedSeconds,
    hazardCount,
    startTrip,
    addGPSPoint,
    recordHazard,
    stopTrip,
  };
}
