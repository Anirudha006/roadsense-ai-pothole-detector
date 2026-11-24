/**
 * RoadSense AI - Surveyed Roads Network
 * Real verified road corridors inspected by RoadSense AI sensor fleets.
 * Any road not surveyed is kept 100% blank on the map basemap.
 */

export interface SurveyedRoad {
  id: string;
  name: string;
  shortName: string;
  roadNumber: string;
  category: 'National Highway' | 'Major District Road' | 'City Trunk Road' | 'Corridor';
  distanceKm: number;
  condition: 'Good' | 'Fair' | 'Critical Potholes';
  defectCount: number;
  potholeSeverityAvg: number; // 0 - 100
  lastSurveyDate: string;
  wardName: string;
  surveyPasses: number; // number of fleet vehicle traversals
  coordinates: [number, number][]; // [lat, lon] polyline points
}

// Default to empty array: Real GPS data only. Unsurveyed roads remain completely blank.
export const SURVEYED_ROADS_DATA: SurveyedRoad[] = [];

/**
 * Total surveyed network distance in Mysuru
 */
export const TOTAL_SURVEYED_DISTANCE_KM = Number(
  SURVEYED_ROADS_DATA.reduce((acc, r) => acc + r.distanceKm, 0).toFixed(1)
);
