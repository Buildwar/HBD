import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar.js';
import { CopilotSidepanel } from '../../features/copilot/CopilotSidepanel.js';
import { Bot, Sparkles } from 'lucide-react';

export const AppLayout: React.FC = () => {
  const { t } = useTranslation();
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-dark-bg text-gray-100 relative">
      <Sidebar />
      <main className="flex-1 flex flex-col h-screen overflow-y-auto bg-dark-bg relative">
        <Outlet />

        {/* Global Floating Copilot Button */}
        <button
          type="button"
          onClick={() => setIsCopilotOpen(true)}
          className="fixed bottom-5 right-5 z-40 px-4 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-2xl shadow-xl flex items-center gap-2.5 transition-all hover:scale-105 active:scale-95 border border-emerald-400/30 group"
          title={t('layout.openCopilot')}
        >
          <div className="w-6 h-6 rounded-lg bg-emerald-700/60 flex items-center justify-center text-emerald-200 group-hover:rotate-12 transition-transform">
            <Bot className="w-4 h-4" />
          </div>
          <span className="text-sm font-bold tracking-wide">{t('layout.copilotLabel')}</span>
          <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
        </button>

        {/* Global Copilot Sidepanel Drawer */}
        <CopilotSidepanel
          isOpen={isCopilotOpen}
          onClose={() => setIsCopilotOpen(false)}
        />
      </main>
    </div>
  );
};
