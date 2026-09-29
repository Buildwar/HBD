import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft,
  Layers,
  Plus,
  Home,
  FileSpreadsheet,
  Armchair,
  Box,
  Sparkles,
  Maximize2,
  DoorOpen,
  Square,
  Compass,
  Wand2,
  Camera,
} from 'lucide-react';
import { Navbar } from '../components/layout/Navbar.js';
import { Card } from '../components/ui/Card.js';
import { Button } from '../components/ui/Button.js';
import { Modal } from '../components/ui/Modal.js';
import { Input } from '../components/ui/Input.js';
import { Badge } from '../components/ui/Badge.js';
import { AIDesignModal } from '../features/ai-design/AIDesignModal.js';
import { projectService } from '../services/project.service.js';

export const ProjectDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [project, setProject] = useState<any>(null);
  const [selectedFloorIndex, setSelectedFloorIndex] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isFloorModalOpen, setIsFloorModalOpen] = useState<boolean>(false);
  const [isAIDesignModalOpen, setIsAIDesignModalOpen] = useState<boolean>(false);
  const [newFloorName, setNewFloorName] = useState<string>('');
  const [newFloorHeight, setNewFloorHeight] = useState<string>('2.50');

  useEffect(() => {
    if (id) loadProject();
  }, [id]);

  const loadProject = async () => {
    try {
      setIsLoading(true);
      const res = await projectService.getProjectById(id!);
      if (res.data) {
        setProject(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateFloor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFloorName.trim() || !id) return;

    try {
      await projectService.createFloor(id, {
        name: newFloorName,
        heightM: parseFloat(newFloorHeight) || 2.50,
      });
      setIsFloorModalOpen(false);
      setNewFloorName('');
      await loadProject();
    } catch (err) {
      console.error(err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-gray-400">Cargando proyecto...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex-1 p-8 text-center">
        <p className="text-gray-400">Proyecto no encontrado.</p>
        <Button onClick={() => navigate('/projects')} className="mt-4">
          Volver a proyectos
        </Button>
      </div>
    );
  }

  const currentFloor = project.floors?.[selectedFloorIndex] || null;

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <Navbar
        title={project.name}
        subtitle={project.address || project.description || 'Gestión y diseño espacial de la vivienda'}
        actions={
          <Button
            variant="outline"
            size="sm"
            icon={<ArrowLeft size={16} />}
            onClick={() => navigate('/projects')}
          >
            {t('common.back')}
          </Button>
        }
      />

      <div className="p-8 max-w-7xl mx-auto w-full space-y-6">
        {/* Barra de Acciones del Proyecto */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-dark-surface border border-dark-border">
          {/* Selector de Plantas */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider mr-2 flex items-center gap-1.5">
              <Layers size={14} /> Plantas:
            </span>
            {project.floors?.map((floor: any, index: number) => (
              <button
                key={floor.id}
                onClick={() => setSelectedFloorIndex(index)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  selectedFloorIndex === index
                    ? 'bg-brand-500 text-white shadow-md shadow-brand-500/20'
                    : 'bg-dark-card text-gray-300 hover:text-white border border-dark-border'
                }`}
              >
                {floor.name}
              </button>
            ))}
            <button
              onClick={() => setIsFloorModalOpen(true)}
              className="px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-dark-card/60 text-brand-400 hover:text-brand-300 border border-dashed border-brand-500/40 hover:border-brand-500 flex items-center gap-1"
            >
              <Plus size={14} /> Añadir Planta
            </button>
          </div>

          {/* Accesos a los Motores */}
          <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="secondary"
                icon={<FileSpreadsheet size={15} />}
                onClick={() => navigate(`/plans?projectId=${project.id}`)}
              >
                Plano & Análisis
              </Button>
            <Button
              size="sm"
              variant="secondary"
              icon={<Armchair size={15} />}
              onClick={() => navigate('/furniture')}
            >
              Mobiliario
            </Button>
            <Button
              size="sm"
              variant="primary"
              icon={<Box size={15} />}
              onClick={() => navigate('/viewer3d')}
            >
              Vista 3D
            </Button>
            <Button
              size="sm"
              variant="secondary"
              icon={<Camera size={15} className="text-cyan-400" />}
              onClick={() => navigate(`/vision?projectId=${project.id}`)}
            >
              Visión & Fotos
            </Button>
            {currentFloor && (
              <Button
                size="sm"
                variant="primary"
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-md shadow-indigo-500/20"
                icon={<Wand2 size={15} className="text-amber-300" />}
                onClick={() => setIsAIDesignModalOpen(true)}
              >
                Diseñar con IA
              </Button>
            )}
          </div>
        </div>

        {/* Resumen de la Planta Actual */}
        {currentFloor && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Columna Izquierda: Información de la Planta */}
            <Card className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white">{currentFloor.name}</h3>
                  <p className="text-xs text-gray-400">Nivel {currentFloor.level} • Altura: {currentFloor.heightM}m</p>
                </div>
                <Badge variant="brand">Planta Activa</Badge>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 rounded-xl bg-dark-card border border-dark-border/60">
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <Square size={14} className="text-brand-400" />
                    <span>Habitaciones</span>
                  </div>
                  <p className="text-xl font-bold text-white mt-1">
                    {currentFloor.rooms?.length || 0}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-dark-card border border-dark-border/60">
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <Maximize2 size={14} className="text-sky-400" />
                    <span>Superficie</span>
                  </div>
                  <p className="text-xl font-bold text-sky-400 mt-1">
                    {currentFloor.rooms?.reduce((acc: number, r: any) => acc + (r.areaM2 || 0), 0).toFixed(1) || 0} m²
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-dark-card border border-dark-border/60">
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <DoorOpen size={14} className="text-amber-400" />
                    <span>Paredes</span>
                  </div>
                  <p className="text-xl font-bold text-white mt-1">
                    {currentFloor.walls?.length || 0}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-dark-card border border-dark-border/60">
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <Armchair size={14} className="text-indigo-400" />
                    <span>Muebles</span>
                  </div>
                  <p className="text-xl font-bold text-white mt-1">
                    {currentFloor.furniturePlacements?.length || 0}
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-dark-border/40 space-y-2">
                <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider">
                  Habitaciones de esta planta
                </h4>
                {currentFloor.rooms?.length > 0 ? (
                  <div className="space-y-1.5 max-h-48 overflow-y-auto">
                    {currentFloor.rooms.map((room: any) => (
                      <div
                        key={room.id}
                        className="flex items-center justify-between p-2 rounded-lg bg-dark-card/60 text-xs border border-dark-border/40"
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: room.color || '#3b82f6' }}
                          />
                          <span className="font-semibold text-gray-200">{room.name}</span>
                        </div>
                        <span className="text-gray-400 font-medium">{room.areaM2} m²</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-500 py-2">
                    No hay habitaciones registradas en esta planta.
                  </p>
                )}
              </div>
            </Card>

            {/* Columna Derecha: Canvas / Área de Plano Preview */}
            <Card className="lg:col-span-2 flex flex-col justify-between p-6 bg-gradient-to-b from-dark-surface to-dark-card border-dark-border min-h-[380px]">
              <div className="flex items-center justify-between border-b border-dark-border/50 pb-3">
                <div className="flex items-center gap-2 text-xs font-bold text-gray-300">
                  <Compass size={16} className="text-brand-400" />
                  <span>Espacio de Trabajo Geométrico 2D</span>
                </div>
                <Badge variant="gray">Escala 1:100 (Metro)</Badge>
              </div>

              {/* Área visual */}
              <div className="my-auto py-12 text-center flex flex-col items-center justify-center space-y-3">
                <div className="w-16 h-16 rounded-2xl bg-dark-card border border-dark-border flex items-center justify-center text-gray-400 shadow-inner">
                  <FileSpreadsheet size={32} />
                </div>
                <div>
                  <h4 className="text-base font-bold text-gray-100">
                    Planta Lista para Digitalización Geométrica
                  </h4>
                  <p className="text-xs text-gray-400 max-w-md mt-1">
                    Carga el plano arquitectónico en PDF o imagen para ejecutar la detección automática de paredes, escala, puertas y habitaciones.
                  </p>
                </div>
                <div className="flex items-center gap-3 pt-2">
                  <Button
                    size="sm"
                    icon={<FileSpreadsheet size={16} />}
                    onClick={() => navigate(`/plans?projectId=${project.id}`)}
                  >
                    Abrir Motor de Planos
                  </Button>
                </div>
              </div>

              <div className="text-[11px] text-gray-500 flex items-center justify-between border-t border-dark-border/40 pt-3">
                <span>Motor: Geometría de Precisión + IA Desacoplada</span>
                <span>Preparado para conversión 3D</span>
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* Modal Añadir Planta */}
      <Modal
        isOpen={isFloorModalOpen}
        onClose={() => setIsFloorModalOpen(false)}
        title="Añadir Nueva Planta"
        description="Añade una planta o nivel a la vivienda (ej. Primera Planta, Buhardilla, Terraza)."
      >
        <form onSubmit={handleCreateFloor} className="space-y-4">
          <Input
            label="Nombre de la Planta"
            placeholder="Ej. Primera Planta, Garaje, Terraza..."
            value={newFloorName}
            onChange={(e) => setNewFloorName(e.target.value)}
            required
            autoFocus
          />

          <Input
            label="Altura de Techo (Metros)"
            type="number"
            step="0.05"
            placeholder="2.50"
            value={newFloorHeight}
            onChange={(e) => setNewFloorHeight(e.target.value)}
            required
          />

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-dark-border/60">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsFloorModalOpen(false)}
            >
              {t('common.cancel')}
            </Button>
            <Button type="submit" icon={<Plus size={16} />}>
              Crear Planta
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal de Diseño Inteligente con IA */}
      {currentFloor && (
        <AIDesignModal
          isOpen={isAIDesignModalOpen}
          onClose={() => setIsAIDesignModalOpen(false)}
          projectId={project.id}
          floorId={currentFloor.id}
          onApplyProposal={(_proposal) => {
            loadProject();
          }}
        />
      )}
    </div>
  );
};
