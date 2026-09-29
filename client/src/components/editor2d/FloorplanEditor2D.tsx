import React, { useState, useEffect, useMemo } from 'react';
import { Point2D, GeometryEngine, SpatialValidationEngine, SpatialValidationResult, FurnitureDto } from '@hbd/shared';
import { Toolbox, ActiveTool } from './Toolbox.js';
import { LayersPanel, LayerVisibility } from './LayersPanel.js';
import { PropertiesPanel, ElementType } from './PropertiesPanel.js';
import { FloorplanCanvas } from './FloorplanCanvas.js';
import { ScaleCalibrationModal } from './ScaleCalibrationModal.js';
import { AnalysisReviewModal } from './AnalysisReviewModal.js';
import { FurnitureDrawer } from '../furniture/FurnitureDrawer.js';
import { FloorplanViewer3D } from '../viewer3d/FloorplanViewer3D.js';
import { RenderWorkspace } from '../render/RenderWorkspace.js';
import { AIDesignModal, AICopilotBar, AIHistoryModal } from '../../features/ai-design/index.js';
import { AIDesignProposal } from '@hbd/shared';
import { floorplanService, FloorPlanAnalysisData } from '../../services/floorplan.service.js';
import { furnitureService } from '../../services/furniture.service.js';

interface FloorplanEditor2DProps {
  floorId: string;
  projectId?: string;
  planId?: string;
  initialPlanUrl?: string | null;
  initialScaleFactor?: number | null;
  initialWalls?: any[];
  initialRooms?: any[];
  initialDoors?: any[];
  initialWindows?: any[];
  initialFurniturePlacements?: any[];
  initialMeasurements?: any[];
  analysisData?: FloorPlanAnalysisData | null;
  onAnalysisConfirmed?: () => void;
}

