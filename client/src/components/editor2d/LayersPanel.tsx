import React from 'react';
import { useTranslation } from 'react-i18next';
import { Eye, EyeOff, Layers, Sliders, Image, Square, DoorOpen, Maximize2, Ruler, Armchair, ShieldAlert } from 'lucide-react';

export interface LayerVisibility {
  backgroundPlan: boolean;
  walls: boolean;
  rooms: boolean;
  doors: boolean;
  windows: boolean;
  furniture: boolean;
  clearanceZones: boolean;
  measurements: boolean;
}

interface LayersPanelProps {
  layers: LayerVisibility;
  onToggleLayer: (layerName: keyof LayerVisibility) => void;
  backgroundOpacity: number; // 0 to 1
  onChangeBackgroundOpacity: (opacity: number) => void;
  scaleFactor: number; // Pixels per meter
}

export const LayersPanel: React.FC<LayersPanelProps> = ({
  layers,
  onToggleLayer,
  backgroundOpacity,
  onChangeBackgroundOpacity,
  scaleFactor,
}) => {
  const { t } = useTranslation();

  const layerItems: Array<{ key: keyof LayerVisibility; label: string; icon: React.ReactNode }> = [
    { key: 'backgroundPlan', label: t('editor2d.layerPlan'), icon: <Image size={14} className="text-amber-400" /> },
    { key: 'walls', label: t('editor2d.layerWalls'), icon: <div className="w-3.5 h-1 bg-brand-400 rounded-sm" /> },
    { key: 'rooms', label: t('editor2d.layerRooms'), icon: <Square size={14} className="text-blue-400" /> },
    { key: 'doors', label: t('editor2d.layerOpenings') || 'Doors', icon: <DoorOpen size={14} className="text-emerald-400" /> },
    { key: 'windows', label: t('editor2d.windowsCount') || 'Windows', icon: <Maximize2 size={14} className="text-cyan-400" /> },
    { key: 'furniture', label: t('editor2d.layerFurniture'), icon: <Armchair size={14} className="text-amber-500" /> },
    { key: 'clearanceZones', label: t('plans.clearanceZones') || 'Clearance Zones', icon: <ShieldAlert size={14} className="text-rose-400" /> },
    { key: 'measurements', label: t('editor2d.layerDimensions'), icon: <Ruler size={14} className="text-purple-400" /> },
  ];

  return (
    <div className="w-64 rounded-2xl bg-dark-surface/95 backdrop-blur-md border border-dark-border shadow-xl p-4 space-y-4">
      <div className="flex items-center justify-between border-b border-dark-border pb-2.5">
        <div className="flex items-center gap-2 text-xs font-bold text-gray-200">
          <Layers size={15} className="text-brand-400" />
          <span>{t('editor2d.layersTitle')}</span>
        </div>
        <span className="text-[10px] font-semibold text-gray-400 bg-dark-card px-2 py-0.5 rounded-full border border-dark-border">
          {scaleFactor ? `1m = ${Math.round(scaleFactor)}px` : t('plans.uncalibrated') || 'Uncalibrated'}
        </span>
      </div>

      {/* Layer Toggles */}
      <div className="space-y-1.5">
        {layerItems.map((item) => {
          const isVisible = layers[item.key];
          return (
            <div
              key={item.key}
              onClick={() => onToggleLayer(item.key)}
              className={`flex items-center justify-between p-2 rounded-xl text-xs cursor-pointer transition-colors ${
                isVisible
                  ? 'bg-dark-card/80 text-gray-200 hover:bg-dark-card'
                  : 'bg-dark-card/20 text-gray-500 hover:text-gray-400'
              }`}
            >
              <div className="flex items-center gap-2">
                {item.icon}
                <span className="font-medium">{item.label}</span>
              </div>
              <button
                type="button"
                className={`p-1 rounded-lg transition-colors ${
                  isVisible ? 'text-brand-400' : 'text-gray-600'
                }`}
              >
                {isVisible ? <Eye size={14} /> : <EyeOff size={14} />}
              </button>
            </div>
          );
        })}
      </div>

      {/* Background Opacity Slider */}
      <div className="pt-2 border-t border-dark-border space-y-2">
        <div className="flex items-center justify-between text-[11px] font-semibold text-gray-300">
          <span className="flex items-center gap-1.5">
            <Sliders size={12} className="text-brand-400" />
            Opacidad del Plano
          </span>
          <span className="text-brand-400 font-mono">{Math.round(backgroundOpacity * 100)}%</span>
        </div>
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={backgroundOpacity}
          onChange={(e) => onChangeBackgroundOpacity(parseFloat(e.target.value))}
          className="w-full accent-brand-500 bg-dark-card h-1.5 rounded-lg cursor-pointer"
        />
        <div className="flex justify-between text-[9px] text-gray-500 font-mono">
          <span>{t('editor2d.opacityHidden', '0% (Oculto)')}</span>
          <span>50%</span>
          <span>{t('editor2d.opacitySolid', '100% (Sólido)')}</span>
        </div>
      </div>
    </div>
  );
};
