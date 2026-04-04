import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  base: process.env.GITHUB_ACTIONS ? '/taiwan-stock-query/' : '/',
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    proxy: {
      // TWSE Open API proxy（解決 CORS 限制）
      '/twse-api': {
        target: 'https://openapi.twse.com.tw/v1',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/twse-api/, ''),
      },
      // TWSE 歷史資料 proxy
      '/twse-history': {
        target: 'https://www.twse.com.tw',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/twse-history/, ''),
      },
      // OpenAI API proxy（解決 CORS 限制）
      '/openai-api': {
        target: 'https://api.openai.com/v1',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/openai-api/, ''),
      },
    },
  },
  test: {
    // 使用 jsdom 模擬瀏覽器環境
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
  },
})
