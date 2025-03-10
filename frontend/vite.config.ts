import path from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    host: true,
    allowedHosts: ["semantle.qwertea.dev", "play.qwertea.dev"],
  },
  preview: {
    port: 5173,
    host: true,
    allowedHosts: ["semantle.qwertea.dev", "play.qwertea.dev"],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  }
});
