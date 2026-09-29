import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Armchair,
  Search,
  Plus,
  ArrowLeft,
  Sliders,
  Trash2,
  Edit3,
  Box,
  Sparkles,
  CheckCircle2,
  Tag,
} from 'lucide-react';
import { Navbar } from '../components/layout/Navbar.js';
import { Card } from '../components/ui/Card.js';
import { Button } from '../components/ui/Button.js';
import { Badge } from '../components/ui/Badge.js';
import { Input } from '../components/ui/Input.js';
import {
  FurnitureDto,
  FurnitureCategoryDto,
  FurnitureEngine,
} from '@hbd/shared';
import { furnitureService } from '../services/furniture.service.js';
import { CreateFurnitureModal } from '../components/furniture/CreateFurnitureModal.js';

export const FurniturePage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [categories, setCategories] = useState<FurnitureCategoryDto[]>([]);
  const [furnitureList, setFurnitureList] = useState<FurnitureDto[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [onlyCustom, setOnlyCustom] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Create / Edit modal state
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<FurnitureDto | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [catsRes, furnRes] = await Promise.all([
        furnitureService.getCategories(),
        furnitureService.getFurniture(),
      ]);
      if (catsRes.data) setCategories(catsRes.data);
      if (furnRes.data) setFurnitureList(furnRes.data);
    } catch (err) {
      console.error('Error loading furniture page data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`¿Estás seguro de eliminar el mueble "${name}" de tu biblioteca?`)) return;
    try {
      await furnitureService.deleteFurniture(id);
      setFurnitureList((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      console.error('Error deleting furniture:', err);
    }
  };

  const filteredFurniture = furnitureList.filter((item) => {
    const matchesCat = selectedCategory === 'all' || item.categoryId === selectedCategory;
    const matchesSearch = !searchQuery || item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCustom = !onlyCustom || item.isCustom;
    return matchesCat && matchesSearch && matchesCustom;
  });

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <Navbar
        title="Biblioteca de Mobiliario"
        subtitle="Gestión de catálogo, piezas personalizadas y dimensiones reales"
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="primary"
              size="sm"
              icon={<Plus size={16} />}
              onClick={() => {
                setEditingItem(null);
                setIsModalOpen(true);
              }}
            >
              Nuevo Mueble Personalizado
            </Button>
            <Button
              variant="outline"
              size="sm"
              icon={<ArrowLeft size={16} />}
              onClick={() => navigate('/dashboard')}
            >
              {t('common.back')}
            </Button>
          </div>
        }
      />

      <div className="p-8 max-w-7xl mx-auto w-full space-y-6 flex-1">
        {/* Banner */}
        <div className="p-4 rounded-2xl bg-brand-500/10 border border-brand-500/30 flex items-start gap-3.5">
          <div className="w-8 h-8 rounded-xl bg-brand-500/20 text-brand-400 flex items-center justify-center shrink-0 mt-0.5">
            <Armchair size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-white">Motor de Mobiliario & Geometría Real</h4>
              <Badge variant="brand">Activo</Badge>
            </div>
            <p className="text-xs text-gray-300 mt-1 leading-relaxed">
              Cada elemento de la biblioteca almacena sus cotas tridimensionales físicas (ancho, fondo, alto). Al arrastrarse al plano 2D, el motor de colisiones y validación espacial verifica holguras de paso, bloqueos de puertas y calcula la compatibilidad "¿Cabe aquí?".
            </p>
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="p-4 rounded-2xl bg-dark-surface border border-dark-border flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-[280px]">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nombre de mueble..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-dark-card border border-dark-border text-xs text-white placeholder:text-gray-500 focus:outline-none focus:border-brand-500"
              />
            </div>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 rounded-xl bg-dark-card border border-dark-border text-xs text-white focus:outline-none focus:border-brand-500"
            >
              <option value="all">Todas las categorías ({furnitureList.length})</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setOnlyCustom(!onlyCustom)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                onlyCustom
                  ? 'bg-brand-500/20 text-brand-400 border-brand-500/50'
                  : 'bg-dark-card text-gray-400 border-dark-border hover:text-white'
              }`}
            >
              Solo Mis Muebles
            </button>
          </div>
        </div>

        {/* Furniture Grid */}
        {isLoading ? (
          <div className="py-20 text-center space-y-3">
            <div className="w-10 h-10 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-gray-400">Cargando biblioteca de muebles...</p>
          </div>
        ) : filteredFurniture.length === 0 ? (
          <div className="py-20 text-center space-y-3 bg-dark-surface rounded-2xl border border-dark-border p-8">
            <Box size={32} className="text-gray-500 mx-auto" />
            <h4 className="text-base font-bold text-white">No se encontraron muebles</h4>
            <p className="text-xs text-gray-400 max-w-sm mx-auto">
              Prueba con otro término de búsqueda o crea una nueva pieza personalizada.
            </p>
            <Button
              size="sm"
              icon={<Plus size={16} />}
              onClick={() => {
                setEditingItem(null);
                setIsModalOpen(true);
              }}
            >
              Crear Mueble
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredFurniture.map((item) => (
              <Card
                key={item.id}
                className="p-4 flex flex-col justify-between space-y-3 hover:border-brand-500/50 transition-all group"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="w-9 h-9 rounded-xl bg-dark-card border border-dark-border flex items-center justify-center text-brand-400 shrink-0">
                      <Armchair size={18} />
                    </div>
                    {item.isCustom ? (
                      <Badge variant="brand">Personalizado</Badge>
                    ) : (
                      <Badge variant="gray">Catálogo</Badge>
                    )}
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-white group-hover:text-brand-400 transition-colors">
                      {item.name}
                    </h4>
                    <p className="text-xs text-gray-400 mt-0.5">{item.category?.name || 'Mueble'}</p>
                  </div>
                </div>

                <div className="space-y-2.5 pt-2 border-t border-dark-border/60">
                  <div className="p-2.5 rounded-xl bg-dark-card/60 border border-dark-border/40 font-mono text-center">
                    <span className="text-[10px] text-gray-400 block mb-0.5">Dimensiones (Ancho × Fondo × Alto)</span>
                    <span className="text-xs font-bold text-brand-400">
                      {FurnitureEngine.formatDimensionsCm(
                        item.defaultWidthM,
                        item.defaultDepthM,
                        item.defaultHeightM
                      )}
                    </span>
                  </div>

                  {item.isCustom && (
                    <div className="flex items-center justify-end gap-1.5 pt-1">
                      <button
                        onClick={() => {
                          setEditingItem(item);
                          setIsModalOpen(true);
                        }}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-dark-card transition-colors"
                        title="Editar"
                      >
                        <Edit3 size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id, item.name)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Modal Crear / Editar Mueble */}
      <CreateFurnitureModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingItem(null);
        }}
        categories={categories}
        initialData={editingItem}
        onFurnitureCreated={(newF) => {
          loadData();
        }}
      />
    </div>
  );
};
