import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET() {
  try {
    const startTime = Date.now()

    // Verificar conexão com Supabase
    const supabase = createRouteHandlerClient({ cookies })
    // Considerar OK se a consulta simples à tabela pública não lançar erro crítico
    const { error } = await supabase.from('companies').select('id').limit(1)
    const dbStatus =
      error && String(error.message || '').includes('connection')
        ? 'error'
        : 'ok'
    const responseTime = Date.now() - startTime

    const health = {
      ok: true,
      version: process.env.npm_package_version || '3.3.0',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      services: {
        database: {
          status: dbStatus,
          responseTime: `${responseTime}ms`,
        },
        supabase: {
          url: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'configured' : 'missing',
          serviceRole: process.env.SUPABASE_SERVICE_ROLE_KEY
            ? 'configured'
            : 'missing',
        },
      },
      system: {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
        memory: {
          used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
          total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
          unit: 'MB',
        },
      },
    }

    // Em desenvolvimento, não derrubar health por erro leve; em produção, 503
    if (dbStatus === 'error') {
      health.ok = false
      const status = process.env.NODE_ENV === 'production' ? 503 : 200
      return NextResponse.json(health, { status })
    }

    return NextResponse.json(health, {
      status: 200,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        Pragma: 'no-cache',
        Expires: '0',
      },
    })
  } catch (error) {
    console.error('Health check error:', error)

    return NextResponse.json(
      {
        ok: false,
        version: process.env.npm_package_version || '3.3.0',
        timestamp: new Date().toISOString(),
        error: 'Health check failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 503 }
    )
  }
}
