import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    host: true, // Allow external connections
    allowedHosts: [
      'localhost',
      '.ngrok-free.app', // Allow all ngrok subdomains
      '.ngrok.io', // Allow legacy ngrok domains
      'idea-generator-frontend.onrender.com', // Allow Render app domain
      '.onrender.com', // Allow any Render subdomain if needed
    ],
  },
  preview: {
    host: true,
    allowedHosts: [
      'localhost',
      '.ngrok-free.app',
      '.ngrok.io',
      'idea-generator-frontend.onrender.com',
      '.onrender.com',
    ],
  },
});
