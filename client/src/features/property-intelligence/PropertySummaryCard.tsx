/**
 * Property Summary Card Component (Phase V23 / v1.23.0)
 * Displays core property identity, condition, occupancy, and investment summary.
 * Copyright © 2026 Adrián Palma. Todos los derechos reservados.
 */

import React from 'react';
import { PropertyDto, PropertyTotalInvestmentDto } from '@hbd/shared';
import { Building2, MapPin, Calendar, Home, CheckCircle2, AlertCircle } from 'lucide-react';

interface PropertySummaryCardProps {
  property: PropertyDto;
  investment?: PropertyTotalInvestmentDto;
  onEdit?: () => void;
}

export const PropertySummaryCard: React.FC<PropertySummaryCardProps> = ({
  property,
  investment,
  onEdit,
}) => {
  const getConditionBadge = (condition: PropertyDto['condition']) => {
    switch (condition) {
      case 'NEW':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">A estrenar</span>;
      case 'GOOD':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300">Buen estado</span>;
      case 'NEEDS_UPDATE':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">Actualización</span>;
      case 'RENOVATION_REQUIRED':
      case 'FULL_RENOVATION':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300">Reforma integral</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">Sin evaluar</span>;
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-gray-100 dark:border-gray-700/60">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {property.name}
            </h2>
            {getConditionBadge(property.condition)}
            <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 uppercase">
              {property.propertyType}
            </span>
          </div>
          {property.address?.city && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-indigo-500" />
              {property.address.street ? `${property.address.street}, ` : ''}{property.address.city} {property.address.postalCode ? `(${property.address.postalCode})` : ''}
            </p>
          )}
        </div>

        {onEdit && (
          <button
            onClick={onEdit}
            className="px-3 py-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded-lg border border-indigo-200 dark:border-indigo-800 transition-colors"
          >
            Editar Inmueble
          </button>
        )}
      </div>

      {/* Metric summary grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
        <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-750 border border-gray-100 dark:border-gray-700">
          <div className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">Superficie Útil</div>
          <div className="text-lg font-bold text-gray-900 dark:text-white mt-0.5">
            {property.usableSurfaceM2 ? `${property.usableSurfaceM2} m²` : 'No indicada'}
          </div>
          <div className="text-[10px] text-gray-400 mt-0.5">
            Construida: {property.builtSurfaceM2 ? `${property.builtSurfaceM2} m²` : '—'}
          </div>
        </div>

        <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-750 border border-gray-100 dark:border-gray-700">
          <div className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">Distribución</div>
          <div className="text-lg font-bold text-gray-900 dark:text-white mt-0.5">
            {property.roomsCount || 0} hab. / {property.bathroomsCount || 0} baños
          </div>
          <div className="text-[10px] text-gray-400 mt-0.5">
            Planta: {property.floorNumber ?? '—'} / {property.totalFloors || 1}
          </div>
        </div>

        <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-750 border border-gray-100 dark:border-gray-700">
          <div className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">Construcción / Reforma</div>
          <div className="text-lg font-bold text-gray-900 dark:text-white mt-0.5">
            {property.constructionYear || 'Desconocido'}
          </div>
          <div className="text-[10px] text-gray-400 mt-0.5">
            Últ. reforma: {property.renovationYear || 'Original'}
          </div>
        </div>

        <div className="p-3 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900">
          <div className="text-[11px] text-indigo-700 dark:text-indigo-300 font-medium">Inversión Estimada</div>
          <div className="text-lg font-bold text-indigo-950 dark:text-indigo-200 mt-0.5">
            {investment?.totalEstimatedInvestment ? `${investment.totalEstimatedInvestment.toLocaleString()} €` : '0 €'}
          </div>
          <div className="text-[10px] text-indigo-500 dark:text-indigo-400 mt-0.5">
            {investment?.costPerM2 ? `${investment.costPerM2} €/m²` : 'Sin proyectos'}
          </div>
        </div>
      </div>
    </div>
  );
};
