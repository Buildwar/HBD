/**
 * HBD — HOME BOARD DESIGNER (V13.0.0)
 * MODAL DE COMPARACIÓN DE ALTERNATIVAS DE DISEÑO
 * ALTERNATIVE COMPARISON MODAL
 *
 * Autor: Adrián Palma
 * Copyright: © 2026 Adrián Palma. Todos los derechos reservados.
 */

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Scale,
  AlertTriangle,
  AlertCircle,
  Hammer,
  Maximize2,
} from 'lucide-react';
import { Modal } from '../../components/ui/Modal.js';
import { Button } from '../../components/ui/Button.js';
import { Badge } from '../../components/ui/Badge.js';
import { optimizationService } from '../../services/optimization.service.js';
import { ScenarioComparisonDto } from '@hbd/shared';

interface AlternativeComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  requestId: string;
  alternativeIds: string[];
}

export const AlternativeComparisonModal: React.FC<AlternativeComparisonModalProps> = ({
  isOpen,
  onClose,
  requestId,
  alternativeIds,
}) => {
  const { t } = useTranslation();
  const [comparison, setComparison] = useState<ScenarioComparisonDto | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && alternativeIds.length > 0) {
      loadComparison();
    }
  }, [isOpen, alternativeIds]);

  const loadComparison = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await optimizationService.compareAlternatives(requestId, alternativeIds);
      setComparison(data);
    } catch (err: any) {
      setError(err.message || t('optimization.alternativeComparisonModal.errorComparing'));
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('optimization.alternativeComparisonModal.title')}
    >
      <div className="space-y-6">
        {isLoading && (
          <div className="py-12 text-center text-gray-400">
            <Scale className="animate-spin mx-auto mb-2 text-brand-400" size={28} />
            <p className="text-sm">{t('optimization.alternativeComparisonModal.analyzing')}</p>
          </div>
        )}

        {error && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-3">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {comparison && !isLoading && (
          <div className="space-y-6">
            {/* Header de Alternativas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {comparison.scenarios.map((sc) => (
                <div
                  key={sc.id}
                  className="p-4 rounded-2xl bg-dark-card border border-dark-border flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                        {t('optimization.alternativeComparisonModal.alternative')}
                      </span>
                      <Badge
                        variant={
                          sc.validation.status === 'VALID'
                            ? 'success'
                            : sc.validation.status === 'INVALID'
                            ? 'danger'
                            : 'warning'
                        }
                      >
                        {sc.validation.status}
                      </Badge>
                    </div>
                    <h4 className="font-bold text-white text-sm truncate">{sc.name}</h4>
                  </div>
                  <div className="mt-4 pt-3 border-t border-dark-border/40 text-xs text-gray-300 space-y-1">
                    <div className="flex justify-between">
                      <span className="text-gray-400">{t('optimization.alternativeComparisonModal.estCost')}</span>
                      <span className="font-semibold text-white">{sc.cost} €</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">{t('optimization.alternativeComparisonModal.normativeScore')}</span>
                      <span className="font-semibold text-emerald-400">
                        {sc.validation.complianceScore}/100
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Matriz Comparativa */}
            <div className="space-y-4">
              <div className="rounded-2xl bg-dark-surface border border-dark-border overflow-hidden">
                <div className="p-3.5 bg-dark-card border-b border-dark-border flex items-center gap-2 font-bold text-xs text-gray-200">
                  <Maximize2 size={16} className="text-sky-400" />
                  <span>{t('optimization.alternativeComparisonModal.dimensionalMetrics')}</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-dark-border/40 text-gray-400">
                        <th className="p-3">{t('optimization.alternativeComparisonModal.metric')}</th>
                        {comparison.scenarios.map((s) => (
                          <th key={s.id} className="p-3 text-right font-bold text-gray-200">
                            {s.name}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-dark-border/30 text-gray-300">
                      {comparison.comparisonMatrix.geometry.map((row, idx) => (
                        <tr key={idx} className="hover:bg-dark-card/40 transition-colors">
                          <td className="p-3 font-medium text-gray-400">{row.metric}</td>
                          {comparison.scenarios.map((s) => (
                            <td key={s.id} className="p-3 text-right font-semibold text-white">
                              {row.values[s.id] ?? '-'}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="rounded-2xl bg-dark-surface border border-dark-border overflow-hidden">
                <div className="p-3.5 bg-dark-card border-b border-dark-border flex items-center gap-2 font-bold text-xs text-gray-200">
                  <Hammer size={16} className="text-amber-400" />
                  <span>{t('optimization.alternativeComparisonModal.constructionConsequences')}</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-dark-border/40 text-gray-400">
                        <th className="p-3">{t('optimization.alternativeComparisonModal.metric')}</th>
                        {comparison.scenarios.map((s) => (
                          <th key={s.id} className="p-3 text-right font-bold text-gray-200">
                            {s.name}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-dark-border/30 text-gray-300">
                      {comparison.comparisonMatrix.economy.map((row, idx) => (
                        <tr key={idx} className="hover:bg-dark-card/40 transition-colors">
                          <td className="p-3 font-medium text-gray-400">{row.metric}</td>
                          {comparison.scenarios.map((s) => (
                            <td key={s.id} className="p-3 text-right font-semibold text-emerald-400">
                              {row.values[s.id] ?? '-'}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Aviso Metodológico */}
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-start gap-3">
              <AlertTriangle className="flex-shrink-0 text-amber-400 mt-0.5" size={18} />
              <div>
                <p className="font-bold text-amber-300 mb-0.5">{t('optimization.alternativeComparisonModal.objectiveDecisionNotice')}</p>
                <p className="leading-relaxed">{comparison.professionalNotice}</p>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end pt-4 border-t border-dark-border/40">
          <Button variant="secondary" onClick={onClose}>
            {t('optimization.alternativeComparisonModal.closeComparison')}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
