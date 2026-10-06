/**
 * HBD — FASE V24 / 1.24.0: HBD AI COPILOT
 * Copilot Sidepanel Interface Component
 * 
 * Autor: Adrián Palma
 * Copyright: © 2026 Adrián Palma — HBD (Home Board Designer)
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  AIMessage,
  AIConversation,
  AICopilotAction,
} from '@hbd/shared';
import { copilotService } from '../../services/copilot.service';
import { CopilotMessageBubble } from './CopilotMessageBubble';
import {
  Bot,
  X,
  Send,
  Sparkles,
  RefreshCw,
  Trash2,
  Minimize2,
  Maximize2,
  ChevronRight,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  projectId?: string;
  propertyId?: string;
  initialPrompt?: string;
}

export const CopilotSidepanel: React.FC<Props> = ({
  isOpen,
  onClose,
  projectId,
  propertyId,
  initialPrompt,
}) => {
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [conversationId, setConversationId] = useState<string | undefined>();
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [suggestedPrompts, setSuggestedPrompts] = useState<string[]>([
    '¿Cuánto cuesta la reforma de esta estancia?',
    'Busca un sofá que quepa aquí por menos de 800 €',
    '¿Qué compras me faltan por hacer?',
    'Revisa la cobertura Wi-Fi y puntos de red',
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Send initial welcome message
      const welcome: AIMessage = {
        id: 'welcome_msg',
        conversationId: 'initial',
        sender: 'COPILOT',
        content: `Hola, soy el **Copiloto Inteligente de HBD**. Conozco todos los datos reales de tu proyecto: planos acotados, mobiliario, compras, presupuestos, infraestructura técnica (V21), AR (V22) e inteligencia del inmueble (V23).\n\n¿En qué puedo ayudarte hoy?`,
        confidence: 'HIGH',
        createdAt: new Date().toISOString(),
      };
      setMessages([welcome]);

      if (initialPrompt) {
        handleSendMessage(initialPrompt);
      }
    }
  }, [isOpen]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputMessage;
    if (!query.trim() || loading) return;

    const userMsg: AIMessage = {
      id: `usr_${Date.now()}`,
      conversationId: conversationId || 'temp',
      sender: 'USER',
      content: query,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setLoading(true);

    try {
      const response = await copilotService.chat({
        message: query,
        conversationId,
        projectId,
        propertyId,
      });

      setConversationId(response.conversation?.id || (response as any).conversationId);
      setMessages((prev) => [...prev, response.message]);

      if (response.message.structuredPayload?.suggestedPrompts) {
        setSuggestedPrompts(response.message.structuredPayload.suggestedPrompts);
      }
    } catch (err: any) {
      const errorMsg: AIMessage = {
        id: `err_${Date.now()}`,
        conversationId: conversationId || 'temp',
        sender: 'COPILOT',
        content: `⚠️ Lo siento, ha ocurrido un error al procesar tu solicitud: ${err.message}`,
        confidence: 'LOW',
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmAction = async (actionId: string) => {
    try {
      await copilotService.confirmAction(actionId);
      setMessages((prev) =>
        prev.map((msg) => {
          if (!msg.structuredPayload?.actions) return msg;
          return {
            ...msg,
            structuredPayload: {
              ...msg.structuredPayload,
              actions: msg.structuredPayload.actions.map((a) =>
                a.id === actionId ? { ...a, status: 'EXECUTED' as const } : a
              ),
            },
          };
        })
      );
    } catch (err: any) {
      alert(`Error al confirmar acción: ${err.message}`);
    }
  };

  const handleCancelAction = async (actionId: string) => {
    try {
      await copilotService.cancelAction(actionId);
      setMessages((prev) =>
        prev.map((msg) => {
          if (!msg.structuredPayload?.actions) return msg;
          return {
            ...msg,
            structuredPayload: {
              ...msg.structuredPayload,
              actions: msg.structuredPayload.actions.map((a) =>
                a.id === actionId ? { ...a, status: 'CANCELLED' as const } : a
              ),
            },
          };
        })
      );
    } catch (err: any) {
      alert(`Error al cancelar acción: ${err.message}`);
    }
  };

  const handleApplyAlternative = async (action: AICopilotAction) => {
    handleSendMessage(`Aplica la propuesta de diseño: ${action.reason}`);
  };

  const handleClearHistory = () => {
    setMessages([]);
    setConversationId(undefined);
  };

  if (!isOpen) return null;

  return (
    <div
      className={`fixed top-0 right-0 h-full bg-slate-950/95 backdrop-blur-xl border-l border-slate-800 shadow-2xl z-50 flex flex-col transition-all duration-300 ${
        isExpanded ? 'w-full md:w-[680px]' : 'w-full md:w-[460px]'
      }`}
    >
      {/* Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-inner">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-white text-sm">HBD AI Copilot</h3>
              <span className="text-[10px] px-1.5 py-0.5 bg-emerald-950/80 border border-emerald-700/60 text-emerald-300 rounded font-mono font-semibold">
                ORCHESTRATOR
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Conectado a Geometría, Catálogo, Presupuesto e Instalaciones
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors hidden sm:block"
            title={isExpanded ? 'Reducir panel' : 'Expandir panel'}
          >
            {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
          <button
            type="button"
            onClick={handleClearHistory}
            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
            title="Limpiar conversación"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
            title="Cerrar panel"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages Timeline */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <CopilotMessageBubble
            key={msg.id}
            message={msg}
            onConfirmAction={handleConfirmAction}
            onCancelAction={handleCancelAction}
            onApplyAlternative={handleApplyAlternative}
          />
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-xs text-emerald-400 p-3 bg-slate-900/60 rounded-xl border border-slate-800 animate-pulse">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            <span>Consultando motores de HBD y catálogo de tiendas...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Suggestions */}
      {suggestedPrompts.length > 0 && !loading && (
        <div className="px-4 py-2 border-t border-slate-800/60 bg-slate-900/40">
          <div className="flex items-center gap-1 text-[10px] text-slate-400 mb-1.5 font-medium">
            <Sparkles className="w-3 h-3 text-emerald-400" />
            <span>Consultas sugeridas:</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {suggestedPrompts.slice(0, 3).map((prompt, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendMessage(prompt)}
                className="px-2.5 py-1 bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 rounded-lg text-[11px] border border-slate-700/60 transition-colors text-left truncate max-w-full"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="p-3 border-t border-slate-800 bg-slate-900/80">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Pregunta sobre diseño, medidas, productos, costes..."
            className="flex-1 bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !inputMessage.trim()}
            className="p-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:hover:bg-emerald-600 text-white rounded-xl shadow transition-all shrink-0 flex items-center justify-center"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
