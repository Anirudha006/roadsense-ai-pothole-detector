import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@roadsense/shared': path.resolve(__dirname, '../../packages/shared/src'),
      '@roadsense/ui': path.resolve(__dirname, '../../packages/ui/src'),
    },
  },
  server: {
    port: 5174,
  },
});
