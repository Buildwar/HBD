/**
 * HBD — HOME BOARD DESIGNER
 * Technical Infrastructure & Smart Home Master Page (Phase V21 / 1.21.0)
 * Autor: Adrián Palma
 * Copyright: © 2026 Adrián Palma. Todos los derechos reservados.
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  TechnicalCategory,
  TechnicalElementDto,
  TechnicalConnectionDto,
  TechnicalZoneDto,
  TechnicalSummaryDto,
  WiFiCoverageAnalysisDto,
  TechnicalValidationResultDto
} from '@hbd/shared';
import { technicalInfrastructureService } from '../services/technicalInfrastructure.service.js';
import { projectService } from '../services/project.service.js';
import { TechnicalLayerControl, TECHNICAL_LAYERS } from '../features/technical-infrastructure/TechnicalLayerControl.js';
import { TechnicalElementPalette, ElementTemplate } from '../features/technical-infrastructure/TechnicalElementPalette.js';
import { TechnicalPropertiesPanel } from '../features/technical-infrastructure/TechnicalPropertiesPanel.js';
import { WiFiHeatmapOverlay } from '../features/technical-infrastructure/WiFiHeatmapOverlay.js';
import { TechnicalValidationModal } from '../features/technical-infrastructure/TechnicalValidationModal.js';
import { TechnicalConnectionsViewer } from '../features/technical-infrastructure/TechnicalConnectionsViewer.js';
import {
  Cpu,
  Zap,
  Wifi,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  FolderOpen,
  Eye,
  Layers,
  Activity,
  Maximize2
} from 'lucide-react';

export const TechnicalInfrastructurePage: React.FC = () => {
  const { t } = useTranslation();
  const { projectId: routeProjectId } = useParams<{ projectId?: string }>();
  const navigate = useNavigate();

  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Datos técnicos
  const [elements, setElements] = useState<TechnicalElementDto[]>([]);
  const [connections, setConnections] = useState<TechnicalConnectionDto[]>([]);
  const [zones, setZones] = useState<TechnicalZoneDto[]>([]);
  const [summary, setSummary] = useState<TechnicalSummaryDto | null>(null);
  const [wifiCoverage, setWifiCoverage] = useState<WiFiCoverageAnalysisDto | null>(null);
  const [validation, setValidation] = useState<TechnicalValidationResultDto | null>(null);

  // Estados de interfaz
  const [activeLayers, setActiveLayers] = useState<Set<TechnicalCategory>>(
    new Set<TechnicalCategory>([
      'ELECTRICAL',
      'LIGHTING',
      'NETWORK',
      'WIFI',
      'SMART_HOME',
      'SECURITY',
      'HVAC',
      'PLUMBING',
      'MULTIMEDIA',
      'TECHNICAL_ROOM'
    ])
  );
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [isValidationModalOpen, setIsValidationModalOpen] = useState(false);
  const [activeCenterTab, setActiveCenterTab] = useState<'2D_VIEW' | 'WIFI_HEATMAP' | 'CONNECTIONS'>('2D_VIEW');

  // Cargar proyectos
  useEffect(() => {
    const loadProjects = async () => {
      try {
        const res = await projectService.getProjects();
        const list = res.data || [];
        setProjects(list);
        if (routeProjectId) {
          setSelectedProjectId(routeProjectId);
        } else if (list.length > 0) {
          setSelectedProjectId(list[0].id);
        }
      } catch (err) {
        console.error('Error loading projects:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadProjects();
  }, [routeProjectId]);

  // Cargar datos de infraestructura al seleccionar proyecto
  const loadInfrastructureData = async (projId: string) => {
    if (!projId) return;
    setIsRefreshing(true);
    try {
      const [elList, conList, zoneList, sum, val] = await Promise.all([
        technicalInfrastructureService.getElements(projId),
        technicalInfrastructureService.getConnections(projId),
        technicalInfrastructureService.getZones(projId),
        technicalInfrastructureService.getSummary(projId),
        technicalInfrastructureService.validateInfrastructure(projId)
      ]);

      setElements(elList);
      setConnections(conList);
      setZones(zoneList);
      setSummary(sum);
      setValidation(val);

      if (elList.length > 0 && !selectedElementId) {
        setSelectedElementId(elList[0].id);
      }
    } catch (err) {
      console.error('Error loading infrastructure data:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (selectedProjectId) {
      loadInfrastructureData(selectedProjectId);
    }
  }, [selectedProjectId]);

  // Manejar creación rápida desde plantilla
  const handleSelectTemplate = async (tpl: ElementTemplate) => {
    if (!selectedProjectId) return;
    try {
      const newEl = await technicalInfrastructureService.createElement(selectedProjectId, {
        projectId: selectedProjectId,
        name: tpl.name,
        category: tpl.category,
        mountingType: tpl.mountingType,
        position: { x: 2.0, y: 2.0, z: tpl.defaultZ },
        powerWatts: tpl.powerWatts,
        voltage: tpl.voltage,
        circuitId: tpl.circuitId,
        ipRating: tpl.ipRating,
        poePowered: tpl.poePowered,
        autoSync: true
      });

      setElements((prev) => [...prev, newEl]);
      setSelectedElementId(newEl.id);
      loadInfrastructureData(selectedProjectId);
    } catch (err) {
      console.error('Error adding technical element:', err);
    }
  };

  const handleUpdateElement = async (id: string, updates: Partial<TechnicalElementDto>) => {
    try {
      const updated = await technicalInfrastructureService.updateElement(id, updates as any);
      setElements((prev) => prev.map((e) => (e.id === id ? { ...e, ...updates } : e)));
      loadInfrastructureData(selectedProjectId);
    } catch (err) {
      console.error('Error updating technical element:', err);
    }
  };

  const handleDeleteElement = async (id: string) => {
    try {
      await technicalInfrastructureService.deleteElement(id);
      setElements((prev) => prev.filter((e) => e.id !== id));
      if (selectedElementId === id) {
        setSelectedElementId(null);
      }
      loadInfrastructureData(selectedProjectId);
    } catch (err) {
      console.error('Error deleting element:', err);
    }
  };

  const handleSyncElement = async (id: string) => {
    try {
      await technicalInfrastructureService.syncElement(id);
      await loadInfrastructureData(selectedProjectId);
    } catch (err) {
      console.error('Error syncing element:', err);
    }
  };

  const handleSimulateWiFi = async () => {
    if (!selectedProjectId) return;
    try {
      const res = await technicalInfrastructureService.simulateWiFiHeatmap(selectedProjectId);
      setWifiCoverage(res);
      setActiveCenterTab('WIFI_HEATMAP');
    } catch (err) {
      console.error('Error simulating Wi-Fi coverage:', err);
    }
  };

  const handleToggleLayer = (category: TechnicalCategory) => {
    setActiveLayers((prev) => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  const handleToggleAllLayers = (enable: boolean) => {
    if (enable) {
      setActiveLayers(new Set(TECHNICAL_LAYERS.map((l) => l.category)));
    } else {
      setActiveLayers(new Set());
    }
  };

  const selectedElement = elements.find((e) => e.id === selectedElementId);
  const visibleElements = elements.filter((e) => activeLayers.has(e.category));

  // Contadores por categoría
  const countsByCategory: Record<TechnicalCategory, number> = {
    ELECTRICAL: 0,
    LIGHTING: 0,
    NETWORK: 0,
    WIFI: 0,
    SMART_HOME: 0,
    SECURITY: 0,
    HVAC: 0,
    PLUMBING: 0,
    MULTIMEDIA: 0,
    TECHNICAL_ROOM: 0
  };
  elements.forEach((e) => {
    if (countsByCategory[e.category] !== undefined) {
      countsByCategory[e.category]++;
    }
  });

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] p-4 space-y-3 overflow-hidden bg-slate-950 text-slate-100 font-sans">
      {/* Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/80 backdrop-blur-md p-3.5 rounded-2xl border border-slate-800 shadow-xl shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 text-emerald-400">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-100 flex items-center gap-2">
              {t('technicalInfra.title')}
            </h1>
            <p className="text-xs text-slate-400">
              {t('technicalInfra.subtitle')}
            </p>
          </div>
        </div>

        {/* Project Selector & KPIs */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5">
            <FolderOpen className="w-4 h-4 text-slate-400" />
            <select
              value={selectedProjectId}
              onChange={(e) => {
                setSelectedProjectId(e.target.value);
                navigate(`/projects/${e.target.value}/infrastructure`);
              }}
              className="bg-transparent text-xs text-slate-200 focus:outline-none cursor-pointer"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id} className="bg-slate-900 text-slate-200">
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* KPI 1: Potencia Eléctrica */}
          <div className="px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center">
            <span className="text-[10px] text-amber-400/80 block font-medium">{t('technicalInfra.simultaneousPower')}</span>
            <span className="text-xs font-bold font-mono text-amber-300">
              {summary ? `${(summary.electricalSummary.totalDemandPowerWatts / 1000).toFixed(2)} kW` : '0.00 kW'}
            </span>
          </div>

          {/* KPI 2: Wi-Fi Cobertura */}
          <div className="px-3 py-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-center">
            <span className="text-[10px] text-cyan-400/80 block font-medium">{t('technicalInfra.wifiCoverage')}</span>
            <span className="text-xs font-bold font-mono text-cyan-300">
              {summary ? `${summary.wifiSummary.coveragePercentage}%` : '0%'}
            </span>
          </div>

          {/* KPI 3: Auditoría Normativa */}
          <button
            onClick={() => setIsValidationModalOpen(true)}
            className={`px-3 py-1.5 rounded-xl border flex items-center gap-2 transition-all ${
              validation?.isValid
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20'
                : 'bg-red-500/10 border-red-500/30 text-red-300 hover:bg-red-500/20'
            }`}
          >
            {validation?.isValid ? (
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-red-400" />
            )}
            <div className="text-left">
              <span className="text-[10px] block font-bold">
                {validation?.score ?? 100}/100 {t('technicalInfra.pts')}
              </span>
              <span className="text-[9px] opacity-80">
                {validation?.errorsCount ? `${validation.errorsCount} ${t('technicalInfra.errors')}` : t('technicalInfra.normOk')}
              </span>
            </div>
          </button>

          <button
            onClick={() => loadInfrastructureData(selectedProjectId)}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            title="Recargar datos"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Grid: 3 columns */}
      <div className="grid grid-cols-12 gap-3 flex-1 overflow-hidden min-h-0">
        {/* Left Column: Layers & Element Palette */}
        <div className="col-span-3 flex flex-col gap-3 h-full overflow-hidden">
          <TechnicalLayerControl
            activeLayers={activeLayers}
            countsByCategory={countsByCategory}
            onToggleLayer={handleToggleLayer}
            onToggleAll={handleToggleAllLayers}
          />
          <div className="flex-1 overflow-hidden">
            <TechnicalElementPalette onSelectTemplate={handleSelectTemplate} />
          </div>
        </div>

        {/* Center Column: 2D Plan View / Wi-Fi Simulation / Connections */}
        <div className="col-span-6 flex flex-col h-full bg-slate-900/90 backdrop-blur-md rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
          {/* Tabs bar */}
          <div className="flex items-center justify-between p-3 border-b border-slate-800 bg-slate-950/40">
            <div className="flex gap-1.5">
              <button
                onClick={() => setActiveCenterTab('2D_VIEW')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                  activeCenterTab === '2D_VIEW'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                {t('technicalInfra.tabs.2dPlan')} ({visibleElements.length})
              </button>
              <button
                onClick={handleSimulateWiFi}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                  activeCenterTab === 'WIFI_HEATMAP'
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <Wifi className="w-3.5 h-3.5" />
                {t('technicalInfra.tabs.wifiHeatmap')}
              </button>
              <button
                onClick={() => setActiveCenterTab('CONNECTIONS')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                  activeCenterTab === 'CONNECTIONS'
                    ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/40'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <Activity className="w-3.5 h-3.5" />
                {t('technicalInfra.tabs.connections')} ({connections.length})
              </button>
            </div>
          </div>

          {/* Canvas Area */}
          <div className="flex-1 p-4 overflow-y-auto flex items-center justify-center bg-slate-950/80 relative">
            {activeCenterTab === '2D_VIEW' && (
              <div className="w-full h-full flex flex-col">
                {/* 2D Schematic Canvas Mockup */}
                <div className="w-full h-full min-h-[350px] bg-slate-900/50 rounded-xl border border-slate-800/80 p-4 relative overflow-hidden flex flex-col justify-between">
                  {/* Grid lines background */}
                  <div
                    className="absolute inset-0 opacity-15 pointer-events-none"
                    style={{
                      backgroundImage: 'radial-gradient(circle, #38bdf8 1px, transparent 1px)',
                      backgroundSize: '24px 24px'
                    }}
                  />

                  <div className="relative z-10 flex items-center justify-between">
                    <span className="text-xs font-mono text-slate-400">
                      {t('technicalInfra.2d.viewTitle')}
                    </span>
                    <span className="text-[11px] text-emerald-400 font-mono">
                      {visibleElements.length} {t('technicalInfra.2d.visibleElements')}
                    </span>
                  </div>

                  {/* Elements scatter representation */}
                  <div className="relative z-10 grid grid-cols-3 gap-3 my-auto p-4 max-h-[300px] overflow-y-auto scrollbar-thin">
                    {visibleElements.map((el) => {
                      const isSelected = el.id === selectedElementId;
                      const layerMeta = TECHNICAL_LAYERS.find((l) => l.category === el.category);
                      const Icon = layerMeta?.icon || Cpu;

                      return (
                        <div
                          key={el.id}
                          onClick={() => setSelectedElementId(el.id)}
                          className={`p-2.5 rounded-xl border cursor-pointer transition-all flex items-center gap-2.5 ${
                            isSelected
                              ? 'bg-emerald-500/20 border-emerald-500 text-slate-100 shadow-lg scale-105'
                              : 'bg-slate-900/90 border-slate-800 hover:border-slate-700 text-slate-300'
                          }`}
                        >
                          <div
                            className="p-1.5 rounded-lg shrink-0"
                            style={{ backgroundColor: `${layerMeta?.color}20`, color: layerMeta?.color }}
                          >
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold truncate">{el.code}</p>
                            <p className="text-[10px] text-slate-400 truncate">{el.name}</p>
                            <p className="text-[9px] text-emerald-400 font-mono">Z={el.position.z}m</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="relative z-10 flex items-center justify-between text-[11px] text-slate-500">
                    <span>{t('technicalInfra.2d.clickToEdit')}</span>
                    <span>{t('technicalInfra.2d.dimensions')}</span>
                  </div>
                </div>
              </div>
            )}

            {activeCenterTab === 'WIFI_HEATMAP' && (
              <div className="w-full h-full flex flex-col">
                <WiFiHeatmapOverlay
                  coverageData={wifiCoverage}
                  elements={elements}
                  onRefresh={handleSimulateWiFi}
                />
              </div>
            )}

            {activeCenterTab === 'CONNECTIONS' && (
              <div className="w-full h-full flex flex-col">
                <TechnicalConnectionsViewer
                  connections={connections}
                  onCreateConnection={async (input) => {
                    await technicalInfrastructureService.createConnection(selectedProjectId, input);
                    loadInfrastructureData(selectedProjectId);
                  }}
                  onDeleteConnection={async (id) => {
                    await technicalInfrastructureService.deleteConnection(id);
                    loadInfrastructureData(selectedProjectId);
                  }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Properties Inspector & Engineering Reports */}
        <div className="col-span-3 flex flex-col gap-3 h-full overflow-hidden">
          {selectedElement ? (
            <TechnicalPropertiesPanel
              element={selectedElement}
              onUpdate={handleUpdateElement}
              onDelete={handleDeleteElement}
              onSync={handleSyncElement}
            />
          ) : (
            <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 text-center text-slate-500 text-xs flex flex-col items-center justify-center h-full space-y-2">
              <Cpu className="w-8 h-8 text-slate-600" />
              <p>{t('technicalInfra.properties.selectElement')}</p>
            </div>
          )}
        </div>
      </div>

      {/* Validation Modal */}
      <TechnicalValidationModal
        isOpen={isValidationModalOpen}
        onClose={() => setIsValidationModalOpen(false)}
        validation={validation}
        onRefresh={() => loadInfrastructureData(selectedProjectId)}
      />
    </div>
  );
};
