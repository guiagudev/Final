// vite.config.js
import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    host: true,    
    port: 5173,
    strictPort: true,
    watch: {
      usePolling: true,
    },
    allowedHosts: ['portuense-manager.ddns.net'], // 👈 Aquí añades tu dominio DDNS
  },
})
