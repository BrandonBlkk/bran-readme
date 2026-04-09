import { useEffect, useMemo, useState } from 'react'
import { hasSupabaseConfig } from '../lib/supabaseClient'
import { getCurrentUser, onAuthStateChange } from '../services/authService'
import { fetchFavoriteTemplateIds, toggleFavoriteTemplate } from '../services/templateFavoriteService'
import { fetchSharedTemplates, fetchUserTemplates, getBuiltinTemplates } from '../services/templateService'

const createFavoriteSet = (values = []) => new Set(values.map((value) => String(value)))
const prependUniqueTemplate = (templates, template) => [
  template,
  ...templates.filter((item) => item.id !== template.id),
]
const replaceTemplateInList = (templates, template) => {
  const hasTemplate = templates.some((item) => item.id === template.id)
  if (!hasTemplate) return templates
  return templates.map((item) => (item.id === template.id ? template : item))
}
let sharedTemplatesCache = null
let sharedTemplatesPromise = null

const fetchSharedTemplatesOnce = async () => {
  if (!hasSupabaseConfig) return []

  if (sharedTemplatesCache !== null) {
    return sharedTemplatesCache
  }

  if (!sharedTemplatesPromise) {
    sharedTemplatesPromise = fetchSharedTemplates()
      .then((templates) => {
        sharedTemplatesCache = templates
        return templates
      })
      .finally(() => {
        sharedTemplatesPromise = null
      })
  }

  return sharedTemplatesPromise
}

const updateSharedTemplatesCache = (updater, fallback = []) => {
  const nextTemplates = updater(sharedTemplatesCache ?? fallback)
  sharedTemplatesCache = nextTemplates
  return nextTemplates
}

export const useTemplateLibrary = () => {
  const [user, setUser] = useState(null)
  const [communityTemplates, setCommunityTemplates] = useState([])
  const [ownedTemplates, setOwnedTemplates] = useState([])
  const [favoriteIds, setFavoriteIds] = useState(() => new Set())
  const [isLoading, setIsLoading] = useState(hasSupabaseConfig)
  const [loadError, setLoadError] = useState('')

  const builtinTemplates = useMemo(() => getBuiltinTemplates(), [])

  const templates = useMemo(
    () => [...communityTemplates, ...builtinTemplates],
    [communityTemplates, builtinTemplates],
  )

  const favoriteTemplates = useMemo(
    () => templates.filter((template) => favoriteIds.has(template.id)),
    [templates, favoriteIds],
  )

  useEffect(() => {
    if (!hasSupabaseConfig) {
      setIsLoading(false)
      return undefined
    }

    let isMounted = true
    let latestRequest = 0

    const syncLibrary = async (nextUser = null) => {
      const requestId = latestRequest + 1
      latestRequest = requestId

      try {
        setIsLoading(true)
        setLoadError('')

        const [remoteTemplates, nextFavoriteIds, nextOwnedTemplates] = await Promise.all([
          fetchSharedTemplatesOnce(),
          nextUser ? fetchFavoriteTemplateIds(nextUser.id) : Promise.resolve([]),
          nextUser ? fetchUserTemplates(nextUser.id) : Promise.resolve([]),
        ])

        if (!isMounted || requestId !== latestRequest) return

        setCommunityTemplates(remoteTemplates)
        setFavoriteIds(createFavoriteSet(nextFavoriteIds))
        setOwnedTemplates(nextOwnedTemplates)
      } catch (error) {
        if (!isMounted || requestId !== latestRequest) return

        setCommunityTemplates([])
        setOwnedTemplates([])
        setFavoriteIds(createFavoriteSet())
        setLoadError(error.message || 'Unable to load templates.')
      } finally {
        if (isMounted && requestId === latestRequest) {
          setIsLoading(false)
        }
      }
    }

    const initialize = async () => {
      const currentUser = await getCurrentUser().catch(() => null)
      if (!isMounted) return

      setUser(currentUser)
      await syncLibrary(currentUser)
    }

    void initialize()

    const { data: { subscription } } = onAuthStateChange((nextUser) => {
      if (!isMounted) return
      setUser(nextUser)
      void syncLibrary(nextUser)
    })

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [])

  const addCreatedTemplate = (template) => {
    setOwnedTemplates((prev) => prependUniqueTemplate(prev, template))

    if (template.isPublic) {
      setCommunityTemplates((prev) => updateSharedTemplatesCache(
        (current) => prependUniqueTemplate(current, template),
        prev,
      ))
    }
  }

  const updateManagedTemplate = (template) => {
    setOwnedTemplates((prev) => replaceTemplateInList(prev, template))
    setCommunityTemplates((prev) => updateSharedTemplatesCache(
      (current) => (
        template.isPublic
          ? (
              current.some((item) => item.id === template.id)
                ? replaceTemplateInList(current, template)
                : prependUniqueTemplate(current, template)
            )
          : current.filter((item) => item.id !== template.id)
      ),
      prev,
    ))
  }

  const removeManagedTemplate = (templateId) => {
    const safeTemplateId = String(templateId)

    setOwnedTemplates((prev) => prev.filter((item) => item.id !== safeTemplateId))
    setCommunityTemplates((prev) => updateSharedTemplatesCache(
      (current) => current.filter((item) => item.id !== safeTemplateId),
      prev,
    ))
    setFavoriteIds((prev) => {
      const next = new Set(prev)
      next.delete(safeTemplateId)
      return next
    })
  }

  const toggleFavorite = async (templateId) => {
    if (!user) {
      throw new Error('You must be signed in to favorite templates.')
    }

    const isNowFavorited = await toggleFavoriteTemplate(user.id, templateId)

    setFavoriteIds((prev) => {
      const next = new Set(prev)
      if (isNowFavorited) {
        next.add(String(templateId))
      } else {
        next.delete(String(templateId))
      }
      return next
    })

    return isNowFavorited
  }

  return {
    user,
    templates,
    favoriteIds,
    favoriteTemplates,
    favoriteCount: favoriteTemplates.length,
    ownedTemplates,
    ownedCount: ownedTemplates.length,
    isLoading,
    loadError,
    addCreatedTemplate,
    updateManagedTemplate,
    removeManagedTemplate,
    toggleFavorite,
  }
}

export default useTemplateLibrary
