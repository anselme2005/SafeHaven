// ============================================================
// src/main.jsx
// React entry point
// ============================================================

import { StrictMode }   from 'react'
import { createRoot }   from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { warmUpServer }  from './services/api'
import App              from './App.jsx'
import './index.css'

// Wake up the Render backend immediately when the app loads
// This reduces the cold start delay on the free tier
warmUpServer();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* BrowserRouter enables client-side routing */}
    <BrowserRouter>
      {/* AuthProvider makes auth state available to every component */}
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
)