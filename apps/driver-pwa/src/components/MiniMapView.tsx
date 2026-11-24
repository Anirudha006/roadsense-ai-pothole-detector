import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { X, ShieldAlert, Navigation } from 'lucide-react';
import { Hazard, haversineDistance } from '@roadsense/shared';

interface MiniMapViewProps {
  currentLat: number;
  currentLon: number;
  heading: number;
  hazards: Hazard[];
  onClose: () => void;
}

export const MiniMapView: React.FC<MiniMapViewProps> = ({
  currentLat,
  currentLon,
  heading,
  hazards,
  onClose,
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const circleRef = useRef<L.Circle | null>(null);
  const hazardLayerRef = useRef<L.LayerGroup | null>(null);

  // Filter hazards within 500m
  const nearbyHazards = hazards
    .map((h) => ({
      ...h,
      distanceToUserMeters: Math.round(haversineDistance(currentLat, currentLon, h.lat, h.lon)),
    }))
    .filter((h) => h.distanceToUserMeters <= 500)
    .sort((a, b) => a.distanceToUserMeters - b.distanceToUserMeters);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [currentLat, currentLon],
        zoom: 16,
        zoomControl: false,
        attributionControl: false,
      });

      L.tileLayer('https://mt{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
        maxZoom: 20,
        subdomains: ['0', '1', '2', '3'],
      }).addTo(map);

      // 500m radar boundary
      const circle = L.circle([currentLat, currentLon], {
        radius: 500,
        color: '#14B8A6',
        fillColor: '#14B8A6',
        fillOpacity: 0.08,
        weight: 1.5,
        dashArray: '4, 6',
      }).addTo(map);

      // Custom User Location Pin
      const userIcon = L.divIcon({
        className: 'user-marker',
        html: `
          <div style="transform: rotate(${heading}deg); width: 32px; height: 32px; display: flex; items-center; justify-content: center;">
            <svg viewBox="0 0 24 24" width="32" height="32" fill="#14B8A6">
              <path d="M12 2L4 20L12 16L20 20L12 2Z" stroke="#FFFFFF" stroke-width="2"/>
            </svg>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const userMarker = L.marker([currentLat, currentLon], { icon: userIcon }).addTo(map);

      const hazardLayer = L.layerGroup().addTo(map);

      mapInstanceRef.current = map;
      userMarkerRef.current = userMarker;
      circleRef.current = circle;
      hazardLayerRef.current = hazardLayer;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update position, circle, and hazard pins
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    mapInstanceRef.current.panTo([currentLat, currentLon]);

    if (userMarkerRef.current) {
      userMarkerRef.current.setLatLng([currentLat, currentLon]);
      const userIcon = L.divIcon({
        className: 'user-marker',
        html: `
          <div style="transform: rotate(${heading}deg); width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;">
            <svg viewBox="0 0 24 24" width="32" height="32" fill="#14B8A6">
              <path d="M12 2L4 20L12 16L20 20L12 2Z" stroke="#FFFFFF" stroke-width="2"/>
            </svg>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });
      userMarkerRef.current.setIcon(userIcon);
    }

    if (circleRef.current) {
      circleRef.current.setLatLng([currentLat, currentLon]);
    }

    if (hazardLayerRef.current) {
      hazardLayerRef.current.clearLayers();

      nearbyHazards.forEach((h) => {
        const pinColor =
          h.severity === 'critical' ? '#FB7185' : h.severity === 'medium' ? '#FBBF24' : '#34D399';

        const hazardIcon = L.divIcon({
          className: 'hazard-pin',
          html: `
            <div style="background-color: ${pinColor}; width: 14px; height: 14px; border-radius: 50%; border: 2px solid #FFFFFF; box-shadow: 0 0 8px ${pinColor};"></div>
          `,
          iconSize: [14, 14],
          iconAnchor: [7, 7],
        });

        const m = L.marker([h.lat, h.lon], { icon: hazardIcon });
        m.bindPopup(
          `<b>${h.class.toUpperCase()}</b><br/>Severity: ${h.severity}<br/>Dist: ${h.distanceToUserMeters}m`
        );
        hazardLayerRef.current?.addLayer(m);
      });
    }
  }, [currentLat, currentLon, heading, nearbyHazards]);

  return (
    <div className="fixed inset-x-4 top-20 bottom-32 z-50 bg-white/95 backdrop-blur-xl rounded-3xl border border-[#D8EEEA] shadow-2xl flex flex-col overflow-hidden max-w-lg mx-auto">
      {/* Map header */}
      <div className="p-3.5 border-b border-[#D8EEEA] flex items-center justify-between bg-[#F4FBFA]">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-[#14B8A6]" />
          <span className="font-extrabold text-sm text-[#0F172A]">500m Cloud Radar Map</span>
          <span className="text-[10px] bg-[#ECFDF5] text-[#059669] px-2 py-0.5 rounded-full font-bold">
            {nearbyHazards.length} within 500m
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-200 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Leaflet container */}
      <div className="flex-1 w-full relative">
        <div ref={mapContainerRef} className="w-full h-full" />
      </div>

      {/* Bottom list of upcoming hazards */}
      <div className="p-3 bg-white border-t border-[#D8EEEA] max-h-36 overflow-y-auto">
        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
          Upcoming Hazards (Traffic-Occlusion Solver)
        </span>
        {nearbyHazards.length === 0 ? (
          <p className="text-xs text-slate-400 italic">No hazards detected in 500m radius.</p>
        ) : (
          <div className="flex flex-col gap-1.5">
            {nearbyHazards.slice(0, 4).map((h) => (
              <div
                key={h.id}
                className="flex items-center justify-between text-xs px-2.5 py-1.5 bg-[#F0FDFA] rounded-xl border border-[#D8EEEA]"
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      h.severity === 'critical'
                        ? 'bg-[#FB7185]'
                        : h.severity === 'medium'
                        ? 'bg-[#FBBF24]'
                        : 'bg-[#34D399]'
                    }`}
                  />
                  <span className="font-semibold text-slate-800 capitalize">
                    {h.class.replace('_', ' ')}
                  </span>
                </div>
                <span className="font-bold text-[#0D9488]">{h.distanceToUserMeters} m ahead</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
