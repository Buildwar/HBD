import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
  const [unit, setUnit] = useState<DimensionUnit>('cm');
  const [lockProportions, setLockProportions] = useState<boolean>(false);

  if (!selectedElement || !selectedElement.type || !selectedElement.data) {
    return (
      <div className="w-72 rounded-2xl bg-dark-surface/95 backdrop-blur-md border border-dark-border shadow-xl p-4 text-center">
        <div className="py-8 space-y-2">
          <Settings size={22} className="text-gray-500 mx-auto" />
          <p className="text-xs font-semibold text-gray-400">{t('editor2d.noSelection')}</p>
          <p className="text-[10px] text-gray-500">
            {t('editor2d.selectPrompt')}
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
              ? t('nav.furniture')
              : type === 'wall'
              ? t('editor2d.wallType')
              : type === 'room'
              ? t('editor2d.roomType')
              : type === 'door'
              ? t('editor2d.doorsCount')
              : type === 'window'
              ? t('editor2d.windowsCount')
              : t('common.dimensions')}
          </span>
        </div>
        <button
          onClick={onDeselect}
          className="text-xs text-gray-500 hover:text-gray-300 font-semibold"
        >
          {t('common.close')}
        </button>
      </div>

      {/* Furniture Properties & Spatial Validation */}
      {type === 'furniture' && (
        <div className="space-y-3.5">
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-white leading-tight">{data.name || t('furniture.title')}</h4>
            <div className="flex items-center gap-2 text-[10px] text-gray-400">
              <span className="font-mono uppercase px-1.5 py-0.5 rounded bg-dark-card border border-dark-border">
                {data.category || 'MUEBLE'}
              </span>
              {data.isRealProduct && (
                <span className="text-brand-400 font-semibold flex items-center gap-1">
                  <Sparkles size={10} />
                  {t('products.twin') || 'Twin'}
                </span>
              )}
            </div>
          </div>

          {/* Physical Dimensions */}
          <div className="space-y-2 p-3 rounded-xl bg-dark-card/60 border border-dark-border">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-gray-300">{t('editor2d.physicalDimensions')}</span>
              <button
                type="button"
                onClick={() => setLockProportions(!lockProportions)}
                className={`flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-lg border transition-all ${
                  lockProportions
                    ? 'bg-brand-500/20 text-brand-400 border-brand-500/40'
                    : 'text-gray-400 border-dark-border'
                }`}
                title={t('furniture.lockProportions') || 'Lock'}
              >
                {lockProportions ? <Lock size={10} /> : <Unlock size={10} />}
                <span>{lockProportions ? (t('furniture.locked') || 'Locked') : (t('furniture.free') || 'Free')}</span>
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-[9px] text-gray-400 block mb-0.5">{t('editor2d.widthCm')}</label>
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
                <label className="text-[9px] text-gray-400 block mb-0.5">{t('editor2d.depthCm')}</label>
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
                <label className="text-[9px] text-gray-400 block mb-0.5">{t('editor2d.heightCm')}</label>
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
              <span>{t('editor2d.orientation')}</span>
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
              <span className="font-bold text-gray-300 block">{t('editor2d.wallDistances')}</span>
              <div className="grid grid-cols-2 gap-2 text-gray-400">
                <div>{t('editor2d.left')} <span className="text-white font-bold">{validationResult.margins.leftCm} cm</span></div>
                <div>{t('editor2d.right')} <span className="text-white font-bold">{validationResult.margins.rightCm} cm</span></div>
                <div>{t('editor2d.top')} <span className="text-white font-bold">{validationResult.margins.topCm} cm</span></div>
                <div>{t('editor2d.bottom')} <span className="text-white font-bold">{validationResult.margins.bottomCm} cm</span></div>
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
              {t('common.duplicate')}
            </Button>
          )}
        </div>
      )}

      {/* Wall Properties */}
      {type === 'wall' && (
        <div className="space-y-3">
          <div>
            <label className="text-[11px] font-semibold text-gray-400 block mb-1">{t('editor2d.wallType')}</label>
            <select
              value={data.wallType || 'INTERIOR'}
              onChange={(e) => onUpdateElement(type, data.id, { wallType: e.target.value })}
              className="w-full px-2.5 py-1.5 rounded-xl bg-dark-card border border-dark-border text-xs text-white focus:outline-none focus:border-brand-500"
            >
              <option value="EXTERIOR">{t('editor2d.wallExterior')}</option>
              <option value="INTERIOR">{t('editor2d.wallInterior')}</option>
              <option value="PARTITION">{t('editor2d.wallPartition')}</option>
              <option value="LOAD_BEARING">{t('editor2d.wallLoadBearing')}</option>
            </select>
          </div>

          <Input
            label={`${t('viewer3d.wallThickness')} (m)`}
            type="number"
            step="0.01"
            value={data.thicknessM || 0.15}
            onChange={(e) => onUpdateElement(type, data.id, { thicknessM: parseFloat(e.target.value) || 0.15 })}
          />

          <Input
            label={`${t('viewer3d.wallHeight')} (m)`}
            type="number"
            step="0.05"
            value={data.heightM || 2.50}
            onChange={(e) => onUpdateElement(type, data.id, { heightM: parseFloat(e.target.value) || 2.50 })}
          />

          <div className="p-2.5 rounded-xl bg-dark-card/60 border border-dark-border text-xs space-y-1">
            <div className="flex justify-between text-gray-400">
              <span>{t('editor2d.estimatedLength')}</span>
              <span className="font-bold text-white">{data.lengthM ? `${data.lengthM} m` : t('common.loading')}</span>
            </div>
            {data.confidence && (
              <div className="flex justify-between text-gray-400 text-[10px]">
                <span>{t('editor2d.aiConfidence')}</span>
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
            label={t('common.details') || 'Name'}
            value={data.name || ''}
            onChange={(e) => onUpdateElement(type, data.id, { name: e.target.value })}
          />

          <div>
            <label className="text-[11px] font-semibold text-gray-400 block mb-1">{t('editor2d.roomType')}</label>
            <select
              value={data.roomType || 'LIVING_ROOM'}
              onChange={(e) => onUpdateElement(type, data.id, { roomType: e.target.value })}
              className="w-full px-2.5 py-1.5 rounded-xl bg-dark-card border border-dark-border text-xs text-white focus:outline-none focus:border-brand-500"
            >
              <option value="LIVING_ROOM">{t('editor2d.roomLivingRoom')}</option>
              <option value="KITCHEN">{t('editor2d.roomKitchen')}</option>
              <option value="BEDROOM">{t('editor2d.roomBedroom')}</option>
              <option value="BATHROOM">{t('editor2d.roomBathroom')}</option>
              <option value="HALLWAY">{t('editor2d.roomHallway')}</option>
              <option value="TERRACE">{t('editor2d.roomTerrace')}</option>
              <option value="OFFICE">{t('editor2d.roomOffice')}</option>
              <option value="STORAGE">{t('editor2d.roomStorage')}</option>
            </select>
          </div>

          <div className="p-3 rounded-xl bg-brand-500/10 border border-brand-500/30 text-center">
            <span className="text-[11px] font-semibold text-gray-300">{t('editor2d.usefulArea')}</span>
            <p className="text-xl font-bold text-brand-400 mt-0.5">{data.areaM2 || 0} m²</p>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-gray-400 block mb-1">{t('editor2d.idColor')}</label>
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
            label={`${t('common.width')} (m)`}
            type="number"
            step="0.05"
            value={data.widthM || 0.80}
            onChange={(e) => onUpdateElement(type, data.id, { widthM: parseFloat(e.target.value) || 0.80 })}
          />

          <div>
            <label className="text-[11px] font-semibold text-gray-400 block mb-1">{t('editor2d.openingDirection')}</label>
            <select
              value={data.swingDirection || 'INWARD_RIGHT'}
              onChange={(e) => onUpdateElement(type, data.id, { swingDirection: e.target.value })}
              className="w-full px-2.5 py-1.5 rounded-xl bg-dark-card border border-dark-border text-xs text-white focus:outline-none focus:border-brand-500"
            >
              <option value="INWARD_RIGHT">{t('editor2d.openInsideRight')}</option>
              <option value="INWARD_LEFT">{t('editor2d.openInsideLeft')}</option>
              <option value="OUTWARD_RIGHT">{t('editor2d.openOutsideRight')}</option>
              <option value="OUTWARD_LEFT">{t('editor2d.openOutsideLeft')}</option>
              <option value="SLIDING">{t('editor2d.openSliding')}</option>
              <option value="NONE">{t('editor2d.openOpeningOnly')}</option>
            </select>
          </div>
        </div>
      )}

      {/* Window Properties */}
      {type === 'window' && (
        <div className="space-y-3">
          <Input
            label={`${t('common.width')} (m)`}
            type="number"
            step="0.05"
            value={data.widthM || 1.20}
            onChange={(e) => onUpdateElement(type, data.id, { widthM: parseFloat(e.target.value) || 1.20 })}
          />

          <Input
            label={`${t('common.height')} (m)`}
            type="number"
            step="0.05"
            value={data.heightM || 1.20}
            onChange={(e) => onUpdateElement(type, data.id, { heightM: parseFloat(e.target.value) || 1.20 })}
          />

          <Input
            label={`${t('editor2d.orientation')} (m)`}
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
            label={t('common.details') || 'Label'}
            placeholder={t('common.searchPlaceholder')}
            value={data.label || ''}
            onChange={(e) => onUpdateElement(type, data.id, { label: e.target.value })}
          />
          <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/30 text-center">
            <span className="text-[11px] font-semibold text-gray-300">{t('editor2d.measuredDistance')}</span>
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
          {t('common.delete')}
        </Button>
      </div>
    </div>
  );
};
