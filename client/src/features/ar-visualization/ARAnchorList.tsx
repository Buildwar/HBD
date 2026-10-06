/**
 * AR Anchor List & Placement Inspector (Phase V22 / v1.22.0)
 * Displays placed 3D elements in AR, their provenance, coordinates, and collision status.
 * Copyright © 2026 Adrián Palma. Todos los derechos reservados.
 */

import React from 'react';
import { ARAnchorItem } from '@hbd/shared';
import { Box, AlertTriangle, CheckCircle, Trash2, Move, RotateCw } from 'lucide-react';

interface ARAnchorListProps {
  anchors: ARAnchorItem[];
  selectedAnchorId: string | null;
  onSelectAnchor: (id: string) => void;
  onDeleteAnchor: (id: string) => void;
  onToggleConfirm: (id: string) => void;
}

export const ARAnchorList: React.FC<ARAnchorListProps> = ({
  anchors,
  selectedAnchorId,
  onSelectAnchor,
  onDeleteAnchor,
  onToggleConfirm,
}) => {
  const getProvenanceBadge = (provenance: ARAnchorItem['provenance']) => {
    switch (provenance) {
      case 'OFFICIAL_3D_MODEL':
        return <span className="px-1.5 py-0.5 rounded text-[10px] bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-200">3D Oficial</span>;
      case 'RETAIL_IMPORTED_GLTF':
        return <span className="px-1.5 py-0.5 rounded text-[10px] bg-purple-100 text-purple-800 dark:bg-purple-900/60 dark:text-purple-200">Catálogo V20</span>;
      case 'AI_RECONSTRUCTED_3D':
        return <span className="px-1.5 py-0.5 rounded text-[10px] bg-pink-100 text-pink-800 dark:bg-pink-900/60 dark:text-pink-200">IA 3D</span>;
      case 'PARAMETRIC_GENERATED':
        return <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200">Paramétrico</span>;
      default:
        return <span className="px-1.5 py-0.5 rounded text-[10px] bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">Primitiva</span>;
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
      <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-700/60 mb-3">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <Box className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          Elementos Proyectados en Espacio AR ({anchors.length})
        </h4>
      </div>

      <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
        {anchors.length === 0 ? (
          <div className="text-center py-8 border border-dashed border-gray-200 dark:border-gray-700 rounded-lg text-xs text-gray-400">
            No hay elementos colocados en la escena AR. Selecciona mobiliario o infraestructura para proyectar.
          </div>
        ) : (
          anchors.map((a) => {
            const isSelected = selectedAnchorId === a.id;
            return (
              <div
                key={a.id}
                onClick={() => onSelectAnchor(a.id)}
                className={`p-3 rounded-lg border transition-all cursor-pointer ${
                  isSelected
                    ? 'border-indigo-600 bg-indigo-50/40 dark:bg-indigo-950/30 ring-1 ring-indigo-500'
                    : 'border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-xs text-gray-900 dark:text-white truncate">
                        {a.name}
                      </span>
                      {getProvenanceBadge(a.provenance)}
                      {a.isConfirmed ? (
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 font-medium">
                          Fijado
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-yellow-100 text-yellow-800 dark:bg-yellow-950/60 dark:text-yellow-300 font-medium">
                          Previsualización
                        </span>
                      )}
                    </div>

                    <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <Move className="w-3 h-3" />
                        X: {a.position.x}m, Y: {a.position.y}m, Z: {a.position.z}m
                      </span>
                      <span className="flex items-center gap-1">
                        <RotateCw className="w-3 h-3" />
                        {a.rotation.yaw}°
                      </span>
                    </div>

                    {a.hasCollisions && (
                      <div className="mt-1.5 text-[10px] text-rose-600 dark:text-rose-400 font-medium flex items-center gap-1 bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded">
                        <AlertTriangle className="w-3 h-3 shrink-0" />
                        {a.collisionWarning || 'Conflicto de colisión o fuera de límites'}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => onToggleConfirm(a.id)}
                      className={`p-1.5 rounded transition-colors ${
                        a.isConfirmed
                          ? 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/50'
                          : 'text-gray-400 hover:text-emerald-600 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                      title={a.isConfirmed ? 'Desbloquear posición' : 'Fijar posición en AR'}
                    >
                      <CheckCircle className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDeleteAnchor(a.id)}
                      className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded transition-colors"
                      title="Eliminar de la proyección AR"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
