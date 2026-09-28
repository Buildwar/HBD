import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Sparkles, ArrowLeft, Image as ImageIcon } from 'lucide-react';
import { Navbar } from '../components/layout/Navbar.js';
import { Card } from '../components/ui/Card.js';
import { Button } from '../components/ui/Button.js';
import { Badge } from '../components/ui/Badge.js';

export const RendersPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <Navbar
        title="Galería de Renders & Visualización"
        subtitle="Generación de imágenes fotorrealistas e iluminación espacial"
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

      <div className="p-8 max-w-5xl mx-auto w-full space-y-6">
        <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-start gap-3.5">
          <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0 mt-0.5">
            <Sparkles size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-white">Módulo: Renderizado (Fase 7)</h4>
              <Badge variant="warning">🟡 Previsto en Roadmap</Badge>
            </div>
            <p className="text-xs text-gray-300 mt-1 leading-relaxed">
              La entidad de base de datos `renders` está preparada para almacenar y catalogar visualizaciones fotorrealistas y perspectivas cenitales generadas desde el gemelo digital.
            </p>
          </div>
        </div>

        <Card className="min-h-[360px] flex flex-col items-center justify-center text-center p-8">
          <div className="w-16 h-16 rounded-2xl bg-dark-card border border-dark-border flex items-center justify-center text-purple-400 mb-3">
            <ImageIcon size={32} />
          </div>
          <h3 className="text-base font-bold text-white">Galería de Renders</h3>
          <p className="text-xs text-gray-400 max-w-sm mt-1">
            Los renders de tus proyectos se almacenarán y exportarán en alta resolución.
          </p>
        </Card>
      </div>
    </div>
  );
};
