/**
 * HBD — HOME BOARD DESIGNER (V9.0.0)
 * InspirationModal — Perfil de Inspiración, Paleta Cromática y Puente a AI Design (V8)
 * Autor Oficial: Adrián Palma
 * Copyright: © 2026 Adrián Palma — HBD (Home Board Designer)
 */

import React from 'react';
import {
  Sparkles,
  Palette,
  Layers,
  Wand2,
  Sun,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Armchair,
} from 'lucide-react';
import {
  ProjectImageDto,
  VisionAnalysisResult,
  InspirationProfile,
  AIVisionEngine,
} from '@hbd/shared';
import { Modal } from '../../components/ui/Modal.js';
import { Button } from '../../components/ui/Button.js';
import { Badge } from '../../components/ui/Badge.js';

interface InspirationModalProps {
  isOpen: boolean;
  onClose: () => void;
  image: ProjectImageDto;
  analysis: VisionAnalysisResult;
  onLaunchAIDesign?: (prefilledPreferences: any) => void;
}

export const InspirationModal: React.FC<InspirationModalProps> = ({
  isOpen,
  onClose,
  image,
  analysis,
  onLaunchAIDesign,
}) => {
  if (!isOpen) return null;

  const inspiration: InspirationProfile = analysis.inspirationProfile || {
    style: 'Moderno Neutro',
    styleConfidence: 0.9,
    atmosphere: 'Luminosa y Serenidad',
    dominantColors: analysis.visualPalette?.dominantColors || ['#fcfbf7', '#d97706', '#4b5563'],
    visualPalette: analysis.visualPalette,
    materials: analysis.detectedMaterials || [],
    lightingMood: 'Luz natural rasante',
    generalVibe: 'Espacioso y armónico',
    keyHighlights: ['Paleta neutra', 'Materiales nobles'],
  };

  const palette = analysis.visualPalette;

  const handleApplyToAIDesign = () => {
    const visionContext = AIVisionEngine.buildVisionContext(analysis, image.sourceType);
    const prefs = AIVisionEngine.mapVisionContextToDesignPreferences(visionContext);
    onLaunchAIDesign?.(prefs);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Perfil de Inspiración y Paleta de Acabados Extraída"
      description="Utiliza el estilo, paleta cromática y materiales detectados en la imagen para alimentar el motor de diseño inteligente."
      maxWidth="lg"
    >
      <div className="space-y-6">
        {/* Cabecera con Estilo Detectado */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-dark-card to-dark-surface border border-dark-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-500/20 text-brand-400 flex items-center justify-center shadow-inner">
              <Sparkles size={20} />
            </div>
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                Estilo Predominante Identificado
              </span>
              <h3 className="text-base font-bold text-white mt-0.5">{inspiration.style}</h3>
            </div>
          </div>
          <Badge variant="brand">
            {Math.round(inspiration.styleConfidence * 100)}% Confianza
          </Badge>
        </div>

        {/* Paleta Cromática Extraída */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-gray-200 uppercase tracking-wider flex items-center gap-1.5">
            <Palette size={14} className="text-brand-400" />
            Paleta Cromática Armónica
          </h4>

          <div className="grid grid-cols-5 gap-2">
            {palette.dominantColors.slice(0, 5).map((color, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-xl bg-dark-card border border-dark-border flex flex-col items-center gap-1.5 shadow-sm"
              >
                <div
                  className="w-full h-10 rounded-lg shadow-inner border border-white/10"
                  style={{ backgroundColor: color }}
                />
                <span className="text-[10px] font-mono text-gray-300 font-bold uppercase">
                  {color}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Materiales y Acabados */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-gray-200 uppercase tracking-wider flex items-center gap-1.5">
            <Layers size={14} className="text-sky-400" />
            Materiales y Texturas Identificadas
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto">
            {inspiration.materials.map((mat) => (
              <div
                key={mat.id}
                className="p-2.5 rounded-xl bg-dark-card/60 border border-dark-border flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full border border-white/20 shadow-sm"
                    style={{ backgroundColor: mat.dominantColorHex || '#d1d5db' }}
                  />
                  <div>
                    <p className="font-bold text-gray-200">{mat.label}</p>
                    <p className="text-[10px] text-gray-400">{mat.materialType} • {mat.region || 'General'}</p>
                  </div>
                </div>
                <Badge variant="gray">{Math.round(mat.confidence * 100)}%</Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Atmósfera e Iluminación */}
        <div className="p-3.5 rounded-xl bg-dark-card border border-dark-border text-xs space-y-1.5">
          <div className="flex items-center gap-2 text-amber-300 font-bold text-xs">
            <Sun size={14} />
            <span>Atmósfera: {inspiration.atmosphere}</span>
          </div>
          <p className="text-[11px] text-gray-400">{inspiration.lightingMood}</p>
          <p className="text-[11px] text-gray-300 italic">{inspiration.generalVibe}</p>
        </div>

        {/* Botones */}
        <div className="flex items-center justify-between pt-3 border-t border-dark-border/60">
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            Cerrar
          </Button>

          {onLaunchAIDesign && (
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleApplyToAIDesign}
              icon={<Wand2 size={15} className="text-amber-300" />}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-md shadow-indigo-500/20"
            >
              Diseñar con IA usando esta Inspiración
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};
