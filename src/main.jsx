import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import DrawingCalendar from './components/DrawingCalendar.jsx'
import PrivacyPolicy from './components/PrivacyPolicy.jsx'
import NotFound from './components/NotFound.jsx'
import { initializeGA4 } from './utils/analytics.js'
import { addSearchConsoleVerification } from './utils/searchConsole.js'

// Initialize Google Analytics 4
initializeGA4();

// Add Search Console verification
addSearchConsoleVerification();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/calendario" element={<DrawingCalendar />} />
        <Route path="/privacidad" element={<PrivacyPolicy />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
