/**
 * HBD — FASE V24 / 1.24.0: HBD AI COPILOT
 * Retail Products Matching Card Component
 * 
 * Autor: Adrián Palma
 * Copyright: © 2026 Adrián Palma — HBD (Home Board Designer)
 */

import React from 'react';
import { ShoppingBag, Ruler, Check, ExternalLink } from 'lucide-react';

interface ProductItem {
  id: string;
  name: string;
  retailer: string;
  category: string;
  priceEur: number;
  inStock: boolean;
  dimensionsCm?: { width: number; depth: number; height: number };
  imageUrl?: string;
  deepLinkUrl?: string;
}

interface Props {
  products: ProductItem[];
  onSelectProduct?: (product: ProductItem) => void;
}

export const CopilotProductCard: React.FC<Props> = ({ products, onSelectProduct }) => {
  return (
    <div className="mt-3 space-y-2">
      <div className="flex items-center gap-1.5 text-xs font-semibold text-sky-400">
        <ShoppingBag className="w-3.5 h-3.5" />
        <span>Productos Reales Disponibles en Tienda</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {products.map((p) => (
          <div
            key={p.id}
            className="p-3 bg-slate-900/80 border border-slate-700/80 rounded-xl flex flex-col justify-between hover:border-sky-500/60 transition-all text-xs"
          >
            <div>
              <div className="flex items-start justify-between gap-1">
                <span className="font-semibold text-slate-100 line-clamp-1">{p.name}</span>
                <span className="text-[10px] px-1.5 py-0.5 bg-sky-950/60 border border-sky-800/40 text-sky-300 rounded font-medium shrink-0">
                  {p.retailer}
                </span>
              </div>

              <p className="text-[11px] text-slate-400 mt-0.5">{p.category}</p>

              {p.dimensionsCm && (
                <div className="flex items-center gap-1 text-[11px] text-slate-300 mt-1.5">
                  <Ruler className="w-3 h-3 text-slate-400" />
                  <span>
                    {p.dimensionsCm.width} × {p.dimensionsCm.depth} × {p.dimensionsCm.height} cm
                  </span>
                </div>
              )}
            </div>

            <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-base font-bold text-emerald-400">
                  {p.priceEur.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €
                </span>
                <div className="flex items-center gap-1 text-[10px] text-emerald-400/90">
                  <Check className="w-2.5 h-2.5" />
                  <span>En stock</span>
                </div>
              </div>

              {onSelectProduct && (
                <button
                  type="button"
                  onClick={() => onSelectProduct(p)}
                  className="px-2.5 py-1 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-medium transition-colors shadow-sm"
                >
                  Verificar
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
