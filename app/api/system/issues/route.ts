import { NextRequest, NextResponse } from 'next/server'
import { systemMonitor } from '@/lib/system-monitor'

export async function GET(request: NextRequest) {
  try {
    const timestamp = new Date().toISOString()

    // Obter status do sistema
    const status = systemMonitor.getStatus()
    const healthChecks = systemMonitor.getHealthChecks()

    // Identificar problemas baseados no status
    const issues = []

    // Verificar health checks falhados
    const failedChecks = healthChecks.filter(
      check => check.lastResult && !check.lastResult.success
    )

    if (failedChecks.length > 0) {
      issues.push({
        id: 'failed_health_checks',
        type: 'error',
        severity: 'high',
        title: 'Health Checks Falharam',
        description: `${failedChecks.length} health check(s) falharam`,
        details: failedChecks.map(check => ({
          name: check.name,
          url: check.url,
          error: check.lastResult?.error,
          lastCheck: check.lastResult?.timestamp,
        })),
        timestamp,
      })
    }

    // Verificar se há muitos erros
    if (status.checks.failed > 0) {
      issues.push({
        id: 'system_errors',
        type: 'warning',
        severity: status.checks.failed > 2 ? 'high' : 'medium',
        title: 'Erros no Sistema',
        description: `${status.checks.failed} verificação(ões) falharam`,
        details: {
          totalChecks: status.checks.total,
          passedChecks: status.checks.passed,
          failedChecks: status.checks.failed,
          failureRate:
            ((status.checks.failed / status.checks.total) * 100).toFixed(2) +
            '%',
        },
        timestamp,
      })
    }

    // Verificar status geral do sistema
    if (status.status === 'unhealthy') {
      issues.push({
        id: 'system_unhealthy',
        type: 'critical',
        severity: 'critical',
        title: 'Sistema Não Saudável',
        description: 'O sistema está em estado não saudável',
        details: {
          overallStatus: status.status,
          services: status.services,
          uptime: status.uptime,
        },
        timestamp,
      })
    } else if (status.status === 'degraded') {
      issues.push({
        id: 'system_degraded',
        type: 'warning',
        severity: 'medium',
        title: 'Sistema Degradado',
        description: 'O sistema está funcionando com limitações',
        details: {
          overallStatus: status.status,
          services: status.services,
          uptime: status.uptime,
        },
        timestamp,
      })
    }

    // Verificar serviços específicos
    Object.entries(status.services).forEach(([service, isHealthy]) => {
      if (!isHealthy) {
        issues.push({
          id: `service_${service}_down`,
          type: 'error',
          severity: 'high',
          title: `Serviço ${service} Inativo`,
          description: `O serviço ${service} não está respondendo`,
          details: {
            service,
            status: isHealthy ? 'healthy' : 'unhealthy',
            lastCheck: status.lastCheck,
          },
          timestamp,
        })
      }
    })

    // Problemas conhecidos (baseados na memória de erros)
    const knownIssues = [
      {
        id: 'edge_runtime_error',
        type: 'error',
        severity: 'high',
        title: 'Edge Runtime Error',
        description: 'lib/error-memory.ts não é compatível com Edge Runtime',
        details: {
          error: 'The edge runtime does not support Node.js modules (fs, path)',
          file: 'lib/error-memory.ts',
          solution: 'Usando ErrorMemorySystemEdge como alternativa',
        },
        timestamp,
        resolved: false,
      },
      {
        id: 'documentation_jsx_errors',
        type: 'warning',
        severity: 'low',
        title: 'Erros de Sintaxe JSX na Documentação',
        description: 'Algumas páginas de documentação tinham erros de sintaxe',
        details: {
          affectedPages: ['WALLET_SYSTEM', 'USER_MANAGEMENT'],
          error: 'JSX syntax errors and missing imports',
          solution: 'Páginas corrigidas e funcionando',
        },
        timestamp,
        resolved: true,
      },
    ]

    // Adicionar problemas conhecidos
    issues.push(...knownIssues)

    // Calcular estatísticas
    const stats = {
      total: issues.length,
      critical: issues.filter(i => i.severity === 'critical').length,
      high: issues.filter(i => i.severity === 'high').length,
      medium: issues.filter(i => i.severity === 'medium').length,
      low: issues.filter(i => i.severity === 'low').length,
      resolved: issues.filter(i => i.resolved === true).length,
      unresolved: issues.filter(i => i.resolved !== true).length,
    }

    const response = {
      timestamp,
      systemStatus: status.status,
      stats,
      issues: issues.sort((a, b) => {
        const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 }
        return severityOrder[a.severity] - severityOrder[b.severity]
      }),
      summary: {
        healthy: stats.critical === 0 && stats.high === 0,
        needsAttention: stats.critical > 0 || stats.high > 0,
        overallHealth:
          stats.critical > 0
            ? 'critical'
            : stats.high > 0
            ? 'degraded'
            : 'healthy',
      },
    }

    return NextResponse.json(response)
  } catch (error: any) {
    console.error('Erro ao obter issues do sistema:', error)

    return NextResponse.json(
      {
        timestamp: new Date().toISOString(),
        error: 'Erro ao obter issues do sistema',
        details: error.message,
        issues: [],
        stats: {
          total: 0,
          critical: 0,
          high: 0,
          medium: 0,
          low: 0,
          resolved: 0,
          unresolved: 0,
        },
      },
      { status: 500 }
    )
  }
}

