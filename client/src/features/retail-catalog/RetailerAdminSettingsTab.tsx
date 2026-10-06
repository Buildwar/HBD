import React, { useState, useEffect } from 'react';
import { ShoppingBag, RefreshCw, Play, CheckCircle2, AlertTriangle, XCircle, ShieldCheck, Globe, Link, Cpu } from 'lucide-react';
import { Card } from '../../components/ui/Card.js';
import { Button } from '../../components/ui/Button.js';
import { Badge } from '../../components/ui/Badge.js';
import { retailCatalogService } from '../../services/retailCatalog.service.js';
import type { RetailerMetadata } from '@hbd/shared';

interface RetailerAdminSettingsTabProps {
  isAdmin: boolean;
  onShowSavedToast: () => void;
}

export const RetailerAdminSettingsTab: React.FC<RetailerAdminSettingsTabProps> = ({
  isAdmin,
  onShowSavedToast,
}) => {
  const [retailers, setRetailers] = useState<RetailerMetadata[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [syncing, setSyncing] = useState<boolean>(false);
  const [testingCode, setTestingCode] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    loadRetailers();
  }, []);

  const loadRetailers = async () => {
    try {
      setLoading(true);
      const res = await retailCatalogService.getRetailers();
      if (res.success && res.data) {
        setRetailers(res.data);
      }
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  const handleTestConnection = async (code: string) => {
    try {
      setTestingCode(code);
      setFeedback(null);
      const res = await retailCatalogService.testRetailerConnection(code);
      if (res.success) {
        setFeedback(`[${code}] ${res.data.message} (${res.data.latencyMs} ms)`);
      }
    } catch (err: any) {
      setFeedback(`[${code}] Error de conexión: ${err.message}`);
    } finally {
      setTestingCode(null);
    }
  };

  const handleSyncAll = async () => {
    if (!isAdmin) return;
    try {
      setSyncing(true);
      setFeedback(null);
      const res = await retailCatalogService.syncCatalog();
      if (res.success) {
        setFeedback(res.message);
        await loadRetailers();
        onShowSavedToast();
      }
    } catch (err: any) {
      setFeedback(`Error en la sincronización: ${err.message}`);
    } finally {
      setSyncing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return <Badge variant="success" className="text-[10px]">Disponible / Activo</Badge>;
      case 'MOCK':
        return <Badge variant="brand" className="text-[10px]">Mock Dataset</Badge>;
      case 'CONFIGURATION_REQUIRED':
        return <Badge variant="warning" className="text-[10px]">Requiere Configuración</Badge>;
      case 'DISABLED':
        return <Badge variant="gray" className="text-[10px]">Desactivado</Badge>;
      default:
        return <Badge variant="danger" className="text-[10px]">No Disponible</Badge>;
    }
  };

  if (loading) {
    return (
      <Card className="p-8 text-center text-gray-400">
        <div className="animate-spin w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full mx-auto mb-3" />
        <p className="text-xs">Cargando conectores de catálogo retail...</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-dark-border/60 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-500/10 text-primary-400 flex items-center justify-center">
              <ShoppingBag size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Conectores de Tiendas y Catálogo Retail</h3>
              <p className="text-xs text-gray-400">
                Gestión de orígenes de datos, feeds oficiales, capacidades declaradas y sincronización de catálogo.
              </p>
            </div>
          </div>
          {isAdmin && (
            <Button
              variant="primary"
              size="sm"
              onClick={handleSyncAll}
              disabled={syncing}
              className="text-xs flex items-center gap-1.5"
            >
              <RefreshCw size={14} className={syncing ? 'animate-spin' : ''} />
              {syncing ? 'Sincronizando...' : 'Sincronizar Todos'}
            </Button>
          )}
        </div>

        {feedback && (
          <div className="p-3 rounded-xl bg-primary-500/10 border border-primary-500/30 text-primary-300 text-xs flex items-center gap-2">
            <CheckCircle2 size={16} className="shrink-0 text-primary-400" />
            <span>{feedback}</span>
          </div>
        )}

        {/* Listado de Conectores Registrados */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {retailers.map((r) => (
            <div
              key={r.id}
              className="p-4 rounded-xl bg-dark-bg/60 border border-dark-border/60 flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">{r.name}</span>
                    <span className="text-[10px] font-mono text-gray-500">({r.code})</span>
                  </div>
                  {getStatusBadge(r.status)}
                </div>

                <p className="text-xs text-gray-400 leading-relaxed">
                  {r.notes || `Integración autorizada mediante ${r.integrationType}.`}
                </p>

                {/* Capacidades declaradas */}
                <div className="pt-2 flex flex-wrap gap-1">
                  {r.capabilities.map((cap) => (
                    <span
                      key={cap}
                      className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-dark-card border border-dark-border/60 text-gray-400"
                    >
                      {cap}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-dark-border/40 text-xs">
                <span className="text-gray-500 text-[11px]">
                  {r.productsCount} productos en catálogo
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleTestConnection(r.code)}
                    disabled={testingCode === r.code}
                    className="text-[11px] py-1 px-2.5"
                  >
                    <Play size={12} className={testingCode === r.code ? 'animate-spin' : ''} />
                    {testingCode === r.code ? 'Probando...' : 'Test'}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
