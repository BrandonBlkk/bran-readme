import { AnimatePresence, motion } from 'framer-motion'
import { Github, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import {
  getCurrentUser,
  onAuthStateChange,
  signInWithGithub,
  signInWithGoogle,
} from '../../services/authService'
import { toast } from 'sonner'
import Spinner from '../Spinner'

const GoogleIcon = ({ size = 20 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 48 48"
    aria-hidden="true"
    focusable="false"
  >
    <path
      fill="#FFC107"
      d="M43.611 20.083H42V20H24v8h11.303C33.654 32.657 29.233 36 24 36c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.957 3.043l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
    />
    <path
      fill="#FF3D00"
      d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.957 3.043l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"
    />
    <path
      fill="#4CAF50"
      d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.148 35.091 26.666 36 24 36c-5.212 0-9.62-3.329-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"
    />
    <path
      fill="#1976D2"
      d="M43.611 20.083H42V20H24v8h11.303a12.05 12.05 0 01-4.084 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"
    />
  </svg>
)

const AuthModal = ({ isOpen, onClose }) => {
  const [isSigningIn, setIsSigningIn] = useState(false)
  const [signingProvider, setSigningProvider] = useState(null)
  const isGithubSigningIn = isSigningIn && signingProvider === 'github'
  const isGoogleSigningIn = isSigningIn && signingProvider === 'google'

  useEffect(() => {
    if (!isOpen) {
      setIsSigningIn(false)
      setSigningProvider(null)
      return
    }

    let active = true

    const syncExistingSession = async () => {
      const user = await getCurrentUser()
      if (!active) return
      if (user) {
        setIsSigningIn(false)
        setSigningProvider(null)
        onClose()
      }
    }

    syncExistingSession()

    const { data: { subscription } } = onAuthStateChange((user) => {
      if (!active) return
      if (user) {
        setIsSigningIn(false)
        setSigningProvider(null)
        onClose()
      }
    })

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [isOpen, onClose])

  const handleClose = () => {
    if (isSigningIn) return
    onClose()
  }

  const handleGithubLogin = async () => {
    if (isSigningIn) return
    try {
      setIsSigningIn(true)
      setSigningProvider('github')
      const data = await signInWithGithub()
      if (data?.url && typeof window !== 'undefined') {
        window.location.assign(data.url)
      }
    } catch (error) {
      toast.error('Login failed: ' + error.message)
      setIsSigningIn(false)
      setSigningProvider(null)
    }
  }

  const handleGoogleLogin = async () => {
    if (isSigningIn) return
    try {
      setIsSigningIn(true)
      setSigningProvider('google')
      const data = await signInWithGoogle()
      if (data?.url && typeof window !== 'undefined') {
        window.location.assign(data.url)
      }
    } catch (error) {
      toast.error('Login failed: ' + error.message)
      setIsSigningIn(false)
      setSigningProvider(null)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-60 flex items-center justify-center px-4 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="absolute inset-0 bg-black/60"
            onClick={handleClose}
          />
          <motion.div
            className="relative w-full max-w-sm rounded-2xl border border-zinc-800 bg-zinc-950 p-8 shadow-2xl"
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          >
            <button
              onClick={handleClose}
              disabled={isSigningIn}
              className="absolute top-4 right-4 rounded-full p-2 text-zinc-500 hover:bg-zinc-900 hover:text-zinc-200 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="flex flex-col items-center text-center">
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-full border border-zinc-800 bg-zinc-900/50">
                <img src="/logo.png" alt="BranReadme Logo" className="h-8 w-8" />
              </div>

              <h2 className="text-2xl font-bold tracking-tight text-zinc-50">Welcome back</h2>
              <p className="mt-2 text-sm text-zinc-400">
                Sign in to save your favorite templates and sync your progress.
              </p>

              <div className="mt-8 flex w-full flex-col gap-3 select-none">
                <button
                  onClick={handleGithubLogin}
                  disabled={isSigningIn}
                  className="flex w-full items-center justify-center gap-3 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70 cursor-pointer"
                >
                  {isGithubSigningIn ? <Spinner color='border-zinc-900' />
                  : <Github size={20} />}
                  {isGithubSigningIn ? 'Signing in...' : 'Continue with GitHub'}
                </button>

                <button
                  onClick={handleGoogleLogin}
                  disabled={isSigningIn}
                  className="flex w-full items-center justify-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900 px-5 py-3 text-sm font-semibold text-zinc-100 transition-all hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
                >
                  {isGoogleSigningIn ? <Spinner color='border-zinc-50' />
                  : <GoogleIcon size={20} />}
                  {isGoogleSigningIn ? 'Signing in...' : 'Continue with Google'}
                </button>
              </div>

              <p className="mt-6 text-[11px] uppercase tracking-widest text-zinc-500">
                Securely handled with Supabase Auth
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default AuthModal

