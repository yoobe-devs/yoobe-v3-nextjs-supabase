'use client'

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

// Usuários de teste para fallback
const testUsers = [
  {
    id: 'test-admin-1',
    email: 'admin@yoobe.com',
    password: 'admin123',
    user_metadata: { role: 'admin', name: 'Administrador' },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    aud: 'authenticated',
    role: 'authenticated',
  },
  {
    id: 'test-gestor-1',
    email: 'gestor@yoobe.com',
    password: 'gestor123',
    user_metadata: { role: 'manager', name: 'Gestor' },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    aud: 'authenticated',
    role: 'authenticated',
  },
  {
    id: 'test-funcionario-1',
    email: 'funcionario@yoobe.com',
    password: 'funcionario123',
    user_metadata: { role: 'user', name: 'Funcionário' },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    aud: 'authenticated',
    role: 'authenticated',
  },
]

export function AuthProviderHybrid({
  children,
}: {
  children: React.ReactNode
}) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [useFallback, setUseFallback] = useState(false)
  const supabase = createClientComponentClient()

  useEffect(() => {
    // Verificar se há usuário salvo no localStorage (fallback)
    const savedUser = localStorage.getItem('fallback_user')
    if (savedUser) {
      setUser(JSON.parse(savedUser))
      setUseFallback(true)
      setLoading(false)
      return
    }

    // Tentar obter sessão do Supabase
    const getSession = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession()

        if (error) {
          console.warn('Erro ao obter sessão do Supabase:', error.message)
          setUseFallback(true)
        } else if (session?.user) {
          setUser(session.user)
          setUseFallback(false)
        }
      } catch (err) {
        console.warn('Erro ao conectar com Supabase:', err)
        setUseFallback(true)
      } finally {
        setLoading(false)
      }
    }

    getSession()

    // Escutar mudanças de autenticação
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setUser(session.user)
        setUseFallback(false)
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
        setUseFallback(false)
        localStorage.removeItem('fallback_user')
      }
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  const signIn = async (email: string, password?: string) => {
    setError(null)

    // Primeiro, tentar com Supabase
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: password || '',
      })

      if (error) {
        throw error
      }

      if (data.user) {
        setUser(data.user)
        setUseFallback(false)
        return
      }
    } catch (err: any) {
      console.warn('Erro no login Supabase:', err.message)

      // Fallback: usar usuários de teste
      const testUser = testUsers.find(
        u => u.email === email && u.password === password
      )
      if (testUser) {
        const mockUser = {
          ...testUser,
          app_metadata: {},
          identities: [],
          factors: [],
        } as User

        setUser(mockUser)
        setUseFallback(true)
        localStorage.setItem('fallback_user', JSON.stringify(mockUser))
        return
      }

      throw new Error('Credenciais inválidas')
    }
  }

  const signInWithGoogle = async () => {
    setError(null)
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      if (error) throw error
    } catch (err: any) {
      setError(err.message)
    }
  }

  const signInWithOTP = async (email: string) => {
    setError(null)
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      if (error) throw error
    } catch (err: any) {
      setError(err.message)
    }
  }

  const signInWithMagicLink = async (email: string) => {
    setError(null)
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      if (error) throw error
    } catch (err: any) {
      setError(err.message)
    }
  }

  const signUp = async (email: string, password: string, metadata?: any) => {
    setError(null)
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
        },
      })
      if (error) throw error
    } catch (err: any) {
      setError(err.message)
    }
  }

  const signOut = async () => {
    setError(null)
    try {
      if (useFallback) {
        setUser(null)
        setUseFallback(false)
        localStorage.removeItem('fallback_user')
      } else {
        const { error } = await supabase.auth.signOut()
        if (error) throw error
      }
    } catch (err: any) {
      setError(err.message)
    }
  }

  return (
    <AuthContext.Provider
      value={{
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
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}







