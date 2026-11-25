import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  Layers,
  Flame,
  Filter,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  RefreshCw,
  Compass,
  SlidersHorizontal,
} from 'lucide-react';
import { useHazards } from '../../context/HazardContext';
import { HazardDetailSlideover } from './HazardDetailSlideover';
import type { Hazard, SeverityLevel } from '../../types';
import { SURVEYED_ROADS_DATA, TOTAL_SURVEYED_DISTANCE_KM } from '@roadsense/shared';

export const LiveHazardMap: React.FC = () => {
  const { filteredHazards, selectedHazard, setSelectedHazard, wards, filters, setFilters, totalSurveyedKm, stats } = useHazards();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const polygonsLayerRef = useRef<L.LayerGroup | null>(null);
  const surveyedRoadsLayerRef = useRef<L.LayerGroup | null>(null);

  const [showHeatmap, setShowHeatmap] = useState(false);
  const [showWardPolygons, setShowWardPolygons] = useState(true);
  const [showSurveyedRoads, setShowSurveyedRoads] = useState(true);
  const [activeSeverityPill, setActiveSeverityPill] = useState<SeverityLevel | 'all'>('all');

  // Mysuru City Default Center: 12.3051, 76.6551
  const MYSURU_CENTER: [number, number] = [12.3150, 76.6350];

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: MYSURU_CENTER,
      zoom: 13,
      zoomControl: false,
    });

    // Custom OpenStreetMap Tile Layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors | RoadSense AI',
      maxZoom: 19,
    }).addTo(map);

    // Zoom control at bottom right
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    markersLayerRef.current = L.layerGroup().addTo(map);
    polygonsLayerRef.current = L.layerGroup().addTo(map);
    surveyedRoadsLayerRef.current = L.layerGroup().addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Render Ward Circles/Polygons
  useEffect(() => {
    if (!mapInstanceRef.current || !polygonsLayerRef.current) return;
    polygonsLayerRef.current.clearLayers();

    if (!showWardPolygons) return;

    wards.forEach((ward) => {
      const circle = L.circle(ward.polygonCenter, {
        radius: 1200,
        color: '#14B8A6',
        weight: 1.5,
        fillColor: '#99F6E4',
        fillOpacity: 0.08,
        dashArray: '4, 4',
      });

      circle.bindTooltip(`<b>${ward.name}</b><br/>${ward.totalHazards} Hazards (${ward.criticalHazards} Critical)`, {
        permanent: false,
        direction: 'top',
        className: 'text-xs font-sans',
      });

      circle.addTo(polygonsLayerRef.current!);
    });
  }, [wards, showWardPolygons]);

  // Render Surveyed Road Corridors on Municipal GIS Map (Unsurveyed roads remain blank)
  useEffect(() => {
    if (!mapInstanceRef.current || !surveyedRoadsLayerRef.current) return;
    surveyedRoadsLayerRef.current.clearLayers();

    if (!showSurveyedRoads) return;

    SURVEYED_ROADS_DATA.forEach((road) => {
      const isCritical = road.condition === 'Critical Potholes';
      const casing = L.polyline(road.coordinates, {
        color: isCritical ? '#7F1D1D' : '#064E3B',
        weight: 8,
        opacity: 0.75,
        lineCap: 'round',
        lineJoin: 'round',
      });

      const line = L.polyline(road.coordinates, {
        color: isCritical ? '#F59E0B' : '#10B981',
        weight: 5,
        opacity: 0.95,
        lineCap: 'round',
        lineJoin: 'round',
      });

      const tooltipContent = `
        <div style="font-family: system-ui; padding: 4px; font-size: 11px;">
          <b style="color: #059669;">🟢 Surveyed Road</b>: ${road.name} (${road.distanceKm} km)<br/>
          <span style="color: #64748B;">Potholes: ${road.defectCount} | Ward: ${road.wardName}</span>
        </div>
      `;

      line.bindTooltip(tooltipContent, { sticky: true });
      casing.bindTooltip(tooltipContent, { sticky: true });

      surveyedRoadsLayerRef.current?.addLayer(casing);
      surveyedRoadsLayerRef.current?.addLayer(line);
    });
  }, [showSurveyedRoads]);

  // Render Hazard Markers
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;
    markersLayerRef.current.clearLayers();

    const displayHazards = filteredHazards.filter((h) => {
      if (activeSeverityPill !== 'all' && h.severity !== activeSeverityPill) return false;
      return true;
    });

    displayHazards.forEach((h) => {
      // Determine colors and styling
      let pinColor = '#10B981';
      let pulseClass = '';
      if (h.status === 'repaired') {
        pinColor = '#14B8A6';
      } else if (h.severity === 'critical') {
        pinColor = '#FB7185';
        pulseClass = 'pin-pulse-coral';
      } else if (h.severity === 'medium') {
        pinColor = '#FBBF24';
      }

      // Create Custom SVG Marker Icon
      const customIcon = L.divIcon({
        className: 'custom-hazard-pin',
        html: `
          <div class="relative flex items-center justify-center cursor-pointer ${pulseClass}" style="width: 32px; height: 32px;">
            <div style="background-color: ${pinColor}; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.25); border: 2.5px solid #FFFFFF;">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
            </div>
            <div style="position: absolute; bottom: -4px; width: 6px; height: 6px; background-color: ${pinColor}; transform: rotate(45deg);"></div>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32],
      });

      const marker = L.marker([h.lat, h.lon], { icon: customIcon });

      // Clean Popup on Click
      const wardName = wards.find((w) => w.id === h.wardId)?.name || 'Corridor';
      const popupHtml = `
        <div style="font-family: 'Inter', sans-serif; padding: 4px; min-width: 180px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
            <span style="font-weight: 800; font-size: 13px; color: #0F2A2E;">#${h.id.toUpperCase()}</span>
            <span style="font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 9999px; background: ${pinColor}25; color: ${pinColor}; text-transform: uppercase;">
              ${h.status === 'repaired' ? 'Repaired' : h.severity}
            </span>
          </div>
          <p style="font-size: 11px; color: #5B7479; margin: 0 0 6px 0;">${wardName}</p>
          <div style="font-size: 11px; color: #334155; line-height: 1.5; margin-bottom: 8px;">
            Area: <b>${h.estimatedAreaM2} m²</b> · Depth: <b>${h.estimatedDepthCm || Math.round(h.estimatedAreaM2 * 14)} cm</b><br/>
            Speed: <b>${h.speedKmh} km/h</b> · Sightings: <b>${h.verificationCount}x</b>
          </div>
          ${h.status === 'repaired' ? `
            <div style="margin-bottom: 8px; padding: 4px 6px; background: #ECFDF5; border: 1px solid #A7F3D0; border-radius: 6px; font-size: 10px; color: #047857; font-weight: 700; text-align: center;">
              ✓ 12-Device Quorum: Certified Safe
            </div>
          ` : ''}
          <button id="inspect-btn-${h.id}" style="width: 100%; background: #0D9488; color: #FFFFFF; font-size: 11px; font-weight: 700; padding: 6px 0; border: none; border-radius: 8px; cursor: pointer;">
            Inspect & Issue Ticket
          </button>
        </div>
      `;

      marker.bindPopup(popupHtml);

      marker.on('popupopen', () => {
        const btn = document.getElementById(`inspect-btn-${h.id}`);
        if (btn) {
          btn.onclick = () => {
            setSelectedHazard(h);
            marker.closePopup();
          };
        }
      });

      marker.addTo(markersLayerRef.current!);
    });
  }, [filteredHazards, activeSeverityPill, wards, setSelectedHazard]);

  const handleCenterMysore = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(MYSURU_CENTER, 13, { duration: 1.2 });
    }
  };

  return (
    <div className="relative h-[calc(100vh-4rem)] w-full overflow-hidden bg-slate-100">
      {/* Map Canvas */}
      <div ref={mapContainerRef} className="h-full w-full z-0" />

      {/* Floating Top Controls Bar */}
      <div className="absolute top-4 left-4 z-10 flex flex-wrap items-center gap-2">
        {/* Severity Quick Pills */}
        <div className="bg-white/95 backdrop-blur-md p-1 rounded-2xl border border-[#D8EEEA] shadow-lg flex items-center gap-1">
          {[
            { id: 'all', label: 'All Hazards' },
            { id: 'critical', label: 'Critical (>70)' },
            { id: 'medium', label: 'Moderate' },
            { id: 'low', label: 'Minor' },
          ].map((pill) => (
            <button
              key={pill.id}
              onClick={() => setActiveSeverityPill(pill.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeSeverityPill === pill.id
                  ? 'bg-[#0D9488] text-white shadow-sm'
                  : 'text-[#5B7479] hover:bg-gray-100'
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>

        {/* Layer Toggles */}
        <div className="bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-[#D8EEEA] shadow-lg flex items-center gap-3 text-xs font-semibold text-[#0F2A2E]">
          <label className="flex items-center gap-1.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showSurveyedRoads}
              onChange={(e) => setShowSurveyedRoads(e.target.checked)}
              className="rounded text-[#10B981] focus:ring-[#10B981]"
            />
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#10B981]" />
              Surveyed Roads ({totalSurveyedKm} km)
            </span>
          </label>
          <span className="text-gray-300">|</span>
          <label className="flex items-center gap-1.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showWardPolygons}
              onChange={(e) => setShowWardPolygons(e.target.checked)}
              className="rounded text-[#0D9488] focus:ring-[#0D9488]"
            />
            <span>Ward Zones</span>
          </label>
        </div>

        {/* Recenter Button */}
        <button
          onClick={handleCenterMysore}
          className="p-2.5 rounded-2xl bg-white/95 backdrop-blur-md border border-[#D8EEEA] shadow-lg text-[#0F2A2E] hover:bg-white active:scale-95 transition-all"
          title="Recenter Map on Mysuru"
        >
          <Compass className="w-4 h-4 text-[#0D9488]" />
        </button>
      </div>

      {/* Floating Legend Card (Bottom Left) */}
      <div className="absolute bottom-6 left-6 z-10 bg-white/95 backdrop-blur-md p-3.5 rounded-2xl border border-[#D8EEEA] shadow-xl text-xs space-y-2 max-w-xs">
        <span className="font-heading font-bold text-xs text-[#0F2A2E] block">
          Road Survey & Hazard Legend
        </span>
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-emerald-800 pb-1 border-b border-gray-100">
            <span className="w-3 h-1.5 rounded-full bg-[#10B981]" />
            <span className="font-bold">Surveyed Road (Inspected)</span>
          </div>
          <div className="flex items-center gap-2 text-slate-500 pb-1 border-b border-gray-100">
            <span className="w-3 h-1.5 rounded-full border border-slate-400 bg-transparent" />
            <span className="font-semibold">Unsurveyed Road (Blank)</span>
          </div>
          <div className="flex items-center gap-2 text-rose-700">
            <span className="w-3 h-3 rounded-full bg-[#FB7185] animate-ping" />
            <span className="font-semibold">Critical Hazard (Score &ge; 70)</span>
          </div>
          <div className="flex items-center gap-2 text-amber-700">
            <span className="w-3 h-3 rounded-full bg-[#FBBF24]" />
            <span className="font-semibold">Moderate Defect (40 &ndash; 69)</span>
          </div>
          <div className="flex items-center gap-2 text-emerald-700">
            <span className="w-3 h-3 rounded-full bg-[#34D399]" />
            <span className="font-semibold">Minor / Repaired Section</span>
          </div>
        </div>
        <p className="text-[10px] text-[#5B7479] pt-1 border-t border-gray-100">
          Showing {filteredHazards.length} mapped hazards across {totalSurveyedKm} km of surveyed roads in Mysuru.
        </p>
      </div>

      {/* Slideover Detail Panel */}
      {selectedHazard && (
        <HazardDetailSlideover
          hazard={selectedHazard}
          onClose={() => setSelectedHazard(null)}
        />
      )}
    </div>
  );
};
