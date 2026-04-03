import { useEffect, useState } from 'react'
import { Sparkles, X } from 'lucide-react'
import Preview from '../readme-builder/Preview'
import { generateMarkdown } from '../../utils/markdown'

const ANIMATION_DURATION_MS = 200

const TemplatePreviewModal = ({
  isOpen,
  onClose,
  template,
  onUseTemplate,
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

  const previewMarkdown =
    activeTemplate?.previewMarkdown
    || activeTemplate?.markdown
    || generateMarkdown(activeTemplate?.payload?.sections || [])

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
          onClick={onClose}
          aria-label="Close template preview"
        />
        <div
          role="dialog"
          aria-modal="true"
          className={`relative z-10 w-full max-w-242 transform-gpu rounded-2xl border border-zinc-800 bg-zinc-950 p-5 shadow-[0_30px_90px_rgba(0,0,0,0.55)] transition-all duration-200 ease-out ${
            isVisible ? 'translate-y-0 scale-100 opacity-100' : 'translate-y-4 scale-95 opacity-0'
          }`}
          onClick={(event) => event.stopPropagation()}
        >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-zinc-500">
                  Template Preview
                </p>
                <h2 className="mt-2 text-lg font-semibold text-zinc-50">{activeTemplate.name}</h2>
                <p className="mt-1 text-sm text-zinc-400">{activeTemplate.description}</p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-zinc-800 p-2 text-zinc-400 transition-all hover:border-zinc-700 hover:text-zinc-100 cursor-pointer"
              >
                <X size={14} />
              </button>
            </div>

            <div className="mt-4 flex max-h-[70vh] flex-col items-center overflow-y-auto rounded-xl border border-zinc-800 bg-zinc-900 p-3 sm:p-4">
              <Preview
                markdown={previewMarkdown}
                previewTheme="dark"
              />
            </div>

            <div className="mt-4 flex flex-wrap justify-end gap-2 select-none">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2 text-xs font-semibold text-zinc-200 transition-all hover:bg-zinc-800 cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => onUseTemplate(activeTemplate)}
                className="flex items-center gap-2 rounded-lg bg-zinc-50 px-4 py-2 text-xs font-bold text-zinc-950 transition-all hover:bg-zinc-200 cursor-pointer"
              >
                <Sparkles size={14} />
                Use Template
              </button>
            </div>
        </div>
      </div>
    )
  )
}

export default TemplatePreviewModal
