import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './styles/index.css';
import './i18n';
import App from './App';
import { AppStoreProvider } from './store/AppStore';
import { ToastProvider } from './components/feedback/Toast';
import { ErrorBoundary } from './components/feedback/ErrorBoundary';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary variant="app">
      {/* basename follows Vite's `base`, so the app also works when deployed under a sub-path. */}
      <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, '') || '/'}>
        <AppStoreProvider>
          <ToastProvider>
            <App />
          </ToastProvider>
        </AppStoreProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>,
);
