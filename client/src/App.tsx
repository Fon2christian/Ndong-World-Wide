import './App.css'
import { Routes, Route, Link } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import { LanguageProvider } from './context/LanguageContext'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ImageSlideshow from './components/ImageSlideshow'

// Lazy load pages for better performance
const Market = lazy(() => import('./pages/Market'))
const Flow = lazy(() => import('./pages/Flow'))
const Company = lazy(() => import('./pages/Company'))
const Contact = lazy(() => import('./pages/Contact'))
const Business = lazy(() => import('./pages/Business'))
const TiresProvision = lazy(() => import('./pages/TiresProvision'))
const WheelsProvision = lazy(() => import('./pages/WheelsProvision'))
const CarsProvision = lazy(() => import('./pages/CarsProvision'))

// Loading component
function PageLoader() {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '60vh',
      fontSize: '1.2rem',
      color: '#94a3b8'
    }}>
      Loading...
    </div>
  )
}

function Home() {
  return (
    <div className="home-page">
      <ImageSlideshow />
    </div>
  )
}

function NotFound() {
  return (
    <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
      <h1 style={{ fontSize: '4rem', margin: '0' }}>404</h1>
      <p style={{ fontSize: '1.5rem', marginTop: '1rem' }}>Page Not Found</p>
      <p style={{ marginTop: '1rem' }}>
        The page you're looking for doesn't exist.{' '}
        <Link to="/" style={{ color: '#2563eb', textDecoration: 'underline' }}>Go home</Link>
      </p>
    </div>
  )
}

function App() {
  return (
    <LanguageProvider>
      <Navbar />
      <main className="main-content">
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/business" element={<Business />} />
            <Route path="/business/tires" element={<TiresProvision />} />
            <Route path="/business/wheels" element={<WheelsProvision />} />
            <Route path="/business/cars" element={<CarsProvision />} />
            <Route path="/market" element={<Market />} />
            <Route path="/flow" element={<Flow />} />
            <Route path="/company" element={<Company />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
    </LanguageProvider>
  )
}

export default App
