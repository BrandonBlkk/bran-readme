import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import About from './pages/About'
import Settings from './pages/Settings'
import Templates from './pages/Templates'
import NotFound from './pages/NotFound'
import LandingPage from './pages/LandingPage'
import useGithubProfileSync from './hooks/useGithubProfileSync'
import { Analytics } from '@vercel/analytics/react'

const App = () => {
  useGithubProfileSync()

  return (
    <>
      {/* Vercel Analytics */}
      <Analytics /> 

      <Routes>
        <Route path="/landing" element={<LandingPage />} />
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/templates" element={<Templates />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  )
}

export default App
