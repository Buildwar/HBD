/**
 * HBD — HOME BOARD DESIGNER (V9.0.0)
 * VisionReviewModal — Revisión Humana de Detecciones, Edición y Aplicación a Planta
 * Autor Oficial: Adrián Palma
 * Copyright: © 2026 Adrián Palma — HBD (Home Board Designer)
 */

import React, { useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  Edit2,
  ShieldCheck,
  Check,
  X,
  AlertTriangle,
  Armchair,
  Palette,
  Sparkles,
  Ruler,
  Layers,
  Save,
  ArrowRight,
  Eye,
} from 'lucide-react';
import {
  ProjectImageDto,
  VisionAnalysisResult,
  FurnitureDetection,
  VisionReviewDto,
  VisionReviewItemDto,
  VisionScaleReference,
} from '@hbd/shared';
import { aiVisionService } from '../../services/aiVision.service.js';
import { Modal } from '../../components/ui/Modal.js';
import { Button } from '../../components/ui/Button.js';
import { Badge } from '../../components/ui/Badge.js';
import { Input } from '../../components/ui/Input.js';
import { VisionImageViewer } from './VisionImageViewer.js';

interface VisionReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  image: ProjectImageDto;
  analysis: VisionAnalysisResult;
  floors?: any[];
  onApplySuccess?: () => void;
}