export const FloorplanEditor2D: React.FC<FloorplanEditor2DProps> = ({
  floorId,
  projectId,
  planId,
  initialPlanUrl,
  initialScaleFactor = 100,
  initialWalls = [],
  initialRooms = [],
  initialDoors = [],
  initialWindows = [],
  initialFurniturePlacements = [],
  initialMeasurements = [],
  analysisData,
  onAnalysisConfirmed,
}) => {
  // Mode State: 2D vs 3D vs Studio Render
  const [viewMode, setViewMode] = useState<'2D' | '3D' | 'RENDER'>('2D');

  // Geometry State
  const [scaleFactor, setScaleFactor] = useState<number>(initialScaleFactor || 100);
  const [walls, setWalls] = useState<any[]>(initialWalls);
  const [rooms, setRooms] = useState<any[]>(initialRooms);
  const [doors, setDoors] = useState<any[]>(initialDoors);
  const [windows, setWindows] = useState<any[]>(initialWindows);
  const [furniturePlacements, setFurniturePlacements] = useState<any[]>(initialFurniturePlacements);
  const [measurements, setMeasurements] = useState<any[]>(initialMeasurements);

  // Editor Controls
  const [activeTool, setActiveTool] = useState<ActiveTool>('select');
  const [snapToGrid, setSnapToGrid] = useState<boolean>(true);
  const [selectedElement, setSelectedElement] = useState<{
    type: ElementType;
    data: any;
  } | null>(null);

  // Layers & Underlay
  const [backgroundOpacity, setBackgroundOpacity] = useState<number>(0.5);
  const [layers, setLayers] = useState<LayerVisibility>({
    backgroundPlan: true,
    walls: true,
    rooms: true,
    doors: true,
    windows: true,
    furniture: true,
    clearanceZones: true,
    measurements: true,
  });

  // History Stack for Undo / Redo
  const [history, setHistory] = useState<any[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);

  // Modals & Drawers
  const [isCalibrateModalOpen, setIsCalibrateModalOpen] = useState<boolean>(false);
  const [calibratePoints, setCalibratePoints] = useState<{ p1: Point2D; p2: Point2D } | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState<boolean>(!!analysisData);
  const [isFurnitureDrawerOpen, setIsFurnitureDrawerOpen] = useState<boolean>(false);
  const [isAIDesignModalOpen, setIsAIDesignModalOpen] = useState<boolean>(false);
  const [isAIHistoryModalOpen, setIsAIHistoryModalOpen] = useState<boolean>(false);

  // Saving State
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);
  const [isConfirming, setIsConfirming] = useState<boolean>(false);

  const refreshPlacements = async () => {
    if (floorId) {
      try {
        const res = await furnitureService.getFloorPlacements(floorId);
        if (res.data) {
          setFurniturePlacements(res.data);
        }
      } catch (err) {
        console.error('Error refreshing placements:', err);
      }
    }
  };

  // Load existing floor placements on mount
  useEffect(() => {
    if (floorId) {
      furnitureService.getFloorPlacements(floorId).then((res) => {
        if (res.data && res.data.length > 0) {
          setFurniturePlacements(res.data);
        }
      }).catch(console.error);
    }
  }, [floorId]);

  // Compute real-time "¿CABE AQUÍ?" spatial validation for selected furniture
  const activeValidationResult: SpatialValidationResult | null = useMemo(() => {
    if (!selectedElement || selectedElement.type !== 'furniture' || !selectedElement.data) {
      return null;
    }

    const item = selectedElement.data;

    // Find the room containing the furniture center
    const targetRoom = rooms.find(
      (r) => r.polygon && GeometryEngine.isPointInsidePolygon({ x: item.posX, y: item.posY }, r.polygon)
    ) || rooms[0] || null;

    return SpatialValidationEngine.validatePlacement({
      furnitureId: item.id,
      furnitureName: item.furniture?.name || item.name || 'Mueble',
      posX: item.posX,
      posY: item.posY,
      widthM: item.widthM,
      depthM: item.depthM,
      heightM: item.heightM,
      rotationDeg: item.rotationDeg || 0,
      scaleFactor,
      room: targetRoom,
      walls,
      otherPlacements: furniturePlacements.filter((p) => p.id !== item.id),
      doors,
      windows,
    });
  }, [selectedElement, rooms, walls, doors, windows, furniturePlacements, scaleFactor]);

  // Save current state snapshot to undo history
  const pushHistorySnapshot = (newState: {
    walls: any[];
    rooms: any[];
    doors: any[];
    windows: any[];
    furniturePlacements: any[];
    measurements: any[];
  }) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newState);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    setHasUnsavedChanges(true);
  };

  // Undo / Redo Actions
  const handleUndo = () => {
    if (historyIndex > 0) {
      const prev = history[historyIndex - 1];
      setWalls(prev.walls);
      setRooms(prev.rooms);
      setDoors(prev.doors);
      setWindows(prev.windows);
      setFurniturePlacements(prev.furniturePlacements || []);
      setMeasurements(prev.measurements);
      setHistoryIndex(historyIndex - 1);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const next = history[historyIndex + 1];
      setWalls(next.walls);
      setRooms(next.rooms);
      setDoors(next.doors);
      setWindows(next.windows);
      setFurniturePlacements(next.furniturePlacements || []);
      setMeasurements(next.measurements);
      setHistoryIndex(historyIndex + 1);
    }
  };

  // Layer Visibility Toggle
  const handleToggleLayer = (layerName: keyof LayerVisibility) => {
    setLayers((prev) => ({ ...prev, [layerName]: !prev[layerName] }));
  };

  // Add Wall
  const handleAddWall = (newWall: any) => {
    const nextWalls = [...walls, newWall];
    setWalls(nextWalls);
    pushHistorySnapshot({ walls: nextWalls, rooms, doors, windows, furniturePlacements, measurements });
  };

  // Add Room
  const handleAddRoom = (newRoom: any) => {
    const nextRooms = [...rooms, newRoom];
    setRooms(nextRooms);
    pushHistorySnapshot({ walls, rooms: nextRooms, doors, windows, furniturePlacements, measurements });
  };

  // Add Door
  const handleAddDoor = (newDoor: any) => {
    const nextDoors = [...doors, newDoor];
    setDoors(nextDoors);
    pushHistorySnapshot({ walls, rooms, doors: nextDoors, windows, furniturePlacements, measurements });
  };

  // Add Window
  const handleAddWindow = (newWin: any) => {
    const nextWindows = [...windows, newWin];
    setWindows(nextWindows);
    pushHistorySnapshot({ walls, rooms, doors, windows: nextWindows, furniturePlacements, measurements });
  };

  // Add Furniture Placement from Catalog
  const handleSelectFurnitureFromDrawer = (furniture: FurnitureDto) => {
    // Default position: center of the first room or canvas center
    const defaultCenter = rooms[0]?.polygon
      ? GeometryEngine.findPolygonCentroid(rooms[0].polygon)
      : { x: 400, y: 300 };

    const newPlacement = {
      id: `placement-${Date.now()}`,
      floorId,
      furnitureId: furniture.id,
      furniture,
      name: furniture.name,
      posX: defaultCenter.x,
      posY: defaultCenter.y,
      posZ: 0,
      rotationDeg: 0,
      widthM: furniture.defaultWidthM,
      depthM: furniture.defaultDepthM,
      heightM: furniture.defaultHeightM,
      scale: 1.0,
    };

    const nextPlacements = [...furniturePlacements, newPlacement];
    setFurniturePlacements(nextPlacements);
    setSelectedElement({ type: 'furniture', data: newPlacement });
    pushHistorySnapshot({ walls, rooms, doors, windows, furniturePlacements: nextPlacements, measurements });

    // Also persist to server
    furnitureService.createPlacement(floorId, {
      furnitureId: furniture.id,
      posX: defaultCenter.x,
      posY: defaultCenter.y,
      widthM: furniture.defaultWidthM,
      depthM: furniture.defaultDepthM,
      heightM: furniture.defaultHeightM,
    }).catch(console.error);
  };

  // Update Furniture Placement Position during drag
  const handleUpdatePlacement = (id: string, updatedFields: any) => {
    const next = furniturePlacements.map((p) => (p.id === id ? { ...p, ...updatedFields } : p));
    setFurniturePlacements(next);

    if (selectedElement && selectedElement.data.id === id) {
      setSelectedElement({ type: 'furniture', data: { ...selectedElement.data, ...updatedFields } });
    }
    setHasUnsavedChanges(true);
  };

  // Add Measurement
  const handleAddMeasurement = (newM: any) => {
    const nextM = [...measurements, newM];
    setMeasurements(nextM);
    pushHistorySnapshot({ walls, rooms, doors, windows, furniturePlacements, measurements: nextM });
  };

  // Update Element Properties from Inspector Panel
  const handleUpdateElement = (type: ElementType, id: string, updatedFields: any) => {
    if (type === 'furniture') {
      const next = furniturePlacements.map((p) => (p.id === id ? { ...p, ...updatedFields } : p));
      setFurniturePlacements(next);
      pushHistorySnapshot({ walls, rooms, doors, windows, furniturePlacements: next, measurements });
    } else if (type === 'wall') {
      const next = walls.map((w) => (w.id === id ? { ...w, ...updatedFields } : w));
      setWalls(next);
      pushHistorySnapshot({ walls: next, rooms, doors, windows, furniturePlacements, measurements });
    } else if (type === 'room') {
      const next = rooms.map((r) => (r.id === id ? { ...r, ...updatedFields } : r));
      setRooms(next);
      pushHistorySnapshot({ walls, rooms: next, doors, windows, furniturePlacements, measurements });
    } else if (type === 'door') {
      const next = doors.map((d) => (d.id === id ? { ...d, ...updatedFields } : d));
      setDoors(next);
      pushHistorySnapshot({ walls, rooms, doors: next, windows, furniturePlacements, measurements });
    } else if (type === 'window') {
      const next = windows.map((w) => (w.id === id ? { ...w, ...updatedFields } : w));
      setWindows(next);
      pushHistorySnapshot({ walls, rooms, doors, windows: next, furniturePlacements, measurements });
    } else if (type === 'measurement') {
      const next = measurements.map((m) => (m.id === id ? { ...m, ...updatedFields } : m));
      setMeasurements(next);
      pushHistorySnapshot({ walls, rooms, doors, windows, furniturePlacements, measurements: next });
    }

    if (selectedElement && selectedElement.data.id === id) {
      setSelectedElement({ type, data: { ...selectedElement.data, ...updatedFields } });
    }
  };

  // Duplicate Element
  const handleDuplicateElement = (type: ElementType, id: string) => {
    if (type === 'furniture') {
      const source = furniturePlacements.find((p) => p.id === id);
      if (source) {
        const duplicated = {
          ...source,
          id: `placement-${Date.now()}`,
          posX: source.posX + 30,
          posY: source.posY + 30,
        };
        const next = [...furniturePlacements, duplicated];
        setFurniturePlacements(next);
        setSelectedElement({ type: 'furniture', data: duplicated });
        pushHistorySnapshot({ walls, rooms, doors, windows, furniturePlacements: next, measurements });
      }
    }
  };

  // Delete Element
  const handleDeleteElement = (type: ElementType, id: string) => {
    if (type === 'furniture') {
      const next = furniturePlacements.filter((p) => p.id !== id);
      setFurniturePlacements(next);
      pushHistorySnapshot({ walls, rooms, doors, windows, furniturePlacements: next, measurements });
      furnitureService.deletePlacement(id).catch(console.error);
    } else if (type === 'wall') {
      const next = walls.filter((w) => w.id !== id);
      setWalls(next);
      pushHistorySnapshot({ walls: next, rooms, doors, windows, furniturePlacements, measurements });
    } else if (type === 'room') {
      const next = rooms.filter((r) => r.id !== id);
      setRooms(next);
      pushHistorySnapshot({ walls, rooms: next, doors, windows, furniturePlacements, measurements });
    } else if (type === 'door') {
      const next = doors.filter((d) => d.id !== id);
      setDoors(next);
      pushHistorySnapshot({ walls, rooms, doors: next, windows, furniturePlacements, measurements });
    } else if (type === 'window') {
      const next = windows.filter((w) => w.id !== id);
      setWindows(next);
      pushHistorySnapshot({ walls, rooms, doors, windows: next, furniturePlacements, measurements });
    } else if (type === 'measurement') {
      const next = measurements.filter((m) => m.id !== id);
      setMeasurements(next);
      pushHistorySnapshot({ walls, rooms, doors, windows, furniturePlacements, measurements: next });
    }
    setSelectedElement(null);
  };

  // Calibration 2-point handler
  const handleCalibratePointsSelected = (p1: Point2D, p2: Point2D) => {
    setCalibratePoints({ p1, p2 });
    setIsCalibrateModalOpen(true);
  };

  const handleApplyCalibration = async (realMeters: number) => {
    if (!calibratePoints) return;
    const pixelDist = GeometryEngine.calculateDistance(calibratePoints.p1, calibratePoints.p2);
    const newScale = GeometryEngine.calculateScaleFactor(pixelDist, realMeters);
    setScaleFactor(newScale);

    if (planId) {
      try {
        await floorplanService.calibrateScale(planId, calibratePoints.p1, calibratePoints.p2, realMeters);
      } catch (err) {
        console.error('Error saving scale calibration:', err);
      }
    }

    const updatedWalls = walls.map((w) => ({
      ...w,
      lengthM: GeometryEngine.calculateDistance({ x: w.startX, y: w.startY }, { x: w.endX, y: w.endY }, newScale),
    }));
    const updatedRooms = rooms.map((r) => ({
      ...r,
      areaM2: GeometryEngine.calculatePolygonArea(r.polygon, newScale),
    }));

    setWalls(updatedWalls);
    setRooms(updatedRooms);
    pushHistorySnapshot({ walls: updatedWalls, rooms: updatedRooms, doors, windows, furniturePlacements, measurements });
  };

  // Save Geometry & Placements
  const handleSave = async () => {
    try {
      setIsSaving(true);
      await Promise.all([
        floorplanService.saveGeometry(floorId, {
          walls,
          rooms,
          doors,
          windows,
          measurements,
        }),
        ...furniturePlacements.map((p) =>
          furnitureService.updatePlacement(p.id, {
            posX: p.posX,
            posY: p.posY,
            rotationDeg: p.rotationDeg,
            widthM: p.widthM,
            depthM: p.depthM,
            heightM: p.heightM,
          }).catch(() => null)
        ),
      ]);
      setHasUnsavedChanges(false);
    } catch (err) {
      console.error('Error saving geometry and furniture:', err);
    } finally {
      setIsSaving(false);
    }
  };

  // Confirm Import from Analysis
  const handleConfirmImport = async () => {
    if (!planId) return;
    try {
      setIsConfirming(true);
      await floorplanService.confirmImport(planId, {
        walls,
        rooms,
        doors,
        windows,
      });
      setIsReviewModalOpen(false);
      setHasUnsavedChanges(false);
      if (onAnalysisConfirmed) {
        onAnalysisConfirmed();
      }
    } catch (err) {
      console.error('Error confirming import:', err);
    } finally {
      setIsConfirming(false);
    }
  };

  if (viewMode === '3D') {
    return (
      <FloorplanViewer3D
        floorId={floorId}
        onSwitchTo2D={() => {
          setViewMode('2D');
          refreshPlacements();
        }}
        onSwitchToRender={() => setViewMode('RENDER')}
      />
    );
  }

  if (viewMode === 'RENDER') {
    return (
      <RenderWorkspace
        floorId={floorId}
        projectId={projectId || 'default_project'}
        onSwitchTo2D={() => {
          setViewMode('2D');
          refreshPlacements();
        }}
        onSwitchTo3D={() => setViewMode('3D')}
      />
    );
  }

  return (
    <div className="flex flex-col h-full w-full space-y-3">
      {/* Top Floating Action / Toolbox */}
      <Toolbox
        activeTool={activeTool}
        onSelectTool={setActiveTool}
        onOpenFurnitureDrawer={() => setIsFurnitureDrawerOpen(true)}
        onOpenAIDesign={() => setIsAIDesignModalOpen(true)}
        snapToGrid={snapToGrid}
        onToggleSnap={() => setSnapToGrid(!snapToGrid)}
        canUndo={historyIndex > 0}
        canRedo={historyIndex < history.length - 1}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onZoomIn={() => {}}
        onZoomOut={() => {}}
        onResetZoom={() => {}}
        onSave={handleSave}
        isSaving={isSaving}
        hasUnsavedChanges={hasUnsavedChanges}
        onSwitchTo3D={() => setViewMode('3D')}
      />

      {/* Main Viewport + Sidebars */}
      <div className="flex-1 flex gap-3 min-h-[600px] relative">
        {/* Left Side: Layers Panel */}
        <div className="hidden lg:block shrink-0">
          <LayersPanel
            layers={layers}
            onToggleLayer={handleToggleLayer}
            backgroundOpacity={backgroundOpacity}
            onChangeBackgroundOpacity={setBackgroundOpacity}
            scaleFactor={scaleFactor}
          />
        </div>

        {/* Center: Interactive 2D Canvas */}
        <div className="flex-1 h-full min-h-[550px] relative">
          <FloorplanCanvas
            activeTool={activeTool}
            layers={layers}
            backgroundOpacity={backgroundOpacity}
            backgroundImageUrl={initialPlanUrl}
            scaleFactor={scaleFactor}
            walls={walls}
            rooms={rooms}
            doors={doors}
            windows={windows}
            furniturePlacements={furniturePlacements}
            measurements={measurements}
            selectedElement={selectedElement}
            snapToGrid={snapToGrid}
            onSelectElement={(type, data) => setSelectedElement({ type, data })}
            onAddWall={handleAddWall}
            onAddRoom={handleAddRoom}
            onAddDoor={handleAddDoor}
            onAddWindow={handleAddWindow}
            onUpdatePlacement={handleUpdatePlacement}
            onAddMeasurement={handleAddMeasurement}
            onCalibratePointsSelected={handleCalibratePointsSelected}
          />

          {/* Floating AI Copilot Bar at bottom */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 pointer-events-auto">
            <AICopilotBar
              projectId={projectId || 'default_project'}
              floorId={floorId}
              targetRoomId={selectedElement?.type === 'room' ? selectedElement.data.id : undefined}
              onActionApplied={refreshPlacements}
            />
          </div>
        </div>

        {/* Right Side: Properties Inspector & Spatial Validation */}
        <div className="hidden lg:block shrink-0">
          <PropertiesPanel
            selectedElement={selectedElement}
            onUpdateElement={handleUpdateElement}
            onDeleteElement={handleDeleteElement}
            onDuplicateElement={handleDuplicateElement}
            onDeselect={() => setSelectedElement(null)}
            validationResult={activeValidationResult}
          />
        </div>
      </div>

      {/* Furniture Catalog Drawer */}
      <FurnitureDrawer
        isOpen={isFurnitureDrawerOpen}
        onClose={() => setIsFurnitureDrawerOpen(false)}
        onSelectFurniture={handleSelectFurnitureFromDrawer}
      />

      {/* Calibration Modal */}
      <ScaleCalibrationModal
        isOpen={isCalibrateModalOpen}
        onClose={() => setIsCalibrateModalOpen(false)}
        p1={calibratePoints?.p1 || null}
        p2={calibratePoints?.p2 || null}
        pixelDistance={
          calibratePoints
            ? GeometryEngine.calculateDistance(calibratePoints.p1, calibratePoints.p2)
            : 0
        }
        onCalibrate={handleApplyCalibration}
      />

      {/* Analysis Review Modal */}
      {analysisData && (
        <AnalysisReviewModal
          isOpen={isReviewModalOpen}
          onClose={() => setIsReviewModalOpen(false)}
          analysis={analysisData}
          onConfirmImport={handleConfirmImport}
          isConfirming={isConfirming}
        />
      )}

      {/* AI Design & Interiorism Engine Modal */}
      <AIDesignModal
        isOpen={isAIDesignModalOpen}
        onClose={() => setIsAIDesignModalOpen(false)}
        projectId={projectId || 'default_project'}
        floorId={floorId}
        targetRoomId={selectedElement?.type === 'room' ? selectedElement.data.id : undefined}
        roomName={selectedElement?.type === 'room' ? selectedElement.data.name : undefined}
        onApplyProposal={(_proposal) => {
          refreshPlacements();
        }}
      />

      {/* AI History Modal */}
      <AIHistoryModal
        isOpen={isAIHistoryModalOpen}
        onClose={() => setIsAIHistoryModalOpen(false)}
        projectId={projectId || 'default_project'}
        floorId={floorId}
        onApplyHistoryItem={(_item) => {
          refreshPlacements();
        }}
      />
    </div>
  );
};
