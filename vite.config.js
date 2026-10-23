import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Ajustado exatamente para o repositório 'App-Consultoria' no GitHub Pages
  base: process.env.NODE_ENV === 'production' ? '/App-Consultoria/' : '/',
  server: {
    port: 5173,
    open: true,
  },
});
