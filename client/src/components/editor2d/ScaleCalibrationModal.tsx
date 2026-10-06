import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Sliders, CheckCircle2, Ruler } from 'lucide-react';
import { Modal } from '../ui/Modal.js';
import { Button } from '../ui/Button.js';
import { Input } from '../ui/Input.js';

interface ScaleCalibrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  p1: { x: number; y: number } | null;
  p2: { x: number; y: number } | null;
  pixelDistance: number;
  onCalibrate: (meters: number) => void;
}

export const ScaleCalibrationModal: React.FC<ScaleCalibrationModalProps> = ({
  isOpen,
  onClose,
  p1,
  p2,
  pixelDistance,
  onCalibrate,
}) => {
  const { t } = useTranslation();
  const [meters, setMeters] = useState<string>('3.00');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(meters);
    if (val > 0) {
      onCalibrate(val);
      onClose();
    }
  };

  const calculatedPpm = parseFloat(meters) > 0 && pixelDistance > 0
    ? Math.round(pixelDistance / parseFloat(meters))
    : 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('editor2d.scaleCalibrationTitle')}
      description={t('editor2d.scaleCalibrationSubtitle')}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="p-3.5 rounded-xl bg-dark-card border border-dark-border text-xs space-y-2">
          <div className="flex justify-between text-gray-400">
            <span>{t('editor2d.measuredDistance')}:</span>
            <span className="font-mono text-white font-bold">{Math.round(pixelDistance)} px</span>
          </div>
          <div className="flex justify-between text-gray-400">
            <span>{t('plans.scaleDetected') || 'Scale factor'}:</span>
            <span className="font-mono text-brand-400 font-bold">{calculatedPpm} px / m</span>
          </div>
        </div>

        <Input
          label={t('editor2d.referenceDistanceM')}
          type="number"
          step="0.01"
          min="0.1"
          placeholder="3.00"
          value={meters}
          onChange={(e) => setMeters(e.target.value)}
          required
          autoFocus
        />

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-dark-border">
          <Button type="button" variant="ghost" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" icon={<CheckCircle2 size={16} />}>
            {t('editor2d.applyScale')}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
