'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { User, AuthError } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import { getDashboardRoute } from '@/lib/auth-redirects'

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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession()

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

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      try {
        setUser(session?.user ?? null)
        setLoading(false)
        setError(null)

        // Apenas redirecionar se não estiver já na página correta
        if (
          event === 'SIGNED_OUT' &&
          window.location.pathname !== '/auth/login'
        ) {
          window.location.href = '/auth/login'
        } else if (event === 'SIGNED_IN' && session?.user) {
          // Redirecionar automaticamente para o dashboard correto baseado no role
          const dashboardRoute = getDashboardRoute(session.user)
          if (
            window.location.pathname === '/auth/login' ||
            window.location.pathname === '/auth/callback'
          ) {
            window.location.href = dashboardRoute
          }
        }
      } catch (err) {
        setError('Authentication error')
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [router, supabase.auth])

  const signIn = async (email: string, password?: string) => {
    setError(null)

    try {
      if (password) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (error) {
          throw error
        }

        // Redirecionamento direto após login bem-sucedido
        if (data.user) {
          const dashboardRoute = getDashboardRoute(data.user)
          window.location.href = dashboardRoute
        }
      } else {
        const { data, error } = await supabase.auth.signInWithOtp({
          email,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        })

        if (error) {
          console.error('AuthProvider: OTP sign in error:', error)
          throw error
        }

        console.log('AuthProvider: OTP sign in initiated')
      }
    } catch (err) {
      console.error('AuthProvider: Sign in error:', err)
      const authError = err as AuthError
      setError(authError.message || 'Sign in failed')
      throw err
    }
  }

  const signInWithGoogle = async () => {
    console.log('AuthProvider: Attempting Google sign in')
    setError(null)

    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      })

      if (error) {
        console.error('AuthProvider: Google sign in error:', error)
        throw error
      }

      console.log('AuthProvider: Google sign in initiated')
    } catch (err) {
      console.error('AuthProvider: Google sign in error:', err)
      const authError = err as AuthError
      setError(authError.message || 'Google sign in failed')
      throw err
    }
  }

  const signInWithOTP = async (email: string) => {
    console.log('AuthProvider: Attempting OTP sign in:', email)
    setError(null)

    try {
      const { data, error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        console.error('AuthProvider: OTP sign in error:', error)
        throw error
      }

      console.log('AuthProvider: OTP sign in initiated')
    } catch (err) {
      console.error('AuthProvider: OTP sign in error:', err)
      const authError = err as AuthError
      setError(authError.message || 'OTP sign in failed')
      throw err
    }
  }

  const signInWithMagicLink = async (email: string) => {
    console.log('AuthProvider: Attempting magic link sign in:', email)
    setError(null)

    try {
      const { data, error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        console.error('AuthProvider: Magic link sign in error:', error)
        throw error
      }

      console.log('AuthProvider: Magic link sign in initiated')
    } catch (err) {
      console.error('AuthProvider: Magic link sign in error:', err)
      const authError = err as AuthError
      setError(authError.message || 'Magic link sign in failed')
      throw err
    }
  }

  const signUp = async (email: string, password: string, metadata?: any) => {
    console.log('AuthProvider: Attempting sign up:', email)
    setError(null)

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        console.error('AuthProvider: Sign up error:', error)
        throw error
      }

      console.log('AuthProvider: Sign up successful')
    } catch (err) {
      console.error('AuthProvider: Sign up error:', err)
      const authError = err as AuthError
      setError(authError.message || 'Sign up failed')
      throw err
    }
  }

  const signOut = async () => {
    console.log('AuthProvider: Attempting sign out')
    setError(null)

    try {
      const { error } = await supabase.auth.signOut()

      if (error) {
        console.error('AuthProvider: Sign out error:', error)
        throw error
      }

      console.log('AuthProvider: Sign out successful')
      setUser(null)
      router.push('/auth/login')
    } catch (err) {
      console.error('AuthProvider: Sign out error:', err)
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
    error,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
