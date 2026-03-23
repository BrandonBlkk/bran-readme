import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import About from './pages/About'
import Settings from './pages/Settings'
import Templates from './pages/Templates'
import NotFound from './pages/NotFound'

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/templates" element={<Templates />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default App
