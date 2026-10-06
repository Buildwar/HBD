import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  FolderKanban,
  Plus,
  Home,
  Clock,
  Search,
  Trash2,
  Edit2,
  Copy,
  ExternalLink,
  Layers,
  ArrowUpDown,
  Filter,
} from 'lucide-react';
import { Navbar } from '../components/layout/Navbar.js';
import { Card } from '../components/ui/Card.js';
import { Button } from '../components/ui/Button.js';
import { Modal } from '../components/ui/Modal.js';
import { Input } from '../components/ui/Input.js';
import { Badge } from '../components/ui/Badge.js';
import { ConfirmDialog } from '../components/ui/ConfirmDialog.js';
import { projectService, Project } from '../services/project.service.js';

export const ProjectsPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [projects, setProjects] = useState<Project[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'recent' | 'name' | 'area'>('recent');
  const [propertyFilter, setPropertyFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Modales
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [projectToEdit, setProjectToEdit] = useState<Project | null>(null);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [isActionLoading, setIsActionLoading] = useState<boolean>(false);

  // Formulario de creación / edición
  const [name, setName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [propertyType, setPropertyType] = useState<string>('residential');

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setIsLoading(true);
      const res = await projectService.getProjects();
      if (res.data) {
        setProjects(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setIsActionLoading(true);
      const res = await projectService.createProject({
        name,
        description,
        address,
        propertyType,
      });
      if (res.data) {
        setIsCreateModalOpen(false);
        setName('');
        setDescription('');
        setAddress('');
        await loadProjects();
        navigate(`/projects/${res.data.id}`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleOpenEdit = (project: Project, e: React.MouseEvent) => {
    e.stopPropagation();
    setProjectToEdit(project);
    setName(project.name);
    setDescription(project.description || '');
    setAddress(project.address || '');
    setPropertyType(project.propertyType || 'residential');
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectToEdit) return;

    try {
      setIsActionLoading(true);
      await projectService.updateProject(projectToEdit.id, {
        name,
        description,
        address,
        propertyType,
      });
      setIsEditModalOpen(false);
      setProjectToEdit(null);
      await loadProjects();
    } catch (err) {
      console.error(err);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleDuplicateProject = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      setIsLoading(true);
      await projectService.duplicateProject(id);
      await loadProjects();
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!projectToDelete) return;
    try {
      setIsActionLoading(true);
      await projectService.deleteProject(projectToDelete.id);
      setProjectToDelete(null);
      await loadProjects();
    } catch (err) {
      console.error(err);
    } finally {
      setIsActionLoading(false);
    }
  };

  const filteredProjects = projects
    .filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.address?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType =
        propertyFilter === 'all' || p.propertyType === propertyFilter;
      return matchesSearch && matchesType;
    })
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'area') return (b.totalAreaM2 || 0) - (a.totalAreaM2 || 0);
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <Navbar
        title={t('projects.title')}
        subtitle={t('projects.subtitle')}
        actions={
          <Button
            size="sm"
            icon={<Plus size={16} />}
            onClick={() => {
              setName('');
              setDescription('');
              setAddress('');
              setPropertyType('residential');
              setIsCreateModalOpen(true);
            }}
          >
            {t('dashboard.newProject')}
          </Button>
        }
      />

      <div className="p-8 max-w-7xl mx-auto w-full space-y-6">
        {/* Barra de Filtros, Búsqueda y Orden */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex items-center gap-3 w-full sm:w-auto flex-1 max-w-lg">
            <div className="w-full">
              <Input
                placeholder={t('common.search')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                icon={<Search size={16} />}
              />
            </div>
            <select
              value={propertyFilter}
              onChange={(e) => setPropertyFilter(e.target.value)}
              className="bg-dark-card border border-dark-border text-xs rounded-xl px-3 py-2.5 text-gray-200 focus:outline-none focus:border-brand-500 shrink-0"
            >
              <option value="all">{t('projects.allTypes')}</option>
              <option value="residential">{t('projects.residential')}</option>
              <option value="commercial">{t('projects.commercial')}</option>
              <option value="office">{t('projects.office')}</option>
            </select>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end text-xs text-gray-400">
            <div className="flex items-center gap-1.5">
              <ArrowUpDown size={14} />
              <span>{t('projects.sortBy')}</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-dark-card border border-dark-border text-xs rounded-lg px-2.5 py-1.5 text-gray-200 focus:outline-none focus:border-brand-500"
              >
                <option value="recent">{t('projects.sortRecent')}</option>
                <option value="name">{t('projects.sortName')}</option>
                <option value="area">{t('projects.sortArea')}</option>
              </select>
            </div>
            <span className="font-medium">
              {filteredProjects.length} {t('projects.of')} {projects.length}
            </span>
          </div>
        </div>

        {/* Grid de Proyectos */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div
                key={n}
                className="h-56 rounded-2xl bg-dark-surface/50 animate-pulse border border-dark-border/40"
              />
            ))}
          </div>
        ) : filteredProjects.length === 0 ? (
          <Card className="text-center py-16 flex flex-col items-center justify-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-dark-card flex items-center justify-center text-gray-500 shadow-inner">
              <FolderKanban size={32} />
            </div>
            <div>
              <h4 className="text-lg font-bold text-gray-200">
                {searchQuery
                  ? t('projects.noResults')
                  : t('dashboard.noProjects')}
              </h4>
              <p className="text-xs text-gray-400 mt-1 max-w-md">
                {t('projects.noProjectsDesc')}
              </p>
            </div>
            <Button
              className="mt-2"
              icon={<Plus size={16} />}
              onClick={() => setIsCreateModalOpen(true)}
            >
              {t('dashboard.newProject')}
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredProjects.map((project) => (
              <Card
                key={project.id}
                hoverable
                onClick={() => navigate(`/projects/${project.id}`)}
                className="flex flex-col justify-between h-60 group relative overflow-hidden"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="w-9 h-9 rounded-xl bg-brand-500/15 text-brand-400 flex items-center justify-center border border-brand-500/30 group-hover:scale-105 transition-transform">
                      <Home size={18} />
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => handleOpenEdit(project, e)}
                        title={t('projects.editTitle')}
                        className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-dark-card transition-colors"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        onClick={(e) => handleDuplicateProject(project.id, e)}
                        title={t('projects.duplicateTitle')}
                        className="p-1.5 text-gray-400 hover:text-brand-400 rounded-lg hover:bg-dark-card transition-colors"
                      >
                        <Copy size={13} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setProjectToDelete(project);
                        }}
                        title={t('projects.deleteTitle')}
                        className="p-1.5 text-gray-400 hover:text-red-400 rounded-lg hover:bg-dark-card transition-colors"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-base font-bold text-white group-hover:text-brand-400 transition-colors truncate">
                      {project.name}
                    </h4>
                    <p className="text-xs text-gray-400 line-clamp-2 mt-0.5">
                      {project.description || project.address || 'Sin descripción.'}
                    </p>
                  </div>
                </div>

                <div className="space-y-3 pt-3 border-t border-dark-border/40">
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="bg-dark-card/60 p-1.5 rounded-lg border border-dark-border/40">
                      <p className="text-[10px] text-gray-400">{t('projects.floorsCount')}</p>
                      <p className="font-bold text-gray-200 mt-0.5">{project.floorsCount || 1}</p>
                    </div>
                    <div className="bg-dark-card/60 p-1.5 rounded-lg border border-dark-border/40">
                      <p className="text-[10px] text-gray-400">{t('projects.roomsCount')}</p>
                      <p className="font-bold text-gray-200 mt-0.5">{project.roomsCount || 0}</p>
                    </div>
                    <div className="bg-dark-card/60 p-1.5 rounded-lg border border-dark-border/40">
                      <p className="text-[10px] text-gray-400">{t('projects.areaCount')}</p>
                      <p className="font-bold text-brand-400 mt-0.5">{project.totalAreaM2 || 0} m²</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-gray-500">
                    <div className="flex items-center gap-1">
                      <Clock size={12} />
                      <span>{new Date(project.updatedAt).toLocaleDateString()}</span>
                    </div>
                    <span className="flex items-center gap-1 text-brand-400 font-semibold group-hover:underline">
                      Abrir <ExternalLink size={12} />
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Modal Crear Proyecto */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title={t('projects.createTitle')}
        description={t('projects.createDesc')}
      >
        <form onSubmit={handleCreateProject} className="space-y-4">
          <Input
            label={t('projects.nameLabel')}
            placeholder={t('projects.namePlaceholder')}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoFocus
          />

          <Input
            label={t('projects.descLabel')}
            placeholder={t('projects.descPlaceholder')}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <Input
            label={t('projects.addressLabel')}
            placeholder={t('projects.addressPlaceholder')}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider">
              {t('projects.propertyType')}
            </label>
            <select
              value={propertyType}
              onChange={(e) => setPropertyType(e.target.value)}
              className="w-full bg-dark-card border border-dark-border rounded-xl px-4 py-2.5 text-sm text-gray-100 focus:outline-none focus:border-brand-500"
            >
              <option value="residential">{t('projects.residential')}</option>
              <option value="commercial">{t('projects.commercial')}</option>
              <option value="office">{t('projects.office')}</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-dark-border/60">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsCreateModalOpen(false)}
            >
              {t('projects.cancel')}
            </Button>
            <Button
              type="submit"
              isLoading={isActionLoading}
              icon={<Plus size={16} />}
            >
              {t('projects.save')}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Editar Proyecto */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setProjectToEdit(null);
        }}
        title={t('projects.editProject')}
        description={t('projects.editProjectDesc')}
      >
        <form onSubmit={handleSaveEdit} className="space-y-4">
          <Input
            label={t('projects.nameLabel')}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <Input
            label={t('projects.descLabel')}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <Input
            label={t('projects.addressLabel')}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider">
              {t('projects.propertyType')}
            </label>
            <select
              value={propertyType}
              onChange={(e) => setPropertyType(e.target.value)}
              className="w-full bg-dark-card border border-dark-border rounded-xl px-4 py-2.5 text-sm text-gray-100 focus:outline-none focus:border-brand-500"
            >
              <option value="residential">{t('projects.residential')}</option>
              <option value="commercial">{t('projects.commercial')}</option>
              <option value="office">{t('projects.office')}</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-dark-border/60">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setIsEditModalOpen(false);
                setProjectToEdit(null);
              }}
            >
              {t('projects.cancel')}
            </Button>
            <Button type="submit" isLoading={isActionLoading}>
              {t('common.saveChanges')}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Diálogo de Confirmación para Eliminar Proyecto */}
      {projectToDelete && (
        <ConfirmDialog
          isOpen={Boolean(projectToDelete)}
          onClose={() => setProjectToDelete(null)}
          onConfirm={handleConfirmDelete}
          title={t('projects.deleteProject')}
          description={`¿Estás seguro de que deseas eliminar permanentemente el proyecto "${projectToDelete.name}"? Esta acción borrará sus plantas, habitaciones y planos asociados.`}
          confirmText={t('projects.deleteProject')}
          cancelText={t('common.cancel')}
          variant="danger"
          isLoading={isActionLoading}
        />
      )}
    </div>
  );
};
