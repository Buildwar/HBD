import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar.js';

export const AppLayout: React.FC = () => {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-dark-bg text-gray-100">
      <Sidebar />
      <main className="flex-1 flex flex-col h-screen overflow-y-auto bg-dark-bg">
        <Outlet />
      </main>
    </div>
  );
};
