import React, { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { LayoutGrid, Sparkles, Plus, Heart, Loader2, X, Eye } from 'lucide-react'
import { toast } from 'sonner'
import Sidebar from '../components/Sidebar'
import TemplateMockup from '../components/TemplateMockup'
import Footer from '../components/Footer'
import Preview from '../components/readme-builder/Preview'
import { hasSupabaseConfig } from '../lib/supabaseClient'
import {
  createSharedTemplate,
  fetchSharedTemplates,
  getBuiltinTemplates,
  fetchFavorites,
  toggleFavorite as toggleRemoteFavorite,
} from '../services/templateService'
import { getCurrentUser } from '../services/authService'
import { PENDING_TEMPLATE_KEY } from '../constants/templateFlow'
import { generateMarkdown } from '../utils/markdown'
import { getPersistedBuilderSnapshot, sanitizeTags } from '../utils/templatePayload'

const FAVORITES_KEY = 'branreadme:templateFavorites'

const pillBase = 'inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em]'

const safeParse = (value) => {
  try {
    return JSON.parse(value)
  } catch {
    return null
  }
}

const readFavoriteIds = () => {
  if (typeof window === 'undefined') return new Set()
  const raw = window.localStorage.getItem(FAVORITES_KEY)
  if (!raw) return new Set()
  const parsed = safeParse(raw)
  if (!Array.isArray(parsed)) return new Set()
  return new Set(parsed.map((item) => String(item)))
}

const writeFavoriteIds = (ids) => {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(FAVORITES_KEY, JSON.stringify(Array.from(ids)))
}

const copyToClipboard = async (value) => {
  if (!navigator.clipboard?.writeText) {
    throw new Error('Clipboard is not available in this browser.')
  }
  await navigator.clipboard.writeText(value)
}

const makeShareUrl = (templateId) => {
  if (typeof window === 'undefined') return `/templates?template=${templateId}`
  const base = `  https://bran-readme.vercel.app/templates`
  return `${base}?template=${encodeURIComponent(templateId)}`
}

const getTagList = (text) =>
  sanitizeTags(
    String(text ?? '')
      .split(',')
      .map((item) => item.trim()),
  )

const CreateTemplateModal = ({
  isOpen,
  onClose,
  onSubmit,
  isSaving,
  hasSnapshot,
}) => {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [tagsText, setTagsText] = useState('')
  const [authorName, setAuthorName] = useState('')

  useEffect(() => {
    if (!isOpen) return
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isOpen, onClose])

  useEffect(() => {
    if (isOpen) return
    setName('')
    setDescription('')
    setTagsText('')
    setAuthorName('')
  }, [isOpen])

  const handleSubmit = async (event) => {
    event.preventDefault()
    await onSubmit({
      name,
      description,
      authorName,
      tags: getTagList(tagsText),
    })
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 22 }}
        >
          <motion.button
            type="button"
            className="absolute inset-0 bg-black/60"
            onClick={onClose}
            aria-label="Close template form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 22 }}
          />
          <motion.form
            id="create-template-form"
            onSubmit={handleSubmit}
            className="relative z-10 w-full max-w-xl rounded-2xl border border-zinc-800 bg-zinc-950 p-5 shadow-[0_30px_90px_rgba(0,0,0,0.55)]"
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ type: 'spring', stiffness: 260, damping: 22 }}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-zinc-500">Share Template</p>
                <h2 className="mt-2 text-lg font-semibold text-zinc-50">Create from current builder</h2>
                <p className="mt-1 text-xs text-zinc-500">
                  This saves the current markdown and section layout from your generator.
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

            <div className="mt-5 space-y-3">
              <label className="block">
                <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">Template name</span>
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
                <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">Description (Optional)</span>
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
                  <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">Tags</span>
                  <input
                    value={tagsText}
                    onChange={(event) => setTagsText(event.target.value)}
                    required
                    placeholder="React, Portfolio, Minimal"
                    className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2.5 text-sm text-zinc-50 outline-none transition-colors focus:border-blue-500"
                  />
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">Author</span>
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
            </div>

            {!hasSnapshot && (
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
                disabled={isSaving || !hasSnapshot}
                className="flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-medium bg-white text-[#0a0a0a] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
              >
                {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                Save & Share
              </button>
            </div>
          </motion.form>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

const TemplatePreviewModal = ({
  isOpen,
  onClose,
  template,
  onUseTemplate,
}) => {
  const previewMarkdown =
    template?.previewMarkdown
    || template?.markdown
    || generateMarkdown(template?.payload?.sections || [])

  return (
    <AnimatePresence>
      {isOpen && template && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 22 }}
        >
          <motion.button
            type="button"
            className="absolute inset-0 bg-black/60"
            onClick={onClose}
            aria-label="Close template preview"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 22 }}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            className="relative z-10 w-full max-w-242 rounded-2xl border border-zinc-800 bg-zinc-950 p-5 shadow-[0_30px_90px_rgba(0,0,0,0.55)]"
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ type: 'spring', stiffness: 260, damping: 22 }}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-zinc-500">Template Preview</p>
                <h2 className="mt-2 text-lg font-semibold text-zinc-50">{template.name}</h2>
                <p className="mt-1 text-sm text-zinc-400">{template.description}</p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-zinc-800 p-2 text-zinc-400 transition-all hover:border-zinc-700 hover:text-zinc-100 cursor-pointer"
              >
                <X size={14} />
              </button>
            </div>

            <div className="flex flex-col items-center mt-4 max-h-[70vh] overflow-y-auto rounded-xl border border-zinc-800 bg-zinc-900 p-3 sm:p-4">
              <Preview
                markdown={previewMarkdown}
                previewTheme="dark"
              />
            </div>

            <div className="mt-4 flex flex-wrap justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2 text-xs font-semibold text-zinc-200 transition-all hover:bg-zinc-800 cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => onUseTemplate(template)}
                className="flex items-center gap-2 rounded-lg bg-zinc-50 px-4 py-2 text-xs font-bold text-zinc-950 transition-all hover:bg-zinc-200 cursor-pointer"
              >
                <Sparkles size={14} />
                Use Template
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

