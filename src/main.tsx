import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Global suppression of third-party browser extension errors (e.g. MetaMask or Web3 extensions injecting in sandboxed iframes)
if (typeof window !== 'undefined') {
  const isExtensionError = (error: any) => {
    if (!error) return false;
    const str = String(error?.message || error?.stack || error).toLowerCase();
    return (
      str.includes('metamask') ||
      str.includes('ethereum') ||
      str.includes('web3') ||
      str.includes('inpage') ||
      str.includes('wallet')
    );
  };

  window.addEventListener('unhandledrejection', (event) => {
    if (isExtensionError(event.reason)) {
      event.preventDefault();
      if (typeof event.stopImmediatePropagation === 'function') {
        event.stopImmediatePropagation();
      }
    }
  });

  window.addEventListener('error', (event) => {
    if (isExtensionError(event.error || event.message)) {
      event.preventDefault();
      if (typeof event.stopImmediatePropagation === 'function') {
        event.stopImmediatePropagation();
      }
    }
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
