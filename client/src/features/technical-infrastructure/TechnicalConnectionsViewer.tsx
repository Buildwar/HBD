/**
 * HBD — HOME BOARD DESIGNER
 * Technical Connections & Conduit Viewer (Phase V21 / 1.21.0)
 * Autor: Adrián Palma
 * Copyright: © 2026 Adrián Palma. Todos los derechos reservados.
 */

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  TechnicalConnectionDto,
  TechnicalConnectionType,
  CreateTechnicalConnectionInput
} from '@hbd/shared';
import {
  Cable,
  Plus,
  Trash2,
  Layers,
  ArrowRight,
  Route
} from 'lucide-react';

interface TechnicalConnectionsViewerProps {
  connections: TechnicalConnectionDto[];
  onCreateConnection: (input: CreateTechnicalConnectionInput) => Promise<void>;
  onDeleteConnection: (id: string) => Promise<void>;
}

export const TechnicalConnectionsViewer: React.FC<TechnicalConnectionsViewerProps> = ({
  connections,
  onCreateConnection,
  onDeleteConnection
}) => {
  const { t } = useTranslation();
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState<Partial<CreateTechnicalConnectionInput>>({
    name: '',
    connectionType: 'ELECTRICAL_CIRCUIT',
    lengthMeters: 5.0,
    wireGaugeMm2: 2.5,
    conduitDiameterMm: 20,
    channelingType: 'RECESSED_WALL'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;
    await onCreateConnection({
      projectId: '',
      name: formData.name,
      connectionType: formData.connectionType as TechnicalConnectionType,
      lengthMeters: formData.lengthMeters || 5.0,
      wireGaugeMm2: formData.wireGaugeMm2,
      conduitDiameterMm: formData.conduitDiameterMm,
      channelingType: formData.channelingType as any,
      pathPoints: []
    } as any);
    setShowAddForm(false);
    setFormData({
      name: '',
      connectionType: 'ELECTRICAL_CIRCUIT',
      lengthMeters: 5.0,
      wireGaugeMm2: 2.5,
      conduitDiameterMm: 20,
      channelingType: 'RECESSED_WALL'
    });
  };

  const totalLength = connections.reduce((sum, c) => sum + (c.lengthMeters || 0), 0);

  return (
    <div className="bg-slate-900/90 backdrop-blur-md rounded-xl border border-slate-800 p-4 shadow-xl flex flex-col h-full">
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400">
            <Route className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100">{t('techInfra.connections.title')}</h3>
            <p className="text-[11px] text-slate-400">{t('techInfra.connections.totalRouted')} {totalLength.toFixed(1)} {t('techInfra.connections.meters')}</p>
          </div>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="text-xs px-2.5 py-1 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 font-medium transition-colors flex items-center gap-1"
        >
          <Plus className="w-3.5 h-3.5" />
          {t('techInfra.connections.newLine')}
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleSubmit} className="p-3 mb-3 bg-slate-950/80 rounded-xl border border-indigo-500/30 text-xs space-y-2.5 animate-in fade-in">
          <div>
            <label className="block text-slate-400 mb-1">Nombre / Identificación</label>
            <input
              type="text"
              placeholder="ej. Alimentación Cuadro a Cocina"
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-slate-200"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-slate-400 mb-1">Tipo de Conexión</label>
              <select
                value={formData.connectionType}
                onChange={(e) => setFormData({ ...formData, connectionType: e.target.value as any })}
                className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-slate-200"
              >
                <option value="ELECTRICAL_CIRCUIT">Circuito Eléctrico</option>
                <option value="LIGHTING_SWITCH_LEG">Retorno Alumbrado</option>
                <option value="ETHERNET_CABLE">Cable Ethernet UTP</option>
                <option value="FIBER_OPTIC">Fibra Óptica</option>
                <option value="BUS_CABLE">Bus Domótico KNX</option>
                <option value="WATER_SUPPLY_COLD">Agua Fría AFS</option>
                <option value="WATER_SUPPLY_HOT">Agua Caliente ACS</option>
                <option value="SANITARY_DRAIN">Desagüe / Saneamiento</option>
                <option value="HVAC_REFRIGERANT">Línea Frigorífica</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Longitud Estimada (m)</label>
              <input
                type="number"
                step="0.5"
                value={formData.lengthMeters || 5.0}
                onChange={(e) => setFormData({ ...formData, lengthMeters: parseFloat(e.target.value) || 0 })}
                className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-slate-200 font-mono"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-3 py-1 rounded bg-slate-800 text-slate-400 hover:text-slate-200"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-3 py-1 rounded bg-indigo-500 hover:bg-indigo-600 text-white font-semibold"
            >
              Crear Línea
            </button>
          </div>
        </form>
      )}

      {/* List */}
      <div className="space-y-1.5 overflow-y-auto flex-1 pr-1 scrollbar-thin">
        {connections.length === 0 ? (
          <div className="py-8 text-center text-slate-500 text-xs">
            No hay conexiones registradas aún.
          </div>
        ) : (
          connections.map((conn) => (
            <div
              key={conn.id}
              className="p-2.5 rounded-lg bg-slate-800/40 hover:bg-slate-800/70 border border-slate-800 flex items-center justify-between text-xs transition-colors"
            >
              <div className="flex items-center gap-2 min-w-0">
                <Cable className="w-4 h-4 text-indigo-400 shrink-0" />
                <div className="min-w-0">
                  <p className="font-semibold text-slate-200 truncate">{conn.name}</p>
                  <p className="text-[10px] text-slate-400 flex items-center gap-1.5 font-mono">
                    <span className="text-indigo-300 font-bold">{conn.code}</span>
                    <span>• {conn.connectionType}</span>
                    <span className="text-slate-500">• {conn.lengthMeters}m</span>
                    {conn.conduitDiameterMm ? <span>• Ø{conn.conduitDiameterMm}mm</span> : null}
                  </p>
                </div>
              </div>
              <button
                onClick={() => onDeleteConnection(conn.id)}
                className="p-1 rounded text-slate-500 hover:text-red-400 hover:bg-slate-800 transition-colors shrink-0"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
