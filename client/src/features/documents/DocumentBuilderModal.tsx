/**
 * HBD — HOME BOARD DESIGNER (V14.0.0)
 * MODAL CONFIGURADOR Y CREADOR DE DOCUMENTOS
 * DOCUMENT BUILDER MODAL
 *
 * Autor: Adrián Palma
 * Copyright: © 2026 Adrián Palma. Todos los derechos reservados.
 */

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FileText,
  Layers,
  Sparkles,
  Plus,
  Check,
  ChevronDown,
  ChevronUp,
  Settings2,
  GitFork,
} from 'lucide-react';
import { Modal } from '../../components/ui/Modal.js';
import { Button } from '../../components/ui/Button.js';
import { Input } from '../../components/ui/Input.js';
import { Badge } from '../../components/ui/Badge.js';
import {
  DocumentTemplateDto,
  DocumentSectionConfig,
  DocumentType,
  DocumentOrientation,
  DocumentPageSize,
  ProjectDocumentDto,
} from '@hbd/shared';
import { documentService } from '../../services/document.service.js';
import { scenarioService } from '../../services/scenario.service.js';

interface DocumentBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  onDocumentCreated?: (doc: ProjectDocumentDto) => void;
}

export const DocumentBuilderModal: React.FC<DocumentBuilderModalProps> = ({
  isOpen,
  onClose,
  projectId,
  onDocumentCreated,
}) => {
  const { t } = useTranslation();
  const [templates, setTemplates] = useState<DocumentTemplateDto[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('template-standard-project');
  const [scenarios, setScenarios] = useState<any[]>([]);
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('');

  const [documentName, setDocumentName] = useState<string>('Dossier de Proyecto');
  const [clientName, setClientName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [language, setLanguage] = useState<string>('es');
  const [orientation, setOrientation] = useState<DocumentOrientation>('PORTRAIT');
  const [pageSize, setPageSize] = useState<DocumentPageSize>('A4');

  const [sections, setSections] = useState<DocumentSectionConfig[]>([]);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      loadInitialData();
    }
  }, [isOpen, projectId]);

  const loadInitialData = async () => {
    try {
      const [tplRes, scRes] = await Promise.all([
        documentService.getTemplates(),
        scenarioService.getScenariosByProject(projectId).then((data) => ({ data })).catch(() => ({ data: [] })),
      ]);

      if (tplRes.data) {
        setTemplates(tplRes.data);
        const defaultTpl = tplRes.data[0];
        if (defaultTpl) {
          setSelectedTemplateId(defaultTpl.id);
          setSections(defaultTpl.sectionsConfig || []);
          setOrientation(defaultTpl.defaultOrientation || 'PORTRAIT');
          setPageSize(defaultTpl.defaultPageSize || 'A4');
        }
      }

      if (scRes.data) {
        setScenarios(scRes.data);
      }
    } catch (err) {
      console.error('Error al cargar datos del creador de documentos:', err);
    }
  };

  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplateId(templateId);
    const selected = templates.find((t) => t.id === templateId);
    if (selected) {
      setSections(selected.sectionsConfig || []);
      setOrientation(selected.defaultOrientation);
      setPageSize(selected.defaultPageSize);
      setDocumentName(selected.name);
    }
  };

  const toggleSection = (index: number) => {
    setSections((prev) =>
      prev.map((s, idx) => (idx === index ? { ...s, isEnabled: !s.isEnabled } : s))
    );
  };

  const moveSection = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sections.length) return;

    setSections((prev) => {
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[targetIndex];
      copy[targetIndex] = temp;
      return copy.map((s, idx) => ({ ...s, order: idx + 1 }));
    });
  };

  const handleCreateDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!documentName.trim()) return;

    try {
      setIsGenerating(true);
      const res = await documentService.createDocument(projectId, {
        projectId,
        templateId: selectedTemplateId,
        scenarioId: selectedScenarioId || null,
        name: documentName,
        description,
        language,
        orientation,
        pageSize,
        customSections: sections,
        metadata: {
          clientName: clientName || undefined,
        },
      });

      if (res.data) {
        if (onDocumentCreated) onDocumentCreated(res.data);
        onClose();
      }
    } catch (err) {
      console.error('Error al generar documento:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Nuevo Dossier o Documento Profesional"
      description="Selecciona una plantilla o personaliza los capítulos y capítulos del documento."
    >
      <form onSubmit={handleCreateDocument} className="space-y-5">
        {/* Selector de Plantilla */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider">
            Plantilla Base
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {templates.map((tpl) => (
              <button
                key={tpl.id}
                type="button"
                onClick={() => handleTemplateChange(tpl.id)}
                className={`p-3 rounded-xl text-left transition-all border ${
                  selectedTemplateId === tpl.id
                    ? 'bg-brand-500/20 border-brand-500 text-white'
                    : 'bg-dark-card border-dark-border text-gray-300 hover:bg-dark-surface'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-white">{tpl.name}</span>
                  {selectedTemplateId === tpl.id && <Check size={14} className="text-brand-400" />}
                </div>
                <p className="text-[11px] text-gray-400 mt-1 line-clamp-2">{tpl.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Datos Básicos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Título del Documento"
            placeholder="Ej. Dossier Ejecutivo Reforma 2026"
            value={documentName}
            onChange={(e) => setDocumentName(e.target.value)}
            required
          />

          <Input
            label="Nombre del Cliente"
            placeholder="Ej. Familia Gómez / Inversiones SL"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
          />
        </div>

        {/* Escenario y Formato */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="space-y-1">
            <label className="text-xs text-gray-300">Escenario Base:</label>
            <select
              value={selectedScenarioId}
              onChange={(e) => setSelectedScenarioId(e.target.value)}
              className="w-full bg-dark-card border border-dark-border rounded-xl px-3 py-2 text-xs text-gray-200 focus:outline-none focus:border-brand-500"
            >
              <option value="">Estado Actual / Planta Activa</option>
              {scenarios.map((sc) => (
                <option key={sc.id} value={sc.id}>
                  {sc.name} ({sc.type})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-gray-300">Orientación:</label>
            <select
              value={orientation}
              onChange={(e) => setOrientation(e.target.value as DocumentOrientation)}
              className="w-full bg-dark-card border border-dark-border rounded-xl px-3 py-2 text-xs text-gray-200 focus:outline-none focus:border-brand-500"
            >
              <option value="PORTRAIT">Vertical (Retrato)</option>
              <option value="LANDSCAPE">Horizontal (Apaisado)</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-gray-300">Formato de Página:</label>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(e.target.value as DocumentPageSize)}
              className="w-full bg-dark-card border border-dark-border rounded-xl px-3 py-2 text-xs text-gray-200 focus:outline-none focus:border-brand-500"
            >
              <option value="A4">A4 Estándar</option>
              <option value="A3">A3 Planos / Gran Formato</option>
            </select>
          </div>
        </div>

        {/* Capítulos y Secciones Configurables */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
              <Layers size={14} /> Capítulos y Secciones ({sections.filter((s) => s.isEnabled).length} Activas)
            </label>
            <span className="text-[11px] text-gray-400">Activa, desactiva o reordena los capítulos</span>
          </div>

          <div className="max-h-52 overflow-y-auto space-y-1.5 p-2 rounded-xl bg-dark-card border border-dark-border">
            {sections.map((sec, idx) => (
              <div
                key={idx}
                className={`flex items-center justify-between p-2 rounded-lg text-xs border transition-all ${
                  sec.isEnabled
                    ? 'bg-dark-surface border-dark-border text-gray-200'
                    : 'bg-dark-surface/40 border-dark-border/40 text-gray-500 line-through'
                }`}
              >
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={sec.isEnabled}
                    onChange={() => toggleSection(idx)}
                    className="rounded border-dark-border bg-dark-card text-brand-500 focus:ring-0"
                  />
                  <span>
                    {idx + 1}. {sec.title}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => moveSection(idx, 'up')}
                    disabled={idx === 0}
                    className="p-1 text-gray-400 hover:text-white disabled:opacity-30"
                  >
                    <ChevronUp size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveSection(idx, 'down')}
                    disabled={idx === sections.length - 1}
                    className="p-1 text-gray-400 hover:text-white disabled:opacity-30"
                  >
                    <ChevronDown size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-dark-border/60">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="primary"
            icon={<Sparkles size={16} />}
            disabled={isGenerating}
          >
            {isGenerating ? 'Compilando Dossier...' : 'Generar Documento'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
