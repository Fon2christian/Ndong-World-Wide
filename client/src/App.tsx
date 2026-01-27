import './App.css'
import { Routes, Route } from 'react-router-dom'
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
        </Routes>
      </main>
      <Footer />
    </LanguageProvider>
  )
}

export default App
