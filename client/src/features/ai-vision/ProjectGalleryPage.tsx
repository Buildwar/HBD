/**
 * HBD — HOME BOARD DESIGNER (V9.0.0)
 * ProjectGalleryPage — Galería Completa de Imágenes y Centro de Operaciones de Visión IA
 * Autor Oficial: Adrián Palma
 * Copyright: © 2026 Adrián Palma — HBD (Home Board Designer)
 */

import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Camera,
  Image as ImageIcon,
  Sparkles,
  Layers,
  Upload,
  Plus,
  Trash2,
  Eye,
  GitCompare,
  Palette,
  Wand2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Filter,
  Search,
  ArrowLeft,
  FolderOpen,
  Info,
} from 'lucide-react';
import {
  ProjectImageDto,
  ImageSourceType,
  VisionAnalysisResult,
} from '@hbd/shared';
import { aiVisionService } from '../../services/aiVision.service.js';
import { projectService } from '../../services/project.service.js';
import { Navbar } from '../../components/layout/Navbar.js';
import { Card } from '../../components/ui/Card.js';
import { Button } from '../../components/ui/Button.js';
import { Badge } from '../../components/ui/Badge.js';
import { Modal } from '../../components/ui/Modal.js';
import { VisionImageUploader } from './VisionImageUploader.js';
import { VisionImageViewer } from './VisionImageViewer.js';
import { VisionReviewModal } from './VisionReviewModal.js';
import { VisionDiffModal } from './VisionDiffModal.js';
import { InspirationModal } from './InspirationModal.js';
import { AIDesignModal } from '../ai-design/AIDesignModal.js';

