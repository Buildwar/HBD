import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  FolderKanban,
  Plus,
  Layers,
  Home,
  Maximize2,
  FileSpreadsheet,
  Armchair,
  ArrowRight,
  Clock,
  Sparkles,
  Box,
} from 'lucide-react';
import { Navbar } from '../components/layout/Navbar.js';
import { Card } from '../components/ui/Card.js';
import { Button } from '../components/ui/Button.js';
import { Modal } from '../components/ui/Modal.js';
import { Input } from '../components/ui/Input.js';
import { Badge } from '../components/ui/Badge.js';
import { useAuth } from '../context/AuthContext.js';
import { projectService, Project } from '../services/project.service.js';

export const DashboardPage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isCreating, setIsCreating] = useState<boolean>(false);

  // Formulario de nuevo proyecto
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

  // Cálculos estadísticos
  const totalFloors = projects.reduce((acc, p) => acc + (p.floorsCount || 0), 0);
  const totalRooms = projects.reduce((acc, p) => acc + (p.roomsCount || 0), 0);
  const totalArea = projects.reduce((acc, p) => acc + (p.totalAreaM2 || 0), 0);

  const greetingName = user?.name?.split(' ')[0] || 'Usuario';

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <Navbar
        title={`${t('dashboard.welcome')}, ${greetingName}`}
        subtitle={t('dashboard.subtitle')}
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

      <div className="p-8 max-w-7xl mx-auto w-full space-y-8">
        {/* Métricas Generales */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="flex items-center gap-4 bg-gradient-to-br from-dark-surface to-dark-card border-dark-border">
            <div className="w-12 h-12 rounded-xl bg-brand-500/15 text-brand-400 border border-brand-500/30 flex items-center justify-center">
              <FolderKanban size={24} />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium">{t('dashboard.totalProjects')}</p>
              <h4 className="text-2xl font-black text-white mt-0.5">{projects.length}</h4>
            </div>
          </Card>

          <Card className="flex items-center gap-4 bg-gradient-to-br from-dark-surface to-dark-card border-dark-border">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
              <Layers size={24} />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium">{t('dashboard.totalFloors')}</p>
              <h4 className="text-2xl font-black text-white mt-0.5">{totalFloors}</h4>
            </div>
          </Card>

          <Card className="flex items-center gap-4 bg-gradient-to-br from-dark-surface to-dark-card border-dark-border">
            <div className="w-12 h-12 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center justify-center">
              <Home size={24} />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium">{t('dashboard.totalRooms')}</p>
              <h4 className="text-2xl font-black text-white mt-0.5">{totalRooms}</h4>
            </div>
          </Card>

          <Card className="flex items-center gap-4 bg-gradient-to-br from-dark-surface to-dark-card border-dark-border">
            <div className="w-12 h-12 rounded-xl bg-sky-500/15 text-sky-400 border border-sky-500/30 flex items-center justify-center">
              <Maximize2 size={24} />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium">{t('dashboard.totalArea')}</p>
              <h4 className="text-2xl font-black text-white mt-0.5">{totalArea.toFixed(1)} m²</h4>
            </div>
          </Card>
        </div>

        {/* Acciones Rápidas */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
            {t('dashboard.quickActions')}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card
              hoverable
              onClick={() => setIsModalOpen(true)}
              className="flex items-center justify-between group p-5"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-brand-500/20 text-brand-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Plus size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white group-hover:text-brand-400 transition-colors">
                    {t('dashboard.createProject')}
                  </h4>
                  <p className="text-xs text-gray-400 mt-0.5">{t('dashboard.createProjectDesc')}</p>
                </div>
              </div>
              <ArrowRight size={16} className="text-gray-500 group-hover:text-brand-400 transition-colors" />
            </Card>

            <Card
              hoverable
              onClick={() => navigate('/plans')}
              className="flex items-center justify-between group p-5"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <FileSpreadsheet size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white group-hover:text-sky-400 transition-colors">
                    {t('dashboard.importPlan')}
                  </h4>
                  <p className="text-xs text-gray-400 mt-0.5">{t('dashboard.importPlanDesc')}</p>
                </div>
              </div>
              <ArrowRight size={16} className="text-gray-500 group-hover:text-sky-400 transition-colors" />
            </Card>

            <Card
              hoverable
              onClick={() => navigate('/furniture')}
              className="flex items-center justify-between group p-5"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Armchair size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors">
                    {t('dashboard.furnitureCatalog')}
                  </h4>
                  <p className="text-xs text-gray-400 mt-0.5">{t('dashboard.furnitureCatalogDesc')}</p>
                </div>
              </div>
              <ArrowRight size={16} className="text-gray-500 group-hover:text-amber-400 transition-colors" />
            </Card>
          </div>
        </div>

        {/* Proyectos Recientes */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles size={18} className="text-brand-400" />
              {t('dashboard.recentProjects')}
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/projects')}
              className="text-xs text-gray-400 hover:text-white"
            >
              {t('dashboard.viewAll')}
            </Button>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-44 rounded-2xl bg-dark-surface/50 animate-pulse border border-dark-border/40" />
              ))}
            </div>
          ) : projects.length === 0 ? (
            <Card className="text-center py-12 flex flex-col items-center justify-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-dark-card flex items-center justify-center text-gray-500 mb-1">
                <FolderKanban size={28} />
              </div>
              <h4 className="text-base font-bold text-gray-200">{t('dashboard.noProjects')}</h4>
              <p className="text-xs text-gray-400 max-w-sm">
                {t('dashboard.noProjectsDesc')}
              </p>
              <Button
                size="sm"
                className="mt-2"
                icon={<Plus size={16} />}
                onClick={() => setIsModalOpen(true)}
              >
                {t('dashboard.newProject')}
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {projects.slice(0, 6).map((project) => (
                <Card
                  key={project.id}
                  hoverable
                  onClick={() => navigate(`/projects/${project.id}`)}
                  className="flex flex-col justify-between h-48 group relative overflow-hidden"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <div className="w-8 h-8 rounded-lg bg-brand-500/10 text-brand-400 flex items-center justify-center border border-brand-500/20 group-hover:scale-105 transition-transform">
                        <Home size={16} />
                      </div>
                      <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-dark-card text-gray-400 border border-dark-border">
                        {project.propertyType === 'residential' ? t('dashboard.residentialTag') : project.propertyType || t('dashboard.homeTag')}
                      </span>
                    </div>

                    <h4 className="text-base font-bold text-white group-hover:text-brand-400 transition-colors truncate">
                      {project.name}
                    </h4>
                    <p className="text-xs text-gray-400 line-clamp-2">
                      {project.description || project.address || t('dashboard.noDescription')}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-dark-border/40 flex items-center justify-between text-xs text-gray-400">
                    <div className="flex items-center gap-3">
                      <span>{project.floorsCount || 1} {t('dashboard.floors')}</span>
                      <span>•</span>
                      <span>{project.roomsCount || 0} {t('dashboard.rooms')}</span>
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-gray-500">
                      <Clock size={12} />
                      <span>{new Date(project.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
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
