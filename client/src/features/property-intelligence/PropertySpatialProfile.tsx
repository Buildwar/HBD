/**
 * Property Spatial Profile Component (Phase V23 / v1.23.0)
 * Visualizes space breakdown, circulation ratios, and room adjacencies.
 * Copyright © 2026 Adrián Palma. Todos los derechos reservados.
 */

import React from 'react';
import { PropertySpatialSummary } from '@hbd/shared';
import { LayoutGrid, ArrowRightLeft, Compass, ShieldAlert } from 'lucide-react';

interface PropertySpatialProfileProps {
  spatial: PropertySpatialSummary;
}

export const PropertySpatialProfile: React.FC<PropertySpatialProfileProps> = ({ spatial }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-700/60">
        <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <LayoutGrid className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          Perfil Espacial y Distribución de Estancias
        </h3>
        <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
          {spatial.spacesBreakdown.length} espacios analizados
        </span>
      </div>

      {/* Surface Ratios */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-750">
          <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
            Circulación / Pasillos
          </span>
          <div className="text-xl font-bold text-gray-900 dark:text-white mt-1">
            {spatial.circulationSurfaceM2} m² ({(spatial.circulationRatio * 100).toFixed(1)}%)
          </div>
          <p className="text-[11px] text-gray-500 mt-1">
            {spatial.circulationRatio > 0.2
              ? 'Posible optimización: redistribución para reducir pasillos.'
              : 'Ratio óptimo de circulación.'}
          </p>
        </div>

        <div className="p-4 rounded-xl border border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-750">
          <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
            Almacenamiento Dedicado
          </span>
          <div className="text-xl font-bold text-gray-900 dark:text-white mt-1">
            {spatial.storageSurfaceM2} m²
          </div>
          <p className="text-[11px] text-gray-500 mt-1">
            Armarios empotrados, despensas y trasteros.
          </p>
        </div>

        <div className="p-4 rounded-xl border border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-750">
          <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
            Superficie Total Útil
          </span>
          <div className="text-xl font-bold text-indigo-600 dark:text-indigo-400 mt-1">
            {spatial.totalUsableSurfaceM2} m²
          </div>
          <p className="text-[11px] text-gray-500 mt-1">
            Construida: {spatial.totalBuiltSurfaceM2} m²
          </p>
        </div>
      </div>

      {/* Spaces Table */}
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">
          Desglose por Estancia
        </h4>
        <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 dark:bg-gray-750 text-gray-600 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="p-3">Estancia</th>
                <th className="p-3">Tipo</th>
                <th className="p-3">Superficie</th>
                <th className="p-3">Perímetro</th>
                <th className="p-3">Confianza</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {spatial.spacesBreakdown.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50/60 dark:hover:bg-gray-750/50">
                  <td className="p-3 font-semibold text-gray-900 dark:text-white">{s.name}</td>
                  <td className="p-3 text-gray-500">{s.type}</td>
                  <td className="p-3 font-medium text-indigo-600 dark:text-indigo-400">{s.areaM2} m²</td>
                  <td className="p-3 text-gray-500">{s.perimeterM} m</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                      {s.confidence}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Adjacencies */}
      {spatial.adjacencies.length > 0 && (
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3 flex items-center gap-1.5">
            <ArrowRightLeft className="w-4 h-4 text-indigo-500" />
            Relaciones y Adyacencias entre Espacios
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {spatial.adjacencies.slice(0, 6).map((adj, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-lg border border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-750 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-gray-800 dark:text-gray-200">{adj.fromRoomName}</span>
                  <span className="text-gray-400">↔</span>
                  <span className="font-semibold text-gray-800 dark:text-gray-200">{adj.toRoomName}</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded font-medium bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300">
                  {adj.adjacencyType.replace('_', ' ')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
