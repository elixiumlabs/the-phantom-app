import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [{ find: '@', replacement: resolve(__dirname, 'src') }],
  },
  css: {
    postcss: './postcss.config.js',
  },
  server: {
    port: 5173,
    proxy: {
      '/functions': {
        target: 'https://us-central1-the-phantom-app-io.cloudfunctions.net',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/functions/, ''),
      },
    },
  },
})

