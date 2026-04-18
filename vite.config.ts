import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  // [HIGH-1] Prevent accidental production builds with the API key baked into the bundle.
  // The VITE_ prefix causes Vite to embed the value in client-side JS at build time.
  // In production, requests must go through a server-side proxy that holds the key.
  if (mode === 'production' && env.VITE_OPENAI_API_KEY) {
    throw new Error(
      '[security] VITE_OPENAI_API_KEY must not be set during production builds. ' +
      'Use a server-side proxy instead and remove this variable from .env.production.'
    )
  }

  return {
    plugins: [tailwindcss(), react()],
    server: {
      proxy: {
        '/api/openai': {
          target: 'https://api.openai.com',
          changeOrigin: true,
          secure: true,
          rewrite: (path) => path.replace(/^\/api\/openai/, ''),
        },
      },
    },
    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: ['./src/test/setup.ts'],
      coverage: {
        provider: 'v8',
        reporter: ['text', 'lcov'],
        thresholds: { lines: 80, functions: 80, branches: 80, statements: 80 },
      },
    },
  }
})