export const ProjectGalleryPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const projectIdParam = searchParams.get('projectId');
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>(projectIdParam || '');
  const [currentProject, setCurrentProject] = useState<any>(null);

  const [images, setImages] = useState<ProjectImageDto[]>([]);
  const [selectedTab, setSelectedTab] = useState<'ALL' | ImageSourceType>('ALL');
  const [isLoading, setIsLoading] = useState(true);

  // Modales
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [activeImageForReview, setActiveImageForReview] = useState<ProjectImageDto | null>(null);
  const [activeImageForDiff, setActiveImageForDiff] = useState<ProjectImageDto | null>(null);
  const [activeImageForInspiration, setActiveImageForInspiration] = useState<ProjectImageDto | null>(null);
  const [activeImageForView, setActiveImageForView] = useState<ProjectImageDto | null>(null);

  // Modal de Diseño V8 conectado
  const [isAIDesignModalOpen, setIsAIDesignModalOpen] = useState(false);
  const [aiDesignPrefill, setAiDesignPrefill] = useState<any>(null);

  useEffect(() => {
    loadProjects();
  }, []);

  useEffect(() => {
    if (selectedProjectId) {
      loadProjectDetails(selectedProjectId);
      loadImages(selectedProjectId);
    }
  }, [selectedProjectId]);

  const loadProjects = async () => {
    try {
      const res = await projectService.getProjects();
      if (res.data && res.data.length > 0) {
        setProjects(res.data);
        if (!selectedProjectId) {
          setSelectedProjectId(res.data[0].id);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const loadProjectDetails = async (id: string) => {
    try {
      const res = await projectService.getProjectById(id);
      if (res.data) {
        setCurrentProject(res.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const loadImages = async (projectId: string) => {
    setIsLoading(true);
    try {
      const res = await aiVisionService.getProjectImages(projectId);
      if (res.success && res.data) {
        setImages(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteImage = async (imageId: string) => {
    if (!window.confirm('¿Deseas eliminar esta imagen de la galería?')) return;
    try {
      await aiVisionService.deleteImage(imageId);
      setImages((prev) => prev.filter((img) => img.id !== imageId));
    } catch (err) {
      console.error(err);
    }
  };

  const handleAnalyzeImage = async (imageId: string) => {
    try {
      const res = await aiVisionService.analyzeImage(imageId);
      if (res.success) {
        await loadImages(selectedProjectId);
      }
    } catch (err) {
      console.error('Error al analizar imagen:', err);
    }
  };

  const filteredImages =
    selectedTab === 'ALL'
      ? images
      : images.filter((img) => img.sourceType === selectedTab);

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-dark-bg">
      <Navbar
        title="Visión IA & Galería del Proyecto"
        subtitle="Analiza fotografías reales de la vivienda, extrae mobiliario y paletas cromáticas, y sincroniza con el modelo 3D."
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={<ArrowLeft size={16} />}
              onClick={() => navigate(selectedProjectId ? `/projects/${selectedProjectId}` : '/projects')}
            >
              Volver al Proyecto
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={<Upload size={16} />}
              onClick={() => setIsUploadModalOpen(true)}
            >
              Añadir Fotografía
            </Button>
          </div>
        }
      />

      <div className="p-8 max-w-7xl mx-auto w-full space-y-6">
        {/* Barra de Filtros y Selector de Proyecto */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-dark-surface border border-dark-border">
          <div className="flex items-center gap-3">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
              <FolderOpen size={14} /> Proyecto:
            </label>
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="px-3.5 py-1.5 rounded-xl bg-dark-card border border-dark-border text-xs text-white font-semibold focus:border-brand-500 focus:outline-none"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Pestañas de Filtrado por Tipo de Fuente */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => setSelectedTab('ALL')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                selectedTab === 'ALL'
                  ? 'bg-brand-500 text-white shadow-md shadow-brand-500/20'
                  : 'bg-dark-card text-gray-400 hover:text-white border border-dark-border'
              }`}
            >
              Todas ({images.length})
            </button>
            <button
              onClick={() => setSelectedTab('ROOM_PHOTO')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                selectedTab === 'ROOM_PHOTO'
                  ? 'bg-brand-500 text-white shadow-md shadow-brand-500/20'
                  : 'bg-dark-card text-gray-400 hover:text-white border border-dark-border'
              }`}
            >
              📸 Fotos de Estancias
            </button>
            <button
              onClick={() => setSelectedTab('PROJECT_PHOTO')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                selectedTab === 'PROJECT_PHOTO'
                  ? 'bg-brand-500 text-white shadow-md shadow-brand-500/20'
                  : 'bg-dark-card text-gray-400 hover:text-white border border-dark-border'
              }`}
            >
              🏠 Vivienda
            </button>
            <button
              onClick={() => setSelectedTab('RENDER')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                selectedTab === 'RENDER'
                  ? 'bg-brand-500 text-white shadow-md shadow-brand-500/20'
                  : 'bg-dark-card text-gray-400 hover:text-white border border-dark-border'
              }`}
            >
              🖼️ Renders
            </button>
            <button
              onClick={() => setSelectedTab('REFERENCE')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                selectedTab === 'REFERENCE'
                  ? 'bg-brand-500 text-white shadow-md shadow-brand-500/20'
                  : 'bg-dark-card text-gray-400 hover:text-white border border-dark-border'
              }`}
            >
              💡 Inspiración
            </button>
          </div>
        </div>

        {/* Grid de Imágenes de la Galería */}
        {isLoading ? (
          <div className="py-20 text-center space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-brand-400 mx-auto" />
            <p className="text-xs text-gray-400">Cargando galería de visión...</p>
          </div>
        ) : filteredImages.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredImages.map((img) => {
              const analysis = img.analysis as unknown as VisionAnalysisResult | null;
              const hasAnalysis = !!analysis;

              return (
                <Card
                  key={img.id}
                  className="p-0 overflow-hidden group flex flex-col justify-between border-dark-border hover:border-brand-500/50 transition-all shadow-lg"
                >
                  {/* Contenedor de la Imagen */}
                  <div className="relative h-56 bg-slate-950 overflow-hidden cursor-pointer" onClick={() => setActiveImageForView(img)}>
                    <img
                      src={img.url}
                      alt={img.originalFilename}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Badges Flotantes */}
                    <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-900/90 text-white backdrop-blur-md border border-slate-700/60 shadow">
                        {img.sourceType === 'ROOM_PHOTO'
                          ? '📸 Habitación'
                          : img.sourceType === 'PROJECT_PHOTO'
                          ? '🏠 Vivienda'
                          : img.sourceType === 'RENDER'
                          ? '🖼️ Render'
                          : img.sourceType === 'REFERENCE'
                          ? '💡 Inspiración'
                          : '📁 Subida'}
                      </span>

                      {hasAnalysis && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-brand-500/90 text-white backdrop-blur-md shadow">
                          ✨ {Math.round(analysis.confidenceScore * 100)}% Confianza
                        </span>
                      )}
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteImage(img.id);
                      }}
                      className="absolute top-2.5 right-2.5 p-1.5 rounded-lg bg-slate-900/80 hover:bg-rose-600 text-slate-300 hover:text-white backdrop-blur-md transition-colors"
                      title="Eliminar imagen"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>

                  {/* Metadatos y Resumen */}
                  <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-white truncate" title={img.originalFilename}>
                        {img.originalFilename}
                      </h4>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        {new Date(img.createdAt).toLocaleDateString()} • {(img.sizeBytes / 1024 / 1024).toFixed(2)} MB
                      </p>

                      {hasAnalysis && (
                        <div className="mt-2.5 p-2 rounded-xl bg-dark-card/60 border border-dark-border text-xs space-y-1">
                          <p className="font-semibold text-brand-400">
                            {analysis.roomDetection?.label || 'Estancia Residencial'}
                          </p>
                          <p className="text-[11px] text-gray-300">
                            {analysis.detectedObjects.length} muebles detectados • {analysis.detectedMaterials.length} materiales
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Botones de Operación */}
                    <div className="pt-3 border-t border-dark-border/50 flex flex-wrap items-center gap-1.5">
                      {hasAnalysis ? (
                        <>
                          <Button
                            size="sm"
                            variant="secondary"
                            icon={<Eye size={13} />}
                            onClick={() => setActiveImageForReview(img)}
                            className="text-xs"
                          >
                            Revisar Detecciones
                          </Button>

                          <Button
                            size="sm"
                            variant="ghost"
                            icon={<GitCompare size={13} />}
                            onClick={() => setActiveImageForDiff(img)}
                            title="Comparar con modelo 3D"
                          />

                          <Button
                            size="sm"
                            variant="ghost"
                            icon={<Palette size={13} />}
                            onClick={() => setActiveImageForInspiration(img)}
                            title="Ver paleta e inspiración"
                          />
                        </>
                      ) : (
                        <Button
                          size="sm"
                          variant="primary"
                          icon={<Sparkles size={13} className="text-amber-300" />}
                          onClick={() => handleAnalyzeImage(img.id)}
                          className="w-full text-xs"
                        >
                          Analizar con Visión IA
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="py-20 text-center space-y-4 bg-dark-surface rounded-2xl border border-dark-border p-8">
            <div className="w-16 h-16 rounded-2xl bg-dark-card border border-dark-border flex items-center justify-center text-gray-400 mx-auto shadow-inner">
              <Camera size={28} />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                No hay fotografías registradas en esta categoría
              </h3>
              <p className="text-xs text-gray-400 max-w-md mx-auto mt-1">
                Sube fotos reales de las estancias, renders o imágenes de inspiración para ejecutar el reconocimiento inteligente de espacios.
              </p>
            </div>
            <Button
              variant="primary"
              size="sm"
              icon={<Upload size={16} />}
              onClick={() => setIsUploadModalOpen(true)}
            >
              Subir Primera Fotografía
            </Button>
          </div>
        )}
      </div>

      {/* Modal Subir Fotografía */}
      <Modal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        title="Añadir Fotografía a la Galería de Visión"
        description="Sube una fotografía real de la estancia o imagen de inspiración."
      >
        <VisionImageUploader
          projectId={selectedProjectId}
          floors={currentProject?.floors || []}
          rooms={currentProject?.floors?.flatMap((f: any) => f.rooms || []) || []}
          onUploadSuccess={(uploaded) => {
            setIsUploadModalOpen(false);
            setImages((prev) => [uploaded, ...prev]);
          }}
          onClose={() => setIsUploadModalOpen(false)}
        />
      </Modal>

      {/* Modal Visor Grande */}
      {activeImageForView && (
        <Modal
          isOpen={!!activeImageForView}
          onClose={() => setActiveImageForView(null)}
          title={`Visor de Imagen: ${activeImageForView.originalFilename}`}
          maxWidth="xl"
        >
          <VisionImageViewer
            image={activeImageForView}
            analysis={activeImageForView.analysis as any}
          />
        </Modal>
      )}

      {/* Modal Revisión Humana */}
      {activeImageForReview && (
        <VisionReviewModal
          isOpen={!!activeImageForReview}
          onClose={() => setActiveImageForReview(null)}
          image={activeImageForReview}
          analysis={activeImageForReview.analysis as any}
          floors={currentProject?.floors || []}
          onApplySuccess={() => {
            loadImages(selectedProjectId);
          }}
        />
      )}

      {/* Modal Comparador Foto vs Modelo */}
      {activeImageForDiff && (
        <VisionDiffModal
          isOpen={!!activeImageForDiff}
          onClose={() => setActiveImageForDiff(null)}
          image={activeImageForDiff}
          onSyncRequested={() => {
            setActiveImageForReview(activeImageForDiff);
            setActiveImageForDiff(null);
          }}
        />
      )}

      {/* Modal Inspiración y Paleta */}
      {activeImageForInspiration && (
        <InspirationModal
          isOpen={!!activeImageForInspiration}
          onClose={() => setActiveImageForInspiration(null)}
          image={activeImageForInspiration}
          analysis={activeImageForInspiration.analysis as any}
          onLaunchAIDesign={(prefs) => {
            setAiDesignPrefill(prefs);
            setIsAIDesignModalOpen(true);
          }}
        />
      )}

      {/* Modal AI Design V8 */}
      {isAIDesignModalOpen && currentProject && (
        <AIDesignModal
          isOpen={isAIDesignModalOpen}
          onClose={() => setIsAIDesignModalOpen(false)}
          projectId={currentProject.id}
          floorId={currentProject.floors?.[0]?.id || 'default_floor'}
        />
      )}
    </div>
  );
};
