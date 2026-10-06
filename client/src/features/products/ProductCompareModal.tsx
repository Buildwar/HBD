/**
 * HBD — HOME BOARD DESIGNER
 * V16.0.0 — PRODUCT COMPARE MODAL
 *
 * Autor: Adrián Palma
 * Copyright: © 2026 Adrián Palma. Todos los derechos reservados.
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import { X, Scale, CheckCircle2, Box, Package, ExternalLink } from 'lucide-react';
import { Button } from '../../components/ui/Button.js';
import { Badge } from '../../components/ui/Badge.js';
import { ProductDto } from '@hbd/shared';

interface ProductCompareModalProps {
  products: ProductDto[];
  isOpen: boolean;
  onClose: () => void;
  onSelectProduct?: (product: ProductDto) => void;
}

export const ProductCompareModal: React.FC<ProductCompareModalProps> = ({
  products,
  isOpen,
  onClose,
  onSelectProduct,
}) => {
  const { t } = useTranslation();

  if (!isOpen || products.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-5xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Cabecera */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {t('products.compareTitle', 'Comparativa Objetiva de Productos')}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {t('products.compareSubtitle', 'Compara dimensiones reales, precios, materiales y fiabilidad sin sesgos')}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabla Comparativa */}
        <div className="flex-1 overflow-x-auto overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-flow-col auto-cols-fr gap-4 min-w-[600px]">
            {products.map((p) => (
              <div
                key={p.id}
                className="bg-gray-50/70 dark:bg-gray-800/40 rounded-2xl border border-gray-200 dark:border-gray-700/80 p-5 flex flex-col justify-between space-y-4"
              >
                {/* Imagen y Título */}
                <div className="space-y-3 text-center">
                  <div className="w-full aspect-video rounded-xl bg-white dark:bg-gray-900 overflow-hidden flex items-center justify-center border border-gray-200 dark:border-gray-800">
                    {p.images && p.images[0]?.url ? (
                      <img src={p.images[0].url} alt="" className="w-full h-full object-contain p-2" />
                    ) : (
                      <Package className="w-10 h-10 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">{p.brand || 'Catálogo'}</span>
                    <h4 className="text-base font-bold text-gray-900 dark:text-white line-clamp-2 mt-0.5">{p.name}</h4>
                  </div>
                </div>

                {/* Métricas Comparativas */}
                <div className="space-y-2.5 text-xs">
                  {/* Precio */}
                  <div className="p-2.5 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 flex justify-between items-center">
                    <span className="text-gray-400 font-medium">Precio</span>
                    <span className="text-sm font-extrabold font-mono text-gray-900 dark:text-white">
                      {p.price ? `${p.price.toFixed(2)} ${p.currency}` : 'N/D'}
                    </span>
                  </div>

                  {/* Dimensiones */}
                  <div className="p-2.5 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 space-y-1">
                    <span className="text-gray-400 font-medium block">Dimensiones (Ancho × Fondo × Alto)</span>
                    <span className="font-mono font-bold text-gray-800 dark:text-gray-200 block">
                      {p.dimensions?.widthM.toFixed(2)}m × {p.dimensions?.depthM.toFixed(2)}m × {p.dimensions?.heightM.toFixed(2)}m
                    </span>
                    <span className="text-[11px] text-gray-400 font-mono block">
                      ({((p.dimensions?.widthM || 0) * 100).toFixed(0)} × {((p.dimensions?.depthM || 0) * 100).toFixed(0)} × {((p.dimensions?.heightM || 0) * 100).toFixed(0)} cm)
                    </span>
                  </div>

                  {/* Material */}
                  <div className="p-2.5 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 flex justify-between items-center">
                    <span className="text-gray-400 font-medium">Material</span>
                    <span className="font-medium text-gray-800 dark:text-gray-200">
                      {p.materials && p.materials[0] ? p.materials[0].name : 'Estándar'}
                    </span>
                  </div>

                  {/* Fiabilidad */}
                  <div className="p-2.5 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 flex justify-between items-center">
                    <span className="text-gray-400 font-medium">Origen / Fiabilidad</span>
                    <Badge variant={p.confidenceLevel === 'HIGH' ? 'success' : 'warning'}>
                      {Math.round(p.confidence * 100)}%
                    </Badge>
                  </div>
                </div>

                {/* Acciones */}
                <div className="pt-2">
                  {onSelectProduct && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        onSelectProduct(p);
                        onClose();
                      }}
                      className="w-full text-xs"
                    >
                      Ver Ficha Completa
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pie */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 flex justify-end">
          <Button variant="primary" onClick={onClose}>
            {t('common.close', 'Cerrar')}
          </Button>
        </div>
      </div>
    </div>
  );
};
