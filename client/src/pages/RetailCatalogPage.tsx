import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Search,
  CheckCircle2,
  X,
} from 'lucide-react';
import { Navbar } from '../components/layout/Navbar.js';
import { Card } from '../components/ui/Card.js';
import { Button } from '../components/ui/Button.js';
import {
  RetailProductCard,
  RetailProductDetailModal,
  RetailProductComparisonModal,
  AddToProjectModal,
} from '../features/retail-catalog/index.js';
import { retailCatalogService } from '../services/retailCatalog.service.js';
import type {
  RetailProductDto,
  RetailProductVariantDto,
  RetailCatalogSearchParams,
  RetailCatalogSearchResult,
  RetailerCode,
} from '@hbd/shared';

export const RetailCatalogPage: React.FC = () => {
  const { t } = useTranslation();

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedRetailers, setSelectedRetailers] = useState<RetailerCode[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'relevance' | 'price_asc' | 'price_desc' | 'dimensions' | 'quality'>('relevance');

  // Data state
  const [loading, setLoading] = useState<boolean>(true);
  const [searchResult, setSearchResult] = useState<RetailCatalogSearchResult | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modal states
  const [detailProduct, setDetailProduct] = useState<RetailProductDto | null>(null);
  const [addToProjectProduct, setAddToProjectProduct] = useState<RetailProductDto | null>(null);
  const [addToProjectVariant, setAddToProjectVariant] = useState<RetailProductVariantDto | undefined>(undefined);
  const [comparedProducts, setComparedProducts] = useState<RetailProductDto[]>([]);
  const [isComparisonModalOpen, setIsComparisonModalOpen] = useState<boolean>(false);

  useEffect(() => {
    loadProducts();
  }, [selectedRetailers, selectedCategory, inStockOnly, sortBy]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const params: RetailCatalogSearchParams = {
        query: searchQuery || undefined,
        retailerCodes: selectedRetailers.length > 0 ? selectedRetailers : undefined,
        categories: selectedCategory ? [selectedCategory] : undefined,
        inStockOnly: inStockOnly || undefined,
        sortBy,
        limit: 50,
      };

      const res = await retailCatalogService.search(params);
      if (res.success && res.data) {
        setSearchResult(res.data);
      }
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadProducts();
  };

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleToggleRetailer = (code: RetailerCode) => {
    if (selectedRetailers.includes(code)) {
      setSelectedRetailers(selectedRetailers.filter((c) => c !== code));
    } else {
      setSelectedRetailers([...selectedRetailers, code]);
    }
  };

  const handleToggleCompare = (product: RetailProductDto) => {
    if (comparedProducts.some((p) => p.id === product.id)) {
      setComparedProducts(comparedProducts.filter((p) => p.id !== product.id));
    } else {
      if (comparedProducts.length >= 4) {
        showToast(t('retailCatalog.maxComparison'));
        return;
      }
      setComparedProducts([...comparedProducts, product]);
    }
  };

  const handleOpenAddToProject = (product: RetailProductDto, variant?: RetailProductVariantDto) => {
    setAddToProjectProduct(product);
    setAddToProjectVariant(variant);
  };

  const allRetailers: { code: RetailerCode; label: string }[] = [
    { code: 'IKEA', label: 'IKEA' },
    { code: 'LEROY_MERLIN', label: 'Leroy Merlin' },
    { code: 'KAVE_HOME', label: 'Kave Home' },
    { code: 'CONFORAMA', label: 'Conforama' },
    { code: 'MAISONS_DU_MONDE', label: 'Maisons du Monde' },
    { code: 'MANOMANO', label: 'ManoMano' },
    { code: 'AMAZON', label: 'Amazon' },
  ];

  return (
    <div className="flex-1 flex flex-col min-h-screen pb-20">
      <Navbar
        title={t('retailCatalog.title')}
        subtitle={t('retailCatalog.subtitle')}
      />

      <div className="p-8 max-w-7xl mx-auto w-full space-y-6">
        {/* Toast Notificación */}
        {toastMessage && (
          <div className="p-4 rounded-xl bg-primary-500/15 border border-primary-500/30 text-primary-300 text-xs font-semibold flex items-center gap-2 animate-fadeIn shadow-lg">
            <CheckCircle2 size={16} className="text-primary-400" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Barra de Búsqueda y Filtros Rápidos */}
        <Card className="p-5 space-y-4">
          <form onSubmit={handleSearchSubmit} className="flex gap-3">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-3.5 top-3 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('retailCatalog.searchPlaceholder')}
                className="w-full bg-dark-bg border border-dark-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 font-medium"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    loadProducts();
                  }}
                  className="absolute right-3 top-3 text-gray-400 hover:text-white"
                >
                  <X size={16} />
                </button>
              )}
            </div>
            <Button type="submit" variant="primary" className="px-6 flex items-center gap-2 font-bold">
              <Search size={16} />
              {t('retailCatalog.searchButton')}
            </Button>
          </form>

          {/* Filtros de Tienda y Categoría */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-dark-border/40">
            {/* Retailers */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{t('retailCatalog.stores')}</span>
              <div className="flex flex-wrap gap-1.5">
                {allRetailers.map((r) => {
                  const isSelected = selectedRetailers.includes(r.code);
                  return (
                    <button
                      key={r.code}
                      type="button"
                      onClick={() => handleToggleRetailer(r.code)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors border ${
                        isSelected
                          ? 'bg-primary-500/20 border-primary-500 text-primary-300 font-bold'
                          : 'bg-dark-bg/60 border-dark-border text-gray-400 hover:text-white hover:bg-dark-hover'
                      }`}
                    >
                      {r.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Ordenación & In-Stock */}
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-xs text-gray-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                  className="w-4 h-4 text-primary-500 rounded bg-dark-bg border-dark-border"
                />
                <span>{t('retailCatalog.inStockOnly')}</span>
              </label>

              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">{t('retailCatalog.sortBy')}</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-dark-bg border border-dark-border rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-primary-500"
                >
                  <option value="relevance">{t('retailCatalog.sortRelevance')}</option>
                  <option value="price_asc">{t('retailCatalog.sortPriceAsc')}</option>
                  <option value="price_desc">{t('retailCatalog.sortPriceDesc')}</option>
                  <option value="quality">{t('retailCatalog.sortQuality')}</option>
                  <option value="dimensions">{t('retailCatalog.sortDimensions')}</option>
                </select>
              </div>
            </div>
          </div>
        </Card>

        {/* Resultados del Catálogo */}
        {loading ? (
          <div className="p-16 text-center text-gray-400">
            <div className="animate-spin w-10 h-10 border-2 border-primary-500 border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-sm font-medium">{t('retailCatalog.loading')}</p>
          </div>
        ) : searchResult && searchResult.items.length > 0 ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span>{searchResult.totalCount} {t('retailCatalog.items')}</span>
              {searchResult.queryNormalized && (
                <span className="font-mono text-gray-500">{t('retailCatalog.query')}: "{searchResult.queryNormalized}"</span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {searchResult.items.map((item) => (
                <RetailProductCard
                  key={item.id}
                  product={item}
                  isCompared={comparedProducts.some((p) => p.id === item.id)}
                  onViewDetails={(p) => setDetailProduct(p)}
                  onToggleCompare={handleToggleCompare}
                  onAddToProject={(p) => handleOpenAddToProject(p)}
                />
              ))}
            </div>
          </div>
        ) : (
          <Card className="p-12 text-center text-gray-400 space-y-3">
            <p className="text-base font-bold text-white">{t('retailCatalog.emptyTitle')}</p>
            <p className="text-xs text-gray-500 max-w-md mx-auto">
              {t('retailCatalog.emptySubtitle')}
            </p>
          </Card>
        )}
      </div>

      {/* Modal Ficha Detalle Producto */}
      {detailProduct && (
        <RetailProductDetailModal
          product={detailProduct}
          isOpen={Boolean(detailProduct)}
          onClose={() => setDetailProduct(null)}
          onAddToProject={(p, v) => {
            setDetailProduct(null);
            handleOpenAddToProject(p, v);
          }}
        />
      )}

      {/* Modal Comparativa de Productos */}
      {isComparisonModalOpen && (
        <RetailProductComparisonModal
          comparedProducts={comparedProducts}
          isOpen={isComparisonModalOpen}
          onClose={() => setIsComparisonModalOpen(false)}
          onRemoveProduct={(id) => setComparedProducts(comparedProducts.filter((p) => p.id !== id))}
          onAddToProject={(p) => handleOpenAddToProject(p)}
        />
      )}

      {/* Modal Añadir a Proyecto */}
      {addToProjectProduct && (
        <AddToProjectModal
          product={addToProjectProduct}
          selectedVariant={addToProjectVariant}
          isOpen={Boolean(addToProjectProduct)}
          onClose={() => {
            setAddToProjectProduct(null);
            setAddToProjectVariant(undefined);
          }}
          onSuccess={(projName) => {
            setAddToProjectProduct(null);
            setAddToProjectVariant(undefined);
            showToast(t('retailCatalog.productAddedSuccess').replace('{projName}', projName));
          }}
        />
      )}
    </div>
  );
};
