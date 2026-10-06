import React, { useState, useEffect } from 'react';
import { Maximize2, ShieldCheck, X, CheckCircle2, DollarSign, Box, Truck } from 'lucide-react';
import { Modal } from '../../components/ui/Modal.js';
import { Button } from '../../components/ui/Button.js';
import { Badge } from '../../components/ui/Badge.js';
import { retailCatalogService } from '../../services/retailCatalog.service.js';
import type { RetailProductDto, RetailProductComparisonResultDto } from '@hbd/shared';

interface RetailProductComparisonModalProps {
  isOpen: boolean;
  comparedProducts: RetailProductDto[];
  onClose: () => void;
  onAddToProject: (product: RetailProductDto) => void;
  onRemoveProduct: (productId: string) => void;
}

export const RetailProductComparisonModal: React.FC<RetailProductComparisonModalProps> = ({
  isOpen,
  comparedProducts,
  onClose,
  onAddToProject,
  onRemoveProduct,
}) => {
  const [comparison, setComparison] = useState<RetailProductComparisonResultDto | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen && comparedProducts.length > 0) {
      loadComparison();
    }
  }, [isOpen, comparedProducts]);

  const loadComparison = async () => {
    try {
      setLoading(true);
      const res = await retailCatalogService.compareProducts(comparedProducts.map((p) => p.id));
      if (res.success && res.data) {
        setComparison(res.data);
      }
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || comparedProducts.length === 0) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Comparador Multicriterio de Productos Retail"
      description="Analiza precios, dimensiones, disponibilidad y especificaciones entre tiendas."
      maxWidth="5xl"
    >
      <div className="space-y-6 pt-2">
        {loading ? (
          <div className="p-8 text-center text-gray-400">
            <div className="animate-spin w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full mx-auto mb-3" />
            <p className="text-xs">Generando matriz de comparación...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {comparedProducts.map((product) => {
              const itemComparison = comparison?.items.find((i) => i.product.id === product.id);
              const isBestPrice = comparison?.bestPriceId === product.id;

              return (
                <div
                  key={product.id}
                  className={`p-4 rounded-xl border flex flex-col justify-between space-y-4 relative ${
                    isBestPrice
                      ? 'bg-emerald-500/5 border-emerald-500/60 ring-1 ring-emerald-500/40'
                      : 'bg-dark-card border-dark-border'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => onRemoveProduct(product.id)}
                    className="absolute top-3 right-3 p-1 rounded-md text-gray-400 hover:text-white hover:bg-dark-hover"
                    title="Quitar de la comparación"
                  >
                    <X size={14} />
                  </button>

                  <div className="space-y-3">
                    {/* Header */}
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-dark-bg text-primary-400 border border-dark-border">
                        {product.retailerName}
                      </span>
                      {isBestPrice && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          MEJOR PRECIO
                        </span>
                      )}
                    </div>

                    <div className="aspect-[16/10] bg-dark-bg rounded-lg overflow-hidden p-2 flex items-center justify-center border border-dark-border/40">
                      {product.primaryImageUrl ? (
                        <img src={product.primaryImageUrl} alt={product.name} className="w-full h-full object-contain" />
                      ) : (
                        <Box size={24} className="text-gray-500" />
                      )}
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-white line-clamp-1">{product.name}</h4>
                      <p className="text-lg font-black text-white mt-1">
                        {product.price.amount} {product.price.currency}
                      </p>
                    </div>

                    {/* Ficha de métricas */}
                    <div className="space-y-2 text-xs divide-y divide-dark-border/40 text-gray-300">
                      <div className="flex justify-between pt-1">
                        <span className="text-gray-400">Dimensiones:</span>
                        <span className="font-mono text-white">
                          {Math.round(product.dimensions.widthM * 100)}×{Math.round(product.dimensions.depthM * 100)}×{Math.round(product.dimensions.heightM * 100)} cm
                        </span>
                      </div>
                      <div className="flex justify-between pt-1.5">
                        <span className="text-gray-400">Disponibilidad:</span>
                        <span className="font-medium text-emerald-400">{product.availability.status}</span>
                      </div>
                      <div className="flex justify-between pt-1.5">
                        <span className="text-gray-400">Entrega:</span>
                        <span className="text-gray-200 truncate max-w-[140px]">
                          {product.availability.deliveryEstimateFormatted || `${product.availability.deliveryEstimateDays || 3} días`}
                        </span>
                      </div>
                      <div className="flex justify-between pt-1.5">
                        <span className="text-gray-400">Calidad Ficha:</span>
                        <span className="font-bold text-sky-400">{Math.round(product.dataQualityScore * 100)}%</span>
                      </div>
                    </div>

                    {/* Ventajas destacadas */}
                    {itemComparison && itemComparison.pros.length > 0 && (
                      <div className="space-y-1 pt-2">
                        {itemComparison.pros.map((pro, idx) => (
                          <div key={idx} className="flex items-center gap-1.5 text-[11px] text-emerald-400">
                            <CheckCircle2 size={12} className="shrink-0" />
                            <span>{pro}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      onAddToProject(product);
                      onClose();
                    }}
                    className="w-full text-xs font-bold"
                  >
                    Añadir al Proyecto
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Modal>
  );
};
