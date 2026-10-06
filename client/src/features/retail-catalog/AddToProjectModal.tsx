import React, { useState, useEffect } from 'react';
import { Layers, Plus, CheckCircle2, AlertTriangle, XCircle, DollarSign, ShoppingBag, FolderKanban } from 'lucide-react';
import { Modal } from '../../components/ui/Modal.js';
import { Button } from '../../components/ui/Button.js';
import { Input } from '../../components/ui/Input.js';
import { projectService } from '../../services/project.service.js';
import { retailCatalogService } from '../../services/retailCatalog.service.js';
import type { RetailProductDto, RetailProductVariantDto } from '@hbd/shared';

interface AddToProjectModalProps {
  isOpen: boolean;
  product: RetailProductDto | null;
  selectedVariant?: RetailProductVariantDto;
  onClose: () => void;
  onSuccess: (message: string) => void;
}

export const AddToProjectModal: React.FC<AddToProjectModalProps> = ({
  isOpen,
  product,
  selectedVariant,
  onClose,
  onSuccess,
}) => {
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [targetRoomName, setTargetRoomName] = useState<string>('Salón Principal');
  const [quantity, setQuantity] = useState<number>(1);
  const [placeOnPlan, setPlaceOnPlan] = useState<boolean>(true);
  const [addToFinancial, setAddToFinancial] = useState<boolean>(true);
  const [addToProcurement, setAddToProcurement] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadProjects();
    }
  }, [isOpen]);

  const loadProjects = async () => {
    try {
      const res = await projectService.getProjects();
      if (res.data && res.data.length > 0) {
        setProjects(res.data);
        setSelectedProjectId(res.data[0].id);
      }
    } catch {
      // Ignore
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product || !selectedProjectId) return;

    try {
      setLoading(true);
      setError(null);

      const targetProject = projects.find((p) => p.id === selectedProjectId);
      const floorId = targetProject?.floors?.[0]?.id;

      const res = await retailCatalogService.addProductToProject(selectedProjectId, {
        productId: product.id,
        variantId: selectedVariant?.id,
        floorId,
        roomName: targetRoomName,
        quantity,
        placeOnPlan,
        addToFinancial,
        addToProcurement,
      });

      if (res.success) {
        onSuccess(res.data.message || `Producto '${product.name}' añadido al proyecto.`);
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'Error al añadir el producto al proyecto.');
    } finally {
      setLoading(false);
    }
  };

  if (!product) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Añadir Producto al Proyecto"
      description={`Configura la asignación espacial y financiera para "${product.name}".`}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
            <XCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Resumen del producto a añadir */}
        <div className="p-3 rounded-xl bg-dark-bg/60 border border-dark-border/50 flex items-center gap-3">
          {product.primaryImageUrl && (
            <img
              src={product.primaryImageUrl}
              alt={product.name}
              className="w-12 h-12 object-contain rounded-lg bg-dark-card p-1 border border-dark-border"
            />
          )}
          <div className="overflow-hidden">
            <p className="text-xs font-bold text-white truncate">{product.name}</p>
            <span className="text-[11px] text-gray-400 font-mono">
              {product.dimensions.widthM}×{product.dimensions.depthM}×{product.dimensions.heightM} m | {product.price.amount} {product.price.currency}
            </span>
          </div>
        </div>

        {/* Selección de Proyecto */}
        <div>
          <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
            Proyecto de Destino
          </label>
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            required
            className="w-full bg-dark-card border border-dark-border rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-primary-500"
          >
            {projects.map((proj) => (
              <option key={proj.id} value={proj.id}>
                {proj.name} ({proj.propertyType || 'Residencial'})
              </option>
            ))}
          </select>
        </div>

        {/* Habitación o Espacio */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
              Habitación / Espacio
            </label>
            <input
              type="text"
              value={targetRoomName}
              onChange={(e) => setTargetRoomName(e.target.value)}
              placeholder="Ej. Salón, Dormitorio 1..."
              className="w-full bg-dark-card border border-dark-border rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-primary-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
              Cantidad de Unidades
            </label>
            <input
              type="number"
              min="1"
              max="99"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value, 10) || 1)}
              className="w-full bg-dark-card border border-dark-border rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-primary-500"
            />
          </div>
        </div>

        {/* Opciones de Integración Cruzada (V1-V18) */}
        <div className="space-y-2.5 pt-2 border-t border-dark-border/50">
          <label className="text-xs font-bold text-gray-300 uppercase tracking-wider block">
            Integración de Motores HBD
          </label>

          <label className="flex items-center gap-3 p-2.5 rounded-lg bg-dark-bg/40 border border-dark-border/40 cursor-pointer hover:border-dark-border">
            <input
              type="checkbox"
              checked={placeOnPlan}
              onChange={(e) => setPlaceOnPlan(e.target.checked)}
              className="w-4 h-4 text-primary-500 rounded bg-dark-card border-dark-border"
            />
            <div className="flex items-center gap-2">
              <Layers size={14} className="text-primary-400" />
              <span className="text-xs text-gray-200">
                Colocar en plano 2D como Mueble interactivo
              </span>
            </div>
          </label>

          <label className="flex items-center gap-3 p-2.5 rounded-lg bg-dark-bg/40 border border-dark-border/40 cursor-pointer hover:border-dark-border">
            <input
              type="checkbox"
              checked={addToFinancial}
              onChange={(e) => setAddToFinancial(e.target.checked)}
              className="w-4 h-4 text-primary-500 rounded bg-dark-card border-dark-border"
            />
            <div className="flex items-center gap-2">
              <DollarSign size={14} className="text-emerald-400" />
              <span className="text-xs text-gray-200">
                Incorporar al Presupuesto de Inversión (V17 Financial)
              </span>
            </div>
          </label>

          <label className="flex items-center gap-3 p-2.5 rounded-lg bg-dark-bg/40 border border-dark-border/40 cursor-pointer hover:border-dark-border">
            <input
              type="checkbox"
              checked={addToProcurement}
              onChange={(e) => setAddToProcurement(e.target.checked)}
              className="w-4 h-4 text-primary-500 rounded bg-dark-card border-dark-border"
            />
            <div className="flex items-center gap-2">
              <ShoppingBag size={14} className="text-amber-400" />
              <span className="text-xs text-gray-200">
                Planificar en Órdenes de Compra (V18 Procurement)
              </span>
            </div>
          </label>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-dark-border">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" disabled={loading || !selectedProjectId}>
            {loading ? 'Añadiendo...' : 'Confirmar e Integrar'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
