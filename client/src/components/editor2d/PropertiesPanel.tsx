import React, { useState } from 'react';
import {
  Trash2,
  Edit3,
  Settings,
  ShieldAlert,
  Sparkles,
  Copy,
  RotateCw,
  Lock,
  Unlock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  ArrowRight,
  Maximize2,
} from 'lucide-react';
import { Button } from '../ui/Button.js';
import { Input } from '../ui/Input.js';
import { Badge } from '../ui/Badge.js';
import {
  SpatialValidationStatus,
  SpatialValidationResult,
  FurnitureEngine,
  DimensionUnit,
} from '@hbd/shared';

export type ElementType = 'wall' | 'room' | 'door' | 'window' | 'furniture' | 'measurement';

interface PropertiesPanelProps {
  selectedElement: {
    type: ElementType;
    data: any;
  } | null;
  onUpdateElement: (type: ElementType, id: string, updatedFields: any) => void;
  onDeleteElement: (type: ElementType, id: string) => void;
  onDuplicateElement?: (type: ElementType, id: string) => void;
  onDeselect: () => void;
  validationResult?: SpatialValidationResult | null;
}

export const PropertiesPanel: React.FC<PropertiesPanelProps> = ({
  selectedElement,
  onUpdateElement,
  onDeleteElement,
  onDuplicateElement,
  onDeselect,
  validationResult,
}) => {
  const [unit, setUnit] = useState<DimensionUnit>('cm');
  const [lockProportions, setLockProportions] = useState<boolean>(false);

  if (!selectedElement || !selectedElement.type || !selectedElement.data) {
    return (
      <div className="w-72 rounded-2xl bg-dark-surface/95 backdrop-blur-md border border-dark-border shadow-xl p-4 text-center">
        <div className="py-8 space-y-2">
          <Settings size={22} className="text-gray-500 mx-auto" />
          <p className="text-xs font-semibold text-gray-400">Ningún elemento seleccionado</p>
          <p className="text-[10px] text-gray-500">
            Haz clic en un mueble, pared, habitación, puerta o ventana en el plano para ver y editar sus propiedades.
          </p>
        </div>
      </div>
    );
  }

  const { type, data } = selectedElement;

  return (
    <div className="w-72 rounded-2xl bg-dark-surface/95 backdrop-blur-md border border-dark-border shadow-xl p-4 space-y-4 max-h-[calc(100vh-140px)] overflow-y-auto">
      <div className="flex items-center justify-between border-b border-dark-border pb-2.5">
        <div className="flex items-center gap-2">
          <Edit3 size={15} className="text-brand-400" />
          <span className="text-xs font-bold text-gray-200 capitalize">
            {type === 'furniture'
              ? 'Mobiliario'
              : type === 'wall'
              ? 'Pared / Muro'
              : type === 'room'
              ? 'Habitación'
              : type === 'door'
              ? 'Puerta'
              : type === 'window'
              ? 'Ventana'
              : 'Cota'}
          </span>
        </div>
        <button
          onClick={onDeselect}
          className="text-xs text-gray-500 hover:text-gray-300 font-semibold"
        >
          Cerrar
        </button>
      </div>

      {/* Furniture Properties & Spatial Validation */}
      {type === 'furniture' && (
        <div className="space-y-3.5">
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-white">{data.furniture?.name || data.name || 'Mueble'}</h4>
            <span className="text-[10px] text-gray-400 block">{data.furniture?.category?.name || 'Mobiliario'}</span>
          </div>

          {/* Validation Status Card ("¿CABE AQUÍ?") */}
          {validationResult && (
            <div
              className={`p-3 rounded-xl border text-xs space-y-1.5 transition-all ${
                validationResult.status === SpatialValidationStatus.VALID
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : validationResult.status === SpatialValidationStatus.WARNING
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
              }`}
            >
              <div className="flex items-center gap-2 font-bold">
                {validationResult.status === SpatialValidationStatus.VALID && <CheckCircle2 size={16} />}
                {validationResult.status === SpatialValidationStatus.WARNING && <AlertTriangle size={16} />}
                {validationResult.status === SpatialValidationStatus.INVALID && <XCircle size={16} />}
                <span>
                  {validationResult.status === SpatialValidationStatus.VALID
                    ? '✓ CABE AQUÍ'
                    : validationResult.status === SpatialValidationStatus.WARNING
                    ? '⚠ REVISAR ESPACIO'
                    : '✕ NO CABE (COLISIÓN)'}
                </span>
              </div>

              {validationResult.messages.map((msg, idx) => (
                <p key={idx} className="text-[11px] leading-tight opacity-90">
                  {msg}
                </p>
              ))}

              {/* Active Collisions */}
              {validationResult.collisions.length > 0 && (
                <div className="pt-1.5 border-t border-rose-500/20 space-y-1">
                  {validationResult.collisions.map((c, idx) => (
                    <div key={idx} className="text-[10px] text-rose-300 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                      <span>{c.message}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Metric Dimensions with unit selector */}
          <div className="space-y-2 p-3 rounded-xl bg-dark-card/60 border border-dark-border">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-gray-300">Dimensiones Físicas</span>
              <button
                type="button"
                onClick={() => setLockProportions(!lockProportions)}
                className={`flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-lg border transition-all ${
                  lockProportions
                    ? 'bg-brand-500/20 text-brand-400 border-brand-500/40'
                    : 'text-gray-400 border-dark-border'
                }`}
                title="Bloquear proporciones al escalar"
              >
                {lockProportions ? <Lock size={10} /> : <Unlock size={10} />}
                <span>{lockProportions ? 'Bloqueado' : 'Libre'}</span>
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-[9px] text-gray-400 block mb-0.5">Ancho (cm)</label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={Math.round((data.widthM || 1) * 100)}
                  onChange={(e) => {
                    const newW = (parseFloat(e.target.value) || 10) / 100;
                    if (lockProportions && data.widthM > 0) {
                      const ratio = newW / data.widthM;
                      onUpdateElement(type, data.id, {
                        widthM: newW,
                        depthM: Math.round(data.depthM * ratio * 100) / 100,
                      });
                    } else {
                      onUpdateElement(type, data.id, { widthM: newW });
                    }
                  }}
                  className="w-full px-2 py-1 rounded-lg bg-dark-card border border-dark-border text-xs text-white font-mono"
                />
              </div>

              <div>
                <label className="text-[9px] text-gray-400 block mb-0.5">Fondo (cm)</label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={Math.round((data.depthM || 1) * 100)}
                  onChange={(e) => {
                    const newD = (parseFloat(e.target.value) || 10) / 100;
                    onUpdateElement(type, data.id, { depthM: newD });
                  }}
                  className="w-full px-2 py-1 rounded-lg bg-dark-card border border-dark-border text-xs text-white font-mono"
                />
              </div>

              <div>
                <label className="text-[9px] text-gray-400 block mb-0.5">Alto (cm)</label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={Math.round((data.heightM || 1) * 100)}
                  onChange={(e) => {
                    const newH = (parseFloat(e.target.value) || 10) / 100;
                    onUpdateElement(type, data.id, { heightM: newH });
                  }}
                  className="w-full px-2 py-1 rounded-lg bg-dark-card border border-dark-border text-xs text-white font-mono"
                />
              </div>
            </div>
          </div>

          {/* Rotation Controls */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-semibold text-gray-400">
              <span>Orientación / Rotación</span>
              <span className="font-mono text-brand-400">{Math.round(data.rotationDeg || 0)}°</span>
            </div>
            <div className="grid grid-cols-4 gap-1">
              {[0, 90, 180, 270].map((deg) => (
                <button
                  key={deg}
                  type="button"
                  onClick={() => onUpdateElement(type, data.id, { rotationDeg: deg })}
                  className={`py-1 rounded-lg text-xs font-mono font-semibold transition-all ${
                    (data.rotationDeg || 0) % 360 === deg
                      ? 'bg-brand-500 text-white'
                      : 'bg-dark-card text-gray-400 hover:text-white border border-dark-border'
                  }`}
                >
                  {deg}°
                </button>
              ))}
            </div>
          </div>

          {/* Wall Clearances */}
          {validationResult?.margins && (
            <div className="p-3 rounded-xl bg-dark-card/60 border border-dark-border text-[11px] space-y-1.5">
              <span className="font-bold text-gray-300 block">Distancias a Paredes</span>
              <div className="grid grid-cols-2 gap-2 text-gray-400">
                <div>Izq: <span className="text-white font-bold">{validationResult.margins.leftCm} cm</span></div>
                <div>Dcha: <span className="text-white font-bold">{validationResult.margins.rightCm} cm</span></div>
                <div>Sup: <span className="text-white font-bold">{validationResult.margins.topCm} cm</span></div>
                <div>Inf: <span className="text-white font-bold">{validationResult.margins.bottomCm} cm</span></div>
              </div>
            </div>
          )}

          {/* Duplicate button */}
          {onDuplicateElement && (
            <Button
              variant="secondary"
              size="sm"
              className="w-full"
              icon={<Copy size={14} />}
              onClick={() => onDuplicateElement(type, data.id)}
            >
              Duplicar Mueble
            </Button>
          )}
        </div>
      )}

      {/* Wall Properties */}
      {type === 'wall' && (
        <div className="space-y-3">
          <div>
            <label className="text-[11px] font-semibold text-gray-400 block mb-1">Tipo de Pared</label>
            <select
              value={data.wallType || 'INTERIOR'}
              onChange={(e) => onUpdateElement(type, data.id, { wallType: e.target.value })}
              className="w-full px-2.5 py-1.5 rounded-xl bg-dark-card border border-dark-border text-xs text-white focus:outline-none focus:border-brand-500"
            >
              <option value="EXTERIOR">Muro Exterior (Fachada)</option>
              <option value="INTERIOR">Pared Interior</option>
              <option value="PARTITION">Tabique Ligero</option>
              <option value="LOAD_BEARING">Muro de Carga</option>
            </select>
          </div>

          <Input
            label="Grosor (Metros)"
            type="number"
            step="0.01"
            value={data.thicknessM || 0.15}
            onChange={(e) => onUpdateElement(type, data.id, { thicknessM: parseFloat(e.target.value) || 0.15 })}
          />

          <Input
            label="Altura (Metros)"
            type="number"
            step="0.05"
            value={data.heightM || 2.50}
            onChange={(e) => onUpdateElement(type, data.id, { heightM: parseFloat(e.target.value) || 2.50 })}
          />

          <div className="p-2.5 rounded-xl bg-dark-card/60 border border-dark-border text-xs space-y-1">
            <div className="flex justify-between text-gray-400">
              <span>Longitud estimada:</span>
              <span className="font-bold text-white">{data.lengthM ? `${data.lengthM} m` : 'Calculando'}</span>
            </div>
            {data.confidence && (
              <div className="flex justify-between text-gray-400 text-[10px]">
                <span>Confianza IA:</span>
                <span className="text-brand-400 font-bold">{Math.round(data.confidence * 100)}%</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Room Properties */}
      {type === 'room' && (
        <div className="space-y-3">
          <Input
            label="Nombre de la Estancia"
            value={data.name || ''}
            onChange={(e) => onUpdateElement(type, data.id, { name: e.target.value })}
          />

          <div>
            <label className="text-[11px] font-semibold text-gray-400 block mb-1">Tipo de Habitación</label>
            <select
              value={data.roomType || 'LIVING_ROOM'}
              onChange={(e) => onUpdateElement(type, data.id, { roomType: e.target.value })}
              className="w-full px-2.5 py-1.5 rounded-xl bg-dark-card border border-dark-border text-xs text-white focus:outline-none focus:border-brand-500"
            >
              <option value="LIVING_ROOM">Salón / Comedor</option>
              <option value="KITCHEN">Cocina</option>
              <option value="BEDROOM">Dormitorio</option>
              <option value="BATHROOM">Baño</option>
              <option value="HALLWAY">Pasillo / Distribuidor</option>
              <option value="TERRACE">Terraza / Balcón</option>
              <option value="OFFICE">Despacho / Estudio</option>
              <option value="STORAGE">Trastero / Despensa</option>
            </select>
          </div>

          <div className="p-3 rounded-xl bg-brand-500/10 border border-brand-500/30 text-center">
            <span className="text-[11px] font-semibold text-gray-300">Superficie Útil Calculada</span>
            <p className="text-xl font-bold text-brand-400 mt-0.5">{data.areaM2 || 0} m²</p>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-gray-400 block mb-1">Color de Identificación</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={data.color || '#3b82f6'}
                onChange={(e) => onUpdateElement(type, data.id, { color: e.target.value })}
                className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
              />
              <span className="text-xs font-mono text-gray-300">{data.color || '#3b82f6'}</span>
            </div>
          </div>
        </div>
      )}

      {/* Door Properties */}
      {type === 'door' && (
        <div className="space-y-3">
          <Input
            label="Ancho de Paso (Metros)"
            type="number"
            step="0.05"
            value={data.widthM || 0.80}
            onChange={(e) => onUpdateElement(type, data.id, { widthM: parseFloat(e.target.value) || 0.80 })}
          />

          <div>
            <label className="text-[11px] font-semibold text-gray-400 block mb-1">Sentido de Apertura</label>
            <select
              value={data.swingDirection || 'INWARD_RIGHT'}
              onChange={(e) => onUpdateElement(type, data.id, { swingDirection: e.target.value })}
              className="w-full px-2.5 py-1.5 rounded-xl bg-dark-card border border-dark-border text-xs text-white focus:outline-none focus:border-brand-500"
            >
              <option value="INWARD_RIGHT">Hacia Adentro - Derecha</option>
              <option value="INWARD_LEFT">Hacia Adentro - Izquierda</option>
              <option value="OUTWARD_RIGHT">Hacia Afuera - Derecha</option>
              <option value="OUTWARD_LEFT">Hacia Afuera - Izquierda</option>
              <option value="SLIDING">Corredera</option>
              <option value="NONE">Sin hoja (Vano abierto)</option>
            </select>
          </div>
        </div>
      )}

      {/* Window Properties */}
      {type === 'window' && (
        <div className="space-y-3">
          <Input
            label="Ancho Ventana (Metros)"
            type="number"
            step="0.05"
            value={data.widthM || 1.20}
            onChange={(e) => onUpdateElement(type, data.id, { widthM: parseFloat(e.target.value) || 1.20 })}
          />

          <Input
            label="Altura Ventana (Metros)"
            type="number"
            step="0.05"
            value={data.heightM || 1.20}
            onChange={(e) => onUpdateElement(type, data.id, { heightM: parseFloat(e.target.value) || 1.20 })}
          />

          <Input
            label="Altura de Antepecho (Metros)"
            type="number"
            step="0.05"
            value={data.elevationM || 0.90}
            onChange={(e) => onUpdateElement(type, data.id, { elevationM: parseFloat(e.target.value) || 0.90 })}
          />
        </div>
      )}

      {/* Measurement Properties */}
      {type === 'measurement' && (
        <div className="space-y-3">
          <Input
            label="Etiqueta / Nota"
            placeholder="Ej. Ancho de pasillo"
            value={data.label || ''}
            onChange={(e) => onUpdateElement(type, data.id, { label: e.target.value })}
          />
          <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/30 text-center">
            <span className="text-[11px] font-semibold text-gray-300">Distancia Medida</span>
            <p className="text-xl font-bold text-purple-400 mt-0.5">{data.distanceM || 0} m</p>
          </div>
        </div>
      )}

      {/* Delete button */}
      <div className="pt-2 border-t border-dark-border">
        <Button
          variant="danger"
          size="sm"
          className="w-full"
          icon={<Trash2 size={14} />}
          onClick={() => onDeleteElement(type, data.id)}
        >
          Eliminar Elemento
        </Button>
      </div>
    </div>
  );
};
