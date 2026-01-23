import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/test/', // Для работы на подпути /test (работает и по IP, и по домену)
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    // Оптимизация для продакшена
    minify: 'esbuild',
    sourcemap: false,
    // Убеждаемся, что CSS правильно обрабатывается
    cssCodeSplit: false,
    // Увеличиваем лимит предупреждений о размере
    chunkSizeWarningLimit: 1000,
  },
  // Настройки для dev-сервера
  server: {
    port: 5173,
    strictPort: false,
  },
  // Настройки CSS
  css: {
    postcss: './postcss.config.js',
  },
})
