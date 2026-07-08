/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'

// Proxy same-origin (SPEC §9): en desarrollo la SPA consume la API vía /api y /hubs, de modo que
// la cookie HttpOnly con SameSite=Strict viaja sin CORS. La API corre en http://localhost:5141.
const API_TARGET = 'http://localhost:5141'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    proxy: {
      '/api': { target: API_TARGET, changeOrigin: true },
      // WebSocket del hub de SignalR: requiere ws:true para el upgrade del handshake.
      '/hubs': { target: API_TARGET, changeOrigin: true, ws: true },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: true,
  },
})
