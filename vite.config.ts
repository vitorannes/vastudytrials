import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // 'base: "./"' é CRUCIAL para o GitHub Pages. 
  // Faz com que o app procure arquivos na pasta atual (ex: /repo/) em vez da raiz do domínio.
  base: './', 
  build: {
    outDir: 'dist',
    sourcemap: false
  },
  server: {
    port: 3000,
  }
});