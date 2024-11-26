import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost/:8000', // Reemplaza con la URL de tu backend en XAMPP
        changeOrigin: true,
        secure: false, // Si tu servidor backend no usa HTTPS, deja esto en false
      },
    },
  },
});
