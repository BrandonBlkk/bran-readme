import { useEffect, useState } from 'react'
import { PencilLine, Plus, Save, X } from 'lucide-react'
import Spinner from '../Spinner'
import Toggle from '../Toggle'

const ANIMATION_DURATION_MS = 200
const getSourceButtonClassName = (isDisabled = false) => `
  rounded-xl border p-3 text-left transition-all
  border-zinc-800 bg-zinc-900 text-zinc-300 hover:border-zinc-700 hover:bg-zinc-900/80
  ${isDisabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}
`

const CreateTemplateModal = ({
  isOpen,
  onClose,
  onSubmit,
  isSaving,
  hasSnapshot,
  getTagList,
  defaultAuthorName = '',
  mode = 'create',
  initialValues = null,
  onUseCurrentTemplate,
}) => {
  const isEditMode = mode === 'edit'
  const requiresSnapshot = !isEditMode
  const [name, setName] = useState(initialValues?.name ?? '')
  const [description, setDescription] = useState(initialValues?.description ?? '')
  const [tagsText, setTagsText] = useState(initialValues?.tags?.join(', ') ?? '')
  const [authorName, setAuthorName] = useState(
    initialValues?.authorName ?? defaultAuthorName,
  )
  const [isPublic, setIsPublic] = useState(initialValues?.isPublic !== false)
  const [shouldRender, setShouldRender] = useState(isOpen)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    let animationFrameId
    let hideTimeoutId
    let unmountTimeoutId

    if (isOpen) {
      animationFrameId = window.requestAnimationFrame(() => {
        setShouldRender(true)
        setIsVisible(true)
      })

      return () => {
        window.cancelAnimationFrame(animationFrameId)
      }
    }

    hideTimeoutId = setTimeout(() => setIsVisible(false), 0)
    unmountTimeoutId = setTimeout(() => setShouldRender(false), ANIMATION_DURATION_MS)

    return () => {
      clearTimeout(hideTimeoutId)
      clearTimeout(unmountTimeoutId)
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return undefined

    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isOpen, onClose])

  const handleSubmit = async (event) => {
    event.preventDefault()

    await onSubmit({
      name,
      description,
      authorName,
      tags: getTagList(tagsText),
      isPublic,
    })
  }

  return (
    shouldRender && (
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
          aria-label="Close template form"
        />
        <form
          id="create-template-form"
          onSubmit={handleSubmit}
          className={`relative z-10 flex max-h-[calc(100vh-2rem)] w-full max-w-xl flex-col overflow-hidden transform-gpu rounded-2xl border border-zinc-800 bg-zinc-950 p-5 shadow-[0_30px_90px_rgba(0,0,0,0.55)] transition-all duration-200 ease-out ${
            isVisible ? 'translate-y-0 scale-100 opacity-100' : 'translate-y-4 scale-95 opacity-0'
          }`}
          onClick={(event) => event.stopPropagation()}
        >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-zinc-500">
                  {isEditMode ? 'Update Template' : 'Share Template'}
                </p>
                <h2 className="mt-2 text-lg font-semibold text-zinc-50">
                  {isEditMode ? 'Update your template' : 'Create from current builder'}
                </h2>
                <p className="mt-1 text-xs text-zinc-500">
                  {isEditMode
                    ? 'Update the template details here, then use the generator when you want to refresh the template content.'
                    : 'This saves the current markdown and section layout from your generator.'}
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-zinc-800 p-2 text-zinc-400 transition-all hover:border-zinc-700 hover:text-zinc-100 cursor-pointer"
              >
                <X size={14} />
              </button>
            </div>

            <div className="mt-5 flex-1 space-y-3 overflow-y-auto pr-1">
              <label className="block">
                <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
                  Template name
                </span>
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  required
                  maxLength={80}
                  placeholder="My React Profile README"
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2.5 text-sm text-zinc-50 outline-none transition-colors focus:border-blue-500"
                />
              </label>

              <label className="block">
                <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
                  Description (Optional)
                </span>
                <textarea
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  maxLength={220}
                  rows={3}
                  placeholder="What this template is best for."
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2.5 text-sm text-zinc-50 outline-none transition-colors focus:border-blue-500"
                />
              </label>

              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
                    Tags
                  </span>
                  <input
                    value={tagsText}
                    onChange={(event) => setTagsText(event.target.value)}
                    required
                    placeholder="React, Portfolio, Minimal"
                    className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2.5 text-sm text-zinc-50 outline-none transition-colors focus:border-blue-500"
                  />
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
                    Author
                  </span>
                  <input
                    value={authorName}
                    onChange={(event) => setAuthorName(event.target.value)}
                    required
                    maxLength={48}
                    placeholder="Your name"
                    className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2.5 text-sm text-zinc-50 outline-none transition-colors focus:border-blue-500"
                  />
                </label>
              </div>

              <Toggle
                title="Public template"
                description="When enabled, this template appears in the community library. Turn it off to keep the template private in your My Templates list only."
                checked={isPublic}
                onChange={setIsPublic}
              />

              {isEditMode && (
                <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
                      Update README Content
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-zinc-500">
                      Edit it in the generator, `Update Template`, then come back and click `Save Changes`.
                    </p>
                  </div>

                  <div className="mt-4">
                    <button
                      type="button"
                      onClick={onUseCurrentTemplate}
                      className={getSourceButtonClassName()}
                    >
                      <div className="flex items-center gap-2 text-sm font-semibold">
                        <PencilLine size={15} />
                        Update Current One
                      </div>
                      <p className="mt-2 text-xs leading-relaxed text-zinc-400">
                        Load this saved template into the generator, edit it there, and save it back as an update.
                      </p>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {requiresSnapshot && !hasSnapshot && (
              <div className="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-200">
                No builder snapshot found. Open Home, customize your README, then come back here.
              </div>
            )}

            <div className="mt-5 flex flex-wrap justify-end gap-2 select-none">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2 text-xs font-semibold text-zinc-200 transition-all hover:bg-zinc-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving || (requiresSnapshot && !hasSnapshot)}
                className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-xs font-medium text-[#0a0a0a] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
              >
                {isSaving ? <Spinner color="border-zinc-900" /> : isEditMode ? <Save size={14} /> : <Plus size={14} />}
                {isEditMode ? 'Save Changes' : 'Save & Share'}
              </button>
            </div>
        </form>
      </div>
    )
  )
}

export default CreateTemplateModal
