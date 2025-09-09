'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { toast } from 'sonner'
import {
  User,
  Shield,
  Building,
  Store,
  Crown,
  ChevronDown,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
} from 'lucide-react'

interface UserType {
  email: string
  password: string
  role: string
  name: string
  description: string
  icon: React.ReactNode
  redirectPath: string
  color: string
  priority: number
}

// Roles permitidos: 'admin', 'user', 'manager'
const userTypes: UserType[] = [
  {
    email: 'superadmin@test.com',
    password: 'admin123',
    role: 'admin', // Mapeado para admin (superadmin)
    name: 'Super Admin',
    description: 'Acesso total ao sistema - Pode gerenciar tudo',
    icon: <Crown className="h-4 w-4" />,
    redirectPath: '/admin/empresas',
    color: 'bg-purple-100 text-purple-800',
    priority: 1,
  },
  {
    email: 'test@yoobe.com',
    password: 'test123',
    role: 'admin', // Mapeado para admin (admin_global)
    name: 'Admin Global',
    description: 'Administração global - Gerencia todas as empresas',
    icon: <Shield className="h-4 w-4" />,
    redirectPath: '/admin/empresas',
    color: 'bg-blue-100 text-blue-800',
    priority: 2,
  },
  {
    email: 'admin@yoobe.com',
    password: 'admin123',
    role: 'admin',
    name: 'Admin da Empresa Yoobe',
    description:
      'Administração da empresa Yoobe - Gerencia a empresa específica',
    icon: <Building className="h-4 w-4" />,
    redirectPath: '/admin/empresas/550e8400-e29b-41d4-a716-446655440001',
    color: 'bg-green-100 text-green-800',
    priority: 3,
  },
  {
    email: 'gestor@yoobe.com',
    password: 'gestor123',
    role: 'manager', // Mapeado para manager (gestor)
    name: 'Gestor da Loja Yoobe',
    description: 'Gestão da Loja Yoobe - Produtos, orçamentos e vendas',
    icon: <Store className="h-4 w-4" />,
    redirectPath: '/gestor/dashboard',
    color: 'bg-orange-100 text-orange-800',
    priority: 4,
  },
  {
    email: 'funcionario@yoobe.com',
    password: 'funcionario123',
    role: 'user', // Mapeado para user (funcionario)
    name: 'Funcionário da Loja Yoobe',
    description: 'Operações básicas na Loja Yoobe - Atendimento e vendas',
    icon: <User className="h-4 w-4" />,
    redirectPath: '/funcionario/vendas',
    color: 'bg-teal-100 text-teal-800',
    priority: 5,
  },
]

interface HealthStatus {
  overall: 'healthy' | 'warning' | 'critical' | 'unknown'
  users: Record<string, string>
  issues: string[]
  lastCheck: string | null
}

