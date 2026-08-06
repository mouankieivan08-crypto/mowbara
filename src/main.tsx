import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AppStateProvider } from './AppStateContext';
import { logger } from './logger';
import './i18n';
import './index.css';

// Enregistrement sécurisé du Service Worker de la PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        logger.info('ServiceWorker enregistré avec succès', { scope: registration.scope });
      })
      .catch((err) => {
        logger.error('Échec de l\'enregistrement du ServiceWorker', err);
      });
  });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppStateProvider>
      <App />
    </AppStateProvider>
  </React.StrictMode>
);
