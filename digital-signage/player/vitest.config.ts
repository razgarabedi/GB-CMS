import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // Work around mismatched vite types between vitest and project vite by loosening plugin typing
  plugins: [react()] as any,
  test: {
    environment: 'jsdom',
    globals: true,
  },
})


