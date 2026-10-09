import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './styles/index.css';
import './i18n';
import App from './App';
import { AppStoreProvider } from './store/AppStore';
import { ToastProvider } from './components/feedback/Toast';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AppStoreProvider>
        <ToastProvider>
          <App />
        </ToastProvider>
      </AppStoreProvider>
    </BrowserRouter>
  </StrictMode>,
);
