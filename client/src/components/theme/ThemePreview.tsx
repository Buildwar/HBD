import React from 'react';
import { useTranslation } from 'react-i18next';
import { Layers, Home, Plus, FolderKanban, Check, Sparkles, Box } from 'lucide-react';
import { Card } from '../ui/Card.js';
import { Button } from '../ui/Button.js';
import { Badge } from '../ui/Badge.js';
import { Input } from '../ui/Input.js';
import { useTheme } from '../../context/ThemeContext.js';

export const ThemePreview: React.FC = () => {
  const { t } = useTranslation();
  const { themeMode, accentColor, borderRadius } = useTheme();

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles size={14} className="text-brand-400" />
          Previsualización en Tiempo Real
        </label>
        <span className="text-[11px] text-gray-400">
          Modo: <span className="font-semibold text-brand-400 capitalize">{themeMode}</span> • Acento: <span className="font-mono text-brand-400">{accentColor}</span>
        </span>
      </div>

      <div
        className="p-5 rounded-2xl bg-dark-bg border border-dark-border/80 shadow-inner space-y-4 transition-all"
        style={{ borderRadius }}
      >
        {/* Mock Topbar */}
        <div className="flex items-center justify-between pb-3 border-b border-dark-border/50">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-brand-500 flex items-center justify-center text-white shadow-md shadow-brand-500/25">
              <Layers size={14} className="stroke-[2.5]" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-100">HBD Studio</p>
              <p className="text-[10px] text-dark-muted">Dashboard Preview</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="brand" size="sm">
              <Check size={11} /> Activo
            </Badge>
          </div>
        </div>

        {/* Mock Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Card 1 */}
          <Card className="p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="w-8 h-8 rounded-lg bg-brand-500/15 text-brand-400 border border-brand-500/30 flex items-center justify-center">
                <Home size={16} />
              </div>
              <span className="text-[10px] text-gray-400">Residencial</span>
            </div>
            <div>
              <h5 className="text-xs font-bold text-gray-100">Casa Madrid — Reforma</h5>
              <p className="text-[11px] text-gray-400 mt-0.5">2 Plantas • 142.5 m²</p>
            </div>
            <div className="pt-2 border-t border-dark-border/40 flex items-center justify-between">
              <span className="text-[10px] text-brand-400 font-medium">Digitalizado 100%</span>
              <span className="text-[10px] text-gray-500">Hoy</span>
            </div>
          </Card>

          {/* Card 2: Interactive elements */}
          <Card className="p-4 space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <h5 className="text-xs font-bold text-gray-100">Controles & Componentes</h5>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="primary" icon={<Plus size={13} />}>
                  Principal
                </Button>
                <Button size="sm" variant="secondary">
                  Secundario
                </Button>
                <Button size="sm" variant="outline">
                  Contorno
                </Button>
              </div>
            </div>

            <div className="pt-2">
              <Input
                placeholder="Input con foco temático..."
                className="text-xs py-1.5"
                defaultValue="Home Board Designer"
              />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
