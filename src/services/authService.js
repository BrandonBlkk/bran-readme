import { supabase } from '../lib/supabaseClient'

// Sign in using GitHub OAuth
export const signInWithGithub = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
            redirectTo: window.location.origin
        }
    })
    if (error) throw error
    return data
}

// Sign in using Google OAuth
export const signInWithGoogle = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: window.location.origin
        }
    })
    if (error) throw error
    return data
}

// Sign out the current user
export const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
}

// Get the currently authenticated user
export const getCurrentUser = async () => {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) return null
    return user
}

// Subscribe to authentication state changes
export const onAuthStateChange = (callback) => {
    return supabase.auth.onAuthStateChange((_event, session) => {
        callback(session?.user ?? null)
    })
}
