'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { User } from '@supabase/supabase-js'
import { getDashboardRoute } from '@/lib/auth-redirects'
import { useRouter } from 'next/navigation'

interface AuthContextType {
  user: User | null
  supabase: any
  signIn: (email: string, password?: string) => Promise<void>
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
    app_metadata: {},
    identities: [],
    factors: [],
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
    app_metadata: {},
    identities: [],
    factors: [],
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
    app_metadata: {},
    identities: [],
    factors: [],
  },
]

export function AuthProviderSimpleFixed({
  children,
}: {
  children: React.ReactNode
}) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [useFallback, setUseFallback] = useState(false)
  const supabase = createClientComponentClient()
  const router = useRouter()

  useEffect(() => {
    // Verificar se há usuário salvo no localStorage (fallback)
    const savedUser = localStorage.getItem('fallback_user')
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser)
        setUser(parsedUser)
        setUseFallback(true)
        setLoading(false)
        return
      } catch (e) {
        localStorage.removeItem('fallback_user')
      }
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

        // Não redirecionar aqui - deixar o useEffect da página gerenciar
        console.log('AuthProvider: onAuthStateChange - user signed in')
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
        setLoading(false)

        // Redirecionar imediatamente após login bem-sucedido
        const redirectParam = new URLSearchParams(window.location.search).get(
          'redirect'
        )
        const dashboardRoute = redirectParam || getDashboardRoute(data.user)
        console.log(
          'AuthProvider: Supabase login successful, redirecting to:',
          dashboardRoute
        )

        // Redirecionar imediatamente
        setTimeout(() => {
          window.location.href = dashboardRoute
        }, 100)
        return
      }
    } catch (err: any) {
      console.warn('Erro no login Supabase:', err.message)

      // Fallback: usar usuários de teste
      const testUser = testUsers.find(
        u => u.email === email && u.password === password
      )
      if (testUser) {
        const mockUser = testUser as User

        setUser(mockUser)
        setUseFallback(true)
        setLoading(false)
        localStorage.setItem('fallback_user', JSON.stringify(mockUser))

        // Redirecionar imediatamente após login de fallback bem-sucedido
        const redirectParam = new URLSearchParams(window.location.search).get(
          'redirect'
        )
        const dashboardRoute = redirectParam || getDashboardRoute(mockUser)
        console.log(
          'AuthProvider: Fallback login successful, redirecting to:',
          dashboardRoute
        )

        // Redirecionar imediatamente
        setTimeout(() => {
          window.location.href = dashboardRoute
        }, 100)
        return
      }

      throw new Error('Credenciais inválidas')
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
