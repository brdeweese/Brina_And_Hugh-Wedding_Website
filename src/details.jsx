import React from 'react'
import { createRoot } from 'react-dom/client'
import './styles/base.css'
import './styles/details.css'
import DetailsPage from './components/DetailsPage.jsx'

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <DetailsPage />
  </React.StrictMode>
)
