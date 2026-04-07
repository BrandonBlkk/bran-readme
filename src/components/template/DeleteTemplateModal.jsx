import { useEffect, useState } from 'react'
import { Trash2, X } from 'lucide-react'
import Spinner from '../Spinner'

const ANIMATION_DURATION_MS = 200

const DeleteTemplateModal = ({
  isOpen,
  onClose,
  onConfirm,
  template,
  isDeleting = false,
}) => {
  const [activeTemplate, setActiveTemplate] = useState(isOpen ? template : null)
  const [shouldRender, setShouldRender] = useState(Boolean(isOpen && template))
  const [isVisible, setIsVisible] = useState(Boolean(isOpen && template))

  useEffect(() => {
    let syncTimeoutId
    let visibleTimeoutId
    let unmountTimeoutId

    if (isOpen && template) {
      syncTimeoutId = setTimeout(() => {
        setActiveTemplate(template)
        setShouldRender(true)
        visibleTimeoutId = setTimeout(() => setIsVisible(true), 10)
      }, 0)

      return () => {
        clearTimeout(syncTimeoutId)
        clearTimeout(visibleTimeoutId)
      }
    }

    visibleTimeoutId = setTimeout(() => setIsVisible(false), 0)
    unmountTimeoutId = setTimeout(() => {
      setShouldRender(false)
      setActiveTemplate(null)
    }, ANIMATION_DURATION_MS)

    return () => {
      clearTimeout(visibleTimeoutId)
      clearTimeout(unmountTimeoutId)
    }
  }, [isOpen, template])

  useEffect(() => {
    if (!isOpen) return undefined

    const onKeyDown = (event) => {
      if (event.key === 'Escape' && !isDeleting) {
        onClose()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isDeleting, isOpen, onClose])

  const handleClose = () => {
    if (isDeleting) return
    onClose()
  }

  return (
    shouldRender && activeTemplate && (
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm transition-opacity duration-200 ease-out ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <button
          type="button"
          className={`absolute inset-0 bg-black/60 transition-opacity duration-200 ease-out ${
            isVisible ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={handleClose}
          aria-label="Close delete template dialog"
        />
        <div
          role="dialog"
          aria-modal="true"
          className={`relative z-10 w-full max-w-md transform-gpu rounded-2xl border border-zinc-800 bg-zinc-950 p-5 shadow-[0_30px_90px_rgba(0,0,0,0.55)] transition-all duration-200 ease-out ${
            isVisible ? 'translate-y-0 scale-100 opacity-100' : 'translate-y-4 scale-95 opacity-0'
          }`}
          onClick={(event) => event.stopPropagation()}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-zinc-500">
                Delete Template
              </p>
              <h2 className="mt-2 text-lg font-semibold text-zinc-50">
                Remove this template?
              </h2>
              <p className="mt-1 text-xs leading-relaxed text-zinc-500">
                This action cannot be undone. The template will be removed from your library.
              </p>
            </div>
            <button
              type="button"
              onClick={handleClose}
              disabled={isDeleting}
              className="rounded-lg border border-zinc-800 p-2 text-zinc-400 transition-all hover:border-zinc-700 hover:text-zinc-100 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
            >
              <X size={14} />
            </button>
          </div>

          <div className="mt-5 rounded-xl border border-rose-500/20 bg-rose-500/10 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-rose-300">
              Template
            </p>
            <p className="mt-2 text-sm font-semibold text-zinc-50">
              {activeTemplate.name}
            </p>
            <p className="mt-1 text-xs leading-relaxed text-zinc-400">
              {activeTemplate.description || 'No description provided.'}
            </p>
          </div>

          <div className="mt-5 flex flex-wrap justify-end gap-2 select-none">
            <button
              type="button"
              onClick={handleClose}
              disabled={isDeleting}
              className="rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2 text-xs font-semibold text-zinc-200 transition-all hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isDeleting}
              className="flex items-center gap-2 rounded-lg bg-rose-600 px-4 py-2 text-xs font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
            >
              {isDeleting ? <Spinner color="border-white" /> : <Trash2 size={14} />}
              {isDeleting ? 'Deleting...' : 'Delete Template'}
            </button>
          </div>
        </div>
      </div>
    )
  )
}

export default DeleteTemplateModal
