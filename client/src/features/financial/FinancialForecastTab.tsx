/**
 * HBD — HOME BOARD DESIGNER (V17.0.0)
 * Financial Forecast Tab Component — Budget Projections, Risk Analysis & Contingency
 * Autor: Adrián Palma
 * Copyright: © 2026 Adrián Palma. Todos los derechos reservados.
 */

import React from 'react';
import { FinancialForecastDto } from '@hbd/shared';
import {
  TrendingUp,
  AlertTriangle,
  ShieldCheck,
  Zap,
  CheckCircle,
  Lightbulb,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';

interface FinancialForecastTabProps {
  forecast: FinancialForecastDto | null;
}

export const FinancialForecastTab: React.FC<FinancialForecastTabProps> = ({ forecast }) => {
  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(
      val || 0
    );

  if (!forecast) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center">
        <Zap className="w-12 h-12 text-slate-600 mx-auto mb-3" />
        <h3 className="text-base font-bold text-white">Cargando proyección financiera...</h3>
      </div>
    );
  }

  const isHighRisk = forecast.riskLevel === 'HIGH';
  const isMediumRisk = forecast.riskLevel === 'MEDIUM';

  return (
    <div className="space-y-4">
      {/* Risk & Confidence Header Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Coste Final Proyectado */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
          <span className="text-xs font-semibold uppercase tracking-wider text-purple-400">
            Coste Final Estimado
          </span>
          <div className="mt-2 text-3xl font-black text-white">
            {formatCurrency(forecast.forecastFinalCost)}
          </div>
          <div className="mt-2 text-xs flex items-center justify-between text-slate-400">
            <span>Presupuesto base: {formatCurrency(forecast.baselineBudget)}</span>
            <span
              className={`font-bold ${
                forecast.projectedVariance > 0 ? 'text-red-400' : 'text-emerald-400'
              }`}
            >
              {forecast.projectedVariance > 0 ? '+' : ''}
              {forecast.projectedVariancePercentage}%
            </span>
          </div>
        </div>

        {/* Card 2: Nivel de Riesgo & Confianza */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">
              Índice de Riesgo Financiero
            </span>
            <span
              className={`px-2 py-0.5 rounded text-xs font-bold ${
                isHighRisk
                  ? 'bg-red-500/10 text-red-400 border border-red-500/30'
                  : isMediumRisk
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                  : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
              }`}
            >
              RIESGO {forecast.riskLevel}
            </span>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black text-white">
              {forecast.confidenceScore}%
            </span>
            <span className="text-xs text-slate-400">Nivel de Confianza</span>
          </div>
          <div className="mt-2 w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                forecast.confidenceScore > 70
                  ? 'bg-emerald-500'
                  : forecast.confidenceScore > 40
                  ? 'bg-amber-500'
                  : 'bg-red-500'
              }`}
              style={{ width: `${forecast.confidenceScore}%` }}
            />
          </div>
        </div>

        {/* Card 3: Colchón de Contingencia Recomendado */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
          <span className="text-xs font-semibold uppercase tracking-wider text-cyan-400">
            Colchón de Contingencia
          </span>
          <div className="mt-2 text-3xl font-black text-white">
            {formatCurrency(forecast.suggestedContingencyBuffer)}
          </div>
          <div className="mt-2 text-xs text-slate-400">
            Reserva sugerida para imprevistos en obra y fluctuación de precios.
          </div>
        </div>
      </div>

      {/* Breakdown Projection Stack */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-950/70 border border-slate-800 p-4 rounded-xl text-xs">
          <div className="text-slate-400">1. Desembolsado Real</div>
          <div className="text-xl font-bold text-emerald-400 mt-1">
            {formatCurrency(forecast.actualSpent)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Pagos completados y certificados</div>
        </div>
        <div className="bg-slate-950/70 border border-slate-800 p-4 rounded-xl text-xs">
          <div className="text-slate-400">2. Compromisos Pendientes</div>
          <div className="text-xl font-bold text-amber-400 mt-1">
            {formatCurrency(forecast.committedRemaining)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Contratos y partidas aprobadas por abonar</div>
        </div>
        <div className="bg-slate-950/70 border border-slate-800 p-4 rounded-xl text-xs">
          <div className="text-slate-400">3. Estimado No Contratado</div>
          <div className="text-xl font-bold text-slate-300 mt-1">
            {formatCurrency(forecast.uncommittedEstimatedRemaining)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Estimaciones pendientes de adjudicación</div>
        </div>
      </div>

      {/* Drivers & Recommendations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Drivers */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
          <h4 className="text-sm font-bold text-white flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>Factores Clave de Desviación</span>
          </h4>
          <ul className="mt-3 space-y-2 text-xs text-slate-300">
            {forecast.keyDrivers.map((driver, i) => (
              <li key={i} className="flex items-start space-x-2 bg-slate-950/50 p-2.5 rounded-lg border border-slate-800/40">
                <ArrowRight className="w-3.5 h-3.5 text-amber-400 mt-0.5 shrink-0" />
                <span>{driver}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Recommendations */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
          <h4 className="text-sm font-bold text-white flex items-center space-x-2">
            <Lightbulb className="w-4 h-4 text-emerald-400" />
            <span>Recomendaciones Inteligentes HBD</span>
          </h4>
          <ul className="mt-3 space-y-2 text-xs text-slate-300">
            {forecast.recommendations.map((rec, i) => (
              <li key={i} className="flex items-start space-x-2 bg-slate-950/50 p-2.5 rounded-lg border border-slate-800/40">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
