import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const BACKEND_URL = process.env.VITE_API_URL || 'http://localhost:3001';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/move':         BACKEND_URL,
      '/reset':        BACKEND_URL,
      '/state':        BACKEND_URL,
      '/agent-stream': BACKEND_URL,
    },
  },
});
