'use client'

import { useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'

export default function TestLoginPage() {
  const [email, setEmail] = useState('gestor.join.tech@jointecnologia.com.br')
  const [password, setPassword] = useState('gestor123')
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<any>(null)
  
  const supabase = createClientComponentClient()

  const handleLogin = async () => {
    setLoading(true)
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        console.error('Erro no login:', error)
        toast.error(`Erro: ${error.message}`)
        return
      }

      console.log('Login bem-sucedido:', data)
      setUser(data.user)
      toast.success('Login realizado com sucesso!')
      
      // Redirecionar após 2 segundos
      setTimeout(() => {
        window.location.href = '/choose-environment'
      }, 2000)
      
    } catch (error) {
      console.error('Erro:', error)
      toast.error('Erro interno')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    toast.success('Logout realizado')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Teste de Login Simples</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Senha</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Senha"
            />
          </div>

          <Button 
            onClick={handleLogin} 
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Fazendo login...' : 'Fazer Login'}
          </Button>

          {user && (
            <div className="mt-4 p-4 bg-green-50 rounded">
              <h3 className="font-medium text-green-800">Usuário Logado:</h3>
              <p className="text-sm text-green-600">{user.email}</p>
              <p className="text-sm text-green-600">ID: {user.id}</p>
              <Button 
                onClick={handleLogout}
                variant="outline"
                size="sm"
                className="mt-2"
              >
                Logout
              </Button>
            </div>
          )}

          <div className="mt-4 text-sm text-gray-600">
            <p><strong>Credenciais de teste:</strong></p>
            <p>Email: gestor.join.tech@jointecnologia.com.br</p>
            <p>Senha: gestor123</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
