import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Base relative pour que le build fonctionne quel que soit le nom
  // du dépôt GitHub Pages (https://<user>.github.io/<repo>/)
  base: "./",
})
