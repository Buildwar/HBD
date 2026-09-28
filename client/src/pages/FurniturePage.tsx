import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Armchair, CheckCircle2, ArrowLeft, Plus, Sparkles } from 'lucide-react';
import { Navbar } from '../components/layout/Navbar.js';
import { Card } from '../components/ui/Card.js';
import { Button } from '../components/ui/Button.js';
import { Badge } from '../components/ui/Badge.js';

export const FurniturePage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const categories = [
    { name: 'Sofás y Sillones', count: 12, slug: 'sofas' },
    { name: 'Camas y Dormitorio', count: 8, slug: 'camas' },
    { name: 'Mesas y Comedor', count: 15, slug: 'mesas' },
    { name: 'Sillas y Taburetes', count: 20, slug: 'sillas' },
    { name: 'Armarios y Almacenaje', count: 10, slug: 'armarios' },
    { name: 'Cocina y Electrodomésticos', count: 18, slug: 'cocina' },
  ];

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <Navbar
        title="Catálogo de Mobiliario & Validación Espacial"
        subtitle="Biblioteca de muebles reales, creación personalizada y función '¿Cabe aquí?'"
        actions={
          <Button
            variant="outline"
            size="sm"
            icon={<ArrowLeft size={16} />}
            onClick={() => navigate('/dashboard')}
          >
            {t('common.back')}
          </Button>
        }
      />

      <div className="p-8 max-w-6xl mx-auto w-full space-y-6">
        {/* Banner Informativo */}
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3.5">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
            <Armchair size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-white">Módulo: Mobiliario & Espacio (Fase 4)</h4>
              <Badge variant="warning">🟡 Preparado en BD / UI</Badge>
            </div>
            <p className="text-xs text-gray-300 mt-1 leading-relaxed">
              Esquemas de base de datos (`furniture_categories`, `furniture`, `furniture_placements`) creados en la Fase 1. En la Fase 4 se activará el arrastre interactivo en el lienzo 2D y el detector de colisiones "¿Cabe aquí?".
            </p>
          </div>
        </div>

        {/* Categorías de Mobiliario */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Categorías de Mobiliario Configuradas
            </h3>
            <Button size="sm" variant="secondary" icon={<Plus size={14} />} disabled>
              Añadir Mueble Personalizado (Fase 4)
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((cat) => (
              <Card key={cat.slug} className="p-5 flex items-center justify-between group">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-dark-card text-brand-400 flex items-center justify-center border border-dark-border">
                    <Armchair size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">{cat.name}</h4>
                    <p className="text-xs text-gray-400 mt-0.5">Modelos parametrizados</p>
                  </div>
                </div>
                <Badge variant="gray">{cat.count} items</Badge>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
