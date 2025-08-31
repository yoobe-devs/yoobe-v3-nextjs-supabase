import { NextRequest, NextResponse } from 'next/server'

interface ChangelogEntry {
  version: string
  date: string
  title: string
  description: string
  type: 'feature' | 'improvement' | 'fix' | 'security' | 'performance'
  items: string[]
}

const changelog: ChangelogEntry[] = [
  {
    version: '2.0.0',
    date: '2024-12-31',
    title: 'Sistema de Integrações Global',
    description: 'Implementação completa do sistema de integrações com Cubbo, gamificação e automação',
    type: 'feature',
    items: [
      'Integração Cubbo Global para fulfillment centralizado',
      'Sistema de integrações para gestores (ERP, CRM, Gamificação)',
      'Plataformas de gamificação: Workvivo, Applause, Human',
      'Automação: Zapier, Floui, Make',
      'ERPs/CRMs: SAP, Salesforce, Oracle',
      'Gestão de usuários: AD, Google Workspace, M365',
      'Visualização de produtos na loja pública',
      'Modais de edição completos para produtos e funcionários',
      'Sistema de estoque integrado com Cubbo',
      'Interface de gestor completamente funcional'
    ]
  },
  {
    version: '1.5.0',
    date: '2024-12-15',
    title: 'Sistema Básico de Gestão',
    description: 'Implementação do sistema básico de gestão de produtos e usuários',
    type: 'feature',
    items: [
      'Sistema básico de gestão de produtos',
      'Autenticação e autorização',
      'Interface básica de gestor',
      'Sistema de pontos'
    ]
  },
  {
    version: '1.0.0',
    date: '2024-12-01',
    title: 'Lançamento Inicial',
    description: 'Versão inicial da plataforma Yoobe',
    type: 'feature',
    items: [
      'Estrutura base da plataforma',
      'Sistema de autenticação',
      'Interface básica',
      'Banco de dados inicial'
    ]
  }
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const version = searchParams.get('version')
    const type = searchParams.get('type')
    const limit = searchParams.get('limit')

    let filteredChangelog = changelog

    // Filtrar por versão
    if (version) {
      filteredChangelog = filteredChangelog.filter(entry => entry.version === version)
    }

    // Filtrar por tipo
    if (type) {
      filteredChangelog = filteredChangelog.filter(entry => entry.type === type)
    }

    // Limitar resultados
    if (limit) {
      const limitNum = parseInt(limit)
      filteredChangelog = filteredChangelog.slice(0, limitNum)
    }

    return NextResponse.json({
      changelog: filteredChangelog,
      total: filteredChangelog.length,
      latest_version: changelog[0].version
    })

  } catch (error) {
    console.error('Erro na API de changelog:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
