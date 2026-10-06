/**
 * HBD — HOME BOARD DESIGNER (V14.0.0)
 * PÁGINA PRINCIPAL DE DOCUMENTACIÓN Y DOSSIERS
 * DOCUMENTS PAGE
 *
 * Autor: Adrián Palma
 * Copyright: © 2026 Adrián Palma. Todos los derechos reservados.
 */

import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  FileText,
  Plus,
  ArrowLeft,
  Download,
  Eye,
  Trash2,
  RefreshCw,
  Sparkles,
  Presentation,
  FolderOpen,
  Calendar,
  Layers,
} from 'lucide-react';
import { Navbar } from '../components/layout/Navbar.js';
import { Card } from '../components/ui/Card.js';
import { Button } from '../components/ui/Button.js';
import { Badge } from '../components/ui/Badge.js';
import { DocumentBuilderModal } from '../features/documents/DocumentBuilderModal.js';
import { DocumentPreviewModal } from '../features/documents/DocumentPreviewModal.js';
import { ClientPresentationModal } from '../features/documents/ClientPresentationModal.js';
import { projectService } from '../services/project.service.js';
import { documentService } from '../services/document.service.js';
import { ProjectDocumentDto } from '@hbd/shared';

export const DocumentsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const projectId = searchParams.get('projectId') || '';
  const [project, setProject] = useState<any>(null);
  const [documents, setDocuments] = useState<ProjectDocumentDto[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [isBuilderModalOpen, setIsBuilderModalOpen] = useState<boolean>(false);
  const [selectedDocForPreview, setSelectedDocForPreview] = useState<ProjectDocumentDto | null>(null);
  const [selectedDocForPresentation, setSelectedDocForPresentation] = useState<ProjectDocumentDto | null>(null);

  useEffect(() => {
    if (projectId) {
      loadData();
    } else {
      setIsLoading(false);
    }
  }, [projectId]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [projRes, docsRes] = await Promise.all([
        projectService.getProjectById(projectId),
        documentService.getProjectDocuments(projectId),
      ]);
      if (projRes.data) setProject(projRes.data);
      if (docsRes.data) setDocuments(docsRes.data);
    } catch (err) {
      console.error('Error al cargar datos de documentación:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteDoc = async (id: string) => {
    if (!window.confirm(t('documents.confirmDelete', '¿Deseas eliminar este documento?'))) return;
    try {
      await documentService.deleteDocument(id);
      await loadData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <Navbar
        title={project?.name ? t('documents.titleWithProject', { name: project.name, defaultValue: `Documentación: ${project.name}` }) : t('documents.title', 'Documentación y Presentación')}
        subtitle={t('documents.subtitle', 'Generación de dossiers ejecutivos, memorias técnicas y presentaciones para clientes.')}
        actions={
          <div className="flex items-center gap-2">
            {project && (
              <Button
                variant="outline"
                size="sm"
                icon={<ArrowLeft size={16} />}
                onClick={() => navigate(`/projects/${project.id}`)}
              >
                {t('common.backToProject', 'Volver al Proyecto')}
              </Button>
            )}
            <Button
              size="sm"
              variant="primary"
              icon={<Plus size={16} />}
              onClick={() => setIsBuilderModalOpen(true)}
              disabled={!projectId}
            >
              {t('documents.newDossier', 'Nuevo Dossier')}
            </Button>
          </div>
        }
      />

      <div className="p-8 max-w-7xl mx-auto w-full space-y-6">
        {!projectId ? (
          <Card className="text-center py-16 space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-dark-card border border-dark-border text-gray-400 flex items-center justify-center mx-auto">
              <FolderOpen size={32} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">{t('documents.selectProject', 'Selecciona un Proyecto')}</h3>
              <p className="text-xs text-gray-400 max-w-md mx-auto mt-1">
                {t('documents.selectProjectDesc', 'Para generar o consultar dossiers y memorias técnicas, accede a un proyecto desde tu panel de proyectos.')}
              </p>
            </div>
            <Button onClick={() => navigate('/projects')}>{t('documents.goToProjects', 'Ir a Proyectos')}</Button>
          </Card>
        ) : isLoading ? (
          <div className="text-center py-20 space-y-3">
            <div className="w-10 h-10 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-gray-400">{t('documents.loading', 'Cargando dossiers y documentación...')}</p>
          </div>
        ) : documents.length === 0 ? (
          <Card className="text-center py-16 space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-dark-card border border-dark-border text-brand-400 flex items-center justify-center mx-auto">
              <FileText size={32} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">{t('documents.noDocuments', 'No hay documentos generados aún')}</h3>
              <p className="text-xs text-gray-400 max-w-md mx-auto mt-1">
                {t('documents.noDocumentsDesc', 'Genera tu primer dossier profesional con planos, mediciones, inventario de mobiliario y presupuesto.')}
              </p>
            </div>
            <Button
              variant="primary"
              icon={<Plus size={16} />}
              onClick={() => setIsBuilderModalOpen(true)}
            >
              {t('documents.createFirstDossier', 'Crear Primer Dossier')}
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {documents.map((doc) => (
              <Card key={doc.id} className="p-5 flex flex-col justify-between space-y-4 hover:border-dark-border/80 transition-all">
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <Badge variant="brand">{doc.type}</Badge>
                      <h3 className="text-base font-bold text-white line-clamp-1">{doc.name}</h3>
                    </div>
                    <Badge variant="gray">v{doc.version}</Badge>
                  </div>

                  <p className="text-xs text-gray-400 line-clamp-2">
                    {doc.description || t('documents.defaultDesc', 'Dossier profesional generado con HBD V14.')}
                  </p>

                  <div className="grid grid-cols-2 gap-2 pt-2 text-[11px] text-gray-400 border-t border-dark-border/40">
                    <div className="flex items-center gap-1.5">
                      <Layers size={13} className="text-brand-400" />
                      <span>{doc.sections?.length || 0} {t('documents.sections', 'Secciones')}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar size={13} className="text-cyan-400" />
                      <span>{new Date(doc.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 pt-3 border-t border-dark-border/60">
                  <div className="flex items-center gap-1.5">
                    <Button
                      size="sm"
                      variant="secondary"
                      icon={<Eye size={14} />}
                      onClick={() => setSelectedDocForPreview(doc)}
                    >
                      {t('common.view', 'Ver')}
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      icon={<Presentation size={14} className="text-purple-400" />}
                      onClick={() => setSelectedDocForPresentation(doc)}
                    >
                      {t('documents.presentation', 'Pase')}
                    </Button>
                  </div>

                  <button
                    onClick={() => handleDeleteDoc(doc.id)}
                    className="p-1.5 text-gray-400 hover:text-red-400 rounded-lg hover:bg-dark-card transition-colors"
                    title={t('documents.deleteDoc', 'Eliminar documento')}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Modal Creador de Documentos */}
      {projectId && (
        <DocumentBuilderModal
          isOpen={isBuilderModalOpen}
          onClose={() => setIsBuilderModalOpen(false)}
          projectId={projectId}
          onDocumentCreated={(newDoc) => {
            loadData();
            setSelectedDocForPreview(newDoc);
          }}
        />
      )}

      {/* Visor / Previsualizador de Documento */}
      {selectedDocForPreview && (
        <DocumentPreviewModal
          isOpen={Boolean(selectedDocForPreview)}
          onClose={() => setSelectedDocForPreview(null)}
          document={selectedDocForPreview}
          onDocumentUpdated={(updated) => {
            setSelectedDocForPreview(updated);
            loadData();
          }}
        />
      )}

      {/* Modo Presentación Cliente */}
      {selectedDocForPresentation && (
        <ClientPresentationModal
          isOpen={Boolean(selectedDocForPresentation)}
          onClose={() => setSelectedDocForPresentation(null)}
          document={selectedDocForPresentation}
        />
      )}
    </div>
  );
};
