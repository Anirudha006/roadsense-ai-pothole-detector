/**
 * RoadSense AI - Route Survey Status & Predictive Alerting
 * Evaluates whether a route has been audited, and generates predictive warnings for pre-surveyed hazards.
 */

import type { GPSPoint, Hazard, RouteSurveyStatus } from '../types/index.ts';
import { haversineDistance, isAheadOfVehicle } from '../geo/haversine.ts';

export interface RouteSurveyAssessment {
  status: RouteSurveyStatus;
  statusLabel: string;
  nearbyHazards: Hazard[];
  imminentHazard: Hazard | null;
  imminentDistanceMeters: number | null;
  shouldAlert: boolean;
  alertMessage: string | null;
}

/**
 * Assesses road segment status and checks for pre-mapped hazards along vehicle heading.
 */
export function assessRouteSurveyStatus(
  currentPos: GPSPoint,
  surveyedHazards: Hazard[],
  surveyedRoadGeofences: Array<{ lat: number; lon: number; radiusMeters: number }> = [],
  advanceAlertDistanceMeters = 50.0
): RouteSurveyAssessment {
  // Check if current position is inside any surveyed road geofence
  let isSurveyed = false;
  
  if (surveyedRoadGeofences.length === 0) {
    // If no explicit geofences, we consider an area surveyed if any hazard or audit pin exists within 500m
    const minHazardDist = surveyedHazards.reduce((min, h) => {
      const d = haversineDistance(currentPos.lat, currentPos.lon, h.lat, h.lon);
      return Math.min(min, d);
    }, Infinity);
    isSurveyed = minHazardDist <= 500.0;
  } else {
    isSurveyed = surveyedRoadGeofences.some(fence => {
      const d = haversineDistance(currentPos.lat, currentPos.lon, fence.lat, fence.lon);
      return d <= fence.radiusMeters;
    });
  }

  // Filter hazards along current path
  let imminentHazard: Hazard | null = null;
  let imminentDistanceMeters: number | null = null;
  const nearbyHazards: Hazard[] = [];

  for (const hazard of surveyedHazards) {
    if (hazard.status === 'repaired') continue; // Skip already verified repairs

    const dist = haversineDistance(currentPos.lat, currentPos.lon, hazard.lat, hazard.lon);
    
    // Check if within 250m lookahead
    if (dist <= 250.0) {
      const heading = currentPos.heading || 0;
      const isAhead = isAheadOfVehicle(currentPos.lat, currentPos.lon, heading, hazard.lat, hazard.lon, 65.0);

      if (isAhead || dist <= 20.0) {
        nearbyHazards.push(hazard);

        // Check if within the advance alert window (e.g. 50m)
        if (dist <= advanceAlertDistanceMeters) {
          if (imminentDistanceMeters === null || dist < imminentDistanceMeters) {
            imminentDistanceMeters = dist;
            imminentHazard = hazard;
          }
        }
      }
    }
  }

  const shouldAlert = imminentHazard !== null && (imminentHazard.severity === 'critical' || imminentHazard.severity === 'medium');
  let alertMessage: string | null = null;

  if (shouldAlert && imminentHazard && imminentDistanceMeters !== null) {
    alertMessage = `Caution! ${imminentHazard.severity.toUpperCase()} pothole ahead in ${Math.round(imminentDistanceMeters)} meters. Slow down!`;
  }

  return {
    status: isSurveyed ? 'surveyed' : 'unsurveyed',
    statusLabel: isSurveyed 
      ? 'Pre-Mapped Route: Database Hazard Alerts Active' 
      : 'Unsurveyed Route: Active Camera & Vibration Discovery Mode',
    nearbyHazards,
    imminentHazard,
    imminentDistanceMeters,
    shouldAlert,
    alertMessage,
  };
}
