import React, { useState } from 'react'
import ReadmeBuilder from '../components/ReadmeBuilder'
import Sidebar from '../components/Sidebar'
import Footer from '../components/Footer'

const Home = () => {
  const [activePanel, setActivePanel] = useState('add')

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-base)' }}>
      {/* Slim Sidebar */}
      <Sidebar activePanel={activePanel} onPanelChange={setActivePanel} />

      {/* Main Content Area */}
      <div
        style={{
          marginLeft: '48px',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
        }}
      >
        <ReadmeBuilder activePanel={activePanel} />
        <Footer />
      </div>
    </div>
  )
}

export default Home
