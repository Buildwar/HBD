import React from 'react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();

  const tools: Array<{ id: ActiveTool; label: string; icon: React.ReactNode }> = [
    { id: 'select', label: t('editor2d.toolSelect'), icon: <MousePointer size={17} /> },
    { id: 'wall', label: t('editor2d.toolWall'), icon: <div className="w-3.5 h-1 bg-current rounded-sm" /> },
    { id: 'room', label: t('editor2d.toolRoom'), icon: <Square size={17} /> },
    { id: 'door', label: t('editor2d.toolDoor'), icon: <DoorOpen size={17} /> },
    { id: 'window', label: t('editor2d.toolWindow'), icon: <Maximize2 size={17} /> },
    { id: 'furniture', label: t('editor2d.toolFurniture'), icon: <Armchair size={17} /> },
    { id: 'measure', label: t('editor2d.toolMeasure'), icon: <Ruler size={17} /> },
    { id: 'calibrate', label: t('editor2d.toolCalibrate'), icon: <Sliders size={17} /> },
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
          title={t('furniture.library')}
        >
          <BookOpen size={15} />
          <span className="hidden sm:inline">{t('nav.library') || 'Library'}</span>
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
          title={t('plans.undo') || 'Undo (Ctrl+Z)'}
          className="p-2 rounded-xl text-gray-300 hover:text-white hover:bg-dark-card/60 disabled:opacity-40 disabled:pointer-events-none transition-all"
        >
          <RotateCcw size={16} />
        </button>
        <button
          onClick={onRedo}
          disabled={!canRedo}
          title={t('plans.redo') || 'Redo (Ctrl+Y)'}
          className="p-2 rounded-xl text-gray-300 hover:text-white hover:bg-dark-card/60 disabled:opacity-40 disabled:pointer-events-none transition-all"
        >
          <RotateCw size={16} />
        </button>

        <div className="h-4 w-px bg-dark-border mx-1" />

        {/* Zoom */}
        <button
          onClick={onZoomOut}
          title={t('common.zoomOut')}
          className="p-2 rounded-xl text-gray-300 hover:text-white hover:bg-dark-card/60 transition-all"
        >
          <ZoomOut size={16} />
        </button>
        <button
          onClick={onResetZoom}
          title={t('common.resetView')}
          className="p-2 rounded-xl text-gray-300 hover:text-white hover:bg-dark-card/60 transition-all"
        >
          <Maximize size={16} />
        </button>
        <button
          onClick={onZoomIn}
          title={t('common.zoomIn')}
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
          {isSaving ? t('common.saving') : hasUnsavedChanges ? t('common.save') : (t('plans.saved') || 'Saved')}
        </Button>

        {onOpenAIDesign && (
          <button
            onClick={onOpenAIDesign}
            className="ml-2 px-3 py-1.5 rounded-xl bg-brand-500/20 hover:bg-brand-500/30 text-brand-400 border border-brand-500/40 font-semibold text-xs flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
            title={t('aiDesign.title')}
          >
            <Sparkles size={14} className="animate-pulse" />
            <span>{t('aiDesign.title')}</span>
          </button>
        )}

        {onSwitchTo3D && (
          <button
            onClick={onSwitchTo3D}
            className="ml-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs flex items-center gap-1.5 transition-all shadow-md active:scale-95"
            title={t('viewer3d.title')}
          >
            <Cube3d size={15} />
            <span>{t('nav.viewer3d') || '3D View'}</span>
          </button>
        )}
      </div>
    </div>
  );
};
