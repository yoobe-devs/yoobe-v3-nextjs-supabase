import { NextRequest, NextResponse } from 'next/server'
import { middlewareProtection } from '@/lib/middleware-protection'
import { mcpMonitoring } from '@/lib/mcp-monitoring'
import { requireUser } from '@/lib/auth'
import { requireRole } from '@/lib/rbac'

export async function GET(request: NextRequest) {
  try {
    // Verificar autenticação e permissões (apenas admin)
    const { userId, companyId } = await requireUser()

    if (companyId) {
      const canAccess = await requireRole(userId, companyId, 'admin')
      if (!canAccess) {
        return NextResponse.json(
          {
            success: false,
            error: 'Permissão insuficiente para acessar health check',
          },
          { status: 403 }
        )
      }
    }

    // Obter status do middleware
    const middlewareHealth = middlewareProtection.getHealthStatus()

    // Obter status dos MCPs
    const mcpStatus = mcpMonitoring.getOverallStatus()
    const mcpMetrics = mcpMonitoring.getAllMetrics()

    // Calcular status geral do sistema
    const overallStatus = calculateOverallStatus(middlewareHealth, mcpStatus)

    const healthData = {
      timestamp: new Date().toISOString(),
      overall: overallStatus,
      middleware: {
        status: middlewareHealth.status,
        lastCheck: middlewareHealth.lastCheck,
        metrics: middlewareHealth.metrics,
      },
      mcps: {
        summary: mcpStatus,
        details: Object.fromEntries(mcpMetrics),
      },
      activeOperations: mcpMonitoring.getActiveOperations(),
    }

    return NextResponse.json({
      success: true,
      data: healthData,
    })
  } catch (error: any) {
    console.error('Erro no health check:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Erro interno do servidor',
        data: {
          timestamp: new Date().toISOString(),
          overall: 'unhealthy',
          error: error.message,
        },
      },
      { status: 500 }
    )
  }
}

function calculateOverallStatus(
  middlewareHealth: any,
  mcpStatus: any
): 'healthy' | 'degraded' | 'unhealthy' {
  // Se middleware está unhealthy, sistema está unhealthy
  if (middlewareHealth.status === 'unhealthy') {
    return 'unhealthy'
  }

  // Se há MCPs unhealthy, sistema está degraded
  if (mcpStatus.unhealthyMCPs > 0) {
    return 'degraded'
  }

  // Se há MCPs degraded, sistema está degraded
  if (mcpStatus.degradedMCPs > 0) {
    return 'degraded'
  }

  // Se middleware está degraded, sistema está degraded
  if (middlewareHealth.status === 'degraded') {
    return 'degraded'
  }

  return 'healthy'
}

