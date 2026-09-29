/**
 * HBD — HOME BOARD DESIGNER (V8.0.0)
 * AICopilotBar — Asistente Copilot Flotante de Diseño con IA
 * Autor Oficial: Adrián Palma
 * Copyright: © 2026 Adrián Palma — HBD (Home Board Designer)
 */

import React, { useState } from 'react';
import {
  Sparkles,
  Send,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  X,
  Wand2,
  Check,
} from 'lucide-react';
import { AICopilotCommandResponse } from '@hbd/shared';
import { aiDesignService } from '../../services/aiDesign.service.js';
import { Button } from '../../components/ui/Button.js';
import { Badge } from '../../components/ui/Badge.js';

interface AICopilotBarProps {
  projectId: string;
  floorId: string;
  targetRoomId?: string;
  onActionApplied?: () => void;
}

export const AICopilotBar: React.FC<AICopilotBarProps> = ({
  projectId,
  floorId,
  targetRoomId,
  onActionApplied,
}) => {
  const [prompt, setPrompt] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [response, setResponse] = useState<AICopilotCommandResponse | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const quickPrompts = [
    'Haz este salón más minimalista',
    'Pon el sofá contra la pared norte',
    '¿Cabe una mesa de 1,80 m?',
    'Quiero una atmósfera más cálida',
  ];

  const handleSubmit = async (customPrompt?: string) => {
    const text = customPrompt || prompt;
    if (!text.trim()) return;

    setIsProcessing(true);
    try {
      const res = await aiDesignService.processCopilotCommand(
        projectId,
        floorId,
        text,
        targetRoomId
      );
      if (res.data) {
        setResponse(res.data);
      }
    } catch (err: any) {
      alert(err.message || 'Error al procesar consulta de Copilot');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed bottom-5 right-6 z-40 max-w-lg w-full">
      {/* Botón flotante para abrir Copilot */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="ml-auto flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-brand-500 text-white font-bold text-xs shadow-2xl shadow-brand-500/30 hover:scale-105 transition-all border border-brand-400/40"
        >
          <Sparkles size={16} className="animate-spin" />
          <span>HBD Copilot IA</span>
        </button>
      )}

      {/* Panel Expandido del Copilot */}
      {isOpen && (
        <div className="bg-dark-surface/95 backdrop-blur-xl border border-dark-border rounded-3xl p-4 shadow-2xl space-y-3 animate-fadeIn">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-dark-border/50 pb-2.5">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-brand-500/20 text-brand-400 flex items-center justify-center">
                <Sparkles size={14} />
              </div>
              <h4 className="text-xs font-bold text-white">HBD Design Copilot</h4>
              <Badge variant="brand" size="sm">IA Estructurada</Badge>
            </div>
            <button
              onClick={() => {
                setIsOpen(false);
                setResponse(null);
              }}
              className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-dark-hover"
            >
              <X size={15} />
            </button>
          </div>

          {/* Quick Prompts Chips */}
          <div className="flex flex-wrap gap-1.5">
            {quickPrompts.map((qp, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  setPrompt(qp);
                  handleSubmit(qp);
                }}
                className="px-2.5 py-1 rounded-lg bg-dark-card hover:bg-dark-card/80 text-[11px] text-gray-300 border border-dark-border/60 transition-colors"
              >
                {qp}
              </button>
            ))}
          </div>

          {/* Input & Send */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Escribe una instrucción de diseño..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="flex-1 px-3.5 py-2 rounded-xl bg-dark-card border border-dark-border text-xs text-white placeholder:text-gray-500 focus:outline-none focus:border-brand-500"
            />
            <Button
              variant="primary"
              size="sm"
              type="submit"
              disabled={isProcessing || !prompt.trim()}
              icon={<Send size={14} />}
            >
              {isProcessing ? 'Analizando...' : 'Enviar'}
            </Button>
          </form>

          {/* Structured Output */}
          {response && (
            <div className="p-3.5 rounded-2xl bg-dark-card/80 border border-dark-border/70 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-brand-400 flex items-center gap-1.5">
                  <Wand2 size={13} />
                  {response.interpretedIntent}
                </span>
                {response.spatialValidation && (
                  <Badge
                    variant={response.spatialValidation.isCompatible ? 'success' : 'danger'}
                    size="sm"
                  >
                    {response.spatialValidation.isCompatible ? '✓ Compatible' : '✕ No cabe'}
                  </Badge>
                )}
              </div>

              <p className="text-gray-300 text-[11px] leading-relaxed">
                {response.explanation}
              </p>

              {response.action && (
                <div className="pt-2 border-t border-dark-border/40 flex items-center justify-between">
                  <span className="text-[11px] text-gray-400">
                    Acción: <strong className="text-white">{response.action.type}</strong>
                  </span>
                  {response.canAutoApply && (
                    <Button
                      variant="primary"
                      size="sm"
                      icon={<Check size={13} />}
                      onClick={() => {
                        if (onActionApplied) onActionApplied();
                        setResponse(null);
                        setPrompt('');
                      }}
                    >
                      Aplicar Cambio
                    </Button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
