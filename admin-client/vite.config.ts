import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/admin/',
  server: {
    port: 5175,
  },
  build: {
    // Optimize chunk splitting
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Split vendor libraries into separate chunks
          if (id.includes('node_modules')) {
            // Use regex for cross-platform path matching (Windows and Unix)
            if (/[\\/]react[\\/]/.test(id) || /[\\/]react-dom[\\/]/.test(id) || /[\\/]react-router-dom[\\/]/.test(id)) {
              return 'react-vendor';
            }
            if (/[\\/]axios[\\/]/.test(id) || /[\\/]zod[\\/]/.test(id)) {
              return 'utils';
            }
          }
        },
      },
    },
    // Increase chunk size warning limit (in KB)
    chunkSizeWarningLimit: 1000,
    // Enable minification with esbuild
    minify: 'esbuild',
    // Disable source maps for smaller bundle
    sourcemap: false,
  },
})
