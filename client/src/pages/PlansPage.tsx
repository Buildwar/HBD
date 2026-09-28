import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FileSpreadsheet, Upload, Eye, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';
import { Navbar } from '../components/layout/Navbar.js';
import { Card } from '../components/ui/Card.js';
import { Button } from '../components/ui/Button.js';
import { Badge } from '../components/ui/Badge.js';

export const PlansPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <Navbar
        title="Motor de Planos Arquitectónicos"
        subtitle="Detección de paredes, cotas, habitaciones y cálculo de escala"
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
        {/* Banner Informativo de Fase */}
        <div className="p-4 rounded-2xl bg-brand-500/10 border border-brand-500/30 flex items-start gap-3.5">
          <div className="w-8 h-8 rounded-xl bg-brand-500/20 text-brand-400 flex items-center justify-center shrink-0 mt-0.5">
            <FileSpreadsheet size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-white">Módulo: Motor de Planos (Fase 2)</h4>
              <Badge variant="warning">🟡 En desarrollo (Roadmap Fase 2)</Badge>
            </div>
            <p className="text-xs text-gray-300 mt-1 leading-relaxed">
              En la Fase 1 se ha completado la arquitectura, base de datos de planos (`floor_plans`), cálculo de escala e interfaz. En la Fase 2 se integrará el pipeline de análisis de PDFs vectoriales/rasterizados y OCR de cotas.
            </p>
          </div>
        </div>

        {/* Zona de Subida y Caso de Referencia */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="flex flex-col justify-between p-6 border-dashed border-2 border-dark-border hover:border-brand-500/60 transition-colors">
            <div className="text-center py-6 space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-dark-card border border-dark-border flex items-center justify-center text-brand-400 mx-auto">
                <Upload size={24} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Cargar Plano de Vivienda</h4>
                <p className="text-xs text-gray-400 mt-1">
                  Formatos soportados: PDF arquitectónico, PNG, JPEG (hasta 50 MB)
                </p>
              </div>
            </div>

            <Button variant="secondary" className="w-full" disabled>
              Seleccionar Archivo (Próximamente Fase 2)
            </Button>
          </Card>

          <Card className="p-6 space-y-4">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <CheckCircle2 size={16} className="text-brand-400" />
              Pipeline de Análisis Geométrico
            </h4>
            <div className="space-y-2.5 text-xs text-gray-300">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-dark-card border border-dark-border flex items-center justify-center font-bold text-[10px] text-brand-400">1</span>
                <span>Lectura de PDF (detección de capas vectoriales CAD)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-dark-card border border-dark-border flex items-center justify-center font-bold text-[10px] text-brand-400">2</span>
                <span>Renderizado a alta resolución si el plano es raster</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-dark-card border border-dark-border flex items-center justify-center font-bold text-[10px] text-brand-400">3</span>
                <span>Detección de escala gráfica y cotas numéricas</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-dark-card border border-dark-border flex items-center justify-center font-bold text-[10px] text-brand-400">4</span>
                <span>Construcción de entidades geométricas de paredes y puertas</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-dark-card border border-dark-border flex items-center justify-center font-bold text-[10px] text-brand-400">5</span>
                <span>Revisión y validación por el usuario en el Editor 2D</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
