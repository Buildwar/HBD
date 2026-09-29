/**
 * HBD — HOME BOARD DESIGNER (V6.0.0)
 * Panel de Propiedades 3D (PropertiesPanel3D)
 * Autor Oficial: Adrián Palma
 * Copyright: © 2026 Adrián Palma — HBD (Home Board Designer)
 */

import React from 'react';
import {
  X,
  Sparkles,
  RotateCw,
  Copy,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Maximize2,
  Palette,
  DoorClosed,
  DoorOpen,
  Eye,
} from 'lucide-react';
import {
  Furniture3D,
  Floor3D,
  Wall3D,
  Door3D,
  Window3D,
  DEFAULT_MATERIALS,
  SpatialValidationResult,
} from '@hbd/shared';

export type Selected3DEntity =
  | { type: 'furniture'; data: Furniture3D; validation?: SpatialValidationResult }
  | { type: 'room'; data: Floor3D }
  | { type: 'wall'; data: Wall3D }
  | { type: 'door'; data: Door3D }
  | { type: 'window'; data: Window3D }
  | null;

interface PropertiesPanel3DProps {
  selectedEntity: Selected3DEntity;
  onClose: () => void;
  onUpdateFurnitureDimensions?: (placementId: string, w: number, d: number, h: number) => void;
  onRotateFurniture?: (placementId: string, angleDeg: number) => void;
  onDuplicateFurniture?: (placementId: string) => void;
  onDeleteFurniture?: (placementId: string) => void;
  onChangeFurnitureColor?: (placementId: string, color: string) => void;
  onChangeRoomMaterial?: (roomId: string, materialColor: string) => void;
  onToggleDoorOpen?: (doorId: string) => void;
}

