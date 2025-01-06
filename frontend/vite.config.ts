import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@artifacts': path.resolve(__dirname, './src/artifacts'),
    },
  },
  server: {
    port: 5173,
    strictPort: true,
  },
})
