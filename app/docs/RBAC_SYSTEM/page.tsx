'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Shield, 
  CheckCircle, 
  Users, 
  Lock, 
  Key,
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
  Crown,
  UserCheck
} from 'lucide-react'
import Link from 'next/link'

export default function RBACSystemPage() {
  const [activeTab, setActiveTab] = useState('overview')

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Shield className="h-8 w-8 text-blue-600" />
            Sistema RBAC v3.0.0
          </h1>
          <p className="text-gray-600 mt-2">
            Sistema robusto de controle de acesso baseado em roles com 4 níveis de permissões
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
        <span className="text-gray-900 font-medium">Sistema RBAC</span>
      </nav>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="roles">Roles e Permissões</TabsTrigger>
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
                Sistema de controle de acesso baseado em roles com permissões granulares e hierarquia clara
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900">Características Principais</h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      4 níveis de acesso hierárquicos
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Permissões granulares por recurso
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Herança automática de permissões
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Auditoria completa de ações
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Integração com multi-tenancy
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
                      <Lock className="h-4 w-4 text-red-500" />
                      JWT + Middleware
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* System Architecture */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5 text-blue-600" />
                Arquitetura do Sistema
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 p-4 rounded-lg">
                <pre className="text-sm text-gray-700 whitespace-pre-wrap">
{`┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Middleware    │    │   Database      │
│   (Next.js)     │◄──►│   (Auth + RBAC) │◄──►│   (Supabase)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
    Interface de         Verificação de         Armazenamento
    Usuário              Permissões             de Roles
         │                       │                       │
         ▼                       ▼                       ▼
    Componentes          Validação de           Tabelas:
    Protegidos           Acesso por             - users
         │               Role/Resource          - roles
         ▼                       │               - permissions
    Renderização         Log de Auditoria       - user_roles
    Condicional          e Controle            - role_permissions`}
                </pre>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Roles Tab */}
        <TabsContent value="roles" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-blue-600" />
                Hierarquia de Roles
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Role Hierarchy */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Crown className="h-8 w-8 text-red-600" />
                    </div>
                    <h4 className="font-medium text-gray-900">Super Admin</h4>
                    <p className="text-xs text-gray-500 mb-2">Nível 4</p>
                    <Badge className="bg-red-100 text-red-800">Acesso Total</Badge>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <UserCheck className="h-8 w-8 text-orange-600" />
                    </div>
                    <h4 className="font-medium text-gray-900">Admin</h4>
                    <p className="text-xs text-gray-500 mb-2">Nível 3</p>
                    <Badge className="bg-orange-100 text-orange-800">Gestão Completa</Badge>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Users className="h-8 w-8 text-yellow-600" />
                    </div>
                    <h4 className="font-medium text-gray-900">Gestor</h4>
                    <p className="text-xs text-gray-500 mb-2">Nível 2</p>
                    <Badge className="bg-yellow-100 text-yellow-800">Gestão Limitada</Badge>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <User className="h-8 w-8 text-green-600" />
                    </div>
                    <h4 className="font-medium text-gray-900">Usuário</h4>
                    <p className="text-xs text-gray-500 mb-2">Nível 1</p>
                    <Badge className="bg-green-100 text-green-800">Acesso Básico</Badge>
                  </div>
                </div>

                <Separator />

                {/* Permissions Matrix */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Matriz de Permissões</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2">Recurso</th>
                          <th className="text-center p-2">Usuário</th>
                          <th className="text-center p-2">Gestor</th>
                          <th className="text-center p-2">Admin</th>
                          <th className="text-center p-2">Super Admin</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b">
                          <td className="p-2 font-medium">Visualizar Produtos</td>
                          <td className="text-center p-2">✅</td>
                          <td className="text-center p-2">✅</td>
                          <td className="text-center p-2">✅</td>
                          <td className="text-center p-2">✅</td>
                        </tr>
                        <tr className="border-b">
                          <td className="p-2 font-medium">Criar Orçamentos</td>
                          <td className="text-center p-2">✅</td>
                          <td className="text-center p-2">✅</td>
                          <td className="text-center p-2">✅</td>
                          <td className="text-center p-2">✅</td>
                        </tr>
                        <tr className="border-b">
                          <td className="p-2 font-medium">Aprovar Orçamentos</td>
                          <td className="text-center p-2">❌</td>
                          <td className="text-center p-2">✅</td>
                          <td className="text-center p-2">✅</td>
                          <td className="text-center p-2">✅</td>
                        </tr>
                        <tr className="border-b">
                          <td className="p-2 font-medium">Gestão de Usuários</td>
                          <td className="text-center p-2">❌</td>
                          <td className="text-center p-2">❌</td>
                          <td className="text-center p-2">✅</td>
                          <td className="text-center p-2">✅</td>
                        </tr>
                        <tr className="border-b">
                          <td className="p-2 font-medium">Configurações do Sistema</td>
                          <td className="text-center p-2">❌</td>
                          <td className="text-center p-2">❌</td>
                          <td className="text-center p-2">❌</td>
                          <td className="text-center p-2">✅</td>
                        </tr>
                      </tbody>
                    </table>
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
                  <h5 className="font-medium text-gray-900">Gestão de Roles</h5>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Criação e edição de roles</li>
                    <li>• Hierarquia automática de permissões</li>
                    <li>• Herança de permissões</li>
                    <li>• Templates de roles predefinidos</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h5 className="font-medium text-gray-900">Controle de Acesso</h5>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Verificação em tempo real</li>
                    <li>• Middleware de autenticação</li>
                    <li>• Proteção de rotas</li>
                    <li>• Componentes condicionais</li>
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
                  <h5 className="font-medium text-gray-900">Auditoria</h5>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Log de todas as ações</li>
                    <li>• Rastreamento de mudanças</li>
                    <li>• Relatórios de acesso</li>
                    <li>• Alertas de segurança</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h5 className="font-medium text-gray-900">Integrações</h5>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Multi-tenancy avançado</li>
                    <li>• SSO e OAuth</li>
                    <li>• Webhooks de segurança</li>
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
                        <span className="text-green-600">POST</span> /api/auth/login
                        <span className="text-gray-500 ml-2">- Autenticação</span>
                      </code>
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                      <code className="text-sm">
                        <span className="text-blue-600">GET</span> /api/auth/me
                        <span className="text-gray-500 ml-2">- Perfil do usuário</span>
                      </code>
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                      <code className="text-sm">
                        <span className="text-yellow-600">GET</span> /api/roles
                        <span className="text-gray-500 ml-2">- Listar roles</span>
                      </code>
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                      <code className="text-sm">
                        <span className="text-purple-600">POST</span> /api/roles/assign
                        <span className="text-gray-500 ml-2">- Atribuir role</span>
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
  role_id: string
  company_id: string
  permissions: Permission[]
}

