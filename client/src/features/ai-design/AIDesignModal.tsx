/**
 * HBD — HOME BOARD DESIGNER (V8.0.0)
 * AIDesignModal — Experiencia Central de Diseño con IA e Interiorismo
 * Autor Oficial: Adrián Palma
 * Copyright: © 2026 Adrián Palma — HBD (Home Board Designer)
 */

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Sparkles,
  Layers,
  Wand2,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Save,
  Eye,
  Check,
  RotateCcw,
  Palette,
  Sun,
  ShieldCheck,
  ChevronRight,
  Armchair,
  Sliders,
  History,
  Scale,
  X,
} from 'lucide-react';
import {
  DesignStyle,
  DesignAtmosphere,
  ColorPalettePreference,
  BudgetLevel,
  DesignGoal,
  DesignPreferences,
  AIDesignProposal,
  AIProviderConfig,
  RoomAnalysisInsight,
} from '@hbd/shared';
import { aiDesignService } from '../../services/aiDesign.service.js';
import { Button } from '../../components/ui/Button.js';
import { Badge } from '../../components/ui/Badge.js';
import { Card } from '../../components/ui/Card.js';
import { AIVariantsComparator } from './AIVariantsComparator.js';
import { AIHistoryModal } from './AIHistoryModal.js';

interface AIDesignModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  floorId: string;
  targetRoomId?: string;
  roomName?: string;
  initialPreferences?: Partial<DesignPreferences>;
  onApplyProposal?: (proposal: AIDesignProposal) => void;
  onPreviewProposal?: (proposal: AIDesignProposal) => void;
}

