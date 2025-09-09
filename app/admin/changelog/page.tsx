'use client'

import { useEffect, useState } from 'react'
import { MarkdownRenderer } from '@/components/ui/markdown-renderer'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { GitBranch, Calendar, Tag, User, ArrowRight } from 'lucide-react'
import Link from 'next/link'

interface ChangelogEntry {
  version: string
  date: string
  title: string
  description: string
  author: string
  type: 'feature' | 'fix' | 'improvement' | 'breaking'
  changes: string[]
}

const changelogData: ChangelogEntry[] = [
  {
    version: 'v3.1.0',
    date: 'Setembro 2025',
    title: 'Sistema Completo de Orçamentos e Replicação',
    description:
      'Lançamento principal com sistema de orçamentos, RBAC robusto e multi-tenancy avançado',
    author: 'Equipe Yoobe',
    type: 'feature',
    changes: [
      '🔄 Sistema completo de orçamentos com aprovação',
      '🔐 RBAC avançado com 4 níveis de acesso',
      '🏢 Multi-tenancy robusto com empresas independentes',
      '🛒 Checkout inteligente com múltiplos pagamentos',
      '💳 Sistema de carteira com pontos e transações',
      '📋 Replicação automática de produtos após pagamento',
      '👥 Sistema de convites e gestão de usuários',
      '📍 Gestão de endereços com validação',
      '📊 Dashboards em tempo real com métricas',
      '🔍 Auditoria completa de todas as ações',
    ],
  },
  {
    version: 'v2.2.0',
    date: '2 de Setembro, 2025',
    title: 'Compatibilidade API/DB/Frontend',
    description:
      'Ajustes de compatibilidade e correções de APIs para melhor integração',
    author: 'Equipe Yoobe',
    type: 'improvement',
    changes: [
      '✅ Ajuste de códigos de status e payloads nas rotas do Gestor',
      '🔐 Suporte a Authorization header nas rotas do Gestor',
      '🧪 Todos os testes do fluxo de orçamentos passando (17/17)',
      '📚 Documentação API atualizada com rotas reais',
      '📝 Preparação para sistema de auditoria avançado',
    ],
  },
  {
    version: 'v2.1.0',
    date: '17 de Janeiro, 2024',
    title: 'Sistema de Notificações e Documentação',
    description:
      'Implementação completa do sistema de notificações de changelog e documentação visual',
    author: 'Equipe Yoobe',
    type: 'feature',
    changes: [
      '🔔 Sistema de notificações de changelog com ícone de sino',
      '📊 Contador de notificações não lidas',
      '📋 Popover com lista de atualizações recentes',
      '🔗 Links para Changelog e Documentação no menu lateral',
      '📚 Documentações visuais completas em formato HTML',
      '🎨 Interface moderna com gradientes e cards',
      '📱 Design responsivo e acessível',
    ],
  },
  {
    version: 'v3.1.0',
    date: 'Setembro 2025',
    title: 'Sistema Completo de Orçamentos e Replicação',
    description:
      'Lançamento principal com sistema de orçamentos, RBAC robusto e multi-tenancy avançado',
    author: 'Equipe Yoobe',
    type: 'feature',
    changes: [
      '🔄 Sistema completo de orçamentos com aprovação',
      '🔐 RBAC avançado com 4 níveis de acesso',
      '🏢 Multi-tenancy robusto com empresas independentes',
      '🛒 Checkout inteligente com múltiplos pagamentos',
      '💳 Sistema de carteira com pontos e transações',
      '📋 Replicação automática de produtos após pagamento',
      '👥 Sistema de convites e gestão de usuários',
      '📍 Gestão de endereços com validação',
      '📊 Dashboards em tempo real com métricas',
      '🔍 Auditoria completa de todas as ações',
    ],
  },
  {
    version: 'v2.0.0',
    date: '15 de Janeiro, 2024',
    title: 'Integração Cubbo e Gamificação',
    description:
      'Lançamento da integração com Cubbo e plataformas de gamificação',
    author: 'Equipe Yoobe',
    type: 'feature',
    changes: [
      '🚀 Integração completa com Cubbo para fulfillment',
      '🎮 Suporte a Workvivo, Applause e Human',
      '🤖 Integração com Zapier, Floui e Make',
      '📊 Sistema de pontos e recompensas',
      '🔄 Sincronização automática de dados',
      '📈 Analytics e métricas avançadas',
    ],
  },
  {
    version: 'v1.9.0',
    date: '10 de Janeiro, 2024',
    title: 'Melhorias na Interface e Performance',
    description:
      'Otimizações de performance e melhorias na experiência do usuário',
    author: 'Equipe Yoobe',
    type: 'improvement',
    changes: [
      '⚡ Otimização de performance geral',
      '🎨 Melhorias no design da interface',
      '📱 Melhor responsividade mobile',
      '🔍 Busca e filtros aprimorados',
      '📊 Dashboards mais informativos',
      '🛠️ Correções de bugs menores',
    ],
  },
  {
    version: 'v1.8.0',
    date: '5 de Janeiro, 2024',
    title: 'Sistema de Multi-tenancy',
    description: 'Implementação completa do sistema multi-tenant',
    author: 'Equipe Yoobe',
    type: 'feature',
    changes: [
      '🏢 Sistema multi-tenant completo',
      '🔐 Row Level Security (RLS)',
      '👥 Gestão de usuários por empresa',
      '🏪 Lojas independentes por empresa',
      '📊 Relatórios isolados por tenant',
      '🔧 Configurações personalizadas',
    ],
  },
  {
    version: 'v1.7.0',
    date: '30 de Dezembro, 2023',
    title: 'Correções de Segurança',
    description: 'Atualizações de segurança e correções críticas',
    author: 'Equipe Yoobe',
    type: 'fix',
    changes: [
      '🔒 Correções de vulnerabilidades de segurança',
      '🛡️ Melhorias na autenticação',
      '🔐 Criptografia aprimorada',
      '📝 Logs de auditoria',
      '🚨 Alertas de segurança',
      '🔄 Atualizações de dependências',
    ],
  },
]

