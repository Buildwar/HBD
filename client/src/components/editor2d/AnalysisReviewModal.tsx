import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  ShieldCheck,
  Maximize2,
  DoorOpen,
  Square,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { Modal } from '../ui/Modal.js';
import { Button } from '../ui/Button.js';
import { Badge } from '../ui/Badge.js';
import { FloorPlanAnalysisData } from '../../services/floorplan.service.js';

interface AnalysisReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  analysis: FloorPlanAnalysisData | null;
  onConfirmImport: () => void;
  isConfirming: boolean;
}

export const AnalysisReviewModal: React.FC<AnalysisReviewModalProps> = ({
  isOpen,
  onClose,
  analysis,
  onConfirmImport,
  isConfirming,
}) => {
  const { t } = useTranslation();
  if (!analysis) return null;

  const { validation, scale, walls, rooms, doors, windows } = analysis;
  const breakdown = validation.confidenceBreakdown;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('editor2d.analysisReviewTitle')}
      description={t('editor2d.subtitle')}
    >
      <div className="space-y-5">
        {/* Score and Status Banner */}
        <div className="p-4 rounded-2xl bg-brand-500/10 border border-brand-500/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-500/20 text-brand-400 flex items-center justify-center">
              <ShieldCheck size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-white">{t('editor2d.analysisCompleted')}</h4>
                <Badge variant="brand">{validation.score}% {t('plans.accuracy') || 'Score'}</Badge>
              </div>
              <p className="text-xs text-gray-300 mt-0.5">
                {t('plans.scaleDetected') || 'Scale'}: 1m = {Math.round(scale.scaleFactor)}px ({scale.scaleRatioText || '1:100'})
              </p>
            </div>
          </div>

          <div className="text-right hidden sm:block">
            <span className="text-xs text-gray-400 font-medium">{t('editor2d.totalArea')}</span>
            <p className="text-lg font-bold text-brand-400">{validation.elementsSummary.totalAreaM2} m²</p>
          </div>
        </div>

        {/* Elements Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-xl bg-dark-card border border-dark-border">
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <Layers size={14} className="text-brand-400" />
              <span>{t('editor2d.wallsCount')}</span>
            </div>
            <p className="text-xl font-bold text-white mt-1">{walls.length}</p>
          </div>

          <div className="p-3 rounded-xl bg-dark-card border border-dark-border">
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <Square size={14} className="text-blue-400" />
              <span>{t('editor2d.roomsCount')}</span>
            </div>
            <p className="text-xl font-bold text-blue-400 mt-1">{rooms.length}</p>
          </div>

          <div className="p-3 rounded-xl bg-dark-card border border-dark-border">
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <DoorOpen size={14} className="text-emerald-400" />
              <span>{t('editor2d.doorsCount')}</span>
            </div>
            <p className="text-xl font-bold text-emerald-400 mt-1">{doors.length}</p>
          </div>

          <div className="p-3 rounded-xl bg-dark-card border border-dark-border">
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <Maximize2 size={14} className="text-cyan-400" />
              <span>{t('editor2d.windowsCount')}</span>
            </div>
            <p className="text-xl font-bold text-cyan-400 mt-1">{windows.length}</p>
          </div>
        </div>

        {/* Confidence Breakdown Bars */}
        <div className="p-4 rounded-xl bg-dark-card/60 border border-dark-border space-y-2.5">
          <h5 className="text-xs font-bold text-gray-200 uppercase tracking-wider">
            {t('plans.confidenceLevels') || 'Confidence'}
          </h5>

          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <span className="text-emerald-400 font-bold text-sm">{breakdown.high}</span>
              <p className="text-[10px] text-gray-400 mt-0.5">{t('editor2d.highConfidence')}</p>
            </div>

            <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <span className="text-amber-400 font-bold text-sm">{breakdown.medium}</span>
              <p className="text-[10px] text-gray-400 mt-0.5">{t('editor2d.mediumConfidence')}</p>
            </div>

            <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/20">
              <span className="text-rose-400 font-bold text-sm">{breakdown.low}</span>
              <p className="text-[10px] text-gray-400 mt-0.5">{t('editor2d.lowConfidence')}</p>
            </div>
          </div>
        </div>

        {/* Warnings / Recommendations */}
        {validation.warnings && validation.warnings.length > 0 && (
          <div className="space-y-1.5">
            <h5 className="text-xs font-bold text-gray-300">{t('editor2d.validationNotes')}</h5>
            <div className="space-y-1">
              {validation.warnings.map((w, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2 p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200"
                >
                  <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                  <span>{w}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between gap-3 pt-4 border-t border-dark-border">
          <Button variant="ghost" onClick={onClose}>
            {t('common.close')}
          </Button>

          <Button
            variant="primary"
            icon={isConfirming ? undefined : <CheckCircle2 size={16} />}
            onClick={onConfirmImport}
            disabled={isConfirming}
          >
            {isConfirming ? t('common.saving') : t('plans.confirmImport') || 'Confirm & Import'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
