/**
 * HBD — HOME BOARD DESIGNER
 * Technical Element Properties Panel (Phase V21 / 1.21.0)
 * Autor: Adrián Palma
 * Copyright: © 2026 Adrián Palma. Todos los derechos reservados.
 */

import React, { useState } from 'react';
import {
  Zap,
  Sliders,
  CheckCircle2,
  Trash2,
  RefreshCw,
  DollarSign,
  ShoppingCart,
  Hammer,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import { TechnicalElementDto, TechnicalMountingType, TechnicalStatus, TechnicalCategory } from '@hbd/shared';

interface TechnicalPropertiesPanelProps {
  element: TechnicalElementDto;
  onUpdate: (id: string, updates: Partial<TechnicalElementDto>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onSync: (id: string) => Promise<void>;
}

export const TechnicalPropertiesPanel: React.FC<TechnicalPropertiesPanelProps> = ({
  element,
  onUpdate,
  onDelete,
  onSync
}) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await onSync(element.id);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleChange = async (field: keyof TechnicalElementDto, value: any) => {
    setIsSaving(true);
    try {
      await onUpdate(element.id, { [field]: value });
    } finally {
      setIsSaving(false);
    }
  };

  const handlePositionChange = async (axis: 'x' | 'y' | 'z', val: number) => {
    const newPos = { ...element.position, [axis]: val };
    setIsSaving(true);
    try {
      await onUpdate(element.id, { position: newPos });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-slate-900/95 backdrop-blur-md rounded-xl border border-slate-800 p-4 shadow-xl flex flex-col h-full overflow-y-auto scrollbar-thin">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100">{element.code}</h3>
            <p className="text-[11px] text-slate-400">{element.category}</p>
          </div>
        </div>
        <button
          onClick={() => onDelete(element.id)}
          className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
          title="Eliminar elemento"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Form fields */}
      <div className="space-y-3 text-xs">
        {/* Nombre */}
        <div>
          <label className="block text-slate-400 mb-1 font-medium">Nombre / Descripción</label>
          <input
            type="text"
            value={element.name}
            onChange={(e) => handleChange('name', e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Categoría & Montaje */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-slate-400 mb-1 font-medium">Categoría</label>
            <select
              value={element.category}
              onChange={(e) => handleChange('category', e.target.value as TechnicalCategory)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              <option value="ELECTRICAL">Electricidad</option>
              <option value="LIGHTING">Iluminación</option>
              <option value="NETWORK">Red de Datos</option>
              <option value="WIFI">Wi-Fi</option>
              <option value="SMART_HOME">Domótica</option>
              <option value="SECURITY">Seguridad</option>
              <option value="HVAC">Climatización</option>
              <option value="PLUMBING">Fontanería</option>
              <option value="MULTIMEDIA">Multimedia</option>
              <option value="TECHNICAL_ROOM">Zona Técnica</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-medium">Tipo de Montaje</label>
            <select
              value={element.mountingType}
              onChange={(e) => handleChange('mountingType', e.target.value as TechnicalMountingType)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              <option value="WALL_RECESSED">Pared Empotrado</option>
              <option value="WALL_SURFACE">Pared Superficie</option>
              <option value="CEILING_RECESSED">Techo Empotrado</option>
              <option value="CEILING_SURFACE">Techo Superficie</option>
              <option value="FLOOR_RECESSED">Suelo Empotrado</option>
              <option value="FURNITURE_INTEGRATED">Integrado Mueble</option>
              <option value="OUTDOOR">Exterior / Intemperie</option>
            </select>
          </div>
        </div>

        {/* Cotas de Posición 3D */}
        <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
          <label className="block text-slate-400 mb-1.5 font-medium flex items-center justify-between">
            <span>Coordenadas y Cota de Montaje</span>
            <span className="text-[10px] text-emerald-400">Métrico (m)</span>
          </label>
          <div className="grid grid-cols-3 gap-1.5">
            <div>
              <span className="text-[10px] text-slate-500 block">X</span>
              <input
                type="number"
                step="0.05"
                value={element.position.x}
                onChange={(e) => handlePositionChange('x', parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-slate-200 text-center font-mono text-xs"
              />
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block">Y</span>
              <input
                type="number"
                step="0.05"
                value={element.position.y}
                onChange={(e) => handlePositionChange('y', parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-slate-200 text-center font-mono text-xs"
              />
            </div>
            <div>
              <span className="text-[10px] text-emerald-400 block font-semibold">Cota Z (Altura)</span>
              <input
                type="number"
                step="0.05"
                value={element.position.z}
                onChange={(e) => handlePositionChange('z', parseFloat(e.target.value) || 0)}
                className="w-full bg-emerald-500/10 border border-emerald-500/40 rounded px-2 py-1 text-emerald-300 text-center font-mono text-xs font-bold"
              />
            </div>
          </div>
        </div>

        {/* Parámetros Eléctricos y Técnicos */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-slate-400 mb-1 font-medium">Circuito</label>
            <input
              type="text"
              placeholder="ej. C1, C2, C9"
              value={element.circuitId || ''}
              onChange={(e) => handleChange('circuitId', e.target.value || null)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-slate-200"
            />
          </div>
          <div>
            <label className="block text-slate-400 mb-1 font-medium">Potencia (W)</label>
            <input
              type="number"
              placeholder="ej. 250"
              value={element.powerWatts ?? ''}
              onChange={(e) => handleChange('powerWatts', parseFloat(e.target.value) || null)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-slate-200 font-mono"
            />
          </div>
        </div>

        {/* Grado IP & Protocolo */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-slate-400 mb-1 font-medium">Protección IP</label>
            <input
              type="text"
              placeholder="ej. IP20, IP44, IP65"
              value={element.ipRating || ''}
              onChange={(e) => handleChange('ipRating', e.target.value || null)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-slate-200"
            />
          </div>
          <div>
            <label className="block text-slate-400 mb-1 font-medium">Protocolo</label>
            <select
              value={element.protocol || 'HARDWIRED'}
              onChange={(e) => handleChange('protocol', e.target.value as any)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-slate-200"
            >
              <option value="HARDWIRED">Cableado (Hardwired)</option>
              <option value="ZIGBEE">Zigbee 3.0</option>
              <option value="MATTER">Matter</option>
              <option value="THREAD">Thread</option>
              <option value="KNX">KNX Bus</option>
              <option value="WIFI">Wi-Fi</option>
              <option value="ZWAVE">Z-Wave</option>
              <option value="DALI">DALI (Luz)</option>
            </select>
          </div>
        </div>

        {/* Integraciones Transversales V17, V18, V15 */}
        <div className="pt-2 border-t border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
              Conexión Transversal
            </span>
            <button
              onClick={handleSync}
              disabled={isSyncing}
              className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 flex items-center gap-1 transition-colors"
            >
              <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
              Sincronizar V17/18/15
            </button>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between p-1.5 rounded bg-slate-950 border border-slate-800">
              <span className="flex items-center gap-1.5 text-slate-400">
                <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                V17 Finanzas (CostItem)
              </span>
              <span className={`text-[10px] font-bold ${element.costItemId ? 'text-emerald-400' : 'text-slate-600'}`}>
                {element.costItemId ? 'VINCULADO' : 'PENDIENTE'}
              </span>
            </div>

            <div className="flex items-center justify-between p-1.5 rounded bg-slate-950 border border-slate-800">
              <span className="flex items-center gap-1.5 text-slate-400">
                <ShoppingCart className="w-3.5 h-3.5 text-blue-400" />
                V18 Compras (Procurement)
              </span>
              <span className={`text-[10px] font-bold ${element.procurementItemId ? 'text-blue-400' : 'text-slate-600'}`}>
                {element.procurementItemId ? 'VINCULADO' : 'PENDIENTE'}
              </span>
            </div>

            <div className="flex items-center justify-between p-1.5 rounded bg-slate-950 border border-slate-800">
              <span className="flex items-center gap-1.5 text-slate-400">
                <Hammer className="w-3.5 h-3.5 text-amber-400" />
                V15 Obra (ExecutionTask)
              </span>
              <span className={`text-[10px] font-bold ${element.executionTaskId ? 'text-amber-400' : 'text-slate-600'}`}>
                {element.executionTaskId ? 'VINCULADO' : 'PENDIENTE'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
