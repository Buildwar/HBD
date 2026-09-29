import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Box, ArrowLeft, Eye, Sparkles } from 'lucide-react';
import { Navbar } from '../components/layout/Navbar.js';
import { Card } from '../components/ui/Card.js';
import { Button } from '../components/ui/Button.js';
import { Badge } from '../components/ui/Badge.js';

export const Viewer3DPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <Navbar
        title="Motor 3D & Gemelo Digital"
        subtitle="Conversión de geometría 2D a mallas tridimensionales con Three.js / WebGL"
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
        <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-start gap-3.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
            <Box size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-white">Módulo: Visor 3D</h4>
              <Badge variant="brand">Activo</Badge>
            </div>
            <p className="text-xs text-gray-300 mt-1 leading-relaxed">
              El motor de conversión 3D genera paredes volumétricas extruidas, suelos triangulados y huecos de carpinterías a partir del modelo 2D con navegación órbita, primera persona e iluminación dinámica.
            </p>
          </div>
        </div>

        <Card className="min-h-[420px] flex flex-col items-center justify-center text-center p-8 bg-gradient-to-b from-dark-surface to-dark-card border-dark-border">
          <div className="w-20 h-20 rounded-3xl bg-dark-card border border-dark-border flex items-center justify-center text-indigo-400 shadow-xl mb-4">
            <Box size={40} className="animate-pulse" />
          </div>
          <h3 className="text-lg font-bold text-white">Espacio WebGL 3D Listo para Extrusión</h3>
          <p className="text-xs text-gray-400 max-w-md mt-1">
            Los datos de plantas, paredes, puertas y habitaciones se sincronizarán directamente en mallas 3D interactivas.
          </p>
        </Card>
      </div>
    </div>
  );
};
