import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base './' so the built site works from any sub-path or opened via a static server.
export default defineConfig({
  base: './',
  plugins: [react()],
  test: { environment: 'node', include: ['src/**/*.test.ts'] },
} as any);
