import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { GoogleOAuthProvider } from '@react-oauth/google';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

// Validate client ID
if (!clientId || clientId === 'YOUR_GOOGLE_CLIENT_ID_HERE' || clientId.includes('undefined')) {
  console.warn(
    '⚠️  Google Client ID is not configured!\n' +
    'To enable Google authentication:\n' +
    '1. Get your Client ID from https://console.cloud.google.com/\n' +
    '2. Set VITE_GOOGLE_CLIENT_ID in your Vercel environment variables\n' +
    '3. Redeploy the application\n\n' +
    'Current value:', clientId
  );
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={clientId}>
      <App />
    </GoogleOAuthProvider>
  </React.StrictMode>
);
