// =====================================================
// SISTEMA DE PROTEÇÃO E MONITORAMENTO DO MIDDLEWARE
// YOOBE v3.1.0 - Middleware Protection System
// =====================================================

import { NextRequest, NextResponse } from 'next/server'
import { audit } from '@/lib/audit'
import { logErrorToCatalog } from '@/lib/points-utils'
import { ErrorMemorySystemEdge } from '@/lib/error-memory-edge'

export interface MiddlewareMetrics {
  totalRequests: number
  blockedRequests: number
  redirects: number
  errors: number
  averageResponseTime: number
  lastError?: {
    timestamp: string
    error: string
    path: string
  }
}

export interface MiddlewareConfig {
  enableMetrics: boolean
  enableAudit: boolean
  enableErrorLogging: boolean
  enableRateLimit: boolean
  maxRequestsPerMinute: number
  enableHealthCheck: boolean
  healthCheckInterval: number
}

export class MiddlewareProtectionSystem {
  private static instance: MiddlewareProtectionSystem
  private metrics: MiddlewareMetrics
  private config: MiddlewareConfig
  private errorMemory: ErrorMemorySystemEdge
  private requestCounts: Map<string, { count: number; resetTime: number }>
  private healthStatus: 'healthy' | 'degraded' | 'unhealthy'
  private lastHealthCheck: number

  private constructor() {
    this.metrics = {
      totalRequests: 0,
      blockedRequests: 0,
      redirects: 0,
      errors: 0,
      averageResponseTime: 0,
    }

    this.config = {
      enableMetrics: true,
      enableAudit: true,
      enableErrorLogging: true,
      enableRateLimit: true,
      maxRequestsPerMinute: 100,
      enableHealthCheck: true,
      healthCheckInterval: 60000, // 1 minuto
    }

    this.errorMemory = new ErrorMemorySystemEdge()
    this.requestCounts = new Map()
    this.healthStatus = 'healthy'
    this.lastHealthCheck = Date.now()

    // Iniciar health check automático
    if (this.config.enableHealthCheck) {
      this.startHealthCheck()
    }
  }

  public static getInstance(): MiddlewareProtectionSystem {
    if (!MiddlewareProtectionSystem.instance) {
      MiddlewareProtectionSystem.instance = new MiddlewareProtectionSystem()
    }
    return MiddlewareProtectionSystem.instance
  }

  /**
   * Wrapper principal para middleware com proteção
   */
  public async protectMiddleware(
    request: NextRequest,
    middlewareFunction: (
      req: NextRequest
    ) => NextResponse | Promise<NextResponse>
  ): Promise<NextResponse> {
    const startTime = Date.now()
    const path = request.nextUrl.pathname
    const ip = this.getClientIP(request)

    try {
      // Verificar rate limit
      if (this.config.enableRateLimit && !this.checkRateLimit(ip)) {
        this.metrics.blockedRequests++
        await this.logSecurityEvent('rate_limit_exceeded', path, ip)
        return NextResponse.json(
          { error: 'Rate limit exceeded' },
          { status: 429 }
        )
      }

      // Verificar health status
      if (this.healthStatus === 'unhealthy') {
        await this.logSecurityEvent('middleware_unhealthy', path, ip)
        return NextResponse.json(
          { error: 'Service temporarily unavailable' },
          { status: 503 }
        )
      }

      // Executar middleware original
      const response = await middlewareFunction(request)

      // Atualizar métricas
      this.updateMetrics(startTime, response, path)

      // Log de auditoria
      if (this.config.enableAudit) {
        await this.logAuditEvent(request, response, startTime)
      }

      return response
    } catch (error) {
      this.metrics.errors++
      const responseTime = Date.now() - startTime

      // Log de erro
      if (this.config.enableErrorLogging) {
        await this.logError(error as Error, path, ip, responseTime)
      }

      // Atualizar status de saúde
      this.updateHealthStatus('error')

      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }
  }

  /**
   * Verificar rate limit por IP
   */
  private checkRateLimit(ip: string): boolean {
    const now = Date.now()
    const windowMs = 60000 // 1 minuto
    const current = this.requestCounts.get(ip)

    if (!current || now > current.resetTime) {
      this.requestCounts.set(ip, {
        count: 1,
        resetTime: now + windowMs,
      })
      return true
    }

    if (current.count >= this.config.maxRequestsPerMinute) {
      return false
    }

    current.count++
    return true
  }

  /**
   * Atualizar métricas
   */
  private updateMetrics(
    startTime: number,
    response: NextResponse,
    path: string
  ): void {
    if (!this.config.enableMetrics) return

    this.metrics.totalRequests++

    if (response.status >= 300 && response.status < 400) {
      this.metrics.redirects++
    }

    if (response.status >= 400) {
      this.metrics.blockedRequests++
    }

    // Calcular tempo de resposta médio
    const responseTime = Date.now() - startTime
    this.metrics.averageResponseTime =
      (this.metrics.averageResponseTime + responseTime) / 2
  }

  /**
   * Log de eventos de segurança
   */
  private async logSecurityEvent(
    event: string,
    path: string,
    ip: string
  ): Promise<void> {
    try {
      await audit('middleware_security', 'middleware', 'system', undefined, {
        event,
        path,
        ip,
        timestamp: new Date().toISOString(),
        userAgent: 'middleware-protection',
      })
    } catch (error) {
      console.error('Erro ao registrar evento de segurança:', error)
    }
  }

