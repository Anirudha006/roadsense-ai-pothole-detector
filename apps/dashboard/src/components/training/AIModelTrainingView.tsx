import React, { useState } from 'react';
import {
  BrainCircuit,
  Cloud,
  Download,
  Sparkles,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCcw,
  ExternalLink,
  Code,
  Layers,
  Database,
  Search,
  Filter,
  X,
  Compass,
  Gauge,
} from 'lucide-react';
import { useHazards } from '../../context/HazardContext';
import type { TrainingImageRecord } from '../../types';

export const AIModelTrainingView: React.FC = () => {
  const {
    trainingImages,
    stats,
    syncAllToCloud,
    isSyncingCloud,
    triggerRetraining,
    isRetraining,
    exportYoloDataset,
    setActiveTab,
    setFilters,
  } = useHazards();

  const [selectedImage, setSelectedImage] = useState<TrainingImageRecord | null>(null);
  const [showSqlModal, setShowSqlModal] = useState<boolean>(false);
  const [retrainResult, setRetrainResult] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');

  const filteredImages = trainingImages.filter((img) => {
    if (selectedSeverity !== 'all' && img.severity !== selectedSeverity) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        img.id.toLowerCase().includes(q) ||
        img.hazardId.toLowerCase().includes(q) ||
        img.areaName.toLowerCase().includes(q) ||
        img.lat.toString().includes(q) ||
        img.lon.toString().includes(q);
      if (!match) return false;
    }
    return true;
  });

  const handleRetrain = async () => {
    const res = await triggerRetraining();
    setRetrainResult(res.message);
    setTimeout(() => setRetrainResult(null), 6000);
  };

  const handleViewOnMap = (img: TrainingImageRecord) => {
    setFilters((prev) => ({ ...prev, searchQuery: img.hazardId }));
    setActiveTab('map');
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto select-none">
      {/* Top Header */}
      <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 rounded-3xl p-6 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-teal-800/40">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 text-xs font-bold uppercase tracking-wider border border-teal-500/30">
              Active Learning Pipeline · Team Number: 07
            </span>
            <span className="text-xs text-teal-300 font-mono">YOLO11n Edge &rarr; Cloud Retraining</span>
          </div>
          <h1 className="font-heading text-2xl md:text-3xl font-extrabold tracking-tight">
            AI Model Training Dataset &amp; Cloud GPS Pipeline
          </h1>
          <p className="text-xs text-teal-100 max-w-2xl mt-1">
            Every photo of detected potholes is automatically tagged with precise GPS coordinates (Latitude, Longitude, Heading, Speed) and synced to the cloud storage bucket for continuous backend model retraining.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={syncAllToCloud}
            disabled={isSyncingCloud}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-md active:scale-95 transition-all disabled:opacity-50"
            title="Upload any pending pothole photos to Supabase Cloud Storage"
          >
            <Cloud className={`w-4 h-4 ${isSyncingCloud ? 'animate-bounce' : ''}`} />
            <span>{isSyncingCloud ? 'Pushing to Cloud...' : 'Sync to Cloud Bucket'}</span>
          </button>

          <button
            onClick={handleRetrain}
            disabled={isRetraining}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white font-bold text-xs shadow-md active:scale-95 transition-all disabled:opacity-50"
            title="Trigger fine-tuning of YOLO11n on this dataset in the cloud backend"
          >
            <BrainCircuit className={`w-4 h-4 ${isRetraining ? 'animate-spin' : ''}`} />
            <span>{isRetraining ? 'Fine-Tuning YOLO11...' : 'Trigger Retraining'}</span>
          </button>

          <button
            onClick={exportYoloDataset}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 active:scale-95 transition-all"
            title="Download complete YOLO dataset archive with .txt label files"
          >
            <Download className="w-4 h-4" />
            <span>Export YOLO Dataset</span>
          </button>

          <button
            onClick={() => setShowSqlModal(true)}
            className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-teal-200 border border-white/20 transition-all"
            title="View Cloud Backend Schema & Connection Guide"
          >
            <Code className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Retraining Notification Banner */}
      {retrainResult && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center justify-between shadow-sm animate-in fade-in">
          <div className="flex items-center gap-2.5 font-medium">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span>{retrainResult}</span>
          </div>
          <button
            onClick={() => setRetrainResult(null)}
            className="text-emerald-700 hover:text-emerald-900"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 4 Pipeline Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Training Photos */}
        <div className="bg-white p-5 rounded-2xl border border-[#D8EEEA] shadow-sm">
          <div className="flex items-center justify-between text-[#5B7479] mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#0D9488]">Captured Photos</span>
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-[#0D9488] flex items-center justify-center font-bold">
              <Database className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-heading font-extrabold text-[#0F2A2E]">
              {trainingImages.length}
            </span>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              100% Tagged
            </span>
          </div>
          <p className="text-xs text-[#5B7479] mt-2">Every photo bound to hardware GPS coordinates</p>
        </div>

        {/* Card 2: Cloud Storage Synced */}
        <div className="bg-white p-5 rounded-2xl border border-[#D8EEEA] shadow-sm">
          <div className="flex items-center justify-between text-[#5B7479] mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-600">Cloud Storage Sync</span>
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
              <Cloud className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-heading font-extrabold text-[#0F2A2E]">
              {stats.cloudSyncedPhotosCount}
            </span>
            <span className="text-xs font-semibold text-[#5B7479]">/ {trainingImages.length}</span>
            <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full ml-auto">
              Supabase S3
            </span>
          </div>
          <p className="text-xs text-[#5B7479] mt-2">Stored in bucket: <code className="text-[10px] text-teal-800 font-mono">pothole-training-images</code></p>
        </div>

        {/* Card 3: GPS Telemetry Quality */}
        <div className="bg-white p-5 rounded-2xl border border-[#D8EEEA] shadow-sm">
          <div className="flex items-center justify-between text-[#5B7479] mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">GPS EXIF Precision</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <MapPin className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-heading font-extrabold text-[#0F2A2E]">
              &plusmn;1.4m
            </span>
            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
              RTK Grade
            </span>
          </div>
          <p className="text-xs text-[#5B7479] mt-2">Includes Lat, Lon, Altitude, Heading &amp; Speed</p>
        </div>

        {/* Card 4: Retraining Readiness */}
        <div className="bg-white p-5 rounded-2xl border border-[#D8EEEA] shadow-sm">
          <div className="flex items-center justify-between text-[#5B7479] mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600">YOLO Format Labels</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <BrainCircuit className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-heading font-extrabold text-amber-600">
              Ready
            </span>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              100% Annotated
            </span>
          </div>
          <p className="text-xs text-[#5B7479] mt-2">Normalized bounding boxes ready for training</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#D8EEEA] shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex-1 max-w-md relative w-full">
          <Search className="w-4 h-4 text-[#5B7479] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by pothole ID, area, or GPS coordinate..."
            className="w-full pl-10 pr-4 py-2 bg-[#F4FBFA] border border-[#D8EEEA] rounded-xl text-xs text-[#0F2A2E] placeholder-[#5B7479] focus:outline-none focus:ring-2 focus:ring-[#14B8A6]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-2 text-xs">
            <Filter className="w-3.5 h-3.5 text-[#5B7479]" />
            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              aria-label="Filter by Severity"
              className="bg-[#F4FBFA] border border-[#D8EEEA] rounded-xl px-3 py-1.5 text-xs font-semibold text-[#0F2A2E] focus:outline-none focus:ring-2 focus:ring-[#14B8A6]"
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical Only (&gt;5cm)</option>
              <option value="medium">Medium Only</option>
              <option value="low">Low Severity</option>
            </select>
          </div>

          <span className="text-xs text-[#5B7479] font-medium ml-auto sm:ml-0">
            Showing {filteredImages.length} training photos
          </span>
        </div>
      </div>

      {/* Photo Training Gallery Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredImages.map((record) => {
          const isCrit = record.severity === 'critical';
          const isMed = record.severity === 'medium';
          const sevBadgeColor = isCrit
            ? 'bg-rose-100 text-rose-700 border-rose-200'
            : isMed
            ? 'bg-amber-100 text-amber-800 border-amber-200'
            : 'bg-emerald-100 text-emerald-800 border-emerald-200';

          return (
            <div
              key={record.id}
              className="bg-white rounded-2xl border border-[#D8EEEA] shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col group"
            >
              {/* Photo Container with GPS Watermark Overlay */}
              <div
                className="relative h-48 bg-slate-950 overflow-hidden cursor-pointer"
                onClick={() => setSelectedImage(record)}
              >
                <img
                  src={record.imageUrl}
                  alt={`Pothole ${record.hazardId}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />

                {/* Cloud Sync Status Badge */}
                <div className="absolute top-2.5 left-2.5 flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-900/80 backdrop-blur-md text-[10px] font-bold text-teal-300 border border-teal-500/30">
                  <Cloud className="w-3 h-3 text-teal-400" />
                  <span>Cloud Synced</span>
                </div>

                {/* Severity Badge */}
                <div
                  className={`absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${sevBadgeColor}`}
                >
                  {record.severity}
                </div>
              </div>

              {/* Card Meta Content */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-heading font-extrabold text-[#0F2A2E]">
                      {record.hazardId}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-teal-50 text-[#0D9488]">
                      Conf: {Math.round(record.confidence * 100)}%
                    </span>
                  </div>
                  <p className="text-[11px] text-[#5B7479] truncate font-medium">
                    {record.areaName}
                  </p>
                </div>

                {/* GPS Tag Box */}
                <div className="p-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-1.5 text-[11px]">
                  <div className="flex items-center gap-1.5 text-[#0F2A2E] font-mono font-bold">
                    <MapPin className="w-3.5 h-3.5 text-rose-500 flex-shrink-0" />
                    <span className="truncate">
                      Lat: {record.lat.toFixed(6)}, Lon: {record.lon.toFixed(6)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-[#5B7479]">
                    <span className="flex items-center gap-1">
                      <Gauge className="w-3 h-3 text-teal-600" />
                      {record.speedKmh} km/h
                    </span>
                    <span className="flex items-center gap-1">
                      <Compass className="w-3 h-3 text-indigo-600" />
                      {record.heading}&deg;
                    </span>
                    <span>Alt: {record.altitude}m</span>
                  </div>
                </div>

                {/* Cloud & YOLO Tag Meta */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-[#5B7479]">
                    <span>YOLO Bounding Box:</span>
                    <span className="font-mono text-[#0F2A2E] font-semibold">
                      {record.yoloAnnotation}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-[#5B7479] truncate">
                    <span>Storage URL:</span>
                    <span className="font-mono text-teal-700 truncate max-w-[170px]" title={record.cloudStorageUrl}>
                      {record.cloudStorageUrl}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-2 border-t border-[#D8EEEA] flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleViewOnMap(record)}
                    className="flex-1 py-1.5 px-2 rounded-xl bg-teal-50 hover:bg-[#0D9488] text-[#0D9488] hover:text-white font-bold text-[11px] border border-teal-200 transition-all flex items-center justify-center gap-1"
                  >
                    <MapPin className="w-3 h-3" />
                    <span>View on Map</span>
                  </button>

                  <button
                    onClick={() => setSelectedImage(record)}
                    className="py-1.5 px-3 rounded-xl bg-gray-50 hover:bg-gray-100 text-[#0F2A2E] font-bold text-[11px] border border-gray-200 transition-all"
                  >
                    Inspect
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Inspection Modal for Selected Pothole */}
      {selectedImage && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full border border-[#D8EEEA] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-[#D8EEEA] flex items-center justify-between bg-[#F8FAFC]">
              <div className="flex items-center gap-2">
                <BrainCircuit className="w-5 h-5 text-[#0D9488]" />
                <span className="font-heading font-extrabold text-sm text-[#0F2A2E]">
                  AI Training Image Inspection · {selectedImage.hazardId}
                </span>
              </div>
              <button
                onClick={() => setSelectedImage(null)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="relative rounded-2xl overflow-hidden border border-gray-200 bg-slate-950">
                <img
                  src={selectedImage.imageUrl}
                  alt={selectedImage.hazardId}
                  className="w-full h-64 object-cover"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-[#F4FBFA] border border-[#D8EEEA]">
                  <span className="text-[10px] font-bold uppercase text-[#5B7479] block mb-1">
                    GPS Coordinates
                  </span>
                  <div className="font-mono font-bold text-[#0F2A2E]">
                    {selectedImage.lat.toFixed(6)}, {selectedImage.lon.toFixed(6)}
                  </div>
                  <span className="text-[10px] text-[#0D9488]">Altitude: {selectedImage.altitude}m</span>
                </div>

                <div className="p-3 rounded-xl bg-[#F4FBFA] border border-[#D8EEEA]">
                  <span className="text-[10px] font-bold uppercase text-[#5B7479] block mb-1">
                    Vehicle Kinematics
                  </span>
                  <div className="font-bold text-[#0F2A2E]">
                    Speed: {selectedImage.speedKmh} km/h · Heading: {selectedImage.heading}&deg;
                  </div>
                  <span className="text-[10px] text-[#5B7479]">Confidence: {Math.round(selectedImage.confidence * 100)}%</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 text-white font-mono text-xs space-y-1">
                <div className="text-[10px] text-teal-400 font-bold uppercase">
                  YOLOv11 Annotation Format (&lt;class&gt; &lt;x_center&gt; &lt;y_center&gt; &lt;w&gt; &lt;h&gt;)
                </div>
                <div className="bg-slate-950 p-2 rounded-lg text-amber-300">
                  {selectedImage.yoloAnnotation}
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-[11px] text-[#5B7479] font-mono">
                  Cloud: {selectedImage.cloudStorageUrl}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      handleViewOnMap(selectedImage);
                      setSelectedImage(null);
                    }}
                    className="px-4 py-2 rounded-xl bg-[#0D9488] text-white font-bold text-xs hover:bg-[#0f766e] transition-colors"
                  >
                    View on GIS Map
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SQL & Cloud Schema Modal */}
      {showSqlModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full border border-[#D8EEEA] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-[#D8EEEA] flex items-center justify-between bg-[#F8FAFC]">
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-[#0D9488]" />
                <span className="font-heading font-extrabold text-sm text-[#0F2A2E]">
                  Free Supabase Cloud Backend Setup &amp; Training Pipeline
                </span>
              </div>
              <button
                onClick={() => setShowSqlModal(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
              <p className="text-[#5B7479]">
                To deploy the free backend, create a project at <strong>supabase.com</strong> (100% free tier includes 500MB PostgreSQL, PostGIS spatial queries, and 1GB file storage). Run this SQL query in the Supabase SQL Editor:
              </p>

              <div className="bg-slate-950 text-emerald-400 p-4 rounded-2xl font-mono text-[11px] overflow-x-auto space-y-1">
                <div className="text-gray-500">-- 1. Enable PostGIS for geospatial indexing</div>
                <div>CREATE EXTENSION IF NOT EXISTS postgis;</div>
                <br />
                <div className="text-gray-500">-- 2. Create GPS-Tagged Pothole Training Table</div>
                <div>CREATE TABLE IF NOT EXISTS pothole_training_images (</div>
                <div className="pl-4">id UUID PRIMARY KEY DEFAULT gen_random_uuid(),</div>
                <div className="pl-4">hazard_id TEXT NOT NULL,</div>
                <div className="pl-4">image_url TEXT NOT NULL,</div>
                <div className="pl-4">gps_location GEOGRAPHY(POINT, 4326) NOT NULL,</div>
                <div className="pl-4">latitude DOUBLE PRECISION NOT NULL,</div>
                <div className="pl-4">longitude DOUBLE PRECISION NOT NULL,</div>
                <div className="pl-4">speed_kmh DOUBLE PRECISION,</div>
                <div className="pl-4">heading DOUBLE PRECISION,</div>
                <div className="pl-4">confidence REAL NOT NULL,</div>
                <div className="pl-4">yolo_label TEXT NOT NULL,</div>
                <div className="pl-4">created_at TIMESTAMPTZ DEFAULT NOW()</div>
                <div>);</div>
                <br />
                <div className="text-gray-500">-- 3. Create Storage Bucket for training photos</div>
                <div>INSERT INTO storage.buckets (id, name, public)</div>
                <div>VALUES ('pothole-training-images', 'pothole-training-images', true)</div>
                <div>ON CONFLICT (id) DO NOTHING;</div>
              </div>

              <div className="p-3 rounded-xl bg-teal-50 border border-teal-200 text-[#0D9488]">
                <strong>Continuous Training Hook:</strong> When new photos are uploaded, an automated GitHub Action or local worker runs <code>yolo train data=dataset.yaml model=yolo11n.pt epochs=50</code> and exports updated ONNX weights to the driver app!
              </div>

              <div className="text-right pt-2">
                <button
                  onClick={() => setShowSqlModal(false)}
                  className="px-5 py-2 rounded-xl bg-[#0D9488] text-white font-bold text-xs"
                >
                  Close Guide
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
