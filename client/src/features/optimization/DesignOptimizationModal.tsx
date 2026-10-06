/**
 * HBD — HOME BOARD DESIGNER (V13.0.0)
 * MODAL PRINCIPAL DE OPTIMIZACIÓN DE DISEÑO
 * DESIGN OPTIMIZATION MODAL
 *
 * Autor: Adrián Palma
 * Copyright: © 2026 Adrián Palma. Todos los derechos reservados.
 */

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Sparkles,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Scale,
  Maximize2,
  Hammer,
  FileCheck,
  Check,
  ArrowRight,
  GitFork,
  Layers,
  HelpCircle,
} from 'lucide-react';
import { Modal } from '../../components/ui/Modal.js';
import { Button } from '../../components/ui/Button.js';
import { Input } from '../../components/ui/Input.js';
import { Badge } from '../../components/ui/Badge.js';
import { optimizationService } from '../../services/optimization.service.js';
import { AlternativeComparisonModal } from './AlternativeComparisonModal.js';
import {
  OptimizationResultDto,
  DesignAlternativeDto,
  DesignObjectiveType,
  OptimizationRequestDto,
} from '@hbd/shared';

interface DesignOptimizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
}

export const DesignOptimizationModal: React.FC<DesignOptimizationModalProps> = ({
  isOpen,
  onClose,
  projectId,
}) => {
  const { t } = useTranslation();
  const [briefText, setBriefText] = useState<string>('');
  const [minBedrooms, setMinBedrooms] = useState<string>('');
  const [maxBudgetEur, setMaxBudgetEur] = useState<string>('');
  const [targetStyle, setTargetStyle] = useState<string>('Moderno');
  const [workZoneRequired, setWorkZoneRequired] = useState<boolean>(false);
  const [selectedObjectives, setSelectedObjectives] = useState<DesignObjectiveType[]>([
    'MAXIMIZE_USABLE_AREA',
    'MINIMIZE_CONSTRUCTION_COST',
  ]);
  const [strategy, setStrategy] = useState<string>('PARAMETRIC');

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [optimizationResult, setOptimizationResult] = useState<OptimizationResultDto | null>(null);
  const [selectedAlternativeId, setSelectedAlternativeId] = useState<string | null>(null);
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState<boolean>(false);
  const [isConverting, setIsConverting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const availableObjectives: Array<{ id: DesignObjectiveType; label: string }> = [
    { id: 'MAXIMIZE_USABLE_AREA', label: 'Maximizar Superficie Útil' },
    { id: 'MINIMIZE_CONSTRUCTION_COST', label: 'Minimizar Coste de Obra' },
    { id: 'MINIMIZE_CONSTRUCTION_WORK', label: 'Minimizar Intervención / Residuos' },
    { id: 'MAXIMIZE_FREE_SPACE', label: 'Espacio Abierto y Diáfano' },
    { id: 'MAXIMIZE_STORAGE', label: 'Aumentar Capacidad de Almacenaje' },
    { id: 'MAXIMIZE_FUNCTIONAL_ZONES', label: 'Zonificación de Teletrabajo' },
    { id: 'MAXIMIZE_CIRCULATION', label: 'Accesibilidad y Pasos Amplios' },
  ];

  const toggleObjective = (obj: DesignObjectiveType) => {
    if (selectedObjectives.includes(obj)) {
      if (selectedObjectives.length > 1) {
        setSelectedObjectives(selectedObjectives.filter((o) => o !== obj));
      }
    } else {
      setSelectedObjectives([...selectedObjectives, obj]);
    }
  };

  const handleRunOptimization = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      setError(null);
      setSuccessMsg(null);
      const res = await optimizationService.runOptimization(projectId, {
        name: t('optimization.designOptimizationModal.optName'),
        brief: {
          text: briefText,
          minBedrooms: minBedrooms ? parseInt(minBedrooms, 10) : undefined,
          maxBudgetEur: maxBudgetEur ? parseFloat(maxBudgetEur) : undefined,
          targetStyle,
          workZoneRequired,
        },
        objectives: selectedObjectives,
        strategy: strategy as any,
        maxCandidates: 4,
      });
      setOptimizationResult(res);
      if (res.alternatives.length > 0) {
        setSelectedAlternativeId(res.alternatives[0].id);
      }
    } catch (err: any) {
      setError(err.message || t('optimization.designOptimizationModal.errorOptimization'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectAlternative = async (altId: string) => {
    try {
      setError(null);
      await optimizationService.selectAlternative(altId);
      setSuccessMsg(t('optimization.designOptimizationModal.successSelect'));
      if (optimizationResult) {
        setOptimizationResult({
          ...optimizationResult,
          alternatives: optimizationResult.alternatives.map((a) =>
            a.id === altId ? { ...a, status: 'SELECTED' } : a
          ),
        });
      }
    } catch (err: any) {
      setError(err.message || t('optimization.designOptimizationModal.errorSelect'));
    }
  };

  const handleConvertToScenario = async (altId: string) => {
    try {
      setIsConverting(true);
      setError(null);
      await optimizationService.convertAlternativeToScenario(altId);
      setSuccessMsg(t('optimization.designOptimizationModal.successConvert'));
    } catch (err: any) {
      setError(err.message || t('optimization.designOptimizationModal.errorConvert'));
    } finally {
      setIsConverting(false);
    }
  };

  const toggleCompareSelection = (altId: string) => {
    if (selectedForCompare.includes(altId)) {
      setSelectedForCompare(selectedForCompare.filter((id) => id !== altId));
    } else {
      if (selectedForCompare.length >= 4) {
        alert(t('optimization.designOptimizationModal.maxAlternatives'));
        return;
      }
      setSelectedForCompare([...selectedForCompare, altId]);
    }
  };

  const activeAlternative = optimizationResult?.alternatives.find(
    (a) => a.id === selectedAlternativeId
  );

  if (!isOpen) return null;

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={t('optimization.designOptimizationModal.title')}
      >
        <div className="space-y-6">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 size={16} />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Formulario de Definición de Objetivos y Restricciones */}
          <form
            onSubmit={handleRunOptimization}
            className="p-5 rounded-2xl bg-dark-surface border border-dark-border space-y-4"
          >
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Sliders size={16} className="text-brand-400" />
                <span>Definición de Necesidades (Design Brief)</span>
              </h4>
              <Badge variant="brand">{t('optimization.designOptimizationModal.parametricStrategy')}</Badge>
            </div>

            <div className="space-y-3">
              <Input
                label={t('optimization.designOptimizationModal.descriptionLabel')}
                placeholder={t('optimization.designOptimizationModal.descriptionPlaceholder')}
                value={briefText}
                onChange={(e) => setBriefText(e.target.value)}
              />

              {/* Parámetros Clave */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Input
                  label={t('optimization.designOptimizationModal.minBedroomsLabel')}
                  type="number"
                  placeholder={t('optimization.designOptimizationModal.minBedroomsPlaceholder')}
                  value={minBedrooms}
                  onChange={(e) => setMinBedrooms(e.target.value)}
                />
                <Input
                  label="Presupuesto Máximo (€)"
                  type="number"
                  placeholder={t('optimization.designOptimizationModal.maxBudgetPlaceholder')}
                  value={maxBudgetEur}
                  onChange={(e) => setMaxBudgetEur(e.target.value)}
                />
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">{t('optimization.designOptimizationModal.targetStyleLabel')}</label>
                  <select
                    value={targetStyle}
                    onChange={(e) => setTargetStyle(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-dark-card border border-dark-border text-xs text-gray-200 focus:outline-none focus:border-brand-500"
                  >
                    <option value="Moderno">Moderno</option>
                    <option value="Minimalista">Minimalista</option>
                    <option value="Nórdico">Nórdico</option>
                    <option value="Industrial">Industrial</option>
                    <option value="Japandi">Japandi</option>
                  </select>
                </div>
              </div>

              {/* Selección de Objetivos Múltiples */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-2">
                  Objetivos de Optimización (Selección Múltiple)
                </label>
                <div className="flex flex-wrap gap-2">
                  {availableObjectives.map((obj) => (
                    <button
                      type="button"
                      key={obj.id}
                      onClick={() => toggleObjective(obj.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                        selectedObjectives.includes(obj.id)
                          ? 'bg-brand-500 text-white shadow-md shadow-brand-500/20'
                          : 'bg-dark-card text-gray-400 border border-dark-border hover:text-white'
                      }`}
                    >
                      {obj.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button
                variant="primary"
                size="sm"
                type="submit"
                disabled={isLoading}
                icon={<Sparkles size={16} />}
              >
                {isLoading ? t('optimization.designOptimizationModal.calculating') : t('optimization.designOptimizationModal.executeOptimization')}
              </Button>
            </div>
          </form>

          {/* Resultados de Alternativas Generadas */}
          {optimizationResult && (
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-dark-card border border-dark-border">
                <span className="text-xs text-gray-300">
                  <strong className="text-white">
                    {optimizationResult.alternatives.length} alternativas
                  </strong>{' '}
                  generadas en {optimizationResult.metrics.executionTimeMs}ms.
                </span>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={selectedForCompare.length < 2}
                  onClick={() => setIsCompareModalOpen(true)}
                  icon={<Scale size={16} />}
                >
                  Comparar Seleccionadas ({selectedForCompare.length}/4)
                </Button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Lista de Alternativas */}
                <div className="lg:col-span-1 space-y-3 max-h-[420px] overflow-y-auto pr-1">
                  {optimizationResult.alternatives.map((alt) => (
                    <div
                      key={alt.id}
                      onClick={() => setSelectedAlternativeId(alt.id)}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                        selectedAlternativeId === alt.id
                          ? 'bg-dark-card border-brand-500 shadow-md ring-1 ring-brand-500/40'
                          : 'bg-dark-surface/60 border-dark-border hover:border-dark-border/80'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <Badge
                          variant={alt.status === 'SELECTED' ? 'brand' : 'success'}
                        >
                          {alt.status}
                        </Badge>
                        <input
                          type="checkbox"
                          checked={selectedForCompare.includes(alt.id)}
                          onChange={(e) => {
                            e.stopPropagation();
                            toggleCompareSelection(alt.id);
                          }}
                          className="rounded bg-dark-bg border-dark-border text-brand-500 focus:ring-0 cursor-pointer"
                          title="Seleccionar para matriz comparativa"
                        />
                      </div>
                      <h4 className="font-bold text-xs text-white truncate">{alt.name}</h4>
                      <div className="mt-2 pt-2 border-t border-dark-border/40 text-[11px] text-gray-300 flex justify-between">
                        <span className="text-gray-400">{t('optimization.designOptimizationModal.cost')}</span>
                        <span className="font-semibold text-emerald-400">
                          {alt.metrics.estimatedCostEur} €
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Detalle y Explicabilidad de la Alternativa Activa */}
                <div className="lg:col-span-2 space-y-4">
                  {activeAlternative ? (
                    <div className="p-4 rounded-2xl bg-dark-surface border border-dark-border space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-base font-bold text-white">
                            {activeAlternative.name}
                          </h3>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {activeAlternative.description}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleSelectAlternative(activeAlternative.id)}
                            icon={<Check size={14} />}
                          >{t('optimization.designOptimizationModal.select')}</Button>
                          <Button
                            variant="primary"
                            size="sm"
                            disabled={isConverting}
                            onClick={() => handleConvertToScenario(activeAlternative.id)}
                            icon={<GitFork size={14} />}
                          >{t('optimization.designOptimizationModal.convertToScenario')}</Button>
                        </div>
                      </div>

                      {/* Métricas Clave */}
                      <div className="grid grid-cols-3 gap-3">
                        <div className="p-3 rounded-xl bg-dark-card border border-dark-border/60">
                          <span className="text-[10px] text-gray-400 uppercase font-semibold">{t('optimization.designOptimizationModal.usableArea')}</span>
                          <p className="text-sm font-bold text-sky-400 mt-0.5">
                            {activeAlternative.metrics.usableAreaM2} m²
                          </p>
                        </div>
                        <div className="p-3 rounded-xl bg-dark-card border border-dark-border/60">
                          <span className="text-[10px] text-gray-400 uppercase font-semibold">{t('optimization.designOptimizationModal.estCost2')}</span>
                          <p className="text-sm font-bold text-emerald-400 mt-0.5">
                            {activeAlternative.metrics.estimatedCostEur} €
                          </p>
                        </div>
                        <div className="p-3 rounded-xl bg-dark-card border border-dark-border/60">
                          <span className="text-[10px] text-gray-400 uppercase font-semibold">
                            Puntaje Normativo
                          </span>
                          <p className="text-sm font-bold text-amber-400 mt-0.5">
                            {activeAlternative.metrics.complianceScore}/100
                          </p>
                        </div>
                      </div>

                      {/* Explicabilidad: Qué cambió y por qué */}
                      {activeAlternative.explanations?.length > 0 && (
                        <div className="space-y-2 pt-2 border-t border-dark-border/40">
                          <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider">{t('optimization.designOptimizationModal.justification')}</h4>
                          {activeAlternative.explanations.map((exp, idx) => (
                            <div
                              key={idx}
                              className="p-3 rounded-xl bg-dark-card border border-dark-border text-xs space-y-1"
                            >
                              <div className="font-semibold text-white">
                                {exp.whatChanged}
                              </div>
                              <p className="text-gray-400 text-[11px]">{exp.whyChanged}</p>
                              <p className="text-brand-400 text-[11px] font-medium">
                                {exp.impactSummary}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="py-16 text-center text-gray-500 text-xs">{t('optimization.designOptimizationModal.selectAlternativePrompt')}</div>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end pt-4 border-t border-dark-border/40">
            <Button variant="secondary" onClick={onClose}>{t('optimization.designOptimizationModal.close')}</Button>
          </div>
        </div>
      </Modal>

      {/* Modal de Comparativa de Alternativas */}
      {isCompareModalOpen && optimizationResult && (
        <AlternativeComparisonModal
          isOpen={isCompareModalOpen}
          onClose={() => setIsCompareModalOpen(false)}
          requestId={optimizationResult.request.id}
          alternativeIds={selectedForCompare}
        />
      )}
    </>
  );
};
