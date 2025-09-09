'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { useAuth } from '@/components/auth/auth-provider-simple-fixed'
import { getPostLoginRedirect } from '@/lib/auth-redirects'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { toast } from 'sonner'
import { Loader2, AlertTriangle, CheckCircle } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const searchParams = useSearchParams()
  const { user, signIn, loading: authLoading } = useAuth()

  // O redirecionamento é gerenciado pelo AuthProvider

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      await signIn(email, password)
      toast.success('Login realizado com sucesso!', {
        description: 'Redirecionando para seu dashboard...',
        duration: 2000,
      })

      // O redirecionamento será feito pelo useEffect quando o user for atualizado
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'Erro ao fazer login'
      setError(errorMessage)
      toast.error('Erro ao fazer login', {
        description: 'Verifique suas credenciais e tente novamente.',
        duration: 4000,
      })
    } finally {
      setLoading(false)
    }
  }

  const handleTestLogin = async (testEmail: string, testPassword: string) => {
    setEmail(testEmail)
    setPassword(testPassword)
    setLoading(true)
    setError('')

    try {
      await signIn(testEmail, testPassword)
      toast.success('Login de teste realizado com sucesso!', {
        description: `Bem-vindo, ${testEmail.split('@')[0]}!`,
        duration: 2000,
      })

      // O redirecionamento será feito pelo useEffect quando o user for atualizado
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'Erro ao fazer login de teste'
      setError(errorMessage)
      toast.error('Erro ao fazer login de teste', {
        description: 'Tente novamente ou use outro usuário de teste.',
        duration: 4000,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      {/* Loading overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 shadow-xl flex items-center space-x-3">
            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
            <span className="text-gray-700 font-medium">Entrando...</span>
          </div>
        </div>
      )}

      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-xl">Y</span>
          </div>
          <h1 className="mt-4 text-3xl font-bold text-gray-900">Yoobe</h1>
          <p className="mt-2 text-sm text-gray-600">
            Sistema de Gestão Empresarial
          </p>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Entrar</CardTitle>
            <CardDescription className="text-center">
              Digite suas credenciais para acessar o sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="text-sm font-medium text-gray-700"
                >
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  required
                  placeholder="seu@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="password"
                  className="text-sm font-medium text-gray-700"
                >
                  Senha
                </label>
                <Input
                  id="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full"
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 transition-all duration-200 transform hover:scale-[1.02]"
                disabled={loading}
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {loading ? 'Entrando...' : 'Entrar'}
              </Button>
            </form>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="text-sm font-medium text-blue-800 mb-3 flex items-center">
                <CheckCircle className="h-4 w-4 mr-2" />
                Usuários de Teste (Supabase):
              </h4>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start text-xs border-blue-200 hover:bg-blue-100 transition-all duration-200 transform hover:scale-[1.02] hover:shadow-sm"
                  onClick={() => handleTestLogin('admin@yoobe.com', 'admin123')}
                  disabled={loading}
                >
                  <span className="text-blue-700">
                    👑 Admin: admin@yoobe.com / admin123
                  </span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start text-xs border-blue-200 hover:bg-blue-100 transition-all duration-200 transform hover:scale-[1.02] hover:shadow-sm"
                  onClick={() =>
                    handleTestLogin('gestor@yoobe.com', 'gestor123')
                  }
                  disabled={loading}
                >
                  <span className="text-blue-700">
                    🏢 Gestor: gestor@yoobe.com / gestor123
                  </span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start text-xs border-blue-200 hover:bg-blue-100 transition-all duration-200 transform hover:scale-[1.02] hover:shadow-sm"
                  onClick={() =>
                    handleTestLogin('funcionario@yoobe.com', 'funcionario123')
                  }
                  disabled={loading}
                >
                  <span className="text-blue-700">
                    👤 Funcionário: funcionario@yoobe.com / funcionario123
                  </span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center text-xs text-gray-500">
          <p>Versão 3.3.0 - Sistema Real com Supabase</p>
        </div>
      </div>
    </div>
  )
}
