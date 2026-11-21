import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-ui': ['react', 'react-dom', 'react-router-dom', '@ionic/react', '@ionic/react-router', 'ionicons'],
          'vendor-supabase': ['@supabase/supabase-js'],
          'vendor-query': ['@tanstack/react-query'],
        },
      },
    },
    chunkSizeWarningLimit: 800,
  },
  server: {
    port: 5173,
    host: true,
    proxy: {
      // Proxy all /functions/v1 calls → Supabase Edge Functions
      '/functions': {
        target: 'https://bvxmtlurtaizlewtpsmv.supabase.co',
        changeOrigin: true,
        secure: true,
      },
    },
  },
})
