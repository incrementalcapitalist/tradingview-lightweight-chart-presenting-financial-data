/**
 * @fileoverview Main entry point for the Vite React application with Amplify configuration
 */import React from 'react'
import ReactDOM from 'react-dom/client'
import { Amplify } from 'aws-amplify';
import config from '../amplifyconfiguration.json'
import App from './App.tsx'
import './index.css'

// Configure Amplify with the imported configuration
Amplify.configure(config);

// Create the root element and render the app
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)