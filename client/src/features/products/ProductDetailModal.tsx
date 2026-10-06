/**
 * HBD — HOME BOARD DESIGNER
 * V16.0.0 — PRODUCT DETAIL MODAL
 *
 * Autor: Adrián Palma
 * Copyright: © 2026 Adrián Palma. Todos los derechos reservados.
 */

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  X,
  ExternalLink,
  Plus,
  Box,
  CheckCircle2,
  Info,
  Layers,
  Sparkles,
  ShieldCheck,
  Tag,
  Ruler,
} from 'lucide-react';
import { Button } from '../../components/ui/Button.js';
import { Badge } from '../../components/ui/Badge.js';
import {
  ProductDto,
  ProductProvenanceEngine,
  ProductVariantDto,
} from '@hbd/shared';

interface ProductDetailModalProps {
  product: ProductDto | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToProject?: (product: ProductDto, variant?: ProductVariantDto) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  isOpen,
  onClose,
  onAddToProject,
}) => {
  const { t } = useTranslation();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);

  if (!isOpen || !product) return null;

  const selectedVariant = product.variants?.find((v) => v.id === selectedVariantId) || product.variants?.[0];
  const activeImage =
    product.images && product.images.length > 0
      ? product.images[selectedImageIndex]?.url
      : selectedVariant?.imageUrl;

  const provenanceInfo = ProductProvenanceEngine.getProvenanceDescription(
    product.provenance,
    product.verificationStatus,
    product.confidence
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Cabecera */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
          <div className="flex items-center space-x-3">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-md">
              {product.brand || product.sourceDomain}
            </span>
            <span className="text-sm text-gray-500">|</span>
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">{product.category}</span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenido Principal con 2 Columnas */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Columna Izquierda: Galería y Preview 3D */}
          <div className="space-y-4">
            <div className="relative aspect-square bg-gray-100 dark:bg-gray-800 rounded-2xl overflow-hidden flex items-center justify-center border border-gray-200 dark:border-gray-700">
              {activeImage ? (
                <img
                  src={activeImage}
                  alt={product.name}
                  className="w-full h-full object-contain p-4"
                />
              ) : (
                <Box className="w-20 h-20 text-gray-400" />
              )}

              {product.sourceUrl && (
                <a
                  href={product.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute bottom-3 right-3 px-3 py-1.5 bg-black/60 hover:bg-black/80 text-white rounded-lg text-xs backdrop-blur-sm flex items-center space-x-1.5 transition-colors"
                >
                  <span>{t('products.viewOnSite', 'Ver en tienda')}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>

            {/* Miniaturas de Galería */}
            {product.images && product.images.length > 1 && (
              <div className="flex space-x-2 overflow-x-auto pb-1">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`w-16 h-16 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                      selectedImageIndex === idx
                        ? 'border-emerald-500 ring-2 ring-emerald-500/20'
                        : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img.url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Tarjeta de Trazabilidad y Veracidad */}
            <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700/80 space-y-2">
              <div className="flex items-center space-x-2 text-xs font-bold text-gray-900 dark:text-white">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>{provenanceInfo.label}</span>
                <Badge variant={product.confidenceLevel === 'HIGH' ? 'success' : 'warning'}>
                  {Math.round(product.confidence * 100)}% fiabilidad
                </Badge>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                {provenanceInfo.explanation}
              </p>
              <div className="text-[11px] text-gray-400 font-mono pt-1">
                Fecha importación: {new Date(product.importedAt).toLocaleDateString()}
              </div>
            </div>
          </div>

          {/* Columna Derecha: Datos Técnicos y Opciones */}
          <div className="space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div>
                <h2 className="text-2xl font-black text-gray-900 dark:text-white leading-tight">
                  {product.name}
                </h2>
                {product.sku && (
                  <span className="text-xs text-gray-400 font-mono">Ref / SKU: {product.sku}</span>
                )}
              </div>

              {/* Precio */}
              <div className="flex items-baseline space-x-3">
                {product.price !== undefined && product.price !== null ? (
                  <span className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
                    {product.price.toFixed(2)} {product.currency}
                  </span>
                ) : (
                  <span className="text-lg text-gray-400 italic">Precio no disponible</span>
                )}
                <span className="text-xs text-gray-500 font-medium">({product.availability || 'En stock'})</span>
              </div>

              {/* Dimensiones Volumétricas */}
              <div className="p-4 bg-gray-50 dark:bg-gray-800/40 rounded-xl border border-gray-200 dark:border-gray-700 space-y-2">
                <div className="flex items-center space-x-2 text-xs font-bold text-gray-900 dark:text-white">
                  <Ruler className="w-4 h-4 text-emerald-500" />
                  <span>{t('products.realDimensions', 'Dimensiones Reales')}</span>
                </div>
                <div className="grid grid-cols-3 gap-2 font-mono text-center">
                  <div className="p-2 bg-white dark:bg-gray-900 rounded-lg border border-gray-100 dark:border-gray-800">
                    <span className="text-[10px] text-gray-400 block uppercase">Ancho</span>
                    <span className="text-sm font-bold text-gray-900 dark:text-white">
                      {product.dimensions?.widthM.toFixed(2)} m
                    </span>
                    <span className="text-[10px] text-gray-400 block">
                      {((product.dimensions?.widthM || 0) * 100).toFixed(0)} cm
                    </span>
                  </div>
                  <div className="p-2 bg-white dark:bg-gray-900 rounded-lg border border-gray-100 dark:border-gray-800">
                    <span className="text-[10px] text-gray-400 block uppercase">Fondo</span>
                    <span className="text-sm font-bold text-gray-900 dark:text-white">
                      {product.dimensions?.depthM.toFixed(2)} m
                    </span>
                    <span className="text-[10px] text-gray-400 block">
                      {((product.dimensions?.depthM || 0) * 100).toFixed(0)} cm
                    </span>
                  </div>
                  <div className="p-2 bg-white dark:bg-gray-900 rounded-lg border border-gray-100 dark:border-gray-800">
                    <span className="text-[10px] text-gray-400 block uppercase">Alto</span>
                    <span className="text-sm font-bold text-gray-900 dark:text-white">
                      {product.dimensions?.heightM.toFixed(2)} m
                    </span>
                    <span className="text-[10px] text-gray-400 block">
                      {((product.dimensions?.heightM || 0) * 100).toFixed(0)} cm
                    </span>
                  </div>
                </div>
              </div>

              {/* Variantes si existen */}
              {product.variants && product.variants.length > 0 && (
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                    {t('products.variants', 'Variantes disponibles:')}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {product.variants.map((v) => (
                      <button
                        key={v.id}
                        onClick={() => setSelectedVariantId(v.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                          selectedVariantId === v.id || (!selectedVariantId && v.selected)
                            ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200'
                            : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        {v.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Materiales detectados */}
              {product.materials && product.materials.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                    {t('products.materials', 'Materiales y Acabados:')}
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {product.materials.map((m, idx) => (
                      <div
                        key={idx}
                        className="px-2.5 py-1 bg-gray-100 dark:bg-gray-800 rounded-md text-xs text-gray-700 dark:text-gray-300 flex items-center space-x-1.5"
                      >
                        {m.colorHex && (
                          <span
                            className="w-3 h-3 rounded-full border border-black/10 inline-block"
                            style={{ backgroundColor: m.colorHex }}
                          />
                        )}
                        <span>{m.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Descripción */}
              {product.description && (
                <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                  <span className="font-semibold text-gray-700 dark:text-gray-300 block">
                    {t('products.description', 'Descripción:')}
                  </span>
                  <p className="line-clamp-4 leading-relaxed">{product.description}</p>
                </div>
              )}
            </div>

            {/* Acción Inferior */}
            <div className="pt-4 border-t border-gray-200 dark:border-gray-800 flex items-center justify-end space-x-3">
              <Button variant="outline" onClick={onClose}>
                {t('common.close', 'Cerrar')}
              </Button>
              {onAddToProject && (
                <Button
                  variant="primary"
                  onClick={() => onAddToProject(product, selectedVariant)}
                  className="bg-emerald-600 hover:bg-emerald-700 flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>{t('products.addToProject', 'Añadir al Proyecto')}</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
