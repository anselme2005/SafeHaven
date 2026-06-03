// ============================================================
// vite.config.js
// Vite configuration with Tailwind CSS v4 plugin
// ============================================================

import { defineConfig } from 'vite'
import react            from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    react()
  ],
})