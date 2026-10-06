/**
 * HBD — HOME BOARD DESIGNER (V17.0.0)
 * Financial Rooms Tab Component — Room-by-Room Cost Breakdown & Spatial Metrics
 * Autor: Adrián Palma
 * Copyright: © 2026 Adrián Palma. Todos los derechos reservados.
 */

import React from 'react';
import { FinancialSummaryDto, RoomCostBreakdownDto } from '@hbd/shared';
import { DoorOpen, Layers, Maximize2, CreditCard } from 'lucide-react';

interface FinancialRoomsTabProps {
  summary: FinancialSummaryDto;
}

export const FinancialRoomsTab: React.FC<FinancialRoomsTabProps> = ({ summary }) => {
  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(
      val || 0
    );

  const rooms = summary.roomBreakdown || [];

  if (rooms.length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center">
        <DoorOpen className="w-12 h-12 text-slate-600 mx-auto mb-3" />
        <h3 className="text-base font-bold text-white">No hay estancias con costes asignados</h3>
        <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
          Crea o sincroniza partidas de coste asignando la estancia correspondiente para visualizar el desglose
          económico por habitación.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {rooms.map((room: RoomCostBreakdownDto, idx) => {
          const progress = room.totalEffective > 0 ? (room.totalPaid / room.totalEffective) * 100 : 0;

          return (
            <div
              key={room.spaceId || room.roomName || idx}
              className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm hover:border-slate-700 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-base font-bold text-white flex items-center space-x-2">
                    <DoorOpen className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="truncate">{room.roomName}</span>
                  </h4>
                  <div className="flex items-center space-x-2 text-xs text-slate-400 mt-1">
                    {room.floor !== null && room.floor !== undefined && (
                      <span className="flex items-center space-x-1">
                        <Layers className="w-3 h-3 text-slate-500" />
                        <span>Planta {room.floor}</span>
                      </span>
                    )}
                    {room.areaSquareMeters > 0 && (
                      <span className="flex items-center space-x-1">
                        <Maximize2 className="w-3 h-3 text-slate-500" />
                        <span>{room.areaSquareMeters.toFixed(1)} m²</span>
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-lg font-black text-white">
                    {formatCurrency(room.totalEffective)}
                  </div>
                  {room.costPerSquareMeter > 0 && (
                    <div className="text-[11px] font-semibold text-emerald-400">
                      {formatCurrency(room.costPerSquareMeter)} / m²
                    </div>
                  )}
                </div>
              </div>

              {/* Progress & Paid Stats */}
              <div className="mt-4 bg-slate-950/60 p-3 rounded-lg border border-slate-800/50 text-xs">
                <div className="flex justify-between items-center mb-1 text-slate-400">
                  <span>Desembolsado:</span>
                  <span className="font-semibold text-emerald-400">
                    {formatCurrency(room.totalPaid)} ({Math.round(progress)}%)
                  </span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all"
                    style={{ width: `${Math.min(100, progress)}%` }}
                  />
                </div>
                <div className="flex justify-between items-center mt-2 text-slate-400">
                  <span>Pendiente de pago:</span>
                  <span className="font-semibold text-amber-400">
                    {formatCurrency(room.totalPending)}
                  </span>
                </div>
              </div>

              {/* Category tags */}
              {room.categoryBreakdown && Object.keys(room.categoryBreakdown).length > 0 && (
                <div className="mt-3 pt-3 border-t border-slate-800/80 flex flex-wrap gap-1.5">
                  {Object.entries(room.categoryBreakdown).map(([cat, amount]) => {
                    if (!amount || amount <= 0) return null;
                    return (
                      <span
                        key={cat}
                        className="text-[10px] font-medium bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full border border-slate-700/50"
                      >
                        {cat}: {formatCurrency(amount)}
                      </span>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
