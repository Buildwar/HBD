/**
 * AR Viewport Canvas Component (Phase V22 / v1.22.0)
 * Visual interactive canvas for 3D anchor projection over real space backdrop or simulated floor grid.
 * Copyright © 2026 Adrián Palma. Todos los derechos reservados.
 */

import React, { useRef, useEffect, useState } from 'react';
import { ARAnchorItem, ARMode } from '@hbd/shared';
import { Camera, Maximize2, Move, RotateCw, ZoomIn, ZoomOut, Check } from 'lucide-react';

interface ARViewportCanvasProps {
  mode: ARMode;
  anchors: ARAnchorItem[];
  selectedAnchorId: string | null;
  backgroundImageUrl?: string;
  onSelectAnchor: (id: string | null) => void;
  onUpdateAnchorPosition: (id: string, newPos: { x: number; y: number; z: number }) => void;
  onCaptureSnapshot: (dataUrl: string) => void;
}

export const ARViewportCanvas: React.FC<ARViewportCanvasProps> = ({
  mode,
  anchors,
  selectedAnchorId,
  backgroundImageUrl,
  onSelectAnchor,
  onUpdateAnchorPosition,
  onCaptureSnapshot,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [zoom, setZoom] = useState<number>(1.0);
  const [rotation, setRotation] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Draw simulated AR viewport
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas dimensions
    const width = canvas.parentElement?.clientWidth || 800;
    const height = 480;
    canvas.width = width;
    canvas.height = height;

    // Clear background
    ctx.clearRect(0, 0, width, height);

    if (backgroundImageUrl) {
      const img = new Image();
      img.src = backgroundImageUrl;
      img.onload = () => {
        ctx.drawImage(img, 0, 0, width, height);
        drawOverlays(ctx, width, height);
      };
      if (img.complete) {
        ctx.drawImage(img, 0, 0, width, height);
        drawOverlays(ctx, width, height);
      }
    } else {
      // Draw simulated camera / AR floor grid
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, width, height);

      // Perspective Grid
      ctx.save();
      ctx.strokeStyle = 'rgba(99, 102, 241, 0.25)';
      ctx.lineWidth = 1;

      const originX = width / 2;
      const originY = height * 0.7;

      for (let i = -10; i <= 10; i++) {
        const x = originX + i * 40 * zoom;
        ctx.beginPath();
        ctx.moveTo(originX, originY - 150 * zoom);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      for (let j = 1; j <= 8; j++) {
        const y = originY + j * 25 * zoom;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
      ctx.restore();

      drawOverlays(ctx, width, height);
    }
  }, [anchors, selectedAnchorId, backgroundImageUrl, zoom, rotation, mode]);

  const drawOverlays = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const originX = width / 2;
    const originY = height * 0.65;
    const scale = 80 * zoom; // 1 meter = 80 pixels * zoom

    // Draw anchors
    anchors.forEach((anchor) => {
      const isSelected = anchor.id === selectedAnchorId;
      const screenX = originX + anchor.position.x * scale;
      const screenY = originY + anchor.position.z * (scale * 0.5) - anchor.position.y * scale;
      const w = anchor.scale.x * scale;
      const h = anchor.scale.y * scale;

      ctx.save();
      ctx.translate(screenX, screenY);

      // Draw shadow
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.beginPath();
      ctx.ellipse(0, h * 0.4, w * 0.5, w * 0.2, 0, 0, Math.PI * 2);
      ctx.fill();

      // Draw 3D Box Representation
      ctx.fillStyle = anchor.hasCollisions
        ? 'rgba(239, 68, 68, 0.75)'
        : isSelected
        ? 'rgba(99, 102, 241, 0.85)'
        : 'rgba(59, 130, 246, 0.65)';
      ctx.strokeStyle = isSelected ? '#ffffff' : 'rgba(255,255,255,0.7)';
      ctx.lineWidth = isSelected ? 2.5 : 1.5;

      ctx.beginPath();
      ctx.roundRect(-w / 2, -h / 2, w, h, 6);
      ctx.fill();
      ctx.stroke();

      // Label & Tag
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 11px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(anchor.name, 0, -h / 2 - 8);

      if (isSelected) {
        ctx.fillStyle = '#6366f1';
        ctx.beginPath();
        ctx.arc(0, 0, 4, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    });

    // AR Mode Indicator
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(12, 12, 180, 28);
    ctx.fillStyle = '#10b981';
    ctx.beginPath();
    ctx.arc(24, 26, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = '11px system-ui, sans-serif';
    ctx.fillText(`AR: ${mode.replace('_', ' ')}`, 36, 30);
    ctx.restore();
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const originX = canvas.width / 2;
    const originY = canvas.height * 0.65;
    const scale = 80 * zoom;

    let clickedAnchor: ARAnchorItem | null = null;

    for (const a of anchors) {
      const screenX = originX + a.position.x * scale;
      const screenY = originY + a.position.z * (scale * 0.5) - a.position.y * scale;
      const w = a.scale.x * scale;
      const h = a.scale.y * scale;

      if (
        clickX >= screenX - w / 2 &&
        clickX <= screenX + w / 2 &&
        clickY >= screenY - h / 2 &&
        clickY <= screenY + h / 2
      ) {
        clickedAnchor = a;
        break;
      }
    }

    onSelectAnchor(clickedAnchor ? clickedAnchor.id : null);
  };

  const handleCapture = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    onCaptureSnapshot(dataUrl);
  };

  return (
    <div className="relative rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-slate-900 shadow-md">
      <canvas
        ref={canvasRef}
        onClick={handleCanvasClick}
        className="w-full h-80 sm:h-[440px] cursor-crosshair block"
      />

      {/* Viewport Action Floating Bar */}
      <div className="absolute top-3 right-3 flex items-center gap-2 bg-black/60 backdrop-blur-md p-1.5 rounded-xl border border-white/10">
        <button
          onClick={() => setZoom((z) => Math.min(2.0, z + 0.15))}
          className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          title="Acercar zoom"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => setZoom((z) => Math.max(0.5, z - 0.15))}
          className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          title="Alejar zoom"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={() => setRotation((r) => (r + 45) % 360)}
          className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          title="Girar orientación de cámara"
        >
          <RotateCw className="w-4 h-4" />
        </button>
        <div className="h-4 w-px bg-white/20 my-auto" />
        <button
          onClick={handleCapture}
          className="flex items-center gap-1.5 px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
          title="Guardar instantánea AR"
        >
          <Camera className="w-3.5 h-3.5" />
          Captura AR
        </button>
      </div>

      {/* Bottom helper tip */}
      <div className="absolute bottom-2 inset-x-0 flex justify-center pointer-events-none">
        <div className="bg-black/50 backdrop-blur-sm px-3 py-1 rounded-full text-[11px] text-white/80 border border-white/10">
          Haz clic en cualquier elemento proyectado para seleccionarlo y ajustar su posición.
        </div>
      </div>
    </div>
  );
};
