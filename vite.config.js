import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import { viteSingleFile } from 'vite-plugin-singlefile'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] }),
    viteSingleFile()
  ],
  server: {
    proxy: {
      // During `npm run dev`, forward /api/* requests to the FastAPI backend
      '/api': {
        target: `http://localhost:${process.env.VITE_BACKEND_PORT || process.env.PORT || 8000}`,
        changeOrigin: true,
      },
    },
  },
})
