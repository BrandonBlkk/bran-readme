import { hasSupabaseConfig, supabase } from '../lib/supabaseClient'

const FAVORITES_TABLE = 'favorites'

export const fetchFavoriteTemplateIds = async (userId) => {
  if (!hasSupabaseConfig || !supabase || !userId) return []

  const { data, error } = await supabase
    .from(FAVORITES_TABLE)
    .select('template_id')
    .eq('user_id', userId)

  if (error) {
    throw new Error(error.message || 'Unable to load favorite templates.')
  }

  return (data ?? []).map((favorite) => String(favorite.template_id))
}

export const toggleFavoriteTemplate = async (userId, templateId) => {
  if (!hasSupabaseConfig || !supabase) {
    throw new Error('Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.')
  }

  if (!userId) {
    throw new Error('You must be signed in to favorite templates.')
  }

  const safeTemplateId = String(templateId ?? '').trim()
  if (!safeTemplateId) {
    throw new Error('Template id is required.')
  }

  const { data: existingFavorite, error: lookupError } = await supabase
    .from(FAVORITES_TABLE)
    .select('id')
    .eq('user_id', userId)
    .eq('template_id', safeTemplateId)
    .maybeSingle()

  if (lookupError) {
    throw new Error(lookupError.message || 'Unable to update favorite template.')
  }

  if (existingFavorite) {
    const { error: deleteError } = await supabase
      .from(FAVORITES_TABLE)
      .delete()
      .eq('id', existingFavorite.id)

    if (deleteError) {
      throw new Error(deleteError.message || 'Unable to remove favorite template.')
    }

    return false
  }

  const { error: insertError } = await supabase
    .from(FAVORITES_TABLE)
    .insert({
      user_id: userId,
      template_id: safeTemplateId,
    })

  if (insertError) {
    throw new Error(insertError.message || 'Unable to save favorite template.')
  }

  return true
}
