import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/move':         'http://localhost:3001',
      '/reset':        'http://localhost:3001',
      '/state':        'http://localhost:3001',
      '/agent-stream': 'http://localhost:3001',
    },
  },
});
