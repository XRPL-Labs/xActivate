import { sentryVitePlugin } from "@sentry/vite-plugin";
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { terminalPlugin } from './src/terminalPlugin'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), terminalPlugin(), sentryVitePlugin({
    org: "xrpl-labs",
    project: "activate-xapp"
  })],

  server: {
    port: 3040
  },

  define: {
    'process.env': {}
  },

  build: {
    sourcemap: true
  }
})