export default function SmartLoginPage() {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [loading, setLoading] = useState(false)
  const [repairing, setRepairing] = useState(false)
  const [selectedUserType, setSelectedUserType] = useState<UserType>(
    userTypes[0]
  )
  const [credentials, setCredentials] = useState({
    email: userTypes[0].email,
    password: userTypes[0].password,
  })
  const [healthStatus, setHealthStatus] = useState<HealthStatus>({
    overall: 'unknown',
    users: {},
    issues: [],
    lastCheck: null,
  })

  // Verificar saúde do sistema ao carregar
  useEffect(() => {
    checkSystemHealth()
  }, [])

  const checkSystemHealth = async () => {
    try {
      const response = await fetch('/api/auth/health-check')
      if (response.ok) {
        const status = await response.json()
        setHealthStatus(status)
      }
    } catch (error) {
      console.error('Erro ao verificar saúde do sistema:', error)
    }
  }

  const repairSystem = async () => {
    setRepairing(true)
    try {
      const response = await fetch('/api/auth/repair', { method: 'POST' })
      if (response.ok) {
        toast.success('Sistema reparado com sucesso!')
        await checkSystemHealth()
      } else {
        toast.error('Falha ao reparar sistema')
      }
    } catch (error) {
      toast.error('Erro ao reparar sistema')
    } finally {
      setRepairing(false)
    }
  }

  const handleUserTypeSelect = (userType: UserType) => {
    setSelectedUserType(userType)
    setCredentials({
      email: userType.email,
      password: userType.password,
    })
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      })

      if (error) {
        // Se login falhou, verificar se é problema do sistema
        if (error.message.includes('Invalid login credentials')) {
          toast.error('Credenciais inválidas. Verifique email e senha.')
        } else {
          toast.error('Erro no sistema de autenticação. Tentando reparar...')
          await repairSystem()
          return
        }
      } else {
        toast.success(`Login realizado como ${selectedUserType.name}!`)
        console.log('Usuário logado:', data.user?.email)
        console.log('Role:', data.user?.user_metadata?.role)
        console.log('Company ID:', data.user?.user_metadata?.company_id)

        // Redirecionar baseado no role e company_id do usuário
        const userRole = data.user?.user_metadata?.role
        const companyId = data.user?.user_metadata?.company_id

        let redirectPath = '/'

        if (userRole === 'superadmin') {
          redirectPath = '/admin/empresas'
        } else if (userRole === 'admin_global') {
          redirectPath = '/admin/empresas'
        } else if (userRole === 'admin' && companyId) {
          redirectPath = `/admin/empresas/${companyId}`
        } else if (userRole === 'gestor' && companyId) {
          redirectPath = `/gestor/dashboard`
        } else if (userRole === 'funcionario' && companyId) {
          redirectPath = `/funcionario/vendas`
        } else {
          // Fallback para o redirecionamento padrão
          redirectPath = selectedUserType.redirectPath
        }

        console.log('Redirecionando para:', redirectPath)
        router.push(redirectPath)
      }
    } catch (error) {
      toast.error('Erro inesperado: ' + (error as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const getStatusEmoji = (status: string) => {
    switch (status) {
      case 'healthy':
        return '✅'
      case 'warning':
        return '⚠️'
      case 'critical':
        return '❌'
      default:
        return '❓'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'text-green-600'
      case 'warning':
        return 'text-yellow-600'
      case 'critical':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-5xl mx-auto mb-4 flex items-center justify-between">
        <div className="text-sm text-gray-700">Yoobe Login Inteligente</div>
        <div className="flex items-center gap-2">
          <a href="/landing" className="text-blue-700 text-sm underline">
            Ver Landing
          </a>
          <a href="/docs" className="text-blue-700 text-sm underline">
            Docs
          </a>
        </div>
      </div>

      <div className="w-full max-w-5xl mx-auto">
        {/* Status do Sistema */}
        {healthStatus.overall !== 'unknown' && (
          <Alert
            className={`mb-4 ${
              healthStatus.overall === 'healthy'
                ? 'border-green-200 bg-green-50'
                : healthStatus.overall === 'warning'
                  ? 'border-yellow-200 bg-yellow-50'
                  : 'border-red-200 bg-red-50'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {healthStatus.overall === 'healthy' ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : healthStatus.overall === 'warning' ? (
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                )}
                <AlertDescription
                  className={getStatusColor(healthStatus.overall)}
                >
                  <strong>Sistema:</strong>{' '}
                  {getStatusEmoji(healthStatus.overall)}{' '}
                  {healthStatus.overall.toUpperCase()}
                  {healthStatus.lastCheck && (
                    <span className="text-xs ml-2">
                      (Verificado:{' '}
                      {new Date(healthStatus.lastCheck).toLocaleTimeString()})
                    </span>
                  )}
                </AlertDescription>
              </div>
              {healthStatus.overall !== 'healthy' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={repairSystem}
                  disabled={repairing}
                  className="ml-4"
                >
                  {repairing ? (
                    <>
                      <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                      Reparando...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-3 w-3 mr-1" />
                      Reparar Sistema
                    </>
                  )}
                </Button>
              )}
            </div>
            {healthStatus.issues.length > 0 && (
              <div className="mt-2 text-sm">
                <strong>Problemas:</strong>
                <ul className="list-disc list-inside mt-1">
                  {healthStatus.issues.slice(0, 3).map((issue, index) => (
                    <li key={index}>{issue}</li>
                  ))}
                  {healthStatus.issues.length > 3 && (
                    <li>
                      ... e mais {healthStatus.issues.length - 3} problemas
                    </li>
                  )}
                </ul>
              </div>
            )}
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-center">
              Login Yoobe Inteligente
            </CardTitle>
            <CardDescription className="text-center">
              Sistema inteligente com auto-reparo e monitoramento de saúde
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Seleção de Tipo de Usuário */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">
                  Selecione o Tipo de Usuário
                </h3>
                <div className="space-y-2">
                  {userTypes.map(userType => {
                    const userStatus =
                      healthStatus.users[userType.email] || 'unknown'
                    return (
                      <button
                        key={userType.role}
                        onClick={() => handleUserTypeSelect(userType)}
                        className={`w-full p-3 rounded-lg border-2 transition-all ${
                          selectedUserType.role === userType.role
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {userType.icon}
                          <div className="flex-1 text-left">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">
                                {userType.name}
                              </span>
                              <Badge className={userType.color}>
                                {userType.role}
                              </Badge>
                              <span className="text-xs">
                                {getStatusEmoji(userStatus)}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600">
                              {userType.description}
                            </p>
                          </div>
                          <ChevronDown
                            className={`h-4 w-4 transition-transform ${
                              selectedUserType.role === userType.role
                                ? 'rotate-180'
                                : ''
                            }`}
                          />
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Formulário de Login */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Credenciais</h3>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Email
                    </label>
                    <Input
                      id="email"
                      type="email"
                      value={credentials.email}
                      onChange={e =>
                        setCredentials(prev => ({
                          ...prev,
                          email: e.target.value,
                        }))
                      }
                      required
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="password"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Senha
                    </label>
                    <Input
                      id="password"
                      type="password"
                      value={credentials.password}
                      onChange={e =>
                        setCredentials(prev => ({
                          ...prev,
                          password: e.target.value,
                        }))
                      }
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading
                      ? 'Entrando...'
                      : `Entrar como ${selectedUserType.name}`}
                  </Button>
                </form>

                {/* Informações do Usuário Selecionado */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium mb-2">Usuário Selecionado:</h4>
                  <div className="flex items-center gap-2 mb-2">
                    {selectedUserType.icon}
                    <span className="font-medium">{selectedUserType.name}</span>
                    <Badge className={selectedUserType.color}>
                      {selectedUserType.role}
                    </Badge>
                    <span className="text-xs">
                      {getStatusEmoji(
                        healthStatus.users[selectedUserType.email] || 'unknown'
                      )}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    {selectedUserType.description}
                  </p>
                  <p className="text-xs text-gray-500">
                    <strong>Email:</strong> {selectedUserType.email}
                    <br />
                    <strong>Senha:</strong> {selectedUserType.password}
                    <br />
                    <strong>Redirecionamento:</strong>{' '}
                    {selectedUserType.redirectPath}
                  </p>
                </div>

                {/* Status Detalhado */}
                {healthStatus.users[selectedUserType.email] && (
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium mb-2 text-blue-800">
                      Status do Usuário:
                    </h4>
                    <p className="text-sm text-blue-700">
                      {healthStatus.users[selectedUserType.email] ===
                        'healthy' && '✅ Usuário funcionando perfeitamente'}
                      {healthStatus.users[selectedUserType.email] ===
                        'auth_failed' &&
                        '❌ Falha na autenticação - Credenciais inválidas'}
                      {healthStatus.users[selectedUserType.email] ===
                        'missing' && '❌ Usuário não encontrado no sistema'}
                      {healthStatus.users[selectedUserType.email] ===
                        'data_issues' && '⚠️ Problemas nos dados do usuário'}
                      {healthStatus.users[selectedUserType.email] === 'error' &&
                        '❌ Erro ao verificar usuário'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
