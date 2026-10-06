import React from 'react';
import ReactDOM from 'react-dom/client';
import './i18n/i18n.js';
import App from './App.js';
import './index.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
