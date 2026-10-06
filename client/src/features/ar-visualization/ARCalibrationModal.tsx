/**
 * AR Calibration Modal (Phase V22 / v1.22.0)
 * Allows calibrating metric scale using known physical references (doors, windows, A4 marker, or custom dimensions).
 * Copyright © 2026 Adrián Palma. Todos los derechos reservados.
 */

import React, { useState } from 'react';
import { ARCalibrationResult, ARReferenceType, STANDARD_REFERENCE_DIMENSIONS } from '@hbd/shared';
import { Ruler, CheckCircle2, AlertCircle, X } from 'lucide-react';
import { ARVisualizationService } from '../../services/arVisualization.service';

interface ARCalibrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCalibrationComplete: (result: ARCalibrationResult) => void;
}

export const ARCalibrationModal: React.FC<ARCalibrationModalProps> = ({
  isOpen,
  onClose,
  onCalibrationComplete,
}) => {
  const [referenceType, setReferenceType] = useState<ARReferenceType>('DOOR_STANDARD');
  const [pixelSpan, setPixelSpan] = useState<number>(300);
  const [customMeters, setCustomMeters] = useState<number>(STANDARD_REFERENCE_DIMENSIONS.DOOR_STANDARD.defaultMeters);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<ARCalibrationResult | null>(null);

  if (!isOpen) return null;

  const handleTypeChange = (type: ARReferenceType) => {
    setReferenceType(type);
    setCustomMeters(STANDARD_REFERENCE_DIMENSIONS[type].defaultMeters);
  };

  const handleCalibrate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await ARVisualizationService.calibrate(referenceType, pixelSpan, customMeters);
      setResult(res);
      onCalibrationComplete(res);
    } catch (err: any) {
      console.error('Calibration error', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <Ruler className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Calibración Métrica de Escala AR
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleCalibrate} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-gray-600 dark:text-gray-300 mb-1.5">
              Tipo de Referencia Conocida
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {(Object.keys(STANDARD_REFERENCE_DIMENSIONS) as ARReferenceType[]).map((type) => {
                const info = STANDARD_REFERENCE_DIMENSIONS[type];
                const isSelected = referenceType === type;
                return (
                  <button
                    type="button"
                    key={type}
                    onClick={() => handleTypeChange(type)}
                    className={`p-2.5 rounded-lg border text-left text-xs transition-all ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/40 text-indigo-950 dark:text-indigo-200 font-semibold'
                        : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-750'
                    }`}
                  >
                    <div className="truncate font-medium">{info.description}</div>
                    <div className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">
                      Estándar: {info.defaultMeters} m ({info.quality})
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Dimensión Real (Metros)
              </label>
              <input
                type="number"
                step="0.01"
                min="0.05"
                value={customMeters}
                onChange={(e) => setCustomMeters(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 text-sm border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Distancia en Píxeles en Cámara/Foto
              </label>
              <input
                type="number"
                step="1"
                min="10"
                value={pixelSpan}
                onChange={(e) => setPixelSpan(parseInt(e.target.value, 10) || 0)}
                className="w-full px-3 py-2 text-sm border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              />
            </div>
          </div>

          {result && (
            <div className={`p-3 rounded-lg text-xs flex items-start gap-2 ${
              result.isValid
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
                : 'bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200'
            }`}>
              {result.isValid ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              )}
              <div>
                <p className="font-semibold">{result.message}</p>
                <p className="text-[11px] opacity-90 mt-0.5">
                  Calidad: {result.quality} | Confianza: {(result.confidence * 100).toFixed(0)}%
                </p>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-3 border-t border-gray-100 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              Cerrar
            </button>
            <button
              type="submit"
              disabled={isSubmitting || pixelSpan <= 0 || customMeters <= 0}
              className="px-4 py-2 text-xs font-medium bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg disabled:opacity-50 transition-colors shadow-sm"
            >
              {isSubmitting ? 'Calculando...' : 'Aplicar Calibración'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
