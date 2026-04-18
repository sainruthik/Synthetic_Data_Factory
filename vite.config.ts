import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  // Fail fast if the API key is missing in production (e.g. Vercel env var not configured).
  if (mode === 'production' && !env.VITE_OPENAI_API_KEY) {
    throw new Error(
      '[deploy] VITE_OPENAI_API_KEY is not set. ' +
      'Add it to your Vercel environment variables before deploying.'
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
