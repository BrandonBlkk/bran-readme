import { AnimatePresence, motion } from 'framer-motion'
import { LogOut, X } from 'lucide-react'

const SignoutConfirmModal = ({ isOpen, onClose, onConfirm, user }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-70 flex items-center justify-center px-4 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="absolute inset-0 bg-black/60"
            onClick={onClose}
          />
          <motion.div
            className="relative w-full max-w-sm rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl"
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 rounded-full p-2 text-zinc-500 hover:bg-zinc-900 hover:text-zinc-200 cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="flex flex-col items-center text-center">
              <div className="group relative mb-4">
                <div className="absolute -inset-0.5 rounded-full" />
                <div className="relative flex h-16 w-16 items-center justify-center rounded-full border border-zinc-800 bg-zinc-900 p-0.5 select-none">
                  <img
                    src={user?.user_metadata?.avatar_url || "/logo.svg"}
                    alt="Profile"
                    className="h-full w-full rounded-full object-cover"
                  />
                  <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-zinc-950 bg-rose-600 text-white">
                    <LogOut size={12} />
                  </div>
                </div>
              </div>

              <h2 className="text-xl font-bold tracking-tight text-zinc-50">Sign Out</h2>
              
              <div className="mt-2 flex flex-col items-center gap-1">
                <p className="text-sm font-medium text-zinc-200">
                  {user?.user_metadata?.full_name || user?.user_metadata?.name || 'User'}
                </p>
                <p className="text-xs text-zinc-500">
                  {user?.email}
                </p>
              </div>

              <p className="mt-4 text-sm leading-relaxed text-zinc-400">
                Are you sure you want to sign out? You'll need to sign back in to access your favorite templates and sync your work.
              </p>

              <div className="mt-8 flex w-full flex-col gap-3 sm:flex-row select-none">
                <button
                  onClick={onClose}
                  className="flex-1 rounded-xl border border-zinc-800 bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-zinc-300 transition-colors hover:bg-zinc-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={onConfirm}
                  className="flex-1 rounded-xl bg-rose-600 px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 cursor-pointer"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default SignoutConfirmModal