  /**
   * Log de auditoria
   */
  private async logAuditEvent(
    request: NextRequest,
    response: NextResponse,
    startTime: number
  ): Promise<void> {
    try {
      const responseTime = Date.now() - startTime

      await audit('middleware_request', 'middleware', 'system', undefined, {
        path: request.nextUrl.pathname,
        method: request.method,
        status: response.status,
        responseTime,
        userAgent: request.headers.get('user-agent'),
        ip: this.getClientIP(request),
        timestamp: new Date().toISOString(),
      })
    } catch (error) {
      console.error('Erro ao registrar auditoria:', error)
    }
  }

  /**
   * Log de erros
   */
  private async logError(
    error: Error,
    path: string,
    ip: string,
    responseTime: number
  ): Promise<void> {
    try {
      // Registrar no catálogo de erros
      await logErrorToCatalog('middleware_error', path, error, {
        ip,
        responseTime,
        timestamp: new Date().toISOString(),
        userAgent: 'middleware-protection',
      })

      // Registrar na memória de erros
      this.errorMemory.addError({
        id: `middleware_${Date.now()}`,
        errorType: 'api_error',
        title: 'Middleware Error',
        description: error.message,
        errorMessage: error.message,
        solution: 'Verificar logs e implementar tratamento adequado',
        codeSnippet: error.stack || '',
        filePath: 'middleware.ts',
        timestamp: new Date(),
        tags: ['middleware', 'error', 'protection'],
        severity: 'high',
        resolved: false,
        developer: 'Middleware Protection System',
        relatedErrors: [],
        preventionSteps: [
          'Implementar try-catch adequado',
          'Verificar configurações do middleware',
          'Monitorar métricas de performance',
        ],
        documentationLinks: [],
      })

      // Atualizar métricas de erro
      this.metrics.lastError = {
        timestamp: new Date().toISOString(),
        error: error.message,
        path,
      }
    } catch (logError) {
      console.error('Erro ao registrar erro do middleware:', logError)
    }
  }

  /**
   * Atualizar status de saúde
   */
  private updateHealthStatus(
    status: 'healthy' | 'degraded' | 'unhealthy' | 'error'
  ): void {
    if (status === 'error') {
      this.healthStatus = 'unhealthy'
    } else if (status === 'degraded' && this.healthStatus === 'healthy') {
      this.healthStatus = 'degraded'
    } else if (status === 'healthy' && this.healthStatus !== 'unhealthy') {
      this.healthStatus = 'healthy'
    }
  }

  /**
   * Health check automático
   */
  private startHealthCheck(): void {
    setInterval(() => {
      this.performHealthCheck()
    }, this.config.healthCheckInterval)
  }

  /**
   * Executar health check
   */
  private async performHealthCheck(): Promise<void> {
    try {
      const now = Date.now()

      // Verificar se há muitos erros recentes
      const recentErrors = this.metrics.errors
      const errorRate = recentErrors / Math.max(this.metrics.totalRequests, 1)

      if (errorRate > 0.1) {
        // Mais de 10% de erro
        this.healthStatus = 'unhealthy'
      } else if (errorRate > 0.05) {
        // Mais de 5% de erro
        this.healthStatus = 'degraded'
      } else {
        this.healthStatus = 'healthy'
      }

      // Verificar tempo de resposta médio
      if (this.metrics.averageResponseTime > 5000) {
        // Mais de 5 segundos
        this.healthStatus = 'degraded'
      }

      this.lastHealthCheck = now

      // Log do health check
      await audit(
        'middleware_health_check',
        'middleware',
        'system',
        undefined,
        {
          status: this.healthStatus,
          errorRate,
          averageResponseTime: this.metrics.averageResponseTime,
          totalRequests: this.metrics.totalRequests,
          timestamp: new Date().toISOString(),
        }
      )
    } catch (error) {
      console.error('Erro no health check do middleware:', error)
      this.healthStatus = 'unhealthy'
    }
  }

  /**
   * Obter IP do cliente
   */
  private getClientIP(request: NextRequest): string {
    const forwarded = request.headers.get('x-forwarded-for')
    const realIP = request.headers.get('x-real-ip')

    if (forwarded) {
      return forwarded.split(',')[0].trim()
    }

    if (realIP) {
      return realIP
    }

    return 'unknown'
  }

  /**
   * Obter métricas atuais
   */
  public getMetrics(): MiddlewareMetrics {
    return { ...this.metrics }
  }

  /**
   * Obter status de saúde
   */
  public getHealthStatus(): {
    status: 'healthy' | 'degraded' | 'unhealthy'
    lastCheck: number
    metrics: MiddlewareMetrics
  } {
    return {
      status: this.healthStatus,
      lastCheck: this.lastHealthCheck,
      metrics: this.getMetrics(),
    }
  }

  /**
   * Resetar métricas
   */
  public resetMetrics(): void {
    this.metrics = {
      totalRequests: 0,
      blockedRequests: 0,
      redirects: 0,
      errors: 0,
      averageResponseTime: 0,
    }
    this.requestCounts.clear()
  }

  /**
   * Atualizar configuração
   */
  public updateConfig(newConfig: Partial<MiddlewareConfig>): void {
    this.config = { ...this.config, ...newConfig }
  }
}

// Instância singleton
export const middlewareProtection = MiddlewareProtectionSystem.getInstance()

// Função helper para usar no middleware
export function withMiddlewareProtection(
  middlewareFunction: (req: NextRequest) => NextResponse | Promise<NextResponse>
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    return middlewareProtection.protectMiddleware(request, middlewareFunction)
  }
}
