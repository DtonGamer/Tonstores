// src/main.tsx

// Override console methods for production
const originalConsoleError = console.error;
const originalConsoleLog = console.log;

console.error = function() {
  // Suppress the specific GoTrueClient warning
  if (arguments[0] &&
      typeof arguments[0] === 'string' &&
      arguments[0].includes('Multiple GoTrueClient instances')) {
    return;
  }

  // Keep errors in development mode
  if (import.meta.env.DEV) originalConsoleError.apply(console, arguments);
};

console.log = function() {
  // Keep logs in development mode
  if (import.meta.env.DEV) originalConsoleLog.apply(console, arguments);
};

// Global error logging
window.addEventListener("error", (e) => {
  console.error("⛔️ Global error:", (e as ErrorEvent).error || (e as ErrorEvent).message);
});
window.addEventListener("unhandledrejection", (e) => {
  console.error("⛔️ Unhandled promise rejection:", (e as PromiseRejectionEvent).reason);
});

import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import './tailwind.output.css';
import { ensureUserSession } from './utils/sessionHelpers';

// Initialize user session (anonymous or authenticated) BEFORE rendering
ensureUserSession().then(() => {
  const container = document.getElementById('root');
  if (!container) {
    throw new Error('Root container missing');
  }

  const root = createRoot(container);
  root.render(
    <App />
  );
}).catch(error => {
  console.error('Failed to initialize user session:', error);

  const container = document.getElementById('root');
  if (container) {
    container.innerHTML = '<div class="error-message">Failed to initialize application. Please refresh the page.</div>';
  }
});