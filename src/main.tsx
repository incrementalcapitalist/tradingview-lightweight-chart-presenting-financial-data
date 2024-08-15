/**
 * @fileoverview Main entry point for the Vite React application with Amplify configuration
 */

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Amplify } from 'aws-amplify'
import config from './amplifyconfiguration.json'
import App from './App.tsx'
import './index.css'

// Configure Amplify with the imported configuration
Amplify.configure(config)

// Create the root element and render the app
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)