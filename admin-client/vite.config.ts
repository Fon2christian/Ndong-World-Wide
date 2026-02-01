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
        manualChunks: {
          // Split vendor libraries into separate chunks
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          // Split other large dependencies
          'utils': ['axios', 'zod'],
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
