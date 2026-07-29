import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ErrorBoundary } from './components/ErrorBoundary.tsx'

const deepLink = sessionStorage.getItem('shindo-build-archive:deep-link')
if (deepLink) {
  sessionStorage.removeItem('shindo-build-archive:deep-link')
  history.replaceState(null, '', deepLink)
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
