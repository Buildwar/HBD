import React from 'react';

export const PageLoader: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] p-8 space-y-4">
      <div className="relative w-12 h-12">
        <div className="w-12 h-12 border-3 border-brand-500/20 border-t-brand-500 rounded-full animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-2.5 h-2.5 bg-brand-500 rounded-full animate-pulse" />
        </div>
      </div>
      <p className="text-xs font-medium text-slate-400 animate-pulse tracking-wide uppercase">
        Cargando módulo...
      </p>
    </div>
  );
};
