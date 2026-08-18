import { defineConfig, loadEnv } from 'vite'
import { fileURLToPath } from 'node:url'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, fileURLToPath(new URL('.', import.meta.url)), '')
  const proxyTarget =
    env.VITE_PROXY_TARGET ||
    env.VITE_API_PROXY_TARGET ||
    'http://127.0.0.1:8000'
  const serverHost = env.VITE_DEV_SERVER_HOST || '0.0.0.0'
  const serverPort = Number(env.VITE_DEV_SERVER_PORT || 5173)

  return {
    plugins: [react()],
    server: {
      host: serverHost,
      port: serverPort,
      strictPort: true,
      hmr: {
        overlay: true,
      },
      proxy: {
        '/api': {
          target: proxyTarget,
          changeOrigin: true,
          secure: false,
        },
        '/storage': {
          target: proxyTarget,
          changeOrigin: true,
          secure: false,
        },
      },
    },
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react-router-dom',
      ],
    },
    build: {
      chunkSizeWarningLimit: 1500,
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor-react': ['react', 'react-dom', 'react-router-dom'],
            'vendor-bootstrap': ['bootstrap'],
          },
        },
      },
    },
  }
})

