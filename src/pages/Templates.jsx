import { useEffect, useRef, useState } from 'react'
import { Heart, LayoutGrid, Plus, Sparkles } from 'lucide-react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import AuthModal from '../components/auth/AuthModal'
import Footer from '../components/Footer'
import Sidebar from '../components/Sidebar'
import CreateTemplateModal from '../components/template/CreateTemplateModal'
import DeleteTemplateModal from '../components/template/DeleteTemplateModal'
import TemplatePreviewModal from '../components/template/TemplatePreviewModal'
import TemplateSection from '../components/template/TemplateSection'
import { PENDING_TEMPLATE_KEY, PENDING_TEMPLATE_UPDATE_KEY } from '../constants/templateFlow'
import useTemplateLibrary from '../hooks/useTemplateLibrary'
import { hasSupabaseConfig } from '../lib/supabaseClient'
import { createSharedTemplate, deleteSharedTemplate, updateSharedTemplate } from '../services/templateService'
import { extractGithubAccount } from '../utils/githubAccount'
import { generateMarkdown } from '../utils/markdown'
import { getPersistedBuilderSnapshot, sanitizeTags } from '../utils/templatePayload'

const getTagList = (text) =>
  sanitizeTags(
    String(text ?? '')
      .split(',')
      .map((item) => item.trim()),
  )

const getTemplateAuthorName = (user) => {
  const githubAccount = extractGithubAccount(user)
  const metadata = user?.user_metadata ?? {}
  const email = String(user?.email ?? '').trim()

  return (
    githubAccount?.displayName
    || String(metadata.full_name ?? '').trim()
    || String(metadata.name ?? '').trim()
    || (email ? email.split('@')[0] : '')
    || 'Community'
  )
}

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

const getOwnedEmptyState = (user) => {
  if (!hasSupabaseConfig) {
    return {
      title: 'Created templates need Supabase',
      description: 'Add your Supabase env keys so templates can be linked to each signed-in user.',
      actionLabel: '',
    }
  }

  if (!user) {
    return {
      title: 'Sign in to view your templates',
      description: 'Templates you create are connected to your account and will show up here.',
      actionLabel: 'Sign In',
    }
  }

  return {
    title: 'No templates created yet',
    description: 'Save your current builder snapshot as a template and it will appear here.',
    actionLabel: 'Create Template',
  }
}

const getViewButtonClassName = (isActive, isDisabled = false) => `
  flex items-center gap-2 rounded-lg border px-4 py-2 text-xs font-semibold transition-all select-none
  ${isActive
    ? 'border-white bg-white text-zinc-900'
    : 'border-zinc-800 bg-zinc-950 text-zinc-300 hover:border-zinc-700 hover:text-zinc-100'}
  ${isDisabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}
`

const isTemplateOwner = (template, userId) =>
  Boolean(template?.userId && userId && template.userId === userId)

