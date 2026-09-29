import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  Point2D,
  GeometryEngine,
  WallType,
  FurnitureEngine,
  CollisionEngine,
  SpatialValidationEngine,
  SpatialValidationStatus,
} from '@hbd/shared';
import { ActiveTool } from './Toolbox.js';
import { LayerVisibility } from './LayersPanel.js';
import { ElementType } from './PropertiesPanel.js';

interface FloorplanCanvasProps {
  activeTool: ActiveTool;
  layers: LayerVisibility;
  backgroundOpacity: number;
  backgroundImageUrl?: string | null;
  scaleFactor: number; // Pixels per meter
  walls: any[];
  rooms: any[];
  doors: any[];
  windows: any[];
  furniturePlacements: any[];
  measurements: any[];
  selectedElement: { type: ElementType; data: any } | null;
  snapToGrid: boolean;
  onSelectElement: (type: ElementType, data: any) => void;
  onAddWall: (wall: any) => void;
  onAddRoom: (room: any) => void;
  onAddDoor: (door: any) => void;
  onAddWindow: (window: any) => void;
  onUpdatePlacement: (id: string, updatedFields: any) => void;
  onAddMeasurement: (measurement: any) => void;
  onCalibratePointsSelected: (p1: Point2D, p2: Point2D) => void;
}

