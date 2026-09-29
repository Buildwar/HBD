import {
  MousePointer,
  Square,
  DoorOpen,
  Maximize2,
  Ruler,
  Sliders,
  Grid,
  RotateCcw,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Maximize,
  Save,
  Armchair,
  BookOpen,
  Cuboid as Cube3d,
  Sparkles,
} from 'lucide-react';
import { Button } from '../ui/Button.js';

export type ActiveTool = 'select' | 'wall' | 'room' | 'door' | 'window' | 'furniture' | 'measure' | 'calibrate';

interface ToolboxProps {
  activeTool: ActiveTool;
  onSelectTool: (tool: ActiveTool) => void;
  onOpenFurnitureDrawer: () => void;
  onOpenAIDesign?: () => void;
  snapToGrid: boolean;
  onToggleSnap: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
  onSave: () => void;
  isSaving: boolean;
  hasUnsavedChanges: boolean;
  onSwitchTo3D?: () => void;
}

export const Toolbox: React.FC<ToolboxProps> = ({
  activeTool,
  onSelectTool,
  onOpenFurnitureDrawer,
  onOpenAIDesign,
  snapToGrid,
  onToggleSnap,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  onSave,
  isSaving,
  hasUnsavedChanges,
  onSwitchTo3D,
}) => {
  const tools: Array<{ id: ActiveTool; label: string; icon: React.ReactNode }> = [
    { id: 'select', label: 'Seleccionar (V)', icon: <MousePointer size={17} /> },
    { id: 'wall', label: 'Pared (W)', icon: <div className="w-3.5 h-1 bg-current rounded-sm" /> },
    { id: 'room', label: 'Habitación (R)', icon: <Square size={17} /> },
    { id: 'door', label: 'Puerta (D)', icon: <DoorOpen size={17} /> },
    { id: 'window', label: 'Ventana (F)', icon: <Maximize2 size={17} /> },
    { id: 'furniture', label: 'Mueble (M)', icon: <Armchair size={17} /> },
    { id: 'measure', label: 'Cota (C)', icon: <Ruler size={17} /> },
    { id: 'calibrate', label: 'Calibrar (K)', icon: <Sliders size={17} /> },
  ];

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-2xl bg-dark-surface/95 backdrop-blur-md border border-dark-border shadow-xl">
      {/* Tool buttons */}
      <div className="flex items-center gap-1">
        {tools.map((tool) => {
          const isActive = activeTool === tool.id;
          return (
            <button
              key={tool.id}
              onClick={() => {
                onSelectTool(tool.id);
                if (tool.id === 'furniture') {
                  onOpenFurnitureDrawer();
                }
              }}
              title={tool.label}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-brand-500 text-white shadow-md shadow-brand-500/25'
                  : 'text-gray-300 hover:text-white hover:bg-dark-card/80'
              }`}
            >
              {tool.icon}
              <span className="hidden md:inline">{tool.label.split(' ')[0]}</span>
            </button>
          );
        })}

        {/* Quick Open Furniture Library Button */}
        <button
          onClick={onOpenFurnitureDrawer}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-brand-500/10 hover:bg-brand-500/20 text-brand-400 border border-brand-500/30 transition-all ml-1"
          title="Abrir Biblioteca de Mobiliario"
        >
          <BookOpen size={15} />
          <span className="hidden sm:inline">Biblioteca</span>
        </button>
      </div>

      {/* Center/Right utilities */}
      <div className="flex items-center gap-1.5">
        {/* Snap to grid */}
        <button
          onClick={onToggleSnap}
          title={snapToGrid ? 'Ajuste a rejilla activado' : 'Ajuste a rejilla desactivado'}
          className={`p-2 rounded-xl text-xs transition-all ${
            snapToGrid
              ? 'bg-brand-500/20 text-brand-400 border border-brand-500/40'
              : 'text-gray-400 hover:text-white hover:bg-dark-card/60'
          }`}
        >
          <Grid size={16} />
        </button>

        <div className="h-4 w-px bg-dark-border mx-1" />

        {/* Undo / Redo */}
        <button
          onClick={onUndo}
          disabled={!canUndo}
          title="Deshacer (Ctrl+Z)"
          className="p-2 rounded-xl text-gray-300 hover:text-white hover:bg-dark-card/60 disabled:opacity-40 disabled:pointer-events-none transition-all"
        >
          <RotateCcw size={16} />
        </button>
        <button
          onClick={onRedo}
          disabled={!canRedo}
          title="Rehacer (Ctrl+Y)"
          className="p-2 rounded-xl text-gray-300 hover:text-white hover:bg-dark-card/60 disabled:opacity-40 disabled:pointer-events-none transition-all"
        >
          <RotateCw size={16} />
        </button>

        <div className="h-4 w-px bg-dark-border mx-1" />

        {/* Zoom */}
        <button
          onClick={onZoomOut}
          title="Alejar"
          className="p-2 rounded-xl text-gray-300 hover:text-white hover:bg-dark-card/60 transition-all"
        >
          <ZoomOut size={16} />
        </button>
        <button
          onClick={onResetZoom}
          title="Ajustar Vista (100%)"
          className="p-2 rounded-xl text-gray-300 hover:text-white hover:bg-dark-card/60 transition-all"
        >
          <Maximize size={16} />
        </button>
        <button
          onClick={onZoomIn}
          title="Acercar"
          className="p-2 rounded-xl text-gray-300 hover:text-white hover:bg-dark-card/60 transition-all"
        >
          <ZoomIn size={16} />
        </button>

        <div className="h-4 w-px bg-dark-border mx-1" />

        {/* Save button */}
        <Button
          size="sm"
          variant={hasUnsavedChanges ? 'primary' : 'secondary'}
          icon={isSaving ? undefined : <Save size={15} />}
          onClick={onSave}
          disabled={isSaving}
          className="ml-1"
        >
          {isSaving ? 'Guardando...' : hasUnsavedChanges ? 'Guardar Cambios' : 'Guardado'}
        </Button>

        {onOpenAIDesign && (
          <button
            onClick={onOpenAIDesign}
            className="ml-2 px-3 py-1.5 rounded-xl bg-brand-500/20 hover:bg-brand-500/30 text-brand-400 border border-brand-500/40 font-semibold text-xs flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
            title="Diseñar vivienda o estancia con IA"
          >
            <Sparkles size={14} className="animate-pulse" />
            <span>Diseñar con IA</span>
          </button>
        )}

        {onSwitchTo3D && (
          <button
            onClick={onSwitchTo3D}
            className="ml-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs flex items-center gap-1.5 transition-all shadow-md active:scale-95"
            title="Ver vivienda en 3D con Three.js"
          >
            <Cube3d size={15} />
            <span>Vista 3D</span>
          </button>
        )}
      </div>
    </div>
  );
};
