import React, { useState } from 'react';
import { ShoppingBag, ExternalLink, ShieldCheck, Box, CheckCircle2, Layers, MapPin, Truck, Plus, Sparkles } from 'lucide-react';
import { Modal } from '../../components/ui/Modal.js';
import { Button } from '../../components/ui/Button.js';
import { Badge } from '../../components/ui/Badge.js';
import type { RetailProductDto, RetailProductVariantDto } from '@hbd/shared';

interface RetailProductDetailModalProps {
  isOpen: boolean;
  product: RetailProductDto | null;
  onClose: () => void;
  onAddToProject: (product: RetailProductDto, selectedVariant?: RetailProductVariantDto) => void;
}

export const RetailProductDetailModal: React.FC<RetailProductDetailModalProps> = ({
  isOpen,
  product,
  onClose,
  onAddToProject,
}) => {
  if (!product) return null;

  const [selectedVariant, setSelectedVariant] = useState<RetailProductVariantDto | undefined>(
    product.variants && product.variants.length > 0 ? product.variants[0] : undefined
  );

  const formatPrice = (amount: number, currency: string) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: currency || 'EUR',
    }).format(amount);
  };

  const activePrice = selectedVariant?.price || product.price.amount;
  const activeImage = selectedVariant?.imageUrl || product.primaryImageUrl;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${product.brand || product.retailerName} — ${product.name}`}
      description={`Ficha técnica del catálogo oficial de ${product.retailerName}`}
      maxWidth="4xl"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
        {/* Columna Izquierda: Imagen y Dimensiones 3D */}
        <div className="space-y-4">
          <div className="aspect-[4/3] bg-dark-bg rounded-2xl border border-dark-border/60 overflow-hidden flex items-center justify-center p-4 relative">
            {activeImage ? (
              <img
                src={activeImage}
                alt={product.name}
                className="w-full h-full object-contain"
              />
            ) : (
              <ShoppingBag size={48} className="text-gray-600" />
            )}
            <div className="absolute top-3 left-3">
              <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-dark-card/90 text-white border border-dark-border shadow-sm">
                {product.retailerName}
              </span>
            </div>
            {product.isMockData && (
              <div className="absolute top-3 right-3">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  MOCK DATASET
                </span>
              </div>
            )}
          </div>

          {/* Tarjeta de Dimensiones Reales */}
          <div className="p-4 rounded-xl bg-dark-bg/60 border border-dark-border/50 space-y-3">
            <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
              <Box size={14} className="text-primary-400" />
              Dimensiones Exactas para Modelado
            </h4>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2 rounded-lg bg-dark-card border border-dark-border">
                <span className="text-[10px] text-gray-400">Ancho (X)</span>
                <p className="text-sm font-bold text-white mt-0.5">
                  {Math.round(product.dimensions.widthM * 100)} cm
                </p>
                <span className="text-[10px] text-gray-500 font-mono">{product.dimensions.widthM} m</span>
              </div>
              <div className="p-2 rounded-lg bg-dark-card border border-dark-border">
                <span className="text-[10px] text-gray-400">Fondo (Y)</span>
                <p className="text-sm font-bold text-white mt-0.5">
                  {Math.round(product.dimensions.depthM * 100)} cm
                </p>
                <span className="text-[10px] text-gray-500 font-mono">{product.dimensions.depthM} m</span>
              </div>
              <div className="p-2 rounded-lg bg-dark-card border border-dark-border">
                <span className="text-[10px] text-gray-400">Alto (Z)</span>
                <p className="text-sm font-bold text-white mt-0.5">
                  {Math.round(product.dimensions.heightM * 100)} cm
                </p>
                <span className="text-[10px] text-gray-500 font-mono">{product.dimensions.heightM} m</span>
              </div>
            </div>
            {product.dimensions.weightKg && (
              <p className="text-xs text-gray-400 text-center">
                Peso total aproximado: <span className="font-semibold text-gray-200">{product.dimensions.weightKg} kg</span>
              </p>
            )}
          </div>
        </div>

        {/* Columna Derecha: Precios, Variantes y Acciones */}
        <div className="space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                <span>{product.category} {product.subcategory ? `› ${product.subcategory}` : ''}</span>
                <span className="font-mono">Ref: {product.reference || product.sku || product.externalId}</span>
              </div>
              <h3 className="text-xl font-bold text-white">{product.name}</h3>
              <p className="text-xs text-gray-300 mt-1 leading-relaxed">
                {product.description || 'Producto certificado con especificaciones técnicas disponibles para integración en plano.'}
              </p>
            </div>

            {/* Precio en tiempo real */}
            <div className="p-3.5 rounded-xl bg-dark-bg/60 border border-dark-border/50 flex items-center justify-between">
              <div>
                <span className="text-xs text-gray-400">Precio Oficial:</span>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-2xl font-black text-white">
                    {formatPrice(activePrice, product.price.currency)}
                  </span>
                  {product.price.previousAmount && (
                    <span className="text-sm text-gray-500 line-through">
                      {formatPrice(product.price.previousAmount, product.price.currency)}
                    </span>
                  )}
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-gray-400 block">Procedencia del dato:</span>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 mt-0.5">
                  <ShieldCheck size={13} />
                  {product.price.source}
                </span>
              </div>
            </div>

            {/* Selector de Variantes */}
            {product.variants && product.variants.length > 0 && (
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-300 uppercase tracking-wider">
                  Variantes y Acabados ({product.variants.length} opciones)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {product.variants.map((variant) => {
                    const isSelected = selectedVariant?.id === variant.id;
                    return (
                      <button
                        key={variant.id}
                        type="button"
                        onClick={() => setSelectedVariant(variant)}
                        className={`p-2.5 rounded-xl border text-left transition-all flex items-center gap-2.5 ${
                          isSelected
                            ? 'bg-primary-500/10 border-primary-500 text-white ring-1 ring-primary-500'
                            : 'bg-dark-card border-dark-border text-gray-300 hover:text-white hover:bg-dark-hover'
                        }`}
                      >
                        {variant.colorHex && (
                          <span
                            className="w-4 h-4 rounded-full border border-white/20 shrink-0"
                            style={{ backgroundColor: variant.colorHex }}
                          />
                        )}
                        <div className="overflow-hidden">
                          <p className="text-xs font-bold truncate">{variant.name}</p>
                          {variant.price && (
                            <p className="text-[10px] text-gray-400">{formatPrice(variant.price, variant.currency)}</p>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Disponibilidad y Logística */}
            <div className="space-y-2 p-3 rounded-xl bg-dark-bg/40 border border-dark-border/40 text-xs text-gray-300">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-gray-400">
                  <Truck size={14} className="text-primary-400" />
                  Plazo de Entrega:
                </span>
                <span className="font-semibold text-white">
                  {product.availability.deliveryEstimateFormatted || 'Entrega estándar en 48-72 horas'}
                </span>
              </div>
              {product.materials.length > 0 && (
                <div className="flex items-center justify-between pt-1 border-t border-dark-border/30">
                  <span className="flex items-center gap-1.5 text-gray-400">
                    <Layers size={14} className="text-purple-400" />
                    Materiales:
                  </span>
                  <span className="font-semibold text-white truncate max-w-[200px]">
                    {product.materials.join(', ')}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Botones de acción inferior */}
          <div className="space-y-2 pt-4 border-t border-dark-border/60">
            <div className="flex gap-3">
              {product.productUrl && (
                <a
                  href={product.purchaseUrl || product.productUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1"
                >
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full flex items-center justify-center gap-2 text-xs"
                  >
                    <ExternalLink size={14} />
                    Ver en {product.retailerName}
                  </Button>
                </a>
              )}
              <Button
                type="button"
                variant="primary"
                onClick={() => {
                  onAddToProject(product, selectedVariant);
                  onClose();
                }}
                className="flex-1 flex items-center justify-center gap-2 text-xs font-bold"
              >
                <Plus size={15} />
                Añadir al Proyecto
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
