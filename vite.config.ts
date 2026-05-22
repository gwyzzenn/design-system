import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: [
      // 2026-05-22 Phase 1 team-distribution-roadmap:
      // 特定 prefix 必先(Vite alias array 順序生效,specific first general after)
      { find: /^@\/design-system\/(.*)$/, replacement: path.resolve(__dirname, './packages/design-system/src/$1') },
      { find: '@', replacement: path.resolve(__dirname, './src') },
    ],
  },
})
