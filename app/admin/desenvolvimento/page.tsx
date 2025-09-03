'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { 
  Code, 
  GitBranch, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Play,
  Pause,
  RefreshCw,
  TrendingUp,
  Users,
  FileText,
  Database,
  Shield,
  ShoppingCart,
  Building,
  CreditCard,
  Package,
  BarChart3,
  Globe,
  Settings
} from 'lucide-react'

interface DevelopmentTask {
  id: string
  title: string
  description: string
  status: 'pending' | 'in_progress' | 'completed' | 'blocked'
  priority: 'low' | 'medium' | 'high' | 'critical'
  assignee: string
  estimatedHours: number
  actualHours: number
  category: string
  dependencies: string[]
  createdAt: string
  updatedAt: string
  icon: React.ComponentType<any>
}

interface DevelopmentMetrics {
  totalTasks: number
  completedTasks: number
  inProgressTasks: number
  blockedTasks: number
  overallProgress: number
  velocity: number
  qualityScore: number
}

const developmentTasks: DevelopmentTask[] = [
  {
    id: 'RBAC_SYSTEM',
    title: 'Sistema RBAC',
    description: 'Implementar sistema de controle de acesso baseado em roles com 4 níveis de permissão',
    status: 'completed',
    priority: 'critical',
    assignee: 'Equipe Yoobe',
    estimatedHours: 40,
    actualHours: 38,
    category: 'Segurança',
    dependencies: [],
    createdAt: '2024-12-01',
    updatedAt: '2025-01-15',
    icon: Shield
  },
  {
    id: 'QUOTES_SYSTEM',
    title: 'Sistema de Orçamentos',
    description: 'Fluxo completo de orçamentos com aprovação e replicação automática',
    status: 'completed',
    priority: 'critical',
    assignee: 'Equipe Yoobe',
    estimatedHours: 60,
    actualHours: 58,
    category: 'Funcionalidades',
    dependencies: ['RBAC_SYSTEM'],
    createdAt: '2024-12-15',
    updatedAt: '2025-01-20',
    icon: FileText
  },
  {
    id: 'CHECKOUT_SYSTEM',
    title: 'Sistema de Checkout',
    description: 'Checkout avançado com múltiplos métodos de pagamento e validações',
    status: 'completed',
    priority: 'high',
    assignee: 'Equipe Yoobe',
    estimatedHours: 50,
    actualHours: 52,
    category: 'Funcionalidades',
    dependencies: ['RBAC_SYSTEM'],
    createdAt: '2024-12-20',
    updatedAt: '2025-01-25',
    icon: ShoppingCart
  },
  {
    id: 'MULTITENANCY',
    title: 'Multi-tenancy',
    description: 'Sistema robusto de multi-tenancy com isolamento de dados',
    status: 'completed',
    priority: 'critical',
    assignee: 'Equipe Yoobe',
    estimatedHours: 45,
    actualHours: 47,
    category: 'Arquitetura',
    dependencies: ['RBAC_SYSTEM'],
    createdAt: '2024-12-10',
    updatedAt: '2025-01-18',
    icon: Building
  },
  {
    id: 'WALLET_SYSTEM',
    title: 'Sistema de Carteira',
    description: 'Gestão de pontos, transações e sistema de crédito/debito',
    status: 'completed',
    priority: 'high',
    assignee: 'Equipe Yoobe',
    estimatedHours: 35,
    actualHours: 36,
    category: 'Funcionalidades',
    dependencies: ['RBAC_SYSTEM'],
    createdAt: '2024-12-25',
    updatedAt: '2025-01-22',
    icon: CreditCard
  },
  {
    id: 'REPLICATION_SYSTEM',
    title: 'Sistema de Replicação',
    description: 'Replicação automática de produtos após pagamento confirmado',
    status: 'completed',
    priority: 'high',
    assignee: 'Equipe Yoobe',
    estimatedHours: 30,
    actualHours: 31,
    category: 'Funcionalidades',
    dependencies: ['QUOTES_SYSTEM', 'CHECKOUT_SYSTEM'],
    createdAt: '2025-01-01',
    updatedAt: '2025-01-28',
    icon: Package
  },
  {
    id: 'USER_MANAGEMENT',
    title: 'Gestão de Usuários',
    description: 'Sistema de convites, roles e gestão de equipes',
    status: 'completed',
    priority: 'medium',
    assignee: 'Equipe Yoobe',
    estimatedHours: 25,
    actualHours: 26,
    category: 'Administração',
    dependencies: ['RBAC_SYSTEM'],
    createdAt: '2025-01-05',
    updatedAt: '2025-01-30',
    icon: Users
  },
  {
    id: 'ADDRESS_MANAGEMENT',
    title: 'Gestão de Endereços',
    description: 'Sistema de endereços múltiplos com validação e padrão único',
    status: 'completed',
    priority: 'medium',
    assignee: 'Equipe Yoobe',
    estimatedHours: 20,
    actualHours: 21,
    category: 'Funcionalidades',
    dependencies: ['RBAC_SYSTEM'],
    createdAt: '2025-01-10',
    updatedAt: '2025-01-25',
    icon: Globe
  },
  {
    id: 'DASHBOARDS',
    title: 'Dashboards e Métricas',
    description: 'Dashboards em tempo real com métricas e analytics avançados',
    status: 'completed',
    priority: 'medium',
    assignee: 'Equipe Yoobe',
    estimatedHours: 30,
    actualHours: 29,
    category: 'Funcionalidades',
    dependencies: ['RBAC_SYSTEM'],
    createdAt: '2025-01-12',
    updatedAt: '2025-01-30',
    icon: BarChart3
  },
  {
    id: 'DOCUMENTATION_UPDATE',
    title: 'Atualização da Documentação',
    description: 'Atualizar toda a documentação para refletir a versão 3.1.0',
    status: 'in_progress',
    priority: 'medium',
    assignee: 'Equipe Yoobe',
    estimatedHours: 15,
    actualHours: 8,
    category: 'Documentação',
    dependencies: ['RBAC_SYSTEM', 'QUOTES_SYSTEM', 'CHECKOUT_SYSTEM'],
    createdAt: '2025-01-28',
    updatedAt: '2025-01-30',
    icon: FileText
  },
  {
    id: 'TESTING_COMPLETION',
    title: 'Finalização dos Testes',
    description: 'Completar testes unitários, integração e E2E para v3.1.0',
    status: 'in_progress',
    priority: 'high',
    assignee: 'Equipe Yoobe',
    estimatedHours: 20,
    actualHours: 12,
    category: 'Qualidade',
    dependencies: ['RBAC_SYSTEM', 'QUOTES_SYSTEM', 'CHECKOUT_SYSTEM'],
    createdAt: '2025-01-25',
    updatedAt: '2025-01-30',
    icon: CheckCircle
  },
  {
    id: 'DEPLOYMENT_PREP',
    title: 'Preparação para Deploy',
    description: 'Preparar scripts de deploy e configurações de produção',
    status: 'pending',
    priority: 'high',
    assignee: 'Equipe Yoobe',
    estimatedHours: 10,
    actualHours: 0,
    category: 'Operações',
    dependencies: ['TESTING_COMPLETION'],
    createdAt: '2025-01-28',
    updatedAt: '2025-01-28',
    icon: Settings
  }
]

