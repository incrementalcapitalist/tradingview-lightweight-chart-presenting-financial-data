import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  // Configure plugins
  plugins: [react()],

  // Set up path aliases for easier imports
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },

  // Configure build output
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: true,
  },

  // Development server configuration
  server: {
    port: 3000,
    open: true,
    cors: true,
  },

  // Pre-bundle these dependencies to improve performance
  optimizeDeps: {
    include: ['aws-amplify'],
  },

  // Define global constants for the app
  define: {
    // Expose environment variables to the client-side code
    // Make sure to prefix your environment variables with VITE_
    // to make them accessible in the client-side code
    'import.meta.env.VITE_POLYGON_API_KEY': JSON.stringify(process.env.VITE_POLYGON_API_KEY),
  },
})