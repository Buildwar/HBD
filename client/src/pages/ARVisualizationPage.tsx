/**
 * AR / Real Space Visualization Page (Phase V22 / v1.22.0)
 * Allows visualizing HBD project designs, furniture twins, and technical infrastructure
 * directly onto physical rooms and physical space captures.
 * Copyright © 2026 Adrián Palma. Todos los derechos reservados.
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ARAnchorItem,
  ARCapabilityCheckResult,
  ARCalibrationResult,
  ARComparisonConfig,
  ARMeasurementItem,
  ARMode,
  ARSceneConfig,
} from '@hbd/shared';
import {
  Glasses,
  Plus,
  Ruler,
  Sliders,
  Image as ImageIcon,
  Save,
  ArrowLeft,
  RefreshCw,
  Eye,
  CheckCircle2,
  FolderOpen,
} from 'lucide-react';
import { ARVisualizationService } from '../services/arVisualization.service';
import { ARCapabilityBanner } from '../features/ar-visualization/ARCapabilityBanner';
import { ARViewportCanvas } from '../features/ar-visualization/ARViewportCanvas';
import { ARAnchorList } from '../features/ar-visualization/ARAnchorList';
import { ARComparisonSlider } from '../features/ar-visualization/ARComparisonSlider';
import { ARMeasurementTool } from '../features/ar-visualization/ARMeasurementTool';
import { ARCalibrationModal } from '../features/ar-visualization/ARCalibrationModal';

export const ARVisualizationPage: React.FC = () => {
  const { t } = useTranslation();
  const { id: routeProjectId } = useParams<{ id?: string }>();
  const navigate = useNavigate();

  // Active State
  const [projectId, setProjectId] = useState<string>(routeProjectId || 'default-project');
  const [projects, setProjects] = useState<any[]>([]);
  const [capabilities, setCapabilities] = useState<ARCapabilityCheckResult | null>(null);
  const [currentMode, setCurrentMode] = useState<ARMode>('AR_PREVIEW');
  const [activeTab, setActiveTab] = useState<'VIEWPORT' | 'COMPARISON' | 'MEASUREMENTS'>('VIEWPORT');

  // Scene Data
  const [sceneId, setSceneId] = useState<string | null>(null);
  const [sceneName, setSceneName] = useState<string>(t('ar.defaultSceneName'));
  const [anchors, setAnchors] = useState<ARAnchorItem[]>([
    {
      id: 'anc_sofa_1',
      targetType: 'FURNITURE',
      name: t('ar.defaultFurnitureName'),
      surfaceType: 'FLOOR',
      position: { x: 0, y: 0, z: 0 },
      rotation: { pitch: 0, yaw: 0, roll: 0 },
      scale: { x: 2.28, y: 0.83, z: 0.95 },
      isConfirmed: true,
      provenance: 'RETAIL_IMPORTED_GLTF',
      hasCollisions: false,
    },
    {
      id: 'anc_ap_wifi_1',
      targetType: 'TECHNICAL_ELEMENT',
      name: t('ar.defaultTechName'),
      surfaceType: 'CEILING',
      position: { x: 0, y: 2.5, z: 0 },
      rotation: { pitch: 0, yaw: 0, roll: 0 },
      scale: { x: 0.22, y: 0.05, z: 0.22 },
      isConfirmed: true,
      provenance: 'PARAMETRIC_GENERATED',
      hasCollisions: false,
    },
  ]);
  const [selectedAnchorId, setSelectedAnchorId] = useState<string | null>('anc_sofa_1');
  const [measurements, setMeasurements] = useState<ARMeasurementItem[]>([]);
  const [comparisonConfig, setComparisonConfig] = useState<ARComparisonConfig>({
    mode: 'BEFORE_AFTER_SLIDER',
    sliderPosition: 50,
    overlayOpacity: 0.85,
    showWireframeOverlay: false,
    showTechnicalInfrastructure: true,
  });

  // Photo backdrops
  const [realSpaceImageUrl, setRealSpaceImageUrl] = useState<string>('');
  const [virtualRenderUrl, setVirtualRenderUrl] = useState<string>('');
  const [captures, setCaptures] = useState<any[]>([]);

  // Modals
  const [isCalibrationOpen, setIsCalibrationOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Initial capability check and project load
  useEffect(() => {
    checkCapabilities();
    loadProjects();
  }, []);

  const checkCapabilities = async () => {
    try {
      const caps = await ARVisualizationService.detectCapabilities();
      setCapabilities(caps);
      if (caps && caps.recommendedMode) {
        setCurrentMode(caps.recommendedMode);
      }
    } catch (err) {
      console.error('Failed to detect AR capabilities', err);
    }
  };

  const loadProjects = async () => {
    try {
      const res = await fetch('/api/projects');
      const json = await res.json();
      if (json.data && Array.isArray(json.data) && json.data.length > 0) {
        setProjects(json.data);
        if (!routeProjectId) {
          setProjectId(json.data[0].id);
        }
      }
    } catch (err) {
      console.warn('Could not fetch projects list', err);
    }
  };

  const handleAddCustomAnchor = (type: 'FURNITURE' | 'TECHNICAL_ELEMENT') => {
    const id = `anc_${Date.now()}`;
    const newAnchor: ARAnchorItem = {
      id,
      targetType: type,
      name: type === 'FURNITURE' ? t('ar.customFurnitureName') : t('ar.customTechName'),
      surfaceType: type === 'FURNITURE' ? 'FLOOR' : 'WALL',
      position: { x: (Math.random() - 0.5) * 2, y: type === 'FURNITURE' ? 0 : 0.3, z: (Math.random() - 0.5) * 2 },
      rotation: { pitch: 0, yaw: 0, roll: 0 },
      scale: type === 'FURNITURE' ? { x: 1.2, y: 0.45, z: 0.7 } : { x: 0.16, y: 0.08, z: 0.05 },
      isConfirmed: false,
      provenance: 'PARAMETRIC_GENERATED',
    };

    setAnchors((prev) => [...prev, newAnchor]);
    setSelectedAnchorId(id);
    showNotice(t('ar.elementAdded', { name: newAnchor.name }));
  };

  const handleDeleteAnchor = (id: string) => {
    setAnchors((prev) => prev.filter((a) => a.id !== id));
    if (selectedAnchorId === id) setSelectedAnchorId(null);
  };

  const handleToggleConfirm = (id: string) => {
    setAnchors((prev) =>
      prev.map((a) => (a.id === id ? { ...a, isConfirmed: !a.isConfirmed } : a))
    );
  };

  const handleCalibrationComplete = (res: ARCalibrationResult) => {
    showNotice(t('ar.calibrationApplied', { scale: (res.scaleFactor * 100).toFixed(1), quality: res.quality }));
    setIsCalibrationOpen(false);
  };

  const handleCaptureSnapshot = async (dataUrl: string) => {
    try {
      const newCapture = {
        id: `cap_${Date.now()}`,
        imageUrl: dataUrl,
        title: t('ar.snapshotTitle', { time: new Date().toLocaleTimeString() }),
        createdAt: new Date().toISOString(),
      };
      setCaptures((prev) => [newCapture, ...prev]);
      showNotice(t('ar.snapshotSaved'));
    } catch (err) {
      console.error('Error saving capture', err);
    }
  };

  const showNotice = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-4 sm:p-6 lg:p-8">
      {/* Top Header */}
      <div className="max-w-7xl mx-auto mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-750 transition-colors shadow-sm"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <Glasses className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
                {t('ar.title')}
              </h1>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {t('ar.subtitle')}
            </p>
          </div>
        </div>

        {/* Project Selector & Actions */}
        <div className="flex items-center gap-3 flex-wrap">
          {projects.length > 0 && (
            <select
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className="px-3 py-2 text-xs font-medium bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm text-gray-800 dark:text-gray-200"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          )}

          <button
            onClick={() => setIsCalibrationOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-medium shadow-sm transition-colors"
          >
            <Ruler className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            {t('ar.calibrateScale')}
          </button>

          <button
            onClick={() => showNotice(t('ar.sceneSaved'))}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors"
          >
            <Save className="w-4 h-4" />
            {t('ar.saveScene')}
          </button>
        </div>
      </div>

      {/* Notification toast */}
      {notification && (
        <div className="max-w-7xl mx-auto mb-4 p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-900 dark:text-indigo-200 text-xs font-medium flex items-center justify-between shadow-sm animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
            <span>{notification}</span>
          </div>
          <button onClick={() => setNotification(null)} className="text-xs opacity-75 hover:opacity-100">
            {t('common.close')}
          </button>
        </div>
      )}

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Capability Banner */}
        <ARCapabilityBanner
          capabilities={capabilities}
          currentMode={currentMode}
          onModeSelect={setCurrentMode}
          onRefreshCapabilities={checkCapabilities}
        />

        {/* View Selection Tabs */}
        <div className="flex items-center gap-2 border-b border-gray-200 dark:border-gray-700 pb-2">
          <button
            onClick={() => setActiveTab('VIEWPORT')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'VIEWPORT'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            <Glasses className="w-4 h-4" />
            {t('ar.tabViewport')}
          </button>
          <button
            onClick={() => setActiveTab('COMPARISON')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'COMPARISON'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            <Sliders className="w-4 h-4" />
            {t('ar.tabComparison')}
          </button>
          <button
            onClick={() => setActiveTab('MEASUREMENTS')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'MEASUREMENTS'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            <Ruler className="w-4 h-4" />
            {t('ar.tabMeasurements')}
          </button>
        </div>

        {/* Tab 1: Proyección en Canvas AR */}
        {activeTab === 'VIEWPORT' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <ARViewportCanvas
                mode={currentMode}
                anchors={anchors}
                selectedAnchorId={selectedAnchorId}
                backgroundImageUrl={realSpaceImageUrl}
                onSelectAnchor={setSelectedAnchorId}
                onUpdateAnchorPosition={(id, pos) => {
                  setAnchors((prev) =>
                    prev.map((a) => (a.id === id ? { ...a, position: pos } : a))
                  );
                }}
                onCaptureSnapshot={handleCaptureSnapshot}
              />

              {/* Quick Placement Bar */}
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleAddCustomAnchor('FURNITURE')}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 rounded-lg text-xs font-semibold transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    {t('ar.projectFurniture')}
                  </button>
                  <button
                    onClick={() => handleAddCustomAnchor('TECHNICAL_ELEMENT')}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-lg text-xs font-semibold transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    {t('ar.projectTech')}
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder={t('ar.realSpaceUrlPlaceholder')}
                    value={realSpaceImageUrl}
                    onChange={(e) => setRealSpaceImageUrl(e.target.value)}
                    className="px-3 py-1.5 text-xs border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white w-64"
                  />
                  {realSpaceImageUrl && (
                    <button
                      onClick={() => setRealSpaceImageUrl('')}
                      className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                    >
                      {t('common.clear')}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Right sidebar: Anchors list */}
            <div className="space-y-4">
              <ARAnchorList
                anchors={anchors}
                selectedAnchorId={selectedAnchorId}
                onSelectAnchor={setSelectedAnchorId}
                onDeleteAnchor={handleDeleteAnchor}
                onToggleConfirm={handleToggleConfirm}
              />
            </div>
          </div>
        )}

        {/* Tab 2: Comparativa Antes / Después */}
        {activeTab === 'COMPARISON' && (
          <div className="space-y-6">
            <ARComparisonSlider
              config={comparisonConfig}
              onChange={(updates) => setComparisonConfig((prev) => ({ ...prev, ...updates }))}
              realImageUrl={realSpaceImageUrl}
              virtualRenderUrl={virtualRenderUrl}
            />

            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  {t('ar.realPhotoUrl')}
                </label>
                <input
                  type="text"
                  value={realSpaceImageUrl}
                  onChange={(e) => setRealSpaceImageUrl(e.target.value)}
                  placeholder={t('ar.realPhotoPlaceholder')}
                  className="w-full px-3 py-2 text-xs border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  {t('ar.virtualRenderUrl')}
                </label>
                <input
                  type="text"
                  value={virtualRenderUrl}
                  onChange={(e) => setVirtualRenderUrl(e.target.value)}
                  placeholder={t('ar.virtualRenderPlaceholder')}
                  className="w-full px-3 py-2 text-xs border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Medición de Espacios */}
        {activeTab === 'MEASUREMENTS' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <ARMeasurementTool
                measurements={measurements}
                onAddMeasurement={(m) => setMeasurements((prev) => [...prev, m])}
                onDeleteMeasurement={(id) => setMeasurements((prev) => prev.filter((m) => m.id !== id))}
              />
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                {t('ar.measurementGuideTitle')}
              </h4>
              <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                {t('ar.measurementGuideDesc')}
              </p>
            </div>
          </div>
        )}

        {/* Captures Gallery */}
        {captures.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              {t('ar.snapshotGallery', { count: captures.length })}
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {captures.map((cap) => (
                <div key={cap.id} className="group relative rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 aspect-video bg-black">
                  <img src={cap.imageUrl} alt={cap.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                    <p className="text-[10px] text-white font-medium truncate">{cap.title}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Metric Calibration Modal */}
      <ARCalibrationModal
        isOpen={isCalibrationOpen}
        onClose={() => setIsCalibrationOpen(false)}
        onCalibrationComplete={handleCalibrationComplete}
      />
    </div>
  );
};

export default ARVisualizationPage;
