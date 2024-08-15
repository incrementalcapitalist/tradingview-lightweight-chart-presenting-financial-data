/**
 * @fileoverview TypeScript declarations for Vite-specific environment
 */

/// <reference types="vite/client" />

/**
 * Extends the ImportMetaEnv interface to include custom environment variables
 */
interface ImportMetaEnv {
    /**
     * The base URL of your application
     */
    readonly VITE_APP_BASE_URL: string
    /**
     * The environment (e.g., 'development', 'production')
     */
    readonly VITE_APP_ENV: string
    /**
     * Add other custom environment variables here
     * For example:
     * readonly VITE_API_KEY: string
     */
    readonly VITE_POLYGON_API_KEY: string
  }
  
  /**
   * Extends the ImportMeta interface to include the env property
   */
  interface ImportMeta {
    readonly env: ImportMetaEnv
  }