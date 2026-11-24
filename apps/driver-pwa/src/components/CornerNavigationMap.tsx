import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  CornerUpRight,
  CornerUpLeft,
  ArrowUp,
  Maximize2,
  Navigation,
  Crosshair,
  MapPin,
  Search,
  Check,
  X,
  Layers,
  ArrowUpDown,
  LocateFixed,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Sparkles,
  AlertTriangle,
  GitFork,
  Eye,
  EyeOff,
  Route,
  Camera,
  ShieldCheck,
  Plus,
  Minus,
  Move,
  RotateCcw,
  RotateCw,
  Compass,
} from 'lucide-react';
import type { Hazard, SurveyedRoad, VehicleType } from '@roadsense/shared';
import { SURVEYED_ROADS_DATA, TOTAL_SURVEYED_DISTANCE_KM } from '@roadsense/shared';
import { audioAlertService } from '../services/audio-alerts';

export interface NavigationPoint {
  id: string;
  name: string;
  shortName: string;
  address: string;
  lat: number;
  lon: number;
  category?: string;
  isCurrentLocation?: boolean;
}

export interface NavigationStep {
  instruction: string;
  road: string;
  distanceMeters: number;
  durationSeconds: number;
  maneuverType: string;
  maneuverModifier: string;
  coordinates: [number, number];
}

export const POPULAR_REGIONAL_DESTINATIONS: NavigationPoint[] = [
  {
    id: 'mit_mysore',
    name: 'Maharaja Institute of Technology (MIT Mysore)',
    shortName: 'MIT Mysore',
    lat: 12.3812,
    lon: 76.6026,
    address: 'Belagola, KRS Road, Mysuru, Karnataka',
    category: 'College',
  },
  {
    id: 'mysore_palace',
    name: 'Mysore Palace (Amba Vilas Palace)',
    shortName: 'Mysore Palace',
    lat: 12.3051,
    lon: 76.6551,
    address: 'Sayyaji Rao Road, Agrahara, Mysuru, Karnataka',
    category: 'Landmark',
  },
  {
    id: 'infosys_mysore',
    name: 'Infosys Mysore Campus (Global Education Centre)',
    shortName: 'Infosys Mysore',
    lat: 12.3556,
    lon: 76.5936,
    address: 'Hebbal Industrial Estate, Mysuru, Karnataka',
    category: 'Tech Park',
  },
  {
    id: 'chamundi_hill',
    name: 'Chamundi Hill (Sri Chamundeshwari Temple)',
    shortName: 'Chamundi Hill',
    lat: 12.2725,
    lon: 76.6706,
    address: 'Chamundi Hill Road, Mysuru, Karnataka',
    category: 'Landmark',
  },
  {
    id: 'mysore_railway',
    name: 'Mysuru Junction Railway Station',
    shortName: 'Mysuru Railway Stn',
    lat: 12.3164,
    lon: 76.6443,
    address: 'Medar Block, Yadavagiri, Mysuru, Karnataka',
    category: 'Transit',
  },
  {
    id: 'krs_dam',
    name: 'Krishna Raja Sagara Dam (KRS & Brindavan Gardens)',
    shortName: 'KRS Dam',
    lat: 12.4242,
    lon: 76.5721,
    address: 'KRS Dam Road, Mandya-Mysuru Border',
    category: 'Landmark',
  },
  {
    id: 'mysore_zoo',
    name: 'Sri Chamarajendra Zoological Gardens (Mysore Zoo)',
    shortName: 'Mysore Zoo',
    lat: 12.3022,
    lon: 76.6644,
    address: 'Indiranagar, Ittige Gudu, Mysuru, Karnataka',
    category: 'Landmark',
  },
  {
    id: 'st_philomenas',
    name: 'St. Philomena’s Cathedral',
    shortName: 'St. Philomena’s',
    lat: 12.3211,
    lon: 76.6575,
    address: 'Ashoka Road, St Philomena, Mysuru, Karnataka',
    category: 'Landmark',
  },
  {
    id: 'manipal_hospital',
    name: 'Manipal Hospital (Columbia Asia)',
    shortName: 'Manipal Hospital',
    lat: 12.3486,
    lon: 76.6565,
    address: 'Bangalore-Mysore Ring Road Junction, Mysuru',
    category: 'Hospital',
  },
  {
    id: 'bangalore_majestic',
    name: 'Bangalore Majestic (KSR Bengaluru Station)',
    shortName: 'Bangalore City',
    lat: 12.9774,
    lon: 77.5708,
    address: 'Kempegowda, Bengaluru, Karnataka',
    category: 'Transit',
  },
];

function calculateDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3;
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function calculateBearing(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;
  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
  const θ = Math.atan2(y, x);
  return ((θ * 180) / Math.PI + 360) % 360;
}

interface CornerNavigationMapProps {
  currentLat: number;
  currentLon: number;
  heading: number;
  speedKmh: number;
  hazards: Hazard[];
  isExpanded?: boolean;
  onToggleExpand?: () => void;
  isVisible?: boolean;
  onOpenReport?: () => void;
  // Survey and Primary Map integration
  tripBreadcrumbs?: [number, number][];
  pastSurveyedPaths?: [number, number][][];
  isRecordingTrip?: boolean;
  onStartTrip?: () => void;
  onStopTrip?: () => void;
  onSwitchToCamera?: () => void;
  cameraPiPNode?: React.ReactNode;
  // Vehicle Selection Sync (Car vs Bike)
  vehicleType?: VehicleType;
  onToggleVehicleType?: () => void;
  // Risk Factor Alert Filter
  riskFactorFilter?: 'high_only' | 'medium_high' | 'all';
  onCycleRiskFilter?: () => void;
}

