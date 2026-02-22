import { defineConfig } from 'vite';

export default defineConfig({
  base: '/messi-cristiano-last-dance-game/',
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
});
