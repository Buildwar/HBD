/**
 * HBD — HOME BOARD DESIGNER (V8.0.0)
 * AIHistoryModal — Historial de Propuestas y Consultas de IA
 * Autor Oficial: Adrián Palma
 * Copyright: © 2026 Adrián Palma — HBD (Home Board Designer)
 */

import React, { useEffect, useState } from 'react';
import {
  History,
  X,
  Sparkles,
  Calendar,
  CheckCircle2,
  Wand2,
} from 'lucide-react';
import { AIDesignHistoryItem } from '@hbd/shared';
import { aiDesignService } from '../../services/aiDesign.service.js';
import { Badge } from '../../components/ui/Badge.js';
import { Card } from '../../components/ui/Card.js';

interface AIHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  floorId?: string;
  onApplyHistoryItem?: (item: AIDesignHistoryItem) => void;
}

export const AIHistoryModal: React.FC<AIHistoryModalProps> = ({
  isOpen,
  onClose,
  projectId,
  floorId: _floorId,
  onApplyHistoryItem: _onApplyHistoryItem,
}) => {
  const [historyItems, setHistoryItems] = useState<AIDesignHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && projectId) {
      setIsLoading(true);
      aiDesignService
        .getProjectHistory(projectId)
        .then((res) => {
          if (res.data) setHistoryItems(res.data);
        })
        .catch(console.error)
        .finally(() => setIsLoading(false));
    }
  }, [isOpen, projectId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-3xl bg-dark-surface border border-dark-border rounded-3xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-dark-border/70 bg-dark-card/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-500/20 text-brand-400 border border-brand-500/30 flex items-center justify-center shadow-lg">
              <History size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Historial de Diseños con IA</h3>
              <p className="text-xs text-gray-400">
                Registro de propuestas generadas y modificaciones aplicadas
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-2 rounded-xl hover:bg-dark-hover transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {isLoading ? (
            <div className="py-12 text-center text-xs text-gray-400">
              Cargando historial de propuestas...
            </div>
          ) : historyItems.length === 0 ? (
            <div className="py-12 text-center text-xs text-gray-500">
              No hay propuestas registradas en este proyecto todavía.
            </div>
          ) : (
            historyItems.map((item) => (
              <Card
                key={item.id}
                className="p-4 bg-dark-card/50 border-dark-border space-y-3"
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-gray-400">
                    <Calendar size={13} />
                    <span>{new Date(item.createdAt).toLocaleString()}</span>
                  </div>
                  <Badge
                    variant={item.status === 'APPLIED' ? 'success' : 'brand'}
                    size="sm"
                  >
                    {item.status}
                  </Badge>
                </div>

                <div className="text-xs text-gray-300">
                  <span className="font-semibold text-white">Estilo: </span>
                  <span className="capitalize">{item.preferences.style}</span> •{' '}
                  <span className="font-semibold text-white">Atmósfera: </span>
                  <span className="capitalize">{item.preferences.atmosphere}</span>
                </div>

                <div className="text-[11px] text-gray-400 flex items-center gap-2">
                  <Sparkles size={12} className="text-brand-400" />
                  <span>{item.proposals?.length || 0} propuesta(s) generadas</span>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
