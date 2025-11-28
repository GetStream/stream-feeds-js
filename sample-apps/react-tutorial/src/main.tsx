import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary
      fallback={<div>Something went wrong. Try reloading the page.</div>}
    >
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
