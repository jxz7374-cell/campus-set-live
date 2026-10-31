import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Vite 配置：开发时用本地 3000 端口，/api 转发到 Express 后端
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:3000'
    }
  },
  build: {
    outDir: 'dist',        // 构建产物输出到 dist，由 server.js 托管
    emptyOutDir: true
  }
})
