import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // 주소창에 /api로 시작하는 요청이 들어오면 넥슨으로 토스합니다.
      '/api': {
        target: 'https://open.api.nexon.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),

      },
    },
  },
})