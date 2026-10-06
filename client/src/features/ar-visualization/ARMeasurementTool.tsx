/**
 * AR Measurement Tool Component (Phase V22 / v1.22.0)
 * In-AR point-to-point measuring list, space fitting checks, and metric logs.
 * Copyright © 2026 Adrián Palma. Todos los derechos reservados.
 */

import React, { useState } from 'react';
import { ARMeasurementEngine, ARMeasurementItem, ARSurfaceType } from '@hbd/shared';
import { Ruler, Plus, CheckCircle2, AlertCircle, Trash2 } from 'lucide-react';
import { ARVisualizationService } from '../../services/arVisualization.service';

interface ARMeasurementToolProps {
  measurements: ARMeasurementItem[];
  onAddMeasurement: (item: ARMeasurementItem) => void;
  onDeleteMeasurement?: (id: string) => void;
}

export const ARMeasurementTool: React.FC<ARMeasurementToolProps> = ({
  measurements,
  onAddMeasurement,
  onDeleteMeasurement,
}) => {
  const [pointAx, setPointAx] = useState<number>(0);
  const [pointAy, setPointAy] = useState<number>(0);
  const [pointAz, setPointAz] = useState<number>(0);
  const [pointBx, setPointBx] = useState<number>(2.4);
  const [pointBy, setPointBy] = useState<number>(0);
  const [pointBz, setPointBz] = useState<number>(0);
  const [surfaceType, setSurfaceType] = useState<ARSurfaceType>('FLOOR');
  const [label, setLabel] = useState<string>('Hueco para armario / sofá');
  const [targetSizeMeters, setTargetSizeMeters] = useState<number>(2.0);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await ARVisualizationService.measure(
        { x: pointAx, y: pointAy, z: pointAz },
        { x: pointBx, y: pointBy, z: pointBz },
        surfaceType,
        label
      );
      onAddMeasurement(res);
    } catch (err: any) {
      console.error('Error measuring AR distance', err);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
      <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-700/60 mb-4">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <Ruler className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          Mediciones en Espacio Físico Real (AR)
        </h4>
        <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
          {measurements.length} registradas
        </span>
      </div>

      {/* Measurement list */}
      <div className="space-y-2 mb-4 max-h-56 overflow-y-auto pr-1">
        {measurements.length === 0 ? (
          <div className="text-center py-6 border border-dashed border-gray-200 dark:border-gray-700 rounded-lg text-xs text-gray-400">
            No hay mediciones registradas. Selecciona 2 puntos en el espacio AR.
          </div>
        ) : (
          measurements.map((m) => {
            const fitCheck = targetSizeMeters > 0
              ? ARMeasurementEngine.checkFitsInMeasuredSpace(m.distanceMeters, targetSizeMeters)
              : null;

            return (
              <div
                key={m.id}
                className="flex items-center justify-between p-2.5 rounded-lg border border-gray-100 dark:border-gray-700 bg-gray-50/60 dark:bg-gray-750 text-xs"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-800 dark:text-gray-200 truncate">
                      {m.label || 'Medición'}
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900/60 dark:text-indigo-200">
                      {ARMeasurementEngine.formatDistance(m.distanceMeters)}
                    </span>
                  </div>
                  <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 flex items-center gap-2">
                    <span>Superficie: {m.surfaceType}</span>
                    <span>•</span>
                    <span>Calidad: {m.quality}</span>
                  </div>
                  {fitCheck && (
                    <div className={`text-[10px] mt-1 font-medium flex items-center gap-1 ${
                      fitCheck.fits ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                    }`}>
                      {fitCheck.fits ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                      {fitCheck.message}
                    </div>
                  )}
                </div>
                {onDeleteMeasurement && (
                  <button
                    onClick={() => onDeleteMeasurement(m.id)}
                    className="p-1 text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 rounded transition-colors ml-2"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Quick Validation & Add form */}
      <form onSubmit={handleCreate} className="pt-3 border-t border-gray-100 dark:border-gray-700/60 space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-[11px] font-medium text-gray-600 dark:text-gray-400 mb-1">
              Etiqueta de la Medición
            </label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="Hueco libre pared..."
              required
            />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-gray-600 dark:text-gray-400 mb-1">
              Validar elemento de tamaño (m)
            </label>
            <input
              type="number"
              step="0.05"
              min="0.1"
              value={targetSizeMeters}
              onChange={(e) => setTargetSizeMeters(parseFloat(e.target.value) || 0)}
              className="w-full px-2.5 py-1.5 text-xs border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="Ej: 2.0"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className="block text-[10px] text-gray-500">Punto A (X, Y, Z)</label>
            <div className="flex gap-1 mt-0.5">
              <input
                type="number"
                step="0.1"
                value={pointAx}
                onChange={(e) => setPointAx(parseFloat(e.target.value) || 0)}
                className="w-full px-1.5 py-1 text-[11px] border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
          </div>
          <div>
            <label className="block text-[10px] text-gray-500">Punto B (X)</label>
            <div className="flex gap-1 mt-0.5">
              <input
                type="number"
                step="0.1"
                value={pointBx}
                onChange={(e) => setPointBx(parseFloat(e.target.value) || 0)}
                className="w-full px-1.5 py-1 text-[11px] border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
          </div>
          <div>
            <label className="block text-[10px] text-gray-500">Superficie</label>
            <select
              value={surfaceType}
              onChange={(e) => setSurfaceType(e.target.value as ARSurfaceType)}
              className="w-full mt-0.5 px-1.5 py-1 text-[11px] border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="FLOOR">Suelo</option>
              <option value="WALL">Pared</option>
              <option value="CEILING">Techo</option>
              <option value="TABLE_TOP">Mesa</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          className="w-full flex items-center justify-center gap-1.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Registrar Medición en AR
        </button>
      </form>
    </div>
  );
};
