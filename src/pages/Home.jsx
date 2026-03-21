import React, { useState } from 'react'
import ReadmeBuilder from '../components/ReadmeBuilder'
import Sidebar from '../components/Sidebar'
import ProjectModal from '../components/ProjectModal'

const Home = () => {
  const [activePanel, setActivePanel] = useState('add')
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false)

  const projectUrl = 'https://github.com/BrandonBlkk/bran-readme'
  const sponsorUrl = 'https://github.com/sponsors/BrandonBlkk'

  return (
    <div className="flex h-screen overflow-hidden bg-zinc-950 font-sans text-zinc-50 antialiased selection:bg-blue-500 selection:text-white">
      {/* Slim Sidebar */}
      <Sidebar activePanel={activePanel} onPanelChange={setActivePanel} />

      {/* Main Content Area */}
      <div
        className="ml-12 flex h-screen min-h-0 flex-1 flex-col overflow-hidden"
      >
        <div className="min-h-0 flex-1 overflow-hidden">
          <ReadmeBuilder
            activePanel={activePanel}
            onOpenProjectModal={() => setIsProjectModalOpen(true)}
          />
        </div>
      </div>
      <ProjectModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        projectUrl={projectUrl}
        sponsorUrl={sponsorUrl}
      />
    </div>
  )
}

export default Home
