import { useEffect, useMemo, useState } from 'react'
import { hasSupabaseConfig } from '../lib/supabaseClient'
import { getCurrentUser, onAuthStateChange } from '../services/authService'
import { fetchFavoriteTemplateIds, toggleFavoriteTemplate } from '../services/templateFavoriteService'
import { fetchSharedTemplates, getBuiltinTemplates } from '../services/templateService'

const createFavoriteSet = (values = []) => new Set(values.map((value) => String(value)))

export const useTemplateLibrary = () => {
  const [user, setUser] = useState(null)
  const [communityTemplates, setCommunityTemplates] = useState([])
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

        const [remoteTemplates, nextFavoriteIds] = await Promise.all([
          fetchSharedTemplates(),
          nextUser ? fetchFavoriteTemplateIds(nextUser.id) : Promise.resolve([]),
        ])

        if (!isMounted || requestId !== latestRequest) return

        setCommunityTemplates(remoteTemplates)
        setFavoriteIds(createFavoriteSet(nextFavoriteIds))
      } catch (error) {
        if (!isMounted || requestId !== latestRequest) return

        setCommunityTemplates([])
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

  const addCommunityTemplate = (template) => {
    setCommunityTemplates((prev) => [template, ...prev])
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
    isLoading,
    loadError,
    addCommunityTemplate,
    toggleFavorite,
  }
}

export default useTemplateLibrary
