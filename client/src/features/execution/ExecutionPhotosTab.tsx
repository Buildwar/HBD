import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Camera,
  Plus,
  Image as ImageIcon,
  Columns,
} from 'lucide-react';
import { ExecutionProjectDto, SitePhotoDto } from '@hbd/shared';
import { Card } from '../../components/ui/Card.js';
import { Badge } from '../../components/ui/Badge.js';
import { Button } from '../../components/ui/Button.js';
import { Modal } from '../../components/ui/Modal.js';
import { Input } from '../../components/ui/Input.js';

interface ExecutionPhotosTabProps {
  execution: ExecutionProjectDto;
  onCreatePhoto: (photoData: Partial<SitePhotoDto>) => Promise<void>;
}

export const ExecutionPhotosTab: React.FC<ExecutionPhotosTabProps> = ({
  execution,
  onCreatePhoto,
}) => {
  const { t } = useTranslation();
  const [selectedStage, setSelectedStage] = useState<'ALL' | 'BEFORE' | 'DURING' | 'AFTER'>('ALL');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [photoUrl, setPhotoUrl] = useState<string>('');
  const [caption, setCaption] = useState<string>('');
  const [stage, setStage] = useState<'BEFORE' | 'DURING' | 'AFTER'>('DURING');
  const [location, setLocation] = useState<string>('');

  const filteredPhotos =
    selectedStage === 'ALL'
      ? execution.photos
      : execution.photos.filter((p) => p.stage === selectedStage);

  const beforePhotos = execution.photos.filter((p) => p.stage === 'BEFORE');
  const duringPhotos = execution.photos.filter((p) => p.stage === 'DURING');
  const afterPhotos = execution.photos.filter((p) => p.stage === 'AFTER');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!photoUrl.trim()) return;

    await onCreatePhoto({
      photoUrl,
      caption: caption || null,
      stage,
      location: location || null,
      photoType: 'PROGRESS',
      takenAt: new Date().toISOString(),
    });

    setIsModalOpen(false);
    setPhotoUrl('');
    setCaption('');
    setLocation('');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-white">
            {t('execution.photos.title', 'Evidencia Visual y Comparativa: Antes / Durante / Después')}
          </h3>
          <p className="text-xs text-gray-400">
            Registro fotográfico geoespacial del estado previo, evolución en curso y resultado final de la reforma.
          </p>
        </div>

        <Button
          size="sm"
          variant="primary"
          icon={<Plus size={15} />}
          onClick={() => setIsModalOpen(true)}
        >
          Añadir Fotografía
        </Button>
      </div>

      {/* Selector de Fase Comparativa */}
      <div className="flex items-center gap-2 border-b border-dark-border pb-3">
        <button
          onClick={() => setSelectedStage('ALL')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
            selectedStage === 'ALL'
              ? 'bg-brand-500 text-white'
              : 'bg-dark-card text-gray-400 hover:text-white border border-dark-border'
          }`}
        >
          Todas ({execution.photos.length})
        </button>
        <button
          onClick={() => setSelectedStage('BEFORE')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
            selectedStage === 'BEFORE'
              ? 'bg-amber-500 text-white'
              : 'bg-dark-card text-gray-400 hover:text-white border border-dark-border'
          }`}
        >
          Antes / Estado Previo ({beforePhotos.length})
        </button>
        <button
          onClick={() => setSelectedStage('DURING')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
            selectedStage === 'DURING'
              ? 'bg-sky-500 text-white'
              : 'bg-dark-card text-gray-400 hover:text-white border border-dark-border'
          }`}
        >
          Durante / En Ejecución ({duringPhotos.length})
        </button>
        <button
          onClick={() => setSelectedStage('AFTER')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
            selectedStage === 'AFTER'
              ? 'bg-emerald-500 text-white'
              : 'bg-dark-card text-gray-400 hover:text-white border border-dark-border'
          }`}
        >
          Después / Terminado ({afterPhotos.length})
        </button>
      </div>

      {/* Grid de Fotografías */}
      {filteredPhotos.length === 0 ? (
        <Card className="p-8 text-center bg-dark-surface border-dark-border">
          <ImageIcon size={32} className="mx-auto text-gray-500 mb-2" />
          <p className="text-xs text-gray-400">
            No hay fotografías registradas en esta categoría.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredPhotos.map((photo) => (
            <Card key={photo.id} className="p-2.5 bg-dark-surface border-dark-border space-y-2 overflow-hidden">
              <div className="relative aspect-video rounded-xl bg-dark-card overflow-hidden border border-dark-border/40">
                <img
                  src={photo.photoUrl}
                  alt={photo.caption || 'Evidencia de obra'}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback visual si la URL no es válida
                    (e.target as any).src =
                      'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=600&q=80';
                  }}
                />
                <div className="absolute top-2 right-2">
                  <Badge
                    variant={
                      photo.stage === 'BEFORE'
                        ? 'warning'
                        : photo.stage === 'DURING'
                        ? 'info'
                        : 'brand'
                    }
                  >
                    {photo.stage === 'BEFORE' ? 'ANTES' : photo.stage === 'DURING' ? 'DURANTE' : 'DESPUÉS'}
                  </Badge>
                </div>
              </div>

              <div className="space-y-0.5 px-1 text-xs">
                <p className="font-semibold text-gray-200 truncate">
                  {photo.caption || 'Fotografía de seguimiento'}
                </p>
                <div className="flex items-center justify-between text-[10px] text-gray-400">
                  <span>{photo.location || 'Estancia'}</span>
                  <span>{photo.takenAt.split('T')[0]}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal Añadir Foto */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Añadir Fotografía de Evidencia de Obra"
        maxWidth="md"
      >
        <form onSubmit={handleCreate} className="space-y-4 text-xs">
          <div>
            <label className="block text-gray-300 font-semibold mb-1">URL o Archivo de Imagen</label>
            <Input
              value={photoUrl}
              onChange={(e) => setPhotoUrl(e.target.value)}
              placeholder="https://... o ruta relativa de archivo"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-300 font-semibold mb-1">Fase / Momento</label>
              <select
                value={stage}
                onChange={(e) => setStage(e.target.value as any)}
                className="w-full bg-dark-card border border-dark-border rounded-xl px-3 py-2 text-white"
              >
                <option value="BEFORE">ANTES (Estado inicial pre-reforma)</option>
                <option value="DURING">DURANTE (En ejecución de trabajos)</option>
                <option value="AFTER">DESPUÉS (Acabado final terminado)</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-300 font-semibold mb-1">Ubicación / Estancia</label>
              <Input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Ej. Cocina, Salón, Baño 1..."
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-300 font-semibold mb-1">Título / Pie de Foto</label>
            <Input
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Ej. Replanteo de bajantes, Alicatado porcelánico..."
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" type="button" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button variant="primary" type="submit">
              Guardar Fotografía
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
