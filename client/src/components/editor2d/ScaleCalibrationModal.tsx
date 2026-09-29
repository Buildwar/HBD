import React, { useState } from 'react';
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
      title="Calibración de Escala del Plano"
      description="Indica la distancia real en metros entre los 2 puntos seleccionados en el plano."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="p-3.5 rounded-xl bg-dark-card border border-dark-border text-xs space-y-2">
          <div className="flex justify-between text-gray-400">
            <span>Distancia medida en píxeles:</span>
            <span className="font-mono text-white font-bold">{Math.round(pixelDistance)} px</span>
          </div>
          <div className="flex justify-between text-gray-400">
            <span>Factor de escala resultante:</span>
            <span className="font-mono text-brand-400 font-bold">{calculatedPpm} px / metro</span>
          </div>
        </div>

        <Input
          label="Distancia Real en Metros (m)"
          type="number"
          step="0.01"
          min="0.1"
          placeholder="Ej. 3.42"
          value={meters}
          onChange={(e) => setMeters(e.target.value)}
          required
          autoFocus
        />

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-dark-border">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" icon={<CheckCircle2 size={16} />}>
            Aplicar Calibración
          </Button>
        </div>
      </form>
    </Modal>
  );
};
