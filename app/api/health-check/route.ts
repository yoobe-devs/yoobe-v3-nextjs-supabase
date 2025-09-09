import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { performance } from 'perf_hooks'
import os from 'os'

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321'
const serviceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

const supabase = createClient(supabaseUrl, serviceKey)

export async function GET(request: NextRequest) {
  const startTime = performance.now()

  try {
    // Verificar conectividade com o banco
    const dbStartTime = performance.now()
    const { data: dbTest, error: dbError } = await supabase
      .from('companies')
      .select('id')
      .limit(1)
    const dbResponseTime = performance.now() - dbStartTime

    // Verificar serviços
    const services = {
      database: {
        status: dbError ? 'unhealthy' : 'healthy',
        responseTime: Math.round(dbResponseTime),
        error: dbError?.message,
      },
      api: {
        status: 'healthy',
        responseTime: Math.round(performance.now() - startTime),
      },
      realtime: {
        status: 'healthy', // Assumindo que está funcionando
      },
    }

    // Determinar status geral
    const overallStatus = Object.values(services).every(
      service => service.status === 'healthy'
    )
      ? 'healthy'
      : 'degraded'

    // Métricas do sistema
    const memUsage = process.memoryUsage()
    const systemMetrics = {
      memory: {
        rss: Math.round(memUsage.rss / 1024 / 1024), // MB
        heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024), // MB
        heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024), // MB
        external: Math.round(memUsage.external / 1024 / 1024), // MB
      },
      uptime: Math.round(process.uptime()),
      loadAverage: os.loadavg(),
      freeMemory: Math.round(os.freemem() / 1024 / 1024), // MB
      totalMemory: Math.round(os.totalmem() / 1024 / 1024), // MB
    }

    return NextResponse.json(
      {
        status: overallStatus,
        timestamp: new Date().toISOString(),
        responseTime: Math.round(performance.now() - startTime),
        services,
        system: systemMetrics,
        version: process.env.npm_package_version || '1.0.0',
      },
      {
        status: overallStatus === 'healthy' ? 200 : 503,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          Pragma: 'no-cache',
          Expires: '0',
        },
      }
    )
  } catch (error) {
    console.error('Health check error:', error)

    return NextResponse.json(
      {
        status: 'error',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
        responseTime: Math.round(performance.now() - startTime),
      },
      {
        status: 500,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
      }
    )
  }
}