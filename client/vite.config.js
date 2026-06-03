// ============================================================
// vite.config.js
// Vite configuration with Tailwind CSS v4 plugin
// ============================================================

import { defineConfig } from 'vite'
import react            from '@vitejs/plugin-react'
import tailwindcss      from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss()   // Tailwind v4 runs as a Vite plugin — no config file needed
  ],
})