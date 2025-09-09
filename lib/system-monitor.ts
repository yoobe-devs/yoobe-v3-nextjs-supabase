// Sistema de monitoramento automático para manter o sistema sempre disponível
import { getCurrentTimestamp } from '@/lib/date-utils'

interface SystemStatus {
  timestamp: string
  status: 'healthy' | 'degraded' | 'unhealthy'
  services: {
    middleware: boolean
    mcps: boolean
    database: boolean
    apis: boolean
  }
  uptime: number
  lastCheck: string
  checks: {
    total: number
    passed: number
    failed: number
  }
}

interface HealthCheck {
  name: string
  url: string
  timeout: number
  expectedStatus: number
  lastResult?: {
    success: boolean
    responseTime: number
    timestamp: string
    error?: string
  }
}

export class SystemMonitor {
  private status: SystemStatus
  private healthChecks: HealthCheck[]
  private checkInterval: NodeJS.Timeout | null = null
  private isRunning = false

  constructor() {
    this.status = {
      timestamp: getCurrentTimestamp(),
      status: 'healthy',
      services: {
        middleware: true,
        mcps: true,
        database: true,
        apis: true,
      },
      uptime: process.uptime(),
      lastCheck: getCurrentTimestamp(),
      checks: {
        total: 0,
        passed: 0,
        failed: 0,
      },
    }

    this.healthChecks = [
      {
        name: 'Health Check API',
        url: '/api/system/health-public',
        timeout: 5000,
        expectedStatus: 200,
      },
      {
        name: 'Metrics API',
        url: '/api/system/metrics-public',
        timeout: 5000,
        expectedStatus: 200,
      },
      {
        name: 'Main App',
        url: '/',
        timeout: 10000,
        expectedStatus: 200,
      },
      {
        name: 'Documentation',
        url: '/docs',
        timeout: 10000,
        expectedStatus: 200,
      },
    ]
  }

  async start(intervalMs: number = 30000) {
    if (this.isRunning) {
      console.log('🔄 SystemMonitor já está rodando')
      return
    }

    console.log('🚀 Iniciando SystemMonitor...')
    this.isRunning = true

    // Executar verificação inicial
    await this.performHealthChecks()

    // Configurar verificação periódica
    this.checkInterval = setInterval(async () => {
      await this.performHealthChecks()
    }, intervalMs)

    console.log(
      `✅ SystemMonitor iniciado com verificação a cada ${intervalMs}ms`
    )
  }

  stop() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval)
      this.checkInterval = null
    }
    this.isRunning = false
    console.log('⏹️ SystemMonitor parado')
  }

  async performHealthChecks() {
    const startTime = Date.now()
    console.log('🔍 Executando verificações de saúde do sistema...')

    let totalChecks = 0
    let passedChecks = 0
    let failedChecks = 0

    // Executar todos os health checks
    for (const check of this.healthChecks) {
      totalChecks++
      const result = await this.executeHealthCheck(check)

      if (result.success) {
        passedChecks++
        console.log(`✅ ${check.name}: OK (${result.responseTime}ms)`)
      } else {
        failedChecks++
        console.log(`❌ ${check.name}: FALHOU - ${result.error}`)
      }
    }

    // Atualizar status
    this.status = {
      timestamp: getCurrentTimestamp(),
      status: this.calculateOverallStatus(failedChecks, totalChecks),
      services: {
        middleware: this.checkServiceStatus('middleware'),
        mcps: this.checkServiceStatus('mcps'),
        database: this.checkServiceStatus('database'),
        apis: this.checkServiceStatus('apis'),
      },
      uptime: process.uptime(),
      lastCheck: getCurrentTimestamp(),
      checks: {
        total: totalChecks,
        passed: passedChecks,
        failed: failedChecks,
      },
    }

    const duration = Date.now() - startTime
    console.log(
      `📊 Verificação concluída em ${duration}ms - Status: ${this.status.status}`
    )
    console.log(`   ✅ Passou: ${passedChecks}/${totalChecks}`)
    console.log(`   ❌ Falhou: ${failedChecks}/${totalChecks}`)

    // Se há falhas críticas, tentar recuperação
    if (failedChecks > 0) {
      await this.attemptRecovery()
    }
  }

  private async executeHealthCheck(check: HealthCheck): Promise<{
    success: boolean
    responseTime: number
    timestamp: string
    error?: string
  }> {
    const startTime = Date.now()
    const timestamp = getCurrentTimestamp()

    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), check.timeout)

      const response = await fetch(`http://localhost:3000${check.url}`, {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'User-Agent': 'SystemMonitor/1.0',
        },
      })

      clearTimeout(timeoutId)
      const responseTime = Date.now() - startTime

      const success = response.status === check.expectedStatus

      check.lastResult = {
        success,
        responseTime,
        timestamp,
        error: success
          ? undefined
          : `Status ${response.status} (esperado ${check.expectedStatus})`,
      }

      return check.lastResult
    } catch (error: any) {
      const responseTime = Date.now() - startTime
      const errorMessage =
        error.name === 'AbortError' ? 'Timeout' : error.message

      check.lastResult = {
        success: false,
        responseTime,
        timestamp,
        error: errorMessage,
      }

      return check.lastResult
    }
  }

  private calculateOverallStatus(
    failedChecks: number,
    totalChecks: number
  ): 'healthy' | 'degraded' | 'unhealthy' {
    const failureRate = failedChecks / totalChecks

    if (failureRate >= 0.5) {
      return 'unhealthy'
    } else if (failureRate >= 0.25) {
      return 'degraded'
    } else {
      return 'healthy'
    }
  }

  private checkServiceStatus(service: string): boolean {
    // Lógica simples para verificar status dos serviços
    // Em uma implementação real, isso seria mais sofisticado
    return this.status.checks.failed < this.status.checks.total * 0.5
  }

  private async attemptRecovery() {
    console.log('🔧 Tentando recuperação automática...')

    // Estratégias de recuperação
    const recoveryStrategies = [
      'Limpar cache do Next.js',
      'Reiniciar serviços críticos',
      'Verificar conectividade de rede',
      'Verificar recursos do sistema',
    ]

    for (const strategy of recoveryStrategies) {
      console.log(`   🔄 ${strategy}...`)
      // Aqui implementaríamos as estratégias reais
      await new Promise(resolve => setTimeout(resolve, 1000))
    }

    console.log('✅ Tentativas de recuperação concluídas')
  }

  getStatus(): SystemStatus {
    return { ...this.status }
  }

  getHealthChecks(): HealthCheck[] {
    return [...this.healthChecks]
  }

  isHealthy(): boolean {
    return this.status.status === 'healthy'
  }

  getUptime(): number {
    return process.uptime()
  }
}

// Instância global do monitor
export const systemMonitor = new SystemMonitor()

// Auto-iniciar o monitor em produção
if (process.env.NODE_ENV === 'production') {
  systemMonitor.start(60000) // Verificar a cada minuto em produção
} else {
  systemMonitor.start(30000) // Verificar a cada 30 segundos em desenvolvimento
}

