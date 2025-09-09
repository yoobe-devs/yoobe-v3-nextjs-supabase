import { NextRequest, NextResponse } from 'next/server'
import { systemMonitor } from '@/lib/system-monitor'

export async function GET(request: NextRequest) {
  try {
    const status = systemMonitor.getStatus()
    const healthChecks = systemMonitor.getHealthChecks()

    const response = {
      ...status,
      healthChecks: healthChecks.map(check => ({
        name: check.name,
        url: check.url,
        lastResult: check.lastResult,
      })),
      isHealthy: systemMonitor.isHealthy(),
      uptime: systemMonitor.getUptime(),
    }

    return NextResponse.json(response)
  } catch (error: any) {
    console.error('Erro ao obter status do sistema:', error)

    return NextResponse.json(
      {
        timestamp: new Date().toISOString(),
        status: 'error',
        error: 'Erro ao obter status do sistema',
        details: error.message,
      },
      { status: 500 }
    )
  }
}

