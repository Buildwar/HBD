import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  FileText,
  Printer,
  AlertTriangle,
  Building,
  CheckCircle2,
  Download,
} from 'lucide-react';
import { ConstructionReportDto } from '@hbd/shared';
import { Modal } from '../../components/ui/Modal.js';
import { Button } from '../../components/ui/Button.js';

interface ConstructionReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: ConstructionReportDto | null;
}

export const ConstructionReportModal: React.FC<ConstructionReportModalProps> = ({
  isOpen,
  onClose,
  report,
}) => {
  const { t } = useTranslation();

  if (!isOpen || !report) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Informe Técnico de Obra y Reforma (HBD)"
      maxWidth="xl"
    >
      <div className="space-y-6 text-xs text-gray-300">
        {/* Encabezado del Informe */}
        <div className="p-4 rounded-xl bg-dark-card border border-dark-border flex items-center justify-between">
          <div>
            <h2 className="text-base font-extrabold text-white">{report.projectName}</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {report.projectAddress || 'Ubicación no especificada'} • Generado el {new Date(report.generatedAt).toLocaleDateString()}
            </p>
          </div>
          <Button variant="outline" size="sm" icon={<Printer size={15} />} onClick={handlePrint}>
            Imprimir Informe
          </Button>
        </div>

        {/* Resumen Económico */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-center">
          <div className="p-3 rounded-xl bg-dark-card border border-dark-border">
            <span className="text-[11px] text-gray-400">Materiales (con mermas)</span>
            <p className="text-base font-bold text-white mt-1">
              {report.budgetSummary.totalMaterial.toFixed(2)} €
            </p>
          </div>
          <div className="p-3 rounded-xl bg-dark-card border border-dark-border">
            <span className="text-[11px] text-gray-400">Mano de Obra</span>
            <p className="text-base font-bold text-white mt-1">
              {report.budgetSummary.totalLabor.toFixed(2)} €
            </p>
          </div>
          <div className="p-3 rounded-xl bg-dark-card border border-dark-border">
            <span className="text-[11px] text-gray-400">Otros Costes</span>
            <p className="text-base font-bold text-white mt-1">
              {report.budgetSummary.totalOther.toFixed(2)} €
            </p>
          </div>
          <div className="p-3 rounded-xl bg-brand-500/10 border border-brand-500/30">
            <span className="text-[11px] text-brand-400 font-semibold">Presupuesto Estimado</span>
            <p className="text-base font-extrabold text-brand-400 mt-1">
              {report.budgetSummary.grandTotal.toFixed(2)} €
            </p>
          </div>
        </div>

        {/* Resumen de Fases y Tareas */}
        <div className="space-y-2">
          <h3 className="font-bold text-white uppercase tracking-wider text-xs">
            Planificación Temporal por Fases
          </h3>
          <div className="space-y-1.5">
            {report.phasesSummary.map((ph, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-lg bg-dark-surface border border-dark-border/60 flex items-center justify-between"
              >
                <div>
                  <span className="font-semibold text-white">{ph.name}</span>
                  <span className="text-gray-400 ml-2">({ph.durationDays} días estimados)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-400">
                    {ph.completedCount}/{ph.taskCount} tareas completadas
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Descargo Legal y Advertencia Técnica Obligatoria */}
        <div className="p-4 rounded-xl bg-dark-card border border-amber-500/30 space-y-2">
          <div className="flex items-center gap-2 text-amber-400 font-bold">
            <AlertTriangle size={16} />
            <span>Cláusula de Responsabilidad Técnica y Validación Profesional</span>
          </div>
          <p className="text-[11px] text-gray-400 leading-relaxed">
            {report.legalDisclaimer}
          </p>
        </div>

        <div className="flex justify-end pt-2">
          <Button variant="secondary" onClick={onClose}>
            Cerrar
          </Button>
        </div>
      </div>
    </Modal>
  );
};