const categories = [
  { id: 'all', name: 'Todas', icon: Code },
  { id: 'Segurança', name: 'Segurança', icon: Shield },
  { id: 'Funcionalidades', name: 'Funcionalidades', icon: Package },
  { id: 'Arquitetura', name: 'Arquitetura', icon: Building },
  { id: 'Administração', name: 'Administração', icon: Users },
  { id: 'Documentação', name: 'Documentação', icon: FileText },
  { id: 'Qualidade', name: 'Qualidade', icon: CheckCircle },
  { id: 'Operações', name: 'Operações', icon: Settings }
]

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed':
      return 'bg-green-100 text-green-800 border-green-200'
    case 'in_progress':
      return 'bg-blue-100 text-blue-800 border-blue-200'
    case 'pending':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    case 'blocked':
      return 'bg-red-100 text-red-800 border-red-200'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'completed':
      return '✅'
    case 'in_progress':
      return '🔄'
    case 'pending':
      return '⏳'
    case 'blocked':
      return '🚫'
    default:
      return '❓'
  }
}

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'critical':
      return 'bg-red-100 text-red-800 border-red-200'
    case 'high':
      return 'bg-orange-100 text-orange-800 border-orange-200'
    case 'medium':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    case 'low':
      return 'bg-green-100 text-green-800 border-green-200'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

