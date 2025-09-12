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
    ],
  },
});
