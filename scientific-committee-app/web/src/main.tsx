import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { ScopeProvider, ToastProvider } from './components/ui';
import './styles.css';

const container = document.getElementById('root');
if (!container) throw new Error('عنصر الجذر غير موجود في الصفحة.');

createRoot(container).render(
  <StrictMode>
    <BrowserRouter>
      <ScopeProvider>
        <ToastProvider>
          <App />
        </ToastProvider>
      </ScopeProvider>
    </BrowserRouter>
  </StrictMode>,
);
