/**
 * HBD — HOME BOARD DESIGNER (V7.0.0)
 * Estudio de Visualización Arquitectónica y Render (RenderWorkspace)
 * Autor Oficial: Adrián Palma
 * Copyright: © 2026 Adrián Palma — HBD (Home Board Designer)
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  SceneDefinition,
  RenderRecord,
  RenderQuality,
  RenderResolution,
  ResolutionConfig,
  TimeOfDay,
  ColorTemperatureK,
  DesignStylePreset,
  Scene3DData,
  StylePresetDefinition,
  SceneEngine,
  RenderEngine,
  RESOLUTION_PRESETS,
  QUALITY_CONFIGS,
  STYLE_PRESETS,
} from '@hbd/shared';
import { renderService } from '../../services/render.service.js';
import { RenderCanvas3D, RenderCanvas3DHandle } from './RenderCanvas3D.js';
import { RenderProgressModal } from './RenderProgressModal.js';
import { GalleryModal } from './GalleryModal.js';
import {
  Camera,
  Sun,
  Moon,
  Sparkles,
  Layers,
  Sliders,
  Image as ImageIcon,
  Maximize2,
  Minimize2,
  Plus,
  Trash2,
  Check,
  Eye,
  Columns,
  Download,
  Loader2,
  Star,
  ChevronRight,
  Palette,
  Compass,
} from 'lucide-react';

interface RenderWorkspaceProps {
  floorId: string;
  projectId: string;
  projectName?: string;
  floorName?: string;
  onSwitchTo2D: () => void;
  onSwitchTo3D: () => void;
}

export const RenderWorkspace: React.FC<RenderWorkspaceProps> = ({
  floorId,
  projectId,
  projectName,
  floorName,
  onSwitchTo2D,
  onSwitchTo3D,
}) => {
  const [scene3D, setScene3D] = useState<Scene3DData | null>(null);
  const [scenes, setScenes] = useState<SceneDefinition[]>([]);
  const [activeSceneId, setActiveSceneId] = useState<string>('');
  const [renders, setRenders] = useState<RenderRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Opciones de Renderizado
  const [selectedQuality, setSelectedQuality] = useState<RenderQuality>('high');
  const [selectedResolution, setSelectedResolution] = useState<RenderResolution>('hd_1080p');

  // Modales
  const [isRendering, setIsRendering] = useState(false);
  const [renderProgress, setRenderProgress] = useState(0);
  const [renderStage, setRenderStage] = useState('');
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Tabs del Inspector Derecho
  const [inspectorTab, setInspectorTab] = useState<'camera' | 'lighting' | 'materials' | 'postprocess'>('camera');

  const canvasRef = useRef<RenderCanvas3DHandle | null>(null);

  // 1. Cargar Escenas y Renders
  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [scenesRes, galleryRes] = await Promise.all([
        renderService.getFloorScenes(floorId),
        renderService.getProjectRenders(projectId),
      ]);

      if (scenesRes.success && scenesRes.data) {
        setScene3D(scenesRes.data.scene3D);
        setScenes(scenesRes.data.scenes);
        if (scenesRes.data.scenes.length > 0) {
          setActiveSceneId(scenesRes.data.scenes[0].id);
        }
      }

      if (galleryRes.success && galleryRes.data) {
        setRenders(galleryRes.data);
      }
    } catch (err) {
      console.error('Error al cargar estudio de render:', err);
    } finally {
      setIsLoading(false);
    }
  }, [floorId, projectId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const activeScene = scenes.find((s) => s.id === activeSceneId) || scenes[0];

  // 2. Acciones de Escena
  const handleSelectScene = (sceneId: string) => {
    setActiveSceneId(sceneId);
  };

  const handleCreateScene = () => {
    if (!scene3D) return;
    const newScene = SceneEngine.createDefaultScene(
      scene3D,
      `Escena Personalizada ${scenes.length + 1}`
    );
    setScenes((prev) => [...prev, newScene]);
    setActiveSceneId(newScene.id);
  };

  const handleApplyStylePreset = (presetId: DesignStylePreset) => {
    if (!activeScene) return;
    const updated = SceneEngine.applyStylePreset(activeScene, presetId);
    setScenes((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
  };

  const handleSelectVariant = (variantId: string) => {
    if (!activeScene) return;
    setScenes((prev) =>
      prev.map((s) => (s.id === activeScene.id ? { ...s, activeVariantId: variantId } : s))
    );
  };

  // 3. Ajustes de Iluminación y Sol
  const handleChangeTimeOfDay = (time: TimeOfDay) => {
    if (!activeScene) return;
    const sunPos = SceneEngine.calculateSunPosition(time);
    const mode = time === '20:00' ? 'sunset' : time === '23:00' ? 'night' : 'day';

    setScenes((prev) =>
      prev.map((s) =>
        s.id === activeScene.id
          ? {
              ...s,
              lighting: {
                ...s.lighting,
                timeOfDay: time,
                mode,
                sunElevationDeg: sunPos.elevationDeg,
                sunAzimuthDeg: sunPos.azimuthDeg,
                sunIntensity: sunPos.intensity,
              },
            }
          : s
      )
    );
  };

  const handleChangeColorTemp = (kelvin: ColorTemperatureK) => {
    if (!activeScene) return;
    setScenes((prev) =>
      prev.map((s) =>
        s.id === activeScene.id
          ? {
              ...s,
              lighting: {
                ...s.lighting,
                artificialLights: s.lighting.artificialLights.map((l) => ({
                  ...l,
                  colorTempK: kelvin,
                })),
              },
            }
          : s
      )
    );
  };

  // 4. Ajustes de Cámara
  const handleChangeCameraHeight = (heightM: number) => {
    if (!activeScene) return;
    setScenes((prev) =>
      prev.map((s) =>
        s.id === activeScene.id
          ? {
              ...s,
              camera: {
                ...s.camera,
                heightM,
                position: { ...s.camera.position, y: heightM },
              },
            }
          : s
      )
    );
  };

  const handleChangeCameraFov = (fov: number) => {
    if (!activeScene) return;
    setScenes((prev) =>
      prev.map((s) =>
        s.id === activeScene.id
          ? {
              ...s,
              camera: { ...s.camera, fov },
            }
          : s
      )
    );
  };

  // 5. Ajustes de Materiales
  const handleChangeSurfaceMaterial = (surfaceKey: string, colorHex: string) => {
    if (!activeScene) return;
    const activeVarId = activeScene.activeVariantId;
    setScenes((prev) =>
      prev.map((s) => {
        if (s.id !== activeScene.id) return s;
        return {
          ...s,
          designVariants: s.designVariants.map((v) => {
            if (v.id === activeVarId) {
              return {
                ...v,
                materialOverrides: {
                  ...v.materialOverrides,
                  [surfaceKey]: colorHex,
                },
              };
            }
            return v;
          }),
        };
      })
    );
  };

  // 6. Ejecutar Renderizado de Alta Calidad
  const handleStartRender = async () => {
    if (!canvasRef.current || !activeScene || !scene3D) return;

    try {
      setIsRendering(true);
      setRenderProgress(10);
      setRenderStage('Iniciando Motor de Render...');

      const resConfig = RenderEngine.getResolutionConfig(selectedResolution);

      const dataUrl = await canvasRef.current.captureRender(
        resConfig,
        selectedQuality,
        (pct, stage) => {
          setRenderProgress(pct);
          setRenderStage(stage);
        }
      );

      // Guardar en la galería del backend
      const res = await renderService.saveRender({
        projectId,
        name: `${activeScene.name} (${resConfig.name.split(' ')[0]})`,
        imageUrl: dataUrl,
        resolution: resConfig.name,
        quality: selectedQuality,
      });

      if (res.success && res.data) {
        setRenders((prev) => [res.data, ...prev]);
      }

      setTimeout(() => {
        setIsRendering(false);
        setIsGalleryOpen(true);
      }, 500);
    } catch (err: any) {
      console.error('Error durante el render:', err);
      setIsRendering(false);
    }
  };

  // Eliminar Render de la Galería
  const handleDeleteRender = async (id: string) => {
    try {
      await renderService.deleteRender(id);
      setRenders((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full h-[calc(100vh-4rem)] bg-slate-950 flex flex-col items-center justify-center gap-3 text-slate-200">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
        <p className="text-sm font-medium">Iniciando Estudio de Render y Visualización...</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[calc(100vh-4rem)] bg-slate-950 flex flex-col overflow-hidden select-none">
      {/* 1. BARRA SUPERIOR DE CONTROL */}
      <div className="h-14 border-b border-slate-800 bg-slate-900/95 backdrop-blur-md px-4 flex items-center justify-between z-20 shrink-0">
        {/* Selector de Modos 2D | 3D | Render */}
        <div className="flex items-center gap-2">
          <button
            onClick={onSwitchTo2D}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <span>📐 Plano 2D</span>
          </button>
          <button
            onClick={onSwitchTo3D}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <span>🧊 Vista 3D</span>
          </button>
          <button className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-600 text-white shadow-lg flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Studio Render</span>
          </button>
        </div>

        {/* Acciones Centrales: Galería & Pantalla Completa */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsGalleryOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-medium flex items-center gap-1.5 transition-colors border border-slate-700"
          >
            <ImageIcon className="w-4 h-4 text-emerald-400" />
            <span>Galería ({renders.length})</span>
          </button>

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            title="Modo Presentación Pantalla Completa"
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>

        {/* Botón Principal: RENDERIZAR */}
        <button
          onClick={handleStartRender}
          disabled={isRendering}
          className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-semibold text-xs flex items-center gap-2 shadow-lg shadow-emerald-950 transition-all active:scale-95 disabled:opacity-50"
        >
          <Camera className="w-4 h-4" />
          <span>Renderizar</span>
        </button>
      </div>

      {/* 2. ÁREA CENTRAL: SIDEBAR IZQUIERDO + CANVAS VIEWPORT + INSPECTOR DERECHO */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* SIDEBAR IZQUIERDO: Escenas, Variantes de Diseño y Estilos */}
        {!isFullscreen && (
          <div className="w-72 border-r border-slate-800 bg-slate-900/90 backdrop-blur-md p-4 flex flex-col gap-5 overflow-y-auto shrink-0 z-10">
            {/* Bloque A: Escenas Guardadas */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-white uppercase tracking-wider">
                  Escenas
                </span>
                <button
                  onClick={handleCreateScene}
                  className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800"
                  title="Añadir nueva escena"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-1">
                {scenes.map((sc) => {
                  const isAct = sc.id === activeSceneId;
                  return (
                    <button
                      key={sc.id}
                      onClick={() => handleSelectScene(sc.id)}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors ${
                        isAct
                          ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/40 font-medium'
                          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      <span className="truncate">{sc.name}</span>
                      <ChevronRight className="w-3 h-3 text-slate-500" />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bloque B: Variantes de Diseño (Antes | Después) */}
            {activeScene && (
              <div className="space-y-2 pt-3 border-t border-slate-800">
                <span className="text-xs font-semibold text-white uppercase tracking-wider">
                  Variantes de Diseño
                </span>
                <div className="space-y-1.5">
                  {activeScene.designVariants.map((v) => {
                    const isVarAct = v.id === activeScene.activeVariantId;
                    return (
                      <button
                        key={v.id}
                        onClick={() => handleSelectVariant(v.id)}
                        className={`w-full text-left p-2.5 rounded-xl border text-xs flex items-center justify-between transition-colors ${
                          isVarAct
                            ? 'bg-slate-800 border-emerald-500 text-white font-medium shadow-md'
                            : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <div className="truncate">
                          <span className="block font-semibold">{v.name}</span>
                          <span className="text-[10px] text-slate-500 block truncate">
                            {v.description}
                          </span>
                        </div>
                        {isVarAct && <Check className="w-4 h-4 text-emerald-400 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Bloque C: Presets de Estilo Arquitectónico */}
            <div className="space-y-2 pt-3 border-t border-slate-800">
              <span className="text-xs font-semibold text-white uppercase tracking-wider">
                Estilos Arquitectónicos
              </span>
              <div className="grid grid-cols-1 gap-1.5">
                {STYLE_PRESETS.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => handleApplyStylePreset(p.id)}
                    className="p-2 rounded-xl bg-slate-950/50 hover:bg-slate-800 border border-slate-800 text-left text-xs text-slate-300 hover:text-white transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">{p.name}</span>
                      <div className="flex gap-1">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: p.palette.wallColor }}
                        />
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: p.palette.floorColor }}
                        />
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      {p.description}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* VIEWPORT CENTRAL 3D */}
        <div className="flex-1 h-full relative bg-slate-950">
          {scene3D && activeScene && (
            <RenderCanvas3D
              ref={canvasRef}
              scene3D={scene3D}
              activeScene={activeScene}
              isFullscreen={isFullscreen}
              onExitFullscreen={() => setIsFullscreen(false)}
            />
          )}

          {/* Selector Rápido de Horario (☀️ Día / 🌅 Atardecer / 🌙 Noche) */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 p-1.5 rounded-2xl shadow-2xl flex items-center gap-1 z-20">
            {[
              { time: '08:00', label: '08:00 (Mañana)', icon: <Sun className="w-3.5 h-3.5 text-amber-300" /> },
              { time: '12:00', label: '12:00 (Mediodía)', icon: <Sun className="w-3.5 h-3.5 text-amber-400" /> },
              { time: '16:00', label: '16:00 (Tarde)', icon: <Sun className="w-3.5 h-3.5 text-orange-400" /> },
              { time: '20:00', label: '20:00 (Atardecer)', icon: <Sparkles className="w-3.5 h-3.5 text-rose-400" /> },
              { time: '23:00', label: '23:00 (Noche)', icon: <Moon className="w-3.5 h-3.5 text-indigo-400" /> },
            ].map(({ time, label, icon }) => (
              <button
                key={time}
                onClick={() => handleChangeTimeOfDay(time as TimeOfDay)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors ${
                  activeScene?.lighting.timeOfDay === time
                    ? 'bg-emerald-600 text-white shadow'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                {icon}
                <span className="hidden sm:inline">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* SIDEBAR DERECHO: INSPECTOR DE PARÁMETROS DE RENDER */}
        {!isFullscreen && activeScene && (
          <div className="w-80 border-l border-slate-800 bg-slate-900/90 backdrop-blur-md flex flex-col shrink-0 z-10">
            {/* Tabs del Inspector */}
            <div className="flex border-b border-slate-800 bg-slate-950/40 p-1">
              {[
                { id: 'camera', label: 'Cámara', icon: <Camera className="w-3.5 h-3.5" /> },
                { id: 'lighting', label: 'Luz & Sol', icon: <Sun className="w-3.5 h-3.5" /> },
                { id: 'materials', label: 'Materiales', icon: <Palette className="w-3.5 h-3.5" /> },
                { id: 'postprocess', label: 'Ajustes', icon: <Sliders className="w-3.5 h-3.5" /> },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setInspectorTab(t.id as any)}
                  className={`flex-1 py-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-colors ${
                    inspectorTab === t.id
                      ? 'bg-slate-800 text-white shadow'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {t.icon}
                  <span>{t.label}</span>
                </button>
              ))}
            </div>

            {/* Contenido del Tab Activo */}
            <div className="p-4 flex-1 overflow-y-auto space-y-4 text-xs">
              {/* TAB 1: CÁMARA */}
              {inspectorTab === 'camera' && (
                <div className="space-y-4">
                  <div>
                    <span className="font-semibold text-slate-200 block mb-2">Altura de Punto de Vista</span>
                    <div className="grid grid-cols-4 gap-1.5">
                      {[1.2, 1.5, 1.7, 1.8].map((h) => (
                        <button
                          key={h}
                          onClick={() => handleChangeCameraHeight(h)}
                          className={`py-1.5 rounded-lg border text-xs font-mono transition-colors ${
                            activeScene.camera.heightM === h
                              ? 'bg-emerald-600 border-emerald-500 text-white font-semibold'
                              : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                          }`}
                        >
                          {h.toFixed(2)}m
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-1.5">
                      <span className="font-semibold text-slate-200">Campo de Visión (FOV)</span>
                      <span className="font-mono text-emerald-400">{activeScene.camera.fov}°</span>
                    </div>
                    <input
                      type="range"
                      min="35"
                      max="85"
                      value={activeScene.camera.fov}
                      onChange={(e) => handleChangeCameraFov(Number(e.target.value))}
                      className="w-full accent-emerald-500"
                    />
                  </div>
                </div>
              )}

              {/* TAB 2: ILUMINACIÓN & SOL */}
              {inspectorTab === 'lighting' && (
                <div className="space-y-4">
                  <div>
                    <span className="font-semibold text-slate-200 block mb-2">
                      Temperatura de Luz Artificial
                    </span>
                    <div className="grid grid-cols-3 gap-1.5">
                      {[
                        { k: 2700, label: 'Cálida (2700K)' },
                        { k: 3000, label: 'Suave (3000K)' },
                        { k: 4000, label: 'Neutra (4000K)' },
                        { k: 5000, label: 'Día (5000K)' },
                        { k: 6500, label: 'Fría (6500K)' },
                      ].map(({ k, label }) => (
                        <button
                          key={k}
                          onClick={() => handleChangeColorTemp(k as ColorTemperatureK)}
                          className="p-1.5 rounded-lg bg-slate-800 border border-slate-700 text-[11px] text-slate-300 hover:text-white text-center transition-colors"
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-1.5">
                      <span className="font-semibold text-slate-200">Intensidad Solar</span>
                      <span className="font-mono text-emerald-400">
                        {activeScene.lighting.sunIntensity.toFixed(1)}x
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0.2"
                      max="2.5"
                      step="0.1"
                      value={activeScene.lighting.sunIntensity}
                      onChange={(e) =>
                        setScenes((prev) =>
                          prev.map((s) =>
                            s.id === activeScene.id
                              ? {
                                  ...s,
                                  lighting: { ...s.lighting, sunIntensity: Number(e.target.value) },
                                }
                              : s
                          )
                        )
                      }
                      className="w-full accent-emerald-500"
                    />
                  </div>
                </div>
              )}

              {/* TAB 3: MATERIALES & SUPERFICIES */}
              {inspectorTab === 'materials' && (
                <div className="space-y-4">
                  <div>
                    <span className="font-semibold text-slate-200 block mb-2">Acabado de Paredes</span>
                    <div className="grid grid-cols-3 gap-1.5">
                      {[
                        { name: 'Blanco Mate', color: '#f8fafc' },
                        { name: 'Gris Cálido', color: '#e2e8f0' },
                        { name: 'Beige Arena', color: '#f5f5f0' },
                        { name: 'Azul Nórdico', color: '#e0f2fe' },
                        { name: 'Verde Salvia', color: '#dcfce7' },
                      ].map((m) => (
                        <button
                          key={m.name}
                          onClick={() => handleChangeSurfaceMaterial('all_walls', m.color)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 flex items-center gap-1.5 text-[11px] text-slate-300 transition-colors"
                        >
                          <span
                            className="w-3 h-3 rounded-full border border-slate-600 shrink-0"
                            style={{ backgroundColor: m.color }}
                          />
                          <span className="truncate">{m.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="font-semibold text-slate-200 block mb-2">Acabado de Suelos</span>
                    <div className="grid grid-cols-2 gap-1.5">
                      {[
                        { name: 'Madera Roble', color: '#b48a60' },
                        { name: 'Nogal Oscuro', color: '#5c4033' },
                        { name: 'Baldosa Clara', color: '#e5e7eb' },
                        { name: 'Mármol Blanco', color: '#f3f4f6' },
                        { name: 'Cemento Pulido', color: '#9ca3af' },
                      ].map((m) => (
                        <button
                          key={m.name}
                          onClick={() => handleChangeSurfaceMaterial('all_floors', m.color)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 flex items-center gap-2 text-[11px] text-slate-300 transition-colors"
                        >
                          <span
                            className="w-3.5 h-3.5 rounded-md border border-slate-600 shrink-0"
                            style={{ backgroundColor: m.color }}
                          />
                          <span className="truncate font-medium">{m.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: AJUSTES DE CALIDAD Y EXPORTACIÓN */}
              {inspectorTab === 'postprocess' && (
                <div className="space-y-4">
                  <div>
                    <span className="font-semibold text-slate-200 block mb-2">Resolución de Salida</span>
                    <div className="space-y-1.5">
                      {RESOLUTION_PRESETS.map((res) => (
                        <button
                          key={res.id}
                          onClick={() => setSelectedResolution(res.id)}
                          className={`w-full p-2 rounded-xl border text-left flex items-center justify-between transition-colors ${
                            selectedResolution === res.id
                              ? 'bg-slate-800 border-emerald-500 text-white font-semibold'
                              : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          <div>
                            <span>{res.name}</span>
                            <span className="block text-[10px] text-slate-500">{res.description}</span>
                          </div>
                          {selectedResolution === res.id && (
                            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="font-semibold text-slate-200 block mb-2">Nivel de Calidad</span>
                    <div className="grid grid-cols-2 gap-1.5">
                      {QUALITY_CONFIGS.map((q) => (
                        <button
                          key={q.id}
                          onClick={() => setSelectedQuality(q.id)}
                          className={`p-2 rounded-xl border text-left text-xs transition-colors ${
                            selectedQuality === q.id
                              ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300 font-semibold'
                              : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                          }`}
                        >
                          <span className="block font-semibold">{q.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* MODAL DE PROGRESO DE RENDER */}
      <RenderProgressModal
        isOpen={isRendering}
        progress={renderProgress}
        stageName={renderStage}
        resolutionName={RenderEngine.getResolutionConfig(selectedResolution).name}
        qualityName={RenderEngine.getQualityConfig(selectedQuality).name}
        onCancel={() => setIsRendering(false)}
      />

      {/* MODAL DE GALERÍA Y COMPARADOR */}
      <GalleryModal
        isOpen={isGalleryOpen}
        onClose={() => setIsGalleryOpen(false)}
        renders={renders}
        onDeleteRender={handleDeleteRender}
      />
    </div>
  );
};