const getTypeColor = (type: string) => {
  switch (type) {
    case 'feature':
      return 'bg-green-100 text-green-800 border-green-200'
    case 'fix':
      return 'bg-red-100 text-red-800 border-red-200'
    case 'improvement':
      return 'bg-blue-100 text-blue-800 border-blue-200'
    case 'breaking':
      return 'bg-orange-100 text-orange-800 border-orange-200'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'feature':
      return '✨'
    case 'fix':
      return '🐛'
    case 'improvement':
      return '⚡'
    case 'breaking':
      return '💥'
    default:
      return '📝'
  }
}

export default function ChangelogPage() {
  const [selectedVersion, setSelectedVersion] = useState<string | null>(null)
  const [md, setMd] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/admin/changelog/markdown')
        if (res.ok) {
          const data = await res.json()
          setMd(data.content as string)
        }
      } catch (e) {}
    }
    load()
  }, [])

  if (md) {
    const version = (md.match(/v\d+\.\d+\.\d+/) || [null])[0]
    return (
      <div className="space-y-4">
        <div className="container mx-auto p-4 flex items-center gap-2">
          {version && (
            <span className="inline-flex items-center rounded border border-blue-200 bg-blue-50 px-2 py-1 text-xs text-blue-700">
              {version}
            </span>
          )}
          <span className="inline-flex items-center rounded border border-green-200 bg-green-50 px-2 py-1 text-xs text-green-700">
            Sincronizado do CHANGELOG.md
          </span>
        </div>
        <MarkdownRenderer content={md} title="Changelog (CHANGELOG.md)" />
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <GitBranch className="h-8 w-8 text-blue-600" />
            Changelog
          </h1>
          <p className="text-gray-600 mt-2">
            Histórico completo de atualizações e melhorias da plataforma
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className="bg-blue-50 text-blue-700 border-blue-200"
          >
            <Tag className="h-3 w-3 mr-1" />
            v3.1.0
          </Badge>
          <Badge
            variant="outline"
            className="bg-green-50 text-green-700 border-green-200"
          >
            Ativo
          </Badge>
        </div>
      </div>

      <Separator />

      {/* Changelog Entries */}
      <div className="space-y-6">
        {changelogData.map((entry, index) => (
          <Card
            key={entry.version}
            className="border-l-4 border-l-blue-500 hover:shadow-lg transition-shadow"
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Badge className={getTypeColor(entry.type)}>
                      {getTypeIcon(entry.type)} {entry.type}
                    </Badge>
                    <h3 className="text-xl font-semibold text-gray-900">
                      {entry.title}
                    </h3>
                  </div>
                  <p className="text-gray-600 mb-3">{entry.description}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {entry.date}
                    </div>
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      {entry.author}
                    </div>
                    <div className="flex items-center gap-1">
                      <Tag className="h-4 w-4" />
                      {entry.version}
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    setSelectedVersion(
                      selectedVersion === entry.version ? null : entry.version
                    )
                  }
                  className="text-blue-600 hover:text-blue-700"
                >
                  {selectedVersion === entry.version
                    ? 'Ocultar'
                    : 'Ver detalhes'}
                  <ArrowRight
                    className={`h-4 w-4 ml-1 transition-transform ${
                      selectedVersion === entry.version ? 'rotate-90' : ''
                    }`}
                  />
                </Button>
              </div>
            </CardHeader>

            {selectedVersion === entry.version && (
              <CardContent>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">
                    Mudanças nesta versão:
                  </h4>
                  <ul className="space-y-2">
                    {entry.changes.map((change, changeIndex) => (
                      <li
                        key={changeIndex}
                        className="flex items-start gap-2 text-gray-700"
                      >
                        <span className="text-blue-500 mt-1">•</span>
                        <span>{change}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      {/* Links Úteis */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🔗 Links Úteis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg bg-white">
              <GitBranch className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <h4 className="font-semibold">Documentação</h4>
              <p className="text-sm text-gray-600 mb-3">
                Acesse a documentação completa da v3.1.0
              </p>
              <Link
                href="/docs"
                className="text-blue-600 text-sm hover:underline"
              >
                Acessar Documentação →
              </Link>
            </div>

            <div className="text-center p-4 border rounded-lg bg-white">
              <GitBranch className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <h4 className="font-semibold">Sistema de Proteção</h4>
              <p className="text-sm text-gray-600 mb-3">
                Monitoramento e proteção do middleware e MCPs
              </p>
              <div className="space-y-1">
                <Link
                  href="/admin/system-monitoring"
                  className="text-green-600 text-sm hover:underline block"
                >
                  Dashboard Completo →
                </Link>
                <Link
                  href="/admin/system-monitoring-simple"
                  className="text-blue-600 text-sm hover:underline block"
                >
                  Dashboard Simples (Teste) →
                </Link>
              </div>
            </div>

            <div className="text-center p-4 border rounded-lg bg-white">
              <GitBranch className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <h4 className="font-semibold">Manual do Usuário</h4>
              <p className="text-sm text-gray-600 mb-3">
                Guia completo para usuários
              </p>
              <Link
                href="/docs/USER_GUIDE"
                className="text-purple-600 text-sm hover:underline"
              >
                Acessar Manual →
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="mt-12 text-center">
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            📬 Receba atualizações
          </h3>
          <p className="text-gray-600 mb-4">
            Fique por dentro das novidades da plataforma
          </p>
          <div className="flex gap-2 justify-center">
            <Button variant="outline" className="bg-white">
              📧 Newsletter
            </Button>
            <Button variant="outline" className="bg-white">
              🔔 Notificações
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
