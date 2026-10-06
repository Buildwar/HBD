/**
 * HBD — HOME BOARD DESIGNER (V7.0.0)
 * Galería de Renders y Comparador Antes | Después (GalleryModal)
 * Autor Oficial: Adrián Palma
 * Copyright: © 2026 Adrián Palma — HBD (Home Board Designer)
 */

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  X,
  Download,
  Trash2,
  Columns,
  Image as ImageIcon,
  Sparkles,
  Calendar,
  Layers,
  Maximize2,
} from 'lucide-react';
import { RenderRecord } from '@hbd/shared';

interface GalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  renders: RenderRecord[];
  onDeleteRender: (id: string) => void;
}

export const GalleryModal: React.FC<GalleryModalProps> = ({
  isOpen,
  onClose,
  renders,
  onDeleteRender,
}) => {
  const { t } = useTranslation();
  const [selectedRender, setSelectedRender] = useState<RenderRecord | null>(
    renders.length > 0 ? renders[0] : null
  );
  const [compareMode, setCompareMode] = useState(false);
  const [compareLeft, setCompareLeft] = useState<RenderRecord | null>(renders[0] || null);
  const [compareRight, setCompareRight] = useState<RenderRecord | null>(renders[1] || renders[0] || null);
  const [sliderPos, setSliderPos] = useState(50);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-6xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Cabecera */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-850">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-600/20 text-emerald-400 rounded-xl">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">Galería de Renders & Visualizaciones</h2>
              <p className="text-xs text-slate-400">
                {renders.length} visualizaciones capturadas para el proyecto
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {renders.length >= 2 && (
              <button
                onClick={() => setCompareMode(!compareMode)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors ${
                  compareMode
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'
                }`}
              >
                <Columns className="w-4 h-4" />
                <span>{compareMode ? t('render.normalMode') : t('render.compareMode')}</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Contenido */}
        <div className="flex-1 flex overflow-hidden">
          {/* Lado Izquierdo: Lista de Renders */}
          <div className="w-80 border-r border-slate-800 overflow-y-auto p-4 space-y-3 bg-slate-950/50">
            {renders.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-xs">
                {t('render.noRenders')}
                <br />
                <span dangerouslySetInnerHTML={{ __html: t('render.clickRender').replace('Renderizar', '<strong>Renderizar</strong>') }} />
              </div>
            ) : (
              renders.map((r) => {
                const isSelected = selectedRender?.id === r.id;
                return (
                  <div
                    key={r.id}
                    onClick={() => {
                      setSelectedRender(r);
                      if (compareMode && compareLeft?.id !== r.id) {
                        setCompareRight(r);
                      }
                    }}
                    className={`p-2.5 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-emerald-950/30 border-emerald-500 text-white shadow-lg'
                        : 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <div className="aspect-video w-full rounded-lg overflow-hidden bg-black/40 mb-2 relative">
                      <img src={r.imageUrl} alt={r.name} className="w-full h-full object-cover" />
                      <span className="absolute bottom-1 right-1 bg-black/70 px-1.5 py-0.5 rounded text-[10px] font-mono text-slate-300">
                        {r.resolution || 'HD'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="truncate">{r.name}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                      <span>{new Date(r.createdAt).toLocaleDateString('es-ES')}</span>
                      <span className="capitalize">{r.quality || 'High'}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Lado Derecho: Visor Principal o Comparador */}
          <div className="flex-1 bg-black/60 p-6 flex flex-col items-center justify-center relative overflow-hidden">
            {compareMode && compareLeft && compareRight ? (
              /* COMPARADOR ANTES | DESPUÉS */
              <div className="relative w-full h-full max-h-[600px] rounded-2xl overflow-hidden border border-slate-700/60 select-none">
                {/* Imagen Derecha (Base) */}
                <img
                  src={compareRight.imageUrl}
                  alt={compareRight.name}
                  className="absolute inset-0 w-full h-full object-contain bg-slate-950"
                />
                <span className="absolute top-4 right-4 bg-black/80 px-3 py-1 rounded-xl text-xs font-semibold text-slate-200 border border-slate-700">
                  {compareRight.name} ({t('render.proposalB')})
                </span>

                {/* Imagen Izquierda (Recortada por el Slider) */}
                <div
                  className="absolute inset-y-0 left-0 overflow-hidden bg-slate-950"
                  style={{ width: `${sliderPos}%` }}
                >
                  <img
                    src={compareLeft.imageUrl}
                    alt={compareLeft.name}
                    className="absolute inset-y-0 left-0 w-full h-full object-contain"
                    style={{ width: '100%' }}
                  />
                  <span className="absolute top-4 left-4 bg-emerald-900/80 px-3 py-1 rounded-xl text-xs font-semibold text-emerald-200 border border-emerald-500/40">
                    {compareLeft.name} ({t('render.proposalA')})
                  </span>
                </div>

                {/* Línea Divisoria del Slider */}
                <div
                  className="absolute inset-y-0 w-1 bg-white shadow-2xl cursor-ew-resize flex items-center justify-center"
                  style={{ left: `${sliderPos}%` }}
                >
                  <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg text-[10px] font-bold">
                    ↔
                  </div>
                </div>

                {/* Control Deslizante Interactivo */}
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={sliderPos}
                  onChange={(e) => setSliderPos(Number(e.target.value))}
                  className="absolute inset-0 opacity-0 cursor-ew-resize w-full h-full z-10"
                />
              </div>
            ) : selectedRender ? (
              /* VISOR INDIVIDUAL */
              <div className="flex-1 w-full flex flex-col items-center justify-center">
                <div className="relative max-w-full max-h-[560px] rounded-2xl overflow-hidden border border-slate-800 shadow-2xl bg-black">
                  <img
                    src={selectedRender.imageUrl}
                    alt={selectedRender.name}
                    className="max-h-[560px] w-auto object-contain"
                  />
                </div>

                <div className="w-full max-w-2xl mt-4 flex items-center justify-between text-xs bg-slate-900/80 border border-slate-800 p-3 rounded-xl">
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-white">{selectedRender.name}</span>
                    <span className="text-slate-400">·</span>
                    <span className="text-slate-400">{selectedRender.resolution}</span>
                    <span className="text-slate-400">·</span>
                    <span className="text-emerald-400 capitalize">{selectedRender.quality}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href={selectedRender.imageUrl}
                      download={`${selectedRender.name}.png`}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium flex items-center gap-1.5 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>{t('render.downloadPng')}</span>
                    </a>

                    <button
                      onClick={() => {
                        onDeleteRender(selectedRender.id);
                        setSelectedRender(null);
                      }}
                      className="p-1.5 text-rose-400 hover:text-white hover:bg-rose-950/60 rounded-lg transition-colors"
                      title={t('render.deleteRender')}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-slate-500 text-xs">{t('render.selectRender')}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
