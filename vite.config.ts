import { federation } from '@module-federation/vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
//
// Exposes ./routes so lms-front's shell can lazy-load this portal's routes
// as a remote (rules/2-anexos/H-front.md). react/react-dom/react-router-dom
// are shared with the shell, not bundled twice.
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    federation({
      name: 'membership_portal',
      filename: 'remoteEntry.js',
      exposes: {
        './routes': './src/routes.tsx',
      },
      shared: ['react', 'react-dom', 'react-router-dom'],
    }),
  ],
  server: {
    port: 3001,
  },
  build: {
    target: 'esnext',
  },
})