const Templates = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const highlightedTemplateId = searchParams.get('template')
  const shouldOpenCreateModal = searchParams.get('create') === '1'
  const currentYear = new Date().getFullYear()

  const [favorites, setFavorites] = useState(readFavoriteIds)
  const [communityTemplates, setCommunityTemplates] = useState([])
  const [isLoading, setIsLoading] = useState(hasSupabaseConfig)
  const [loadError, setLoadError] = useState('')
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [previewTemplate, setPreviewTemplate] = useState(null)
  const [isSaving, setIsSaving] = useState(false)

  const builtinTemplates = useMemo(() => getBuiltinTemplates(), [])
  const favoriteCount = useMemo(() => favorites.size, [favorites])
  const templates = useMemo(
    () => [...communityTemplates, ...builtinTemplates],
    [communityTemplates, builtinTemplates],
  )

  useEffect(() => {
    let isMounted = true

    const loadData = async () => {
      if (!hasSupabaseConfig) {
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        setLoadError('')
        
        // Load Templates and Favorites in parallel
        const [remoteTemplates, user] = await Promise.all([
          fetchSharedTemplates(),
          getCurrentUser()
        ])

        if (isMounted) {
          setCommunityTemplates(remoteTemplates)
          if (user) {
            const favIds = await fetchFavorites()
            setFavorites(new Set(favIds))
          }
        }
      } catch (error) {
        if (isMounted) {
          setLoadError(error.message || 'Unable to load data from Supabase.')
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadData()
    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    if (!shouldOpenCreateModal) return
    setIsCreateOpen(true)
  }, [shouldOpenCreateModal])

  const toggleFavorite = async (id) => {
    try {
      const isNowFavorited = await toggleRemoteFavorite(id)
      setFavorites((prev) => {
        const next = new Set(prev)
        isNowFavorited ? next.add(id) : next.delete(id)
        return next
      })
      toast.success(isNowFavorited ? 'Added to favorites' : 'Removed from favorites')
    } catch (error) {
      toast.error(error.message || 'Action failed')
    }
  }

  const handleUseTemplate = (template) => {
    if (!template.payload?.sections?.length) {
      toast.error('This template has no section payload yet.')
      return
    }
    setPreviewTemplate(null)
    window.sessionStorage.setItem(PENDING_TEMPLATE_KEY, JSON.stringify(template.payload))
    navigate('/')
  }

  const handleShareTemplate = async (templateId) => {
    try {
      await copyToClipboard(makeShareUrl(templateId))
      toast.success('Template link copied.')
    } catch (error) {
      toast.error(error.message || 'Unable to copy template link.')
    }
  }

  const handleCreateTemplate = async (values) => {
    const snapshot = getPersistedBuilderSnapshot()
    if (!snapshot) {
      toast.error('No builder snapshot found. Build your README on Home first.')
      return
    }
    if (!hasSupabaseConfig) {
      toast.error('Supabase is not configured yet. Add env keys first.')
      return
    }

    try {
      setIsSaving(true)
      const markdown = generateMarkdown(snapshot.sections || [])
      const created = await createSharedTemplate({
        ...values,
        payload: snapshot,
        markdown,
        isPublic: true,
      })
      setCommunityTemplates((prev) => [created, ...prev])
      setIsCreateOpen(false)
      toast.success('Template created and shared.')
      await handleShareTemplate(created.id)
    } catch (error) {
      toast.error(error.message || 'Template creation failed.')
    } finally {
      setIsSaving(false)
    }
  }

  const hasSnapshot = Boolean(getPersistedBuilderSnapshot())

  return (
    <>
      <div className="flex h-screen overflow-hidden bg-zinc-950 font-sans text-zinc-50 antialiased selection:bg-blue-500 selection:text-white">
        <Sidebar activePanel="templates" onPanelChange={() => {}} />

        <div className="ml-0 lg:ml-12 flex h-screen min-h-0 flex-1 flex-col overflow-y-auto">
          <div className="w-full px-4 py-5">
            <div className="space-y-3">
              <header className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 shadow-[0_10px_30px_rgba(0,0,0,0.35)] lg:p-8">
                <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-500 select-none">
                  <span className="rounded-full border border-blue-500/30 bg-blue-500/10 px-2.5 py-1 text-blue-400">Templates</span>
                  <span className="rounded-full border border-zinc-800 bg-zinc-950 px-2.5 py-1 text-zinc-400">Library {currentYear}</span>
                  <span className="rounded-full border border-zinc-800 bg-zinc-950 px-2.5 py-1 text-zinc-400">{favoriteCount} favorites</span>
                </div>
                <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h1 className="text-2xl font-semibold text-zinc-50 sm:text-3xl">Prebuilt README Templates</h1>
                    <p className="mt-3 max-w-2xl text-xs leading-relaxed text-zinc-400 sm:text-sm">
                      Browse community templates, then load one into the builder with a click.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setIsCreateOpen(true)}
                      className="flex items-center gap-2 rounded-lg bg-rose-600 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-500 transition-all select-none cursor-pointer"
                    >
                      <Plus size={14} />
                      Create Template
                    </button>
                  </div>
                </div>
              </header>

              {!hasSupabaseConfig && (
                <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-xs text-amber-100">
                  Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to enable saving shared templates.
                </div>
              )}

              {loadError && (
                <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-xs text-red-100">
                  {loadError}
                </div>
              )}

              <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 lg:p-7">
                <div className="mb-6 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <LayoutGrid size={18} className="text-blue-400" />
                    <h2 className="text-sm font-semibold sm:text-base text-zinc-100">
                      Community Templates
                    </h2>
                  </div>
                </div>

               {isLoading && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/10 backdrop-blur-md">
                    <div className="flex flex-col items-center gap-2">
                      <p className='w-10 h-10 animate-spin rounded-full border-t-2 border-zinc-50'></p>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {templates.map((template) => {
                    const isFavorite = favorites.has(template.id)
                    const isHighlighted = highlightedTemplateId === template.id
                    const previewMarkdown =
                      template.markdown
                      || generateMarkdown(template.payload?.sections || [])
                    return (
                      <article
                        key={template.id}
                        className={`group relative flex flex-col rounded-2xl border bg-zinc-950 p-5 transition-all ${
                          isHighlighted
                            ? 'border-blue-500/70 shadow-[0_0_0_1px_rgba(59,130,246,0.4)]'
                            : 'border-zinc-800 hover:border-zinc-700'
                        }`}
                      >
                        <TemplateMockup
                          markdown={previewMarkdown}
                          onClick={() => setPreviewTemplate({ ...template, previewMarkdown })}
                        />

                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <h3 className="text-sm font-bold text-zinc-50">{template.name}</h3>
                            <p className="mt-1.5 text-[11px] leading-relaxed text-zinc-500 line-clamp-2">{template.description || 'No description'}</p>
                            <p className="mt-2 text-[10px] uppercase tracking-[0.16em] text-zinc-600">{template.authorName} | {template.meta}</p>
                          </div>
                          <button
                            onClick={() => toggleFavorite(template.id)}
                            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border transition-all cursor-pointer ${
                              isFavorite
                                ? 'border-rose-500/40 bg-rose-400/10 text-rose-500'
                                : 'border-zinc-800 text-zinc-600 hover:text-zinc-300'
                            }`}
                          >
                            <Heart size={14} fill={isFavorite ? 'currentColor' : 'none'} />
                          </button>
                        </div>

                        <div className="mt-4 flex flex-wrap gap-2 select-none">
                          {template.tags.map((tag) => (
                            <span key={tag} className={`${pillBase} border-zinc-800 bg-zinc-900 text-zinc-500`}>{tag}</span>
                          ))}
                          {!template.tags?.length && (
                            <span className={`${pillBase} border-zinc-800 bg-zinc-900 text-zinc-600`}>No tags</span>
                          )}
                        </div>

                        <div className="mt-6 grid grid-cols-2 gap-2">
                          <button
                            onClick={() => setPreviewTemplate({ ...template, previewMarkdown })}
                            className="flex items-center justify-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900 py-2.5 text-xs font-bold text-zinc-400 transition-all hover:bg-zinc-800 hover:text-zinc-200 active:scale-95 select-none cursor-pointer"
                          >
                            <Eye size={14} />
                            Preview
                          </button>
                          <button
                            onClick={() => handleUseTemplate(template)}
                            className="flex items-center justify-center gap-2 rounded-xl bg-zinc-50 py-2.5 text-xs font-bold text-zinc-950 transition-all hover:bg-zinc-200 active:scale-95 select-none cursor-pointer"
                          >
                            <Sparkles size={14} />
                            Use Template
                          </button>
                        </div>
                      </article>
                    )
                  })}
                </div>
              </section>

              <Footer label="README Templates Gallery" />
            </div>
          </div>
        </div>
      </div>

      <CreateTemplateModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={handleCreateTemplate}
        isSaving={isSaving}
        hasSnapshot={hasSnapshot}
      />
      <TemplatePreviewModal
        isOpen={Boolean(previewTemplate)}
        onClose={() => setPreviewTemplate(null)}
        template={previewTemplate}
        onUseTemplate={handleUseTemplate}
      />
    </>
  )
}

export default Templates
