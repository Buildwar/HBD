/**
 * HBD — HOME BOARD DESIGNER (V9.0.0)
 * VisionImageUploader — Subida y Clasificación de Imágenes de Proyecto
 * Autor Oficial: Adrián Palma
 * Copyright: © 2026 Adrián Palma — HBD (Home Board Designer)
 */

import React, { useState, useRef } from 'react';
import {
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Camera,
  Layers,
  Sparkles,
  Tag,
} from 'lucide-react';
import { ImageSourceType, ProjectImageDto } from '@hbd/shared';
import { aiVisionService } from '../../services/aiVision.service.js';
import { Button } from '../../components/ui/Button.js';
import { Badge } from '../../components/ui/Badge.js';

interface VisionImageUploaderProps {
  projectId: string;
  floors?: any[];
  rooms?: any[];
  onUploadSuccess?: (uploadedImage: ProjectImageDto) => void;
  onClose?: () => void;
}

export const VisionImageUploader: React.FC<VisionImageUploaderProps> = ({
  projectId,
  floors = [],
  rooms = [],
  onUploadSuccess,
  onClose,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [sourceType, setSourceType] = useState<ImageSourceType>('ROOM_PHOTO');
  const [selectedFloorId, setSelectedFloorId] = useState<string>(floors[0]?.id || '');
  const [selectedRoomId, setSelectedRoomId] = useState<string>(rooms[0]?.id || '');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [autoAnalyze, setAutoAnalyze] = useState(true);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      setPreviewUrl(URL.createObjectURL(selected));
      setError(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const dropped = e.dataTransfer.files[0];
      setFile(dropped);
      setPreviewUrl(URL.createObjectURL(dropped));
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Selecciona una imagen para subir.');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const res = await aiVisionService.uploadImage({
        projectId,
        floorId: selectedFloorId || undefined,
        roomId: selectedRoomId || undefined,
        sourceType,
        file,
      });

      if (res.success && res.data) {
        let finalImage = res.data;
        if (autoAnalyze) {
          try {
            const analysisRes = await aiVisionService.analyzeImage(finalImage.id);
            if (analysisRes.success) {
              finalImage = { ...finalImage, analysis: analysisRes.data, status: 'ANALYZED' };
            }
          } catch (anaErr) {
            console.warn('Error al auto-analizar imagen tras subida:', anaErr);
          }
        }
        onUploadSuccess?.(finalImage);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Error al subir la imagen.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Zona de Arrastre / Selección de Archivo */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
          previewUrl
            ? 'border-brand-500/60 bg-dark-card/40'
            : 'border-dark-border hover:border-brand-500/50 bg-dark-surface'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          onChange={handleFileChange}
          className="hidden"
        />

        {previewUrl ? (
          <div className="flex flex-col items-center space-y-3">
            <img
              src={previewUrl}
              alt="Previsualización"
              className="max-h-48 rounded-xl object-contain shadow-lg border border-dark-border"
            />
            <p className="text-xs font-semibold text-brand-400">
              {file?.name} ({(file!.size / 1024 / 1024).toFixed(2)} MB)
            </p>
            <span className="text-[11px] text-gray-400">Haz clic para cambiar de imagen</span>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-4 space-y-2 text-gray-400">
            <div className="w-12 h-12 rounded-2xl bg-dark-card border border-dark-border flex items-center justify-center text-brand-400 shadow-inner">
              <Camera size={24} />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-200">
                Arrastra tu fotografía aquí o haz clic para examinar
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                Formatos soportados: JPG, PNG, WEBP (Máx. 50 MB)
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Tipo de Fuente y Etiquetas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <Tag size={13} /> Tipo de Imagen
          </label>
          <select
            value={sourceType}
            onChange={(e) => setSourceType(e.target.value as ImageSourceType)}
            className="w-full px-3 py-2 rounded-xl bg-dark-card border border-dark-border text-xs text-white focus:border-brand-500 focus:outline-none"
          >
            <option value="ROOM_PHOTO">📸 Fotografía Real de Habitación</option>
            <option value="PROJECT_PHOTO">🏠 Foto General de Vivienda</option>
            <option value="RENDER">🖼️ Render de Diseño</option>
            <option value="REFERENCE">💡 Imagen de Inspiración / Referencia</option>
            <option value="UPLOAD">📁 Subida General</option>
          </select>
        </div>

        {/* Asociación con Planta o Habitación */}
        <div>
          <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <Layers size={13} /> Habitación Asociada
          </label>
          <select
            value={selectedRoomId}
            onChange={(e) => setSelectedRoomId(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-dark-card border border-dark-border text-xs text-white focus:border-brand-500 focus:outline-none"
          >
            <option value="">(Sin habitación específica / General)</option>
            {rooms.map((r: any) => (
              <option key={r.id} value={r.id}>
                {r.name} ({r.areaM2} m²)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Opción de Auto-Análisis con IA */}
      <div className="p-3 rounded-xl bg-dark-card/60 border border-dark-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-amber-400" />
          <div>
            <p className="text-xs font-bold text-white">Analizar con Visión IA inmediatamente</p>
            <p className="text-[11px] text-gray-400">
              Detecta automáticamente mobiliario, materiales, paleta de colores y relaciones espaciales.
            </p>
          </div>
        </div>
        <input
          type="checkbox"
          checked={autoAnalyze}
          onChange={(e) => setAutoAnalyze(e.target.checked)}
          className="w-4 h-4 rounded text-brand-500 bg-dark-surface border-dark-border focus:ring-0 cursor-pointer"
        />
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-400 flex items-center gap-2">
          <AlertCircle size={15} />
          <span>{error}</span>
        </div>
      )}

      {/* Botones de Acción */}
      <div className="flex items-center justify-end gap-3 pt-3 border-t border-dark-border/60">
        {onClose && (
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            Cancelar
          </Button>
        )}
        <Button
          type="submit"
          variant="primary"
          size="sm"
          disabled={!file || isUploading}
          icon={isUploading ? <Loader2 className="animate-spin" size={15} /> : <Upload size={15} />}
        >
          {isUploading ? 'Subiendo y analizando...' : 'Subir Imagen'}
        </Button>
      </div>
    </form>
  );
};
