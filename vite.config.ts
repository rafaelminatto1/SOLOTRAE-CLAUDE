import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import tsconfigPaths from 'vite-tsconfig-paths'
// // import traeSoloBadge from 'vite-plugin-trae-solo-badge' // Plugin removido temporariamente

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      // Otimizações para React 19
      babel: {
        plugins: [
          ['babel-plugin-react-dev-locator', { enabled: process.env.NODE_ENV === 'development' }]
        ]
      }
    }),
    tsconfigPaths()
    // traeSoloBadge()
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@shared': path.resolve(__dirname, './shared'),
      '@components': path.resolve(__dirname, './src/components'),
      '@pages': path.resolve(__dirname, './src/pages'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@lib': path.resolve(__dirname, './src/lib'),
      '@assets': path.resolve(__dirname, './src/assets'),
    },
  },
  // Otimizações de build
  build: {
    target: 'esnext',
    minify: 'esbuild',
    sourcemap: true,
    rollupOptions: {
      output: {
        // Code splitting por chunks
        manualChunks: {
          // Vendor chunks
          'react-vendor': ['react', 'react-dom'],
          'router-vendor': ['react-router-dom'],
          'ui-vendor': ['@headlessui/react', '@heroicons/react', 'framer-motion'],
          'form-vendor': ['react-hook-form', '@hookform/resolvers', 'zod'],
          'query-vendor': ['@tanstack/react-query'],
          'chart-vendor': ['chart.js', 'react-chartjs-2'],
          // App chunks
          'auth': ['./src/pages/Login'],
          'dashboard': ['./src/pages/Dashboard'],
          'patients': ['./src/pages/Patients'],
          'appointments': ['./src/pages/Appointments'],
          'exercises': ['./src/pages/Exercises'],
          'portal': ['./src/pages/PatientPortal'],
          'home': ['./src/pages/Home'],
        },
        // Otimizar nomes de arquivos
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
      },
    },
    // Configurações de chunk size
    chunkSizeWarningLimit: 1000,
  },
  // Configurações do servidor de desenvolvimento
  server: {
    port: 3000,
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  // Otimizações de dependências
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@tanstack/react-query',
      'zustand',
      'date-fns',
      'chart.js',
      'react-chartjs-2',
    ],
    exclude: ['@vite/client', '@vite/env'],
  },
  // Configurações de preview
  preview: {
    port: 3000,
    host: true,
  },
  // Variáveis de ambiente
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
  },
})
