import { useEffect, useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { LayoutGrid, Settings, Download, Plus, Info, User, LogOut } from 'lucide-react'
import { getCurrentUser, signOut, onAuthStateChange } from '../services/authService'
import AuthModal from './auth/AuthModal'
import SignoutConfirmModal from './auth/SignoutConfirmModal'
import { title } from 'framer-motion/client'

const sidebarItems = [
  { id: 'add', icon: Plus, label: 'Add Section', action: 'add' },
  { id: 'templates', icon: LayoutGrid, label: 'Templates', action: 'templates' },
  { id: 'settings', icon: Settings, label: 'Settings', action: 'settings' },
  { id: 'about', icon: Info, label: 'About', action: 'about' },
]

const Sidebar = ({ activePanel, onPanelChange }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const pendingKey = 'branreadme:pendingPanel'
  const [user, setUser] = useState(null)
  const [isAuthOpen, setIsAuthOpen] = useState(false)
  const [isSignoutOpen, setIsSignoutOpen] = useState(false)

  const openSignoutModal = () => {
    setIsSignoutOpen(true)
  }

  const closeSignoutModal = () => {
    setIsSignoutOpen(false)
  }

  const handleSignout = async () => {
    try {
      await signOut()
      closeSignoutModal()
    } catch (error) {
      console.error('Signout Error:', error)
    }
  }

  useEffect(() => {
    getCurrentUser().then(setUser)
    const { data: { subscription } } = onAuthStateChange(setUser)
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (location.pathname !== '/') return
    const pending = window.sessionStorage.getItem(pendingKey)
    if (!pending) return
    window.sessionStorage.removeItem(pendingKey)
    onPanelChange(pending)
  }, [location.pathname, onPanelChange])

  const handlePanelChange = (action) => {
    if (action === 'about' || action === 'settings' || action === 'templates') {
      onPanelChange(action)
      const target =
        action === 'settings'
          ? '/settings'
          : action === 'templates'
            ? '/templates'
            : '/about'
      if (location.pathname !== target) {
        navigate(target)
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
    <>
      <aside
      className="fixed bottom-0 left-0 right-0 z-40 flex h-14 w-full items-center justify-around gap-2 border-t border-zinc-800/60 bg-zinc-900/90 px-2 backdrop-blur-2xl lg:top-0 lg:bottom-auto lg:left-0 lg:right-auto lg:h-screen lg:w-12 lg:flex-col lg:items-center lg:justify-start lg:gap-1 lg:border-t-0 lg:border-r lg:border-zinc-800/50 lg:bg-zinc-900/75 lg:px-0 lg:pt-4"
    >
      {/* Logo mark */}
      <Link
        to="/landing"
        className="mb-4 hidden h-8 w-8 items-center justify-center rounded-lg cursor-pointer lg:flex"
      >
        <img
          src="/logo.svg"
          alt="Profile"
          className="h-5 w-5 rounded-full select-none"
        />
      </Link>

      {sidebarItems.map((item) => {
        const Icon = item.icon
        const isActive = activePanel === item.action
          || (item.action === 'about' && location.pathname === '/about')
          || (item.action === 'settings' && location.pathname === '/settings')
          || (item.action === 'templates' && location.pathname === '/templates')
        return (
          <button
            key={item.id}
            onClick={() => handlePanelChange(item.action)}
            data-tip={item.label}
            aria-label={item.label}
            className={`relative flex h-10 w-10 items-center justify-center rounded-lg transition-all duration-150 cursor-pointer lg:h-9 lg:w-9 tooltip tooltip-top sm:tooltip-right before:text-[11px] before:font-medium ${
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

      {/* Profile / Auth Section */}
      <div className="lg:mt-auto lg:mb-4 lg:flex lg:flex-col lg:items-center lg:gap-2">
        {user ? (
          <div className="group relative">
            <button
              onClick={() => openSignoutModal()}
              data-tip={`Sign out (${user.user_metadata?.full_name || user.email})`}
              className="flex h-10 w-10 items-center justify-center rounded-lg text-zinc-500 transition-all hover:bg-rose-500/10 hover:text-rose-500 lg:h-9 lg:w-9 cursor-pointer tooltip tooltip-left sm:tooltip-right before:text-[11px] before:font-medium"
            >
              <img
                src={user.user_metadata?.avatar_url || "/logo.svg"}
                alt="Profile"
                className="h-6 w-6 rounded-full border border-zinc-700 transition-all group-hover:border-rose-500/50"
              />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setIsAuthOpen(true)}
            data-tip="Sign In"
            className="flex h-10 w-10 items-center justify-center rounded-lg text-zinc-500 transition-all hover:bg-zinc-800 hover:text-zinc-300 lg:h-9 lg:w-9 cursor-pointer tooltip tooltip-left sm:tooltip-right before:text-[11px] before:font-medium"
          >
            <User size={18} />
          </button>
        )}
        </div>
      </aside>

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
      <SignoutConfirmModal 
        isOpen={isSignoutOpen} 
        onClose={closeSignoutModal} 
        onConfirm={handleSignout} 
        user={user}
      />
    </>
  )
}

export default Sidebar
