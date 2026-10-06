/**
 * HBD — HOME BOARD DESIGNER
 * Technical Element Palette / Toolbox (Phase V21 / 1.21.0)
 * Autor: Adrián Palma
 * Copyright: © 2026 Adrián Palma. Todos los derechos reservados.
 */

import React, { useState } from 'react';
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
  Plus,
  Search
} from 'lucide-react';
import { TechnicalCategory, CreateTechnicalElementInput } from '@hbd/shared';

export interface ElementTemplate {
  name: string;
  category: TechnicalCategory;
  mountingType: any;
  defaultZ: number;
  powerWatts?: number;
  voltage?: number;
  circuitId?: string;
  ipRating?: string;
  poePowered?: boolean;
  icon: any;
}

export const TECHNICAL_TEMPLATES: ElementTemplate[] = [
  // Electricidad
  { name: 'Enchufe Schuko Doble (16A)', category: 'ELECTRICAL', mountingType: 'WALL_RECESSED', defaultZ: 0.30, powerWatts: 250, voltage: 230, circuitId: 'C2', icon: Zap },
  { name: 'Enchufe Encimera Cocina (16A)', category: 'ELECTRICAL', mountingType: 'WALL_RECESSED', defaultZ: 1.10, powerWatts: 350, voltage: 230, circuitId: 'C5', icon: Zap },
  { name: 'Toma Horno/Placa (25A)', category: 'ELECTRICAL', mountingType: 'WALL_RECESSED', defaultZ: 0.30, powerWatts: 5000, voltage: 230, circuitId: 'C3', icon: Zap },
  { name: 'Toma Lavadora/Termo (20A)', category: 'ELECTRICAL', mountingType: 'WALL_RECESSED', defaultZ: 0.40, powerWatts: 2200, voltage: 230, circuitId: 'C4', icon: Zap },

  // Iluminación
  { name: 'Punto de Luz Techo / Lámpara', category: 'LIGHTING', mountingType: 'CEILING_SURFACE', defaultZ: 2.50, powerWatts: 20, voltage: 230, circuitId: 'C1', icon: Lightbulb },
  { name: 'Foco Downlight LED Empotrado', category: 'LIGHTING', mountingType: 'CEILING_RECESSED', defaultZ: 2.45, powerWatts: 12, voltage: 230, circuitId: 'C1', icon: Lightbulb },
  { name: 'Interruptor Conmutado', category: 'LIGHTING', mountingType: 'WALL_RECESSED', defaultZ: 1.00, powerWatts: 0, voltage: 230, circuitId: 'C1', icon: Lightbulb },
  { name: 'Tira LED Oculta / Foseado', category: 'LIGHTING', mountingType: 'CEILING_RECESSED', defaultZ: 2.40, powerWatts: 45, voltage: 24, circuitId: 'C1', icon: Lightbulb },

  // Red
  { name: 'Toma RJ45 Doble Cat6A', category: 'NETWORK', mountingType: 'WALL_RECESSED', defaultZ: 0.30, powerWatts: 0, icon: Network },
  { name: 'Roseta Fibra Óptica (PTRO)', category: 'NETWORK', mountingType: 'WALL_RECESSED', defaultZ: 0.30, powerWatts: 0, icon: Network },

  // Wi-Fi
  { name: 'Punto de Acceso Wi-Fi 6/7 Techo', category: 'WIFI', mountingType: 'CEILING_SURFACE', defaultZ: 2.50, powerWatts: 18, poePowered: true, icon: Wifi },
  { name: 'Nodo Wi-Fi Mesh Pared', category: 'WIFI', mountingType: 'WALL_SURFACE', defaultZ: 1.20, powerWatts: 12, icon: Wifi },

  // Domótica
  { name: 'Pasarela / Hub Zigbee & Matter', category: 'SMART_HOME', mountingType: 'FURNITURE_INTEGRATED', defaultZ: 0.80, powerWatts: 5, icon: Radio },
  { name: 'Micromódulo Relé Oculto', category: 'SMART_HOME', mountingType: 'WALL_RECESSED', defaultZ: 1.00, powerWatts: 2, circuitId: 'C11', icon: Radio },
  { name: 'Sensor Ambiental Temp/Humedad', category: 'SMART_HOME', mountingType: 'WALL_SURFACE', defaultZ: 1.50, powerWatts: 0, icon: Radio },

  // Seguridad
  { name: 'Cámara IP Domo Interior', category: 'SECURITY', mountingType: 'CEILING_SURFACE', defaultZ: 2.40, powerWatts: 8, poePowered: true, icon: ShieldAlert },
  { name: 'Sensor Volumétrico Movimiento PIR', category: 'SECURITY', mountingType: 'WALL_SURFACE', defaultZ: 2.20, powerWatts: 3, icon: ShieldAlert },
  { name: 'Detector Apertura Puerta/Ventana', category: 'SECURITY', mountingType: 'WALL_SURFACE', defaultZ: 2.00, powerWatts: 0, icon: ShieldAlert },

  // Climatización
  { name: 'Unidad Split Climatización', category: 'HVAC', mountingType: 'WALL_SURFACE', defaultZ: 2.20, powerWatts: 2200, voltage: 230, circuitId: 'C9', icon: Wind },
  { name: 'Termostato Inteligente Modulante', category: 'HVAC', mountingType: 'WALL_RECESSED', defaultZ: 1.50, powerWatts: 5, icon: Wind },
  { name: 'Rejilla Impulsión Clima', category: 'HVAC', mountingType: 'WALL_RECESSED', defaultZ: 2.30, icon: Wind },

  // Fontanería
  { name: 'Toma Agua Fría + Caliente Lavabo', category: 'PLUMBING', mountingType: 'WALL_RECESSED', defaultZ: 0.55, icon: Droplets },
  { name: 'Toma AFS + Desagüe Lavadora', category: 'PLUMBING', mountingType: 'WALL_RECESSED', defaultZ: 0.50, icon: Droplets },
  { name: 'Bote Sifónico Baño', category: 'PLUMBING', mountingType: 'FLOOR_RECESSED', defaultZ: 0.00, icon: Droplets },

  // Multimedia
  { name: 'Toma Antena TV/FM/SAT + Red', category: 'MULTIMEDIA', mountingType: 'WALL_RECESSED', defaultZ: 1.20, icon: Tv },
  { name: 'Altavoz Empotrado Multiroom', category: 'MULTIMEDIA', mountingType: 'CEILING_RECESSED', defaultZ: 2.50, powerWatts: 30, icon: Tv }
];

