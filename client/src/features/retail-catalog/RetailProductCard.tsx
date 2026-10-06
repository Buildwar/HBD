import React from 'react';
import { ShoppingBag, Eye, Plus, Maximize2, ShieldCheck, Check, Heart, ExternalLink } from 'lucide-react';
import { Card } from '../../components/ui/Card.js';
import { Button } from '../../components/ui/Button.js';
import { Badge } from '../../components/ui/Badge.js';
import type { RetailProductDto } from '@hbd/shared';

interface RetailProductCardProps {
  product: RetailProductDto;
  isCompared?: boolean;
  onViewDetails: (product: RetailProductDto) => void;
  onAddToProject: (product: RetailProductDto) => void;
  onToggleCompare?: (product: RetailProductDto) => void;
  onToggleFavorite?: (product: RetailProductDto) => void;
}

export const RetailProductCard: React.FC<RetailProductCardProps> = ({
  product,
  isCompared = false,
  onViewDetails,
  onAddToProject,
  onToggleCompare,
  onToggleFavorite,
}) => {
  const formatPrice = (amount: number, currency: string) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: currency || 'EUR',
    }).format(amount);
  };

  const getRetailerBadge = (code: string) => {
    switch (code) {
      case 'IKEA':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-600 text-yellow-300">IKEA</span>;
      case 'LEROY_MERLIN':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-green-600 text-white">LEROY MERLIN</span>;
      case 'KAVE_HOME':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-neutral-800 text-emerald-400 border border-emerald-500/30">KAVE HOME</span>;
      case 'CONFORAMA':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-600 text-white">CONFORAMA</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-600 text-white">{code}</span>;
    }
  };

  const getStockBadge = (status: string) => {
    switch (status) {
      case 'IN_STOCK':
        return <Badge variant="success" className="text-[10px]">En Stock</Badge>;
      case 'AVAILABLE_TO_ORDER':
        return <Badge variant="warning" className="text-[10px]">Bajo Pedido</Badge>;
      case 'OUT_OF_STOCK':
        return <Badge variant="danger" className="text-[10px]">Agotado</Badge>;
      default:
        return <Badge variant="gray" className="text-[10px]">Disponible</Badge>;
    }
  };

  return (
    <Card className="flex flex-col justify-between overflow-hidden group hover:border-primary-500/60 transition-all duration-200 hover:shadow-xl hover:shadow-primary-500/5">
      <div>
        {/* Imagen del producto con badges */}
        <div className="relative aspect-[4/3] bg-dark-bg/60 rounded-xl overflow-hidden mb-3.5 border border-dark-border/40">
          {product.primaryImageUrl ? (
            <img
              src={product.primaryImageUrl}
              alt={product.name}
              className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-gray-500 gap-2">
              <ShoppingBag size={28} className="opacity-40" />
              <span className="text-xs">Imagen del catálogo</span>
            </div>
          )}

          {/* Badge de Retailer */}
          <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 shadow-md">
            {getRetailerBadge(product.retailerCode)}
            {product.isMockData && (
              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-dark-card/90 text-gray-300 border border-dark-border">
                MOCK
              </span>
            )}
          </div>

          {/* Botón Favorito */}
          {onToggleFavorite && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(product);
              }}
              className="absolute top-2.5 right-2.5 p-1.5 rounded-lg bg-dark-card/80 text-gray-400 hover:text-red-400 hover:bg-dark-card border border-dark-border/60 transition-colors shadow-sm"
              title="Guardar en favoritos"
            >
              <Heart size={15} className={product.isFavorite ? 'fill-red-500 text-red-500' : ''} />
            </button>
          )}

          {/* Stock y Dimensiones resumidas */}
          <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
            {getStockBadge(product.availability.status)}
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-dark-card/90 text-gray-200 border border-dark-border/60 shadow-sm backdrop-blur-sm">
              {Math.round(product.dimensions.widthM * 100)}×{Math.round(product.dimensions.depthM * 100)}×{Math.round(product.dimensions.heightM * 100)} cm
            </span>
          </div>
        </div>

        {/* Marca y Nombre */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span className="font-semibold uppercase tracking-wider text-[11px] text-gray-300">
              {product.brand || product.retailerName}
            </span>
            <span className="text-[10px] text-gray-500 font-mono">
              SKU: {product.sku || product.externalId.slice(-8)}
            </span>
          </div>
          <h4
            onClick={() => onViewDetails(product)}
            className="text-sm font-bold text-white group-hover:text-primary-400 transition-colors line-clamp-1 cursor-pointer"
            title={product.name}
          >
            {product.name}
          </h4>
          <p className="text-xs text-gray-400 line-clamp-2 min-h-[32px]">
            {product.description || `Mobiliario oficial de ${product.retailerName}`}
          </p>
        </div>

        {/* Precio & Descuento */}
        <div className="flex items-baseline gap-2 mt-3 pt-2 border-t border-dark-border/40">
          <span className="text-lg font-extrabold text-white">
            {formatPrice(product.price.amount, product.price.currency)}
          </span>
          {product.price.previousAmount && (
            <span className="text-xs text-gray-500 line-through">
              {formatPrice(product.price.previousAmount, product.price.currency)}
            </span>
          )}
          {product.price.discountPercentage && (
            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
              -{Math.round(product.price.discountPercentage)}%
            </span>
          )}
        </div>
      </div>

      {/* Botones de Acción */}
      <div className="flex items-center gap-2 pt-3 mt-3 border-t border-dark-border/40">
        {onToggleCompare && (
          <button
            type="button"
            onClick={() => onToggleCompare(product)}
            className={`p-2 rounded-xl border text-xs transition-colors shrink-0 ${
              isCompared
                ? 'bg-primary-500/20 border-primary-500 text-primary-400'
                : 'bg-dark-card border-dark-border text-gray-400 hover:text-white hover:bg-dark-hover'
            }`}
            title="Comparar producto"
          >
            <Maximize2 size={14} />
          </button>
        )}

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onViewDetails(product)}
          className="flex-1 text-xs flex items-center justify-center gap-1.5"
        >
          <Eye size={13} />
          Ficha
        </Button>

        <Button
          type="button"
          variant="primary"
          size="sm"
          onClick={() => onAddToProject(product)}
          className="flex-1 text-xs flex items-center justify-center gap-1.5 font-bold"
        >
          <Plus size={14} />
          Al Proyecto
        </Button>
      </div>
    </Card>
  );
};
