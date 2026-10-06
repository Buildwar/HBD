/**
 * HBD — HOME BOARD DESIGNER
 * Technical Validation & Compliance Modal (Phase V21 / 1.21.0)
 * Autor: Adrián Palma
 * Copyright: © 2026 Adrián Palma. Todos los derechos reservados.
 */

import React, { useState } from 'react';
import {
  TechnicalValidationResultDto,
  TechnicalRuleSeverity
} from '@hbd/shared';
import {
  ShieldCheck,
  AlertOctagon,
  AlertTriangle,
  Info,
  X,
  CheckCircle2,
  BookOpen
} from 'lucide-react';

interface TechnicalValidationModalProps {
  isOpen: boolean;
  onClose: () => void;
  validation: TechnicalValidationResultDto | null;
  onRefresh: () => void;
}

export const TechnicalValidationModal: React.FC<TechnicalValidationModalProps> = ({
  isOpen,
  onClose,
  validation,
  onRefresh
}) => {
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');

  if (!isOpen) return null;

  const filteredIssues = validation?.issues.filter((iss) => {
    if (filterSeverity === 'ALL') return true;
    return iss.severity === filterSeverity;
  }) || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${validation?.isValid ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
              {validation?.isValid ? <ShieldCheck className="w-5 h-5" /> : <AlertOctagon className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                Auditoría Normativa y Validación Técnica
                {validation && (
                  <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${validation.isValid ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-red-500/20 text-red-400 border border-red-500/40'}`}>
                    {validation.score}/100 PTS
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-400">
                Verificación reglamentaria REBT ITC-BT-27, CTE DB-HS, RITE e ICT-2
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {validation ? (
            <>
              {/* Summary counters */}
              <div className="grid grid-cols-4 gap-3">
                <button
                  onClick={() => setFilterSeverity('ALL')}
                  className={`p-3 rounded-xl border text-left transition-all ${filterSeverity === 'ALL' ? 'bg-slate-800 border-slate-600' : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-800/50'}`}
                >
                  <span className="text-[11px] text-slate-400 block font-medium">Total Incidencias</span>
                  <span className="text-lg font-bold font-mono text-slate-200">{validation.issues.length}</span>
                </button>

                <button
                  onClick={() => setFilterSeverity('ERROR')}
                  className={`p-3 rounded-xl border text-left transition-all ${filterSeverity === 'ERROR' ? 'bg-red-950/50 border-red-500/60' : 'bg-slate-950/60 border-slate-800/80 hover:bg-red-950/30'}`}
                >
                  <span className="text-[11px] text-red-400 block font-medium">Errores Críticos</span>
                  <span className="text-lg font-bold font-mono text-red-400">{validation.errorsCount}</span>
                </button>

                <button
                  onClick={() => setFilterSeverity('WARNING')}
                  className={`p-3 rounded-xl border text-left transition-all ${filterSeverity === 'WARNING' ? 'bg-amber-950/50 border-amber-500/60' : 'bg-slate-950/60 border-slate-800/80 hover:bg-amber-950/30'}`}
                >
                  <span className="text-[11px] text-amber-400 block font-medium">Advertencias</span>
                  <span className="text-lg font-bold font-mono text-amber-400">{validation.warningsCount}</span>
                </button>

                <button
                  onClick={() => setFilterSeverity('INFO')}
                  className={`p-3 rounded-xl border text-left transition-all ${filterSeverity === 'INFO' ? 'bg-blue-950/50 border-blue-500/60' : 'bg-slate-950/60 border-slate-800/80 hover:bg-blue-950/30'}`}
                >
                  <span className="text-[11px] text-blue-400 block font-medium">Información</span>
                  <span className="text-lg font-bold font-mono text-blue-400">{validation.infosCount}</span>
                </button>
              </div>

              {/* Issues list */}
              <div className="space-y-2">
                {filteredIssues.length === 0 ? (
                  <div className="p-8 text-center bg-slate-950/50 border border-slate-800 rounded-xl space-y-2">
                    <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                    <p className="text-sm font-semibold text-slate-200">No se encontraron incidencias en esta categoría</p>
                    <p className="text-xs text-slate-400">Todas las instalaciones cumplen los requisitos técnicos y reglamentarios.</p>
                  </div>
                ) : (
                  filteredIssues.map((issue, idx) => {
                    const isErr = issue.severity === 'ERROR';
                    const isWarn = issue.severity === 'WARNING';
                    return (
                      <div
                        key={idx}
                        className={`p-3.5 rounded-xl border transition-all ${
                          isErr
                            ? 'bg-red-950/20 border-red-500/30 hover:border-red-500/50'
                            : isWarn
                            ? 'bg-amber-950/20 border-amber-500/30 hover:border-amber-500/50'
                            : 'bg-blue-950/20 border-blue-500/30 hover:border-blue-500/50'
                        }`}
                      >
                        <div className="flex items-start gap-2.5">
                          {isErr ? (
                            <AlertOctagon className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                          ) : isWarn ? (
                            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                          ) : (
                            <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                          )}
                          <div className="flex-1 min-w-0 space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-slate-200">
                                {issue.ruleName}
                              </span>
                              {issue.elementCode && (
                                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 font-mono text-slate-300 font-semibold">
                                  {issue.elementCode}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-300">{issue.message}</p>
                            <div className="p-2 rounded bg-slate-950/80 text-[11px] text-slate-400 space-y-0.5">
                              <p className="text-emerald-400 font-medium">Recomendación: {issue.recommendation}</p>
                              {issue.standardReference && (
                                <p className="text-slate-500 text-[10px] flex items-center gap-1 font-mono">
                                  <BookOpen className="w-3 h-3" />
                                  Norma: {issue.standardReference}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </>
          ) : (
            <div className="py-12 text-center text-slate-500 text-xs">
              Cargando datos de validación...
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/50 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Última validación: {validation?.validatedAt ? new Date(validation.validatedAt).toLocaleTimeString() : 'N/A'}
          </span>
          <div className="flex gap-2">
            <button
              onClick={onRefresh}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
            >
              Re-evaluar
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-bold transition-colors"
            >
              Aceptar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
