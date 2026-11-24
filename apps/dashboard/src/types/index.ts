import type {
  Hazard,
  Ticket,
  HazardStatus,
  SeverityLevel,
  DefectClass,
  PriorityLevel,
  UserRole,
} from '@roadsense/shared';

export type {
  Hazard,
  Ticket,
  HazardStatus,
  SeverityLevel,
  DefectClass,
  PriorityLevel,
  UserRole,
};

export interface WardInfo {
  id: string;
  name: string;
  code: string;
  engineerName: string;
  phone: string;
  polygonCenter: [number, number];
  totalHazards: number;
  criticalHazards: number;
  surveyedKm?: number;
}

export interface AreaSurveyStats {
  id: string;
  name: string;
  code: string;
  surveyedKm: number;
  totalPotholes: number;
  criticalPotholes: number;
  mediumPotholes: number;
  lowPotholes: number;
  potholeDensityPerKm: number;
  worstRoadSegment: string;
  center: [number, number];
  photoCount: number;
}

export interface TrainingImageRecord {
  id: string;
  hazardId: string;
  imageUrl: string;
  lat: number;
  lon: number;
  altitude: number;
  heading: number;
  speedKmh: number;
  timestamp: number;
  confidence: number;
  severity: SeverityLevel;
  areaName: string;
  boundingBox: {
    x: number; // normalized 0..1
    y: number; // normalized 0..1
    width: number; // normalized 0..1
    height: number; // normalized 0..1
  };
  cloudStatus: 'synced' | 'pending_upload' | 'uploading';
  cloudStorageUrl: string;
  yoloAnnotation: string;
}

export interface MaintenanceCrew {
  id: string;
  name: string;
  company: string;
  activeTickets: number;
  completedTickets: number;
  phone: string;
  rating: number;
}

export interface ActivityLog {
  id: string;
  timestamp: number;
  hazardId?: string;
  ticketId?: string;
  type: 'detection' | 'verification' | 'ticket_created' | 'status_change' | 'repair_verified' | 'cloud_sync' | 'model_training';
  message: string;
  actor: string;
  severity?: SeverityLevel;
}

export interface DashboardFilterState {
  searchQuery: string;
  selectedWard: string;
  selectedSeverity: SeverityLevel | 'all';
  selectedStatus: HazardStatus | 'all';
  minVerifications: number;
  dateRange: 'all' | 'today' | 'week' | 'month';
}

export type ActiveTab = 'overview' | 'map' | 'area-distribution' | 'training' | 'kanban' | 'settings';
