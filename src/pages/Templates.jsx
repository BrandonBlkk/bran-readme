import { useEffect, useState } from 'react'
import { Heart, LayoutGrid, Plus } from 'lucide-react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import AuthModal from '../components/auth/AuthModal'
import Footer from '../components/Footer'
import Sidebar from '../components/Sidebar'
import CreateTemplateModal from '../components/template/CreateTemplateModal'
import TemplatePreviewModal from '../components/template/TemplatePreviewModal'
import TemplateSection from '../components/template/TemplateSection'
import { PENDING_TEMPLATE_KEY } from '../constants/templateFlow'
import useTemplateLibrary from '../hooks/useTemplateLibrary'
import { hasSupabaseConfig } from '../lib/supabaseClient'
import { createSharedTemplate } from '../services/templateService'
import { generateMarkdown } from '../utils/markdown'
import { getPersistedBuilderSnapshot, sanitizeTags } from '../utils/templatePayload'

const copyToClipboard = async (value) => {
  if (!navigator.clipboard?.writeText) {
    throw new Error('Clipboard is not available in this browser.')
  }

  await navigator.clipboard.writeText(value)
}

const hasBlockedClipboardError = (error) => {
  const name = String(error?.name ?? '').toLowerCase()
  const message = String(error?.message ?? '').toLowerCase()

  return (
    name.includes('notallowed')
    || message.includes('not allowed')
    || message.includes('denied permission')
    || message.includes('user agent or the platform')
  )
}

const makeShareUrl = (templateId) => {
  if (typeof window === 'undefined') return `/templates?template=${templateId}`

  const url = new URL('/templates', window.location.origin)
  url.searchParams.set('template', templateId)
  return url.toString()
}

const getTagList = (text) =>
  sanitizeTags(
    String(text ?? '')
      .split(',')
      .map((item) => item.trim()),
  )

const getFavoriteEmptyState = (user) => {
  if (!hasSupabaseConfig) {
    return {
      title: 'Favorites need Supabase',
      description: 'Add your Supabase env keys to save favorites and sync them for each signed-in user.',
      actionLabel: '',
    }
  }

  if (!user) {
    return {
      title: 'Sign in to save favorites',
      description: 'The templates you heart will show up here so you can get back to them quickly.',
      actionLabel: 'Sign In',
    }
  }

  return {
    title: 'No favorites yet',
    description: 'Tap the heart on any template in the library and it will appear here.',
    actionLabel: '',
  }
}

