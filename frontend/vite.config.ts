import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Necessário para expor o servidor dentro do Docker
    port: 5173,
    proxy: {
      // Toda requisição que começar com /api será redirecionada para o container da API
      '/api': {
        target: 'http://proclinic-api:8080', // Nome do serviço no docker-compose
        changeOrigin: true,
        secure: false,
      }
    }
  }
})