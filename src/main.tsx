/**
 * @fileoverview Main entry point for the Vite React application
 * @author Incremental Capitalist
 */

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// For Amplify Gen 2, we don't need to import the configuration file
// Amplify.configure(config);

// Create the root element and render the app
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)