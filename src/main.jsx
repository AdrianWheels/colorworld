import { StrictMode, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import './i18n.js'
import { initializeGA4 } from './utils/analytics.js'
import { addSearchConsoleVerification } from './utils/searchConsole.js'
import { useTranslation } from 'react-i18next'

// Lazy load components for better performance
const App = lazy(() => import('./App.jsx'));
const DrawingCalendar = lazy(() => import('./components/DrawingCalendar.jsx'));
const PrivacyPolicy = lazy(() => import('./components/PrivacyPolicy.jsx'));
const PinterestGallery = lazy(() => import('./components/PinterestGallery.jsx'));
const PinterestColoringView = lazy(() => import('./components/PinterestColoringView.jsx'));
const NotFound = lazy(() => import('./components/NotFound.jsx'));

// Initialize Google Analytics 4
initializeGA4();

// Add Search Console verification
addSearchConsoleVerification();

const LoadingSpinner = () => {
  const { t } = useTranslation();
  return (
    <div className="loading-container" style={{ height: '100vh' }}>
      <div className="loading-spinner"></div>
      <p>{t('main.loading')}</p>
    </div>
  );
};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/calendario" element={<DrawingCalendar />} />
          <Route path="/privacidad" element={<PrivacyPolicy />} />
          <Route path="/galeria" element={<PinterestGallery />} />
          <Route path="/galeria/:boardSlug" element={<PinterestGallery />} />
          <Route path="/colorear/:pinId" element={<PinterestColoringView />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  </StrictMode>,
)
