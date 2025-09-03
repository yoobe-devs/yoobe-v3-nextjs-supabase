'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Building, 
  CheckCircle, 
  Users, 
  Lock, 
  Database,
  ArrowRight,
  ExternalLink,
  BookOpen,
  Code,
  Shield,
  Settings,
  BarChart3,
  User,
  Package,
  MapPin,
  FileCheck,
  Zap,
  AlertTriangle,
  FileText,
  Globe,
  Network
} from 'lucide-react'
import Link from 'next/link'

export default function MultitenancyPage() {
  const [activeTab, setActiveTab] = useState('overview')

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Building className="h-8 w-8 text-blue-600" />
            Sistema Multi-tenancy v3.1.0
          </h1>
          <p className="text-gray-600 mt-2">
            Sistema robusto de multi-tenancy com isolamento total de dados e empresas independentes
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            Ativo
          </Badge>
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            <Code className="h-3 w-3 mr-1" />
            v3.1.0
          </Badge>
        </div>
      </div>

      {/* Navigation Breadcrumb */}
      <nav className="flex items-center space-x-2 text-sm text-gray-500">
        <Link href="/docs" className="hover:text-blue-600">Documentação</Link>
        <ArrowRight className="h-4 w-4" />
        <span className="text-gray-900 font-medium">Sistema Multi-tenancy</span>
      </nav>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="architecture">Arquitetura</TabsTrigger>
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
                Sistema de multi-tenancy avançado com isolamento total de dados e configurações por empresa
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900">Características Principais</h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Isolamento total de dados por empresa
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Configurações independentes por tenant
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Gestão centralizada de empresas
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Escalabilidade horizontal
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Backup e restore por tenant
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
                      <Globe className="h-4 w-4 text-orange-500" />
                      Middleware de tenant
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Multi-tenancy Models */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Network className="h-5 w-5 text-blue-600" />
                Modelos de Multi-tenancy
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Database className="h-6 w-6 text-blue-600" />
                  </div>
                  <h4 className="font-medium text-gray-900">Database per Tenant</h4>
                  <p className="text-sm text-gray-600">Banco separado por empresa</p>
                  <Badge className="mt-2 bg-blue-100 text-blue-800">Recomendado</Badge>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Shield className="h-6 w-6 text-green-600" />
                  </div>
                  <h4 className="font-medium text-gray-900">Schema per Tenant</h4>
                  <p className="text-sm text-gray-600">Schema separado por empresa</p>
                  <Badge className="mt-2 bg-green-100 text-green-800">Eficiente</Badge>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Package className="h-6 w-6 text-yellow-600" />
                  </div>
                  <h4 className="font-medium text-gray-900">Row Level Security</h4>
                  <p className="text-sm text-gray-600">Filtros por tenant_id</p>
                  <Badge className="mt-2 bg-yellow-100 text-yellow-800">Flexível</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Architecture Tab */}
        <TabsContent value="architecture" className="space-y-6">
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
│   (Next.js)     │◄──►│   (Tenant)      │◄──►│   (Supabase)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
    Interface de         Identificação de        Isolamento de
    Usuário              Tenant                  Dados
         │                       │                       │
         ▼                       ▼                       ▼
    Componentes          Context de Tenant       RLS Policies
    por Tenant           e Configurações        e Schemas
         │                       │                       │
         ▼                       ▼                       ▼
    Renderização         Aplicação de            Acesso Controlado
    Condicional          Políticas de            por Tenant`}
                </pre>
              </div>
            </CardContent>
          </Card>

          {/* Tenant Isolation */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-blue-600" />
                Isolamento de Tenants
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Nível de Aplicação</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Middleware de identificação de tenant</li>
                      <li>• Context de tenant em toda aplicação</li>
                      <li>• Componentes condicionais por tenant</li>
                      <li>• Configurações específicas por empresa</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Nível de Banco</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• RLS policies por tenant_id</li>
                      <li>• Schemas separados por empresa</li>
                      <li>• Índices otimizados por tenant</li>
                      <li>• Backup e restore independentes</li>
                    </ul>
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
                  <h5 className="font-medium text-gray-900">Gestão de Tenants</h5>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Criação e configuração de empresas</li>
                    <li>• Ativação/desativação de tenants</li>
                    <li>• Configurações por empresa</li>
                    <li>• Limites de recursos por tenant</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h5 className="font-medium text-gray-900">Isolamento de Dados</h5>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Separação total de dados</li>
                    <li>• Políticas de segurança por tenant</li>
                    <li>• Backup independente por empresa</li>
                    <li>• Migração de dados entre tenants</li>
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
                  <h5 className="font-medium text-gray-900">Escalabilidade</h5>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Sharding automático de dados</li>
                    <li>• Balanceamento de carga por tenant</li>
                    <li>• Cache específico por empresa</li>
                    <li>• Monitoramento por tenant</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h5 className="font-medium text-gray-900">Integrações</h5>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• APIs específicas por tenant</li>
                    <li>• Webhooks por empresa</li>
                    <li>• Integração com sistemas externos</li>
                    <li>• Relatórios consolidados</li>
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
                        <span className="text-green-600">POST</span> /api/tenants
                        <span className="text-gray-500 ml-2">- Criar novo tenant</span>
                      </code>
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                      <code className="text-sm">
                        <span className="text-blue-600">GET</span> /api/tenants/{'{tenant_id}'}
                        <span className="text-gray-500 ml-2">- Obter dados do tenant</span>
                      </code>
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                      <code className="text-sm">
                        <span className="text-yellow-600">PUT</span> /api/tenants/{'{tenant_id}'}/config
                        <span className="text-gray-500 ml-2">- Atualizar configuração</span>
                      </code>
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                      <code className="text-sm">
                        <span className="text-purple-600">POST</span> /api/tenants/{'{tenant_id}'}/backup
                        <span className="text-gray-500 ml-2">- Criar backup</span>
                      </code>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Modelos de Dados</h4>
                  <div className="bg-gray-50 p-4 rounded">
                    <pre className="text-sm text-gray-700">
{`interface Tenant {
  id: string
  name: string
  domain: string
  status: 'active' | 'inactive' | 'suspended'
  config: TenantConfig
  created_at: string
  updated_at: string
}

