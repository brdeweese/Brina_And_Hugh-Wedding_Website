import React from 'react'
import { createRoot } from 'react-dom/client'
import './styles/base.css'
import './styles/site.css'
import HomePage from './components/HomePage.jsx'

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HomePage />
  </React.StrictMode>
)
