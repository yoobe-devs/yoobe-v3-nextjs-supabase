import { NextRequest, NextResponse } from 'next/server'
import { middlewareProtection } from '@/lib/middleware-protection'
import { mcpMonitoring } from '@/lib/mcp-monitoring'

export async function GET(request: NextRequest) {
  try {
    const timestamp = new Date().toISOString()

    // Métricas básicas sem autenticação
    let middlewareMetrics = null
    let mcpMetrics = null
    let activeOperations = []

    try {
      middlewareMetrics = middlewareProtection.getMetrics()
    } catch (error) {
      console.warn('Erro ao obter métricas do middleware:', error)
    }

    try {
      mcpMetrics = mcpMonitoring.getAllMetrics()
      activeOperations = mcpMonitoring.getActiveOperations()
    } catch (error) {
      console.warn('Erro ao obter métricas dos MCPs:', error)
    }

    // Calcular estatísticas básicas
    const totalRequests = middlewareMetrics?.totalRequests || 0
    const totalErrors = middlewareMetrics?.errors || 0
    const errorRate =
      totalRequests > 0 ? (totalErrors / totalRequests) * 100 : 0

    const metricsData = {
      timestamp,
      summary: {
        totalRequests,
        totalErrors,
        errorRate: Math.round(errorRate * 100) / 100,
        activeOperations: activeOperations.length,
        uptime: process.uptime(),
      },
      middleware: middlewareMetrics || { status: 'unavailable' },
      mcps: mcpMetrics
        ? Object.fromEntries(mcpMetrics)
        : { status: 'unavailable' },
      activeOperations: activeOperations.map(op => ({
        id: op.id,
        mcpName: op.mcpName,
        operation: op.operation,
        duration: Date.now() - op.startTime,
      })),
    }

    return NextResponse.json(metricsData)
  } catch (error: any) {
    console.error('Erro ao obter métricas:', error)

    return NextResponse.json(
      {
        timestamp: new Date().toISOString(),
        error: 'Erro ao obter métricas',
        details: error.message,
      },
      { status: 500 }
    )
  }
}