const Templates = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const highlightedTemplateId = searchParams.get('template')
  const shouldOpenCreateModal = searchParams.get('create') === '1'
  const pendingTemplateUpdateId = searchParams.get('update')
  const currentYear = new Date().getFullYear()
  const processedTemplateUpdateRef = useRef('')

  const {
    user,
    templates,
    favoriteIds,
    favoriteTemplates,
    favoriteCount,
    ownedTemplates,
    ownedCount,
    isLoading,
    loadError,
    addCreatedTemplate,
    updateManagedTemplate,
    removeManagedTemplate,
    toggleFavorite,
  } = useTemplateLibrary()

  const [isAuthOpen, setIsAuthOpen] = useState(false)
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false)
  const [isDeleteTemplateModalOpen, setIsDeleteTemplateModalOpen] = useState(false)
  const [templateModalKey, setTemplateModalKey] = useState(0)
  const [templateModalMode, setTemplateModalMode] = useState('create')
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [templatePendingDelete, setTemplatePendingDelete] = useState(null)
  const [activeView, setActiveView] = useState('all')
  const [previewTemplate, setPreviewTemplate] = useState(null)
  const [isSubmittingTemplate, setIsSubmittingTemplate] = useState(false)
  const [deletingTemplateId, setDeletingTemplateId] = useState(null)

  const buildTemplatesRoute = (params = searchParams) => {
    const nextParams = new URLSearchParams(params)
    const query = nextParams.toString()
    return query ? `/templates?${query}` : '/templates'
  }

  const clearTemplateModalQueryParams = () => {
    const nextParams = new URLSearchParams(searchParams)
    nextParams.delete('create')
    nextParams.delete('update')
    navigate(buildTemplatesRoute(nextParams), { replace: true })
  }

  const openTemplateModal = (mode, template = null) => {
    setIsSubmittingTemplate(false)
    setTemplateModalMode(mode)
    setSelectedTemplate(template)
    setTemplateModalKey((prev) => prev + 1)
    setIsTemplateModalOpen(true)
  }

  const startTemplateUpdateFlow = (template) => {
    if (!template || !user) return

    if (typeof window !== 'undefined') {
      window.sessionStorage.setItem(PENDING_TEMPLATE_KEY, JSON.stringify(template.payload))
      window.sessionStorage.setItem(
        PENDING_TEMPLATE_UPDATE_KEY,
        JSON.stringify({ templateId: template.id }),
      )
    }

    setIsTemplateModalOpen(false)
    navigate('/')
  }

  const closeDeleteTemplateModal = () => {
    setIsDeleteTemplateModalOpen(false)
    setTemplatePendingDelete(null)
  }

  const openCreateModal = () => {
    if (!hasSupabaseConfig) {
      toast.error('Supabase is not configured yet. Add env keys first.')
      return
    }

    if (!user) {
      setIsAuthOpen(true)
      return
    }

    openTemplateModal('create')
  }

  useEffect(() => {
    if (!shouldOpenCreateModal || isTemplateModalOpen || !hasSupabaseConfig) return

    if (!user) {
      setIsAuthOpen(true)
      return
    }

    setTemplateModalMode('create')
    setSelectedTemplate(null)
    setTemplateModalKey((prev) => prev + 1)
    setIsTemplateModalOpen(true)
  }, [isTemplateModalOpen, shouldOpenCreateModal, user])

  useEffect(() => {
    if (typeof window === 'undefined' || pendingTemplateUpdateId) return

    window.sessionStorage.removeItem(PENDING_TEMPLATE_UPDATE_KEY)
    processedTemplateUpdateRef.current = ''
  }, [pendingTemplateUpdateId])

  useEffect(() => {
    if (!pendingTemplateUpdateId || !hasSupabaseConfig || isLoading) return
    if (processedTemplateUpdateRef.current === pendingTemplateUpdateId) return

    if (!user) {
      setIsAuthOpen(true)
      return
    }

    const templateToUpdate = ownedTemplates.find((template) => template.id === pendingTemplateUpdateId)
    if (!templateToUpdate) {
      toast.error('Template not found or you do not have permission to update it.')
      navigate('/templates', { replace: true })
      return
    }

    processedTemplateUpdateRef.current = pendingTemplateUpdateId
    setActiveView('mine')
    setIsSubmittingTemplate(false)
    setTemplateModalMode('edit')
    setSelectedTemplate(templateToUpdate)
    setTemplateModalKey((prev) => prev + 1)
    setIsTemplateModalOpen(true)
    toast.success('Template loaded from generator. Click Save Changes to finish the update.')
  }, [
    pendingTemplateUpdateId,
    user,
    isLoading,
    ownedTemplates,
    navigate,
  ])

  const handleUseTemplate = (template) => {
    if (!template.payload?.sections?.length) {
      toast.error('This template has no section payload yet.')
      return
    }

    setPreviewTemplate(null)
    window.sessionStorage.setItem(PENDING_TEMPLATE_KEY, JSON.stringify(template.payload))
    navigate('/')
  }

  const handleEditTemplate = (template) => {
    if (!hasSupabaseConfig) {
      toast.error('Supabase is not configured yet. Add env keys first.')
      return
    }

    if (!user) {
      setIsAuthOpen(true)
      return
    }

    if (!isTemplateOwner(template, user.id)) {
      toast.error('Only the creator can update this template.')
      return
    }

    openTemplateModal('edit', template)
  }

  const handleUseCurrentTemplateForUpdate = () => {
    if (!selectedTemplate || !user) return

    if (!isTemplateOwner(selectedTemplate, user.id)) {
      toast.error('Only the creator can update this template.')
      return
    }

    startTemplateUpdateFlow(selectedTemplate)
  }

  const handleDeleteTemplate = (template) => {
    if (!hasSupabaseConfig) {
      toast.error('Supabase is not configured yet. Add env keys first.')
      return
    }

    if (!user) {
      setIsAuthOpen(true)
      return
    }

    if (!isTemplateOwner(template, user.id)) {
      toast.error('Only the creator can delete this template.')
      return
    }

    setTemplatePendingDelete(template)
    setIsDeleteTemplateModalOpen(true)
  }

  const handleConfirmDeleteTemplate = async () => {
    if (!templatePendingDelete || !user) return

    const template = templatePendingDelete

    const removePreviewIfMatches = (currentTemplate) => (
      currentTemplate?.id === template.id ? null : currentTemplate
    )

    try {
      setDeletingTemplateId(template.id)
      await deleteSharedTemplate({
        templateId: template.id,
        userId: user.id,
      })

      removeManagedTemplate(template.id)
      setPreviewTemplate(removePreviewIfMatches)
      setSelectedTemplate((currentTemplate) => (
        currentTemplate?.id === template.id ? null : currentTemplate
      ))
      closeDeleteTemplateModal()
      toast.success('Template deleted successfully.')
    } catch (error) {
      toast.error(error.message || 'Template deletion failed.')
    } finally {
      setDeletingTemplateId(null)
    }
  }

  const handleUpdateTemplate = async (values) => {
    if (!hasSupabaseConfig) {
      toast.error('Supabase is not configured yet. Add env keys first.')
      return
    }

    if (!user) {
      setIsAuthOpen(true)
      return
    }

    if (!selectedTemplate || !isTemplateOwner(selectedTemplate, user.id)) {
      toast.error('Only the creator can update this template.')
      return
    }

    const shouldApplyGeneratorSnapshot = pendingTemplateUpdateId === selectedTemplate.id
    const snapshot = shouldApplyGeneratorSnapshot ? getPersistedBuilderSnapshot() : null

    if (shouldApplyGeneratorSnapshot && !snapshot) {
      toast.error('No builder snapshot found. Open Home, edit the README, then update again.')
      return
    }

    try {
      setIsSubmittingTemplate(true)

      const updatedTemplate = await updateSharedTemplate({
        templateId: selectedTemplate.id,
        userId: user.id,
        ...values,
        ...(shouldApplyGeneratorSnapshot
          ? {
              payload: snapshot,
              markdown: generateMarkdown(snapshot.sections || []),
            }
          : {}),
      })

      updateManagedTemplate(updatedTemplate)
      setSelectedTemplate(updatedTemplate)
      setPreviewTemplate((currentTemplate) => (
        currentTemplate?.id === updatedTemplate.id
          ? { ...currentTemplate, ...updatedTemplate }
          : currentTemplate
      ))
      setIsTemplateModalOpen(false)
      if (typeof window !== 'undefined') {
        window.sessionStorage.removeItem(PENDING_TEMPLATE_UPDATE_KEY)
      }
      toast.success('Template updated successfully.')
      clearTemplateModalQueryParams()
    } catch (error) {
      toast.error(error.message || 'Template update failed.')
    } finally {
      setIsSubmittingTemplate(false)
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

    if (!user) {
      setIsAuthOpen(true)
      return
    }

    try {
      setIsSubmittingTemplate(true)

      const markdown = generateMarkdown(snapshot.sections || [])
      const createdTemplate = await createSharedTemplate({
        ...values,
        payload: snapshot,
        markdown,
        userId: user.id,
      })

      addCreatedTemplate(createdTemplate)
      setActiveView('mine')
      setIsTemplateModalOpen(false)
      toast.success('Template created successfully.')
    } catch (error) {
      toast.error(error.message || 'Template creation failed.')
    } finally {
      setIsSubmittingTemplate(false)
    }
  }

  const handleSubmitTemplate = async (values) => {
    if (templateModalMode === 'edit') {
      await handleUpdateTemplate(values)
      return
    }

    await handleCreateTemplate(values)
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

  const handleChangeView = (nextView) => {
    if (nextView === 'all') {
      setActiveView('all')
      return
    }

    if (!hasSupabaseConfig) return

    if (!user) {
      setIsAuthOpen(true)
      return
    }

    setActiveView(nextView)
  }

  const favoriteEmptyState = getFavoriteEmptyState(user)
  const ownedEmptyState = getOwnedEmptyState(user)
  const hasSnapshot = Boolean(getPersistedBuilderSnapshot())
  const isFavoriteView = activeView === 'favorites'
  const isOwnedView = activeView === 'mine'
  const visibleTemplates = isFavoriteView
    ? favoriteTemplates
    : isOwnedView
      ? ownedTemplates
      : templates
  const sectionTitle = isFavoriteView
    ? (user ? 'Your Favorite Templates' : 'Favorite Templates')
    : isOwnedView
      ? (user ? 'Your Created Templates' : 'My Templates')
      : 'Template Library'
  const sectionDescription = isFavoriteView
    ? (
        user
          ? 'The templates you save with the heart button stay together here for quick reuse.'
          : 'Sign in to build a personal shortlist of templates on this page.'
      )
    : isOwnedView
      ? (
          user
            ? 'Every template you create is tied to your account and listed here for fast access.'
            : 'Sign in to view the templates connected to your account.'
        )
      : 'Explore every available template, preview it, favorite the ones you want to keep, and save your own.'
  const sectionIcon = isFavoriteView ? Heart : isOwnedView ? Sparkles : LayoutGrid
  const sectionIconClassName = isFavoriteView
    ? 'text-rose-400'
    : isOwnedView
      ? 'text-emerald-400'
      : 'text-blue-400'
  const emptyStateTitle = isFavoriteView
    ? favoriteEmptyState.title
    : isOwnedView
      ? ownedEmptyState.title
      : 'No templates available'
  const emptyStateDescription = isFavoriteView
    ? favoriteEmptyState.description
    : isOwnedView
      ? ownedEmptyState.description
      : 'Templates will appear here once the library loads.'
  const emptyActionLabel = isFavoriteView
    ? favoriteEmptyState.actionLabel
    : isOwnedView
      ? ownedEmptyState.actionLabel
      : ''
  const emptyAction = isFavoriteView
    ? (hasSupabaseConfig && !user ? () => setIsAuthOpen(true) : undefined)
    : isOwnedView
      ? (
          !hasSupabaseConfig
            ? undefined
            : user
              ? openCreateModal
              : () => setIsAuthOpen(true)
        )
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
                  <span className="rounded-full border border-zinc-800 bg-zinc-950 px-2.5 py-1 text-zinc-400">
                    {ownedCount} created
                  </span>
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h1 className="text-2xl font-semibold text-zinc-50 sm:text-3xl">
                      Prebuilt README Templates
                    </h1>
                    <p className="mt-3 max-w-2xl text-xs leading-relaxed text-zinc-400 sm:text-sm">
                      Browse built-in and community templates, keep favorites together, and revisit
                      the templates created from your own account whenever you need them.
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => handleChangeView('all')}
                      className={getViewButtonClassName(activeView === 'all')}
                    >
                      <LayoutGrid size={14} />
                      All Templates
                    </button>
                    <button
                      type="button"
                      onClick={() => handleChangeView('favorites')}
                      disabled={!hasSupabaseConfig}
                      className={getViewButtonClassName(activeView === 'favorites', !hasSupabaseConfig)}
                    >
                      <Heart size={14} className={activeView === 'favorites' ? '' : 'text-rose-500'} />
                      Favorites
                    </button>
                    <button
                      type="button"
                      onClick={() => handleChangeView('mine')}
                      disabled={!hasSupabaseConfig}
                      className={getViewButtonClassName(activeView === 'mine', !hasSupabaseConfig)}
                    >
                      <Sparkles size={14} className={activeView === 'mine' ? '' : 'text-emerald-500'} />
                      My Templates
                    </button>
                    <button
                      type="button"
                      onClick={openCreateModal}
                      className="flex items-center gap-2 rounded-lg bg-rose-600 px-4 py-2 text-xs font-semibold text-white transition-all hover:bg-rose-500 select-none cursor-pointer"
                    >
                      <Plus size={14} />
                      {user ? 'Create Template' : 'Sign In to Create'}
                    </button>
                  </div>
                </div>
              </header>

              {!hasSupabaseConfig && (
                <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-xs text-amber-100">
                  Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to enable shared templates, favorites, and user-owned templates.
                </div>
              )}

              {loadError && (
                <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-xs text-red-100">
                  {loadError}
                </div>
              )}

              <TemplateSection
                id={isFavoriteView ? 'favorite-templates' : isOwnedView ? 'my-templates' : 'template-library'}
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
                onEditTemplate={handleEditTemplate}
                onDeleteTemplate={handleDeleteTemplate}
                onToggleFavorite={handleToggleFavorite}
                onPreviewTemplate={setPreviewTemplate}
                currentUserId={user?.id ?? null}
                deletingTemplateId={deletingTemplateId}
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
        key={templateModalKey}
        isOpen={isTemplateModalOpen}
        onClose={() => {
          setIsSubmittingTemplate(false)
          setIsTemplateModalOpen(false)
          if (typeof window !== 'undefined') {
            window.sessionStorage.removeItem(PENDING_TEMPLATE_UPDATE_KEY)
          }
          clearTemplateModalQueryParams()
        }}
        onSubmit={handleSubmitTemplate}
        isSaving={isSubmittingTemplate}
        hasSnapshot={hasSnapshot}
        getTagList={getTagList}
        defaultAuthorName={getTemplateAuthorName(user)}
        mode={templateModalMode}
        onUseCurrentTemplate={handleUseCurrentTemplateForUpdate}
        initialValues={selectedTemplate ? {
          name: selectedTemplate.name,
          description: selectedTemplate.description,
          tags: selectedTemplate.tags,
          authorName: selectedTemplate.authorName,
          isPublic: selectedTemplate.isPublic,
        } : null}
      />

      <DeleteTemplateModal
        isOpen={isDeleteTemplateModalOpen}
        onClose={closeDeleteTemplateModal}
        onConfirm={handleConfirmDeleteTemplate}
        template={templatePendingDelete}
        isDeleting={deletingTemplateId === templatePendingDelete?.id}
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