interface Role {
  id: string
  name: string
  level: 1 | 2 | 3 | 4
  permissions: Permission[]
  company_id: string
}

interface Permission {
  id: string
  resource: string
  action: 'create' | 'read' | 'update' | 'delete'
  conditions?: object
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
                  <h4 className="font-medium text-gray-900 mb-2">Verificar Permissão</h4>
                  <div className="bg-gray-50 p-4 rounded">
                    <pre className="text-sm text-gray-700">
{`// Verificar se usuário pode criar orçamentos
const canCreateQuotes = await checkPermission(
  user.id, 
  'quotes', 
  'create'
)

if (canCreateQuotes) {
  // Renderizar botão de criar orçamento
  return <CreateQuoteButton />
}`}
                    </pre>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Middleware de Proteção</h4>
                  <div className="bg-gray-50 p-4 rounded">
                    <pre className="text-sm text-gray-700">
{`// Middleware para proteger rota
export function withRole(requiredRole: number) {
  return function(WrappedComponent: React.ComponentType) {
    return function ProtectedComponent(props: any) {
      const { user } = useAuth()
      
      if (user.role.level < requiredRole) {
        return <AccessDenied />
      }
      
      return <WrappedComponent {...props} />
    }
  }
}`}
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
                      <h5 className="font-medium text-gray-900">Acesso negado incorretamente</h5>
                      <p className="text-sm text-gray-600">Verificar se o usuário tem o role correto e se as permissões estão configuradas.</p>
                    </div>
                    <div className="border-l-4 border-red-400 pl-4">
                      <h5 className="font-medium text-gray-900">Token expirado</h5>
                      <p className="text-sm text-gray-600">Verificar configuração de JWT e renovar token automaticamente.</p>
                    </div>
                    <div className="border-l-4 border-blue-400 pl-4">
                      <h5 className="font-medium text-gray-900">Permissões não herdam</h5>
                      <p className="text-sm text-gray-600">Verificar hierarquia de roles e configuração de herança.</p>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Comandos de Diagnóstico</h4>
                  <div className="space-y-2">
                    <div className="bg-gray-50 p-3 rounded">
                      <code className="text-sm">
                        curl -X GET "http://localhost:3000/api/auth/me"
                        <span className="text-gray-500 ml-2">- Verificar perfil do usuário</span>
                      </code>
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                      <code className="text-sm">
                        curl -X GET "http://localhost:3000/api/roles/user/{'{user_id}'}"
                        <span className="text-gray-500 ml-2">- Verificar roles do usuário</span>
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
            <Link href="/docs/QUOTES_SYSTEM" className="block">
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <h4 className="font-medium">Sistema de Orçamentos</h4>
                  </div>
                  <p className="text-sm text-gray-600">Sistema completo de orçamentos e aprovação</p>
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
            <Link href="/docs/USER_MANAGEMENT" className="block">
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="h-5 w-5 text-purple-600" />
                    <h4 className="font-medium">Gestão de Usuários</h4>
                  </div>
                  <p className="text-sm text-gray-600">Sistema de convites e gestão de equipes</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
