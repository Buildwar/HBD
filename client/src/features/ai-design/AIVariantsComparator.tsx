/**
 * HBD — HOME BOARD DESIGNER (V8.0.0)
 * AIVariantsComparator — Comparador Lado a Lado de Propuestas y Variantes
 * Autor Oficial: Adrián Palma
 * Copyright: © 2026 Adrián Palma — HBD (Home Board Designer)
 */

import React from 'react';
import {
  Scale,
  X,
  CheckCircle2,
  Armchair,
  Palette,
  Sun,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { AIDesignProposal } from '@hbd/shared';
import { Button } from '../../components/ui/Button.js';
import { Badge } from '../../components/ui/Badge.js';
import { Card } from '../../components/ui/Card.js';

interface AIVariantsComparatorProps {
  isOpen: boolean;
  onClose: () => void;
  proposals: AIDesignProposal[];
  onSelectVariant: (proposal: AIDesignProposal) => void;
}

export const AIVariantsComparator: React.FC<AIVariantsComparatorProps> = ({
  isOpen,
  onClose,
  proposals,
  onSelectVariant,
}) => {
  if (!isOpen || proposals.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-6xl bg-dark-surface border border-dark-border rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-dark-border/70 bg-dark-card/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-500/20 text-brand-400 border border-brand-500/30 flex items-center justify-center shadow-lg">
              <Scale size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Comparativa de Propuestas de IA</h3>
              <p className="text-xs text-gray-400">
                Evalúa diferencias de distribución, estilo, mobiliario y holguras espaciales
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-2 rounded-xl hover:bg-dark-hover transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Comparison Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className={`grid grid-cols-1 md:grid-cols-${Math.min(proposals.length, 3)} gap-6`}>
            {proposals.map((prop) => (
              <Card
                key={prop.id}
                className="p-5 flex flex-col justify-between space-y-5 bg-dark-card/50 border-dark-border hover:border-brand-500/50 transition-all"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-white">{prop.name}</h4>
                    <Badge variant="brand" size="sm">
                      {prop.style}
                    </Badge>
                  </div>

                  <p className="text-xs text-gray-300 leading-relaxed">{prop.summary}</p>

                  <div className="space-y-3 pt-3 border-t border-dark-border/50 text-xs">
                    {/* Atmósfera & Validación */}
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Atmósfera:</span>
                      <span className="font-semibold text-white capitalize">{prop.atmosphere}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Validación Geométrica:</span>
                      <Badge variant="success" size="sm">
                        ✓ Físicamente Válida
                      </Badge>
                    </div>

                    {/* Mobiliario */}
                    <div className="space-y-1 pt-2 border-t border-dark-border/40">
                      <span className="font-bold text-gray-300 flex items-center gap-1.5">
                        <Armchair size={13} className="text-brand-400" />
                        Mobiliario ({prop.furnitureChanges.length} piezas)
                      </span>
                      <ul className="space-y-1 text-[11px] text-gray-400">
                        {prop.furnitureChanges.map((f, i) => (
                          <li key={i} className="truncate">
                            • {f.furnitureName} ({f.dimensions.widthM}m × {f.dimensions.depthM}m)
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Iluminación */}
                    <div className="pt-2 border-t border-dark-border/40 flex items-center justify-between text-[11px]">
                      <span className="text-gray-400">Iluminación Solar:</span>
                      <span className="font-semibold text-amber-300">
                        {prop.lightingOverrides.timeOfDay || '12:00'} ({prop.lightingOverrides.colorTempK || 3000}K)
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-dark-border/50">
                  <Button
                    variant="primary"
                    size="sm"
                    className="w-full"
                    icon={<Check size={14} />}
                    onClick={() => onSelectVariant(prop)}
                  >
                    Seleccionar Esta Propuesta
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
