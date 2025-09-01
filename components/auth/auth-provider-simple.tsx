"use client"

import { createContext, useContext, useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { User, AuthError } from '@supabase/supabase-js'

interface AuthContextType {
  user: User | null
  supabase: any
  signIn: (email: string, password?: string) => Promise<void>
  signInWithGoogle: () => Promise<void>
  signInWithOTP: (email: string) => Promise<void>
  signInWithMagicLink: (email: string) => Promise<void>
  signUp: (email: string, password: string, metadata?: any) => Promise<void>
  signOut: () => Promise<void>
  loading: boolean
  error: string | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProviderSimple({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClientComponentClient()

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          setError(error.message)
        } else {
          setUser(session?.user ?? null)
        }
      } catch (err) {
        setError('Failed to get session')
      } finally {
        setLoading(false)
      }
    }

    getSession()

    // Listen for auth changes - SEM REDIRECIONAMENTOS AUTOMÁTICOS
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        try {
          setUser(session?.user ?? null)
          setLoading(false)
          setError(null)
          
          // Não fazer redirecionamentos automáticos aqui
          // Deixar o usuário navegar manualmente
        } catch (err) {
          setError('Authentication error')
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase.auth])

  const signIn = async (email: string, password?: string) => {
    setError(null)
    
    try {
      if (password) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        })
        
        if (error) {
          throw error
        }
        
        // Não fazer redirecionamento automático
        // Deixar o usuário navegar manualmente
      } else {
        const { data, error } = await supabase.auth.signInWithOtp({
          email,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`
          }
        })
        
        if (error) {
          throw error
        }
      }
    } catch (err) {
      const authError = err as AuthError
      console.error('Auth error:', authError)
      setError(authError.message || 'Sign in failed')
      throw authError
    }
  }

  const signInWithGoogle = async () => {
    setError(null)
    
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      })
      
      if (error) {
        throw error
      }
    } catch (err) {
      const authError = err as AuthError
      setError(authError.message || 'Google sign in failed')
      throw err
    }
  }

  const signInWithOTP = async (email: string) => {
    setError(null)
    
    try {
      const { data, error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      })
      
      if (error) {
        throw error
      }
    } catch (err) {
      const authError = err as AuthError
      setError(authError.message || 'OTP sign in failed')
      throw err
    }
  }

  const signInWithMagicLink = async (email: string) => {
    setError(null)
    
    try {
      const { data, error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      })
      
      if (error) {
        throw error
      }
    } catch (err) {
      const authError = err as AuthError
      setError(authError.message || 'Magic link sign in failed')
      throw err
    }
  }

  const signUp = async (email: string, password: string, metadata?: any) => {
    setError(null)
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata
        }
      })
      
      if (error) {
        throw error
      }
    } catch (err) {
      const authError = err as AuthError
      setError(authError.message || 'Sign up failed')
      throw err
    }
  }

  const signOut = async () => {
    setError(null)
    
    try {
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        throw error
      }
      
      // Redirecionamento manual após logout
      window.location.href = '/auth/login'
    } catch (err) {
      const authError = err as AuthError
      setError(authError.message || 'Sign out failed')
      throw err
    }
  }

  const value = {
    user,
    supabase,
    signIn,
    signInWithGoogle,
    signInWithOTP,
    signInWithMagicLink,
    signUp,
    signOut,
    loading,
    error
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
