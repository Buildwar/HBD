/**
 * HBD — HOME BOARD DESIGNER (V6.0.0)
 * Visualizador y Editor 3D Completo (FloorplanViewer3D)
 * Autor Oficial: Adrián Palma
 * Copyright: © 2026 Adrián Palma — HBD (Home Board Designer)
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Scene3DData,
  CameraPreset,
  SceneLightingMode,
  Scene3DLayerVisibility,
  ThreeDConversionEngine,
  SpatialValidationEngine,
  SpatialValidationResult,
} from '@hbd/shared';
import { threeDService } from '../../services/threeD.service.js';
import { furnitureService } from '../../services/furniture.service.js';
import { Toolbox3D, Tool3D } from './Toolbox3D.js';
import { PropertiesPanel3D, Selected3DEntity } from './PropertiesPanel3D.js';
import { ThreeDCanvas } from './ThreeDCanvas.js';
import { AIDesignModal } from '../../features/ai-design/AIDesignModal.js';
import { Loader2, ArrowLeft, Cuboid as Cube3d, Sparkles, Layers, Wand2 } from 'lucide-react';

interface FloorplanViewer3DProps {
  floorId: string;
  projectName?: string;
  floorName?: string;
  onSwitchTo2D: () => void;
  onSwitchToRender?: () => void;
}

export const FloorplanViewer3D: React.FC<FloorplanViewer3DProps> = ({
  floorId,
  projectName,
  floorName,
  onSwitchTo2D,
  onSwitchToRender,
}) => {
  const [sceneData, setSceneData] = useState<Scene3DData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados de control 3D
  const [activeTool, setActiveTool] = useState<Tool3D>('select');
  const [lightingMode, setLightingMode] = useState<SceneLightingMode>('day');
  const [activePreset, setActivePreset] = useState<CameraPreset | undefined>(undefined);
  const [layerVisibility, setLayerVisibility] = useState<Scene3DLayerVisibility>({
    walls: true,
    floors: true,
    ceilings: false,
    doors: true,
    windows: true,
    furniture: true,
    measurements: true,
    wireframe: false,
    dimensions3D: true,
  });
  const [selectedEntity, setSelectedEntity] = useState<Selected3DEntity>(null);
  const [isAIDesignModalOpen, setIsAIDesignModalOpen] = useState(false);

  // Cargar escena 3D inicial
  const loadScene = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await threeDService.getScene3D(floorId, lightingMode);
      if (res.success && res.data) {
        setSceneData(res.data);
        if (!activePreset && res.data.cameraPresets?.length > 0) {
          setActivePreset(res.data.cameraPresets[0]);
        }
      } else {
        setError('No se pudo cargar el modelo 3D de la vivienda.');
      }
    } catch (err: any) {
      setError(err.message || 'Error al procesar la escena 3D.');
    } finally {
      setIsLoading(false);
    }
  }, [floorId, lightingMode]);

  useEffect(() => {
    loadScene();
  }, [loadScene]);

  // Cambiar Iluminación Día / Noche
  const handleToggleLighting = () => {
    setLightingMode((prev) => (prev === 'day' ? 'night' : 'day'));
  };

  // Cambiar Visibilidad de Capas
  const handleToggleLayer = (layer: keyof Scene3DLayerVisibility) => {
    setLayerVisibility((prev) => ({ ...prev, [layer]: !prev[layer] }));
  };

  // Reset de Cámara
  const handleResetCamera = () => {
    if (sceneData?.cameraPresets && sceneData.cameraPresets.length > 0) {
      setActivePreset(sceneData.cameraPresets[0]);
      setActiveTool('select');
    }
  };

  // Capturar Snapshot PNG
  const handleCaptureSnapshot = () => {
    const canvas = document.querySelector('canvas');
    if (!canvas) return;
    const imgUrl = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = imgUrl;
    a.download = `HBD_3D_${projectName || 'Vivienda'}_${new Date().toISOString().slice(0, 10)}.png`;
    a.click();
  };

  // Sincronizar Mueble Movido en 3D -> 2D
  const handleFurnitureMoved = async (
    placementId: string,
    posX3D: number,
    posZ3D: number,
    rotationDeg: number
  ) => {
    if (!sceneData) return;

    // Convertir de metros 3D a píxeles 2D de canvas
    const ppm = sceneData.scalePixelsPerMeter;
    const centerPxX = (sceneData.bounds.minX * ppm + sceneData.bounds.maxX * ppm) / 2;
    const centerPxY = (sceneData.bounds.minZ * ppm + sceneData.bounds.maxZ * ppm) / 2;

    const posX2D = posX3D * ppm + centerPxX;
    const posY2D = posZ3D * ppm + centerPxY;

    try {
      const res = await threeDService.syncFurniture3D(placementId, {
        posX: posX2D,
        posY: posY2D,
        rotationDeg,
      });

      if (res.success && res.data) {
        // Actualizar datos locales de la escena
        setSceneData((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            furniture: prev.furniture.map((f) => {
              if (f.placementId === placementId) {
                return {
                  ...f,
                  position: { ...f.position, x: posX3D, z: posZ3D },
                  rotationYDeg: rotationDeg,
                  rotationYRad: (rotationDeg * Math.PI) / 180,
                  isValid: res.data.validation.isCompatible,
                };
              }
              return f;
            }),
          };
        });

        // Actualizar panel de propiedades si está seleccionado
        if (selectedEntity?.type === 'furniture' && selectedEntity.data.placementId === placementId) {
          setSelectedEntity({
            type: 'furniture',
            data: {
              ...selectedEntity.data,
              position: { ...selectedEntity.data.position, x: posX3D, z: posZ3D },
              rotationYDeg: rotationDeg,
            },
            validation: res.data.validation,
          });
        }
      }
    } catch (err) {
      console.error('Error al sincronizar transformación 3D:', err);
    }
  };

  // Rotar Mueble desde el Panel de Propiedades
  const handleRotateFurniture = async (placementId: string, angleDeg: number) => {
    if (!sceneData) return;
    const target = sceneData.furniture.find((f) => f.placementId === placementId);
    if (!target) return;

    await handleFurnitureMoved(placementId, target.position.x, target.position.z, angleDeg);
  };

  // Duplicar Mueble
  const handleDuplicateFurniture = async (placementId: string) => {
    try {
      const res = await furnitureService.duplicatePlacement(placementId);
      if (res.success) {
        await loadScene();
      }
    } catch (err) {
      console.error('Error al duplicar mueble en 3D:', err);
    }
  };

  // Eliminar Mueble
  const handleDeleteFurniture = async (placementId: string) => {
    try {
      const res = await furnitureService.deletePlacement(placementId);
      if (res.success) {
        setSelectedEntity(null);
        await loadScene();
      }
    } catch (err) {
      console.error('Error al eliminar mueble en 3D:', err);
    }
  };

  // Cambiar Color / Acabado de Mueble
  const handleChangeFurnitureColor = (placementId: string, color: string) => {
    setSceneData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        furniture: prev.furniture.map((f) => (f.placementId === placementId ? { ...f, color } : f)),
      };
    });
  };

  // Cambiar Material de Suelo de Habitación
  const handleChangeRoomMaterial = (roomId: string, materialColor: string) => {
    setSceneData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        floors: prev.floors.map((fl) => (fl.id === roomId ? { ...fl, floorColor: materialColor } : fl)),
      };
    });
  };

  // Abrir / Cerrar Puerta 3D
  const handleToggleDoorOpen = (doorId: string) => {
    setSceneData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        doors: prev.doors.map((d) => {
          if (d.id === doorId) {
            const nextOpen = !d.isOpen;
            return {
              ...d,
              isOpen: nextOpen,
              swingAngleDeg: nextOpen ? 85 : 0,
            };
          }
          return d;
        }),
      };
    });

    if (selectedEntity?.type === 'door' && selectedEntity.data.id === doorId) {
      const nextOpen = !selectedEntity.data.isOpen;
      setSelectedEntity({
        type: 'door',
        data: {
          ...selectedEntity.data,
          isOpen: nextOpen,
          swingAngleDeg: nextOpen ? 85 : 0,
        },
      });
    }
  };

  return (
    <div className="relative w-full h-[calc(100vh-4rem)] bg-slate-950 overflow-hidden flex flex-col">
      {/* Barra Superior con Selector 2D | 3D */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 p-1 rounded-2xl shadow-2xl pointer-events-auto">
        <button
          onClick={onSwitchTo2D}
          className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors flex items-center gap-2"
        >
          <span>📐 Plano 2D</span>
        </button>

        <button className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 text-white shadow-lg flex items-center gap-2">
          <Cube3d className="w-4 h-4" />
          <span>🧊 Vista 3D</span>
        </button>

        <button
          onClick={() => setIsAIDesignModalOpen(true)}
          className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600/80 hover:bg-indigo-600 text-white shadow-lg transition-colors flex items-center gap-2"
        >
          <Wand2 className="w-4 h-4 text-amber-300 animate-pulse" />
          <span>✨ Diseñar con IA</span>
        </button>

        {onSwitchToRender && (
          <button
            onClick={onSwitchToRender}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>Studio Render</span>
          </button>
        )}
      </div>

      {/* Contenido Principal */}
      {isLoading && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-sm gap-3 text-slate-200">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
          <p className="text-sm font-medium">Generando gemelo digital 3D a partir del plano...</p>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-slate-950 p-6 text-center">
          <p className="text-rose-400 font-semibold mb-3">{error}</p>
          <button
            onClick={loadScene}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-medium"
          >
            Reintentar
          </button>
        </div>
      )}

      {sceneData && (
        <>
          {/* Barra de Herramientas Flotante */}
          <Toolbox3D
            activeTool={activeTool}
            onSelectTool={(t) => {
              setActiveTool(t);
              if (t === 'walkthrough') {
                const walkPreset = sceneData.cameraPresets.find((p) => p.mode === 'first_person');
                if (walkPreset) setActivePreset(walkPreset);
              }
            }}
            lightingMode={lightingMode}
            onToggleLighting={handleToggleLighting}
            cameraPresets={sceneData.cameraPresets}
            activePresetId={activePreset?.id}
            onSelectCameraPreset={(p) => setActivePreset(p)}
            layerVisibility={layerVisibility}
            onToggleLayer={handleToggleLayer}
            onResetCamera={handleResetCamera}
            onCaptureSnapshot={handleCaptureSnapshot}
          />

          {/* Canvas WebGL Three.js */}
          <ThreeDCanvas
            sceneData={sceneData}
            activeTool={activeTool}
            lightingMode={lightingMode}
            activePreset={activePreset}
            layerVisibility={layerVisibility}
            selectedEntity={selectedEntity}
            onSelectEntity={(ent) => setSelectedEntity(ent)}
            onFurnitureMoved={handleFurnitureMoved}
          />

          {/* Panel Lateral de Propiedades 3D */}
          <PropertiesPanel3D
            selectedEntity={selectedEntity}
            onClose={() => setSelectedEntity(null)}
            onRotateFurniture={handleRotateFurniture}
            onDuplicateFurniture={handleDuplicateFurniture}
            onDeleteFurniture={handleDeleteFurniture}
            onChangeFurnitureColor={handleChangeFurnitureColor}
            onChangeRoomMaterial={handleChangeRoomMaterial}
            onToggleDoorOpen={handleToggleDoorOpen}
          />
        </>
      )}

      {/* Modal de Diseño Inteligente con IA */}
      <AIDesignModal
        isOpen={isAIDesignModalOpen}
        onClose={() => setIsAIDesignModalOpen(false)}
        projectId="default_project"
        floorId={floorId}
        targetRoomId={selectedEntity?.type === 'room' ? selectedEntity.data.id : undefined}
        roomName={selectedEntity?.type === 'room' ? selectedEntity.data.name : undefined}
        onApplyProposal={(_proposal) => {
          loadScene();
        }}
      />
    </div>
  );
};
