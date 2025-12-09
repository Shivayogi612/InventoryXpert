import React, { createContext, useContext, useEffect, useState } from 'react'
import * as auth from '../services/auth.service'
import { supabase } from '../services/supabase'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const { data } = await supabase.auth.getUser()
        if (!mounted) return
        setUser(data.user || null)
      } catch (err) {
        console.error('Auth init error', err)
      } finally {
        if (mounted) setLoading(false)
      }
    })()

    const sub = supabase.auth.onAuthStateChange((_event, session) => {
      if (session && session.user) setUser(session.user)
      else setUser(null)
    })

    return () => {
      mounted = false
      if (sub && sub.data && sub.data.subscription) sub.data.subscription.unsubscribe()
    }
  }, [])

  const login = async (email, password) => {
    setLoading(true)
    try {
      const res = await auth.signIn(email, password)
      const user = res?.user || null
      setUser(user)
      return user
    } catch (err) {
      throw err
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    setLoading(true)
    try {
      await auth.signOut()
      setUser(null)
    } catch (err) {
      console.error('Logout failed', err)
    } finally {
      setLoading(false)
    }
  }

  const value = {
    user,
    role: user?.user_metadata?.role || null,
    isAuthenticated: !!user,
    login,
    logout,
    loading,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
