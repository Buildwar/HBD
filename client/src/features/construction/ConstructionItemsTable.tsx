import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Trash2,
  AlertTriangle,
  Layers,
  Percent,
  Calculator,
  Plus,
  Building,
} from 'lucide-react';
import { ConstructionItemDto } from '@hbd/shared';
import { Badge } from '../../components/ui/Badge.js';
import { Button } from '../../components/ui/Button.js';

interface ConstructionItemsTableProps {
  items: ConstructionItemDto[];
  onDeleteItem: (itemId: string) => void;
  onAddItemClick: () => void;
}

export const ConstructionItemsTable: React.FC<ConstructionItemsTableProps> = ({
  items,
  onDeleteItem,
  onAddItemClick,
}) => {
  const { t } = useTranslation();

  const getOperationBadge = (op: string) => {
    switch (op) {
      case 'DEMOLITION':
        return <Badge variant="danger">Demolición</Badge>;
      case 'CONSTRUCTION':
        return <Badge variant="brand">Construcción</Badge>;
      case 'INSTALLATION':
        return <Badge variant="warning">Instalación</Badge>;
      case 'FINISHING':
        return <Badge variant="info">Acabados</Badge>;
      default:
        return <Badge variant="gray">{op}</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Calculator size={16} className="text-brand-400" /> Partidas, Mediciones y Costes de Reforma
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            Cómputo detallado con mermas de material y separación de mano de obra.
          </p>
        </div>
        <Button size="sm" variant="primary" icon={<Plus size={15} />} onClick={onAddItemClick}>
          Nueva Partida
        </Button>
      </div>

      <div className="rounded-2xl bg-dark-surface border border-dark-border overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-300">
            <thead className="bg-dark-card border-b border-dark-border text-gray-400 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Operación</th>
                <th className="py-3 px-4">Partida / Concepto</th>
                <th className="py-3 px-4 text-center">Medición Base</th>
                <th className="py-3 px-4 text-center">Merma (%)</th>
                <th className="py-3 px-4 text-center">Cantidad Efectiva</th>
                <th className="py-3 px-4 text-right">Material</th>
                <th className="py-3 px-4 text-right">Mano de Obra</th>
                <th className="py-3 px-4 text-right">Total (€)</th>
                <th className="py-3 px-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-border/40">
              {items.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-gray-400">
                    No hay partidas de obra registradas aún. Haz clic en "Nueva Partida" para empezar.
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id} className="hover:bg-dark-hover/40 transition-colors">
                    <td className="py-3 px-4">{getOperationBadge(item.operation)}</td>
                    <td className="py-3 px-4 font-medium text-white">
                      <div className="flex items-center gap-2">
                        <span>{item.name}</span>
                        {item.requiresProValidation && (
                          <span
                            title="REQUIERE VALIDACIÓN PROFESIONAL: Afecta a elementos de albañilería/estructura/instalaciones"
                            className="text-amber-400 hover:text-amber-300 cursor-help"
                          >
                            <AlertTriangle size={14} />
                          </span>
                        )}
                      </div>
                      {item.description && (
                        <p className="text-[11px] text-gray-400 truncate max-w-xs mt-0.5">
                          {item.description}
                        </p>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center font-mono">
                      {item.quantity} {item.unit}
                    </td>
                    <td className="py-3 px-4 text-center font-mono text-amber-400">
                      +{item.wastePercent}%
                    </td>
                    <td className="py-3 px-4 text-center font-mono text-brand-400 font-bold">
                      {item.effectiveQuantity} {item.unit}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-gray-300">
                      {item.materialCost ? `${(item.materialCost * item.effectiveQuantity).toFixed(2)} €` : '—'}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-gray-300">
                      {item.laborCost ? `${(item.laborCost * item.quantity).toFixed(2)} €` : '—'}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-white">
                      {item.totalCost?.toFixed(2)} €
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => onDeleteItem(item.id)}
                        className="text-gray-400 hover:text-rose-400 p-1.5 rounded-lg hover:bg-dark-hover transition-colors"
                        title="Eliminar partida"
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
