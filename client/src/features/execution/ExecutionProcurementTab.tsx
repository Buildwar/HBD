import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Package,
  Truck,
  Plus,
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileText,
} from 'lucide-react';
import { ExecutionProjectDto, MaterialDeliveryDto, MaterialDeliveryStatus } from '@hbd/shared';
import { Card } from '../../components/ui/Card.js';
import { Badge } from '../../components/ui/Badge.js';
import { Button } from '../../components/ui/Button.js';
import { Modal } from '../../components/ui/Modal.js';
import { Input } from '../../components/ui/Input.js';

interface ExecutionProcurementTabProps {
  execution: ExecutionProjectDto;
  onCreateDelivery: (deliveryData: Partial<MaterialDeliveryDto>) => Promise<void>;
}

export const ExecutionProcurementTab: React.FC<ExecutionProcurementTabProps> = ({
  execution,
  onCreateDelivery,
}) => {
  const { t } = useTranslation();
  const [isNewDeliveryModalOpen, setIsNewDeliveryModalOpen] = useState<boolean>(false);
  const [materialName, setMaterialName] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [unit, setUnit] = useState<string>('ud');
  const [expectedDate, setExpectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [location, setLocation] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  const getDeliveryStatusBadge = (status: MaterialDeliveryStatus) => {
    switch (status) {
      case 'DELIVERED':
        return <Badge variant="brand">Entregado</Badge>;
      case 'IN_TRANSIT':
        return <Badge variant="info">En Camino</Badge>;
      case 'DELAYED':
        return <Badge variant="danger">Retrasado</Badge>;
      case 'ORDERED':
        return <Badge variant="warning">Pedido</Badge>;
      default:
        return <Badge variant="gray">Previsto</Badge>;
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!materialName.trim()) return;

    await onCreateDelivery({
      materialName,
      quantity,
      unit,
      expectedDate: new Date(expectedDate).toISOString(),
      location: location || null,
      notes: notes || null,
      status: 'EXPECTED',
    });

    setIsNewDeliveryModalOpen(false);
    setMaterialName('');
    setQuantity(1);
    setLocation('');
    setNotes('');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-white">
            {t('execution.procurement.title', 'Aprovisionamiento, Materiales y Entregas')}
          </h3>
          <p className="text-xs text-gray-400">
            Control de pedidos a proveedores, recepción de mercancías en obra y consumo real.
          </p>
        </div>

        <Button
          size="sm"
          variant="primary"
          icon={<Plus size={15} />}
          onClick={() => setIsNewDeliveryModalOpen(true)}
        >
          Registrar Entrega
        </Button>
      </div>

      {/* Grid de 2 Secciones: Inventario de Materiales & Calendario de Entregas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Inventario y Consumo de Materiales */}
        <Card className="p-5 bg-dark-surface border-dark-border space-y-4">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-dark-border/60 pb-3">
            <Package size={15} className="text-brand-400" /> Inventario de Partidas de Obra
          </h4>

          <div className="space-y-2.5 max-h-[480px] overflow-y-auto">
            {execution.materials.map((mat) => (
              <div
                key={mat.id}
                className="p-3 rounded-xl bg-dark-card border border-dark-border/60 text-xs space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-gray-200">{mat.name}</span>
                  <Badge variant="gray">{mat.category}</Badge>
                </div>
                <div className="grid grid-cols-4 gap-2 text-[11px] text-gray-400 pt-1">
                  <div>
                    <span>Plan:</span>{' '}
                    <strong className="text-gray-200">
                      {mat.plannedQuantity} {mat.unit}
                    </strong>
                  </div>
                  <div>
                    <span>Recibido:</span>{' '}
                    <strong className="text-sky-400">
                      {mat.receivedQuantity} {mat.unit}
                    </strong>
                  </div>
                  <div>
                    <span>Usado:</span>{' '}
                    <strong className="text-emerald-400">
                      {mat.usedQuantity} {mat.unit}
                    </strong>
                  </div>
                  <div>
                    <span>Merma:</span>{' '}
                    <strong className="text-amber-400">
                      {mat.wasteQuantity} {mat.unit}
                    </strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Entregas y Envíos */}
        <Card className="p-5 bg-dark-surface border-dark-border space-y-4">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-dark-border/60 pb-3">
            <Truck size={15} className="text-sky-400" /> Entregas Programadas y Recibidas
          </h4>

          <div className="space-y-2.5 max-h-[480px] overflow-y-auto">
            {execution.deliveries.length === 0 ? (
              <p className="text-xs text-gray-500 py-6 text-center">
                No hay entregas registradas todavía. Pulsa "Registrar Entrega" para programar una.
              </p>
            ) : (
              execution.deliveries.map((del) => (
                <div
                  key={del.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-dark-card border border-dark-border/60 text-xs"
                >
                  <div className="space-y-0.5">
                    <p className="font-bold text-gray-200">{del.materialName}</p>
                    <p className="text-[11px] text-gray-400">
                      Cant: {del.quantity} {del.unit} • Fecha: {del.expectedDate.split('T')[0]}
                      {del.location ? ` • Ubic: ${del.location}` : ''}
                    </p>
                  </div>
                  <div>{getDeliveryStatusBadge(del.status)}</div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Modal Registrar Entrega */}
      <Modal
        isOpen={isNewDeliveryModalOpen}
        onClose={() => setIsNewDeliveryModalOpen(false)}
        title="Registrar Entrega de Material"
        maxWidth="md"
      >
        <form onSubmit={handleCreate} className="space-y-4 text-xs">
          <div>
            <label className="block text-gray-300 font-semibold mb-1">Nombre del Material</label>
            <Input
              value={materialName}
              onChange={(e) => setMaterialName(e.target.value)}
              placeholder="Ej. Baldosas porcelánicas, Cemento cola, Tubería multicapa..."
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-300 font-semibold mb-1">Cantidad</label>
              <Input
                type="number"
                step="0.1"
                min="0.1"
                value={quantity}
                onChange={(e) => setQuantity(parseFloat(e.target.value) || 1)}
                required
              />
            </div>
            <div>
              <label className="block text-gray-300 font-semibold mb-1">Unidad</label>
              <Input
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="ud, m2, kg, sacos..."
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-300 font-semibold mb-1">Fecha Prevista</label>
              <Input
                type="date"
                value={expectedDate}
                onChange={(e) => setExpectedDate(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-gray-300 font-semibold mb-1">Ubicación de Descarga</label>
              <Input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Ej. Planta 1, Salón, Garaje..."
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-300 font-semibold mb-1">Observaciones</label>
            <Input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ej. Contacto transportista, paletizado..."
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" type="button" onClick={() => setIsNewDeliveryModalOpen(false)}>
              Cancelar
            </Button>
            <Button variant="primary" type="submit">
              Guardar Entrega
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