export const PropertiesPanel3D: React.FC<PropertiesPanel3DProps> = ({
  selectedEntity,
  onClose,
  onUpdateFurnitureDimensions,
  onRotateFurniture,
  onDuplicateFurniture,
  onDeleteFurniture,
  onChangeFurnitureColor,
  onChangeRoomMaterial,
  onToggleDoorOpen,
}) => {
  if (!selectedEntity) return null;

  return (
    <div className="absolute top-4 right-4 z-20 w-80 max-h-[calc(100vh-2rem)] bg-slate-900/95 backdrop-blur-md border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col pointer-events-auto">
      {/* Cabecera */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-800/40">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
            {selectedEntity.type === 'furniture' && '🛋️ Mobiliario'}
            {selectedEntity.type === 'room' && '🪵 Estancia'}
            {selectedEntity.type === 'wall' && '🧱 Pared 3D'}
            {selectedEntity.type === 'door' && '🚪 Puerta 3D'}
            {selectedEntity.type === 'window' && '🪟 Ventana 3D'}
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Contenido según tipo */}
      <div className="p-4 overflow-y-auto space-y-4 text-xs">
        {/* --- ENTIDAD: MUEBLE --- */}
        {selectedEntity.type === 'furniture' && (
          <>
            <div>
              <h3 className="text-sm font-semibold text-white">{selectedEntity.data.name}</h3>
              <p className="text-slate-400 text-[11px] capitalize">
                Categoría: {selectedEntity.data.categorySlug}
              </p>
            </div>

            {/* Tarjeta "¿CABE AQUÍ?" */}
            {selectedEntity.validation && (
              <div
                className={`p-3 rounded-xl border flex flex-col gap-1.5 ${
                  selectedEntity.validation.status === 'VALID'
                    ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
                    : selectedEntity.validation.status === 'WARNING'
                    ? 'bg-amber-950/40 border-amber-500/30 text-amber-300'
                    : 'bg-rose-950/40 border-rose-500/30 text-rose-300'
                }`}
              >
                <div className="flex items-center gap-2 font-semibold">
                  {selectedEntity.validation.status === 'VALID' && (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>¿CABE AQUÍ? — SÍ (COMPATIBLE)</span>
                    </>
                  )}
                  {selectedEntity.validation.status === 'WARNING' && (
                    <>
                      <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>¿CABE AQUÍ? — REVISAR (PASO REDUCIDO)</span>
                    </>
                  )}
                  {selectedEntity.validation.status === 'INVALID' && (
                    <>
                      <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                      <span>¿CABE AQUÍ? — NO (HAY COLISIÓN)</span>
                    </>
                  )}
                </div>
                <p className="text-[11px] opacity-90 leading-tight">
                  {selectedEntity.validation.messages.join(' · ')}
                </p>
              </div>
            )}

            {/* Dimensiones 3D Reales */}
            <div className="space-y-2 bg-slate-800/50 p-3 rounded-xl border border-slate-700/50">
              <span className="font-semibold text-slate-300">Dimensiones Físicas Reales</span>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-700/40">
                  <span className="text-[10px] text-slate-400 block">Ancho (X)</span>
                  <span className="font-mono text-white text-xs font-semibold">
                    {Math.round(selectedEntity.data.dimensions.widthM * 100)} cm
                  </span>
                </div>
                <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-700/40">
                  <span className="text-[10px] text-slate-400 block">Fondo (Z)</span>
                  <span className="font-mono text-white text-xs font-semibold">
                    {Math.round(selectedEntity.data.dimensions.depthM * 100)} cm
                  </span>
                </div>
                <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-700/40">
                  <span className="text-[10px] text-slate-400 block">Alto (Y)</span>
                  <span className="font-mono text-white text-xs font-semibold">
                    {Math.round(selectedEntity.data.dimensions.heightM * 100)} cm
                  </span>
                </div>
              </div>
            </div>

            {/* Posición 3D */}
            <div className="space-y-2 bg-slate-800/50 p-3 rounded-xl border border-slate-700/50">
              <span className="font-semibold text-slate-300">Posición 3D (Metros)</span>
              <div className="grid grid-cols-3 gap-2 font-mono text-[11px] text-slate-300">
                <div className="bg-slate-900/80 p-1.5 rounded-lg text-center">
                  X: {selectedEntity.data.position.x.toFixed(2)}m
                </div>
                <div className="bg-slate-900/80 p-1.5 rounded-lg text-center">
                  Y: {selectedEntity.data.position.y.toFixed(2)}m
                </div>
                <div className="bg-slate-900/80 p-1.5 rounded-lg text-center">
                  Z: {selectedEntity.data.position.z.toFixed(2)}m
                </div>
              </div>
            </div>

            {/* Rotación Rápida */}
            <div className="space-y-2">
              <span className="font-semibold text-slate-300">Rotación ({selectedEntity.data.rotationYDeg}°)</span>
              <div className="grid grid-cols-4 gap-1.5">
                {[0, 90, 180, 270].map((deg) => (
                  <button
                    key={deg}
                    onClick={() =>
                      onRotateFurniture && onRotateFurniture(selectedEntity.data.placementId, deg)
                    }
                    className={`py-1.5 rounded-lg font-mono text-xs border transition-colors ${
                      selectedEntity.data.rotationYDeg === deg
                        ? 'bg-emerald-600 border-emerald-500 text-white font-semibold'
                        : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white'
                    }`}
                  >
                    {deg}°
                  </button>
                ))}
              </div>
            </div>

            {/* Materiales y Acabados de Mueble */}
            <div className="space-y-2">
              <span className="font-semibold text-slate-300">Acabado / Material</span>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { name: 'Roble', color: '#b48a60' },
                  { name: 'Nogal', color: '#5c4033' },
                  { name: 'Gris Marengo', color: '#475569' },
                  { name: 'Crema', color: '#fef3c7' },
                  { name: 'Cuero Negro', color: '#1e293b' },
                  { name: 'Metal Grafito', color: '#0f172a' },
                ].map((mat) => (
                  <button
                    key={mat.name}
                    onClick={() =>
                      onChangeFurnitureColor &&
                      onChangeFurnitureColor(selectedEntity.data.placementId, mat.color)
                    }
                    className="flex items-center gap-1.5 p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700/60 text-slate-300 transition-colors text-[11px]"
                  >
                    <span
                      className="w-3 h-3 rounded-full border border-slate-600 shrink-0"
                      style={{ backgroundColor: mat.color }}
                    />
                    <span className="truncate">{mat.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Acciones */}
            <div className="pt-2 border-t border-slate-800 flex gap-2">
              <button
                onClick={() =>
                  onDuplicateFurniture && onDuplicateFurniture(selectedEntity.data.placementId)
                }
                className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-medium flex items-center justify-center gap-1.5 transition-colors"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Duplicar</span>
              </button>

              <button
                onClick={() =>
                  onDeleteFurniture && onDeleteFurniture(selectedEntity.data.placementId)
                }
                className="py-2 px-3 rounded-xl bg-rose-950/60 hover:bg-rose-900 border border-rose-800/40 text-rose-300 hover:text-white font-medium flex items-center justify-center transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </>
        )}

        {/* --- ENTIDAD: HABITACIÓN / ESTANCIA --- */}
        {selectedEntity.type === 'room' && (
          <>
            <div>
              <h3 className="text-sm font-semibold text-white">{selectedEntity.data.name}</h3>
              <p className="text-slate-400 text-[11px] capitalize">
                Tipo: {selectedEntity.data.roomType || 'Estancia general'}
              </p>
            </div>

            <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/50 space-y-1">
              <div className="flex justify-between text-slate-300">
                <span>Superficie Útil:</span>
                <span className="font-semibold text-white">{selectedEntity.data.areaM2.toFixed(2)} m²</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Altura de Techo:</span>
                <span className="font-semibold text-white">{selectedEntity.data.heightM.toFixed(2)} m</span>
              </div>
            </div>

            {/* Selector de Material de Suelo */}
            <div className="space-y-2">
              <span className="font-semibold text-slate-300">Material de Suelo</span>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'oak', name: 'Madera Roble', color: '#b48a60' },
                  { id: 'walnut', name: 'Nogal Oscuro', color: '#5c4033' },
                  { id: 'tile', name: 'Baldosa Clara', color: '#e5e7eb' },
                  { id: 'marble', name: 'Mármol Blanco', color: '#f3f4f6' },
                  { id: 'concrete', name: 'Cemento Pulido', color: '#9ca3af' },
                  { id: 'carpet', name: 'Moqueta Gris', color: '#cbd5e1' },
                ].map((mat) => (
                  <button
                    key={mat.id}
                    onClick={() =>
                      onChangeRoomMaterial && onChangeRoomMaterial(selectedEntity.data.id, mat.color)
                    }
                    className="flex items-center gap-2 p-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-left transition-colors"
                  >
                    <span
                      className="w-4 h-4 rounded-lg border border-slate-600 shrink-0"
                      style={{ backgroundColor: mat.color }}
                    />
                    <span className="font-medium truncate">{mat.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {/* --- ENTIDAD: PARED 3D --- */}
        {selectedEntity.type === 'wall' && (
          <>
            <div>
              <h3 className="text-sm font-semibold text-white">Pared 3D</h3>
              <p className="text-slate-400 text-[11px]">
                Tipo: {selectedEntity.data.wallType === 'EXTERIOR' ? 'Muro Exterior' : 'Tabique Interior'}
              </p>
            </div>

            <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/50 space-y-1.5">
              <div className="flex justify-between text-slate-300">
                <span>Longitud:</span>
                <span className="font-mono font-semibold text-white">
                  {selectedEntity.data.lengthM.toFixed(2)} m
                </span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Grosor:</span>
                <span className="font-mono font-semibold text-white">
                  {Math.round(selectedEntity.data.thicknessM * 100)} cm
                </span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Altura:</span>
                <span className="font-mono font-semibold text-white">
                  {selectedEntity.data.heightM.toFixed(2)} m
                </span>
              </div>
            </div>
          </>
        )}

        {/* --- ENTIDAD: PUERTA 3D --- */}
        {selectedEntity.type === 'door' && (
          <>
            <div>
              <h3 className="text-sm font-semibold text-white">Puerta 3D</h3>
              <p className="text-slate-400 text-[11px]">Vano de paso arquitectónico</p>
            </div>

            <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/50 space-y-1.5">
              <div className="flex justify-between text-slate-300">
                <span>Ancho de Hoja:</span>
                <span className="font-mono font-semibold text-white">
                  {Math.round(selectedEntity.data.widthM * 100)} cm
                </span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Altura:</span>
                <span className="font-mono font-semibold text-white">
                  {Math.round(selectedEntity.data.heightM * 100)} cm
                </span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Estado de Apertura:</span>
                <span
                  className={`font-semibold ${
                    selectedEntity.data.isOpen ? 'text-emerald-400' : 'text-slate-400'
                  }`}
                >
                  {selectedEntity.data.isOpen ? 'Abierta (85°)' : 'Cerrada'}
                </span>
              </div>
            </div>

            <button
              onClick={() => onToggleDoorOpen && onToggleDoorOpen(selectedEntity.data.id)}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium flex items-center justify-center gap-2 transition-colors shadow-lg"
            >
              {selectedEntity.data.isOpen ? (
                <>
                  <DoorClosed className="w-4 h-4" />
                  <span>Cerrar Puerta</span>
                </>
              ) : (
                <>
                  <DoorOpen className="w-4 h-4" />
                  <span>Abrir Puerta</span>
                </>
              )}
            </button>
          </>
        )}

        {/* --- ENTIDAD: VENTANA 3D --- */}
        {selectedEntity.type === 'window' && (
          <>
            <div>
              <h3 className="text-sm font-semibold text-white">Ventana 3D</h3>
              <p className="text-slate-400 text-[11px]">Entrada de luz natural</p>
            </div>

            <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/50 space-y-1.5">
              <div className="flex justify-between text-slate-300">
                <span>Ancho:</span>
                <span className="font-mono font-semibold text-white">
                  {Math.round(selectedEntity.data.widthM * 100)} cm
                </span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Alto:</span>
                <span className="font-mono font-semibold text-white">
                  {Math.round(selectedEntity.data.heightM * 100)} cm
                </span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Antepecho (Sill):</span>
                <span className="font-mono font-semibold text-white">
                  {Math.round(selectedEntity.data.elevationM * 100)} cm
                </span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
