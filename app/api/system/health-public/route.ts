import { NextRequest, NextResponse } from 'next/server'
import { middlewareProtection } from '@/lib/middleware-protection'
import { mcpMonitoring } from '@/lib/mcp-monitoring'

export async function GET(request: NextRequest) {
  try {
    // Health check público - sem autenticação
    const timestamp = new Date().toISOString()

    // Verificar se os sistemas estão funcionando
    let middlewareStatus = 'unknown'
    let mcpStatus = 'unknown'
    let overallStatus = 'healthy'

    try {
      const middlewareHealth = middlewareProtection.getHealthStatus()
      middlewareStatus = middlewareHealth.status
    } catch (error) {
      console.warn('Erro ao obter status do middleware:', error)
      middlewareStatus = 'error'
      overallStatus = 'degraded'
    }

    try {
      const mcpHealth = mcpMonitoring.getOverallStatus()
      mcpStatus = mcpHealth.overall || 'healthy'
    } catch (error) {
      console.warn('Erro ao obter status dos MCPs:', error)
      mcpStatus = 'error'
      overallStatus = 'degraded'
    }

    // Se ambos estão com erro, sistema está unhealthy
    if (middlewareStatus === 'error' && mcpStatus === 'error') {
      overallStatus = 'unhealthy'
    }

    const healthData = {
      timestamp,
      status: overallStatus,
      services: {
        middleware: {
          status: middlewareStatus,
          available: middlewareStatus !== 'error',
        },
        mcps: {
          status: mcpStatus,
          available: mcpStatus !== 'error',
        },
      },
      uptime: process.uptime(),
      version: '3.1.0',
      environment: process.env.NODE_ENV || 'development',
    }

    return NextResponse.json(healthData, {
      status: overallStatus === 'unhealthy' ? 503 : 200,
    })
  } catch (error: any) {
    console.error('Erro crítico no health check:', error)

    return NextResponse.json(
      {
        timestamp: new Date().toISOString(),
        status: 'unhealthy',
        error: 'Sistema indisponível',
        details: error.message,
      },
      { status: 503 }
    )
  }
}

