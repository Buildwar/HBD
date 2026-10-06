import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ShieldCheck,
  Plus,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileCheck2,
} from 'lucide-react';
import {
  ExecutionProjectDto,
  QualityInspectionDto,
  InspectionResult,
} from '@hbd/shared';
import { Card } from '../../components/ui/Card.js';
import { Badge } from '../../components/ui/Badge.js';
import { Button } from '../../components/ui/Button.js';
import { Modal } from '../../components/ui/Modal.js';
import { Input } from '../../components/ui/Input.js';

interface ExecutionQualityTabProps {
  execution: ExecutionProjectDto;
  onCreateInspection: (data: Partial<QualityInspectionDto>) => Promise<void>;
}

export const ExecutionQualityTab: React.FC<ExecutionQualityTabProps> = ({
  execution,
  onCreateInspection,
}) => {
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [element, setElement] = useState<string>('');
  const [phaseName, setPhaseName] = useState<string>('');
  const [result, setResult] = useState<InspectionResult>('PASS');
  const [inspectorName, setInspectorName] = useState<string>('');
  const [observations, setObservations] = useState<string>('');

  const getResultBadge = (res: InspectionResult) => {
    switch (res) {
      case 'PASS':
        return <Badge variant="brand">APTO (PASS)</Badge>;
      case 'WARNING':
        return <Badge variant="warning">CON ADVERTENCIAS</Badge>;
      case 'FAIL':
        return <Badge variant="danger">NO APTO (FAIL)</Badge>;
      default:
        return <Badge variant="gray">SIN INSPECCIONAR</Badge>;
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!element.trim()) return;

    await onCreateInspection({
      element,
      phaseName: phaseName || null,
      result,
      inspectorName: inspectorName || 'Inspector Técnico HBD',
      observations: observations || null,
      inspectionDate: new Date().toISOString(),
    });

    setIsModalOpen(false);
    setElement('');
    setPhaseName('');
    setObservations('');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-white">
            {t('execution.quality.title', 'Control de Calidad e Inspecciones Técnicas')}
          </h3>
          <p className="text-xs text-gray-400">
            Registro formal de controles de ejecución, ensayos de estanqueidad, planimetría y acabados.
          </p>
        </div>

        <Button
          size="sm"
          variant="primary"
          icon={<Plus size={15} />}
          onClick={() => setIsModalOpen(true)}
        >
          Nueva Inspección
        </Button>
      </div>

      <div className="space-y-3">
        {execution.inspections.length === 0 ? (
          <Card className="p-8 text-center bg-dark-surface border-dark-border">
            <FileCheck2 size={32} className="mx-auto text-gray-500 mb-2" />
            <p className="text-xs text-gray-400">
              No se han registrado inspecciones técnicas de calidad todavía.
            </p>
          </Card>
        ) : (
          execution.inspections.map((ins) => (
            <Card key={ins.id} className="p-4 bg-dark-surface border-dark-border space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-dark-border/60 pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white">{ins.element}</span>
                  {ins.phaseName && <Badge variant="gray">{ins.phaseName}</Badge>}
                </div>
                <div>{getResultBadge(ins.result)}</div>
              </div>

              {ins.observations && (
                <p className="text-xs text-gray-300">{ins.observations}</p>
              )}

              <div className="flex items-center justify-between text-[11px] text-gray-400 pt-1">
                <span>Inspector: <strong>{ins.inspectorName}</strong></span>
                <span>Fecha: {ins.inspectionDate.split('T')[0]}</span>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Modal Nueva Inspección */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Registrar Inspección Técnica de Calidad"
        maxWidth="md"
      >
        <form onSubmit={handleCreate} className="space-y-4 text-xs">
          <div>
            <label className="block text-gray-300 font-semibold mb-1">Elemento / Partida Inspeccionada</label>
            <Input
              value={element}
              onChange={(e) => setElement(e.target.value)}
              placeholder="Ej. Estanqueidad tuberías baño, Planimetría solera salón, Aplomado tabiques..."
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-300 font-semibold mb-1">Fase Relacionada</label>
              <Input
                value={phaseName}
                onChange={(e) => setPhaseName(e.target.value)}
                placeholder="Ej. Fontanería, Albañilería, Acabados..."
              />
            </div>

            <div>
              <label className="block text-gray-300 font-semibold mb-1">Resultado de la Inspección</label>
              <select
                value={result}
                onChange={(e) => setResult(e.target.value as InspectionResult)}
                className="w-full bg-dark-card border border-dark-border rounded-xl px-3 py-2 text-white"
              >
                <option value="PASS">APTO (PASS) — Sin defectos</option>
                <option value="WARNING">CON ADVERTENCIAS — Defectos menores subsanables</option>
                <option value="FAIL">NO APTO (FAIL) — Requiere demolición o rehacer</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-gray-300 font-semibold mb-1">Nombre del Técnico / Inspector</label>
            <Input
              value={inspectorName}
              onChange={(e) => setInspectorName(e.target.value)}
              placeholder="Ej. Adrián Palma (Director de Obra)"
            />
          </div>

          <div>
            <label className="block text-gray-300 font-semibold mb-1">Observaciones Técnicas y Ensayos</label>
            <textarea
              rows={3}
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              placeholder="Detalla los ensayos realizados (presión en bares, nivel láser, tolerancia en mm)..."
              className="w-full bg-dark-card border border-dark-border rounded-xl px-3 py-2 text-white focus:ring-1 focus:ring-brand-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" type="button" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button variant="primary" type="submit">
              Guardar Inspección
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
