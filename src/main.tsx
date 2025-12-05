// src/main.tsx

// Override console.error and // console.log to suppress all messages
const originalConsoleError = console.error;
const originalConsoleLog = console.log;

console.error = function() {
  // Suppress the specific GoTrueClient warning
  if (arguments[0] && 
      typeof arguments[0] === 'string' && 
      arguments[0].includes('Multiple GoTrueClient instances')) {
    return;
  }
  
  // If you want to keep errors in development mode, uncomment the next line:
  if (import.meta.env.DEV) originalConsoleError.apply(console, arguments);
  
  // Otherwise all console.error calls will be silenced
};

 console.log = function() {
  // If you want to keep logs in development mode, uncomment the next line:
   if (import.meta.env.DEV) originalConsoleLog.apply(console, arguments);
  
  // Otherwise all // console.log calls will be silenced
};

// Global error logging (captures uncaught errors and unhandled promise rejections)
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
import { setupGuestIdInterceptor } from './utils/sessionParams';

// Initialize global fetch interceptor for guest headers BEFORE any network requests
setupGuestIdInterceptor();

const container = document.getElementById('root');
if (!container) {
  throw new Error('Root container missing');
}

const root = createRoot(container);
root.render(
 // <React.StrictMode>
    <App />
 // </React.StrictMode>
);