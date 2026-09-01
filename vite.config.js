import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@reduxjs/toolkit': path.resolve(import.meta.dirname, 'node_modules/@reduxjs/toolkit/dist/redux-toolkit.legacy-esm.js')
    }
  }
})

