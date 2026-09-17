import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    proxy: {
      '/api/sns-webhook': {
        target: 'https://api.agents.snsihub.ai',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/sns-webhook/, '')
      }
    }
  }
});
