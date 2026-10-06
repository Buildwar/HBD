/**
 * HBD — HOME BOARD DESIGNER
 * Technical Infrastructure Layer Controller (Phase V21 / 1.21.0)
 * Autor: Adrián Palma
 * Copyright: © 2026 Adrián Palma. Todos los derechos reservados.
 */

import React from 'react';
import {
  Zap,
  Lightbulb,
  Network,
  Wifi,
  Radio,
  ShieldAlert,
  Wind,
  Droplets,
  Tv,
  Cpu,
  Eye,
  EyeOff
} from 'lucide-react';
import { TechnicalCategory } from '@hbd/shared';

interface LayerMeta {
  category: TechnicalCategory;
  label: string;
  icon: any;
  color: string;
  bgActive: string;
}

export const TECHNICAL_LAYERS: LayerMeta[] = [
  { category: 'ELECTRICAL', label: 'Electricidad y Fuerza', icon: Zap, color: '#f59e0b', bgActive: 'bg-amber-500/20 text-amber-400 border-amber-500/50' },
  { category: 'LIGHTING', label: 'Iluminación y Puntos de Luz', icon: Lightbulb, color: '#eab308', bgActive: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50' },
  { category: 'NETWORK', label: 'Red de Datos y Fibra', icon: Network, color: '#3b82f6', bgActive: 'bg-blue-500/20 text-blue-400 border-blue-500/50' },
  { category: 'WIFI', label: 'Puntos Wi-Fi y Cobertura', icon: Wifi, color: '#06b6d4', bgActive: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/50' },
  { category: 'SMART_HOME', label: 'Domótica e IoT', icon: Radio, color: '#8b5cf6', bgActive: 'bg-purple-500/20 text-purple-400 border-purple-500/50' },
  { category: 'SECURITY', label: 'Seguridad y Cámaras', icon: ShieldAlert, color: '#ef4444', bgActive: 'bg-red-500/20 text-red-400 border-red-500/50' },
  { category: 'HVAC', label: 'Climatización y Ventilación', icon: Wind, color: '#10b981', bgActive: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50' },
  { category: 'PLUMBING', label: 'Fontanería y Desagües', icon: Droplets, color: '#0284c7', bgActive: 'bg-sky-500/20 text-sky-400 border-sky-500/50' },
  { category: 'MULTIMEDIA', label: 'Multimedia y Audio', icon: Tv, color: '#ec4899', bgActive: 'bg-pink-500/20 text-pink-400 border-pink-500/50' },
  { category: 'TECHNICAL_ROOM', label: 'Cuadros y Racks', icon: Cpu, color: '#64748b', bgActive: 'bg-slate-500/20 text-slate-300 border-slate-500/50' }
];

interface TechnicalLayerControlProps {
  activeLayers: Set<TechnicalCategory>;
  countsByCategory: Record<TechnicalCategory, number>;
  onToggleLayer: (category: TechnicalCategory) => void;
  onToggleAll: (enable: boolean) => void;
}

export const TechnicalLayerControl: React.FC<TechnicalLayerControlProps> = ({
  activeLayers,
  countsByCategory,
  onToggleLayer,
  onToggleAll
}) => {
  const allActive = TECHNICAL_LAYERS.every((l) => activeLayers.has(l.category));

  return (
    <div className="bg-slate-900/90 backdrop-blur-md rounded-xl border border-slate-800 p-4 shadow-xl">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
          <Cpu className="w-4 h-4 text-emerald-400" />
          Capas Técnicas (10)
        </h3>
        <button
          onClick={() => onToggleAll(!allActive)}
          className="text-xs px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors flex items-center gap-1"
        >
          {allActive ? (
            <>
              <EyeOff className="w-3 h-3 text-slate-400" />
              Ocultar todo
            </>
          ) : (
            <>
              <Eye className="w-3 h-3 text-emerald-400" />
              Mostrar todo
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-1">
        {TECHNICAL_LAYERS.map((layer) => {
          const isActive = activeLayers.has(layer.category);
          const Icon = layer.icon;
          const count = countsByCategory[layer.category] || 0;

          return (
            <button
              key={layer.category}
              onClick={() => onToggleLayer(layer.category)}
              className={`flex items-center justify-between p-2 rounded-lg border text-xs font-medium transition-all text-left ${
                isActive
                  ? `${layer.bgActive} border-solid shadow-sm`
                  : 'bg-slate-800/40 text-slate-500 border-slate-800/80 hover:bg-slate-800/70 hover:text-slate-400'
              }`}
            >
              <div className="flex items-center gap-2 truncate">
                <Icon className="w-4 h-4 shrink-0" />
                <span className="truncate">{layer.label}</span>
              </div>
              <span
                className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                  isActive ? 'bg-slate-950/40 text-current' : 'bg-slate-800 text-slate-600'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
