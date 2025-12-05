import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import autoprefixer from 'autoprefixer';
import tailwindcss from 'tailwindcss';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "0.0.0.0",
    port: 3000,
    proxy: {
      // Proxy API requests to avoid CORS issues
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false
      },
      // Proxy for Monnify API requests - redirect to Supabase functions
      '/api/monnify-': {
        target: 'http://localhost:3000', // This will be handled by the main proxy
        changeOrigin: true,
        secure: false
      }
    }
  },
  css: {
    postcss: {
      plugins: [
        tailwindcss('./tailwind.config.js'),
        autoprefixer()
      ]
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: mode !== 'production',
    rollupOptions: {
      external: [
        'node-fetch',
        'raw-body',
        'polka'
      ],
      output: {
        manualChunks: {
          vendor: [
            'react',
            'react-dom',
            'react-router-dom',
            '@tanstack/react-query',
            'axios'
          ]
        }
      }
    },
    commonjsOptions: {
      include: [/node_modules/],
      transformMixedEsModules: true
    }
  },
  plugins: [
    react()
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src")
    },
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.d.ts']
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@tanstack/react-query',
      'axios',
      'autoprefixer',
      'tailwindcss'
    ],
    exclude: [
      'node-fetch',
      'raw-body',
      'polka'
    ]
  }
}));
