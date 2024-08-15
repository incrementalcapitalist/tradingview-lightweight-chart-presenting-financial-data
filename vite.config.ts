/**
 * @fileoverview Vite configuration file for the TradingView Lightweight Chart project
 * @author Incremental Capitalist
 */

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

/**
 * Vite configuration object
 * @see https://vitejs.dev/config/
 */
export default defineConfig({
  /**
   * Configure plugins
   * @property {Array} plugins - List of Vite plugins to use
   */
  plugins: [
    react() // Enable React support in Vite
  ],

  /**
   * Set up path aliases for easier imports
   * @property {Object} alias - Map of alias names to file system paths
   */
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'), // Allow '@' to be used as an alias for the 'src' directory
    },
  },

  /**
   * Configure build output
   * @property {string} outDir - Directory to output built files
   * @property {boolean} emptyOutDir - Whether to empty the output directory before building
   * @property {boolean} sourcemap - Whether to generate sourcemaps
   */
  build: {
    outDir: 'dist', // Output built files to the 'dist' directory
    emptyOutDir: true, // Empty the output directory before each build
    sourcemap: true, // Generate sourcemaps for debugging
  },

  /**
   * Development server configuration
   * @property {number} port - Port number for the dev server
   * @property {boolean} open - Whether to open the browser automatically
   * @property {boolean} cors - Whether to enable CORS
   */
  server: {
    port: 3000, // Run the dev server on port 3000
    open: true, // Open the browser automatically when starting the dev server
    cors: true, // Enable CORS for all served assets
  },

  /**
   * Pre-bundle these dependencies to improve performance
   * @property {Array} include - List of dependencies to pre-bundle
   */
  optimizeDeps: {
    include: ['lightweight-charts'], // Pre-bundle lightweight-charts for better performance
  },

  /**
   * Define global constants for the app
   * Note: We're not exposing any API keys here for security reasons
   */
  define: {
    // You can add any compile-time constants here if needed
    // For example: '__APP_VERSION__': JSON.stringify(process.env.npm_package_version)
  },

  /**
   * Environment variable handling
   * Vite automatically loads environment variables from .env files
   * Variables prefixed with VITE_ are exposed to the client-side code
   * For sensitive information like API keys, use server-side environment variables
   * @see https://vitejs.dev/guide/env-and-mode.html
   */
})