/**
 * HBD — HOME BOARD DESIGNER (V14.0.0)
 * MODO DE PRESENTACIÓN VISUAL PARA CLIENTES
 * CLIENT PRESENTATION MODAL
 *
 * Autor: Adrián Palma
 * Copyright: © 2026 Adrián Palma. Todos los derechos reservados.
 */

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  Sparkles,
  Layers,
  Box,
  CheckCircle,
  X,
} from 'lucide-react';
import { Modal } from '../../components/ui/Modal.js';
import { Button } from '../../components/ui/Button.js';
import { Badge } from '../../components/ui/Badge.js';
import { ProjectDocumentDto } from '@hbd/shared';

interface ClientPresentationModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: ProjectDocumentDto | null;
}

export const ClientPresentationModal: React.FC<ClientPresentationModalProps> = ({
  isOpen,
  onClose,
  document,
}) => {
  const { t } = useTranslation();
  const [currentSlideIndex, setCurrentSlideIndex] = useState<number>(0);

  const sections = (document?.sections || []).filter(
    (s) => s.isEnabled && s.type !== 'DISCLAIMER' && s.type !== 'NOTES'
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'ArrowRight' || e.key === 'Space') {
        setCurrentSlideIndex((prev) => Math.min(sections.length - 1, prev + 1));
      } else if (e.key === 'ArrowLeft') {
        setCurrentSlideIndex((prev) => Math.max(0, prev - 1));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, sections.length]);

  if (!isOpen || !document || sections.length === 0) return null;

  const activeSection = sections[currentSlideIndex];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${t('documents.presentation.title')} ${document.name}`}
      description={t('documents.presentation.description')}
    >
      <div className="space-y-4">
        {/* Controles de diapositiva */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-dark-card border border-dark-border">
          <div className="flex items-center gap-2">
            <Badge variant="brand">{t("documents.presentation.commercialBadge")}</Badge>
            <span className="text-xs text-gray-400 font-mono">
              Diapositiva {currentSlideIndex + 1} de {sections.length}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="secondary"
              icon={<ChevronLeft size={16} />}
              onClick={() => setCurrentSlideIndex((prev) => Math.max(0, prev - 1))}
              disabled={currentSlideIndex === 0}
            >
              Anterior
            </Button>
            <Button
              size="sm"
              variant="primary"
              icon={<ChevronRight size={16} />}
              onClick={() => setCurrentSlideIndex((prev) => Math.min(sections.length - 1, prev + 1))}
              disabled={currentSlideIndex === sections.length - 1}
            >
              Siguiente
            </Button>
          </div>
        </div>

        {/* Diapositiva Principal */}
        <div className="relative min-h-[440px] rounded-2xl bg-gradient-to-br from-slate-900 via-dark-surface to-dark-card border border-dark-border p-8 flex flex-col justify-between shadow-2xl overflow-hidden">
          {/* Fondo Decorativo */}
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Cabecera del Slide */}
          <div className="flex items-center justify-between border-b border-dark-border/50 pb-4">
            <div>
              <span className="text-xs font-semibold text-brand-400 uppercase tracking-widest flex items-center gap-1.5">
                <Sparkles size={14} /> {document.name}
              </span>
              <h2 className="text-2xl font-black text-white mt-1">{activeSection.title}</h2>
            </div>
            <Badge variant="gray">{t("documents.presentation.suite")}</Badge>
          </div>

          {/* Cuerpo Central del Slide */}
          <div className="my-auto py-6">
            {activeSection.type === 'COVER' && (
              <div className="text-center space-y-4 py-8">
                <h1 className="text-4xl font-black text-white tracking-tight">
                  {activeSection.contentData?.projectName}
                </h1>
                <p className="text-lg text-brand-300 font-medium">{activeSection.contentData?.scenarioName}</p>
                <div className="w-20 h-1 bg-gradient-to-r from-brand-400 to-emerald-500 mx-auto rounded-full" />
                <p className="text-xs text-gray-400 pt-4">
                  Presentado para: <strong className="text-gray-200">{activeSection.contentData?.clientName}</strong>
                </p>
              </div>
            )}

            {activeSection.type === 'PROJECT_SUMMARY' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-5 rounded-xl bg-dark-surface/80 border border-dark-border/60">
                  <span className="text-xs text-gray-400">{t("documents.presentation.area")}</span>
                  <p className="text-3xl font-extrabold text-brand-400 mt-2">
                    {activeSection.contentData?.totalUsableAreaM2} m²
                  </p>
                  <p className="text-[11px] text-gray-500 mt-1">{t("documents.presentation.areaDesc")}</p>
                </div>

                <div className="p-5 rounded-xl bg-dark-surface/80 border border-dark-border/60">
                  <span className="text-xs text-gray-400">{t("documents.presentation.rooms")}</span>
                  <p className="text-3xl font-extrabold text-white mt-2">
                    {activeSection.contentData?.totalRooms}
                  </p>
                  <p className="text-[11px] text-gray-500 mt-1">{t("documents.presentation.roomsDesc")}</p>
                </div>

                <div className="p-5 rounded-xl bg-dark-surface/80 border border-dark-border/60">
                  <span className="text-xs text-gray-400">{t("documents.presentation.budget")}</span>
                  <p className="text-3xl font-extrabold text-emerald-400 mt-2">
                    {activeSection.contentData?.estimatedCostEur} €
                  </p>
                  <p className="text-[11px] text-gray-500 mt-1">{t("documents.presentation.budgetDesc")}</p>
                </div>
              </div>
            )}

            {activeSection.type === 'PROPOSED_PLAN' && (
              <div className="text-center p-8 rounded-xl bg-dark-surface/60 border border-dashed border-dark-border space-y-3">
                <div className="w-16 h-16 rounded-2xl bg-brand-500/10 border border-brand-500/20 text-brand-400 flex items-center justify-center mx-auto">
                  <Layers size={32} />
                </div>
                <h4 className="text-lg font-bold text-white">{t("documents.presentation.planTitle")}</h4>
                <p className="text-xs text-gray-400 max-w-md mx-auto">
                  {activeSection.contentData?.description || t("documents.presentation.planDesc")}
                </p>
              </div>
            )}

            {activeSection.type === 'RENDERS' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-6 rounded-xl bg-dark-surface/80 border border-dark-border/60 text-center space-y-2">
                  <Box size={28} className="text-cyan-400 mx-auto" />
                  <h4 className="text-sm font-bold text-gray-100">{t("documents.presentation.mainView")}</h4>
                  <p className="text-xs text-gray-400">{t("documents.presentation.mainViewDesc")}</p>
                </div>
                <div className="p-6 rounded-xl bg-dark-surface/80 border border-dark-border/60 text-center space-y-2">
                  <Box size={28} className="text-purple-400 mx-auto" />
                  <h4 className="text-sm font-bold text-gray-100">{t("documents.presentation.nightView")}</h4>
                  <p className="text-xs text-gray-400">{t("documents.presentation.nightViewDesc")}</p>
                </div>
              </div>
            )}

            {activeSection.type === 'BUDGET' && (
              <div className="p-6 rounded-xl bg-dark-surface/80 border border-dark-border/60 max-w-lg mx-auto text-center space-y-3">
                <span className="text-xs text-gray-400">{t("documents.presentation.globalBudget")}</span>
                <p className="text-4xl font-black text-emerald-400">
                  {activeSection.contentData?.totalEstimatedCostEur} €
                </p>
                <p className="text-xs text-gray-400">
                  Incluye partidas de albañilería, acabados, suministros y gestión de residuos.
                </p>
              </div>
            )}

            {activeSection.type === 'CONCLUSIONS' && (
              <div className="p-6 rounded-xl bg-dark-surface/80 border border-dark-border/60 max-w-xl mx-auto space-y-3 text-xs">
                <p className="text-gray-200 text-sm font-medium leading-relaxed">
                  {activeSection.contentData?.text}
                </p>
                <div className="space-y-1.5 pt-2">
                  {(activeSection.contentData?.recommendations || []).map((rec: string, i: number) => (
                    <div key={i} className="flex items-center gap-2 text-gray-300">
                      <CheckCircle size={14} className="text-emerald-400 shrink-0" />
                      <span>{rec}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Pie de Slide */}
          <div className="flex items-center justify-between border-t border-dark-border/40 pt-3 text-[11px] text-gray-500">
            <span>{t("documents.presentation.navHint")}</span>
            <span>© 2026 Adrián Palma — HBD</span>
          </div>
        </div>
      </div>
    </Modal>
  );
};
