/**
 * HBD — HOME BOARD DESIGNER
 * V16.0.0 — PRODUCT SHOPPING LIST TAB
 *
 * Autor: Adrián Palma
 * Copyright: © 2026 Adrián Palma. Todos los derechos reservados.
 */

import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ShoppingBag,
  Download,
  ExternalLink,
  Package,
  CheckCircle2,
  Clock,
  Euro,
  Layers,
  Building,
} from 'lucide-react';
import { Button } from '../../components/ui/Button.js';
import { Badge } from '../../components/ui/Badge.js';
import { ProductService, ShoppingListResponse } from '../../services/product.service.js';

interface ProductShoppingListTabProps {
  projectId: string;
}

export const ProductShoppingListTab: React.FC<ProductShoppingListTabProps> = ({ projectId }) => {
  const { t } = useTranslation();
  const [data, setData] = useState<ShoppingListResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadShoppingList = async () => {
    setIsLoading(true);
    try {
      const res = await ProductService.getProjectShoppingList(projectId);
      setData(res);
    } catch (err) {
      console.error('Error loading shopping list', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) {
      loadShoppingList();
    }
  }, [projectId]);

  const handleExportCsv = () => {
    if (!data?.items || data.items.length === 0) return;

    const headers = ['Producto', 'Marca', 'SKU', 'Estancia', 'Cantidad', 'Precio Unitario', 'Total', 'Moneda', 'Estado', 'Enlace'];
    const rows = data.items.map((i) => [
      `"${i.productName.replace(/"/g, '""')}"`,
      `"${(i.brand || '').replace(/"/g, '""')}"`,
      `"${(i.sku || '').replace(/"/g, '""')}"`,
      `"${(i.targetRoomName || 'General').replace(/"/g, '""')}"`,
      i.quantity,
      i.unitPrice,
      i.totalPrice,
      i.currency,
      i.status,
      `"${i.sourceUrl || ''}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `lista_compra_mobiliario_proyecto_${projectId}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return (
      <div className="py-12 flex justify-center items-center text-gray-500">
        <div className="w-8 h-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin"></div>
      </div>
    );
  }

  const items = data?.items || [];
  const summary = data?.summary || { totalAmount: 0, totalItemsCount: 0, currency: 'EUR' };

  return (
    <div className="space-y-6">
      {/* Resumen Superior */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl">
            <Euro className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold uppercase text-gray-400">Presupuesto Mobiliario</span>
            <h3 className="text-2xl font-black text-gray-900 dark:text-white font-mono">
              {summary.totalAmount.toFixed(2)} {summary.currency}
            </h3>
          </div>
        </div>

        <div className="p-5 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold uppercase text-gray-400">Total Unidades</span>
            <h3 className="text-2xl font-black text-gray-900 dark:text-white font-mono">
              {summary.totalItemsCount}
            </h3>
          </div>
        </div>

        <div className="p-5 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold uppercase text-gray-400">Exportar Ficha</span>
            <p className="text-xs text-gray-500 dark:text-gray-400">Descarga lista para compras o presupuesto</p>
          </div>
          <Button
            variant="outline"
            onClick={handleExportCsv}
            disabled={items.length === 0}
            className="flex items-center space-x-1.5"
          >
            <Download className="w-4 h-4" />
            <span>CSV</span>
          </Button>
        </div>
      </div>

      {/* Tabla de Productos */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShoppingBag className="w-5 h-5 text-emerald-500" />
            <h3 className="font-bold text-gray-900 dark:text-white">
              {t('products.shoppingListTitle', 'Lista de Mobiliario y Materiales del Proyecto')}
            </h3>
          </div>
          <span className="text-xs text-gray-500">{items.length} productos registrados</span>
        </div>

        {items.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <Package className="w-12 h-12 text-gray-300 dark:text-gray-700 mx-auto" />
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {t('products.emptyShoppingList', 'No hay productos de catálogo asignados a este proyecto.')}
            </p>
            <p className="text-xs text-gray-400 max-w-sm mx-auto">
              Importa productos desde URLs oficiales (IKEA, etc.) y asígnalos a tus habitaciones.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 dark:bg-gray-800/60 text-gray-500 dark:text-gray-400 text-xs font-semibold border-b border-gray-200 dark:border-gray-800">
                <tr>
                  <th className="px-6 py-3.5">Producto</th>
                  <th className="px-4 py-3.5">Estancia / Ubicación</th>
                  <th className="px-4 py-3.5 text-center">Cantidad</th>
                  <th className="px-4 py-3.5 text-right">Precio Unit.</th>
                  <th className="px-6 py-3.5 text-right">Total</th>
                  <th className="px-4 py-3.5 text-center">Estado</th>
                  <th className="px-4 py-3.5 text-center">Tienda</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800 font-medium">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/40 transition-colors">
                    <td className="px-6 py-4 flex items-center space-x-3">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt=""
                          className="w-10 h-10 rounded-lg object-cover bg-gray-100 dark:bg-gray-800 border shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400 shrink-0">
                          <Package className="w-5 h-5" />
                        </div>
                      )}
                      <div>
                        <span className="font-bold text-gray-900 dark:text-white block">{item.productName}</span>
                        <div className="text-xs text-gray-400 space-x-2">
                          {item.brand && <span className="text-emerald-600 font-semibold">{item.brand}</span>}
                          {item.sku && <span>Ref: {item.sku}</span>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-xs text-gray-600 dark:text-gray-300">
                      <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-md">
                        {item.targetRoomName || 'General'}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center font-mono font-bold">{item.quantity}</td>
                    <td className="px-4 py-4 text-right font-mono text-gray-600 dark:text-gray-400">
                      {item.unitPrice.toFixed(2)} {item.currency}
                    </td>
                    <td className="px-6 py-4 text-right font-mono font-bold text-gray-900 dark:text-white">
                      {item.totalPrice.toFixed(2)} {item.currency}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <Badge variant="brand">{item.status}</Badge>
                    </td>
                    <td className="px-4 py-4 text-center">
                      {item.sourceUrl ? (
                        <a
                          href={item.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 inline-block"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      ) : (
                        <span className="text-xs text-gray-400">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
