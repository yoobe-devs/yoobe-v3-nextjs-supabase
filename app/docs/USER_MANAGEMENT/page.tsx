'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Users, 
  CheckCircle, 
  UserPlus, 
  Mail, 
  Shield,
  ArrowRight,
  ExternalLink,
  BookOpen,
  Code,
  Database,
  Settings,
  BarChart3,
  User,
  Building,
  Package,
  MapPin,
  FileCheck,
  Zap,
  AlertTriangle,
  FileText,
  Invite,
  Team,
  Key,
  Lock
} from 'lucide-react'
import Link from 'next/link'

export default function UserManagementPage() {
  const [activeTab, setActiveTab] = useState('overview')

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Users className="h-8 w-8 text-blue-600" />
            Gestão de Usuários v3.0.0
          </h1>
          <p className="text-gray-600 mt-2">
            Sistema completo de convites, roles e gestão de equipes com controle de acesso avançado
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            Ativo
          </Badge>
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            <Code className="h-3 w-3 mr-1" />
            v3.0.0
          </Badge>
        </div>
      </div>

      {/* Navigation Breadcrumb */}
      <nav className="flex items-center space-x-2 text-sm text-gray-500">
        <Link href="/docs" className="hover:text-blue-600">Documentação</Link>
        <ArrowRight className="h-4 w-4" />
        <span className="text-gray-900 font-medium">Gestão de Usuários</span>
      </nav>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="workflow">Fluxo de Gestão</TabsTrigger>
          <TabsTrigger value="features">Funcionalidades</TabsTrigger>
          <TabsTrigger value="api">API Reference</TabsTrigger>
          <TabsTrigger value="examples">Exemplos</TabsTrigger>
          <TabsTrigger value="troubleshooting">Troubleshooting</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-blue-600" />
                Visão Geral do Sistema
              </CardTitle>
              <CardDescription>
                Sistema completo de gestão de usuários com convites, roles e controle de acesso
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900">Características Principais</h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Sistema de convites por email
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Gestão de roles e permissões
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Organização em equipes
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Auditoria de ações
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Integração com RBAC
                    </li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900">Tecnologias Utilizadas</h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center gap-2">
                      <Code className="h-4 w-4 text-blue-500" />
                      Next.js 14 + TypeScript
                    </li>
                    <li className="flex items-center gap-2">
                      <Database className="h-4 w-4 text-green-500" />
                      Supabase (PostgreSQL)
                    </li>
                    <li className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-purple-500" />
                      RLS (Row Level Security)
                    </li>
                    <li className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-orange-500" />
                      Sistema de emails
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* User Management Flow */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Team className="h-5 w-5 text-blue-600" />
                Fluxo de Gestão de Usuários
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Invite className="h-6 w-6 text-blue-600" />
                  </div>
                  <h4 className="font-medium text-gray-900">Convite</h4>
                  <p className="text-sm text-gray-600">Admin envia convite por email</p>
                  <Badge className="mt-2 bg-blue-100 text-blue-800">Passo 1</Badge>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Mail className="h-6 w-6 text-yellow-600" />
                  </div>
                  <h4 className="font-medium text-gray-900">Aceitação</h4>
                  <p className="text-sm text-gray-600">Usuário aceita e cria conta</p>
                  <Badge className="mt-2 bg-yellow-100 text-yellow-800">Passo 2</Badge>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Key className="h-6 w-6 text-green-600" />
                  </div>
                  <h4 className="font-medium text-gray-900">Configuração</h4>
                  <p className="text-sm text-gray-600">Role e permissões definidos</p>
                  <Badge className="mt-2 bg-green-100 text-green-800">Passo 3</Badge>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Lock className="h-6 w-6 text-purple-600" />
                  </div>
                  <h4 className="font-medium text-gray-900">Ativação</h4>
                  <p className="text-sm text-gray-600">Usuário ativo no sistema</p>
                  <Badge className="mt-2 bg-purple-100 text-purple-800">Passo 4</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Workflow Tab */}
        <TabsContent value="workflow" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-blue-600" />
                Fluxo de Gestão
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* User Lifecycle */}
                <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-gray-600 font-bold">1</span>
                    </div>
                    <h4 className="font-medium text-sm">Pendente</h4>
                    <p className="text-xs text-gray-500">Convite enviado</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-blue-600 font-bold">2</span>
                    </div>
                    <h4 className="font-medium text-sm">Aceito</h4>
                    <p className="text-xs text-gray-500">Convite aceito</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-yellow-600 font-bold">3</span>
                    </div>
                    <h4 className="font-medium text-sm">Configurado</h4>
                    <p className="text-xs text-gray-500">Role definido</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-green-600 font-bold">4</span>
                    </div>
                    <h4 className="font-medium text-sm">Ativo</h4>
                    <p className="text-xs text-gray-500">Usuário ativo</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-orange-600 font-bold">5</span>
                    </div>
                    <h4 className="font-medium text-sm">Suspenso</h4>
                    <p className="text-xs text-gray-500">Acesso limitado</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-red-600 font-bold">6</span>
                    </div>
                    <h4 className="font-medium text-sm">Inativo</h4>
                    <p className="text-xs text-gray-500">Conta desativada</p>
                  </div>
                </div>

                <Separator />

                {/* Team Structure */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Estrutura de Equipes</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-red-100 text-red-800">Super Admin</Badge>
                        <span className="text-sm text-gray-600">Acesso total ao sistema</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-orange-100 text-orange-800">Admin</Badge>
                        <span className="text-sm text-gray-600">Gestão de usuários e configurações</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Gestor</Badge>
                        <span className="text-sm text-gray-600">Gestão de equipe e projetos</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-green-100 text-green-800">Usuário</Badge>
                        <span className="text-sm text-gray-600">Acesso básico às funcionalidades</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-blue-100 text-blue-800">Convidado</Badge>
                        <span className="text-sm text-gray-600">Acesso limitado temporário</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-purple-100 text-purple-800">Analista</Badge>
                        <span className="text-sm text-gray-600">Acesso a relatórios e dados</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Features Tab */}
        <TabsContent value="features" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Core Features */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-blue-600" />
                  Funcionalidades Principais
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <h5 className="font-medium text-gray-900">Sistema de Convites</h5>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Convites por email personalizados</li>
                    <li>• Templates de email configuráveis</li>
                    <li>• Links de convite com expiração</li>
                    <li>• Rastreamento de status</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h5 className="font-medium text-gray-900">Gestão de Equipes</h5>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Organização hierárquica</li>
                    <li>• Atribuição de roles</li>
                    <li>• Gestão de permissões</li>
                    <li>• Transferência entre equipes</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Advanced Features */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-yellow-600" />
                  Funcionalidades Avançadas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <h5 className="font-medium text-gray-900">Segurança</h5>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Autenticação multi-fator</li>
                    <li>• Políticas de senha</li>
                    <li>• Sessões e tokens</li>
                    <li>• Auditoria completa</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h5 className="font-medium text-gray-900">Integrações</h5>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• SSO e OAuth</li>
                    <li>• LDAP/Active Directory</li>
                    <li>• Webhooks de eventos</li>
                    <li>• API REST completa</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* API Reference Tab */}
        <TabsContent value="api" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5 text-blue-600" />
                Referência da API
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Endpoints Principais</h4>
                  <div className="space-y-2">
                    <div className="bg-gray-50 p-3 rounded">
                      <code className="text-sm">
                        <span className="text-green-600">POST</span> /api/users/invite
                        <span className="text-gray-500 ml-2">- Enviar convite</span>
                      </code>
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                      <code className="text-sm">
                        <span className="text-blue-600">GET</span> /api/users
                        <span className="text-gray-500 ml-2">- Listar usuários</span>
                      </code>
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                      <code className="text-sm">
                        <span className="text-yellow-600">PUT</span> /api/users/{'{user_id}'}/role
                        <span className="text-gray-500 ml-2">- Atualizar role</span>
                      </code>
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                      <code className="text-sm">
                        <span className="text-purple-600">POST</span> /api/users/{'{user_id}'}/suspend
                        <span className="text-gray-500 ml-2">- Suspender usuário</span>
                      </code>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Modelos de Dados</h4>
                  <div className="bg-gray-50 p-4 rounded">
                    <pre className="text-sm text-gray-700">
{`interface User {
  id: string
  email: string
  name: string
  role_id: string
  team_id: string
  status: 'pending' | 'active' | 'suspended' | 'inactive'
  created_at: string
  updated_at: string
}

interface Invite {
  id: string
  email: string
  role_id: string
  team_id: string
  invited_by: string
  status: 'pending' | 'accepted' | 'expired'
  expires_at: string
  created_at: string
}`}
                    </pre>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Examples Tab */}
        <TabsContent value="examples" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileCheck className="h-5 w-5 text-blue-600" />
                Exemplos de Uso
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Enviar Convite para Usuário</h4>
                  <div className="bg-gray-50 p-4 rounded">
                    <pre className="text-sm text-gray-700">
{`// Enviar convite para novo usuário
const response = await fetch('/api/users/invite', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'novo.usuario@empresa.com',
    role_id: 'role_gestor',
    team_id: 'team_vendas',
    message: 'Bem-vindo à equipe de vendas!',
    expires_in_days: 7
  })
})

const invite = await response.json()
console.log('Convite enviado:', invite.id)`}
                    </pre>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Atualizar Role de Usuário</h4>
                  <div className="bg-gray-50 p-4 rounded">
                    <pre className="text-sm text-gray-700">
{`// Promover usuário para gestor
const response = await fetch('/api/users/user_123/role', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    role_id: 'role_gestor',
    reason: 'Promoção por desempenho',
    effective_from: new Date().toISOString()
  })
})

const updatedUser = await response.json()`}
                    </pre>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Listar Usuários com Filtros</h4>
                  <div className="bg-gray-50 p-4 rounded">
                    <pre className="text-sm text-gray-700">
{`// Listar usuários ativos da equipe de vendas
const response = await fetch('/api/users?team_id=team_vendas&status=active&role_id=role_vendedor')
const users = await response.json()

// Filtrar por data de criação
const recentUsers = users.filter(user => 
  new Date(user.created_at) > new Date('2024-01-01')
)

console.log('Usuários recentes:', recentUsers.length)`}
                    </pre>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Suspender Usuário</h4>
                  <div className="bg-gray-50 p-4 rounded">
                    <pre className="text-sm text-gray-700">
{`// Suspender usuário temporariamente
const response = await fetch('/api/users/user_456/suspend', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    reason: 'Férias programadas',
    duration_days: 30,
    notify_user: true
  })
})

const suspension = await response.json()`}
                    </pre>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Troubleshooting Tab */}
        <TabsContent value="troubleshooting" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-blue-600" />
                Troubleshooting
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Problemas Comuns</h4>
                  <div className="space-y-3">
                    <div className="border-l-4 border-yellow-400 pl-4">
                      <h5 className="font-medium text-gray-900">Convite não é recebido</h5>
                      <p className="text-sm text-gray-600">Verificar configuração de email, spam e endereço de email correto.</p>
                    </div>
                    <div className="border-l-4 border-red-400 pl-4">
                      <h5 className="font-medium text-gray-900">Usuário não consegue acessar</h5>
                      <p className="text-sm text-gray-600">Verificar se o usuário está ativo, se tem role válido e permissões corretas.</p>
                    </div>
                    <div className="border-l-4 border-blue-400 pl-4">
                      <h5 className="font-medium text-gray-900">Permissões não funcionam</h5>
                      <p className="text-sm text-gray-600">Verificar configuração de RBAC, roles e políticas de acesso.</p>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Comandos de Diagnóstico</h4>
                  <div className="space-y-2">
                    <div className="bg-gray-50 p-3 rounded">
                      <code className="text-sm">
                        curl -X GET "http://localhost:3000/api/users/health"
                        <span className="text-gray-500 ml-2">- Verificar saúde do sistema</span>
                      </code>
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                      <code className="text-sm">
                        curl -X GET "http://localhost:3000/api/users/invites/pending"
                        <span className="text-gray-500 ml-2">- Verificar convites pendentes</span>
                      </code>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Related Documentation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ExternalLink className="h-5 w-5 text-blue-600" />
            Documentação Relacionada
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/docs/RBAC_SYSTEM" className="block">
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="h-5 w-5 text-blue-600" />
                    <h4 className="font-medium">Sistema RBAC</h4>
                  </div>
                  <p className="text-sm text-gray-600">Controle de acesso baseado em roles</p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/docs/MULTITENANCY" className="block">
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Building className="h-5 w-5 text-green-600" />
                    <h4 className="font-medium">Multi-tenancy</h4>
                  </div>
                  <p className="text-sm text-gray-600">Sistema robusto de multi-tenancy</p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/docs/QUOTES_SYSTEM" className="block">
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="h-5 w-5 text-purple-600" />
                    <h4 className="font-medium">Sistema de Orçamentos</h4>
                  </div>
                  <p className="text-sm text-gray-600">Sistema completo de orçamentos</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
