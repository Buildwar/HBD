/**
 * HBD — HOME BOARD DESIGNER
 * V16.0.0 — PRODUCTS & DIGITAL FURNITURE TWINS PAGE
 *
 * Autor: Adrián Palma
 * Copyright: © 2026 Adrián Palma. Todos los derechos reservados.
 */

import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Package,
  Plus,
  Search,
  Filter,
  Sparkles,
  ShoppingBag,
  Scale,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { Button } from '../components/ui/Button.js';
import { Input } from '../components/ui/Input.js';
import {
  ProductCard,
  ProductImportModal,
  ProductDetailModal,
  ProductCompareModal,
  ProductShoppingListTab,
} from '../features/products/index.js';
import { ProductService } from '../services/product.service.js';
import { ProductDto } from '@hbd/shared';

export const ProductsPage: React.FC = () => {
  const { t } = useTranslation();
  const [products, setProducts] = useState<ProductDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'CATALOG' | 'SHOPPING_LIST'>('CATALOG');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedBrand, setSelectedBrand] = useState<string>('ALL');

  // Modales
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductDto | null>(null);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
  const [compareList, setCompareList] = useState<ProductDto[]>([]);

  const loadProducts = async () => {
    setIsLoading(true);
    try {
      const list = await ProductService.getProducts();
      setProducts(list);
    } catch (err) {
      console.error('Error cargando catálogo de productos', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleProductImportSuccess = (newProduct: ProductDto) => {
    setProducts((prev) => [newProduct, ...prev]);
    setSelectedProduct(newProduct);
  };

  const handleDeleteProduct = async (product: ProductDto) => {
    if (window.confirm(t('products.confirmDelete', { name: product.name, defaultValue: `¿Seguro que deseas eliminar "${product.name}" del catálogo?` }))) {
      try {
        await ProductService.deleteProduct(product.id);
        setProducts((prev) => prev.filter((p) => p.id !== product.id));
      } catch (err) {
        console.error('Error eliminando producto', err);
      }
    }
  };

  const categories = [
    { id: 'ALL', label: t('products.allCategories', 'Todas las categorías') },
    { id: 'Sofás', label: t('products.catSofas', 'Sofás y Sillones') },
    { id: 'Mesas', label: t('products.catTables', 'Mesas y Escritorios') },
    { id: 'Sillas', label: t('products.catChairs', 'Sillas') },
    { id: 'Armarios', label: t('products.catWardrobes', 'Armarios y Almacenaje') },
    { id: 'Camas', label: t('products.catBeds', 'Camas y Dormitorio') },
    { id: 'Estanterías', label: t('products.catShelves', 'Estanterías') },
  ];

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      searchQuery === '' ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.brand && p.brand.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory =
      selectedCategory === 'ALL' ||
      p.category.toLowerCase().includes(selectedCategory.toLowerCase());

    const matchesBrand =
      selectedBrand === 'ALL' ||
      (p.brand && p.brand.toLowerCase().includes(selectedBrand.toLowerCase()));

    return matchesSearch && matchesCategory && matchesBrand;
  });

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-950 p-6 md:p-8 space-y-6">
      {/* Cabecera Principal */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white tracking-tight flex items-center space-x-3">
            <Package className="w-8 h-8 text-emerald-500" />
            <span>{t('products.pageTitle', 'Biblioteca de Productos')}</span>
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {t(
              'products.pageSubtitle',
              'Importa mobiliario real desde URLs de catálogo, extrae medidas y crea Gemelos Digitales para tus planos.'
            )}
          </p>
        </div>

        {/* Botonera de Acción */}
        <div className="flex items-center space-x-3">
          {products.length >= 2 && activeTab === 'CATALOG' && (
            <Button
              variant="outline"
              onClick={() => {
                setCompareList(filteredProducts.slice(0, 4));
                setIsCompareModalOpen(true);
              }}
              className="flex items-center space-x-2"
            >
              <Scale className="w-4 h-4" />
              <span>{t('products.compareBtn', 'Comparar')}</span>
            </Button>
          )}

          <Button
            variant="primary"
            onClick={() => setIsImportModalOpen(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center space-x-2 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>{t('products.importBtn', 'Importar Producto')}</span>
          </Button>
        </div>
      </div>

      {/* Pestañas de Vista (Catálogo vs Lista de Compra) */}
      <div className="flex items-center space-x-2 border-b border-gray-200 dark:border-gray-800 pb-2">
        <button
          onClick={() => setActiveTab('CATALOG')}
          className={`px-4 py-2 text-sm font-semibold rounded-xl transition-colors flex items-center space-x-2 ${
            activeTab === 'CATALOG'
              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
              : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>{t('products.catalogTab', 'Catálogo de Mobiliario')}</span>
          <span className="text-xs bg-gray-200 dark:bg-gray-800 px-2 py-0.5 rounded-full text-gray-600 dark:text-gray-400">
            {products.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('SHOPPING_LIST')}
          className={`px-4 py-2 text-sm font-semibold rounded-xl transition-colors flex items-center space-x-2 ${
            activeTab === 'SHOPPING_LIST'
              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
              : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>{t('products.shoppingListTab', 'Lista de Compras')}</span>
        </button>
      </div>

      {/* VISTA 1: CATÁLOGO */}
      {activeTab === 'CATALOG' && (
        <div className="space-y-6">
          {/* Barra de Búsqueda y Filtros */}
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('products.searchPlaceholder', 'Buscar por nombre, marca o modelo...')}
                className="pl-10 text-sm rounded-xl"
              />
            </div>

            {/* Chips de Categorías */}
            <div className="flex items-center space-x-2 overflow-x-auto w-full md:w-auto pb-1">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium shrink-0 transition-all ${
                    selectedCategory === cat.id
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-white dark:bg-gray-800/80 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-emerald-500'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Grid de Productos */}
          {isLoading ? (
            <div className="py-20 flex justify-center items-center">
              <div className="w-8 h-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin"></div>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="py-24 text-center bg-white dark:bg-gray-900/60 rounded-3xl border border-gray-200 dark:border-gray-800 p-8 space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                <Package className="w-8 h-8" />
              </div>
              <div className="space-y-1 max-w-md mx-auto">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  {t('products.emptyTitle', 'No hay productos en esta vista')}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {t(
                    'products.emptySubtitle',
                    'Importa productos desde páginas oficiales de IKEA u otros fabricantes pegando su enlace directo.'
                  )}
                </p>
              </div>
              <Button
                variant="primary"
                onClick={() => setIsImportModalOpen(true)}
                className="bg-emerald-600 hover:bg-emerald-700 mx-auto flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>{t('products.importFirstBtn', 'Importar mi primer producto')}</span>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((prod) => (
                <ProductCard
                  key={prod.id}
                  product={prod}
                  onSelect={(p) => setSelectedProduct(p)}
                  onDelete={handleDeleteProduct}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* VISTA 2: LISTA DE COMPRAS */}
      {activeTab === 'SHOPPING_LIST' && (
        <ProductShoppingListTab projectId="global-library" />
      )}

      {/* Modales */}
      <ProductImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onSuccess={handleProductImportSuccess}
      />

      <ProductDetailModal
        product={selectedProduct}
        isOpen={Boolean(selectedProduct)}
        onClose={() => setSelectedProduct(null)}
      />

      <ProductCompareModal
        products={compareList}
        isOpen={isCompareModalOpen}
        onClose={() => setIsCompareModalOpen(false)}
        onSelectProduct={(p) => setSelectedProduct(p)}
      />
    </div>
  );
};
