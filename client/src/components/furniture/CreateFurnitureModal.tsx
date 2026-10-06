import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Armchair, Sparkles, AlertCircle, Plus, CheckCircle2 } from 'lucide-react';
import { Modal } from '../ui/Modal.js';
import { Button } from '../ui/Button.js';
import { Input } from '../ui/Input.js';
import { FurnitureCategoryDto, FurnitureEngine, DimensionUnit } from '@hbd/shared';
import { furnitureService } from '../../services/furniture.service.js';

interface CreateFurnitureModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: FurnitureCategoryDto[];
  onFurnitureCreated: (newFurniture: any) => void;
  initialData?: any;
}

export const CreateFurnitureModal: React.FC<CreateFurnitureModalProps> = ({
  isOpen,
  onClose,
  categories,
  onFurnitureCreated,
  initialData,
}) => {
  const { t } = useTranslation();
  const [name, setName] = useState<string>('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [unit, setUnit] = useState<DimensionUnit>('cm');
  const [widthInput, setWidthInput] = useState<string>('240');
  const [depthInput, setDepthInput] = useState<string>('95');
  const [heightInput, setHeightInput] = useState<string>('85');
  const [description, setDescription] = useState<string>('');
  const [imageUrl, setImageUrl] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setCategoryId(initialData.categoryId || (categories[0]?.id ?? ''));
      setWidthInput(String(Math.round(initialData.defaultWidthM * 100)));
      setDepthInput(String(Math.round(initialData.defaultDepthM * 100)));
      setHeightInput(String(Math.round(initialData.defaultHeightM * 100)));
      setDescription(initialData.description || '');
      setImageUrl(initialData.imageUrl || '');
    } else {
      setName('');
      setCategoryId(categories[0]?.id ?? '');
      setWidthInput('240');
      setDepthInput('95');
      setHeightInput('85');
      setDescription('');
      setImageUrl('');
    }
    setErrorMsg(null);
  }, [initialData, categories, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const rawW = parseFloat(widthInput);
    const rawD = parseFloat(depthInput);
    const rawH = parseFloat(heightInput);

    // Convert from user unit (cm/mm/m) to internal meters
    const widthM = FurnitureEngine.convertUnit(rawW, unit, 'm');
    const depthM = FurnitureEngine.convertUnit(rawD, unit, 'm');
    const heightM = FurnitureEngine.convertUnit(rawH, unit, 'm');

    const validation = FurnitureEngine.validateDimensions(widthM, depthM, heightM);
    if (!validation.isValid) {
      setErrorMsg(validation.error || t('furniture.invalidDimensions'));
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await furnitureService.createFurniture({
        name,
        categoryId: categoryId || categories[0]?.id,
        widthM,
        depthM,
        heightM,
        description,
        imageUrl: imageUrl || undefined,
      });

      if (res.success && res.data) {
        onFurnitureCreated(res.data);
        onClose();
      }
    } catch (err: any) {
      setErrorMsg(err.message || t('furniture.saveError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? t('furniture.editFurniture') : t('furniture.createCustom')}
      description={t('furniture.defineReal')}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 flex items-center gap-2">
            <AlertCircle size={15} className="shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <Input
          label={t('furniture.furnitureName')}
          placeholder={t('furniture.egSofa')}
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          autoFocus
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-[11px] font-semibold text-gray-300 block mb-1">{t('furniture.category')}</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-dark-card border border-dark-border text-xs text-white focus:outline-none focus:border-brand-500"
              required
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-gray-300 block mb-1">{t('furniture.unit')}</label>
            <div className="flex items-center gap-1.5 p-1 bg-dark-card rounded-xl border border-dark-border">
              {(['cm', 'm', 'mm'] as DimensionUnit[]).map((u) => (
                <button
                  key={u}
                  type="button"
                  onClick={() => setUnit(u)}
                  className={`flex-1 py-1 rounded-lg text-xs font-semibold uppercase transition-all ${
                    unit === u
                      ? 'bg-brand-500 text-white shadow-sm'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {u}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Dimensions Form */}
        <div className="p-3.5 rounded-xl bg-dark-card/60 border border-dark-border space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-200">{t('furniture.realDimensions')}</span>
            <span className="text-[10px] text-brand-400 font-mono">
              Vista: {widthInput} × {depthInput} × {heightInput} {unit}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <Input
              label={`${t('furniture.width')} (${unit})`}
              type="number"
              step="any"
              min="1"
              value={widthInput}
              onChange={(e) => setWidthInput(e.target.value)}
              required
            />
            <Input
              label={`${t('furniture.depth')} (${unit})`}
              type="number"
              step="any"
              min="1"
              value={depthInput}
              onChange={(e) => setDepthInput(e.target.value)}
              required
            />
            <Input
              label={`${t('furniture.height')} (${unit})`}
              type="number"
              step="any"
              min="1"
              value={heightInput}
              onChange={(e) => setHeightInput(e.target.value)}
              required
            />
          </div>
        </div>

        <Input
          label={t('furniture.description')}
          placeholder={t('furniture.egStructure')}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-dark-border">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting} icon={<Plus size={16} />}>
            {isSubmitting ? t('furniture.saving') : initialData ? t('furniture.update') : t('furniture.saveLib')}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
