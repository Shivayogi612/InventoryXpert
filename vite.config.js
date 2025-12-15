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
    fs: {
      allow: ['.']
    }
  }
})