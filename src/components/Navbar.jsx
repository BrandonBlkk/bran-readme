import { Copy, User } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { getCurrentUser, onAuthStateChange, signOut } from '../services/authService'
import AuthModal from './auth/AuthModal'
import SignoutConfirmModal from './auth/SignoutConfirmModal'
import profileImage from '../assets/images/Profile.png'
import ResetButton from './ResetButton'
import { Link } from 'react-router-dom'

const Navbar = ({ onReset, onCopy, onOpenProjectModal, onSaveTemplate }) => {
  const [isBeta, setIsBeta] = useState(true);
  const [isCopying, setIsCopying] = useState(false);
  const [isVisible, setIsVisible] = useState(true)
  const [navHeight, setNavHeight] = useState(0);
  const navRef = useRef(null);
  const lastScrollY = useRef(0)
  const lastScrollTarget = useRef(null)
  const ignoreScrollUntil = useRef(0)
  const [user, setUser] = useState(null)
  const [isAuthOpen, setIsAuthOpen] = useState(false)
  const [isSignoutOpen, setIsSignoutOpen] = useState(false)

  const handleSignout = async () => {
    try {
      await signOut()
      setIsSignoutOpen(false)
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
    const element = navRef.current
    if (!element) return

    const updateHeight = () => {
      const nextHeight = element.getBoundingClientRect().height
      setNavHeight(nextHeight)
    }

    updateHeight()

    if (typeof ResizeObserver !== 'undefined') {
      const observer = new ResizeObserver(updateHeight)
      observer.observe(element)
      return () => observer.disconnect()
    }

    window.addEventListener('resize', updateHeight)
    return () => window.removeEventListener('resize', updateHeight)
  }, [])

  useEffect(() => {
    const getNow = () =>
      (typeof performance !== 'undefined' ? performance.now() : Date.now())

    const requestVisibility = (next) => {
      if (next === isVisible) return
      ignoreScrollUntil.current = getNow() + 350
      setIsVisible(next)
    }

    const getScrollElement = (event) => {
      const target = event?.target
      if (target && target !== document && target !== window) {
        if (typeof target.scrollTop === 'number') return target
      }
      return document.scrollingElement || document.documentElement
    }

    const handleScroll = (event) => {
      const scrollElement = getScrollElement(event)
      if (!scrollElement) return
      const currentY = scrollElement.scrollTop || 0
      if (lastScrollTarget.current !== scrollElement) {
        lastScrollTarget.current = scrollElement
        lastScrollY.current = currentY
        return
      }
      if (getNow() < ignoreScrollUntil.current) {
        lastScrollY.current = currentY
        return
      }
      const delta = currentY - lastScrollY.current
      if (currentY <= 8) {
        requestVisibility(true)
      } else if (delta > 6) {
        requestVisibility(false)
      } else if (delta < -2) {
        requestVisibility(true)
      }
      lastScrollY.current = currentY
    }

    const initialScrollElement = document.scrollingElement || document.documentElement
    lastScrollTarget.current = initialScrollElement
    lastScrollY.current = initialScrollElement?.scrollTop || 0
    document.addEventListener('scroll', handleScroll, { passive: true, capture: true })
    return () => document.removeEventListener('scroll', handleScroll, true)
  }, [isVisible])

  const handleCopyClick = () => {
    setIsCopying(true);
    onCopy();
    setTimeout(() => setIsCopying(false), 500);
  };

  return (
    <>
      <header
        ref={navRef}
        className={`z-30 flex flex-wrap items-center justify-between gap-x-3 gap-y-3 border-b border-zinc-800 bg-zinc-900/75 px-4 py-3 backdrop-blur-lg transition-all duration-300 ease-in-out lg:flex-nowrap lg:gap-4 lg:px-6 
          fixed inset-x-0 top-0 lg:sticky lg:translate-y-0 lg:opacity-100 lg:pointer-events-auto ${
          isVisible
            ? 'translate-y-0 opacity-100'
            : 'max-lg:-translate-y-full max-lg:opacity-0 max-lg:pointer-events-none'
        }`}
      >
        <div className="flex items-center gap-3">
          <Link to="/landing" className="text-sm font-semibold tracking-[-0.01em] text-zinc-50">
            BranReadme
          </Link>
          { isBeta ?
            <span className="rounded-full border border-rose-800 bg-zinc-900 px-2 py-0.5 text-[11px] font-medium text-rose-400 select-none">
              Beta
            </span> :
            <span className="rounded-full border border-zinc-600 bg-zinc-900 px-2 py-0.5 text-[11px] font-medium text-zinc-400 select-none">
              v1.0
            </span>
          }

          {!user ? (
            <button
              onClick={() => setIsAuthOpen(true)}
              className="lg:hidden flex items-center gap-1.5 rounded-full border border-zinc-800 bg-zinc-950 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-400 transition-colors hover:text-white"
            >
              Sign In
            </button>
          ) : (
            <button
               onClick={() => setIsSignoutOpen(true)}
               title={`Sign out (${user.user_metadata?.full_name || user.user_metadata?.name || user.email})`}
               className="lg:hidden flex items-center transition-opacity hover:opacity-80"
            >
              <img
                src={user?.user_metadata?.avatar_url || user?.user_metadata?.picture || "/logo.png"}
                alt="Profile"
                className="h-5 w-5 rounded-full border border-zinc-700"
              />
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={onOpenProjectModal}
          className="flex items-center gap-2 rounded-md border border-zinc-800/70 bg-zinc-950/50 px-2 py-1 text-[11px] font-medium uppercase tracking-[0.08em] text-zinc-500 transition-colors duration-150 hover:text-rose-300 cursor-pointer lg:ml-auto lg:rounded-none lg:border-0 lg:bg-transparent lg:px-0 lg:py-0 lg:border-l lg:border-zinc-800 lg:pl-3"
          aria-haspopup="dialog"
        >
          <span>Built by</span>
          <span className="flex items-center gap-1.5 text-zinc-50">
            <img
              src={profileImage}
              alt="Profile"
              className="h-4 w-4 rounded-full select-none"
            />
            Brandon
          </span>
        </button>

        <div className="flex w-full items-center gap-2 select-none order-last lg:order-0 lg:w-auto lg:flex-nowrap lg:justify-end">
          <ResetButton
            label="Reset"
            onClick={onReset}
            className="flex-1 lg:flex-none lg:px-3 lg:py-1.5"
          />
          {onSaveTemplate ? (
            <button
              type="button"
              onClick={onSaveTemplate}
              className="flex flex-1 min-w-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg bg-white px-2 py-2 text-xs font-medium text-[#0a0a0a] transition-opacity hover:opacity-90 duration-150 cursor-pointer sm:px-2.5 lg:flex-none lg:px-3 lg:py-1.5"
            >
              <span className="sm:hidden">Save</span>
              <span className="hidden sm:inline">Save Template</span>
            </button>
          ) : null}

          <button
            type="button"
            onClick={handleCopyClick}
            className="flex flex-2 items-center justify-center gap-1.5 rounded-lg border border-rose-600 bg-rose-600 px-2.5 py-2 text-xs font-medium text-white transition-all duration-150 hover:border-rose-500 hover:bg-rose-500 cursor-pointer lg:flex-none lg:px-3 lg:py-1.5"
          >
            <Copy 
              size={13} 
              className={`${isCopying ? 'transform scale-90 transition-all duration-300 ease-in-out' : ''}`}
            />
            Copy Markdown
          </button>
        </div>
      </header>

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
      <SignoutConfirmModal 
        isOpen={isSignoutOpen} 
        onClose={() => setIsSignoutOpen(false)} 
        onConfirm={handleSignout} 
        user={user}
      />

      {/* The spacer div is also hidden on desktop since the nav isn't fixed there */}
      <div
        aria-hidden="true"
        className="transition-[height] duration-300 ease-in-out lg:hidden"
        style={{ height: isVisible ? navHeight : 0 }}
      />
    </>
  )
}

export default Navbar

