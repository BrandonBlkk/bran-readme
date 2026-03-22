import React, { useState } from 'react'
import ReadmeBuilder from '../components/ReadmeBuilder'
import Sidebar from '../components/Sidebar'
import ProjectModal from '../components/ProjectModal'

const Home = () => {
  const [activePanel, setActivePanel] = useState(() => {
    const pendingKey = 'branreadme:pendingPanel'
    if (typeof window === 'undefined') return 'add'
    const pending = window.sessionStorage.getItem(pendingKey)
    if (!pending) return 'add'
    window.sessionStorage.removeItem(pendingKey)
    return pending
  })
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false)

  const projectUrl = 'https://github.com/BrandonBlkk/bran-readme'
  const sponsorUrl = 'https://github.com/sponsors/BrandonBlkk'

  return (
    <div className="flex min-h-screen overflow-y-auto bg-zinc-950 font-sans text-zinc-50 antialiased selection:bg-blue-500 selection:text-white lg:h-screen lg:overflow-hidden">
      {/* Slim Sidebar */}
      <Sidebar activePanel={activePanel} onPanelChange={setActivePanel} />

      {/* Main Content Area */}
      <div
        className="ml-0 flex min-h-0 flex-1 flex-col pb-16 lg:ml-12 lg:h-screen lg:pb-0 lg:overflow-hidden"
      >
        <div className="min-h-0 flex-1 overflow-visible lg:overflow-hidden">
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
