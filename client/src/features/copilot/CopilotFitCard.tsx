/**
 * HBD — FASE V24 / 1.24.0: HBD AI COPILOT
 * Product Spatial Fit Validation Card Component
 * 
 * Autor: Adrián Palma
 * Copyright: © 2026 Adrián Palma — HBD (Home Board Designer)
 */

import React from 'react';
import { ProductFitResultPayload } from '@hbd/shared';
import { CheckCircle2, XCircle, ShieldCheck, Sparkles } from 'lucide-react';

interface Props {
  result: ProductFitResultPayload;
}

export const CopilotFitCard: React.FC<Props> = ({ result }) => {
  return (
    <div
      className={`mt-3 p-4 rounded-xl border text-xs space-y-3 ${
        result.fits
          ? 'bg-emerald-950/20 border-emerald-700/60'
          : 'bg-rose-950/20 border-rose-700/60'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {result.fits ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          ) : (
            <XCircle className="w-4 h-4 text-rose-400" />
          )}
          <span className="font-semibold text-white text-sm">
            {result.fits ? '¡El mueble cabe en el espacio!' : 'Espacio insuficiente o colisión'}
          </span>
        </div>
        <span
          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
            result.fits
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
              : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
          }`}
        >
          {result.fits ? 'VALIDADO 2D/3D' : 'NO CABE'}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
        <div>
          <span className="text-[10px] text-slate-400">Ancho disponible</span>
          <p className="font-bold text-slate-100">{result.availableWidthCm} cm</p>
        </div>
        <div>
          <span className="text-[10px] text-slate-400">Ancho del mueble</span>
          <p className="font-bold text-slate-100">{result.productWidthCm} cm</p>
        </div>
        <div>
          <span className="text-[10px] text-slate-400">Margen de circulación</span>
          <p className="font-bold text-emerald-400">{result.clearanceCirculationCm} cm libre</p>
        </div>
      </div>

      {result.explanations && result.explanations.length > 0 && (
        <div className="space-y-1 pt-1">
          <div className="flex items-center gap-1 text-[11px] text-slate-300 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Comprobaciones de Normativa y Circulación:</span>
          </div>
          <ul className="list-disc list-inside space-y-0.5 text-[11px] text-slate-400 pl-1">
            {result.explanations.map((exp, idx) => (
              <li key={idx}>{exp}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
