/**
 * HBD — HOME BOARD DESIGNER
 * V16.0.0 — PRODUCT IMPORT MODAL (6-STAGE WORKFLOW)
 *
 * Autor: Adrián Palma
 * Copyright: © 2026 Adrián Palma. Todos los derechos reservados.
 */

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  X,
  Link as LinkIcon,
  Sparkles,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Layers,
  ArrowRight,
  RotateCcw,
  Check,
  PackageCheck,
  ExternalLink,
} from 'lucide-react';
import { Button } from '../../components/ui/Button.js';
import { Input } from '../../components/ui/Input.js';
import { Badge } from '../../components/ui/Badge.js';
import { ProductService } from '../../services/product.service.js';
import {
  ProductDto,
  ProductImportResultDto,
  ProductProvenanceEngine,
} from '@hbd/shared';

interface ProductImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (product: ProductDto) => void;
  projectId?: string;
}

type ImportStage = 'URL_INPUT' | 'ANALYZING' | 'REVIEW' | 'SUCCESS';

export const ProductImportModal: React.FC<ProductImportModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  projectId,
}) => {
  const { t } = useTranslation();
  const [stage, setStage] = useState<ImportStage>('URL_INPUT');
  const [url, setUrl] = useState('');
  const [aiAssisted, setAiAssisted] = useState(true);
  const [createTwin, setCreateTwin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [importResult, setImportResult] = useState<ProductImportResultDto | null>(null);

  // Campos editables en revisión
  const [editedName, setEditedName] = useState('');
  const [editedBrand, setEditedBrand] = useState('');
  const [editedCategory, setEditedCategory] = useState('');
  const [editedWidthM, setEditedWidthM] = useState(1.0);
  const [editedDepthM, setEditedDepthM] = useState(0.6);
  const [editedHeightM, setEditedHeightM] = useState(0.75);
  const [editedPrice, setEditedPrice] = useState<number | undefined>(undefined);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleStartAnalysis = async () => {
    if (!url.trim()) return;
    setIsLoading(true);
    setErrorMessage(null);
    setStage('ANALYZING');

    try {
      const res = await ProductService.importFromUrl(url.trim(), projectId, aiAssisted);
      setImportResult(res);

      if (res.product) {
        setEditedName(res.product.name);
        setEditedBrand(res.product.brand || '');
        setEditedCategory(res.product.category || 'Mobiliario');
        setEditedWidthM(res.product.dimensions?.widthM || 1.0);
        setEditedDepthM(res.product.dimensions?.depthM || 0.6);
        setEditedHeightM(res.product.dimensions?.heightM || 0.75);
        setEditedPrice(res.product.price ?? undefined);
        setSelectedVariantId(res.variants[0]?.id || null);
      }
      setStage('REVIEW');
    } catch (err: any) {
      setErrorMessage(err.message || t('products.importError', 'Error al analizar la página del producto.'));
      setStage('URL_INPUT');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmAndSave = async () => {
    if (!importResult?.product) return;
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const originalProduct = importResult.product;
      const dimCheck = ProductProvenanceEngine.handleDimensionModification(
        originalProduct.dimensions?.widthM || 1.0,
        originalProduct.dimensions?.depthM || 0.6,
        originalProduct.dimensions?.heightM || 0.75,
        Number(editedWidthM),
        Number(editedDepthM),
        Number(editedHeightM)
      );

      const productPayload: Partial<ProductDto> = {
        ...originalProduct,
        name: editedName,
        brand: editedBrand || null,
        category: editedCategory,
        price: editedPrice !== undefined ? Number(editedPrice) : null,
        verificationStatus: dimCheck.verificationStatus,
        dimensions: {
          ...originalProduct.dimensions,
          widthM: Number(editedWidthM),
          depthM: Number(editedDepthM),
          heightM: Number(editedHeightM),
          isCustomized: dimCheck.isModified,
        },
      };

      const saveRes = await ProductService.confirmAndSave(productPayload, createTwin);
      setStage('SUCCESS');
      setTimeout(() => {
        onSuccess(saveRes.product);
        handleClose();
      }, 1200);
    } catch (err: any) {
      setErrorMessage(err.message || t('products.saveError', 'Error al guardar el producto.'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setStage('URL_INPUT');
    setUrl('');
    setImportResult(null);
    setErrorMessage(null);
    onClose();
  };

  const setExampleUrl = (example: string) => {
    setUrl(example);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Cabecera */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {t('products.importModalTitle', 'Importar Producto y Crear Gemelo Digital')}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {t('products.importModalSubtitle', 'Extrae datos oficiales de catálogo y conviértelos en mobiliario 2D/3D')}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenido según etapa */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {errorMessage && (
            <div className="p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
              <p className="text-sm text-red-700 dark:text-red-300">{errorMessage}</p>
            </div>
          )}

          {/* ETAPA 1: ENTRADA DE URL */}
          {stage === 'URL_INPUT' && (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  {t('products.urlLabel', 'URL del producto')}
                </label>
                <div className="relative">
                  <LinkIcon className="absolute left-3.5 top-3.5 w-5 h-5 text-gray-400" />
                  <Input
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://www.ikea.com/es/es/p/klippan-sofa-2-plazas-vissle-gris..."
                    className="pl-11 pr-4 py-3 text-sm rounded-xl"
                  />
                </div>
              </div>

              {/* Ejemplos rápidos */}
              <div className="space-y-2">
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  {t('products.quickExamples', 'Ejemplos compatibles:')}
                </span>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setExampleUrl('https://www.ikea.com/es/es/p/kallax-estanteria-blanco-80275887/')}
                    className="px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg transition-colors flex items-center space-x-1"
                  >
                    <span>IKEA Kallax Estantería</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setExampleUrl('https://www.ikea.com/es/es/p/strandmon-sillon-orejero-nordvalla-gris-oscuro-70300424/')}
                    className="px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg transition-colors flex items-center space-x-1"
                  >
                    <span>IKEA Strandmon Sillón</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setExampleUrl('https://www.ikea.com/es/es/p/malm-cama-alta-con-almacenaje-blanco-20404806/')}
                    className="px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg transition-colors flex items-center space-x-1"
                  >
                    <span>IKEA Malm Cama</span>
                  </button>
                </div>
              </div>

              {/* Opciones de importación */}
              <div className="p-4 bg-gray-50 dark:bg-gray-800/60 rounded-xl space-y-3">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={aiAssisted}
                    onChange={(e) => setAiAssisted(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 dark:bg-gray-700"
                  />
                  <div className="text-sm">
                    <span className="font-medium text-gray-800 dark:text-gray-200 flex items-center space-x-1.5">
                      <Sparkles className="w-4 h-4 text-emerald-500" />
                      <span>{t('products.aiAssistedLabel', 'Asistencia por Inteligencia Artificial')}</span>
                    </span>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {t('products.aiAssistedDesc', 'Clasifica categorías y estima materiales si faltan datos en la página.')}
                    </p>
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* ETAPA 2: ANALIZANDO */}
          {stage === 'ANALYZING' && (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-4 border-emerald-500/20 border-t-emerald-500 animate-spin flex items-center justify-center"></div>
                <Sparkles className="w-6 h-6 text-emerald-500 absolute inset-0 m-auto animate-pulse" />
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-bold text-gray-900 dark:text-white">
                  {t('products.analyzingTitle', 'Analizando producto y extrayendo metadatos...')}
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 max-w-md">
                  {t('products.analyzingSubtitle', 'Consultando JSON-LD, microformatos, dimensiones reales y fotografías de catálogo.')}
                </p>
              </div>
            </div>
          )}

          {/* ETAPA 3: REVISIÓN DE DATOS EXTRAÍDOS */}
          {stage === 'REVIEW' && importResult?.product && (
            <div className="space-y-6">
              {/* Resumen de Procedencia y Confianza */}
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 rounded-xl flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-bold text-emerald-950 dark:text-emerald-200">
                        {importResult.provenance === 'OFFICIAL_PRODUCT_DATA'
                          ? t('products.officialData', 'Datos Oficiales del Fabricante')
                          : t('products.importedData', 'Datos Importados')}
                      </span>
                      <Badge variant={importResult.confidenceLevel === 'HIGH' ? 'success' : 'warning'}>
                        {t('products.confidence', 'Confianza')}: {Math.round(importResult.confidence * 100)}%
                      </Badge>
                    </div>
                    <p className="text-xs text-emerald-800 dark:text-emerald-300">
                      {t('products.source', 'Fuente')}: {importResult.sourceDomain}
                    </p>
                  </div>
                </div>
                <a
                  href={importResult.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 flex items-center space-x-1"
                >
                  <span>{t('products.viewSource', 'Ver web')}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              {/* Advertencias si las hay */}
              {importResult.warnings.length > 0 && (
                <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl text-xs text-amber-800 dark:text-amber-300 space-y-1">
                  <div className="font-semibold flex items-center space-x-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>{t('products.warningsTitle', 'Advertencias de importación:')}</span>
                  </div>
                  <ul className="list-disc pl-5 space-y-0.5">
                    {importResult.warnings.map((w, idx) => (
                      <li key={idx}>{w}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Formulario de Revisión */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3 md:col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                    {t('products.name', 'Nombre del Producto')}
                  </label>
                  <Input
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    className="text-sm rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    {t('products.brand', 'Marca / Fabricante')}
                  </label>
                  <Input
                    value={editedBrand}
                    onChange={(e) => setEditedBrand(e.target.value)}
                    className="text-sm rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    {t('products.category', 'Categoría')}
                  </label>
                  <Input
                    value={editedCategory}
                    onChange={(e) => setEditedCategory(e.target.value)}
                    className="text-sm rounded-lg"
                  />
                </div>

                {/* Dimensiones Reales */}
                <div className="md:col-span-2 p-4 bg-gray-50 dark:bg-gray-800/40 rounded-xl border border-gray-200 dark:border-gray-700 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                      {t('products.realDimensions', 'Dimensiones Reales (Metros)')}
                    </span>
                    <Badge variant="info">1 m = 100 cm</Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Ancho (m)</label>
                      <Input
                        type="number"
                        step="0.01"
                        value={editedWidthM}
                        onChange={(e) => setEditedWidthM(parseFloat(e.target.value) || 0)}
                        className="text-sm rounded-lg font-mono font-bold"
                      />
                      <span className="text-[10px] text-gray-400">{(editedWidthM * 100).toFixed(0)} cm</span>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Fondo / Prof. (m)</label>
                      <Input
                        type="number"
                        step="0.01"
                        value={editedDepthM}
                        onChange={(e) => setEditedDepthM(parseFloat(e.target.value) || 0)}
                        className="text-sm rounded-lg font-mono font-bold"
                      />
                      <span className="text-[10px] text-gray-400">{(editedDepthM * 100).toFixed(0)} cm</span>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Alto (m)</label>
                      <Input
                        type="number"
                        step="0.01"
                        value={editedHeightM}
                        onChange={(e) => setEditedHeightM(parseFloat(e.target.value) || 0)}
                        className="text-sm rounded-lg font-mono font-bold"
                      />
                      <span className="text-[10px] text-gray-400">{(editedHeightM * 100).toFixed(0)} cm</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    {t('products.price', 'Precio')} ({importResult.product.currency})
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    value={editedPrice ?? ''}
                    onChange={(e) => setEditedPrice(e.target.value ? parseFloat(e.target.value) : undefined)}
                    placeholder="0.00"
                    className="text-sm rounded-lg font-mono"
                  />
                </div>

                <div className="flex items-center">
                  <label className="flex items-center space-x-2 cursor-pointer mt-4">
                    <input
                      type="checkbox"
                      checked={createTwin}
                      onChange={(e) => setCreateTwin(e.target.checked)}
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 dark:bg-gray-700"
                    />
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                      {t('products.createTwinCheckbox', 'Crear Gemelo Digital para diseñador 2D/3D')}
                    </span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* ETAPA 4: ÉXITO */}
          {stage === 'SUCCESS' && (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center animate-bounce">
                <PackageCheck className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-bold text-gray-900 dark:text-white">
                  {t('products.importSuccessTitle', '¡Producto importado con éxito!')}
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {t('products.importSuccessDesc', 'El producto y su Gemelo Digital ya están disponibles en tu biblioteca y en el diseñador 2D/3D.')}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Pie de modal */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 flex items-center justify-between">
          {stage === 'URL_INPUT' && (
            <>
              <Button variant="outline" onClick={handleClose}>
                {t('common.cancel', 'Cancelar')}
              </Button>
              <Button
                variant="primary"
                onClick={handleStartAnalysis}
                disabled={!url.trim() || isLoading}
                className="flex items-center space-x-2"
              >
                <span>{t('products.analyzeButton', 'Analizar Producto')}</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </>
          )}

          {stage === 'REVIEW' && (
            <>
              <Button
                variant="outline"
                onClick={() => setStage('URL_INPUT')}
                disabled={isLoading}
                className="flex items-center space-x-1.5"
              >
                <RotateCcw className="w-4 h-4" />
                <span>{t('common.back', 'Atrás')}</span>
              </Button>
              <Button
                variant="primary"
                onClick={handleConfirmAndSave}
                disabled={isLoading}
                className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Check className="w-4 h-4" />
                )}
                <span>{t('products.confirmAndSave', 'Confirmar y Guardar')}</span>
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
