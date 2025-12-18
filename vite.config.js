import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      // Remove the external option that was excluding TTF files
    },
  },
  assetsInclude: ['**/*.ttf'],
  // Ensure assets are properly served
  server: {
    port: 5174, // Changed from 5173 to 5174
    strictPort: false,
    fs: {
      allow: ['.']
    },
    // Add debugging options
    hmr: {
      overlay: true
    },
    proxy: {
      '/api': {
        target: 'http://localhost:3002',
        changeOrigin: true,
        secure: false
      }
    }
  }
})