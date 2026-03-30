import { supabase } from '../lib/supabaseClient'

// If user is logged in, their user_id is associated with the feedback.
export const submitFeedback = async ({ rating, comment, pageUrl = window.location.pathname }) => {
  const { data: { user } } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from('feedback')
    .insert([
      {
        user_id: user?.id ?? null,
        rating: Number(rating),
        comment: String(comment ?? '').trim(),
        page_url: pageUrl,
      },
    ])
    .select()
    .single()

  if (error) {
    console.error('Feedback Error:', error)
    throw new Error(error.message || 'Unable to submit feedback.')
  }

  return data
}
