import React, { useState, useEffect } from 'react';
import {
  Armchair,
  Search,
  Plus,
  X,
  Sparkles,
  Layers,
  CheckCircle2,
  Box,
  Sliders,
} from 'lucide-react';
import { Button } from '../ui/Button.js';
import { Input } from '../ui/Input.js';
import { Badge } from '../ui/Badge.js';
import {
  FurnitureDto,
  FurnitureCategoryDto,
  FurnitureEngine,
} from '@hbd/shared';
import { furnitureService } from '../../services/furniture.service.js';
import { CreateFurnitureModal } from './CreateFurnitureModal.js';

interface FurnitureDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectFurniture: (furniture: FurnitureDto) => void;
}

export const FurnitureDrawer: React.FC<FurnitureDrawerProps> = ({
  isOpen,
  onClose,
  onSelectFurniture,
}) => {
  const [categories, setCategories] = useState<FurnitureCategoryDto[]>([]);
  const [furnitureList, setFurnitureList] = useState<FurnitureDto[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

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
      console.error('Error loading furniture drawer data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const filteredFurniture = furnitureList.filter((item) => {
    const matchesCat = selectedCategory === 'all' || item.categoryId === selectedCategory;
    const matchesSearch = !searchQuery || item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <>
      <div className="fixed inset-y-0 right-0 w-80 sm:w-96 bg-dark-surface/95 backdrop-blur-xl border-l border-dark-border z-50 shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-4 border-b border-dark-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-brand-500/20 text-brand-400 flex items-center justify-center">
              <Armchair size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Catálogo de Mobiliario</h3>
              <p className="text-[10px] text-gray-400">Selecciona para colocar en el plano</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-dark-card transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Search & Action bar */}
        <div className="p-3 space-y-2.5 border-b border-dark-border">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nombre (ej. Sofá, Mesa...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-dark-card border border-dark-border text-xs text-white placeholder:text-gray-500 focus:outline-none focus:border-brand-500"
            />
          </div>

          <div className="flex items-center justify-between gap-2">
            {/* Category pills */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="flex-1 px-2.5 py-1.5 rounded-xl bg-dark-card border border-dark-border text-xs text-gray-200 focus:outline-none focus:border-brand-500"
            >
              <option value="all">Todas las categorías ({furnitureList.length})</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            <Button
              size="sm"
              icon={<Plus size={14} />}
              onClick={() => setIsCreateModalOpen(true)}
            >
              Nuevo
            </Button>
          </div>
        </div>

        {/* Furniture Cards List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {isLoading ? (
            <div className="py-12 text-center text-xs text-gray-400">Cargando biblioteca...</div>
          ) : filteredFurniture.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <Box size={24} className="text-gray-500 mx-auto" />
              <p className="text-xs text-gray-400">No se encontraron muebles</p>
              <Button size="sm" variant="outline" onClick={() => setIsCreateModalOpen(true)}>
                Crear Mueble Personalizado
              </Button>
            </div>
          ) : (
            filteredFurniture.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  onSelectFurniture(item);
                  onClose();
                }}
                className="p-3 rounded-xl bg-dark-card/80 hover:bg-dark-card border border-dark-border hover:border-brand-500/50 cursor-pointer transition-all space-y-1.5 group"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-bold text-white group-hover:text-brand-400 transition-colors">
                      {item.name}
                    </h4>
                    <span className="text-[10px] text-gray-400 font-medium">
                      {item.category?.name || 'General'}
                    </span>
                  </div>
                  {item.isCustom ? (
                    <Badge variant="brand">Personalizado</Badge>
                  ) : (
                    <Badge variant="gray">Catálogo</Badge>
                  )}
                </div>

                {/* Dimension Badge in cm */}
                <div className="flex items-center justify-between text-[11px] pt-1 border-t border-dark-border/40 font-mono">
                  <span className="text-gray-400">Dimensiones:</span>
                  <span className="text-brand-400 font-bold">
                    {FurnitureEngine.formatDimensionsCm(
                      item.defaultWidthM,
                      item.defaultDepthM,
                      item.defaultHeightM
                    )}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal for creating custom furniture */}
      <CreateFurnitureModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        categories={categories}
        onFurnitureCreated={(newF) => {
          setFurnitureList((prev) => [newF, ...prev]);
        }}
      />
    </>
  );
};
