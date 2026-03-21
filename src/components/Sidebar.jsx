import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LayoutGrid, FileText, Settings, Download, Plus, User } from 'lucide-react'

const sidebarItems = [
  { id: 'add', icon: Plus, label: 'Add Section', action: 'add' },
  { id: 'templates', icon: LayoutGrid, label: 'Templates', action: 'templates' },
  { id: 'settings', icon: Settings, label: 'Settings', action: 'settings' },
  { id: 'export', icon: Download, label: 'Export', action: 'export' },
  { id: 'about', icon: User, label: 'About', action: 'about' },
]

const Sidebar = ({ activePanel, onPanelChange }) => {
  const navigate = useNavigate()

  const handlePanelChange = (action) => {
    if (action === 'about') {
      navigate('/about')
    } else {
      if (window.location.pathname !== '/') {
        navigate('/')
      }
      onPanelChange(action)
    }
  }

  return (
    <aside
      className="fixed left-0 top-0 z-40 flex h-screen w-12 flex-col items-center gap-1 border-r border-zinc-800/50 bg-zinc-900/75 pt-4 backdrop-blur-2xl"
    >
      {/* Logo mark */}
      <div
        className="mb-4 flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-blue-500/20 bg-blue-500/10"
        onClick={() => navigate('/')}
      >
        <FileText size={16} className="text-blue-500" />
      </div>

      {sidebarItems.map((item) => {
        const Icon = item.icon
        const isActive = activePanel === item.action
        return (
          <button
            key={item.id}
            onClick={() => handlePanelChange(item.action)}
            title={item.label}
            aria-label={item.label}
            className={`relative flex h-9 w-9 items-center justify-center rounded-lg transition-all duration-150 ${
              isActive 
                ? 'bg-blue-500/10 text-blue-500' 
                : 'text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300'
            }`}
          >
            {isActive && (
              <span
                className="absolute -left-1.5 h-4 w-[3px] rounded-r-sm bg-blue-500"
              />
            )}
            <Icon size={18} />
          </button>
        )
      })}
    </aside>
  )
}

export default Sidebar