export const CornerNavigationMap: React.FC<CornerNavigationMapProps> = ({
  currentLat,
  currentLon,
  heading,
  speedKmh,
  hazards,
  isExpanded = false,
  onToggleExpand,
  isVisible = true,
  onOpenReport,
  tripBreadcrumbs = [],
  pastSurveyedPaths = [],
  isRecordingTrip = false,
  onStartTrip,
  onStopTrip,
  onSwitchToCamera,
  cameraPiPNode,
  vehicleType = 'four_wheeler',
  onToggleVehicleType,
  riskFactorFilter = 'high_only',
  onCycleRiskFilter,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const vehicleMarkerRef = useRef<L.Marker | null>(null);
  const accuracyCircleRef = useRef<L.Circle | null>(null);
  const destinationMarkerRef = useRef<L.Marker | null>(null);
  const roadCalloutMarkerRef = useRef<L.Marker | null>(null);
  const routeLineRef = useRef<L.Polyline | null>(null);
  const routeOutlineRef = useRef<L.Polyline | null>(null);
  const hazardsLayerRef = useRef<L.LayerGroup | null>(null);
  const surveyedRoadsLayerRef = useRef<L.LayerGroup | null>(null);
  const liveBreadcrumbsLayerRef = useRef<L.Polyline | null>(null);
  const lastDestIdRef = useRef<string | null>(null);

  // Surveyed Roads layer toggle
  const [showSurveyedLayer, setShowSurveyedLayer] = useState(true);

  // Direct device GPS backup watch
  const [directCoords, setDirectCoords] = useState<{ lat: number; lon: number; accuracy?: number } | null>(null);

  useEffect(() => {
    if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
      const id = navigator.geolocation.watchPosition(
        (pos) => {
          setDirectCoords({
            lat: pos.coords.latitude,
            lon: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
          });
        },
        (err) => console.log('Direct GPS notice:', err.message),
        { enableHighAccuracy: true, maximumAge: 3000, timeout: 8000 }
      );
      return () => navigator.geolocation.clearWatch(id);
    }
  }, []);

  // Reliable user coordinates
  const validLat = currentLat && currentLat !== 0 ? currentLat : directCoords?.lat || 12.3172;
  const validLon = currentLon && currentLon !== 0 ? currentLon : directCoords?.lon || 76.6584;

  // Origin & Destination State ("From where to where")
  const [originPoint, setOriginPoint] = useState<NavigationPoint>({
    id: 'current_location',
    name: 'Your Current Location',
    shortName: 'Your Location',
    address: 'Live GPS Position',
    lat: validLat,
    lon: validLon,
    isCurrentLocation: true,
  });

  const [destPoint, setDestPoint] = useState<NavigationPoint>(POPULAR_REGIONAL_DESTINATIONS[0]);

  // Keep origin synced with live GPS if origin is current location
  useEffect(() => {
    if (originPoint.isCurrentLocation) {
      setOriginPoint((prev) => ({
        ...prev,
        lat: validLat,
        lon: validLon,
      }));
    }
  }, [validLat, validLon, originPoint.isCurrentLocation]);

  // Search Modal state
  const [searchModalTarget, setSearchModalTarget] = useState<'origin' | 'destination' | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<NavigationPoint[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [mapPickTarget, setMapPickTarget] = useState<'origin' | 'destination' | null>(null);
  const mapPickTargetRef = useRef<'origin' | 'destination' | null>(null);
  useEffect(() => {
    mapPickTargetRef.current = mapPickTarget;
  }, [mapPickTarget]);

  // Map layer state
  const [mapType, setMapType] = useState<'streets' | 'satellite'>('streets');

  // Real OSRM driving route metrics & steps
  const [routeCoordinates, setRouteCoordinates] = useState<[number, number][]>([]);
  const [navigationSteps, setNavigationSteps] = useState<NavigationStep[]>([]);
  const [routeDistanceKm, setRouteDistanceKm] = useState<number>(15.8);
  const [routeDurationMin, setRouteDurationMin] = useState<number>(22);
  const [isRoutingLoading, setIsRoutingLoading] = useState(false);

  // Active Turn-by-Turn "Start Ride" Navigation state
  const [isNavigating, setIsNavigating] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [distanceToNextStepMeters, setDistanceToNextStepMeters] = useState(70);
  const [isVoiceMuted, setIsVoiceMuted] = useState(false);
  const [isUserPanned, setIsUserPanned] = useState(false);

  // Simulated Ride state (for real-time live driving demonstrations)
  const [isSimulatingRide, setIsSimulatingRide] = useState(false);
  const [simCoordIndex, setSimCoordIndex] = useState(0);
  const [simVehiclePos, setSimVehiclePos] = useState<[number, number]>([validLat, validLon]);
  const [simHeading, setSimHeading] = useState(heading || 0);

  // Moveable Corner Docking for Map (Top-Left, Top-Right, Bottom-Right, Bottom-Left)
  const [cornerPosition, setCornerPosition] = useState<'top-left' | 'top-right' | 'bottom-right' | 'bottom-left'>('top-left');

  const cornerPositionClasses: Record<string, string> = {
    'top-left': 'fixed top-14 left-3 z-30 w-48 h-36',
    'top-right': 'fixed top-14 right-3 z-30 w-48 h-36',
    'bottom-right': 'fixed bottom-36 right-3 z-30 w-48 h-36',
    'bottom-left': 'fixed bottom-36 left-3 z-30 w-48 h-36',
  };

  const handleCycleCorner = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCornerPosition((prev) => {
      if (prev === 'top-left') return 'top-right';
      if (prev === 'top-right') return 'bottom-right';
      if (prev === 'bottom-right') return 'bottom-left';
      return 'top-left';
    });
  };

  // Google Maps Rotation & Bearing Controls
  const [mapBearing, setMapBearing] = useState<number>(0);
  const [isHeadingUp, setIsHeadingUp] = useState<boolean>(false);
  const [isGestureRotating, setIsGestureRotating] = useState<boolean>(false);
  const twoFingerStartRef = useRef<{ angle: number; initialBearing: number } | null>(null);

  // Sync Heading-Up auto-orientation with active vehicle heading
  useEffect(() => {
    if (isHeadingUp) {
      const targetHeading = isSimulatingRide ? simHeading : (heading || 0);
      setMapBearing(-targetHeading);
    }
  }, [isHeadingUp, heading, simHeading, isSimulatingRide]);

  // Touch gesture handlers for 2-finger twist rotation
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const angle = Math.atan2(t2.clientY - t1.clientY, t2.clientX - t1.clientX) * (180 / Math.PI);
      twoFingerStartRef.current = { angle, initialBearing: mapBearing };
      setIsGestureRotating(true);
      setIsUserPanned(true);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && twoFingerStartRef.current) {
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const currentAngle = Math.atan2(t2.clientY - t1.clientY, t2.clientX - t1.clientX) * (180 / Math.PI);
      const delta = currentAngle - twoFingerStartRef.current.angle;
      const newBearing = Math.round((twoFingerStartRef.current.initialBearing + delta + 360) % 360);
      setMapBearing(newBearing);
      setIsHeadingUp(false);
    }
  };

  const handleTouchEnd = () => {
    twoFingerStartRef.current = null;
    setIsGestureRotating(false);
  };

  const handleRotateLeft = () => {
    setIsHeadingUp(false);
    setMapBearing((b) => (b - 45 + 360) % 360);
  };

  const handleRotateRight = () => {
    setIsHeadingUp(false);
    setMapBearing((b) => (b + 45) % 360);
  };

  const handleCompassClick = () => {
    if (mapBearing !== 0) {
      // Snap directly to 0 deg True North
      setMapBearing(0);
      setIsHeadingUp(false);
    } else {
      // Toggle vehicle Heading-Up orientation
      setIsHeadingUp((prev) => !prev);
    }
  };

  // Format dynamic ETA time string (e.g. 8:46 pm)
  const formatETA = (minutesFromNow: number) => {
    const d = new Date(Date.now() + minutesFromNow * 60 * 1000);
    let hours = d.getHours();
    const minutes = d.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12 || 12;
    return `${hours}:${minutes} ${ampm}`;
  };

  // Continuous ResizeObserver ensures Leaflet tiles always fill 100% of the screen
  useEffect(() => {
    if (!mapContainerRef.current) return;
    const observer = new ResizeObserver(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize({ pan: false });
      }
    });
    observer.observe(mapContainerRef.current);
    return () => observer.disconnect();
  }, []);

  // Initialize Leaflet Map ONCE on persistent DOM container
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [validLat, validLon],
      zoom: 17,
      zoomControl: false,
      attributionControl: false,
      dragging: true,
      touchZoom: true,
      scrollWheelZoom: true,
      doubleClickZoom: true,
      boxZoom: true,
      bounceAtZoomLimits: false,
      inertia: true,
      inertiaDeceleration: 1800,
      inertiaMaxSpeed: 3000,
      easeLinearity: 0.15,
      worldCopyJump: true,
    } as any);

    // Google Maps Road Layer
    const googleRoadsLayer = L.tileLayer(
      'https://mt{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
      {
        maxZoom: 20,
        subdomains: ['0', '1', '2', '3'],
      }
    ).addTo(map);
    tileLayerRef.current = googleRoadsLayer;

    // Route Outline & Polyline
    const routeOutline = L.polyline([], {
      color: '#00838F',
      weight: 10,
      opacity: 0.95,
      lineCap: 'round',
      lineJoin: 'round',
    }).addTo(map);
    routeOutlineRef.current = routeOutline;

    const routePolyline = L.polyline([], {
      color: '#00E5FF',
      weight: 6.5,
      opacity: 1.0,
      lineCap: 'round',
      lineJoin: 'round',
    }).addTo(map);
    routeLineRef.current = routePolyline;

    // Accuracy Circle around Vehicle
    const accCircle = L.circle([validLat, validLon], {
      radius: 18,
      color: '#00E5FF',
      fillColor: '#00B0FF',
      fillOpacity: 0.15,
      weight: 1.5,
    }).addTo(map);
    accuracyCircleRef.current = accCircle;

    // Vehicle Cursor (3D Car or 3D Bike)
    const initialIcon = getVehicleIcon(vehicleType, heading || 0);
    const marker = L.marker([validLat, validLon], { icon: initialIcon, zIndexOffset: 1000 }).addTo(map);
    vehicleMarkerRef.current = marker;

    // Destination Marker (Google Maps Red Pin with shadow)
    const destIcon = L.divIcon({
      className: 'destination-pin',
      html: `
        <div style="position: relative; width: 34px; height: 42px; display: flex; flex-direction: column; align-items: center;">
          <div style="width: 28px; height: 28px; background: #EA4335; border: 2.5px solid #FFFFFF; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); box-shadow: 0 4px 14px rgba(0,0,0,0.55); display: flex; align-items: center; justify-content: center;">
            <div style="width: 9px; height: 9px; background: #FFFFFF; border-radius: 50%;"></div>
          </div>
          <div style="width: 10px; height: 4px; background: rgba(0,0,0,0.3); border-radius: 50%; margin-top: 2px;"></div>
        </div>
      `,
      iconSize: [34, 42],
      iconAnchor: [17, 38],
    });

    const destMarker = L.marker([destPoint.lat, destPoint.lon], { icon: destIcon }).addTo(map);
    destinationMarkerRef.current = destMarker;

    // Cyan Road Callout Bubble Marker on the Route (like "[Dawood Khan Rd]" in screenshot)
    const calloutIcon = L.divIcon({
      className: 'road-callout-pill',
      html: `
        <div style="background: #E0F7FA; color: #006064; font-weight: 800; font-size: 11px; padding: 3px 10px; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.4); border: 2px solid #00E5FF; white-space: nowrap; display: flex; align-items: center; gap: 4px;">
          <span>${destPoint.shortName}</span>
        </div>
      `,
      iconSize: [120, 26],
      iconAnchor: [60, 13],
    });
    const calloutMarker = L.marker([destPoint.lat, destPoint.lon], { icon: calloutIcon, zIndexOffset: 800 }).addTo(map);
    roadCalloutMarkerRef.current = calloutMarker;

    // Hazards layer
    hazardsLayerRef.current = L.layerGroup().addTo(map);

    // Surveyed Roads layer
    surveyedRoadsLayerRef.current = L.layerGroup().addTo(map);

    // Live trip breadcrumbs (dynamically paints road green as surveyed)
    const breadcrumbLine = L.polyline([], {
      color: '#10B981',
      weight: 6,
      opacity: 0.95,
      lineCap: 'round',
      lineJoin: 'round',
    }).addTo(map);
    liveBreadcrumbsLayerRef.current = breadcrumbLine;

    // Track user drag/pan/zoom to show Re-centre button & stop auto-overriding camera
    const handleUserInteraction = () => {
      setIsUserPanned(true);
    };
    map.on('dragstart', handleUserInteraction);
    map.on('zoomstart', handleUserInteraction);
    map.on('touchstart', handleUserInteraction);
    map.on('movestart', (e: any) => {
      if (e && e.originalEvent) {
        setIsUserPanned(true);
      }
    });

    // Map click handler for "Choose on Map" mode (only fires when mapPickTarget is active)
    map.on('click', (e: L.LeafletMouseEvent) => {
      const target = mapPickTargetRef.current;
      if (!target) return;

      const clickedLat = Number(e.latlng.lat.toFixed(5));
      const clickedLon = Number(e.latlng.lng.toFixed(5));

      const newPoint: NavigationPoint = {
        id: `map_pick_${Date.now()}`,
        name: `Dropped Pin (${clickedLat}, ${clickedLon})`,
        shortName: `Pin (${clickedLat.toFixed(3)}, ${clickedLon.toFixed(3)})`,
        address: `Custom coordinate on map`,
        lat: clickedLat,
        lon: clickedLon,
        category: 'Custom Location',
      };

      if (target === 'origin') {
        setOriginPoint(newPoint);
      } else {
        setDestPoint(newPoint);
      }
      setMapPickTarget(null);
    });

    mapInstanceRef.current = map;
    setTimeout(() => map.invalidateSize(), 150);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Helper to construct authentic 3D Blue Sedan Car Icon
  function createCarIcon(carHeading: number) {
    return L.divIcon({
      className: 'google-nav-car-cursor',
      html: `
        <div style="position: relative; width: 44px; height: 64px; display: flex; align-items: center; justify-content: center; transform: rotate(${carHeading}deg); transition: transform 0.25s ease;">
          <svg viewBox="0 0 50 86" width="34" height="58" style="filter: drop-shadow(0 6px 12px rgba(0,0,0,0.65));">
            <!-- Car Body (Deep Cyan / Electric Blue) -->
            <rect x="7" y="6" width="36" height="74" rx="10" fill="#00A0E9" stroke="#004D80" stroke-width="2" />
            <!-- Hood Front Slope -->
            <path d="M 12 18 Q 25 10 38 18" stroke="#38BDF8" stroke-width="2" fill="none" opacity="0.6"/>
            <!-- Front Windshield -->
            <path d="M 11 26 L 15 17 L 35 17 L 39 26 Z" fill="#E0F2FE" opacity="0.95" />
            <!-- Cabin Roof -->
            <rect x="11" y="27" width="28" height="32" rx="4" fill="#0284C7" />
            <!-- Sunroof -->
            <rect x="16" y="32" width="18" height="14" rx="2" fill="#0369A1" stroke="#38BDF8" stroke-width="1" />
            <!-- Rear Windshield -->
            <path d="M 11 60 L 15 69 L 35 69 L 39 60 Z" fill="#BAE6FD" opacity="0.9" />
            <!-- Side Windows -->
            <rect x="9" y="30" width="2" height="26" rx="1" fill="#E0F2FE" opacity="0.8" />
            <rect x="39" y="30" width="2" height="26" rx="1" fill="#E0F2FE" opacity="0.8" />
            <!-- Front Headlights (Bright Yellow) -->
            <rect x="9" y="6" width="7" height="3" rx="1.5" fill="#FEF08A" />
            <rect x="34" y="6" width="7" height="3" rx="1.5" fill="#FEF08A" />
            <!-- Rear Taillights (Red) -->
            <rect x="9" y="77" width="7" height="3" rx="1.5" fill="#EF4444" />
            <rect x="34" y="77" width="7" height="3" rx="1.5" fill="#EF4444" />
            <!-- Side Mirrors -->
            <rect x="3" y="22" width="4" height="6" rx="2" fill="#0284C7" />
            <rect x="43" y="22" width="4" height="6" rx="2" fill="#0284C7" />
          </svg>
        </div>
      `,
      iconSize: [44, 64],
      iconAnchor: [22, 32],
    });
  }

  // Helper to construct authentic 3D Motorcycle / Bike Icon with Rider
  function createBikeIcon(bikeHeading: number) {
    return L.divIcon({
      className: 'google-nav-bike-cursor',
      html: `
        <div style="position: relative; width: 44px; height: 64px; display: flex; align-items: center; justify-content: center; transform: rotate(${bikeHeading}deg); transition: transform 0.25s ease;">
          <svg viewBox="0 0 50 86" width="36" height="62" style="filter: drop-shadow(0 6px 12px rgba(0,0,0,0.75));">
            <!-- Front Headlight Beam (Bright Yellow Glow) -->
            <polygon points="25,12 8,-4 42,-4" fill="rgba(254, 240, 138, 0.35)" />
            
            <!-- Front Wheel -->
            <rect x="22" y="6" width="6" height="18" rx="3" fill="#1E293B" stroke="#0F172A" stroke-width="1.5" />
            
            <!-- Front Fender / Mudguard -->
            <rect x="20" y="14" width="10" height="5" rx="2" fill="#0284C7" />
            
            <!-- Chrome Handlebars & Grips -->
            <path d="M 8 23 L 25 25 L 42 23" stroke="#CBD5E1" stroke-width="3" stroke-linecap="round" fill="none" />
            <rect x="7" y="21" width="4" height="4" rx="1" fill="#0F172A" />
            <rect x="39" y="21" width="4" height="4" rx="1" fill="#0F172A" />
            <!-- Side Mirrors -->
            <circle cx="5" cy="19" r="2.5" fill="#38BDF8" stroke="#0F172A" stroke-width="1" />
            <circle cx="45" cy="19" r="2.5" fill="#38BDF8" stroke="#0F172A" stroke-width="1" />
            
            <!-- Headlamp (Bright Xenon) -->
            <ellipse cx="25" cy="13" rx="4" ry="2.5" fill="#FEF08A" stroke="#F59E0B" stroke-width="1" />

            <!-- Fuel Tank (Vibrant Emerald / Cyan Metallic) -->
            <ellipse cx="25" cy="34" rx="9" ry="11" fill="#059669" stroke="#064E3B" stroke-width="2" />
            <ellipse cx="25" cy="33" rx="5" ry="7" fill="#10B981" />
            
            <!-- Rider Leather Jacket / Shoulders -->
            <path d="M 13 46 Q 25 42 37 46 L 35 62 Q 25 60 15 62 Z" fill="#1E293B" stroke="#0F172A" stroke-width="1.5" />
            
            <!-- Rider Helmet (Top-Down with Cyan Visor Glare) -->
            <ellipse cx="25" cy="46" rx="8" ry="9" fill="#0F172A" stroke="#00E5FF" stroke-width="1.5" />
            <path d="M 19 43 Q 25 38 31 43" stroke="#38BDF8" stroke-width="3" stroke-linecap="round" fill="none" />
            <ellipse cx="25" cy="48" rx="4" ry="2" fill="#334155" />

            <!-- Chassis & Seat -->
            <path d="M 20 62 L 30 62 L 28 75 L 22 75 Z" fill="#0F172A" />
            
            <!-- Rear Wheel -->
            <rect x="21" y="68" width="8" height="15" rx="3.5" fill="#1E293B" stroke="#0F172A" stroke-width="1.5" />
            
            <!-- Rear Red LED Brake Light -->
            <rect x="21" y="77" width="8" height="3" rx="1.5" fill="#EF4444" stroke="#DC2626" stroke-width="0.5" />
          </svg>
        </div>
      `,
      iconSize: [44, 64],
      iconAnchor: [22, 32],
    });
  }

  // Get active vehicle icon based on selection: Car vs Bike
  function getVehicleIcon(type: VehicleType = 'four_wheeler', h: number) {
    if (type === 'two_wheeler') {
      return createBikeIcon(h);
    }
    return createCarIcon(h);
  }

  // Toggle Map Type (Streets vs Satellite)
  const toggleMapType = () => {
    if (!mapInstanceRef.current || !tileLayerRef.current) return;
    mapInstanceRef.current.removeLayer(tileLayerRef.current);

    const nextType = mapType === 'streets' ? 'satellite' : 'streets';
    setMapType(nextType);

    const url =
      nextType === 'satellite'
        ? 'https://mt{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}'
        : 'https://mt{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}';

    const newLayer = L.tileLayer(url, {
      maxZoom: 20,
      subdomains: ['0', '1', '2', '3'],
    }).addTo(mapInstanceRef.current);
    tileLayerRef.current = newLayer;
  };

  // Fetch real road route & turn-by-turn steps from OSRM driving engine
  const fetchAndDrawRoute = useCallback(async () => {
    if (!mapInstanceRef.current || !routeLineRef.current || !routeOutlineRef.current) return;

    const startLat = originPoint.lat;
    const startLon = originPoint.lon;
    const endLat = destPoint.lat;
    const endLon = destPoint.lon;

    setIsRoutingLoading(true);

    try {
      const url = `https://router.project-osrm.org/route/v1/driving/${startLon},${startLat};${endLon},${endLat}?overview=full&geometries=geojson&steps=true`;
      const res = await fetch(url, { headers: { Accept: 'application/json' } });
      const data = await res.json();

      if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        const latLngs: [number, number][] = route.geometry.coordinates.map((c: [number, number]) => [c[1], c[0]]);

        setRouteCoordinates(latLngs);
        routeOutlineRef.current.setLatLngs(latLngs);
        routeLineRef.current.setLatLngs(latLngs);

        const dist = Number((route.distance / 1000).toFixed(1));
        const dur = Math.max(1, Math.round(route.duration / 60));
        setRouteDistanceKm(dist);
        setRouteDurationMin(dur);

        // Parse turn-by-turn steps
        if (route.legs && route.legs[0]?.steps) {
          const steps: NavigationStep[] = route.legs[0].steps.map((st: any) => {
            const maneuverType = st.maneuver?.type || 'turn';
            const modifier = st.maneuver?.modifier || '';
            const roadName = st.name || '';
            const roadStr = roadName ? `onto ${roadName}` : 'towards destination';

            let instruction = '';
            if (maneuverType === 'depart') instruction = `Head straight ${roadStr}`;
            else if (maneuverType === 'arrive') instruction = `Arrive at ${destPoint.shortName}`;
            else if (maneuverType === 'roundabout') instruction = `Take roundabout ${roadStr}`;
            else if (modifier) {
              const modCapital = modifier.charAt(0).toUpperCase() + modifier.slice(1);
              instruction = `Turn ${modCapital} ${roadStr}`;
            } else {
              instruction = `Continue straight ${roadStr}`;
            }

            return {
              instruction,
              road: roadName || 'Dawood Khan Rd',
              distanceMeters: Math.round(st.distance || 70),
              durationSeconds: Math.round(st.duration || 10),
              maneuverType,
              maneuverModifier: modifier,
              coordinates: [st.maneuver?.location[1], st.maneuver?.location[0]],
            };
          });

          setNavigationSteps(steps);
          setCurrentStepIndex(0);
          if (steps.length > 0) {
            setDistanceToNextStepMeters(steps[0].distanceMeters);
          }
        }

        if (destinationMarkerRef.current) {
          destinationMarkerRef.current.setLatLng([endLat, endLon]);
        }

        if (roadCalloutMarkerRef.current) {
          roadCalloutMarkerRef.current.setLatLng([endLat, endLon]);
          const calloutHtml = `
            <div style="background: #E0F7FA; color: #006064; font-weight: 800; font-size: 11px; padding: 3px 10px; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.4); border: 2px solid #00E5FF; white-space: nowrap; display: flex; align-items: center; gap: 4px;">
              <span>${destPoint.shortName}</span>
            </div>
          `;
          roadCalloutMarkerRef.current.setIcon(
            L.divIcon({ className: 'road-callout-pill', html: calloutHtml, iconSize: [120, 26], iconAnchor: [60, 13] })
          );
        }

        // Fit bounds in preview mode ONLY if user hasn't panned & destination changed
        if (isExpanded && !isNavigating && mapInstanceRef.current && !isUserPanned) {
          if (destPoint.id !== lastDestIdRef.current) {
            lastDestIdRef.current = destPoint.id;
            const bounds = L.latLngBounds(latLngs);
            mapInstanceRef.current.fitBounds(bounds, { padding: [60, 60], maxZoom: 16 });
          }
        }
        setIsRoutingLoading(false);
        return;
      }
    } catch (e) {
      console.warn('OSRM routing network notice:', e);
    }

    // High quality road fallback
    const fallbackPoints: [number, number][] = [
      [startLat, startLon],
      [startLat + (endLat - startLat) * 0.35 + 0.001, startLon + (endLon - startLon) * 0.3],
      [startLat + (endLat - startLat) * 0.7, startLon + (endLon - startLon) * 0.75 + 0.001],
      [endLat, endLon],
    ];

    setRouteCoordinates(fallbackPoints);
    routeOutlineRef.current.setLatLngs(fallbackPoints);
    routeLineRef.current.setLatLngs(fallbackPoints);

    if (destinationMarkerRef.current) {
      destinationMarkerRef.current.setLatLng([endLat, endLon]);
    }

    const approxDist = Number((calculateDistanceMeters(startLat, startLon, endLat, endLon) / 1000 * 1.25).toFixed(1));
    setRouteDistanceKm(approxDist);
    setRouteDurationMin(Math.max(1, Math.round(approxDist * 1.6)));
    setNavigationSteps([
      {
        instruction: `Head straight on Dawood Khan Rd`,
        road: 'Dawood Khan Rd',
        distanceMeters: 70,
        durationSeconds: 20,
        maneuverType: 'turn',
        maneuverModifier: 'left',
        coordinates: [startLat, startLon],
      },
      {
        instruction: `Arrive at ${destPoint.shortName}`,
        road: destPoint.shortName || 'Destination',
        distanceMeters: 120,
        durationSeconds: 30,
        maneuverType: 'arrive',
        maneuverModifier: 'right',
        coordinates: [endLat, endLon],
      },
    ]);
    setIsRoutingLoading(false);
  }, [originPoint, destPoint, isExpanded, isNavigating, isUserPanned]);

  useEffect(() => {
    fetchAndDrawRoute();
  }, [destPoint.id, originPoint.id]);

  // Active vehicle coordinates (hardware GPS or simulated drive)
  const activeVehiclePos: [number, number] = isSimulatingRide
    ? simVehiclePos
    : [validLat, validLon];

  const activeHeading: number = isSimulatingRide ? simHeading : heading || 0;

  useEffect(() => {
    if (!mapInstanceRef.current || !vehicleMarkerRef.current) return;

    vehicleMarkerRef.current.setLatLng(activeVehiclePos);
    if (accuracyCircleRef.current) {
      accuracyCircleRef.current.setLatLng(activeVehiclePos);
    }

    // Update vehicle icon (Car vs. Bike) and rotation
    vehicleMarkerRef.current.setIcon(getVehicleIcon(vehicleType, activeHeading));

    // Follow vehicle during navigation ONLY if not manually panned
    if (!isUserPanned) {
      if (isNavigating) {
        mapInstanceRef.current.panTo(activeVehiclePos, { animate: true });
      } else if (!isExpanded) {
        mapInstanceRef.current.panTo(activeVehiclePos, { animate: true });
      }
    }
  }, [activeVehiclePos, activeHeading, vehicleType, isNavigating, isUserPanned, isExpanded]);

  // Simulated Ride Engine
  useEffect(() => {
    if (!isSimulatingRide || routeCoordinates.length === 0) return;

    const interval = setInterval(() => {
      setSimCoordIndex((prev) => {
        const next = prev + 1;
        if (next >= routeCoordinates.length) {
          setIsSimulatingRide(false);
          return prev;
        }

        const currPt = routeCoordinates[prev];
        const nextPt = routeCoordinates[next];
        const b = calculateBearing(currPt[0], currPt[1], nextPt[0], nextPt[1]);

        setSimVehiclePos(nextPt);
        setSimHeading(Math.round(b));

        // Advance steps and calculate countdown
        if (navigationSteps.length > currentStepIndex) {
          const stepCoords = navigationSteps[currentStepIndex]?.coordinates;
          if (stepCoords) {
            const dist = calculateDistanceMeters(nextPt[0], nextPt[1], stepCoords[0], stepCoords[1]);
            setDistanceToNextStepMeters(Math.max(10, Math.round(dist)));
            if (dist < 35 && currentStepIndex + 1 < navigationSteps.length) {
              setCurrentStepIndex((s) => s + 1);
              if (!isVoiceMuted) {
                const nextStep = navigationSteps[currentStepIndex + 1];
                if (nextStep) {
                  audioAlertService.speakAlert(nextStep.instruction, 100, 'low');
                }
              }
            }
          }
        }

        return next;
      });
    }, 400);

    return () => clearInterval(interval);
  }, [isSimulatingRide, routeCoordinates, navigationSteps, currentStepIndex, isVoiceMuted]);

  // Handle Resize and Bounds on Mode Changes (Never overwrite user pan/zoom on background GPS ticks)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !isVisible) return;

    if (isExpanded) {
      map.dragging.enable();
      map.touchZoom.enable();
      map.scrollWheelZoom.enable();
      map.doubleClickZoom.enable();
      map.boxZoom.enable();
    } else {
      map.dragging.disable();
      map.touchZoom.disable();
      map.scrollWheelZoom.disable();
      map.doubleClickZoom.disable();
    }

    map.invalidateSize({ pan: false });
    const t = setTimeout(() => {
      map.invalidateSize({ pan: false });
      if (isExpanded && !isNavigating && !isUserPanned) {
        if (destPoint.id !== lastDestIdRef.current) {
          lastDestIdRef.current = destPoint.id;
          const bounds = L.latLngBounds(
            [originPoint.lat, originPoint.lon],
            [destPoint.lat, destPoint.lon]
          );
          map.fitBounds(bounds, { padding: [60, 60], maxZoom: 16 });
        }
      } else if (isExpanded && isNavigating && !isUserPanned) {
        map.setView(activeVehiclePos, 17, { animate: true });
      }
    }, 250);

    return () => clearTimeout(t);
  }, [isExpanded, isVisible, isNavigating, destPoint.id]);

  // Worldwide Online Geocoding Search (Photon API + Nominatim Fallback)
  const executeSearch = useCallback(
    async (query: string) => {
      if (!query || query.trim().length < 2) {
        setSearchResults([]);
        setIsSearching(false);
        return;
      }

      setIsSearching(true);
      try {
        const photonUrl = `https://photon.komoot.io/api/?q=${encodeURIComponent(
          query.trim()
        )}&lat=${validLat}&lon=${validLon}&limit=8`;
        const res = await fetch(photonUrl);
        const data = await res.json();

        if (data.features && data.features.length > 0) {
          const points: NavigationPoint[] = data.features.map((f: any, idx: number) => {
            const p = f.properties || {};
            const name = p.name || p.street || p.city || query;
            const parts = [p.street, p.city, p.state, p.country].filter(Boolean);
            return {
              id: `photon_${idx}_${Date.now()}`,
              name,
              shortName: name.length > 24 ? name.slice(0, 22) + '...' : name,
              address: parts.join(', ') || 'Custom Location',
              lat: f.geometry.coordinates[1],
              lon: f.geometry.coordinates[0],
              category: p.osm_value || 'Place',
            };
          });

          setSearchResults(points);
          setIsSearching(false);
          return;
        }
      } catch (err) {
        console.warn('Photon geocoding notice:', err);
      }

      // Nominatim Fallback
      try {
        const nomUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          query.trim()
        )}&limit=6&addressdetails=1`;
        const res = await fetch(nomUrl);
        const data = await res.json();

        if (Array.isArray(data) && data.length > 0) {
          const points: NavigationPoint[] = data.map((item: any, idx: number) => ({
            id: `nom_${idx}_${Date.now()}`,
            name: item.name || item.display_name.split(',')[0],
            shortName: (item.name || item.display_name.split(',')[0]).slice(0, 24),
            address: item.display_name,
            lat: parseFloat(item.lat),
            lon: parseFloat(item.lon),
            category: item.type || 'Location',
          }));
          setSearchResults(points);
          setIsSearching(false);
          return;
        }
      } catch (e) {
        console.warn('Nominatim fallback notice:', e);
      }

      setSearchResults([]);
      setIsSearching(false);
    },
    [validLat, validLon]
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      executeSearch(searchQuery);
    }, 280);
    return () => clearTimeout(timer);
  }, [searchQuery, executeSearch]);

  // Swap Origin and Destination
  const handleSwapLocations = () => {
    const temp = originPoint;
    setOriginPoint(destPoint);
    setDestPoint(temp);
  };

  // Start Navigation ("Start Ride")
  const handleStartNavigation = () => {
    setIsNavigating(true);
    setIsUserPanned(false);
    setCurrentStepIndex(0);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView(activeVehiclePos, 17, { animate: true });
    }
    if (!isVoiceMuted) {
      audioAlertService.speakAlert(`Starting navigation to ${destPoint.shortName}.`, 100, 'low');
    }
  };

  // Stop Navigation
  const handleStopNavigation = () => {
    setIsNavigating(false);
    setIsSimulatingRide(false);
    setIsUserPanned(false);
    if (mapInstanceRef.current && routeCoordinates.length > 0) {
      const bounds = L.latLngBounds(routeCoordinates);
      mapInstanceRef.current.fitBounds(bounds, { padding: [60, 60], maxZoom: 16 });
    }
  };

  // Fit Journey / Route Overview
  const handleFitJourney = () => {
    if (!mapInstanceRef.current) return;
    if (isNavigating) {
      setIsUserPanned(true);
    }
    if (routeCoordinates.length > 0) {
      const bounds = L.latLngBounds(routeCoordinates);
      mapInstanceRef.current.fitBounds(bounds, { padding: [60, 60], maxZoom: 16 });
    } else {
      const bounds = L.latLngBounds(
        [originPoint.lat, originPoint.lon],
        [destPoint.lat, destPoint.lon]
      );
      mapInstanceRef.current.fitBounds(bounds, { padding: [60, 60], maxZoom: 16 });
    }
  };

  // Sync Hazards to Map Layer
  useEffect(() => {
    if (!hazardsLayerRef.current) return;
    hazardsLayerRef.current.clearLayers();

    hazards.forEach((hazard) => {
      const isSevere = hazard.severity === 'critical' || (hazard.severity as string) === 'high';
      const hazardIcon = L.divIcon({
        className: 'hazard-map-pin',
        html: `
          <div style="background: ${isSevere ? '#EF4444' : '#F59E0B'}; width: 22px; height: 22px; border-radius: 50%; border: 2px solid white; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 8px rgba(0,0,0,0.4);">
            <span style="color: white; font-size: 11px; font-weight: 900;">⚠</span>
          </div>
        `,
        iconSize: [22, 22],
        iconAnchor: [11, 11],
      });

      const marker = L.marker([hazard.lat, hazard.lon], { icon: hazardIcon });
      marker.bindPopup(`<b>${hazard.class}</b><br/>Severity: ${hazard.severity}`);
      hazardsLayerRef.current?.addLayer(marker);
    });
  }, [hazards]);

  // Sync Real Surveyed Roads Network (Color-coded green; unsurveyed roads remain 100% blank)
  useEffect(() => {
    if (!mapInstanceRef.current || !surveyedRoadsLayerRef.current) return;
    surveyedRoadsLayerRef.current.clearLayers();

    if (!showSurveyedLayer) return;

    if (pastSurveyedPaths && pastSurveyedPaths.length > 0) {
      pastSurveyedPaths.forEach((path, idx) => {
        if (!path || path.length < 2) return;

        // Outer glow casing
        const casing = L.polyline(path, {
          color: '#064E3B',
          weight: 8,
          opacity: 0.65,
          lineCap: 'round',
          lineJoin: 'round',
        });

        // Crisp emerald green survey line
        const line = L.polyline(path, {
          color: '#10B981',
          weight: 5,
          opacity: 0.95,
          lineCap: 'round',
          lineJoin: 'round',
        });

        line.bindPopup(`
          <div style="font-family: system-ui, sans-serif; padding: 4px;">
            <b style="color: #059669;">✓ Surveyed Road Corridor</b>
            <div style="font-size: 11px; color: #475569; margin-top: 2px;">
              Real verified GPS survey pass #${idx + 1}
            </div>
          </div>
        `);

        surveyedRoadsLayerRef.current?.addLayer(casing);
        surveyedRoadsLayerRef.current?.addLayer(line);
      });
    }
  }, [showSurveyedLayer, pastSurveyedPaths]);

  // Sync Live Trip Breadcrumbs (Dynamic road surveying - paints road in green as you drive)
  useEffect(() => {
    if (!liveBreadcrumbsLayerRef.current) return;
    if (isRecordingTrip && tripBreadcrumbs && tripBreadcrumbs.length > 0) {
      liveBreadcrumbsLayerRef.current.setStyle({
        color: '#10B981',
        weight: 6,
        opacity: 0.95,
      });
      liveBreadcrumbsLayerRef.current.setLatLngs(tripBreadcrumbs);
    } else {
      liveBreadcrumbsLayerRef.current.setLatLngs([]);
    }
  }, [tripBreadcrumbs, isRecordingTrip]);

  // Re-centre Camera on Vehicle
  const handleRecenter = () => {
    setIsUserPanned(false);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView(activeVehiclePos, 18, { animate: true });
    }
  };

  // Adjust route appearance and camera when toggling active navigation
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    if (isNavigating) {
      if (routeOutlineRef.current) {
        routeOutlineRef.current.setStyle({ color: '#00838F', weight: 10, opacity: 0.95 });
      }
      if (routeLineRef.current) {
        routeLineRef.current.setStyle({ color: '#00E5FF', weight: 6.5, opacity: 1.0 });
      }
      mapInstanceRef.current.setView(activeVehiclePos, 18, { animate: true });
    } else {
      if (routeOutlineRef.current) {
        routeOutlineRef.current.setStyle({ color: '#1A73E8', weight: 7, opacity: 0.95 });
      }
      if (routeLineRef.current) {
        routeLineRef.current.setStyle({ color: '#4285F4', weight: 4.5, opacity: 1.0 });
      }
    }
  }, [isNavigating]);

  // Current and Next turn steps
  const currentStep = navigationSteps[currentStepIndex] || {
    instruction: `Head straight towards destination`,
    road: destPoint.shortName || 'Main Road',
    distanceMeters: 70,
    maneuverModifier: 'left',
  };

  const nextAfterStep = navigationSteps[currentStepIndex + 1];

  // Maneuver Icons
  const renderManeuverIcon = (modifier: string) => {
    if (modifier.includes('left')) {
      return <CornerUpLeft className="w-8 h-8 text-white stroke-[3]" />;
    }
    if (modifier.includes('right')) {
      return <CornerUpRight className="w-8 h-8 text-white stroke-[3]" />;
    }
    return <ArrowUp className="w-8 h-8 text-white stroke-[3]" />;
  };

  const renderSmallManeuverIcon = (modifier: string) => {
    if (modifier.includes('left')) {
      return <CornerUpLeft className="w-3.5 h-3.5 text-white stroke-[3]" />;
    }
    if (modifier.includes('right')) {
      return <CornerUpRight className="w-3.5 h-3.5 text-white stroke-[3]" />;
    }
    return <ArrowUp className="w-3.5 h-3.5 text-white stroke-[3]" />;
  };

  return (
    <>
      {/* ================================================================ */}
      {/* PERSISTENT MAP CONTAINER (Google Maps Midnight Theme in Nav Mode)*/}
      {/* ================================================================ */}
      <div
        className={`transition-all duration-300 select-none ${
          !isVisible
            ? 'hidden'
            : isExpanded
            ? 'fixed inset-0 z-[100] bg-[#161D2B] google-maps-midnight overflow-hidden'
            : `${cornerPositionClasses[cornerPosition]} bg-slate-900/95 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-700/90 overflow-hidden flex flex-col google-maps-midnight`
        }`}
      >
        {/* ================= MINIMIZED CORNER HEADER (CAMERA VIEW) ================= */}
        {!isExpanded && (
          <div
            onClick={onToggleExpand}
            className="cursor-pointer bg-[#0F172A] text-white px-2.5 py-1.5 flex items-center justify-between border-b border-slate-800 z-10 flex-shrink-0"
          >
            <div className="flex items-center gap-1.5 min-w-0 flex-1">
              <CornerUpRight className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
              <span className="text-[10px] font-bold text-white truncate">
                {destPoint.shortName}
              </span>
            </div>
            <div className="flex items-center gap-1">
              {/* Move to another corner button */}
              <button
                onClick={handleCycleCorner}
                className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-teal-300 border border-slate-700/80 active:scale-95 transition-all"
                title={`Docked at ${cornerPosition}. Click to move to next corner.`}
              >
                <Move className="w-3 h-3" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleExpand?.();
                  setSearchModalTarget('destination');
                }}
                className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                title="Search Destination"
              >
                <Search className="w-3 h-3 text-emerald-400" />
              </button>
              {onToggleExpand && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleExpand();
                  }}
                  className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                  title="Expand to Full Google Map"
                >
                  <Maximize2 className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* ================= EXPANDED VIEW: TOP FROM-WHERE-TO-WHERE BAR (PREVIEW MODE) ================= */}
        {isExpanded && !isNavigating && (
          <div className="absolute top-2.5 left-2.5 right-2.5 z-30 bg-[#0F172A]/95 backdrop-blur-md border border-slate-800 px-3 pt-3 pb-2 shadow-2xl rounded-2xl flex flex-col gap-2 text-white pointer-events-auto animate-in fade-in duration-200">
            <div className="flex items-center gap-2">
              <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                {/* FROM INPUT */}
                <div
                  onClick={() => setSearchModalTarget('origin')}
                  className="bg-[#1E293B] hover:bg-[#334155] transition-colors rounded-xl px-2.5 py-1.5 flex items-center gap-2 cursor-pointer border border-slate-700/80"
                >
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-500 flex-shrink-0"></div>
                  <div className="truncate flex-1 text-left">
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      From (Start)
                    </span>
                    <span className="block text-xs font-bold text-white truncate">
                      {originPoint.name}
                    </span>
                  </div>
                  <span className="text-[9px] font-bold text-blue-400 bg-blue-950/80 px-1.5 py-0.5 rounded border border-blue-500/30 flex-shrink-0">
                    CHANGE
                  </span>
                </div>

                {/* TO INPUT */}
                <div
                  onClick={() => setSearchModalTarget('destination')}
                  className="bg-[#1E293B] hover:bg-[#334155] transition-colors rounded-xl px-2.5 py-1.5 flex items-center gap-2 cursor-pointer border border-slate-700/80"
                >
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500 flex-shrink-0"></div>
                  <div className="truncate flex-1 text-left">
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      To (Destination)
                    </span>
                    <span className="block text-xs font-extrabold text-white truncate">
                      {destPoint.name}
                    </span>
                  </div>
                  <span className="text-[9px] font-bold text-rose-400 bg-rose-950/80 px-1.5 py-0.5 rounded border border-rose-500/30 flex-shrink-0">
                    SEARCH
                  </span>
                </div>
              </div>

              {/* Action Buttons: Swap, Vehicle Toggle, & Exit */}
              <div className="flex flex-col gap-1.5 flex-shrink-0">
                <button
                  onClick={handleSwapLocations}
                  className="w-8 h-8 rounded-xl bg-[#1E293B] hover:bg-[#334155] flex items-center justify-center text-slate-300 active:scale-95 transition-all border border-slate-700"
                  title="Swap Origin & Destination"
                >
                  <ArrowUpDown className="w-4 h-4" />
                </button>
                <button
                  onClick={onToggleVehicleType}
                  className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold active:scale-95 transition-all border ${
                    vehicleType === 'two_wheeler'
                      ? 'bg-emerald-950/90 text-emerald-400 border-emerald-500/50 shadow-sm'
                      : 'bg-blue-950/90 text-blue-400 border-blue-500/50 shadow-sm'
                  }`}
                  title={vehicleType === 'two_wheeler' ? 'Selected: Bike (Tap to switch to Car)' : 'Selected: Car (Tap to switch to Bike)'}
                >
                  {vehicleType === 'two_wheeler' ? '🏍️' : '🚗'}
                </button>
                {onToggleExpand && (
                  <button
                    onClick={onToggleExpand}
                    className="w-8 h-8 rounded-xl bg-slate-800 text-white flex items-center justify-center hover:bg-slate-700 active:scale-95 transition-all shadow-md border border-slate-700"
                    title="Close Map & View Camera"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Quick Regional Suggestions */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider flex-shrink-0 mr-0.5">
                Popular:
              </span>
              {POPULAR_REGIONAL_DESTINATIONS.slice(0, 6).map((d) => (
                <button
                  key={d.id}
                  onClick={() => setDestPoint(d)}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-bold flex-shrink-0 transition-all ${
                    destPoint.id === d.id
                      ? 'bg-[#00E5FF] text-[#003B46] font-extrabold shadow-sm'
                      : 'bg-[#1E293B] hover:bg-[#334155] text-slate-300 border border-slate-700/60'
                  }`}
                >
                  {d.shortName}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ================= ACTIVE GOOGLE NAVIGATION GREEN BANNER (MATCHES USER IMAGE) ================= */}
        {isExpanded && isNavigating && (
          <div className="absolute top-2.5 left-2.5 right-2.5 z-30 bg-[#00594C]/95 backdrop-blur-md text-white px-4 pt-3 pb-2.5 rounded-2xl shadow-2xl flex flex-col gap-1.5 border border-emerald-400/30 pointer-events-auto animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3.5 min-w-0 flex-1">
                {/* Big White Turn Arrow */}
                <div className="text-white flex-shrink-0">
                  {renderManeuverIcon(currentStep.maneuverModifier)}
                </div>
                {/* Distance & Road Name */}
                <div className="text-left min-w-0 flex-1">
                  <div className="text-2xl font-black text-white tracking-tight leading-none font-mono">
                    {distanceToNextStepMeters < 35 ? 'NOW' : `${distanceToNextStepMeters} m`}
                  </div>
                  <div className="text-lg font-black text-white truncate leading-snug mt-1 flex items-baseline gap-1">
                    {currentStep.road.endsWith(' Rd') || currentStep.road.endsWith(' Road') ? (
                      <>
                        <span>{currentStep.road.replace(/\s+(Rd|Road)$/, '')}</span>
                        <span className="text-xs font-normal text-emerald-200">Rd</span>
                      </>
                    ) : (
                      <span>{currentStep.road}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Gemini Smart AI Route Sparkle Button & Simulation Toggle */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => setIsSimulatingRide(!isSimulatingRide)}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-full font-bold text-[11px] transition-all ${
                    isSimulatingRide
                      ? 'bg-amber-400 text-slate-900 animate-pulse'
                      : 'bg-[#004238] hover:bg-[#00352c] text-emerald-200 border border-emerald-500/30'
                  }`}
                  title="Simulate Drive along Route"
                >
                  {isSimulatingRide ? (
                    <>
                      <Pause className="w-3 h-3" />
                      <span>SIMULATING</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3 h-3 fill-current" />
                      <span>SIM RIDE</span>
                    </>
                  )}
                </button>

                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-lg text-blue-600">
                  <Sparkles className="w-5 h-5 fill-blue-500 text-blue-600" />
                </div>
              </div>
            </div>

            {/* "Then ↱" Secondary Maneuver Pill (Matches User Image) */}
            {nextAfterStep && (
              <div className="inline-flex items-center gap-1.5 bg-[#004238] px-2.5 py-1 rounded-md text-xs font-extrabold text-white w-max shadow-inner border border-emerald-600/30">
                <span className="text-emerald-300 font-semibold">Then</span>
                {renderSmallManeuverIcon(nextAfterStep.maneuverModifier)}
              </div>
            )}
          </div>
        )}

        {/* ================= PERSISTENT MAP VIEWPORT (FULL BLEED BACKGROUND ACROSS EVERY CORNER) ================= */}
        <div
          className={
            isExpanded
              ? 'absolute inset-0 w-full h-full overflow-hidden'
              : 'flex-1 relative w-full h-full min-h-0 overflow-hidden'
          }
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div
            ref={mapContainerRef}
            className="w-full h-full"
            style={{
              position: 'absolute',
              width: '150%',
              height: '150%',
              top: '-25%',
              left: '-25%',
              transform: `rotate(${mapBearing}deg)`,
              transformOrigin: 'center center',
              transition: isGestureRotating ? 'none' : 'transform 0.25s cubic-bezier(0.2, 0, 0, 1)',
              touchAction: 'none',
            }}
          />

          {/* ================= FLOATING ROAD SURVEY COVERAGE PILL ================= */}
          {isExpanded && (
            <div
              className={`absolute ${
                isNavigating ? 'top-[106px]' : 'top-[156px]'
              } left-3 z-30 flex items-center gap-2 bg-[#0F172A]/90 backdrop-blur-md px-3.5 py-1.5 rounded-full shadow-lg border border-slate-700/80 text-white pointer-events-auto transition-all`}
            >
              <div
                className="flex items-center gap-1.5 text-xs font-black text-emerald-400"
                title="Verified survey passes recorded by RoadSense AI"
              >
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Surveyed: Green</span>
              </div>
              <span className="text-slate-600">|</span>
              <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1" title="Unsurveyed roads remain 100% blank">
                <span className="w-2 h-2 rounded-full border border-slate-500 bg-transparent"></span>
                Unsurveyed: Blank
              </span>
              <button
                onClick={onToggleVehicleType}
                className="ml-1 px-2 py-0.5 rounded-full bg-[#1E293B] hover:bg-slate-700 text-xs font-bold text-slate-200 border border-slate-700 flex items-center gap-1 active:scale-95 transition-all"
                title="Toggle Car / Bike Cursor"
              >
                <span>{vehicleType === 'two_wheeler' ? '🏍️ Bike' : '🚗 Car'}</span>
              </button>

              {onCycleRiskFilter && (
                <>
                  <span className="text-slate-600">|</span>
                  <button
                    onClick={onCycleRiskFilter}
                    className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold flex items-center gap-1 border active:scale-95 transition-all ${
                      riskFactorFilter === 'high_only'
                        ? 'bg-rose-950/90 text-rose-300 border-rose-500/60 shadow-sm'
                        : riskFactorFilter === 'medium_high'
                        ? 'bg-amber-950/90 text-amber-300 border-amber-500/60 shadow-sm'
                        : 'bg-teal-950/90 text-teal-300 border-teal-500/60 shadow-sm'
                    }`}
                    title="Tap to toggle Risk Factor Alert Filter: High Risk Only (Critical) vs Med+High vs All"
                  >
                    <span>🛡️</span>
                    <span>
                      {riskFactorFilter === 'high_only'
                        ? 'Risk: High Only'
                        : riskFactorFilter === 'medium_high'
                        ? 'Risk: Med+High'
                        : 'Risk: All'}
                    </span>
                  </button>
                </>
              )}
            </div>
          )}

          {/* ================= FLOATING CAMERA AI PIP PREVIEW ================= */}
          {isExpanded && cameraPiPNode && (
            <div className="absolute top-12 right-3.5 z-[150] animate-in fade-in duration-200">
              {cameraPiPNode}
            </div>
          )}

          {/* Map Pick Mode Instruction Banner */}
          {mapPickTarget && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[500] bg-blue-600 text-white px-4 py-2 rounded-full shadow-2xl flex items-center gap-2 pointer-events-auto">
              <MapPin className="w-4 h-4 animate-bounce text-yellow-300" />
              <span className="text-xs font-bold whitespace-nowrap">
                Tap anywhere on map to choose {mapPickTarget === 'origin' ? 'starting point' : 'destination'}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setMapPickTarget(null);
                }}
                className="ml-1 p-1 rounded-full hover:bg-blue-700 active:scale-95 text-white/90"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Minimized tap overlay to open full-screen Google Maps */}
          {!isExpanded && (
            <div
              onClick={onToggleExpand}
              className="absolute inset-0 z-[350] cursor-pointer bg-transparent"
              title="Tap to Expand Full Google Map Navigation"
            />
          )}

          {/* Minimized bottom badge */}
          {!isExpanded && (
            <div className="absolute bottom-1.5 left-1.5 z-[400] bg-slate-900/95 backdrop-blur-xs px-2 py-0.5 rounded-md text-[9px] font-extrabold text-blue-400 shadow-sm border border-slate-700 flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
              {routeDistanceKm} km · {routeDurationMin} min
            </div>
          )}

          {/* ================= NAVIGATION MODE FLOATING CONTROLS (MATCHES USER IMAGE) ================= */}
          {isExpanded && isNavigating && (
            <>
              {/* BOTTOM-LEFT: RE-CENTRE BUTTON (APPEARS WHEN USER MOVES MAP) */}
              {isUserPanned && (
                <button
                  onClick={handleRecenter}
                  className="absolute left-3.5 bottom-24 z-30 flex items-center gap-2 bg-[#0F172A]/95 hover:bg-black text-white px-4 py-2.5 rounded-full shadow-2xl border border-slate-700/80 active:scale-95 transition-all cursor-pointer backdrop-blur-md animate-in fade-in zoom-in-95 duration-200 pointer-events-auto"
                  title="Re-centre Camera on Vehicle"
                >
                  <Navigation className="w-4 h-4 fill-white -rotate-45" />
                  <span className="font-extrabold text-xs tracking-wide">Re-centre</span>
                </button>
              )}

              {/* BOTTOM-RIGHT: ZOOM (+/-), ROTATE (↺/↻), COMPASS (🧭), SEARCH, VOICE, AND REPORT BUTTONS */}
              <div className="absolute right-3.5 bottom-24 z-30 flex flex-col items-center gap-2 pointer-events-auto">
                {/* Floating Zoom & Rotate Controls */}
                <div className="flex flex-col rounded-2xl overflow-hidden shadow-2xl border border-slate-700/80 bg-[#0F172A]/90 backdrop-blur-md">
                  <button
                    onClick={() => {
                      setIsUserPanned(true);
                      mapInstanceRef.current?.zoomIn();
                    }}
                    className="w-10 h-10 flex items-center justify-center text-white hover:bg-slate-700 active:bg-slate-600 border-b border-slate-700/60 transition-colors"
                    title="Zoom In"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      setIsUserPanned(true);
                      mapInstanceRef.current?.zoomOut();
                    }}
                    className="w-10 h-10 flex items-center justify-center text-white hover:bg-slate-700 active:bg-slate-600 border-b border-slate-700/60 transition-colors"
                    title="Zoom Out"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleRotateLeft}
                    className="w-10 h-10 flex items-center justify-center text-slate-200 hover:text-white hover:bg-slate-700 active:bg-slate-600 border-b border-slate-700/60 transition-colors"
                    title="Rotate Map Left (45°)"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleRotateRight}
                    className="w-10 h-10 flex items-center justify-center text-slate-200 hover:text-white hover:bg-slate-700 active:bg-slate-600 transition-colors"
                    title="Rotate Map Right (45°)"
                  >
                    <RotateCw className="w-4 h-4" />
                  </button>
                </div>

                {/* Compass Needle (N) */}
                <button
                  onClick={handleCompassClick}
                  className="w-11 h-11 rounded-full bg-[#0F172A]/95 text-white shadow-xl border border-slate-700 flex flex-col items-center justify-center active:scale-95 hover:bg-slate-800 transition-all"
                  title={
                    mapBearing !== 0
                      ? `Rotated ${Math.round(mapBearing)}°. Tap to reset True North`
                      : isHeadingUp
                      ? 'Heading-Up Active (Tap for North-Up)'
                      : 'North-Up Active (Tap for Heading-Up)'
                  }
                >
                  <div
                    style={{ transform: `rotate(${-mapBearing}deg)`, transition: 'transform 0.25s ease-out' }}
                    className="flex flex-col items-center"
                  >
                    <div className="w-0 h-0 border-l-[3.5px] border-l-transparent border-r-[3.5px] border-r-transparent border-b-[8px] border-b-rose-500"></div>
                    <div className="w-0 h-0 border-l-[3.5px] border-l-transparent border-r-[3.5px] border-r-transparent border-t-[8px] border-t-slate-400"></div>
                  </div>
                  <span className="text-[8px] font-black tracking-tighter text-white mt-0.5 leading-none">
                    {mapBearing !== 0 ? `${Math.round(mapBearing)}°` : isHeadingUp ? 'HDG' : 'N'}
                  </span>
                </button>

                {/* Search along route */}
                <button
                  onClick={() => setSearchModalTarget('destination')}
                  className="w-11 h-11 rounded-full bg-black/90 text-white shadow-xl border border-slate-700 flex items-center justify-center active:scale-95 hover:bg-slate-900"
                  title="Search along route"
                >
                  <Search className="w-4 h-4 text-white" />
                </button>

                {/* Voice Guidance Toggle */}
                <button
                  onClick={() => setIsVoiceMuted(!isVoiceMuted)}
                  className="w-11 h-11 rounded-full bg-black/90 text-white shadow-xl border border-slate-700 flex items-center justify-center active:scale-95 hover:bg-slate-900"
                  title={isVoiceMuted ? 'Unmute voice' : 'Mute voice'}
                >
                  {isVoiceMuted ? <VolumeX className="w-4 h-4 text-slate-400" /> : <Volume2 className="w-4 h-4 text-white" />}
                </button>

                {/* Car / Bike Vehicle Toggle (Google Maps Cursor Switcher) */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleVehicleType?.();
                  }}
                  className="w-11 h-11 rounded-full bg-black/90 text-white shadow-xl border border-slate-700 flex items-center justify-center active:scale-95 hover:bg-slate-900 text-base"
                  title={vehicleType === 'two_wheeler' ? 'Selected: Bike (Tap to switch to Car)' : 'Selected: Car (Tap to switch to Bike)'}
                >
                  {vehicleType === 'two_wheeler' ? '🏍️' : '🚗'}
                </button>

                {/* Report Hazard / Pothole Button (Matches User Image) */}
                <button
                  onClick={() => {
                    if (onOpenReport) onOpenReport();
                  }}
                  className="flex items-center gap-1.5 bg-black/90 hover:bg-slate-900 text-amber-400 px-3.5 py-2 rounded-full shadow-2xl border border-slate-700 active:scale-95 transition-all cursor-pointer"
                  title="Report Pothole / Road Hazard"
                >
                  <div className="w-4 h-4 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400">
                    <AlertTriangle className="w-3 h-3 stroke-[2.5]" />
                  </div>
                  <span className="font-extrabold text-xs text-white">Report</span>
                </button>
              </div>
            </>
          )}

          {/* ================= PREVIEW MODE FLOATING CONTROLS ================= */}
          {isExpanded && !isNavigating && (
            <>
              {/* Bottom Left: Re-centre (if panned) & Live GPS Status */}
              <div className="absolute left-3.5 bottom-24 z-30 flex flex-col gap-2 pointer-events-auto">
                {isUserPanned && (
                  <button
                    onClick={handleRecenter}
                    className="flex items-center gap-2 bg-[#0F172A]/95 hover:bg-black text-white px-4 py-2.5 rounded-full shadow-2xl border border-slate-700/80 active:scale-95 transition-all cursor-pointer backdrop-blur-md animate-in fade-in zoom-in-95 duration-200"
                    title="Re-centre Camera on Vehicle"
                  >
                    <Navigation className="w-4 h-4 fill-white -rotate-45" />
                    <span className="font-extrabold text-xs tracking-wide">Re-centre</span>
                  </button>
                )}
                <div className="bg-[#0F172A]/90 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-lg border border-slate-700 flex items-center gap-2 text-white">
                  <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping"></div>
                  <div className="text-left">
                    <span className="block text-[10px] font-bold text-slate-400 uppercase">Live GPS</span>
                    <span className="block text-xs font-black text-white font-mono">
                      {validLat.toFixed(4)}° N, {validLon.toFixed(4)}° E
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom Right Controls: Zoom (+/-), Rotate (↺/↻), Compass, Vehicle, Layers, Fit, Recenter */}
              <div className="absolute right-3.5 bottom-24 z-30 flex flex-col items-center gap-2 pointer-events-auto">
                {/* Floating Zoom & Rotate Controls */}
                <div className="flex flex-col rounded-2xl overflow-hidden shadow-2xl border border-slate-700/80 bg-[#0F172A]/90 backdrop-blur-md">
                  <button
                    onClick={() => {
                      setIsUserPanned(true);
                      mapInstanceRef.current?.zoomIn();
                    }}
                    className="w-10 h-10 flex items-center justify-center text-white hover:bg-slate-700 active:bg-slate-600 border-b border-slate-700/60 transition-colors"
                    title="Zoom In"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      setIsUserPanned(true);
                      mapInstanceRef.current?.zoomOut();
                    }}
                    className="w-10 h-10 flex items-center justify-center text-white hover:bg-slate-700 active:bg-slate-600 border-b border-slate-700/60 transition-colors"
                    title="Zoom Out"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleRotateLeft}
                    className="w-10 h-10 flex items-center justify-center text-slate-200 hover:text-white hover:bg-slate-700 active:bg-slate-600 border-b border-slate-700/60 transition-colors"
                    title="Rotate Map Left (45°)"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleRotateRight}
                    className="w-10 h-10 flex items-center justify-center text-slate-200 hover:text-white hover:bg-slate-700 active:bg-slate-600 transition-colors"
                    title="Rotate Map Right (45°)"
                  >
                    <RotateCw className="w-4 h-4" />
                  </button>
                </div>

                {/* Compass Needle (N) */}
                <button
                  onClick={handleCompassClick}
                  className="w-11 h-11 rounded-full bg-[#0F172A]/95 text-white shadow-xl border border-slate-700 flex flex-col items-center justify-center active:scale-95 hover:bg-slate-800 transition-all"
                  title={
                    mapBearing !== 0
                      ? `Rotated ${Math.round(mapBearing)}°. Tap to reset True North`
                      : isHeadingUp
                      ? 'Heading-Up Active (Tap for North-Up)'
                      : 'North-Up Active (Tap for Heading-Up)'
                  }
                >
                  <div
                    style={{ transform: `rotate(${-mapBearing}deg)`, transition: 'transform 0.25s ease-out' }}
                    className="flex flex-col items-center"
                  >
                    <div className="w-0 h-0 border-l-[3.5px] border-l-transparent border-r-[3.5px] border-r-transparent border-b-[8px] border-b-rose-500"></div>
                    <div className="w-0 h-0 border-l-[3.5px] border-l-transparent border-r-[3.5px] border-r-transparent border-t-[8px] border-t-slate-400"></div>
                  </div>
                  <span className="text-[8px] font-black tracking-tighter text-white mt-0.5 leading-none">
                    {mapBearing !== 0 ? `${Math.round(mapBearing)}°` : isHeadingUp ? 'HDG' : 'N'}
                  </span>
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleVehicleType?.();
                  }}
                  className={`w-11 h-11 rounded-full shadow-lg border flex items-center justify-center active:scale-95 transition-all text-base ${
                    vehicleType === 'two_wheeler'
                      ? 'bg-emerald-950/90 text-emerald-400 border-emerald-500/50'
                      : 'bg-blue-950/90 text-blue-400 border-blue-500/50'
                  }`}
                  title={vehicleType === 'two_wheeler' ? 'Selected: Bike (Tap to switch to Car)' : 'Selected: Car (Tap to switch to Bike)'}
                >
                  {vehicleType === 'two_wheeler' ? '🏍️' : '🚗'}
                </button>

                <button
                  onClick={toggleMapType}
                  className={`w-11 h-11 rounded-full shadow-lg border flex items-center justify-center active:scale-95 transition-all ${
                    mapType === 'satellite'
                      ? 'bg-blue-600 text-white border-blue-500'
                      : 'bg-[#0F172A]/90 text-white border-slate-700 hover:bg-slate-800'
                  }`}
                  title="Toggle Satellite / Streets"
                >
                  <Layers className="w-5 h-5" />
                </button>

                <button
                  onClick={handleFitJourney}
                  className="w-11 h-11 rounded-full bg-[#0F172A]/90 text-indigo-400 shadow-lg border border-slate-700 flex items-center justify-center hover:bg-slate-800 active:scale-95 transition-all"
                  title="Fit Trip Route"
                >
                  <Navigation className="w-5 h-5" />
                </button>

                <button
                  onClick={handleRecenter}
                  className="w-11 h-11 rounded-full bg-[#0F172A]/90 text-cyan-400 shadow-lg border border-slate-700 flex items-center justify-center hover:bg-slate-800 active:scale-95 transition-all"
                  title="Recenter on My Location"
                >
                  <Crosshair className="w-5 h-5" />
                </button>
              </div>
            </>
          )}
        </div>

        {/* ================= PREVIEW MODE: BOTTOM "START RIDE" BAR ================= */}
        {isExpanded && !isNavigating && (
          <div className="absolute bottom-3 left-3 right-3 z-30 bg-[#0F172A]/95 backdrop-blur-md border border-slate-800 px-4 py-3 rounded-2xl shadow-[0_12px_36px_rgba(0,0,0,0.7)] flex items-center justify-between text-white pointer-events-auto animate-in slide-in-from-bottom duration-200">
            <div className="flex flex-col text-left">
              <div className="flex items-baseline gap-2">
                <span className="text-xl sm:text-2xl font-black text-[#22C55E] font-mono tracking-tight">
                  {routeDurationMin} min
                </span>
                <span className="text-xs font-bold text-slate-400">
                  ({routeDistanceKm} km)
                </span>
              </div>
              <span className="text-[10px] sm:text-[11px] font-semibold text-slate-400 truncate max-w-[170px] sm:max-w-none">
                ETA {formatETA(routeDurationMin)} · RoadSense AI Safe Route
              </span>
            </div>

            <div className="flex items-center gap-2">
              {onSwitchToCamera && (
                <button
                  onClick={onSwitchToCamera}
                  className="p-2.5 rounded-full bg-[#1E293B] hover:bg-[#334155] text-slate-300 flex items-center gap-1 text-xs font-bold active:scale-95 transition-all border border-slate-700"
                  title="Switch to Full Camera View"
                >
                  <Camera className="w-4 h-4 text-slate-300" />
                  <span className="hidden sm:inline">Camera</span>
                </button>
              )}

              {onStartTrip && (
                <button
                  onClick={isRecordingTrip ? onStopTrip : onStartTrip}
                  className={`px-3 py-2.5 rounded-full text-xs font-black flex items-center gap-1.5 shadow-md active:scale-95 transition-all ${
                    isRecordingTrip
                      ? 'bg-rose-600 text-white animate-pulse'
                      : 'bg-emerald-600 text-white hover:bg-emerald-700'
                  }`}
                  title={isRecordingTrip ? 'Stop Active Road Survey Trip' : 'Start Recording Road Survey Trip'}
                >
                  <span className={`w-2 h-2 rounded-full ${isRecordingTrip ? 'bg-white' : 'bg-emerald-200'}`} />
                  <span>{isRecordingTrip ? 'SURVEYING' : 'REC'}</span>
                </button>
              )}

              <button
                onClick={handleStartNavigation}
                className="flex items-center gap-2 bg-[#1A73E8] hover:bg-blue-600 active:scale-95 text-white px-5 py-2.5 rounded-full font-black text-sm shadow-xl shadow-blue-500/35 transition-all cursor-pointer"
                title="Start Google Maps Navigation"
              >
                <Navigation className="w-4 h-4 fill-current" />
                <span>START RIDE</span>
              </button>
            </div>
          </div>
        )}

        {/* ================= ACTIVE NAVIGATION MODE: BOTTOM BLACK BAR (MATCHES USER IMAGE) ================= */}
        {isExpanded && isNavigating && (
          <div className="absolute bottom-3 left-3 right-3 z-30 bg-black/95 backdrop-blur-md text-white px-5 py-3 rounded-2xl shadow-[0_12px_36px_rgba(0,0,0,0.7)] border border-slate-800 flex items-center justify-between pointer-events-auto animate-in slide-in-from-bottom duration-200">
            {/* Left Circular (✕) Exit Button */}
            <button
              onClick={handleStopNavigation}
              className="w-11 h-11 rounded-full bg-[#1F2937] hover:bg-slate-700 active:scale-95 text-white flex items-center justify-center transition-all shadow-md cursor-pointer border border-slate-700"
              title="Exit Navigation"
            >
              <X className="w-5 h-5 stroke-[2.5]" />
            </button>

            {/* Center: ETA Duration & Distance & Subtext */}
            <div className="flex flex-col items-center cursor-pointer">
              <div className="w-8 h-1 bg-slate-600 rounded-full mb-1"></div>
              <div className="text-2xl font-black text-[#22C55E] font-mono leading-none tracking-tight">
                {routeDurationMin} min
              </div>
              <div className="text-xs font-bold text-slate-300 mt-1 flex items-center gap-1.5">
                <span>
                  {routeDistanceKm < 1
                    ? `${Math.max(10, Math.round(routeDistanceKm * 1000))} m`
                    : `${routeDistanceKm} km`}
                </span>
                <span>•</span>
                <span>{formatETA(routeDurationMin)}</span>
              </div>
            </div>

            {/* Right: Route Overview / Alternate Routes (🔀) Button */}
            <button
              onClick={handleFitJourney}
              className="w-11 h-11 rounded-full bg-[#1F2937] hover:bg-slate-700 active:scale-95 text-white flex items-center justify-center transition-all shadow-md cursor-pointer border border-slate-700"
              title="Route Overview / Alternative Routes"
            >
              <GitFork className="w-5 h-5 stroke-[2.5] rotate-90" />
            </button>
          </div>
        )}
      </div>

      {/* ================================================================ */}
      {/* WORLDWIDE LIVE SEARCH & LOCATION PICKER MODAL (DARK THEME)        */}
      {/* ================================================================ */}
      {searchModalTarget && (
        <div className="fixed inset-0 z-[600] bg-black/75 backdrop-blur-xs flex flex-col justify-end sm:justify-center sm:items-center p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-[#0F172A] w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl max-h-[88vh] flex flex-col shadow-2xl overflow-hidden border border-slate-800 text-white">
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-[#1E293B]">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-cyan-400" />
                <h3 className="font-extrabold text-white text-base">
                  {searchModalTarget === 'origin' ? 'Select Starting Point' : 'Search Any Destination'}
                </h3>
              </div>
              <button
                onClick={() => {
                  setSearchModalTarget(null);
                  setSearchQuery('');
                  setSearchResults([]);
                }}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Live Search Input */}
            <div className="p-3 border-b border-slate-800 bg-[#0F172A]">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  autoFocus
                  placeholder={
                    searchModalTarget === 'origin'
                      ? 'Type any starting location, street, or city...'
                      : 'Search any destination worldwide (e.g. Bangalore, Hospital, Street)...'
                  }
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#1E293B] border border-slate-700 rounded-xl pl-9 pr-8 py-2.5 text-xs font-semibold text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-cyan-500"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              {isSearching && (
                <div className="text-[10px] text-cyan-400 font-bold mt-1.5 flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin"></div>
                  Searching worldwide locations...
                </div>
              )}
            </div>

            {/* Quick Special Options */}
            <div className="p-2 border-b border-slate-800 bg-[#1E293B] flex items-center gap-2">
              <button
                onClick={() => {
                  const curr: NavigationPoint = {
                    id: 'current_location',
                    name: 'Your Current Location',
                    shortName: 'Your Location',
                    address: `${validLat.toFixed(4)}° N, ${validLon.toFixed(4)}° E`,
                    lat: validLat,
                    lon: validLon,
                    isCurrentLocation: true,
                  };
                  if (searchModalTarget === 'origin') setOriginPoint(curr);
                  else setDestPoint(curr);
                  setSearchModalTarget(null);
                  setSearchQuery('');
                }}
                className="flex-1 bg-[#0F172A] hover:bg-slate-800 border border-slate-700 rounded-xl py-2 px-3 flex items-center justify-center gap-1.5 text-xs font-bold text-cyan-400 active:scale-95 transition-all"
              >
                <LocateFixed className="w-3.5 h-3.5" />
                <span>My Current Location</span>
              </button>

              <button
                onClick={() => {
                  setMapPickTarget(searchModalTarget);
                  setSearchModalTarget(null);
                }}
                className="flex-1 bg-[#0F172A] hover:bg-slate-800 border border-slate-700 rounded-xl py-2 px-3 flex items-center justify-center gap-1.5 text-xs font-bold text-emerald-400 active:scale-95 transition-all"
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>Choose on Map</span>
              </button>
            </div>

            {/* Search Results List OR Popular Destinations List */}
            <div className="flex-1 overflow-y-auto p-3 divide-y divide-slate-800">
              {searchQuery.trim().length >= 2 ? (
                searchResults.length > 0 ? (
                  searchResults.map((point) => (
                    <div
                      key={point.id}
                      onClick={() => {
                        if (searchModalTarget === 'origin') setOriginPoint(point);
                        else setDestPoint(point);
                        setSearchModalTarget(null);
                        setSearchQuery('');
                        setSearchResults([]);
                      }}
                      className="py-3 px-3 rounded-xl flex items-center justify-between cursor-pointer hover:bg-slate-800/80 transition-colors"
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-[#1E293B] text-cyan-400 flex items-center justify-center flex-shrink-0 border border-slate-700">
                          <MapPin className="w-4 h-4" />
                        </div>
                        <div className="min-w-0 text-left">
                          <span className="block text-xs font-extrabold text-white truncate">
                            {point.name}
                          </span>
                          <span className="block text-[11px] text-slate-400 truncate mt-0.5">
                            {point.address}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  !isSearching && (
                    <div className="py-8 text-center text-xs font-bold text-slate-400">
                      No matching places found. Try typing another city, street, or landmark.
                    </div>
                  )
                )
              ) : (
                <>
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider px-2 py-1">
                    Popular Regional Destinations
                  </div>
                  {POPULAR_REGIONAL_DESTINATIONS.map((point) => {
                    const isSelected =
                      searchModalTarget === 'origin'
                        ? originPoint.id === point.id
                        : destPoint.id === point.id;
                    return (
                      <div
                        key={point.id}
                        onClick={() => {
                          if (searchModalTarget === 'origin') setOriginPoint(point);
                          else setDestPoint(point);
                          setSearchModalTarget(null);
                        }}
                        className={`py-3 px-3 rounded-xl flex items-center justify-between cursor-pointer transition-colors ${
                          isSelected ? 'bg-cyan-950/70 border border-cyan-500/50' : 'hover:bg-slate-800/70'
                        }`}
                      >
                        <div className="flex items-start gap-3 min-w-0">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                              isSelected ? 'bg-cyan-500 text-slate-900 font-bold' : 'bg-[#1E293B] text-slate-300 border border-slate-700'
                            }`}
                          >
                            <MapPin className="w-4 h-4" />
                          </div>
                          <div className="min-w-0 text-left">
                            <span className={`block text-xs font-extrabold truncate ${isSelected ? 'text-cyan-300' : 'text-white'}`}>
                              {point.name}
                            </span>
                            <span className="block text-[11px] text-slate-400 truncate mt-0.5">
                              {point.address}
                            </span>
                          </div>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-cyan-400 flex-shrink-0 ml-2" />}
                      </div>
                    );
                  })}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