export const FloorplanCanvas: React.FC<FloorplanCanvasProps> = ({
  activeTool,
  layers,
  backgroundOpacity,
  backgroundImageUrl,
  scaleFactor,
  walls,
  rooms,
  doors,
  windows,
  furniturePlacements,
  measurements,
  selectedElement,
  snapToGrid,
  onSelectElement,
  onAddWall,
  onAddRoom,
  onAddDoor,
  onAddWindow,
  onUpdatePlacement,
  onAddMeasurement,
  onCalibratePointsSelected,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const bgImageRef = useRef<HTMLImageElement | null>(null);

  // Viewport Transform (Pan & Zoom)
  const [zoom, setZoom] = useState<number>(0.8);
  const [pan, setPan] = useState<Point2D>({ x: 50, y: 50 });
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [panStart, setPanStart] = useState<Point2D>({ x: 0, y: 0 });

  // Dragging Furniture State
  const [draggingFurnitureId, setDraggingFurnitureId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<Point2D>({ x: 0, y: 0 });

  // Tool Drawing State
  const [drawStartPoint, setDrawStartPoint] = useState<Point2D | null>(null);
  const [currentMousePos, setCurrentMousePos] = useState<Point2D | null>(null);
  const [roomVertices, setRoomVertices] = useState<Point2D[]>([]);

  // Load Background Plan Image
  useEffect(() => {
    if (backgroundImageUrl) {
      const img = new Image();
      img.src = backgroundImageUrl.startsWith('http') || backgroundImageUrl.startsWith('blob:')
        ? backgroundImageUrl
        : `${window.location.origin}${backgroundImageUrl}`;
      img.onload = () => {
        bgImageRef.current = img;
        draw();
      };
    } else {
      bgImageRef.current = null;
    }
  }, [backgroundImageUrl]);

  // Screen to World coordinates conversion
  const screenToWorld = useCallback(
    (screenX: number, screenY: number): Point2D => {
      const canvas = canvasRef.current;
      if (!canvas) return { x: 0, y: 0 };
      const rect = canvas.getBoundingClientRect();
      const rawX = (screenX - rect.left - pan.x) / zoom;
      const rawY = (screenY - rect.top - pan.y) / zoom;

      if (snapToGrid) {
        const gridPx = (scaleFactor || 100) * 0.10; // 10cm grid
        return GeometryEngine.snapPointToGrid({ x: rawX, y: rawY }, gridPx, true);
      }
      return { x: rawX, y: rawY };
    },
    [pan, zoom, snapToGrid, scaleFactor]
  );

  // Main Render Loop
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle high-DPI
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }

    ctx.clearRect(0, 0, width, height);

    ctx.save();
    ctx.fillStyle = '#0f172a'; // slate-900
    ctx.fillRect(0, 0, width, height);

    // Apply Viewport Transform
    ctx.translate(pan.x, pan.y);
    ctx.scale(zoom, zoom);

    // 1. Draw Grid
    const gridSize = scaleFactor > 0 ? scaleFactor : 100; // 1 meter grid
    ctx.save();
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1 / zoom;
    const minX = Math.floor((-pan.x / zoom) / gridSize) * gridSize - gridSize * 2;
    const maxX = Math.ceil(((width - pan.x) / zoom) / gridSize) * gridSize + gridSize * 2;
    const minY = Math.floor((-pan.y / zoom) / gridSize) * gridSize - gridSize * 2;
    const maxY = Math.ceil(((height - pan.y) / zoom) / gridSize) * gridSize + gridSize * 2;

    for (let x = minX; x <= maxX; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, minY);
      ctx.lineTo(x, maxY);
      ctx.stroke();
    }
    for (let y = minY; y <= maxY; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(minX, y);
      ctx.lineTo(maxX, y);
      ctx.stroke();
    }
    ctx.restore();

    // 2. Draw Background Floor Plan Underlay
    if (layers.backgroundPlan && bgImageRef.current && backgroundOpacity > 0) {
      ctx.save();
      ctx.globalAlpha = backgroundOpacity;
      ctx.drawImage(bgImageRef.current, 0, 0);
      ctx.restore();
    }

    // 3. Draw Rooms Layer
    if (layers.rooms && rooms.length > 0) {
      rooms.forEach((room) => {
        if (!room.polygon || room.polygon.length < 3) return;
        const isSelected = selectedElement?.type === 'room' && selectedElement?.data?.id === room.id;

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(room.polygon[0].x, room.polygon[0].y);
        for (let i = 1; i < room.polygon.length; i++) {
          ctx.lineTo(room.polygon[i].x, room.polygon[i].y);
        }
        ctx.closePath();

        ctx.fillStyle = room.color ? `${room.color}25` : 'rgba(59, 130, 246, 0.20)';
        ctx.fill();

        ctx.strokeStyle = isSelected ? '#10b981' : room.color || '#3b82f6';
        ctx.lineWidth = isSelected ? 3 / zoom : 1.5 / zoom;
        ctx.stroke();

        const centroid = GeometryEngine.findPolygonCentroid(room.polygon);
        ctx.fillStyle = '#ffffff';
        ctx.font = `bold ${Math.max(12, 14 / zoom)}px Inter, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(room.name, centroid.x, centroid.y - 10 / zoom);

        ctx.fillStyle = '#94a3b8';
        ctx.font = `${Math.max(10, 11 / zoom)}px Inter, sans-serif`;
        ctx.fillText(`${room.areaM2 || 0} m²`, centroid.x, centroid.y + 10 / zoom);

        ctx.restore();
      });
    }

    // 4. Draw Walls Layer
    if (layers.walls && walls.length > 0) {
      walls.forEach((wall) => {
        const isSelected = selectedElement?.type === 'wall' && selectedElement?.data?.id === wall.id;
        const isExterior = wall.wallType === WallType.EXTERIOR || wall.wallType === 'EXTERIOR';
        const isLoadBearing = wall.wallType === WallType.LOAD_BEARING || wall.wallType === 'LOAD_BEARING';
        const thicknessPx = GeometryEngine.metersToPixels(wall.thicknessM || 0.15, scaleFactor || 100);

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(wall.startX, wall.startY);
        ctx.lineTo(wall.endX, wall.endY);

        ctx.lineWidth = Math.max(thicknessPx, 4);
        ctx.lineCap = 'square';
        ctx.strokeStyle = isSelected
          ? '#10b981'
          : isExterior
          ? '#e2e8f0'
          : isLoadBearing
          ? '#94a3b8'
          : '#64748b';
        ctx.stroke();

        ctx.fillStyle = isSelected ? '#10b981' : '#cbd5e1';
        ctx.beginPath();
        ctx.arc(wall.startX, wall.startY, 4 / zoom, 0, Math.PI * 2);
        ctx.arc(wall.endX, wall.endY, 4 / zoom, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      });
    }

    // 5. Draw Doors Layer & Clearance Sweep
    if (layers.doors && doors.length > 0) {
      doors.forEach((door) => {
        const isSelected = selectedElement?.type === 'door' && selectedElement?.data?.id === door.id;
        const widthPx = GeometryEngine.metersToPixels(door.widthM || 0.80, scaleFactor || 100);

        ctx.save();
        ctx.translate(door.posX, door.posY);
        ctx.rotate(((door.rotationDeg || 0) * Math.PI) / 180);

        // Clearance Zone
        if (layers.clearanceZones) {
          ctx.fillStyle = 'rgba(239, 68, 68, 0.12)';
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.arc(0, 0, widthPx, -Math.PI / 2, 0, false);
          ctx.closePath();
          ctx.fill();
        }

        // Door Leaf
        ctx.strokeStyle = isSelected ? '#10b981' : '#f59e0b';
        ctx.lineWidth = 2.5 / zoom;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, -widthPx);
        ctx.stroke();

        // Door Swing Arc
        ctx.strokeStyle = isSelected ? '#10b981' : 'rgba(245, 158, 11, 0.6)';
        ctx.lineWidth = 1.5 / zoom;
        ctx.setLineDash([4 / zoom, 4 / zoom]);
        ctx.beginPath();
        ctx.arc(0, 0, widthPx, -Math.PI / 2, 0, false);
        ctx.stroke();

        ctx.restore();
      });
    }

    // 6. Draw Windows Layer
    if (layers.windows && windows.length > 0) {
      windows.forEach((win) => {
        const isSelected = selectedElement?.type === 'window' && selectedElement?.data?.id === win.id;
        const widthPx = GeometryEngine.metersToPixels(win.widthM || 1.20, scaleFactor || 100);

        ctx.save();
        ctx.translate(win.posX, win.posY);
        ctx.rotate(((win.rotationDeg || 0) * Math.PI) / 180);

        ctx.strokeStyle = isSelected ? '#10b981' : '#06b6d4';
        ctx.lineWidth = 3 / zoom;

        ctx.beginPath();
        ctx.moveTo(-widthPx / 2, -3 / zoom);
        ctx.lineTo(widthPx / 2, -3 / zoom);
        ctx.moveTo(-widthPx / 2, 3 / zoom);
        ctx.lineTo(widthPx / 2, 3 / zoom);
        ctx.stroke();

        ctx.restore();
      });
    }

    // 7. Draw Furniture Placements Layer (V5)
    if (layers.furniture && furniturePlacements.length > 0) {
      furniturePlacements.forEach((placement) => {
        const isSelected = selectedElement?.type === 'furniture' && selectedElement?.data?.id === placement.id;
        const widthPx = placement.widthM * (scaleFactor || 100);
        const depthPx = placement.depthM * (scaleFactor || 100);

        const obb = FurnitureEngine.computeOrientedBoundingBox(
          { x: placement.posX, y: placement.posY },
          widthPx,
          depthPx,
          placement.rotationDeg || 0
        );

        ctx.save();

        // Furniture Body Fill & Stroke
        ctx.beginPath();
        ctx.moveTo(obb.vertices[0].x, obb.vertices[0].y);
        for (let i = 1; i < obb.vertices.length; i++) {
          ctx.lineTo(obb.vertices[i].x, obb.vertices[i].y);
        }
        ctx.closePath();

        // Gradient or Color based on validation
        ctx.fillStyle = isSelected
          ? 'rgba(16, 185, 129, 0.35)'
          : 'rgba(245, 158, 11, 0.25)';
        ctx.fill();

        ctx.strokeStyle = isSelected
          ? '#10b981'
          : '#f59e0b';
        ctx.lineWidth = isSelected ? 3 / zoom : 1.8 / zoom;
        ctx.stroke();

        // Draw Label & Dimensions in CM
        ctx.save();
        ctx.translate(placement.posX, placement.posY);
        ctx.rotate(((placement.rotationDeg || 0) * Math.PI) / 180);

        ctx.fillStyle = '#ffffff';
        ctx.font = `bold ${Math.max(10, 11 / zoom)}px Inter, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(
          placement.furniture?.name || placement.name || 'Mueble',
          0,
          -6 / zoom
        );

        ctx.fillStyle = '#cbd5e1';
        ctx.font = `${Math.max(8, 9 / zoom)}px Inter, sans-serif`;
        ctx.fillText(
          `${Math.round(placement.widthM * 100)} × ${Math.round(placement.depthM * 100)} cm`,
          0,
          8 / zoom
        );
        ctx.restore();

        // When selected: draw clearance dimension lines to surrounding walls
        if (isSelected) {
          ctx.save();
          ctx.strokeStyle = '#10b981';
          ctx.lineWidth = 1 / zoom;
          ctx.setLineDash([3 / zoom, 3 / zoom]);

          // Corner handles
          obb.vertices.forEach((v) => {
            ctx.fillStyle = '#10b981';
            ctx.beginPath();
            ctx.arc(v.x, v.y, 4 / zoom, 0, Math.PI * 2);
            ctx.fill();
          });

          // Center rotation handle
          const rotHandleY = obb.minY - 20 / zoom;
          ctx.beginPath();
          ctx.moveTo(placement.posX, obb.minY);
          ctx.lineTo(placement.posX, rotHandleY);
          ctx.stroke();
          ctx.fillStyle = '#38bdf8';
          ctx.beginPath();
          ctx.arc(placement.posX, rotHandleY, 5 / zoom, 0, Math.PI * 2);
          ctx.fill();

          ctx.restore();
        }

        ctx.restore();
      });
    }

    // 8. Draw Measurements Layer
    if (layers.measurements && measurements.length > 0) {
      measurements.forEach((m) => {
        const isSelected = selectedElement?.type === 'measurement' && selectedElement?.data?.id === m.id;

        ctx.save();
        ctx.strokeStyle = isSelected ? '#10b981' : '#a855f7';
        ctx.lineWidth = 1.5 / zoom;

        ctx.beginPath();
        ctx.moveTo(m.startX, m.startY);
        ctx.lineTo(m.endX, m.endY);
        ctx.stroke();

        const midX = (m.startX + m.endX) / 2;
        const midY = (m.startY + m.endY) / 2;
        ctx.fillStyle = '#ffffff';
        ctx.font = `bold ${Math.max(10, 12 / zoom)}px Inter, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.fillText(`${m.distanceM || 0} m`, midX, midY - 4 / zoom);

        ctx.restore();
      });
    }

    // 9. Active Tool Previews
    if (drawStartPoint && currentMousePos) {
      ctx.save();
      if (activeTool === 'wall') {
        const snappedEnd = GeometryEngine.snapPointToAngle(drawStartPoint, currentMousePos);
        const distM = GeometryEngine.calculateDistance(drawStartPoint, snappedEnd, scaleFactor || 100);

        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 4 / zoom;
        ctx.beginPath();
        ctx.moveTo(drawStartPoint.x, drawStartPoint.y);
        ctx.lineTo(snappedEnd.x, snappedEnd.y);
        ctx.stroke();

        const midX = (drawStartPoint.x + snappedEnd.x) / 2;
        const midY = (drawStartPoint.y + snappedEnd.y) / 2;
        ctx.fillStyle = '#10b981';
        ctx.font = `bold ${12 / zoom}px Inter, sans-serif`;
        ctx.fillText(`${distM} m`, midX, midY - 8 / zoom);
      } else if (activeTool === 'measure' || activeTool === 'calibrate') {
        const distM = GeometryEngine.calculateDistance(drawStartPoint, currentMousePos, scaleFactor || 100);
        ctx.strokeStyle = activeTool === 'calibrate' ? '#f59e0b' : '#a855f7';
        ctx.lineWidth = 2 / zoom;
        ctx.setLineDash([5 / zoom, 5 / zoom]);
        ctx.beginPath();
        ctx.moveTo(drawStartPoint.x, drawStartPoint.y);
        ctx.lineTo(currentMousePos.x, currentMousePos.y);
        ctx.stroke();

        const midX = (drawStartPoint.x + currentMousePos.x) / 2;
        const midY = (drawStartPoint.y + currentMousePos.y) / 2;
        ctx.fillStyle = '#ffffff';
        ctx.font = `bold ${12 / zoom}px Inter, sans-serif`;
        ctx.fillText(activeTool === 'calibrate' ? 'Calibrando...' : `${distM} m`, midX, midY - 8 / zoom);
      }
      ctx.restore();
    }

    ctx.restore();
  }, [
    pan,
    zoom,
    layers,
    backgroundOpacity,
    scaleFactor,
    walls,
    rooms,
    doors,
    windows,
    furniturePlacements,
    measurements,
    selectedElement,
    drawStartPoint,
    currentMousePos,
    roomVertices,
    activeTool,
  ]);

  useEffect(() => {
    draw();
  }, [draw]);

  // Mouse Actions
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (e.button === 1 || (e.button === 0 && activeTool === 'select' && e.altKey)) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      return;
    }

    if (e.button !== 0) return;
    const worldPos = screenToWorld(e.clientX, e.clientY);

    if (activeTool === 'select' || activeTool === 'furniture') {
      // Check if clicking on a placed furniture piece
      for (const p of furniturePlacements) {
        const wPx = p.widthM * (scaleFactor || 100);
        const dPx = p.depthM * (scaleFactor || 100);
        const obb = FurnitureEngine.computeOrientedBoundingBox(
          { x: p.posX, y: p.posY },
          wPx,
          dPx,
          p.rotationDeg || 0
        );

        if (GeometryEngine.isPointInsidePolygon(worldPos, obb.vertices)) {
          onSelectElement('furniture', p);
          setDraggingFurnitureId(p.id);
          setDragOffset({ x: worldPos.x - p.posX, y: worldPos.y - p.posY });
          return;
        }
      }

      // Check walls
      for (const w of walls) {
        const d = GeometryEngine.calculateDistance(
          worldPos,
          { x: (w.startX + w.endX) / 2, y: (w.startY + w.endY) / 2 }
        );
        if (d < 30) {
          onSelectElement('wall', w);
          return;
        }
      }

      // Check rooms
      for (const r of rooms) {
        if (r.polygon && GeometryEngine.isPointInsidePolygon(worldPos, r.polygon)) {
          onSelectElement('room', r);
          return;
        }
      }

      // Check doors
      for (const d of doors) {
        if (GeometryEngine.calculateDistance(worldPos, { x: d.posX, y: d.posY }) < 25) {
          onSelectElement('door', d);
          return;
        }
      }

      // Check windows
      for (const win of windows) {
        if (GeometryEngine.calculateDistance(worldPos, { x: win.posX, y: win.posY }) < 25) {
          onSelectElement('window', win);
          return;
        }
      }

      // Pan on empty space
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    } else if (activeTool === 'wall') {
      if (!drawStartPoint) {
        setDrawStartPoint(worldPos);
      } else {
        const snappedEnd = GeometryEngine.snapPointToAngle(drawStartPoint, worldPos);
        const distM = GeometryEngine.calculateDistance(drawStartPoint, snappedEnd, scaleFactor || 100);
        onAddWall({
          id: `wall-user-${Date.now()}`,
          startX: drawStartPoint.x,
          startY: drawStartPoint.y,
          endX: snappedEnd.x,
          endY: snappedEnd.y,
          thicknessM: 0.15,
          heightM: 2.50,
          wallType: WallType.INTERIOR,
          lengthM: distM,
        });
        setDrawStartPoint(null);
      }
    } else if (activeTool === 'door') {
      onAddDoor({
        id: `door-user-${Date.now()}`,
        wallId: walls[0]?.id || 'wall-1',
        posX: worldPos.x,
        posY: worldPos.y,
        widthM: 0.80,
        heightM: 2.10,
        rotationDeg: 0,
        swingDirection: 'INWARD_RIGHT',
      });
    } else if (activeTool === 'window') {
      onAddWindow({
        id: `window-user-${Date.now()}`,
        wallId: walls[0]?.id || 'wall-1',
        posX: worldPos.x,
        posY: worldPos.y,
        widthM: 1.20,
        heightM: 1.20,
        elevationM: 0.90,
        rotationDeg: 0,
      });
    } else if (activeTool === 'measure') {
      if (!drawStartPoint) {
        setDrawStartPoint(worldPos);
      } else {
        const distM = GeometryEngine.calculateDistance(drawStartPoint, worldPos, scaleFactor || 100);
        onAddMeasurement({
          id: `m-user-${Date.now()}`,
          startX: drawStartPoint.x,
          startY: drawStartPoint.y,
          endX: worldPos.x,
          endY: worldPos.y,
          distanceM: distM,
          label: 'Cota manual',
        });
        setDrawStartPoint(null);
      }
    } else if (activeTool === 'calibrate') {
      if (!drawStartPoint) {
        setDrawStartPoint(worldPos);
      } else {
        onCalibratePointsSelected(drawStartPoint, worldPos);
        setDrawStartPoint(null);
      }
    } else if (activeTool === 'room') {
      if (roomVertices.length >= 3) {
        const distToFirst = GeometryEngine.calculateDistance(worldPos, roomVertices[0]);
        if (distToFirst < 20) {
          const areaM2 = GeometryEngine.calculatePolygonArea(roomVertices, scaleFactor || 100);
          onAddRoom({
            id: `room-user-${Date.now()}`,
            name: `Estancia ${rooms.length + 1}`,
            roomType: 'LIVING_ROOM',
            polygon: roomVertices,
            areaM2,
            heightM: 2.50,
            color: '#3b82f6',
          });
          setRoomVertices([]);
          return;
        }
      }
      setRoomVertices((prev) => [...prev, worldPos]);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isPanning) {
      setPan({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      });
      return;
    }

    const worldPos = screenToWorld(e.clientX, e.clientY);
    setCurrentMousePos(worldPos);

    // If dragging a placed furniture piece
    if (draggingFurnitureId) {
      const newX = worldPos.x - dragOffset.x;
      const newY = worldPos.y - dragOffset.y;
      onUpdatePlacement(draggingFurnitureId, { posX: Math.round(newX), posY: Math.round(newY) });
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
    setDraggingFurnitureId(null);
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
    const newZoom = Math.min(Math.max(zoom * zoomFactor, 0.1), 5.0);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    setPan({
      x: mouseX - (mouseX - pan.x) * (newZoom / zoom),
      y: mouseY - (mouseY - pan.y) * (newZoom / zoom),
    });
    setZoom(newZoom);
  };

  return (
    <div className="relative w-full h-full min-h-[550px] overflow-hidden rounded-2xl bg-dark-bg border border-dark-border">
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
        className="w-full h-full cursor-crosshair block"
      />

      {/* Floating Viewport Status Badge */}
      <div className="absolute bottom-3 left-3 px-3 py-1.5 rounded-xl bg-dark-surface/90 backdrop-blur-md border border-dark-border text-[11px] font-mono text-gray-300 flex items-center gap-3">
        <span>Zoom: {Math.round(zoom * 100)}%</span>
        <span>•</span>
        <span>
          Cursor: X: {currentMousePos ? Math.round(currentMousePos.x) : 0} Y:{' '}
          {currentMousePos ? Math.round(currentMousePos.y) : 0}
        </span>
        {scaleFactor > 0 && (
          <>
            <span>•</span>
            <span className="text-brand-400">1m = {Math.round(scaleFactor)}px</span>
          </>
        )}
      </div>
    </div>
  );
};
