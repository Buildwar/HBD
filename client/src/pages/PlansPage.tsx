import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  FileSpreadsheet,
  Upload,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Layers,
  FileText,
  Sliders,
  Play,
  RotateCcw,
} from 'lucide-react';
import { Navbar } from '../components/layout/Navbar.js';
import { Card } from '../components/ui/Card.js';
import { Button } from '../components/ui/Button.js';
import { Badge } from '../components/ui/Badge.js';
import { projectService } from '../services/project.service.js';
import { floorplanService, FloorPlanAnalysisData } from '../services/floorplan.service.js';
import { FloorplanEditor2D } from '../components/editor2d/FloorplanEditor2D.js';

export const PlansPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [selectedFloorId, setSelectedFloorId] = useState<string>('');
  const [currentProject, setCurrentProject] = useState<any>(null);

  // Upload & Analysis State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [currentPlan, setCurrentPlan] = useState<any>(null);
  const [analysisResult, setAnalysisResult] = useState<FloorPlanAnalysisData | null>(null);

  // Editor Mode State
  const [editorMode, setEditorMode] = useState<boolean>(false);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const res = await projectService.getProjects();
      if (res.data && res.data.length > 0) {
        setProjects(res.data);
        const initialProjId = searchParams.get('projectId') || res.data[0].id;
        setSelectedProjectId(initialProjId);
        loadProjectDetails(initialProjId);
      }
    } catch (err) {
      console.error('Error loading projects:', err);
    }
  };

  const loadProjectDetails = async (projId: string) => {
    try {
      const res = await projectService.getProjectById(projId);
      if (res.data) {
        setCurrentProject(res.data);
        if (res.data.floors && res.data.floors.length > 0) {
          const floor = res.data.floors[0];
          setSelectedFloorId(floor.id);
          if (floor.floorPlans && floor.floorPlans.length > 0) {
            const plan = floor.floorPlans[0];
            setCurrentPlan(plan);
            if (plan.analysisData) {
              setAnalysisResult(plan.analysisData);
            }
          }
        }
      }
    } catch (err) {
      console.error('Error loading project details:', err);
    }
  };

  const handleSelectProject = (projectId: string) => {
    setSelectedProjectId(projectId);
    loadProjectDetails(projectId);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUploadAndAnalyze = async () => {
    if (!selectedProjectId || !selectedFloorId) return;

    try {
      setIsUploading(true);
      let planRecord = currentPlan;

      // 1. Upload file if selected
      if (selectedFile) {
        const uploadRes = await floorplanService.uploadPlan(selectedProjectId, selectedFloorId, selectedFile);
        planRecord = uploadRes.data;
        setCurrentPlan(planRecord);
      }

      if (!planRecord) {
        // Fallback: If no file uploaded, generate demo plan analysis
        const fakeFile = new File(['%PDF-1.4 demo'], 'plano-residencial-demo.pdf', { type: 'application/pdf' });
        const uploadRes = await floorplanService.uploadPlan(selectedProjectId, selectedFloorId, fakeFile);
        planRecord = uploadRes.data;
        setCurrentPlan(planRecord);
      }

      // 2. Run analysis
      setIsUploading(false);
      setIsAnalyzing(true);

      const analyzeRes = await floorplanService.analyzePlan(planRecord.id);
      if (analyzeRes.success) {
        setAnalysisResult(analyzeRes.data.analysis);
        setCurrentPlan(analyzeRes.data.floorPlan);
        setEditorMode(true);
      }
    } catch (err) {
      console.error('Error in upload & analyze pipeline:', err);
    } finally {
      setIsUploading(false);
      setIsAnalyzing(false);
    }
  };

  const currentFloor = currentProject?.floors?.find((f: any) => f.id === selectedFloorId) || null;

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <Navbar
        title={t('plans.title', 'Motor de Planos Arquitectónicos')}
        subtitle={t('plans.subtitle', 'Importación, cálculo geométrico con IA desacoplada y editor 2D')}
        actions={
          <div className="flex items-center gap-2">
            {editorMode && (
              <Button
                variant="outline"
                size="sm"
                icon={<RotateCcw size={15} />}
                onClick={() => setEditorMode(false)}
              >
                {t('plans.backToSelection', 'Volver a Selección')}
              </Button>
            )}
            <Button
              variant="secondary"
              size="sm"
              icon={<ArrowLeft size={16} />}
              onClick={() => navigate('/dashboard')}
            >
              {t('common.back')}
            </Button>
          </div>
        }
      />

      <div className="p-6 max-w-7xl mx-auto w-full space-y-6 flex-1 flex flex-col">
        {/* Top Controls: Project & Floor Selector */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-dark-surface border border-dark-border">
          <div className="flex items-center gap-3">
            <div>
              <label className="text-[10px] font-semibold text-gray-400 block mb-1">{t('plans.projectLabel', 'Proyecto:')}</label>
              <select
                value={selectedProjectId}
                onChange={(e) => handleSelectProject(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-dark-card border border-dark-border text-xs text-white focus:outline-none focus:border-brand-500"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            {currentProject?.floors && (
              <div>
                <label className="text-[10px] font-semibold text-gray-400 block mb-1">{t('plans.floorLabel', 'Planta:')}</label>
                <select
                  value={selectedFloorId}
                  onChange={(e) => setSelectedFloorId(e.target.value)}
                  className="px-3 py-1.5 rounded-xl bg-dark-card border border-dark-border text-xs text-white focus:outline-none focus:border-brand-500"
                >
                  {currentProject.floors.map((f: any) => (
                    <option key={f.id} value={f.id}>
                      {f.name} {t('plans.level', { level: f.level, defaultValue: `(Nivel ${f.level})` })}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="brand">{t('plans.geometryEngine', 'Motor Geométrico')}</Badge>
            {currentPlan && (
              <Badge variant={currentPlan.status === 'VALIDATED' ? 'success' : 'brand'}>
                {t('plans.statusLabel', 'Estado:')} {currentPlan.status}
              </Badge>
            )}
          </div>
        </div>

        {/* Mode 1: Interactive 2D Editor */}
        {editorMode && currentFloor ? (
          <div className="flex-1 flex flex-col min-h-[650px]">
            <FloorplanEditor2D
              floorId={currentFloor.id}
              planId={currentPlan?.id}
              initialPlanUrl={currentPlan?.fileUrl || null}
              initialScaleFactor={currentPlan?.scaleFactor || 100}
              initialWalls={currentFloor.walls || analysisResult?.walls || []}
              initialRooms={currentFloor.rooms || analysisResult?.rooms || []}
              initialDoors={currentFloor.doors || analysisResult?.doors || []}
              initialWindows={currentFloor.windows || analysisResult?.windows || []}
              initialMeasurements={currentFloor.measurements || []}
              analysisData={analysisResult}
              onAnalysisConfirmed={() => {
                loadProjectDetails(selectedProjectId);
              }}
            />
          </div>
        ) : (
          /* Mode 2: Upload & Analysis Pipeline Hub */
          <div className="space-y-6">
            {/* Banner */}
            <div className="p-4 rounded-2xl bg-brand-500/10 border border-brand-500/30 flex items-start gap-3.5">
              <div className="w-8 h-8 rounded-xl bg-brand-500/20 text-brand-400 flex items-center justify-center shrink-0 mt-0.5">
                <Sparkles size={18} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-white">{t('plans.bannerTitle', 'Pipeline de Digitalización Arquitectónica')}</h4>
                  <Badge variant="brand">{t('plans.activeBadge', 'Activo')}</Badge>
                </div>
                <p className="text-xs text-gray-300 mt-1 leading-relaxed">
                  {t('plans.bannerDesc', 'El motor interpreta planos en PDF o imagen rasterizada, identifica paredes maestras y tabiques, calcula polígonos de habitaciones con la fórmula de Gauss/Shoelace para obtener superficies exactas en m², ubica puertas y ventanas, y ofrece calibración de escala precisa.')}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Upload Card */}
              <Card className="flex flex-col justify-between p-6 border-dashed border-2 border-dark-border hover:border-brand-500/60 transition-colors">
                <div className="text-center py-6 space-y-3">
                  <div className="w-14 h-14 rounded-2xl bg-dark-card border border-dark-border flex items-center justify-center text-brand-400 mx-auto">
                    <Upload size={24} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">{t('plans.uploadTitle', 'Cargar Plano de Vivienda')}</h4>
                    <p className="text-xs text-gray-400 mt-1">
                      {t('plans.uploadDesc', 'Formatos soportados: PDF arquitectónico, PNG, JPG, JPEG (hasta 50 MB)')}
                    </p>
                  </div>

                  <input
                    type="file"
                    id="planFileInput"
                    accept=".pdf,image/png,image/jpeg,image/jpg"
                    onChange={handleFileChange}
                    className="hidden"
                  />

                  {selectedFile ? (
                    <div className="p-3 rounded-xl bg-brand-500/10 border border-brand-500/30 text-xs text-brand-300 flex items-center justify-center gap-2">
                      <FileText size={15} />
                      <span className="font-semibold">{selectedFile.name}</span>
                      <span>({Math.round(selectedFile.size / 1024)} KB)</span>
                    </div>
                  ) : (
                    <label
                      htmlFor="planFileInput"
                      className="inline-block px-4 py-2 rounded-xl text-xs font-semibold bg-dark-card hover:bg-dark-card/80 text-gray-200 border border-dark-border cursor-pointer transition-colors"
                    >
                      {t('plans.selectLocalFile', 'Seleccionar Archivo Local')}
                    </label>
                  )}
                </div>

                <div className="space-y-2 pt-4">
                  <Button
                    variant="primary"
                    className="w-full"
                    icon={<Play size={16} />}
                    onClick={handleUploadAndAnalyze}
                    disabled={isUploading || isAnalyzing}
                  >
                    {isUploading
                      ? t('plans.uploading', 'Subiendo archivo...')
                      : isAnalyzing
                      ? t('plans.analyzing', 'Analizando geometría con IA...')
                      : selectedFile
                      ? t('plans.uploadAndAnalyze', 'Subir y Analizar Plano')
                      : t('plans.runTestAnalysis', 'Ejecutar Análisis con Caso de Prueba')}
                  </Button>

                  {currentPlan && (
                    <Button
                      variant="secondary"
                      className="w-full"
                      onClick={() => setEditorMode(true)}
                    >
                      {t('plans.openEditor2D', 'Abrir Editor 2D Directamente')}
                    </Button>
                  )}
                </div>
              </Card>

              {/* Pipeline Highlights */}
              <Card className="p-6 space-y-4">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-brand-400" />
                  {t('plans.modulesTitle', 'Módulos de Análisis')}
                </h4>
                <div className="space-y-3 text-xs text-gray-300">
                  <div className="p-2.5 rounded-xl bg-dark-card/60 border border-dark-border/60">
                    <span className="font-bold text-white block mb-0.5">{t('plans.module1Title', '1. Ingestión & Document Parser')}</span>
                    <span className="text-gray-400">{t('plans.module1Desc', 'Extracción de metadatos, soporte multiformato PDF/Raster y normalización de resolución.')}</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-dark-card/60 border border-dark-border/60">
                    <span className="font-bold text-white block mb-0.5">{t('plans.module2Title', '2. Detector de Escala & Calibración')}</span>
                    <span className="text-gray-400">{t('plans.module2Desc', 'Lectura de ratio arquitectónico (1:50, 1:100) y calibración manual precisa por 2 puntos de referencia.')}</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-dark-card/60 border border-dark-border/60">
                    <span className="font-bold text-white block mb-0.5">{t('plans.module3Title', '3. Detección de Paredes, Puertas & Ventanas')}</span>
                    <span className="text-gray-400">{t('plans.module3Desc', 'Clasificación de muros exteriores vs tabiques interiores, vanos y sentidos de apertura.')}</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-dark-card/60 border border-dark-border/60">
                    <span className="font-bold text-white block mb-0.5">{t('plans.module4Title', '4. Motor de Geometría (Shoelace m²)')}</span>
                    <span className="text-gray-400">{t('plans.module4Desc', 'Cálculo matemático exacto de superficies cerradas y validación de niveles de confianza.')}</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
