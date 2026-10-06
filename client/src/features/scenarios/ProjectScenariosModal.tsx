/**
 * HBD — HOME BOARD DESIGNER (V12.0.0)
 * MODAL PRINCIPAL DE GESTIÓN Y PLANIFICACIÓN DE ESCENARIOS
 * PROJECT SCENARIOS MODAL
 *
 * Autor: Adrián Palma
 * Copyright: © 2026 Adrián Palma. Todos los derechos reservados.
 */

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  GitFork,
  Plus,
  Copy,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Scale,
  Maximize2,
  Box,
  Eye,
  Hammer,
  ShieldAlert,
  Layers,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { Modal } from '../../components/ui/Modal.js';
import { Button } from '../../components/ui/Button.js';
import { Input } from '../../components/ui/Input.js';
import { Badge } from '../../components/ui/Badge.js';
import { Card } from '../../components/ui/Card.js';
import { scenarioService } from '../../services/scenario.service.js';
import { ScenarioComparisonModal } from './ScenarioComparisonModal.js';
import { ProjectScenarioDto } from '@hbd/shared';

interface ProjectScenariosModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
}

export const ProjectScenariosModal: React.FC<ProjectScenariosModalProps> = ({
  isOpen,
  onClose,
  projectId,
}) => {
  const { t } = useTranslation();
  const [scenarios, setScenarios] = useState<ProjectScenarioDto[]>([]);
  const [selectedScenarioId, setSelectedScenarioId] = useState<string | null>(null);
  const [activeScenarioDetail, setActiveScenarioDetail] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [newScenarioName, setNewScenarioName] = useState<string>('');
  const [newScenarioDesc, setNewScenarioDesc] = useState<string>('');
  const [newScenarioType, setNewScenarioType] = useState<string>('MANUAL');
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadScenarios();
    }
  }, [isOpen, projectId]);

  const loadScenarios = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await scenarioService.getScenariosByProject(projectId);
      setScenarios(data);
      if (data.length > 0 && !selectedScenarioId) {
        selectScenario(data[0].id);
      }
    } catch (err: any) {
      setError(err.message || 'Error al cargar escenarios');
    } finally {
      setIsLoading(false);
    }
  };

  const selectScenario = async (scenarioId: string) => {
    try {
      setSelectedScenarioId(scenarioId);
      const detail = await scenarioService.getScenario(scenarioId);
      setActiveScenarioDetail(detail);
    } catch (err: any) {
      setError(err.message || 'Error al obtener escenario');
    }
  };

  const handleCreateScenario = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newScenarioName.trim()) return;

    try {
      setError(null);
      await scenarioService.createScenario(projectId, {
        name: newScenarioName,
        description: newScenarioDesc,
        type: newScenarioType as any,
        baseScenarioId: selectedScenarioId || undefined,
      });
      setNewScenarioName('');
      setNewScenarioDesc('');
      setIsCreating(false);
      await loadScenarios();
    } catch (err: any) {
      setError(err.message || 'Error al crear escenario');
    }
  };

  const handleDuplicate = async (scenarioId: string) => {
    try {
      setError(null);
      await scenarioService.duplicateScenario(scenarioId);
      await loadScenarios();
    } catch (err: any) {
      setError(err.message || 'Error al duplicar escenario');
    }
  };

  const handleDelete = async (scenarioId: string) => {
    if (!window.confirm('¿Deseas archivar este escenario de proyecto?')) return;
    try {
      setError(null);
      await scenarioService.deleteScenario(scenarioId);
      await loadScenarios();
    } catch (err: any) {
      setError(err.message || 'Error al archivar escenario');
    }
  };

  const toggleCompareSelection = (scenarioId: string) => {
    if (selectedForCompare.includes(scenarioId)) {
      setSelectedForCompare(selectedForCompare.filter((id) => id !== scenarioId));
    } else {
      if (selectedForCompare.length >= 4) {
        alert('Máximo 4 escenarios para comparación simultánea');
        return;
      }
      setSelectedForCompare([...selectedForCompare, scenarioId]);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Planificación y Escenarios de Proyecto"
      >
        <div className="space-y-6">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {/* Barra de Herramientas Superior */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-dark-card border border-dark-border">
            <div className="flex items-center gap-2">
              <Button
                variant={isCreating ? 'secondary' : 'primary'}
                size="sm"
                onClick={() => setIsCreating(!isCreating)}
                icon={<Plus size={16} />}
              >
                {isCreating ? 'Cancelar' : 'Nuevo Escenario'}
              </Button>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-400">
                Seleccionados para comparar: {selectedForCompare.length}/4
              </span>
              <Button
                variant="secondary"
                size="sm"
                disabled={selectedForCompare.length < 2}
                onClick={() => setIsCompareModalOpen(true)}
                icon={<Scale size={16} />}
              >
                Comparar Escenarios
              </Button>
            </div>
          </div>

          {/* Formulario de Creación */}
          {isCreating && (
            <form
              onSubmit={handleCreateScenario}
              className="p-5 rounded-2xl bg-dark-surface border border-brand-500/30 space-y-4"
            >
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <GitFork size={16} className="text-brand-400" />
                <span>Configuración de Nuevo Escenario</span>
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Nombre del Escenario"
                  placeholder="Ej: Cocina Abierta + Suelo Radiante"
                  value={newScenarioName}
                  onChange={(e) => setNewScenarioName(e.target.value)}
                  required
                />
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                    Tipo de Escenario
                  </label>
                  <select
                    value={newScenarioType}
                    onChange={(e) => setNewScenarioType(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-dark-card border border-dark-border text-xs text-gray-200 focus:outline-none focus:border-brand-500"
                  >
                    <option value="MANUAL">Manual / Personalizado</option>
                    <option value="RENOVATION">Reforma Parcial o Integral</option>
                    <option value="AI_GENERATED">Propuesta Asistida por IA</option>
                    <option value="DESIGN_VARIANT">Variante de Diseño</option>
                  </select>
                </div>
              </div>
              <Input
                label="Descripción Técnica / Justificación"
                placeholder="Detalle de modificaciones arquitectónicas planteadas..."
                value={newScenarioDesc}
                onChange={(e) => setNewScenarioDesc(e.target.value)}
              />
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="ghost" size="sm" onClick={() => setIsCreating(false)}>
                  Cancelar
                </Button>
                <Button variant="primary" size="sm" type="submit">
                  Crear Escenario
                </Button>
              </div>
            </form>
          )}

          {/* Layout Principal: Lista de Escenarios + Detalle / Impacto */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Lista Izquierda */}
            <div className="lg:col-span-1 space-y-3 max-h-[460px] overflow-y-auto pr-1">
              {scenarios.map((sc) => (
                <div
                  key={sc.id}
                  onClick={() => selectScenario(sc.id)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    selectedScenarioId === sc.id
                      ? 'bg-dark-card border-brand-500 shadow-md ring-1 ring-brand-500/40'
                      : 'bg-dark-surface/60 border-dark-border hover:border-dark-border/80'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                      {sc.type}
                    </span>
                    <input
                      type="checkbox"
                      checked={selectedForCompare.includes(sc.id)}
                      onChange={(e) => {
                        e.stopPropagation();
                        toggleCompareSelection(sc.id);
                      }}
                      className="rounded bg-dark-bg border-dark-border text-brand-500 focus:ring-0 cursor-pointer"
                      title="Seleccionar para matriz comparativa"
                    />
                  </div>
                  <h4 className="font-bold text-xs text-white truncate">{sc.name}</h4>
                  {sc.description && (
                    <p className="text-[11px] text-gray-400 mt-1 line-clamp-1">{sc.description}</p>
                  )}

                  <div className="flex items-center justify-between gap-2 mt-3 pt-2.5 border-t border-dark-border/40 text-[11px] text-gray-400">
                    <span className="flex items-center gap-1">
                      <Layers size={12} /> {sc.actions?.length || 0} acciones
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDuplicate(sc.id);
                        }}
                        className="p-1 rounded hover:bg-dark-bg text-gray-400 hover:text-gray-200"
                        title="Duplicar"
                      >
                        <Copy size={13} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(sc.id);
                        }}
                        className="p-1 rounded hover:bg-dark-bg text-gray-400 hover:text-rose-400"
                        title="Archivar"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Detalle y Análisis del Escenario Seleccionado */}
            <div className="lg:col-span-2 space-y-4">
              {activeScenarioDetail ? (
                <div className="space-y-4">
                  {/* Tarjeta de Resumen */}
                  <div className="p-4 rounded-2xl bg-dark-surface border border-dark-border space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-base font-bold text-white">
                          {activeScenarioDetail.name}
                        </h3>
                        <p className="text-xs text-gray-400">
                          {activeScenarioDetail.description || 'Sin descripción adicional'}
                        </p>
                      </div>
                      <Badge
                        variant={
                          activeScenarioDetail.validation?.status === 'VALID'
                            ? 'success'
                            : activeScenarioDetail.validation?.status === 'INVALID'
                            ? 'danger'
                            : 'warning'
                        }
                      >
                        {activeScenarioDetail.validation?.status || 'DRAFT'}
                      </Badge>
                    </div>

                    {/* Métricas de Impacto Resumidas */}
                    {activeScenarioDetail.impact && (
                      <div className="grid grid-cols-3 gap-3 pt-2">
                        <div className="p-3 rounded-xl bg-dark-card border border-dark-border/60">
                          <span className="text-[10px] text-gray-400 uppercase font-semibold">
                            Delta Superficie
                          </span>
                          <p className="text-sm font-bold text-sky-400 mt-0.5">
                            {activeScenarioDetail.impact.geometricImpact.usefulAreaDeltaM2 >= 0 ? '+' : ''}
                            {activeScenarioDetail.impact.geometricImpact.usefulAreaDeltaM2} m²
                          </p>
                        </div>
                        <div className="p-3 rounded-xl bg-dark-card border border-dark-border/60">
                          <span className="text-[10px] text-gray-400 uppercase font-semibold">
                            Coste Estimado
                          </span>
                          <p className="text-sm font-bold text-emerald-400 mt-0.5">
                            {activeScenarioDetail.impact.economicImpact.scenarioCostEur} €
                          </p>
                        </div>
                        <div className="p-3 rounded-xl bg-dark-card border border-dark-border/60">
                          <span className="text-[10px] text-gray-400 uppercase font-semibold">
                            Score Normativo
                          </span>
                          <p className="text-sm font-bold text-amber-400 mt-0.5">
                            {activeScenarioDetail.validation?.complianceScore || 100}/100
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Avisos de Validación Técnica */}
                  {activeScenarioDetail.validation?.issues?.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
                        <ShieldAlert size={14} className="text-amber-400" />
                        <span>Validación y Supervisión Técnica</span>
                      </h4>
                      <div className="space-y-1.5 max-h-40 overflow-y-auto">
                        {activeScenarioDetail.validation.issues.map((iss: any, idx: number) => (
                          <div
                            key={idx}
                            className="p-3 rounded-xl bg-dark-card/80 border border-dark-border text-xs space-y-1"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-semibold text-gray-200">
                                {iss.targetElement || iss.category}
                              </span>
                              <Badge
                                variant={
                                  iss.severity === 'CRITICAL'
                                    ? 'danger'
                                    : iss.severity === 'WARNING'
                                    ? 'warning'
                                    : 'gray'
                                }
                              >
                                {iss.severity}
                              </Badge>
                            </div>
                            <p className="text-gray-400 text-[11px]">{iss.explanation}</p>
                            <p className="text-brand-400 text-[11px] font-medium">
                              Acción recomendada: {iss.recommendedAction}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-16 text-center text-gray-500 text-xs">
                  Selecciona un escenario de la lista para inspeccionar sus impactos y validación.
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-dark-border/40">
            <Button variant="secondary" onClick={onClose}>
              Cerrar
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal de Comparativa de Escenarios */}
      {isCompareModalOpen && (
        <ScenarioComparisonModal
          isOpen={isCompareModalOpen}
          onClose={() => setIsCompareModalOpen(false)}
          projectId={projectId}
          scenarioIds={selectedForCompare}
        />
      )}
    </>
  );
};
