import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { LayoutGrid, Settings, Download, Plus, Info } from 'lucide-react'

const sidebarItems = [
  { id: 'add', icon: Plus, label: 'Add Section', action: 'add' },
  { id: 'templates', icon: LayoutGrid, label: 'Templates', action: 'templates' },
  { id: 'settings', icon: Settings, label: 'Settings', action: 'settings' },
  { id: 'export', icon: Download, label: 'Export', action: 'export' },
  { id: 'about', icon: Info, label: 'About', action: 'about' },
]

const Sidebar = ({ activePanel, onPanelChange }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const pendingKey = 'branreadme:pendingPanel'

  useEffect(() => {
    if (location.pathname !== '/') return
    const pending = window.sessionStorage.getItem(pendingKey)
    if (!pending) return
    window.sessionStorage.removeItem(pendingKey)
    onPanelChange(pending)
  }, [location.pathname, onPanelChange])

  const handlePanelChange = (action) => {
    if (action === 'about') {
      onPanelChange(action)
      if (location.pathname !== '/about') {
        navigate('/about')
      }
    } else {
      if (location.pathname !== '/') {
        window.sessionStorage.setItem(pendingKey, action)
        navigate('/')
        return
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
        className="mb-4 flex h-8 w-8 items-center justify-center rounded-lg cursor-pointer"
      >
        <img
          src="/logo.svg"
          alt="Profile"
          className="h-5 w-5 rounded-full select-none"
        />
      </div>

      {sidebarItems.map((item) => {
        const Icon = item.icon
        const isActive = activePanel === item.action
          || (item.action === 'about' && location.pathname === '/about')
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
                className="absolute -left-1.5 h-4 w-0.75 rounded-r-sm bg-blue-500"
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
