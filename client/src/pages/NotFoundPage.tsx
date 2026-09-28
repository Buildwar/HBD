import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Layers } from 'lucide-react';
import { Button } from '../components/ui/Button.js';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-screen flex flex-col items-center justify-center p-6 bg-dark-bg text-center space-y-4">
      <div className="w-16 h-16 rounded-2xl bg-brand-500/20 text-brand-400 border border-brand-500/30 flex items-center justify-center">
        <Layers size={32} />
      </div>
      <h2 className="text-3xl font-extrabold text-white">404 — Página no encontrada</h2>
      <p className="text-sm text-gray-400 max-w-sm">
        La ruta a la que intentas acceder no existe en la plataforma HBD.
      </p>
      <Button onClick={() => navigate('/dashboard')} className="mt-2">
        Volver al Dashboard
      </Button>
    </div>
  );
};
