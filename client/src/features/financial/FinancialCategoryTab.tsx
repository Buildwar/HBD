/**
 * HBD — HOME BOARD DESIGNER (V17.0.0)
 * Financial Category Tab Component — Category Deep-Dive & Detailed Balances
 * Autor: Adrián Palma
 * Copyright: © 2026 Adrián Palma. Todos los derechos reservados.
 */

import React from 'react';
import {
  FinancialSummaryDto,
  CostCategory,
  CategoryBreakdownDto,
} from '@hbd/shared';
import {
  Building2,
  Hammer,
  Sofa,
  Tv,
  Cpu,
  UserCheck,
  Truck,
  FileCheck,
  ShieldAlert,
  HelpCircle,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
} from 'lucide-react';

interface FinancialCategoryTabProps {
  summary: FinancialSummaryDto;
  onSelectCategory?: (category: CostCategory) => void;
}

const CATEGORY_ICONS: Record<CostCategory, React.ReactNode> = {
  PROPERTY_ACQUISITION: <Building2 className="w-5 h-5 text-blue-400" />,
  RENOVATION: <Hammer className="w-5 h-5 text-emerald-400" />,
  FURNITURE: <Sofa className="w-5 h-5 text-amber-400" />,
  APPLIANCES: <Tv className="w-5 h-5 text-purple-400" />,
  EQUIPMENT: <Cpu className="w-5 h-5 text-cyan-400" />,
  PROFESSIONAL_SERVICES: <UserCheck className="w-5 h-5 text-pink-400" />,
  LOGISTICS: <Truck className="w-5 h-5 text-slate-400" />,
  PERMITS: <FileCheck className="w-5 h-5 text-orange-400" />,
  CONTINGENCY: <ShieldAlert className="w-5 h-5 text-yellow-400" />,
  OTHER: <HelpCircle className="w-5 h-5 text-violet-400" />,
};

const CATEGORY_LABELS: Record<CostCategory, string> = {
  PROPERTY_ACQUISITION: 'Adquisición de Inmueble',
  RENOVATION: 'Reforma, Albañilería & Instalaciones',
  FURNITURE: 'Mobiliario & Gemelos Digitales',
  APPLIANCES: 'Electrodomésticos & Cocina',
  EQUIPMENT: 'Climatización & Domótica',
  PROFESSIONAL_SERVICES: 'Honorarios Profesionales & Dirección',
  LOGISTICS: 'Transporte, Montaje & Residuos',
  PERMITS: 'Licencias, Tasas & Permisos',
  CONTINGENCY: 'Colchón de Contingencia',
  OTHER: 'Otros Gastos Directos',
};

export const FinancialCategoryTab: React.FC<FinancialCategoryTabProps> = ({
  summary,
  onSelectCategory,
}) => {
  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(
      val || 0
    );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {summary.categories.map((cat: CategoryBreakdownDto) => {
        const hasData = cat.effectiveAmount > 0 || cat.itemsCount > 0;
        const progress = cat.effectiveAmount > 0 ? (cat.paidAmount / cat.effectiveAmount) * 100 : 0;
        const isOver = cat.status === 'OVER_BUDGET';
        const isUnder = cat.status === 'UNDER_BUDGET';

        return (
          <div
            key={cat.category}
            onClick={() => onSelectCategory && onSelectCategory(cat.category)}
            className={`bg-slate-900 border ${
              hasData ? 'border-slate-800 hover:border-slate-700' : 'border-slate-800/40 opacity-70'
            } rounded-xl p-5 flex flex-col justify-between transition-all duration-200 cursor-pointer group shadow-sm hover:shadow-md`}
          >
            <div>
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 bg-slate-800 rounded-lg group-hover:bg-slate-750 transition-colors">
                    {CATEGORY_ICONS[cat.category]}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">
                      {CATEGORY_LABELS[cat.category]}
                    </h4>
                    <span className="text-[11px] text-slate-400">
                      {cat.itemsCount} {cat.itemsCount === 1 ? 'partida' : 'partidas'}
                    </span>
                  </div>
                </div>

                {cat.category !== 'PROPERTY_ACQUISITION' && cat.estimatedAmount > 0 && (
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded flex items-center space-x-1 ${
                      isOver
                        ? 'bg-red-500/10 text-red-400'
                        : isUnder
                        ? 'bg-emerald-500/10 text-emerald-400'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {isOver ? (
                      <TrendingUp className="w-3 h-3 mr-1 inline" />
                    ) : isUnder ? (
                      <TrendingDown className="w-3 h-3 mr-1 inline" />
                    ) : (
                      <CheckCircle2 className="w-3 h-3 mr-1 inline" />
                    )}
                    {cat.variancePercentage > 0 ? '+' : ''}
                    {cat.variancePercentage}%
                  </span>
                )}
              </div>

              {/* Amounts Grid */}
              <div className="mt-4 grid grid-cols-2 gap-2 bg-slate-950/60 p-3 rounded-lg border border-slate-800/50 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">Coste Total</span>
                  <span className="font-bold text-white text-sm">
                    {formatCurrency(cat.effectiveAmount)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Estimado</span>
                  <span className="font-medium text-slate-300 text-sm">
                    {formatCurrency(cat.estimatedAmount)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Pagado</span>
                  <span className="font-semibold text-emerald-400">
                    {formatCurrency(cat.paidAmount)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Pendiente</span>
                  <span className="font-semibold text-amber-400">
                    {formatCurrency(cat.pendingAmount)}
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Progress Bar */}
            <div className="mt-4 pt-3 border-t border-slate-800/80">
              <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                <span>Progreso de Pago</span>
                <span className="font-medium text-slate-200">{Math.round(progress)}%</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, progress)}%` }}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
