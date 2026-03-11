import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import './i18n/i18n';
import App from './pages/Login';
import ErrorBoundary from './ErrorBoundary';

// make camera features (nem állítja le a kamerát és nem találja olvassa le a kódot), make prod ready, format, lint

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>
);
