import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Brain,
  Layers,
  Maximize2,
  Box,
  Compass,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Plus,
  Trash2,
  Sparkles,
} from 'lucide-react';
import { ProjectIntelligenceDto, SpaceDto, FunctionalZoneType } from '@hbd/shared';
import { Modal } from '../../components/ui/Modal.js';
import { Button } from '../../components/ui/Button.js';
import { Card } from '../../components/ui/Card.js';
import { Badge } from '../../components/ui/Badge.js';
import { Input } from '../../components/ui/Input.js';
import { spaceService } from '../../services/space.service.js';

interface ProjectIntelligenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  floorId?: string;
}

export const ProjectIntelligenceModal: React.FC<ProjectIntelligenceModalProps> = ({
  isOpen,
  onClose,
  projectId,
  floorId,
}) => {
  const { t } = useTranslation();
  const [intelligence, setIntelligence] = useState<ProjectIntelligenceDto | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'metrics' | 'spaces' | 'rules'>('metrics');

  // New space modal form
  const [isNewSpaceOpen, setIsNewSpaceOpen] = useState<boolean>(false);
  const [newSpaceName, setNewSpaceName] = useState<string>('');
  const [newSpaceType, setNewSpaceType] = useState<string>('OPEN_PLAN');
  const [newSpaceHeight, setNewSpaceHeight] = useState<number>(2.50);

  // New zone form
  const [selectedSpaceForZone, setSelectedSpaceForZone] = useState<string>('');
  const [newZoneName, setNewZoneName] = useState<string>('');
  const [newZoneType, setNewZoneType] = useState<FunctionalZoneType>('LIVING');
  const [newZoneArea, setNewZoneArea] = useState<number>(10);

  useEffect(() => {
    if (isOpen && projectId) {
      loadIntelligence();
    }
  }, [isOpen, projectId]);

  const loadIntelligence = async () => {
    try {
      setIsLoading(true);
      const res = await spaceService.getProjectIntelligence(projectId);
      if (res.data) {
        setIntelligence(res.data);
      }
    } catch (err) {
      console.error('Error al cargar Project Intelligence:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateSpace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSpaceName.trim() || !floorId) return;

    try {
      await spaceService.createSpace(projectId, floorId, {
        name: newSpaceName,
        type: newSpaceType,
        heightM: newSpaceHeight,
      });
      setIsNewSpaceOpen(false);
      setNewSpaceName('');
      await loadIntelligence();
    } catch (err) {
      console.error('Error al crear espacio:', err);
    }
  };

  const handleCreateZone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newZoneName.trim() || !selectedSpaceForZone) return;

    try {
      await spaceService.createFunctionalZone(selectedSpaceForZone, {
        name: newZoneName,
        type: newZoneType,
        areaM2: newZoneArea,
      });
      setSelectedSpaceForZone('');
      setNewZoneName('');
      await loadIntelligence();
    } catch (err) {
      console.error('Error al crear zona funcional:', err);
    }
  };

  const handleDeleteSpace = async (spaceId: string) => {
    try {
      await spaceService.deleteSpace(spaceId);
      await loadIntelligence();
    } catch (err) {
      console.error('Error al eliminar espacio:', err);
    }
  };

  const handleDeleteZone = async (zoneId: string) => {
    try {
      await spaceService.deleteFunctionalZone(zoneId);
      await loadIntelligence();
    } catch (err) {
      console.error('Error al eliminar zona:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('intelligence.modalTitle', 'Inteligencia Espacial del Proyecto (V10 / V11)')}
      maxWidth="xl"
    >
      <div className="space-y-6 text-xs text-gray-300">
        {isLoading ? (
          <div className="py-12 text-center space-y-3">
            <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-gray-400">{t('common.loading', 'Calculando métricas y reglas...')}</p>
          </div>
        ) : intelligence ? (
          <>
            {/* Header del Dashboard de Inteligencia */}
            <div className="p-4 rounded-xl bg-dark-card border border-dark-border flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-extrabold text-white flex items-center gap-2">
                  <Brain className="text-brand-400" size={18} />
                  {intelligence.projectName}
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  {intelligence.floorsCount} plantas • {intelligence.roomsCount} estancias físicas • {intelligence.spacesCount} espacios funcionales
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Badge variant={intelligence.complianceScore >= 80 ? 'brand' : 'warning'}>
                  Score Normativo: {intelligence.complianceScore}%
                </Badge>
                {floorId && (
                  <Button
                    size="sm"
                    variant="outline"
                    icon={<Plus size={14} />}
                    onClick={() => setIsNewSpaceOpen(true)}
                  >
                    Nuevo Espacio
                  </Button>
                )}
              </div>
            </div>

            {/* Aviso de validación técnica */}
            {intelligence.proValidationNotes.length > 0 && (
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-2.5 text-amber-200 text-[11px]">
                <AlertTriangle size={16} className="text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-amber-400 uppercase tracking-wider block mb-0.5">
                    Validación Técnica Profesional Requerida
                  </span>
                  <p>{intelligence.proValidationNotes[0]}</p>
                </div>
              </div>
            )}

            {/* Pestañas de Vista */}
            <div className="flex items-center gap-2 border-b border-dark-border/80 pb-2">
              <button
                onClick={() => setActiveTab('metrics')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'metrics'
                    ? 'bg-brand-500 text-white shadow-md shadow-brand-500/20'
                    : 'bg-dark-card text-gray-400 hover:text-white border border-dark-border'
                }`}
              >
                <Maximize2 size={14} /> Métricas Geométricas
              </button>
              <button
                onClick={() => setActiveTab('spaces')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'spaces'
                    ? 'bg-brand-500 text-white shadow-md shadow-brand-500/20'
                    : 'bg-dark-card text-gray-400 hover:text-white border border-dark-border'
                }`}
              >
                <Layers size={14} /> Espacios & Zonas Funcionales ({intelligence.spacesCount})
              </button>
            </div>

            {/* Pestaña: Métricas Geométricas */}
            {activeTab === 'metrics' && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <Card className="p-3.5 bg-dark-surface border-dark-border text-center space-y-1">
                  <span className="text-[11px] text-gray-400 uppercase tracking-wider">Superficie Útil</span>
                  <p className="text-lg font-black text-white">{intelligence.totalUsableAreaM2} m²</p>
                  <p className="text-[10px] text-brand-400">Calculada sobre geometría interior</p>
                </Card>

                <Card className="p-3.5 bg-dark-surface border-dark-border text-center space-y-1">
                  <span className="text-[11px] text-gray-400 uppercase tracking-wider">Superficie Construida</span>
                  <p className="text-lg font-black text-sky-400">{intelligence.totalBuiltAreaM2} m²</p>
                  <p className="text-[10px] text-gray-400">Incluye particiones estimadas</p>
                </Card>

                <Card className="p-3.5 bg-dark-surface border-dark-border text-center space-y-1">
                  <span className="text-[11px] text-gray-400 uppercase tracking-wider">Volumen Interior</span>
                  <p className="text-lg font-black text-amber-400">{intelligence.totalVolumeM3} m³</p>
                  <p className="text-[10px] text-gray-400">Cómputo cúbico climatizable</p>
                </Card>

                <Card className="p-3.5 bg-dark-surface border-dark-border text-center space-y-1">
                  <span className="text-[11px] text-gray-400 uppercase tracking-wider">Huecos de Paso/Luz</span>
                  <p className="text-lg font-black text-emerald-400">{intelligence.totalOpeningsAreaM2} m²</p>
                  <p className="text-[10px] text-gray-400">Puertas y ventanas deducidas</p>
                </Card>
              </div>
            )}

            {/* Pestaña: Espacios & Zonas Funcionales */}
            {activeTab === 'spaces' && (
              <div className="space-y-4">
                {intelligence.spaces.length === 0 ? (
                  <div className="p-6 text-center bg-dark-surface border border-dashed border-dark-border rounded-xl space-y-2">
                    <Layers size={24} className="mx-auto text-gray-500" />
                    <p className="text-gray-400 font-medium">No se han definido Espacios Funcionales superiores aún.</p>
                    <p className="text-[11px] text-gray-500">
                      Las estancias tradicionales (Room) continúan activas en la vivienda. Puedes crear un Space para agrupar zonas como Open-Plan, Suites o Terrazas.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {intelligence.spaces.map((sp) => (
                      <Card key={sp.id} className="p-4 bg-dark-surface border-dark-border space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: sp.color || '#10b981' }}
                            />
                            <h4 className="font-bold text-white text-sm">{sp.name}</h4>
                            <span className="text-gray-400 text-xs">({sp.roomType || 'Espacio General'})</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-emerald-400">{sp.metrics.usableAreaM2.value} m²</span>
                            <button
                              onClick={() => setSelectedSpaceForZone(sp.id)}
                              className="p-1 rounded hover:bg-dark-hover text-brand-400 hover:text-brand-300"
                              title="Añadir Zona Funcional"
                            >
                              <Plus size={15} />
                            </button>
                            <button
                              onClick={() => handleDeleteSpace(sp.id)}
                              className="p-1 rounded hover:bg-dark-hover text-gray-400 hover:text-rose-400"
                              title="Eliminar Espacio"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </div>

                        {/* Zonas Funcionales */}
                        {sp.functionalZones && sp.functionalZones.length > 0 && (
                          <div className="pl-4 border-l-2 border-brand-500/30 space-y-1.5">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                              Zonas Funcionales Integradas:
                            </span>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {sp.functionalZones.map((fz) => (
                                <div
                                  key={fz.id}
                                  className="flex items-center justify-between p-2 rounded-lg bg-dark-card border border-dark-border/60 text-xs"
                                >
                                  <div>
                                    <span className="font-medium text-gray-200">{fz.name}</span>
                                    <span className="text-[10px] text-gray-400 ml-1.5">({fz.type})</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-gray-400">{fz.areaM2.value} m²</span>
                                    <button
                                      onClick={() => handleDeleteZone(fz.id)}
                                      className="text-gray-500 hover:text-rose-400"
                                    >
                                      <Trash2 size={12} />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        ) : null}

        <div className="flex justify-end pt-2">
          <Button variant="secondary" onClick={onClose}>
            {t('common.cancel', 'Cerrar')}
          </Button>
        </div>
      </div>

      {/* Modal Crear Espacio */}
      <Modal
        isOpen={isNewSpaceOpen}
        onClose={() => setIsNewSpaceOpen(false)}
        title="Crear Espacio Funcional (V10 / V11)"
        maxWidth="sm"
      >
        <form onSubmit={handleCreateSpace} className="space-y-4 text-xs">
          <div>
            <label className="block text-gray-300 font-semibold mb-1">Nombre del Espacio</label>
            <Input
              value={newSpaceName}
              onChange={(e) => setNewSpaceName(e.target.value)}
              placeholder="Ej. Espacio Diáfano Principal, Suite..."
              required
            />
          </div>
          <div>
            <label className="block text-gray-300 font-semibold mb-1">Tipo de Espacio</label>
            <select
              value={newSpaceType}
              onChange={(e) => setNewSpaceType(e.target.value)}
              className="w-full bg-dark-card border border-dark-border rounded-xl px-3 py-2 text-white"
            >
              <option value="OPEN_PLAN">Espacio Abierto / Open Plan</option>
              <option value="LIVING_AREA">Área Social</option>
              <option value="SUITE">Suite Principal</option>
              <option value="TERRACE">Exterior / Terraza</option>
              <option value="CIRCULATION">Distribuidor General</option>
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" type="button" onClick={() => setIsNewSpaceOpen(false)}>
              Cancelar
            </Button>
            <Button variant="primary" type="submit">
              Guardar Espacio
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Crear Zona Funcional */}
      <Modal
        isOpen={Boolean(selectedSpaceForZone)}
        onClose={() => setSelectedSpaceForZone('')}
        title="Añadir Zona Funcional al Espacio"
        maxWidth="sm"
      >
        <form onSubmit={handleCreateZone} className="space-y-4 text-xs">
          <div>
            <label className="block text-gray-300 font-semibold mb-1">Nombre de la Zona</label>
            <Input
              value={newZoneName}
              onChange={(e) => setNewZoneName(e.target.value)}
              placeholder="Ej. Rincón de Lectura, Comedor diario..."
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-300 font-semibold mb-1">Tipo de Uso</label>
              <select
                value={newZoneType}
                onChange={(e) => setNewZoneType(e.target.value as FunctionalZoneType)}
                className="w-full bg-dark-card border border-dark-border rounded-xl px-3 py-2 text-white"
              >
                <option value="LIVING">Salón</option>
                <option value="DINING">Comedor</option>
                <option value="KITCHEN">Cocina</option>
                <option value="BEDROOM">Dormitorio</option>
                <option value="BATHROOM">Baño</option>
                <option value="WORKSPACE">Trabajo / Estudio</option>
                <option value="CIRCULATION">Paso / Circulación</option>
                <option value="STORAGE">Almacenaje</option>
                <option value="TERRACE">Terraza</option>
                <option value="OTHER">Otro</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-300 font-semibold mb-1">Superficie Estimada (m²)</label>
              <Input
                type="number"
                step="0.5"
                min="0.5"
                value={newZoneArea}
                onChange={(e) => setNewZoneArea(parseFloat(e.target.value) || 0)}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" type="button" onClick={() => setSelectedSpaceForZone('')}>
              Cancelar
            </Button>
            <Button variant="primary" type="submit">
              Añadir Zona
            </Button>
          </div>
        </form>
      </Modal>
    </Modal>
  );
};
