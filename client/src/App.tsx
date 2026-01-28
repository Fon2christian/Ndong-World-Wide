import './App.css'
import { Routes, Route, Link } from 'react-router-dom'
import { LanguageProvider } from './context/LanguageContext'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ImageSlideshow from './components/ImageSlideshow'
import Market from './pages/Market'
import Flow from './pages/Flow'
import Company from './pages/Company'
import Contact from './pages/Contact'
import Business from './pages/Business'

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
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/business" element={<Business />} />
          <Route path="/market" element={<Market />} />
          <Route path="/flow" element={<Flow />} />
          <Route path="/company" element={<Company />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </LanguageProvider>
  )
}

export default App
