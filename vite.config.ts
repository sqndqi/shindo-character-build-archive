import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  base: process.env.GITHUB_ACTIONS ? '/shindo-character-build-archive/' : '/',
  plugins: [react(), tailwindcss()],
  test: {
    exclude: ['server/**', 'node_modules/**'],
  },
})
