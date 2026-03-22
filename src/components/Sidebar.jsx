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
      className="fixed bottom-0 left-0 right-0 z-40 flex h-14 w-full items-center justify-around gap-2 border-t border-zinc-800/60 bg-zinc-900/90 px-2 backdrop-blur-2xl lg:top-0 lg:bottom-auto lg:left-0 lg:right-auto lg:h-screen lg:w-12 lg:flex-col lg:items-center lg:justify-start lg:gap-1 lg:border-t-0 lg:border-r lg:border-zinc-800/50 lg:bg-zinc-900/75 lg:px-0 lg:pt-4"
    >
      {/* Logo mark */}
      <div
        className="mb-4 hidden h-8 w-8 items-center justify-center rounded-lg cursor-pointer lg:flex"
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
            className={`relative flex h-10 w-10 items-center justify-center rounded-lg transition-all duration-150 cursor-pointer lg:h-9 lg:w-9 ${
              isActive 
                ? 'bg-blue-500/10 text-blue-500' 
                : 'text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300'
            }`}
          >
            {isActive && (
              <span
                className="absolute -left-1.5 hidden h-4 w-0.75 rounded-r-sm bg-blue-500 lg:block"
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
