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
            error: 'Permissão insuficiente para acessar métricas',
          },
          { status: 403 }
        )
      }
    }

    // Obter métricas do middleware
    const middlewareMetrics = middlewareProtection.getMetrics()

    // Obter métricas dos MCPs
    const mcpMetrics = mcpMonitoring.getAllMetrics()

    // Obter operações ativas
    const activeOperations = mcpMonitoring.getActiveOperations()

    // Calcular estatísticas gerais
    const totalRequests = middlewareMetrics.totalRequests
    const totalMCPRequests = Array.from(mcpMetrics.values()).reduce(
      (sum, metrics) => sum + metrics.totalRequests,
      0
    )

    const totalErrors =
      middlewareMetrics.errors +
      Array.from(mcpMetrics.values()).reduce(
        (sum, metrics) => sum + metrics.failedRequests,
        0
      )

    const errorRate =
      totalRequests > 0 ? (totalErrors / totalRequests) * 100 : 0

    const metricsData = {
      timestamp: new Date().toISOString(),
      summary: {
        totalRequests,
        totalMCPRequests,
        totalErrors,
        errorRate: Math.round(errorRate * 100) / 100,
        activeOperations: activeOperations.length,
      },
      middleware: middlewareMetrics,
      mcps: Object.fromEntries(mcpMetrics),
      activeOperations: activeOperations.map(op => ({
        id: op.id,
        mcpName: op.mcpName,
        operation: op.operation,
        duration: Date.now() - op.startTime,
        metadata: op.metadata,
      })),
    }

    return NextResponse.json({
      success: true,
      data: metricsData,
    })
  } catch (error: any) {
    console.error('Erro ao obter métricas:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Erro interno do servidor',
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticação e permissões (apenas admin)
    const { userId, companyId } = await requireUser()

    if (companyId) {
      const canAccess = await requireRole(userId, companyId, 'admin')
      if (!canAccess) {
        return NextResponse.json(
          {
            success: false,
            error: 'Permissão insuficiente para resetar métricas',
          },
          { status: 403 }
        )
      }
    }

    const body = await request.json()
    const { action, target } = body

    switch (action) {
      case 'reset_middleware':
        middlewareProtection.resetMetrics()
        break

      case 'reset_mcp':
        if (target) {
          mcpMonitoring.resetMCPMetrics(target)
        } else {
          mcpMonitoring.resetAllMetrics()
        }
        break

      case 'cleanup_operations':
        mcpMonitoring.cleanupOldOperations()
        break

      default:
        return NextResponse.json(
          {
            success: false,
            error: 'Ação não reconhecida',
          },
          { status: 400 }
        )
    }

    return NextResponse.json({
      success: true,
      message: `Ação ${action} executada com sucesso`,
    })
  } catch (error: any) {
    console.error('Erro ao executar ação nas métricas:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Erro interno do servidor',
      },
      { status: 500 }
    )
  }
}

