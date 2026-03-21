import { AnimatePresence, motion } from 'framer-motion'
import { ExternalLink, Github, GitFork, Heart, Rocket } from 'lucide-react'
import { useEffect } from 'react'

const ProjectModal = ({ isOpen, onClose, projectUrl, sponsorUrl }) => {
  useEffect(() => {
    if (!isOpen) return undefined
    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isOpen, onClose])

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 22 }}
        >
          <motion.button
            type="button"
            aria-label="Close modal"
            className="absolute inset-0 bg-black/45"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 22 }}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            className="relative w-full max-w-lg rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-[0_30px_90px_rgba(0,0,0,0.45)]"
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ type: 'spring', stiffness: 260, damping: 22 }}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.32em] text-zinc-500">
                  Project Details
                </p>
                <h2 className="mt-2 text-xl font-semibold text-zinc-50">
                  BranReadme
                </h2>
                <p className="mt-2 text-sm text-zinc-400">
                  Build, customize, and export GitHub README sections with fast live previews.
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-full border border-zinc-800 px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400 transition-colors hover:border-zinc-700 hover:text-zinc-200 select-none"
              >
                Close
              </button>
            </div>

            <div className="mt-5 grid gap-3">
              <a
                href={projectUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900/60 px-4 py-3 text-sm text-zinc-100 transition-all hover:border-zinc-700 hover:bg-[#1e1e22] select-none"
              >
                <span className="flex items-center gap-2">
                  <Github size={16} />
                  Project GitHub
                </span>
                <ExternalLink size={14} className="text-zinc-500" />
              </a>

              <div className="grid grid-cols-2 gap-3">
                <a
                  href={`${projectUrl}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900/60 px-4 py-3 text-sm text-zinc-100 transition-all hover:border-zinc-700 hover:bg-[#1e1e22] select-none"
                >
                  <span className="flex items-center gap-2">
                    <Rocket size={16} />
                    Star Project
                  </span>
                </a>
                <a
                  href={`${projectUrl}/fork`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900/60 px-4 py-3 text-sm text-zinc-100 transition-all hover:border-zinc-700 hover:bg-[#1e1e22] select-none"
                >
                  <span className="flex items-center gap-2">
                    <GitFork size={16} />
                    Fork Repo
                  </span>
                </a>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <a
                  href={`${projectUrl}#readme`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900/60 px-4 py-3 text-sm text-zinc-100 transition-all hover:border-zinc-700 hover:bg-[#1e1e22] select-none"
                >
                  <span className="flex items-center gap-2">
                    <ExternalLink size={16} />
                    Start the Project
                  </span>
                </a>
                <a
                  href={sponsorUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900/60 px-4 py-3 text-sm text-zinc-100 transition-all hover:border-zinc-700 hover:bg-[#1e1e22] select-none"
                >
                  <span className="flex items-center gap-2">
                    <Heart size={16} />
                    Donate
                  </span>
                </a>
              </div>

              <div className="rounded-xl border border-dashed border-zinc-800 px-4 py-3 text-xs text-zinc-500">
                <p className="font-semibold uppercase tracking-[0.2em] text-zinc-400">
                  More Info
                </p>
                <p className="mt-2">
                  For releases and license, see the GitHub repository.
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default ProjectModal
