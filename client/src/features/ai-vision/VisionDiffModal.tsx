/**
 * HBD — HOME BOARD DESIGNER (V9.0.0)
 * VisionDiffModal — Comparador de Foto Real vs Modelo Estructurado 3D/2D
 * Autor Oficial: Adrián Palma
 * Copyright: © 2026 Adrián Palma — HBD (Home Board Designer)
 */

import React, { useState, useEffect } from 'react';
import {
  GitCompare,
  CheckCircle2,
  AlertTriangle,
  PlusCircle,
  HelpCircle,
  Sparkles,
  Loader2,
  Armchair,
  Layers,
  ArrowRight,
} from 'lucide-react';
import {
  ProjectImageDto,
  VisionDiffResult,
  VisionDiffItem,
} from '@hbd/shared';
import { aiVisionService } from '../../services/aiVision.service.js';
import { Modal } from '../../components/ui/Modal.js';
import { Button } from '../../components/ui/Button.js';
import { Badge } from '../../components/ui/Badge.js';
import { Card } from '../../components/ui/Card.js';

interface VisionDiffModalProps {
  isOpen: boolean;
  onClose: () => void;
  image: ProjectImageDto;
  onSyncRequested?: () => void;
}

export const VisionDiffModal: React.FC<VisionDiffModalProps> = ({
  isOpen,
  onClose,
  image,
  onSyncRequested,
}) => {
  const [diffResult, setDiffResult] = useState<VisionDiffResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  useEffect(() => {
    if (isOpen && image) {
      setIsLoading(true);
      aiVisionService
        .compareWithProject(image.id)
        .then((res) => {
          if (res.success && res.data) {
            setDiffResult(res.data);
          }
        })
        .catch(console.error)
        .finally(() => setIsLoading(false));
    }
  }, [isOpen, image]);

  if (!isOpen) return null;

  const items = diffResult?.items || [];
  const filteredItems = filterStatus === 'ALL' ? items : items.filter((i) => i.status === filterStatus);

  const matchCount = items.filter((i) => i.status === 'MATCH').length;
  const newCount = items.filter((i) => i.status === 'NEW').length;
  const missingCount = items.filter((i) => i.status === 'MISSING').length;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Comparativa Visual: Fotografía Real vs Modelo del Proyecto"
      description="Analiza discrepancias, piezas añadidas en la realidad y mobiliario proyectado que no se aprecia en la foto."
      maxWidth="xl"
    >
      <div className="space-y-6">
        {isLoading ? (
          <div className="py-16 text-center space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-brand-400 mx-auto" />
            <p className="text-xs text-gray-300">
              Comparando detecciones de imagen contra el gemelo digital del proyecto...
            </p>
          </div>
        ) : diffResult ? (
          <>
            {/* Cabecera con Métricas de Coincidencia */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-xl bg-dark-card border border-dark-border">
                <span className="text-[11px] font-semibold text-gray-400 uppercase">
                  Coincidencia Global
                </span>
                <p className="text-2xl font-black text-brand-400 mt-1">
                  {diffResult.overallMatchScore}%
                </p>
              </div>

              <div
                onClick={() => setFilterStatus(filterStatus === 'MATCH' ? 'ALL' : 'MATCH')}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                  filterStatus === 'MATCH'
                    ? 'bg-emerald-500/20 border-emerald-500'
                    : 'bg-dark-card border-dark-border hover:border-emerald-500/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-emerald-400 uppercase flex items-center gap-1">
                    <CheckCircle2 size={13} /> Coincidentes
                  </span>
                  <Badge variant="brand">{matchCount}</Badge>
                </div>
                <p className="text-xs text-gray-400 mt-1.5">Presentes en foto y proyecto</p>
              </div>

              <div
                onClick={() => setFilterStatus(filterStatus === 'NEW' ? 'ALL' : 'NEW')}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                  filterStatus === 'NEW'
                    ? 'bg-cyan-500/20 border-cyan-500'
                    : 'bg-dark-card border-dark-border hover:border-cyan-500/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-cyan-400 uppercase flex items-center gap-1">
                    <PlusCircle size={13} /> Nuevos en Foto
                  </span>
                  <Badge variant="brand">{newCount}</Badge>
                </div>
                <p className="text-xs text-gray-400 mt-1.5">Detectados solo en la imagen</p>
              </div>

              <div
                onClick={() => setFilterStatus(filterStatus === 'MISSING' ? 'ALL' : 'MISSING')}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                  filterStatus === 'MISSING'
                    ? 'bg-amber-500/20 border-amber-500'
                    : 'bg-dark-card border-dark-border hover:border-amber-500/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-amber-400 uppercase flex items-center gap-1">
                    <AlertTriangle size={13} /> No Visibles
                  </span>
                  <Badge variant="warning">{missingCount}</Badge>
                </div>
                <p className="text-xs text-gray-400 mt-1.5">En plano pero no en foto</p>
              </div>
            </div>

            {/* Listado de Elementos Comparados */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
                  <GitCompare size={14} className="text-brand-400" />
                  Detalle de Elementos ({filteredItems.length})
                </h4>
                {filterStatus !== 'ALL' && (
                  <button
                    onClick={() => setFilterStatus('ALL')}
                    className="text-xs text-brand-400 hover:underline"
                  >
                    Ver todos
                  </button>
                )}
              </div>

              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {filteredItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-dark-card/70 border border-dark-border flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          item.status === 'MATCH'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : item.status === 'NEW'
                            ? 'bg-cyan-500/20 text-cyan-400'
                            : 'bg-amber-500/20 text-amber-400'
                        }`}
                      >
                        <Armchair size={16} />
                      </div>
                      <div>
                        <p className="font-bold text-white">{item.name}</p>
                        <p className="text-[11px] text-gray-400">{item.message}</p>
                      </div>
                    </div>

                    <Badge
                      variant={
                        item.status === 'MATCH'
                          ? 'brand'
                          : item.status === 'NEW'
                          ? 'brand'
                          : 'warning'
                      }
                    >
                      {item.status === 'MATCH'
                        ? 'Coincidencia'
                        : item.status === 'NEW'
                        ? 'Elemento Nuevo'
                        : 'No Identificado'}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            <p className="text-xs text-gray-400 italic bg-dark-card/40 p-3 rounded-xl border border-dark-border">
              {diffResult.summary}
            </p>
          </>
        ) : (
          <p className="text-xs text-gray-400 py-8 text-center">
            No se pudo generar la comparativa visual.
          </p>
        )}

        {/* Acciones */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-dark-border/60">
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            Cerrar
          </Button>
          {onSyncRequested && (
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={() => {
                onClose();
                onSyncRequested();
              }}
              icon={<ArrowRight size={15} />}
            >
              Revisar y Sincronizar Elementos
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};