const Templates = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const highlightedTemplateId = searchParams.get('template')
  const shouldOpenCreateModal = searchParams.get('create') === '1'
  const currentYear = new Date().getFullYear()

  const {
    user,
    templates,
    favoriteIds,
    favoriteTemplates,
    favoriteCount,
    isLoading,
    loadError,
    addCommunityTemplate,
    toggleFavorite,
  } = useTemplateLibrary()

  const [isAuthOpen, setIsAuthOpen] = useState(false)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [createModalKey, setCreateModalKey] = useState(0)
  const [isFavoriteView, setIsFavoriteView] = useState(false)
  const [previewTemplate, setPreviewTemplate] = useState(null)
  const [isSaving, setIsSaving] = useState(false)

  const openCreateModal = () => {
    setCreateModalKey((prev) => prev + 1)
    setIsCreateOpen(true)
  }

  useEffect(() => {
    if (!shouldOpenCreateModal) return
    setCreateModalKey((prev) => prev + 1)
    setIsCreateOpen(true)
  }, [shouldOpenCreateModal])

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
      const createdTemplate = await createSharedTemplate({
        ...values,
        payload: snapshot,
        markdown,
        isPublic: true,
      })

      addCommunityTemplate(createdTemplate)
      setIsCreateOpen(false)
      toast.success('Template created successfully.')
    } catch (error) {
      toast.error(error.message || 'Template creation failed.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleToggleFavorite = async (templateId) => {
    if (!hasSupabaseConfig) {
      toast.error('Supabase is not configured yet. Add env keys first.')
      return
    }

    if (!user) {
      setIsAuthOpen(true)
      return
    }

    try {
      const isNowFavorited = await toggleFavorite(templateId)
      toast.success(isNowFavorited ? 'Added to favorites' : 'Removed from favorites')
    } catch (error) {
      toast.error(error.message || 'Unable to update favorite.')
    }
  }

  const handleFavoriteAction = () => {
    if (!hasSupabaseConfig) return

    if (!user) {
      setIsAuthOpen(true)
      return
    }

    setIsFavoriteView((prev) => !prev)
  }

  const favoriteEmptyState = getFavoriteEmptyState(user)
  const hasSnapshot = Boolean(getPersistedBuilderSnapshot())
  const visibleTemplates = isFavoriteView ? favoriteTemplates : templates
  const sectionTitle = isFavoriteView
    ? (user ? 'Your Favorite Templates' : 'Favorite Templates')
    : 'Template Library'
  const sectionDescription = isFavoriteView
    ? (
        user
          ? 'The templates you save with the heart button stay together here for quick reuse.'
          : 'Sign in to build a personal shortlist of templates on this page.'
      )
    : 'Explore every available template, preview it, and add your go-to ones to favorites.'
  const sectionIcon = isFavoriteView ? Heart : LayoutGrid
  const sectionIconClassName = isFavoriteView ? 'text-rose-400' : 'text-blue-400'
  const emptyStateTitle = isFavoriteView ? favoriteEmptyState.title : 'No templates available'
  const emptyStateDescription = isFavoriteView
    ? favoriteEmptyState.description
    : 'Templates will appear here once the library loads.'
  const emptyActionLabel = isFavoriteView ? favoriteEmptyState.actionLabel : ''
  const emptyAction = isFavoriteView && !user && hasSupabaseConfig
    ? () => setIsAuthOpen(true)
    : undefined

  return (
    <>
      <div className="flex h-screen overflow-hidden bg-zinc-950 font-sans text-zinc-50 antialiased selection:bg-blue-500 selection:text-white">
        <Sidebar activePanel="templates" onPanelChange={() => {}} />

        <div className="ml-0 flex h-screen min-h-0 flex-1 flex-col overflow-y-auto lg:ml-12">
          <div className="w-full px-4 py-5">
            <div className="space-y-3">
              <header className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 shadow-[0_10px_30px_rgba(0,0,0,0.35)] lg:p-8">
                <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-500 select-none">
                  <span className="rounded-full border border-blue-500/30 bg-blue-500/10 px-2.5 py-1 text-blue-400">
                    Templates
                  </span>
                  <span className="rounded-full border border-zinc-800 bg-zinc-950 px-2.5 py-1 text-zinc-400">
                    Library {currentYear}
                  </span>
                  <span className="rounded-full border border-zinc-800 bg-zinc-950 px-2.5 py-1 text-zinc-400">
                    {favoriteCount} favorites
                  </span>
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h1 className="text-2xl font-semibold text-zinc-50 sm:text-3xl">
                      Prebuilt README Templates
                    </h1>
                    <p className="mt-3 max-w-2xl text-xs leading-relaxed text-zinc-400 sm:text-sm">
                      Browse built-in and community templates, favorite the ones you want to keep,
                      then load any of them straight into the builder.
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={handleFavoriteAction}
                      disabled={!hasSupabaseConfig}
                      className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-xs font-semibold text-zinc-900 transition-all disabled:cursor-not-allowed disabled:opacity-60 select-none cursor-pointer"
                    >
                      {(isFavoriteView ? <LayoutGrid className='text-blue-500' size={14} /> : <Heart className='text-rose-500' size={14} />)}
                      {user ? (isFavoriteView ? 'View All Templates' : 'View Favorites') : 'Sign In for Favorites'}
                    </button>
                    <button
                      type="button"
                      onClick={openCreateModal}
                      className="flex items-center gap-2 rounded-lg bg-rose-600 px-4 py-2 text-xs font-semibold text-white transition-all hover:bg-rose-500 select-none cursor-pointer"
                    >
                      <Plus size={14} />
                      Create Template
                    </button>
                  </div>
                </div>
              </header>

              {!hasSupabaseConfig && (
                <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-xs text-amber-100">
                  Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to enable shared templates and user favorites.
                </div>
              )}

              {loadError && (
                <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-xs text-red-100">
                  {loadError}
                </div>
              )}

              <TemplateSection
                id={isFavoriteView ? 'favorite-templates' : 'template-library'}
                title={sectionTitle}
                description={sectionDescription}
                icon={sectionIcon}
                iconClassName={sectionIconClassName}
                templates={visibleTemplates}
                isLoading={isLoading}
                skeletonCount={isFavoriteView ? 3 : 6}
                highlightedTemplateId={highlightedTemplateId}
                favoriteIds={favoriteIds}
                onUseTemplate={handleUseTemplate}
                onToggleFavorite={handleToggleFavorite}
                onPreviewTemplate={setPreviewTemplate}
                emptyStateTitle={emptyStateTitle}
                emptyStateDescription={emptyStateDescription}
                emptyActionLabel={emptyActionLabel}
                onEmptyAction={emptyAction}
              />

              <Footer label="README Templates Gallery" />
            </div>
          </div>
        </div>
      </div>

      <CreateTemplateModal
        key={createModalKey}
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={handleCreateTemplate}
        isSaving={isSaving}
        hasSnapshot={hasSnapshot}
        getTagList={getTagList}
      />

      <TemplatePreviewModal
        isOpen={Boolean(previewTemplate)}
        onClose={() => setPreviewTemplate(null)}
        template={previewTemplate}
        onUseTemplate={handleUseTemplate}
      />

      {hasSupabaseConfig && (
        <AuthModal
          isOpen={isAuthOpen}
          onClose={() => setIsAuthOpen(false)}
        />
      )}
    </>
  )
}

export default Templates
