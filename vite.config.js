import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// When deployed to https://<user>.github.io/<repo>/ the base must be '/<repo>/'.
// A custom domain (or a local dev server) uses '/'. Set BASE_PATH to override.
const base = process.env.BASE_PATH ?? '/'

export default defineConfig({
  base,
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        rsvp: resolve(__dirname, 'rsvp.html'),
        details: resolve(__dirname, 'details.html'),
        admin: resolve(__dirname, 'admin.html'),
      },
    },
  },
})
