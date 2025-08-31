"use client"

import { useState } from 'react'
import { useAuth } from '@/components/auth/auth-provider-simple'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Mail, Lock } from 'lucide-react'
import { toast } from 'sonner'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn, error } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await signIn(email, password)
      toast.success('Login realizado com sucesso!')
      // Redirecionar manualmente após login bem-sucedido
      setTimeout(() => {
        window.location.href = '/choose-environment'
      }, 1000)
    } catch (err) {
      console.error('Erro no login:', err)
      toast.error('Erro no login. Verifique suas credenciais.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Login Yoobe
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Acesse sua conta
          </p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Entrar</CardTitle>
            <CardDescription>
              Use suas credenciais para acessar o sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <div className="mt-1 relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    placeholder="seu@email.com"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Senha
                </label>
                <div className="mt-1 relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    placeholder="Sua senha"
                  />
                </div>
              </div>

              {error && (
                <div className="text-red-600 text-sm">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Entrando...
                  </>
                ) : (
                  'Entrar'
                )}
              </Button>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Credenciais de teste</span>
                </div>
              </div>
              
              <div className="mt-4 space-y-2 text-xs text-gray-600">
                <p><strong>Admin:</strong> admin@yoobe.com / admin123</p>
                <p><strong>Gestor:</strong> gestor.join.tech@jointecnologia.com.br / gestor123</p>
                <p><strong>Funcionário:</strong> maria.santos@jointecnologia.com.br / maria123</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