interface TechnicalElementPaletteProps {
  onSelectTemplate: (template: ElementTemplate) => void;
}

export const TechnicalElementPalette: React.FC<TechnicalElementPaletteProps> = ({
  onSelectTemplate
}) => {
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filtered = TECHNICAL_TEMPLATES.filter((tpl) => {
    const matchesCat = filterCategory === 'ALL' || tpl.category === filterCategory;
    const matchesQuery = tpl.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesQuery;
  });

  return (
    <div className="bg-slate-900/90 backdrop-blur-md rounded-xl border border-slate-800 p-4 shadow-xl flex flex-col h-full max-h-[600px]">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
          <Plus className="w-4 h-4 text-emerald-400" />
          Mecanismos y Equipos
        </h3>
      </div>

      <div className="relative mb-3">
        <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-500" />
        <input
          type="text"
          placeholder="Buscar elemento..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
        />
      </div>

      <div className="flex gap-1 overflow-x-auto pb-2 mb-2 scrollbar-thin">
        {['ALL', 'ELECTRICAL', 'LIGHTING', 'NETWORK', 'WIFI', 'SMART_HOME', 'SECURITY', 'HVAC', 'PLUMBING', 'MULTIMEDIA'].map((cat) => (
          <button
            key={cat}
            onClick={() => setFilterCategory(cat)}
            className={`px-2 py-1 rounded text-[10px] font-semibold whitespace-nowrap transition-colors ${
              filterCategory === cat
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            {cat === 'ALL' ? 'Todos' : cat}
          </button>
        ))}
      </div>

      <div className="overflow-y-auto space-y-1.5 flex-1 pr-1 scrollbar-thin">
        {filtered.map((tpl, i) => {
          const Icon = tpl.icon;
          return (
            <button
              key={i}
              onClick={() => onSelectTemplate(tpl)}
              className="w-full flex items-center justify-between p-2 rounded-lg bg-slate-800/40 hover:bg-emerald-500/10 border border-slate-800 hover:border-emerald-500/30 transition-all text-left group"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="p-1.5 rounded-md bg-slate-800 group-hover:bg-emerald-500/20 text-slate-300 group-hover:text-emerald-400 transition-colors">
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-slate-200 group-hover:text-emerald-300 truncate">
                    {tpl.name}
                  </p>
                  <p className="text-[10px] text-slate-500 flex items-center gap-1.5">
                    <span>Z={tpl.defaultZ.toFixed(2)}m</span>
                    {tpl.powerWatts ? <span>• {tpl.powerWatts}W</span> : null}
                    {tpl.circuitId ? <span>• {tpl.circuitId}</span> : null}
                  </p>
                </div>
              </div>
              <Plus className="w-3.5 h-3.5 text-slate-600 group-hover:text-emerald-400 transition-colors shrink-0" />
            </button>
          );
        })}
      </div>
    </div>
  );
};
