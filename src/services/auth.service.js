import { supabase } from './supabase'
import { cacheService } from './cache.service'

export async function signIn(email, password) {
  try {
    const res = await supabase.auth.signInWithPassword({ email, password })
    if (res.error) throw res.error
    return res.data
  } catch (error) {
    console.error('signIn error', error)
    throw new Error(error.message || 'Failed to sign in')
  }
}

export async function signOut() {
  try {
    await supabase.auth.signOut()
    // clear cached user-sensitive data
    await cacheService.clearAll()
  } catch (error) {
    console.error('signOut error', error)
    throw new Error('Failed to sign out')
  }
}

export function getCurrentUser() {
  return supabase.auth.getUser().then((r) => r.data.user || null)
}

export function getSession() {
  return supabase.auth.getSession()
}

export function onAuthStateChange(callback) {
  const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
    callback(event, session)
  })
  return () => sub.subscription.unsubscribe()
}
