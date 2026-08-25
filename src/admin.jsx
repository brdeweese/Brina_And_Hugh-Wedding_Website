import React from 'react'
import { createRoot } from 'react-dom/client'
import './styles/base.css'
import './styles/admin.css'
import AdminPage from './components/AdminPage.jsx'

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AdminPage />
  </React.StrictMode>
)
