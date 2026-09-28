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
  ExternalLink,
  Layers,
} from 'lucide-react';
import { Navbar } from '../components/layout/Navbar.js';
import { Card } from '../components/ui/Card.js';
import { Button } from '../components/ui/Button.js';
import { Modal } from '../components/ui/Modal.js';
import { Input } from '../components/ui/Input.js';
import { projectService, Project } from '../services/project.service.js';

export const ProjectsPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [projects, setProjects] = useState<Project[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isCreating, setIsCreating] = useState<boolean>(false);

  // Formulario
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
      setIsCreating(true);
      const res = await projectService.createProject({
        name,
        description,
        address,
        propertyType,
      });
      if (res.data) {
        setIsModalOpen(false);
        setName('');
        setDescription('');
        setAddress('');
        await loadProjects();
        navigate(`/projects/${res.data.id}`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteProject = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('¿Estás seguro de que deseas eliminar este proyecto?')) {
      try {
        await projectService.deleteProject(id);
        await loadProjects();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const filteredProjects = projects.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.address?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <Navbar
        title={t('projects.title')}
        subtitle={t('projects.subtitle')}
        actions={
          <Button
            size="sm"
            icon={<Plus size={16} />}
            onClick={() => setIsModalOpen(true)}
          >
            {t('dashboard.newProject')}
          </Button>
        }
      />

      <div className="p-8 max-w-7xl mx-auto w-full space-y-6">
        {/* Barra de Búsqueda y Filtro */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="w-full sm:w-80">
            <Input
              placeholder={t('common.search')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              icon={<Search size={16} />}
            />
          </div>
          <div className="text-xs text-gray-400 font-medium">
            Mostrando {filteredProjects.length} de {projects.length} proyectos
          </div>
        </div>

        {/* Listado */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="h-48 rounded-2xl bg-dark-surface/50 animate-pulse border border-dark-border/40" />
            ))}
          </div>
        ) : filteredProjects.length === 0 ? (
          <Card className="text-center py-16 flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-2xl bg-dark-card flex items-center justify-center text-gray-500 mb-4">
              <FolderKanban size={32} />
            </div>
            <h4 className="text-lg font-bold text-gray-200">
              {searchQuery ? 'No se encontraron proyectos con ese criterio' : t('dashboard.noProjects')}
            </h4>
            <p className="text-xs text-gray-400 mt-1 max-w-md">
              Crea tu primer proyecto para gestionar plantas, planos arquitectónicos y distribución de muebles.
            </p>
            <Button
              className="mt-5"
              icon={<Plus size={16} />}
              onClick={() => setIsModalOpen(true)}
            >
              {t('dashboard.newProject')}
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {filteredProjects.map((project) => (
              <Card
                key={project.id}
                hoverable
                onClick={() => navigate(`/projects/${project.id}`)}
                className="flex flex-col justify-between h-56 group relative overflow-hidden"
              >
                <div className="space-y-2.5">
                  <div className="flex items-start justify-between">
                    <div className="w-9 h-9 rounded-xl bg-brand-500/10 text-brand-400 flex items-center justify-center border border-brand-500/20">
                      <Home size={18} />
                    </div>
                    <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => handleDeleteProject(project.id, e)}
                        title="Eliminar proyecto"
                        className="p-1.5 text-gray-400 hover:text-red-400 rounded-lg hover:bg-dark-card transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-base font-bold text-white group-hover:text-brand-400 transition-colors truncate">
                      {project.name}
                    </h4>
                    <p className="text-xs text-gray-400 line-clamp-2 mt-1">
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
                    <span className="flex items-center gap-1 text-brand-400 font-medium group-hover:underline">
                      Abrir <ExternalLink size={11} />
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
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
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
              className="w-full bg-dark-card border border-dark-border rounded-xl px-4 py-2.5 text-sm text-gray-100 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
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
              onClick={() => setIsModalOpen(false)}
            >
              {t('projects.cancel')}
            </Button>
            <Button
              type="submit"
              isLoading={isCreating}
              icon={<Plus size={16} />}
            >
              {t('projects.save')}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
