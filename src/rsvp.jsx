import React from 'react'
import { createRoot } from 'react-dom/client'
import './styles/base.css'
import './styles/rsvp.css'
import RsvpPage from './components/RsvpPage.jsx'

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RsvpPage />
  </React.StrictMode>
)