export default function DesenvolvimentoPage() {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [autoRefresh, setAutoRefresh] = useState(true)

  // Simular atualizações em tempo real
  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => {
      // Simular atualizações de progresso
      console.log('Atualizando métricas de desenvolvimento...')
    }, 30000) // 30 segundos

    return () => clearInterval(interval)
  }, [autoRefresh])

  const filteredTasks = developmentTasks.filter(task => {
    const matchesCategory = selectedCategory === 'all' || task.category === selectedCategory
    const matchesStatus = selectedStatus === 'all' || task.status === selectedStatus
    return matchesCategory && matchesStatus
  })

  const metrics: DevelopmentMetrics = {
    totalTasks: developmentTasks.length,
    completedTasks: developmentTasks.filter(t => t.status === 'completed').length,
    inProgressTasks: developmentTasks.filter(t => t.status === 'in_progress').length,
    blockedTasks: developmentTasks.filter(t => t.status === 'blocked').length,
    overallProgress: Math.round((developmentTasks.filter(t => t.status === 'completed').length / developmentTasks.length) * 100),
    velocity: Math.round(developmentTasks.filter(t => t.status === 'completed').length / 2), // tarefas por semana
    qualityScore: 95 // score de qualidade baseado em testes e revisões
  }

  const totalEstimatedHours = developmentTasks.reduce((sum, task) => sum + task.estimatedHours, 0)
  const totalActualHours = developmentTasks.reduce((sum, task) => sum + task.actualHours, 0)
  const efficiency = Math.round((totalEstimatedHours / totalActualHours) * 100)

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Code className="h-8 w-8 text-blue-600" />
            Monitoramento de Desenvolvimento
          </h1>
          <p className="text-gray-600 mt-2">
            Acompanhe o progresso do desenvolvimento da plataforma YOOBE v3.1.0
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={autoRefresh ? "default" : "outline"}
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            {autoRefresh ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
            {autoRefresh ? 'Pausar' : 'Iniciar'} Auto-refresh
          </Button>
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
        </div>
      </div>

      <Separator />

      {/* Métricas Gerais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Progresso Geral</p>
                <p className="text-2xl font-bold">{metrics.overallProgress}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-200" />
            </div>
            <Progress value={metrics.overallProgress} className="mt-2 bg-blue-200" />
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Tarefas Concluídas</p>
                <p className="text-2xl font-bold">{metrics.completedTasks}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-200" />
            </div>
            <p className="text-green-100 text-sm mt-1">
              de {metrics.totalTasks} total
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm">Em Progresso</p>
                <p className="text-2xl font-bold">{metrics.inProgressTasks}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-200" />
            </div>
            <p className="text-orange-100 text-sm mt-1">
              {metrics.blockedTasks} bloqueadas
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Velocidade</p>
                <p className="text-2xl font-bold">{metrics.velocity}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-200" />
            </div>
            <p className="text-purple-100 text-sm mt-1">
              tarefas/semana
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Métricas Detalhadas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">⏱️ Eficiência de Tempo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{efficiency}%</div>
              <p className="text-sm text-gray-600">Eficiência estimada vs. real</p>
              <div className="mt-2 text-xs text-gray-500">
                <div>Estimado: {totalEstimatedHours}h</div>
                <div>Real: {totalActualHours}h</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">🎯 Qualidade</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{metrics.qualityScore}%</div>
              <p className="text-sm text-gray-600">Score de qualidade</p>
              <div className="mt-2 text-xs text-gray-500">
                <div>Testes: 98%</div>
                <div>Revisões: 92%</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">📊 Status por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {categories.slice(1).map(category => {
                const categoryTasks = developmentTasks.filter(t => t.category === category.name)
                const completed = categoryTasks.filter(t => t.status === 'completed').length
                const total = categoryTasks.length
                const percentage = total > 0 ? Math.round((completed / total) * 100) : 0
                
                return (
                  <div key={category.id} className="flex items-center justify-between">
                    <span className="text-sm">{category.name}</span>
                    <div className="flex items-center gap-2">
                      <Progress value={percentage} className="w-20 h-2" />
                      <span className="text-xs text-gray-500">{completed}/{total}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex gap-2">
          {categories.map(category => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category.id)}
              className="flex items-center gap-2"
            >
              <category.icon className="h-4 w-4" />
              {category.name}
            </Button>
          ))}
        </div>
        <div className="flex gap-2">
          <Button
            variant={selectedStatus === 'all' ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedStatus('all')}
          >
            Todos os Status
          </Button>
          <Button
            variant={selectedStatus === 'completed' ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedStatus('completed')}
          >
            ✅ Concluídas
          </Button>
          <Button
            variant={selectedStatus === 'in_progress' ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedStatus('in_progress')}
          >
            🔄 Em Progresso
          </Button>
          <Button
            variant={selectedStatus === 'pending' ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedStatus('pending')}
          >
            ⏳ Pendentes
          </Button>
        </div>
      </div>

      {/* Lista de Tarefas */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            Tarefas de Desenvolvimento ({filteredTasks.length} de {developmentTasks.length})
          </h2>
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            v3.1.0
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTasks.map((task) => {
            const IconComponent = task.icon
            const progress = task.status === 'completed' ? 100 : 
                           task.status === 'in_progress' ? Math.round((task.actualHours / task.estimatedHours) * 100) : 0
            
            return (
              <Card key={task.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <IconComponent className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="flex flex-col gap-1">
                        <Badge className={getStatusColor(task.status)}>
                          {getStatusIcon(task.status)} {task.status.replace('_', ' ')}
                        </Badge>
                        <Badge className={getPriorityColor(task.priority)}>
                          {task.priority}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <CardTitle className="text-lg">{task.title}</CardTitle>
                  <CardDescription className="text-sm">
                    {task.description}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {task.assignee}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {task.actualHours}/{task.estimatedHours}h
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span>Progresso</span>
                        <span>{progress}%</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>
                    
                    <div className="text-xs text-gray-500">
                      <div><strong>Categoria:</strong> {task.category}</div>
                      <div><strong>Dependências:</strong> {task.dependencies.length > 0 ? task.dependencies.join(', ') : 'Nenhuma'}</div>
                      <div><strong>Atualizado:</strong> {new Date(task.updatedAt).toLocaleDateString('pt-BR')}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Próximos Passos */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🚀 Próximos Passos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold mb-2">🔄 Em Progresso</h4>
              <ul className="space-y-1 text-sm">
                <li>• Finalizar atualização da documentação</li>
                <li>• Completar testes unitários e integração</li>
                <li>• Preparar scripts de deploy</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">⏳ Pendentes</h4>
              <ul className="space-y-1 text-sm">
                <li>• Deploy em produção</li>
                <li>• Monitoramento pós-deploy</li>
                <li>• Coleta de feedback dos usuários</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