export const AIDesignModal: React.FC<AIDesignModalProps> = ({
  isOpen,
  onClose,
  projectId,
  floorId,
  targetRoomId,
  roomName,
  initialPreferences,
  onApplyProposal,
  onPreviewProposal,
}) => {
  const { t } = useTranslation();

  // Estados de Configuración
  const [providerConfig, setProviderConfig] = useState<AIProviderConfig | null>(null);
  const [roomInsight, setRoomInsight] = useState<RoomAnalysisInsight | null>(null);
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);

  // Formulario de Preferencias
  const [style, setStyle] = useState<DesignStyle>('modern');
  const [atmosphere, setAtmosphere] = useState<DesignAtmosphere>('warm');
  const [colorPalette, setColorPalette] = useState<ColorPalettePreference>('neutral');
  const [goal, setGoal] = useState<DesignGoal>('more_space');
  const [budgetLevel, setBudgetLevel] = useState<BudgetLevel>('MEDIUM');
  const [numberOfProposals, setNumberOfProposals] = useState<1 | 2 | 3>(2);

  // Estados de Generación
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState(0);
  const [proposals, setProposals] = useState<AIDesignProposal[]>([]);
  const [selectedProposalIndex, setSelectedProposalIndex] = useState(0);
  const [historyId, setHistoryId] = useState<string | null>(null);

  // Modales secundarios
  const [isComparatorOpen, setIsComparatorOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);
  const [isApplying, setIsApplying] = useState(false);
  const [isSavingVariant, setIsSavingVariant] = useState(false);

  // Cargar estado del proveedor y análisis previo
  useEffect(() => {
    if (isOpen && projectId && floorId) {
      aiDesignService.getProviderStatus().then((res) => {
        if (res.data) setProviderConfig(res.data);
      }).catch(console.error);

      if (targetRoomId) {
        setIsLoadingAnalysis(true);
        aiDesignService.analyzeRoom(projectId, floorId, targetRoomId)
          .then((res) => {
            if (res.data) setRoomInsight(res.data);
          })
          .catch(console.error)
          .finally(() => setIsLoadingAnalysis(false));
      }
    }
  }, [isOpen, projectId, floorId, targetRoomId]);

  useEffect(() => {
    if (initialPreferences) {
      if (initialPreferences.style) setStyle(initialPreferences.style);
      if (initialPreferences.atmosphere) setAtmosphere(initialPreferences.atmosphere);
      if (initialPreferences.colorPalette) setColorPalette(initialPreferences.colorPalette);
      if (initialPreferences.goal) setGoal(initialPreferences.goal);
      if (initialPreferences.budgetLevel) setBudgetLevel(initialPreferences.budgetLevel);
    }
  }, [initialPreferences]);

  if (!isOpen) return null;

  const currentProposal = proposals[selectedProposalIndex] || null;

  const handleGenerate = async () => {
    setIsGenerating(true);
    setGenerationStep(1);
    setActionSuccessMessage(null);

    try {
      // Simular progresión de etapas visuales
      const timer1 = setTimeout(() => setGenerationStep(2), 600);
      const timer2 = setTimeout(() => setGenerationStep(3), 1200);

      const prefs: Partial<DesignPreferences> = {
        style,
        atmosphere,
        colorPalette,
        goal,
        budgetLevel,
        numberOfProposals,
      };

      const res = await aiDesignService.generateProposals(
        projectId,
        floorId,
        targetRoomId,
        prefs
      );

      clearTimeout(timer1);
      clearTimeout(timer2);

      if (res.data && res.data.proposals) {
        setProposals(res.data.proposals);
        setHistoryId(res.data.historyId);
        setSelectedProposalIndex(0);
      }
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Error al generar propuestas con IA');
    } finally {
      setIsGenerating(false);
      setGenerationStep(0);
    }
  };

  const handleApply = async () => {
    if (!currentProposal || !historyId) return;
    setIsApplying(true);
    try {
      await aiDesignService.applyProposal(projectId, floorId, currentProposal.id, historyId);
      setActionSuccessMessage(`✓ Propuesta "${currentProposal.name}" aplicada con éxito sobre el plano.`);
      if (onApplyProposal) {
        onApplyProposal(currentProposal);
      }
    } catch (err: any) {
      alert(err.message || 'Error al aplicar propuesta');
    } finally {
      setIsApplying(false);
    }
  };

  const handleSaveVariant = async () => {
    if (!currentProposal || !historyId) return;
    setIsSavingVariant(true);
    try {
      await aiDesignService.saveProposalAsVariant(
        projectId,
        floorId,
        currentProposal.id,
        historyId,
        currentProposal.name
      );
      setActionSuccessMessage(`💾 Propuesta guardada como Variante de Diseño para el proyecto.`);
    } catch (err: any) {
      alert(err.message || 'Error al guardar variante');
    } finally {
      setIsSavingVariant(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-5xl bg-dark-surface border border-dark-border rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-dark-border/70 bg-dark-card/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-500/20 text-brand-400 border border-brand-500/30 flex items-center justify-center shadow-lg shadow-brand-500/10">
              <Sparkles size={22} className="animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">
                  Diseño de Interiores con IA
                </h3>
                {providerConfig && (
                  <Badge variant={providerConfig.isMockMode ? 'brand' : 'success'} size="sm">
                    {providerConfig.isMockMode ? '✨ Modo Demostración (Mock)' : '✨ IA Conectada'}
                  </Badge>
                )}
              </div>
              <p className="text-xs text-gray-400">
                {targetRoomId
                  ? `Diseñando estancia específica: "${roomName || 'Habitación'}"`
                  : 'Diseño arquitectónico integral de la vivienda completa'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={<History size={15} />}
              onClick={() => setIsHistoryOpen(true)}
            >
              Historial
            </Button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white p-2 rounded-xl hover:bg-dark-hover transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Modal Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Mensaje de éxito de acción */}
          {actionSuccessMessage && (
            <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-xs font-semibold text-emerald-300 flex items-center gap-2">
              <CheckCircle2 size={16} />
              <span>{actionSuccessMessage}</span>
            </div>
          )}

          {/* Estado 1: Formulario de Preferencias & Análisis previo */}
          {proposals.length === 0 && !isGenerating && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Columna Izquierda: Análisis de la Estancia */}
              <div className="space-y-4">
                <Card className="p-5 space-y-3.5 bg-dark-card/40 border-dark-border">
                  <div className="flex items-center gap-2 text-xs font-bold text-brand-400 uppercase tracking-wider">
                    <ShieldCheck size={16} />
                    <span>Análisis Geométrico Real</span>
                  </div>
                  {isLoadingAnalysis ? (
                    <div className="py-8 text-center text-xs text-gray-400">
                      Analizando geometría y restricciones...
                    </div>
                  ) : roomInsight ? (
                    <div className="space-y-3 text-xs text-gray-300">
                      <div>
                        <span className="font-semibold text-white block">Función:</span>
                        <span className="text-gray-400">{roomInsight.functionalRole}</span>
                      </div>
                      <div>
                        <span className="font-semibold text-white block">Superficie Útil:</span>
                        <span className="text-brand-400 font-bold">{roomInsight.areaM2.toFixed(1)} m²</span>
                      </div>
                      <div>
                        <span className="font-semibold text-white block">Potencial Lumínico:</span>
                        <span className="text-gray-400">{roomInsight.lightingPotential}</span>
                      </div>
                      <div className="pt-2 border-t border-dark-border/40">
                        <span className="font-semibold text-white block mb-1">Restricciones Clave:</span>
                        <ul className="list-disc list-inside space-y-1 text-gray-400 text-[11px]">
                          {roomInsight.constraints.map((c, i) => (
                            <li key={i}>{c}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400">
                      La IA analizará todas las habitaciones de la planta para crear un concepto coherente de interiorismo.
                    </p>
                  )}
                </Card>
              </div>

              {/* Columna Central y Derecha: Formulario de Preferencias */}
              <div className="lg:col-span-2 space-y-5">
                {/* 1. Selección de Estilo */}
                <div>
                  <label className="text-xs font-bold text-gray-300 block mb-2">
                    Estilo de Interiorismo
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {[
                      { id: 'modern', label: 'Moderno' },
                      { id: 'minimalist', label: 'Minimalista' },
                      { id: 'nordic', label: 'Nórdico' },
                      { id: 'japandi', label: 'Japandi' },
                      { id: 'industrial', label: 'Industrial' },
                      { id: 'classic', label: 'Clásico' },
                      { id: 'contemporary', label: 'Contemporáneo' },
                      { id: 'mediterranean', label: 'Mediterráneo' },
                    ].map((st) => (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() => setStyle(st.id as DesignStyle)}
                        className={`p-3 rounded-xl border text-xs font-semibold text-center transition-all ${
                          style === st.id
                            ? 'bg-brand-500 text-white border-brand-500 shadow-md shadow-brand-500/20'
                            : 'bg-dark-card text-gray-300 border-dark-border hover:border-gray-500'
                        }`}
                      >
                        {st.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Atmósfera & Objetivo */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-gray-300 block mb-2">
                      Ambiente / Atmósfera
                    </label>
                    <select
                      value={atmosphere}
                      onChange={(e) => setAtmosphere(e.target.value as DesignAtmosphere)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-dark-card border border-dark-border text-xs text-white focus:outline-none focus:border-brand-500"
                    >
                      <option value="warm">Cálido y Acogedor</option>
                      <option value="luminous">Luminoso y Abierto</option>
                      <option value="elegant">Elegante y Sofisticado</option>
                      <option value="minimal">Minimal y Despejado</option>
                      <option value="natural">Natural y Orgánico</option>
                      <option value="industrial">Industrial y Urbano</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-300 block mb-2">
                      Objetivo de la Distribución
                    </label>
                    <select
                      value={goal}
                      onChange={(e) => setGoal(e.target.value as DesignGoal)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-dark-card border border-dark-border text-xs text-white focus:outline-none focus:border-brand-500"
                    >
                      <option value="more_space">Más Espacio Libre y Circulación</option>
                      <option value="maximize_storage">Maximizar Capacidad de Almacenaje</option>
                      <option value="ergonomic_flow">Optimización Ergonómica</option>
                      <option value="entertaining">Zonas de Convivencia y Reunión</option>
                      <option value="cozy_relaxation">Relax y Descanso</option>
                    </select>
                  </div>
                </div>

                {/* 3. Colores, Presupuesto y Número de Propuestas */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-bold text-gray-300 block mb-2">
                      Paleta de Color
                    </label>
                    <select
                      value={colorPalette}
                      onChange={(e) => setColorPalette(e.target.value as ColorPalettePreference)}
                      className="w-full px-3 py-2 rounded-xl bg-dark-card border border-dark-border text-xs text-white focus:outline-none focus:border-brand-500"
                    >
                      <option value="neutral">Neutros (Beige / Gris / Blanco)</option>
                      <option value="warm">Tonos Cálidos</option>
                      <option value="light">Tonos Claros</option>
                      <option value="dark">Tonos Oscuros</option>
                      <option value="earth">Tonos Tierra y Madera</option>
                      <option value="green">Verdes y Botánicos</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-300 block mb-2">
                      Nivel de Complejidad
                    </label>
                    <select
                      value={budgetLevel}
                      onChange={(e) => setBudgetLevel(e.target.value as BudgetLevel)}
                      className="w-full px-3 py-2 rounded-xl bg-dark-card border border-dark-border text-xs text-white focus:outline-none focus:border-brand-500"
                    >
                      <option value="LOW">Básico / Esencial</option>
                      <option value="MEDIUM">Medio / Confortable</option>
                      <option value="HIGH">Premium / Alta Gama</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-300 block mb-2">
                      Variantes a Generar
                    </label>
                    <div className="flex gap-2">
                      {[1, 2, 3].map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => setNumberOfProposals(num as 1 | 2 | 3)}
                          className={`flex-1 py-2 rounded-xl border text-xs font-bold transition-all ${
                            numberOfProposals === num
                              ? 'bg-brand-500 text-white border-brand-500'
                              : 'bg-dark-card text-gray-300 border-dark-border'
                          }`}
                        >
                          {num} {num === 1 ? 'Propuesta' : 'Propuestas'}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Botón de Acción Principal */}
                <div className="pt-4 border-t border-dark-border/60">
                  <Button
                    variant="primary"
                    size="lg"
                    className="w-full shadow-lg shadow-brand-500/25"
                    icon={<Wand2 size={18} />}
                    onClick={handleGenerate}
                    disabled={isGenerating}
                  >
                    Generar Propuestas de Diseño con IA
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Estado 2: Pantalla de Carga y Validación Progresiva */}
          {isGenerating && (
            <Card className="p-12 text-center flex flex-col items-center justify-center space-y-5 bg-dark-card/40 border-dark-border">
              <div className="w-16 h-16 rounded-3xl bg-brand-500/20 text-brand-400 border border-brand-500/30 flex items-center justify-center animate-spin">
                <Sparkles size={32} />
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-bold text-white">
                  {generationStep === 1
                    ? 'Analizando geometría real y accesos...'
                    : generationStep === 2
                    ? 'Generando distribución de mobiliario con IA...'
                    : 'Validando holguras espaciales con el motor de colisiones...'}
                </h4>
                <p className="text-xs text-gray-400">
                  La IA está aplicando las reglas de paso mínimo y comprobando contención de muros.
                </p>
              </div>
              <div className="w-64 h-2 bg-dark-bg rounded-full overflow-hidden border border-dark-border">
                <div
                  className="h-full bg-brand-500 transition-all duration-500"
                  style={{ width: `${generationStep === 1 ? 33 : generationStep === 2 ? 66 : 95}%` }}
                />
              </div>
            </Card>
          )}

          {/* Estado 3: Revisión de Propuestas Generadas */}
          {proposals.length > 0 && currentProposal && !isGenerating && (
            <div className="space-y-6">
              {/* Selector de Pestañas de Propuestas (Propuesta A, B, C) */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-dark-border/60 pb-3">
                <div className="flex items-center gap-2">
                  {proposals.map((prop, idx) => (
                    <button
                      key={prop.id}
                      onClick={() => setSelectedProposalIndex(idx)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                        selectedProposalIndex === idx
                          ? 'bg-brand-500 text-white shadow-md shadow-brand-500/20'
                          : 'bg-dark-card text-gray-400 hover:text-white border border-dark-border'
                      }`}
                    >
                      <span>{prop.name}</span>
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    icon={<Scale size={15} />}
                    onClick={() => setIsComparatorOpen(true)}
                  >
                    Comparar Propuestas
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={<RotateCcw size={15} />}
                    onClick={() => setProposals([])}
                  >
                    Nueva Búsqueda
                  </Button>
                </div>
              </div>

              {/* Detalle de la Propuesta Seleccionada */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Columna Izquierda: Resumen y Validación */}
                <div className="space-y-4">
                  <Card className="p-5 space-y-4 bg-dark-card/40 border-dark-border">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                        Validación Espacial
                      </span>
                      <Badge variant={currentProposal.validationResult.isCompatible ? 'success' : 'danger'}>
                        {currentProposal.validationResult.isCompatible ? '✓ Físicamente Compatible' : '✕ Inviable'}
                      </Badge>
                    </div>

                    <p className="text-xs text-gray-300 leading-relaxed">
                      {currentProposal.validationResult.messages[0]}
                    </p>

                    <div className="p-3.5 rounded-xl bg-dark-bg/60 border border-dark-border/60 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Estilo:</span>
                        <span className="font-bold text-white capitalize">{currentProposal.style}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Atmósfera:</span>
                        <span className="font-bold text-white capitalize">{currentProposal.atmosphere}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Paso libre mín.:</span>
                        <span className="font-bold text-brand-400">≥ 75 cm</span>
                      </div>
                    </div>
                  </Card>

                  {/* Rationale de la IA */}
                  <Card className="p-5 space-y-3 bg-dark-card/40 border-dark-border">
                    <h5 className="text-xs font-bold text-white flex items-center gap-2">
                      <Sparkles size={15} className="text-brand-400" />
                      Fundamento del Diseño
                    </h5>
                    <p className="text-xs text-gray-300 leading-relaxed">
                      {currentProposal.rationale}
                    </p>
                    <ul className="space-y-1.5 pt-2 border-t border-dark-border/40 text-[11px] text-gray-400">
                      {currentProposal.roomInsights.map((ins, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-brand-400 font-bold">•</span>
                          <span>{ins}</span>
                        </li>
                      ))}
                    </ul>
                  </Card>
                </div>

                {/* Columna Central/Derecha: Modificaciones de Mobiliario y Acabados */}
                <div className="lg:col-span-2 space-y-4">
                  <Card className="p-5 space-y-4">
                    <h5 className="text-xs font-bold text-white flex items-center gap-2">
                      <Armchair size={16} className="text-brand-400" />
                      Piezas de Mobiliario Propuestas ({currentProposal.furnitureChanges.length})
                    </h5>

                    <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                      {currentProposal.furnitureChanges.map((change, i) => (
                        <div
                          key={i}
                          className="p-3 rounded-xl bg-dark-card border border-dark-border/70 flex items-center justify-between text-xs"
                        >
                          <div className="space-y-0.5">
                            <span className="font-bold text-white block">{change.furnitureName}</span>
                            <span className="text-[11px] text-gray-400">
                              {change.dimensions.widthM.toFixed(2)}m × {change.dimensions.depthM.toFixed(2)}m • {change.reason}
                            </span>
                          </div>
                          <Badge variant="brand" size="sm">
                            {change.clearanceMm ? `${change.clearanceMm} mm holgura` : 'Ubicado'}
                          </Badge>
                        </div>
                      ))}
                    </div>

                    {/* Acabados & Iluminación */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-dark-border/50 text-xs">
                      <div className="p-3 rounded-xl bg-dark-card/60 border border-dark-border/60 space-y-1">
                        <div className="flex items-center gap-1.5 text-gray-400">
                          <Palette size={14} className="text-brand-400" />
                          <span>Acabados y Materiales</span>
                        </div>
                        <p className="font-semibold text-white">
                          Paredes neutras mate y suelos de roble claro / microcemento
                        </p>
                      </div>

                      <div className="p-3 rounded-xl bg-dark-card/60 border border-dark-border/60 space-y-1">
                        <div className="flex items-center gap-1.5 text-gray-400">
                          <Sun size={14} className="text-amber-400" />
                          <span>Iluminación Solar</span>
                        </div>
                        <p className="font-semibold text-white">
                          Hora: {currentProposal.lightingOverrides.timeOfDay || '12:00'} • {currentProposal.lightingOverrides.colorTempK || 3000}K
                        </p>
                      </div>
                    </div>
                  </Card>

                  {/* Barra de Acciones Finales */}
                  <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-dark-card/70 border border-dark-border">
                    <Button
                      variant="outline"
                      size="sm"
                      icon={<Eye size={15} />}
                      onClick={() => {
                        if (onPreviewProposal) onPreviewProposal(currentProposal);
                      }}
                    >
                      Previsualizar en 2D / 3D
                    </Button>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        icon={<Save size={15} />}
                        onClick={handleSaveVariant}
                        disabled={isSavingVariant}
                      >
                        {isSavingVariant ? 'Guardando...' : 'Guardar como Variante'}
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        icon={<Check size={16} />}
                        onClick={handleApply}
                        disabled={isApplying || !currentProposal.validationResult.isCompatible}
                      >
                        {isApplying ? 'Aplicando...' : 'Aplicar al Plano'}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal Comparador */}
      {isComparatorOpen && (
        <AIVariantsComparator
          isOpen={isComparatorOpen}
          onClose={() => setIsComparatorOpen(false)}
          proposals={proposals}
          onSelectVariant={(prop) => {
            const idx = proposals.findIndex((p) => p.id === prop.id);
            if (idx >= 0) setSelectedProposalIndex(idx);
            setIsComparatorOpen(false);
          }}
        />
      )}

      {/* Modal Historial */}
      {isHistoryOpen && (
        <AIHistoryModal
          isOpen={isHistoryOpen}
          onClose={() => setIsHistoryOpen(false)}
          projectId={projectId}
        />
      )}
    </div>
  );
};
