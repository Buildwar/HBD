/**
 * HBD — HOME BOARD DESIGNER (V14.0.0)
 * MODAL DE PREVISUALIZACIÓN Y VISOR DOCUMENTAL
 * DOCUMENT PREVIEW MODAL
 *
 * Autor: Adrián Palma
 * Copyright: © 2026 Adrián Palma. Todos los derechos reservados.
 */

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FileText,
  Download,
  Printer,
  RefreshCw,
  ZoomIn,
  ZoomOut,
  Layers,
  CheckCircle,
  AlertTriangle,
  FileSpreadsheet,
  X,
} from 'lucide-react';
import { Modal } from '../../components/ui/Modal.js';
import { Button } from '../../components/ui/Button.js';
import { Badge } from '../../components/ui/Badge.js';
import { ProjectDocumentDto, DocumentSectionDto } from '@hbd/shared';
import { documentService } from '../../services/document.service.js';

interface DocumentPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: ProjectDocumentDto | null;
  onDocumentUpdated?: (updated: ProjectDocumentDto) => void;
}

export const DocumentPreviewModal: React.FC<DocumentPreviewModalProps> = ({
  isOpen,
  onClose,
  document,
  onDocumentUpdated,
}) => {
  const { t } = useTranslation();
  const [selectedSectionIndex, setSelectedSectionIndex] = useState<number>(0);
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [isRegenerating, setIsRegenerating] = useState<boolean>(false);

  if (!isOpen || !document) return null;

  const sections = (document.sections || []).filter((s) => s.isEnabled);
  const activeSection: DocumentSectionDto | undefined = sections[selectedSectionIndex];

  const handleExport = async (format: 'PDF' | 'JSON' | 'CSV') => {
    try {
      setIsExporting(true);
      const res = await documentService.exportDocument(document.id, { format });
      if (res.data) {
        if (format === 'PDF') {
          // Descargar PDF generado en base64
          const byteCharacters = atob(res.data.content);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          const blob = new Blob([byteArray], { type: 'text/html' });
          const url = URL.createObjectURL(blob);
          const a = window.document.createElement('a');
          a.href = url;
          a.download = res.data.filename.replace('.pdf', '.html'); // Vista imprimible HTML/PDF
          a.click();
          URL.revokeObjectURL(url);
        } else {
          const blob = new Blob([res.data.content], { type: res.data.contentType });
          const url = URL.createObjectURL(blob);
          const a = window.document.createElement('a');
          a.href = url;
          a.download = res.data.filename;
          a.click();
          URL.revokeObjectURL(url);
        }
      }
    } catch (err) {
      console.error('Error al exportar documento:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleRegenerate = async () => {
    try {
      setIsRegenerating(true);
      const res = await documentService.regenerateDocument(document.id);
      if (res.data && onDocumentUpdated) {
        onDocumentUpdated(res.data);
      }
    } catch (err) {
      console.error('Error al regenerar:', err);
    } finally {
      setIsRegenerating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Dossier: ${document.name} (v${document.version})`}
      description="Visualizador profesional de documentos, planos, mediciones y presupuestos."
    >
      <div className="space-y-4">
        {/* Barra superior de herramientas */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-dark-card border border-dark-border">
          <div className="flex items-center gap-2">
            <Badge variant="brand">{document.type}</Badge>
            <Badge variant="gray">v{document.version}</Badge>
            <Badge variant="gray">{document.pageSize} {document.orientation}</Badge>
            <Badge variant="success">{sections.length} Páginas</Badge>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center bg-dark-surface rounded-lg border border-dark-border px-2 py-1 gap-1.5 text-xs text-gray-300">
              <button
                onClick={() => setZoomLevel((z) => Math.max(75, z - 15))}
                className="hover:text-white p-0.5"
                title="Reducir zoom"
              >
                <ZoomOut size={14} />
              </button>
              <span className="font-mono">{zoomLevel}%</span>
              <button
                onClick={() => setZoomLevel((z) => Math.min(130, z + 15))}
                className="hover:text-white p-0.5"
                title="Aumentar zoom"
              >
                <ZoomIn size={14} />
              </button>
            </div>

            <Button
              size="sm"
              variant="secondary"
              icon={<RefreshCw size={14} className={isRegenerating ? 'animate-spin' : ''} />}
              onClick={handleRegenerate}
              disabled={isRegenerating}
            >
              {isRegenerating ? 'Regenerando...' : 'Actualizar'}
            </Button>

            <Button
              size="sm"
              variant="secondary"
              icon={<Printer size={14} />}
              onClick={handlePrint}
            >
              Imprimir
            </Button>

            <Button
              size="sm"
              variant="primary"
              icon={<Download size={14} />}
              onClick={() => handleExport('PDF')}
              disabled={isExporting}
            >
              {isExporting ? 'Exportando...' : 'Exportar PDF'}
            </Button>
          </div>
        </div>

        {/* Cuerpo del Visor con Índice Lateral y Hoja Central */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 min-h-[500px] max-h-[68vh]">
          {/* Índice de Capítulos */}
          <div className="md:col-span-1 p-3 rounded-xl bg-dark-card border border-dark-border overflow-y-auto space-y-1.5">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Layers size={14} /> Índice del Dossier
            </h4>
            {sections.map((sec, idx) => (
              <button
                key={sec.id}
                onClick={() => setSelectedSectionIndex(idx)}
                className={`w-full text-left p-2.5 rounded-lg text-xs transition-all flex items-start justify-between gap-2 ${
                  selectedSectionIndex === idx
                    ? 'bg-brand-500/20 text-brand-300 border border-brand-500/40 font-semibold'
                    : 'bg-dark-surface/60 text-gray-300 hover:bg-dark-surface hover:text-white border border-dark-border/40'
                }`}
              >
                <span className="truncate">
                  {idx + 1}. {sec.title}
                </span>
                {sec.status === 'WARNING' && <AlertTriangle size={12} className="text-amber-400 shrink-0 mt-0.5" />}
              </button>
            ))}

            <div className="pt-3 border-t border-dark-border/60 space-y-1.5">
              <p className="text-[11px] font-semibold text-gray-400">Formatos Adicionales:</p>
              <div className="flex gap-2">
                <button
                  onClick={() => handleExport('CSV')}
                  className="flex-1 py-1.5 px-2 rounded-lg bg-dark-surface hover:bg-dark-border text-[11px] text-gray-300 border border-dark-border flex items-center justify-center gap-1"
                >
                  <FileSpreadsheet size={12} /> CSV Mediciones
                </button>
                <button
                  onClick={() => handleExport('JSON')}
                  className="flex-1 py-1.5 px-2 rounded-lg bg-dark-surface hover:bg-dark-border text-[11px] text-gray-300 border border-dark-border flex items-center justify-center gap-1"
                >
                  <FileText size={12} /> JSON Completo
                </button>
              </div>
            </div>
          </div>

          {/* Hoja de Página Documental (Renderizado Visual Estilizado) */}
          <div className="md:col-span-3 p-6 rounded-xl bg-slate-950 border border-dark-border overflow-y-auto flex flex-col items-center">
            {activeSection ? (
              <div
                className="w-full max-w-2xl bg-white text-gray-900 rounded-lg shadow-2xl p-8 transition-all flex flex-col justify-between min-h-[580px]"
                style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
              >
                {/* Cabecera de Página */}
                {activeSection.type !== 'COVER' && (
                  <div className="flex items-center justify-between border-b border-gray-200 pb-3 text-xs text-gray-500 mb-6">
                    <span className="font-semibold text-gray-700">{document.name}</span>
                    <span className="font-mono">v{document.version}</span>
                  </div>
                )}

                {/* Contenido Dinámico de la Sección */}
                <div className="my-auto space-y-4">
                  <h3 className="text-xl font-bold text-gray-900 border-l-4 border-emerald-500 pl-3">
                    {activeSection.title}
                  </h3>

                  {activeSection.type === 'COVER' && (
                    <div className="text-center py-10 space-y-4">
                      <h1 className="text-3xl font-extrabold text-gray-900">{activeSection.contentData?.projectName}</h1>
                      <p className="text-base text-gray-600 font-medium">{activeSection.contentData?.scenarioName}</p>
                      <div className="w-24 h-1 bg-emerald-500 mx-auto rounded" />
                      <div className="pt-8 text-xs text-gray-500 space-y-1">
                        <p>Cliente: <strong className="text-gray-700">{activeSection.contentData?.clientName}</strong></p>
                        <p>Fecha de emisión: <strong className="text-gray-700">{activeSection.contentData?.generatedDate}</strong></p>
                        <p>Autor: <strong className="text-gray-700">{activeSection.contentData?.author}</strong></p>
                      </div>
                    </div>
                  )}

                  {activeSection.type === 'PROJECT_SUMMARY' && (
                    <div className="space-y-3 text-xs">
                      <p className="text-gray-700 leading-relaxed">{activeSection.contentData?.description}</p>
                      <div className="grid grid-cols-2 gap-3 pt-2">
                        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                          <span className="text-gray-500">Superficie Útil:</span>
                          <p className="text-lg font-bold text-gray-900">{activeSection.contentData?.totalUsableAreaM2} m²</p>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                          <span className="text-gray-500">Estancias Principales:</span>
                          <p className="text-lg font-bold text-gray-900">{activeSection.contentData?.totalRooms}</p>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                          <span className="text-gray-500">Mobiliario Registrado:</span>
                          <p className="text-lg font-bold text-gray-900">{activeSection.contentData?.totalFurniture} elementos</p>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                          <span className="text-gray-500">Presupuesto Estimado:</span>
                          <p className="text-lg font-bold text-emerald-600">{activeSection.contentData?.estimatedCostEur} €</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeSection.type === 'MEASUREMENTS' && (
                    <div className="space-y-3 text-xs">
                      <p className="text-gray-600">
                        Superficie Útil: <strong>{activeSection.contentData?.usableAreaM2} m²</strong> | Construida: <strong>{activeSection.contentData?.builtAreaM2} m²</strong>
                      </p>
                      <table className="w-full border-collapse border border-gray-200 text-left">
                        <thead className="bg-gray-50 text-gray-700 font-semibold">
                          <tr>
                            <th className="p-2 border border-gray-200">Estancia</th>
                            <th className="p-2 border border-gray-200">Sup. Útil</th>
                            <th className="p-2 border border-gray-200">Altura</th>
                            <th className="p-2 border border-gray-200">Rodapié</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(activeSection.contentData?.tableByRoom || []).map((r: any, i: number) => (
                            <tr key={i} className="hover:bg-gray-50">
                              <td className="p-2 border border-gray-200 font-medium">{r.name}</td>
                              <td className="p-2 border border-gray-200">{r.usableAreaM2} m²</td>
                              <td className="p-2 border border-gray-200">{r.heightM} m</td>
                              <td className="p-2 border border-gray-200">{r.skirtingM} m</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {activeSection.type === 'BUDGET' && (
                    <div className="space-y-3 text-xs">
                      <p className="text-gray-700 font-semibold">Presupuesto Estimado de Ejecución Material:</p>
                      <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 flex justify-between items-center">
                        <span className="text-emerald-900 font-bold">TOTAL ESTIMADO (Sin IVA):</span>
                        <span className="text-2xl font-black text-emerald-700">{activeSection.contentData?.totalEstimatedCostEur} €</span>
                      </div>
                      <div className="space-y-1.5 pt-2">
                        <div className="flex justify-between py-1 border-b border-gray-200">
                          <span className="text-gray-600">Materiales y Suministros</span>
                          <span className="font-semibold">{activeSection.contentData?.materialsCostEur} €</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-gray-200">
                          <span className="text-gray-600">Mano de Obra Especializada</span>
                          <span className="font-semibold">{activeSection.contentData?.laborCostEur} €</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-gray-200">
                          <span className="text-gray-600">Otros Trabajos y Gestión de Residuos</span>
                          <span className="font-semibold">{activeSection.contentData?.otherCostEur} €</span>
                        </div>
                      </div>
                      <p className="text-[11px] text-amber-700 bg-amber-50 p-2.5 rounded-lg border border-amber-200 mt-3">
                        {activeSection.contentData?.notice}
                      </p>
                    </div>
                  )}

                  {activeSection.type === 'VALIDATIONS' && (
                    <div className="space-y-3 text-xs">
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <span className="font-medium text-gray-700">Puntuación Global de Cumplimiento:</span>
                        <span className="text-lg font-bold text-emerald-600">{activeSection.contentData?.complianceScore} / 100</span>
                      </div>
                      <div className="space-y-2">
                        {(activeSection.contentData?.rulesSummary || []).map((r: any, idx: number) => (
                          <div key={idx} className="p-2 rounded border border-gray-200 flex items-center justify-between gap-2">
                            <span className="font-medium text-gray-800">{r.rule}</span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">{r.status}</span>
                          </div>
                        ))}
                      </div>
                      <p className="text-[11px] text-gray-600 bg-gray-100 p-2.5 rounded-lg border border-gray-200 mt-2">
                        {activeSection.contentData?.proValidationNotice}
                      </p>
                    </div>
                  )}

                  {activeSection.type === 'DISCLAIMER' && (
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-2 text-xs text-gray-600 leading-relaxed">
                      <h4 className="font-bold text-gray-900">{activeSection.contentData?.title}</h4>
                      <p>{activeSection.contentData?.noticeText}</p>
                      <p className="pt-2 text-[11px] text-gray-400">© 2026 {activeSection.contentData?.author} — Home Board Designer</p>
                    </div>
                  )}
                </div>

                {/* Pie de Página */}
                {activeSection.type !== 'COVER' && (
                  <div className="flex items-center justify-between border-t border-gray-200 pt-3 text-[10px] text-gray-400 mt-6">
                    <span>© 2026 Adrián Palma — HBD</span>
                    <span>Página {selectedSectionIndex + 1} de {sections.length}</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-gray-400 text-xs py-20 text-center">
                Selecciona un capítulo del índice para visualizar su contenido.
              </div>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};