export const VisionReviewModal: React.FC<VisionReviewModalProps> = ({
  isOpen,
  onClose,
  image,
  analysis,
  floors = [],
  onApplySuccess,
}) => {
  const [selectedDetection, setSelectedDetection] = useState<FurnitureDetection | null>(
    analysis.detectedObjects[0] || null
  );

  // Estado de revisiones por item: id -> { action, customDimensions, customLabel }
  const [reviews, setReviews] = useState<Record<string, VisionReviewItemDto>>(() => {
    const initial: Record<string, VisionReviewItemDto> = {};
    for (const d of analysis.detectedObjects) {
      initial[d.id] = {
        id: d.id,
        action: 'CONFIRM',
        customDimensions: { ...d.estimatedDimensions },
        customLabel: d.label,
      };
    }
    return initial;
  });

  const [selectedFloorId, setSelectedFloorId] = useState<string>(
    image.floorId || floors[0]?.id || ''
  );
  const [scaleReference, setScaleReference] = useState<VisionScaleReference | undefined>(
    analysis.scaleReference
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [applyToProject, setApplyToProject] = useState(true);

  if (!isOpen) return null;

  const handleActionChange = (id: string, action: 'CONFIRM' | 'EDIT' | 'REJECT') => {
    setReviews((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        action,
      },
    }));
  };

  const handleDimensionChange = (id: string, field: 'widthM' | 'depthM' | 'heightM', val: number) => {
    setReviews((prev) => {
      const current = prev[id] || { id, action: 'EDIT' };
      return {
        ...prev,
        [id]: {
          ...current,
          action: 'EDIT',
          customDimensions: {
            widthM: current.customDimensions?.widthM || 1.0,
            depthM: current.customDimensions?.depthM || 1.0,
            heightM: current.customDimensions?.heightM || 1.0,
            [field]: val,
          },
        },
      };
    });
  };

  const handleLabelChange = (id: string, label: string) => {
    setReviews((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        action: 'EDIT',
        customLabel: label,
      },
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const reviewPayload: VisionReviewDto = {
        imageId: image.id,
        projectId: image.projectId,
        floorId: selectedFloorId,
        reviews: Object.values(reviews),
        applyToProject,
        scaleReference,
      };

      const res = await aiVisionService.reviewAndApply(reviewPayload);
      if (res.success) {
        onApplySuccess?.();
        onClose();
      }
    } catch (err) {
      console.error('Error al aplicar revisión de visión:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmedCount = Object.values(reviews).filter(
    (r) => r.action === 'CONFIRM' || r.action === 'EDIT'
  ).length;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Revisión Humana y Sincronización de Visión IA"
      description="Valida y ajusta las dimensiones de los elementos detectados antes de incorporarlos a la vivienda."
      maxWidth="xl"
    >
      <div className="space-y-6">
        {/* Visor Superior */}
        <VisionImageViewer
          image={image}
          analysis={analysis}
          selectedDetectionId={selectedDetection?.id}
          onSelectDetection={(d) => setSelectedDetection(d)}
        />

        {/* Lista de Detecciones y Panel de Edición */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Columna Izquierda: Listado de Objetos */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-gray-200 uppercase tracking-wider flex items-center gap-1.5">
                <Armchair size={14} className="text-brand-400" />
                Elementos Detectados ({analysis.detectedObjects.length})
              </h4>
              <Badge variant="brand">{confirmedCount} a incorporar</Badge>
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {analysis.detectedObjects.map((det) => {
                const currentReview = reviews[det.id] || { action: 'CONFIRM' };
                const isSelected = selectedDetection?.id === det.id;

                return (
                  <div
                    key={det.id}
                    onClick={() => setSelectedDetection(det)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-dark-card border-brand-500 shadow-md shadow-brand-500/10'
                        : 'bg-dark-surface/60 border-dark-border hover:border-dark-border/80'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-brand-400" />
                        <span className="text-xs font-bold text-white">
                          {currentReview.customLabel || det.label}
                        </span>
                      </div>
                      <Badge
                        variant={
                          det.confidence >= 0.9
                            ? 'brand'
                            : det.confidence >= 0.75
                            ? 'warning'
                            : 'gray'
                        }
                      >
                        {Math.round(det.confidence * 100)}%
                      </Badge>
                    </div>

                    <p className="text-[11px] text-gray-400 mt-1">
                      Medida IA: {det.estimatedDimensions.widthM}m × {det.estimatedDimensions.depthM}m × {det.estimatedDimensions.heightM}m (Estimada)
                    </p>

                    {/* Botones de Acción Rápida: Confirmar / Editar / Rechazar */}
                    <div className="flex items-center gap-1.5 mt-2.5 pt-2 border-t border-dark-border/50">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleActionChange(det.id, 'CONFIRM');
                        }}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition-all ${
                          currentReview.action === 'CONFIRM'
                            ? 'bg-emerald-600 text-white shadow-sm'
                            : 'bg-dark-card text-gray-400 hover:text-white'
                        }`}
                      >
                        <Check size={12} /> Confirmar
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleActionChange(det.id, 'EDIT');
                        }}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition-all ${
                          currentReview.action === 'EDIT'
                            ? 'bg-amber-600 text-white shadow-sm'
                            : 'bg-dark-card text-gray-400 hover:text-white'
                        }`}
                      >
                        <Edit2 size={12} /> Ajustar Medidas
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleActionChange(det.id, 'REJECT');
                        }}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition-all ${
                          currentReview.action === 'REJECT'
                            ? 'bg-rose-600 text-white shadow-sm'
                            : 'bg-dark-card text-gray-400 hover:text-white'
                        }`}
                      >
                        <X size={12} /> Rechazar
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Columna Derecha: Inspector & Ajuste de Dimensiones del Elemento Seleccionado */}
          <div className="space-y-4 p-4 rounded-2xl bg-dark-card border border-dark-border">
            {selectedDetection ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-dark-border/50 pb-2">
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Edit2 size={14} className="text-amber-400" />
                    Propiedades y Medidas Reales
                  </h4>
                  <Badge variant="gray">Fuente: Confirmación Humana</Badge>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-400 uppercase mb-1">
                    Nombre / Etiqueta del Mueble
                  </label>
                  <Input
                    value={reviews[selectedDetection.id]?.customLabel || selectedDetection.label}
                    onChange={(e) => handleLabelChange(selectedDetection.id, e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-3 gap-2 pt-1">
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-400 uppercase mb-1">
                      Ancho (m)
                    </label>
                    <input
                      type="number"
                      step="0.05"
                      value={reviews[selectedDetection.id]?.customDimensions?.widthM || selectedDetection.estimatedDimensions.widthM}
                      onChange={(e) => handleDimensionChange(selectedDetection.id, 'widthM', parseFloat(e.target.value) || 0.5)}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-dark-surface border border-dark-border text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-400 uppercase mb-1">
                      Fondo (m)
                    </label>
                    <input
                      type="number"
                      step="0.05"
                      value={reviews[selectedDetection.id]?.customDimensions?.depthM || selectedDetection.estimatedDimensions.depthM}
                      onChange={(e) => handleDimensionChange(selectedDetection.id, 'depthM', parseFloat(e.target.value) || 0.5)}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-dark-surface border border-dark-border text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-400 uppercase mb-1">
                      Alto (m)
                    </label>
                    <input
                      type="number"
                      step="0.05"
                      value={reviews[selectedDetection.id]?.customDimensions?.heightM || selectedDetection.estimatedDimensions.heightM}
                      onChange={(e) => handleDimensionChange(selectedDetection.id, 'heightM', parseFloat(e.target.value) || 0.5)}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-dark-surface border border-dark-border text-xs text-white"
                    />
                  </div>
                </div>

                {selectedDetection.visualProperties && (
                  <div className="p-2.5 rounded-xl bg-dark-surface/60 border border-dark-border text-xs space-y-1">
                    <p className="text-[11px] text-gray-400">
                      Acabado visual detectado: <strong className="text-gray-200">{selectedDetection.visualProperties.materialType || 'No clasificado'}</strong>
                    </p>
                    <p className="text-[11px] text-gray-400">
                      Color dominante: <strong className="text-gray-200">{selectedDetection.visualProperties.colorName || 'Neutro'}</strong>
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs text-gray-400 py-6 text-center">
                Selecciona un elemento de la lista para inspeccionar y ajustar sus medidas.
              </p>
            )}

            {/* Configuración de Destino en Planta */}
            <div className="pt-3 border-t border-dark-border/50 space-y-2">
              <label className="block text-xs font-bold text-gray-300 uppercase flex items-center gap-1.5">
                <Layers size={13} /> Planta de Destino
              </label>
              <select
                value={selectedFloorId}
                onChange={(e) => setSelectedFloorId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-dark-surface border border-dark-border text-xs text-white focus:border-brand-500 focus:outline-none"
              >
                {floors.map((f: any) => (
                  <option key={f.id} value={f.id}>
                    {f.name} (Nivel {f.level})
                  </option>
                ))}
              </select>

              <label className="flex items-center gap-2 pt-2 cursor-pointer text-xs text-gray-300">
                <input
                  type="checkbox"
                  checked={applyToProject}
                  onChange={(e) => setApplyToProject(e.target.checked)}
                  className="w-4 h-4 rounded text-brand-500 bg-dark-surface border-dark-border focus:ring-0"
                />
                <span>Incorporar automáticamente al modelo 2D y 3D de la planta</span>
              </label>
            </div>
          </div>
        </div>

        {/* Botones de Cierre y Aplicación */}
        <div className="flex items-center justify-between pt-4 border-t border-dark-border/60">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <ShieldCheck size={15} className="text-emerald-400" />
            <span>Las medidas confirmadas no serán sobreescritas por futuras estimaciones de IA.</span>
          </div>

          <div className="flex items-center gap-3">
            <Button type="button" variant="ghost" size="sm" onClick={onClose}>
              Cerrar
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              disabled={isSubmitting || confirmedCount === 0}
              onClick={handleSubmit}
              icon={<Save size={15} />}
            >
              {isSubmitting ? 'Sincronizando...' : `Guardar y Aplicar (${confirmedCount})`}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