interface TenantConfig {
  max_users: number
  max_storage: number
  features: string[]
  custom_domain?: string
  branding: BrandingConfig
}

interface BrandingConfig {
  logo_url: string
  primary_color: string
  company_name: string
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
                  <h4 className="font-medium text-gray-900 mb-2">Criar Novo Tenant</h4>
                  <div className="bg-gray-50 p-4 rounded">
                    <pre className="text-sm text-gray-700">
{`// Criar novo tenant
const response = await fetch('/api/tenants', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Empresa ABC Ltda',
    domain: 'abc.yoobe.com',
    config: {
      max_users: 100,
      max_storage: 1000000,
      features: ['quotes', 'checkout', 'reports']
    }
  })
})

const tenant = await response.json()`}
                    </pre>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Middleware de Tenant</h4>
                  <div className="bg-gray-50 p-4 rounded">
                    <pre className="text-sm text-gray-700">
{`// Middleware para identificar tenant
export function withTenant(handler: NextApiHandler) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const tenantId = req.headers['x-tenant-id'] || 
                    req.query.tenant_id ||
                    extractFromDomain(req.headers.host)
    
    if (!tenantId) {
      return res.status(400).json({ error: 'Tenant ID required' })
    }
    
    req.tenant = await getTenant(tenantId)
    return handler(req, res)
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
                      <h5 className="font-medium text-gray-900">Tenant não identificado</h5>
                      <p className="text-sm text-gray-600">Verificar headers, query params e configuração de domínio.</p>
                    </div>
                    <div className="border-l-4 border-red-400 pl-4">
                      <h5 className="font-medium text-gray-900">Vazamento de dados entre tenants</h5>
                      <p className="text-sm text-gray-600">Verificar RLS policies e middleware de tenant.</p>
                    </div>
                    <div className="border-l-4 border-blue-400 pl-4">
                      <h5 className="font-medium text-gray-900">Performance degradada</h5>
                      <p className="text-sm text-gray-600">Verificar índices por tenant e configuração de cache.</p>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Comandos de Diagnóstico</h4>
                  <div className="space-y-2">
                    <div className="bg-gray-50 p-3 rounded">
                      <code className="text-sm">
                        curl -X GET "http://localhost:3000/api/tenants/status"
                        <span className="text-gray-500 ml-2">- Verificar status dos tenants</span>
                      </code>
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                      <code className="text-sm">
                        curl -X GET "http://localhost:3000/api/tenants/{'{tenant_id}'}/health"
                        <span className="text-gray-500 ml-2">- Verificar saúde do tenant</span>
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
            <Link href="/docs/QUOTES_SYSTEM" className="block">
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="h-5 w-5 text-green-600" />
                    <h4 className="font-medium">Sistema de Orçamentos</h4>
                  </div>
                  <p className="text-sm text-gray-600">Sistema completo de orçamentos</p>
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
                  <p className="text-sm text-gray-600">Sistema de convites e equipes</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
