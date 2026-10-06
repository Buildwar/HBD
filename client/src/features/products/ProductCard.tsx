/**
 * HBD — HOME BOARD DESIGNER
 * V16.0.0 — PRODUCT CARD COMPONENT
 *
 * Autor: Adrián Palma
 * Copyright: © 2026 Adrián Palma. Todos los derechos reservados.
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Package,
  ExternalLink,
  Plus,
  Eye,
  Trash2,
  Box,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { Badge } from '../../components/ui/Badge.js';
import { ProductDto } from '@hbd/shared';

interface ProductCardProps {
  product: ProductDto;
  onSelect: (product: ProductDto) => void;
  onAddToProject?: (product: ProductDto) => void;
  onDelete?: (product: ProductDto) => void;
  onView3D?: (product: ProductDto) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onSelect,
  onAddToProject,
  onDelete,
  onView3D,
}) => {
  const { t } = useTranslation();

  const primaryImage = product.images.find((img) => img.isPrimary)?.url || product.images[0]?.url;
  const dims = product.dimensions;

  const getConfidenceBadgeVariant = (tier: string) => {
    if (tier === 'HIGH') return 'success';
    if (tier === 'MEDIUM') return 'warning';
    return 'danger';
  };

  return (
    <div className="group relative bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm hover:shadow-lg transition-all duration-200 flex flex-col justify-between">
      {/* Imagen y Badges superiores */}
      <div className="relative aspect-video bg-gray-100 dark:bg-gray-800/80 overflow-hidden flex items-center justify-center">
        {primaryImage ? (
          <img
            src={primaryImage}
            alt={product.name}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              // Fallback si la imagen externa falla
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
        ) : (
          <Package className="w-12 h-12 text-gray-400 dark:text-gray-600" />
        )}

        {/* Badges de Confianza y Procedencia */}
        <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5">
          <Badge variant={getConfidenceBadgeVariant(product.confidenceLevel)}>
            {product.confidenceLevel === 'HIGH' ? 'Alta Confianza' : product.confidenceLevel === 'MEDIUM' ? 'Media Confianza' : 'Revisar'}
          </Badge>
          {product.provenance === 'OFFICIAL_PRODUCT_DATA' && (
            <Badge variant="brand">Oficial</Badge>
          )}
          {product.provenance === 'AI_RECONSTRUCTED' && (
            <Badge variant="info">IA</Badge>
          )}
        </div>

        {/* Enlace externo */}
        {product.sourceUrl && (
          <a
            href={product.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            title={product.sourceDomain}
            className="absolute top-2.5 right-2.5 p-1.5 bg-black/40 hover:bg-black/70 text-white rounded-lg backdrop-blur-sm transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}
      </div>

      {/* Cuerpo del Card */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
            <span className="font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              {product.brand || product.sourceDomain}
            </span>
            <span className="truncate max-w-[120px]">{product.category}</span>
          </div>

          <h4
            onClick={() => onSelect(product)}
            className="text-sm font-bold text-gray-900 dark:text-white line-clamp-2 hover:text-emerald-600 dark:hover:text-emerald-400 cursor-pointer transition-colors"
          >
            {product.name}
          </h4>
        </div>

        {/* Dimensiones y Precio */}
        <div className="pt-2 border-t border-gray-100 dark:border-gray-800 flex items-end justify-between">
          <div className="text-xs space-y-0.5">
            <span className="text-[10px] text-gray-400 uppercase font-mono block">
              {t('products.dimensions', 'Dimensiones')}
            </span>
            <span className="font-mono font-medium text-gray-700 dark:text-gray-300">
              {dims?.widthM.toFixed(2)}m × {dims?.depthM.toFixed(2)}m × {dims?.heightM.toFixed(2)}m
            </span>
          </div>

          <div className="text-right">
            {product.price !== undefined && product.price !== null ? (
              <span className="text-base font-extrabold text-gray-900 dark:text-white font-mono">
                {product.price.toFixed(2)} {product.currency}
              </span>
            ) : (
              <span className="text-xs text-gray-400 italic">Precio N/D</span>
            )}
          </div>
        </div>
      </div>

      {/* Botonera de Acciones Rápidas */}
      <div className="px-4 py-3 bg-gray-50/70 dark:bg-gray-800/40 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
        <div className="flex items-center space-x-1.5">
          <button
            onClick={() => onSelect(product)}
            className="p-1.5 text-gray-600 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-gray-200/60 dark:hover:bg-gray-700 rounded-lg transition-colors"
            title={t('products.viewDetails', 'Ver Ficha')}
          >
            <Eye className="w-4 h-4" />
          </button>
          {onView3D && (
            <button
              onClick={() => onView3D(product)}
              className="p-1.5 text-gray-600 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-gray-200/60 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title={t('products.view3d', 'Vista 3D')}
            >
              <Box className="w-4 h-4" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(product)}
              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"
              title={t('common.delete', 'Eliminar')}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>

        {onAddToProject && (
          <button
            onClick={() => onAddToProject(product)}
            className="px-2.5 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg flex items-center space-x-1 shadow-sm transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t('products.addToProject', 'Añadir')}</span>
          </button>
        )}
      </div>
    </div>
  );
};
