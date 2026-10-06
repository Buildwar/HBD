/**
 * Property Snapshot Manager Component (Phase V23 / v1.23.0)
 * Allows creating, browsing, and comparing historical snapshots of property states.
 * Copyright © 2026 Adrián Palma. Todos los derechos reservados.
 */

import React, { useState } from 'react';
import { PropertySnapshotDto, PropertySnapshotStateType } from '@hbd/shared';
import { Camera, History, Plus, ArrowRightLeft, Calendar, FileText } from 'lucide-react';
import { PropertyService } from '../../services/property.service';

interface PropertySnapshotManagerProps {
  propertyId: string;
  snapshots: PropertySnapshotDto[];
  onSnapshotCreated: (snap: PropertySnapshotDto) => void;
}

export const PropertySnapshotManager: React.FC<PropertySnapshotManagerProps> = ({
  propertyId,
  snapshots,
  onSnapshotCreated,
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [snapshotName, setSnapshotName] = useState('');
  const [stateType, setStateType] = useState<PropertySnapshotStateType>('INITIAL_EXISTING');
  const [description, setDescription] = useState('');
  const [selectedSnapA, setSelectedSnapA] = useState<string>('');
  const [selectedSnapB, setSelectedSnapB] = useState<string>('');
  const [comparisonResult, setComparisonResult] = useState<any | null>(null);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!snapshotName) return;

    try {
      const snap = await PropertyService.createSnapshot(propertyId, {
        name: snapshotName,
        stateType,
        description,
      });
      onSnapshotCreated(snap);
      setSnapshotName('');
      setDescription('');
      setIsCreating(false);
    } catch (err) {
      console.error('Error creating snapshot', err);
    }
  };

  const handleCompare = async () => {
    if (!selectedSnapA || !selectedSnapB) return;
    try {
      const res = await fetch(`/api/properties/${propertyId}/snapshots/compare?snapA=${selectedSnapA}&snapB=${selectedSnapB}`);
      const json = await res.json();
      setComparisonResult(json.data);
    } catch (err) {
      console.error('Error comparing snapshots', err);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-700/60">
        <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <History className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          Historial de Instantáneas del Inmueble ({snapshots.length})
        </h3>
        <button
          onClick={() => setIsCreating(!isCreating)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Nueva Instantánea
        </button>
      </div>

      {/* Create form */}
      {isCreating && (
        <form onSubmit={handleCreate} className="p-4 rounded-xl bg-gray-50 dark:bg-gray-750 border border-gray-200 dark:border-gray-700 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Nombre de la Instantánea
              </label>
              <input
                type="text"
                placeholder="Ej: Estado Inicial antes de Reforma 2026"
                value={snapshotName}
                onChange={(e) => setSnapshotName(e.target.value)}
                className="w-full px-3 py-2 text-xs border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Tipo de Estado
              </label>
              <select
                value={stateType}
                onChange={(e) => setStateType(e.target.value as PropertySnapshotStateType)}
                className="w-full px-3 py-2 text-xs border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="INITIAL_EXISTING">Estado Inicial / Existente</option>
                <option value="PROPOSED_DESIGN">Diseño Propuesto / Reforma</option>
                <option value="DURING_RENOVATION">Durante la Ejecución de Obra</option>
                <option value="EXECUTED_FINAL">Estado Final Ejecutado</option>
                <option value="CUSTOM">Personalizado</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Notas descriptivas
            </label>
            <input
              type="text"
              placeholder="Observaciones de este estado temporal..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 text-xs border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="px-3 py-1.5 text-xs text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-650 rounded-lg"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm"
            >
              Guardar Instantánea
            </button>
          </div>
        </form>
      )}

      {/* Snapshots list */}
      <div className="space-y-2">
        {snapshots.length === 0 ? (
          <div className="text-center py-6 border border-dashed border-gray-200 dark:border-gray-700 rounded-xl text-xs text-gray-400">
            No hay instantáneas guardadas para este inmueble.
          </div>
        ) : (
          snapshots.map((s) => (
            <div
              key={s.id}
              className="p-3 rounded-xl border border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-750 flex items-center justify-between text-xs"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-gray-900 dark:text-white">{s.name}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300">
                    {s.stateType}
                  </span>
                </div>
                <div className="text-[11px] text-gray-400 mt-0.5 flex items-center gap-2">
                  <Calendar className="w-3 h-3" />
                  {new Date(s.createdAt).toLocaleString()}
                  {s.description && <span>• {s.description}</span>}
                </div>
              </div>

              {s.metricsSummary && (
                <div className="text-right text-[11px] text-gray-500 dark:text-gray-400">
                  <div>{s.metricsSummary.surfaceM2 || 0} m² útiles</div>
                  <div>{s.metricsSummary.totalInvestmentEur ? `${s.metricsSummary.totalInvestmentEur.toLocaleString()} €` : ''}</div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Comparison tool */}
      {snapshots.length >= 2 && (
        <div className="pt-4 border-t border-gray-100 dark:border-gray-700/60 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
            <ArrowRightLeft className="w-4 h-4 text-indigo-500" />
            Comparar Dos Estados Temporales
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <select
              value={selectedSnapA}
              onChange={(e) => setSelectedSnapA(e.target.value)}
              className="px-2.5 py-1.5 text-xs border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="">Selecciona Estado A...</option>
              {snapshots.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
            <select
              value={selectedSnapB}
              onChange={(e) => setSelectedSnapB(e.target.value)}
              className="px-2.5 py-1.5 text-xs border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="">Selecciona Estado B...</option>
              {snapshots.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
            <button
              onClick={handleCompare}
              disabled={!selectedSnapA || !selectedSnapB}
              className="px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-lg shadow-sm transition-colors"
            >
              Comparar Estados
            </button>
          </div>

          {comparisonResult && (
            <div className="p-3 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-xs space-y-1">
              <p className="font-bold text-indigo-950 dark:text-indigo-200">
                {comparisonResult.summary}
              </p>
              <div className="text-[11px] text-indigo-800 dark:text-indigo-300 flex items-center gap-4 pt-1">
                <span>Δ Superficie: {comparisonResult.surfaceDeltaM2} m²</span>
                <span>Δ Estancias: {comparisonResult.roomsDelta}</span>
                <span>Δ Riesgos: {comparisonResult.risksDelta}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
