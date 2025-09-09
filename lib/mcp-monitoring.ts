// =====================================================
// SISTEMA DE MONITORAMENTO E PROTEÇÃO DE MCPs
// YOOBE v3.1.0 - MCP Monitoring System
// =====================================================

import { audit } from '@/lib/audit'
import { logErrorToCatalog } from '@/lib/points-utils'
import { ErrorMemorySystemEdge } from '@/lib/error-memory-edge'

export interface MCPConfig {
  name: string
  type:
    | 'docker'
    | 'context7'
    | 'gemini'
    | 'playwright'
    | 'spec-kit'
    | 'filesystem'
  enabled: boolean
  maxRequestsPerMinute: number
  timeout: number
  retryAttempts: number
  healthCheckInterval: number
}

export interface MCPMetrics {
  totalRequests: number
  successfulRequests: number
  failedRequests: number
  averageResponseTime: number
  lastError?: {
    timestamp: string
    error: string
    operation: string
  }
  healthStatus: 'healthy' | 'degraded' | 'unhealthy'
  lastHealthCheck: number
}

export interface MCPOperation {
  id: string
  mcpName: string
  operation: string
  startTime: number
  endTime?: number
  success?: boolean
  error?: string
  metadata?: Record<string, any>
}

export class MCPMonitoringSystem {
  private static instance: MCPMonitoringSystem
  private configs: Map<string, MCPConfig>
  private metrics: Map<string, MCPMetrics>
  private activeOperations: Map<string, MCPOperation>
  private errorMemory: ErrorMemorySystemEdge
  private healthCheckIntervals: Map<string, NodeJS.Timeout>

  private constructor() {
    this.configs = new Map()
    this.metrics = new Map()
    this.activeOperations = new Map()
    this.errorMemory = new ErrorMemorySystemEdge()
    this.healthCheckIntervals = new Map()

    this.initializeDefaultConfigs()
    this.startHealthChecks()
  }

  public static getInstance(): MCPMonitoringSystem {
    if (!MCPMonitoringSystem.instance) {
      MCPMonitoringSystem.instance = new MCPMonitoringSystem()
    }
    return MCPMonitoringSystem.instance
  }

  /**
   * Inicializar configurações padrão dos MCPs
   */
  private initializeDefaultConfigs(): void {
    const defaultConfigs: MCPConfig[] = [
      {
        name: 'MCP_DOCKER',
        type: 'docker',
        enabled: true,
        maxRequestsPerMinute: 50,
        timeout: 30000,
        retryAttempts: 3,
        healthCheckInterval: 60000,
      },
      {
        name: 'context7',
        type: 'context7',
        enabled: true,
        maxRequestsPerMinute: 100,
        timeout: 15000,
        retryAttempts: 2,
        healthCheckInterval: 30000,
      },
      {
        name: 'gemini-mcp-tool',
        type: 'gemini',
        enabled: true,
        maxRequestsPerMinute: 30,
        timeout: 45000,
        retryAttempts: 2,
        healthCheckInterval: 60000,
      },
      {
        name: 'playwright',
        type: 'playwright',
        enabled: true,
        maxRequestsPerMinute: 20,
        timeout: 60000,
        retryAttempts: 2,
        healthCheckInterval: 120000,
      },
      {
        name: 'spec-kit',
        type: 'spec-kit',
        enabled: true,
        maxRequestsPerMinute: 40,
        timeout: 20000,
        retryAttempts: 3,
        healthCheckInterval: 60000,
      },
      {
        name: 'yoobe-v3-filesystem',
        type: 'filesystem',
        enabled: true,
        maxRequestsPerMinute: 200,
        timeout: 10000,
        retryAttempts: 3,
        healthCheckInterval: 30000,
      },
    ]

    defaultConfigs.forEach(config => {
      this.configs.set(config.name, config)
      this.initializeMetrics(config.name)
    })
  }

  /**
   * Inicializar métricas para um MCP
   */
  private initializeMetrics(mcpName: string): void {
    this.metrics.set(mcpName, {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageResponseTime: 0,
      healthStatus: 'healthy',
      lastHealthCheck: Date.now(),
    })
  }

  /**
   * Iniciar health checks para todos os MCPs
   */
  private startHealthChecks(): void {
    this.configs.forEach((config, mcpName) => {
      if (config.enabled) {
        const interval = setInterval(() => {
          this.performHealthCheck(mcpName)
        }, config.healthCheckInterval)

        this.healthCheckIntervals.set(mcpName, interval)
      }
    })
  }

  /**
   * Executar health check para um MCP específico
   */
  private async performHealthCheck(mcpName: string): Promise<void> {
    try {
      const config = this.configs.get(mcpName)
      const metrics = this.metrics.get(mcpName)

      if (!config || !metrics) return

      // Verificar taxa de erro
      const errorRate =
        metrics.failedRequests / Math.max(metrics.totalRequests, 1)

      if (errorRate > 0.2) {
        // Mais de 20% de erro
        metrics.healthStatus = 'unhealthy'
      } else if (errorRate > 0.1) {
        // Mais de 10% de erro
        metrics.healthStatus = 'degraded'
      } else {
        metrics.healthStatus = 'healthy'
      }

      // Verificar tempo de resposta médio
      if (metrics.averageResponseTime > config.timeout * 0.8) {
        metrics.healthStatus = 'degraded'
      }

      metrics.lastHealthCheck = Date.now()

      // Log do health check
      await audit('mcp_health_check', 'mcp', 'system', undefined, {
        mcpName,
        status: metrics.healthStatus,
        errorRate,
        averageResponseTime: metrics.averageResponseTime,
        totalRequests: metrics.totalRequests,
        timestamp: new Date().toISOString(),
      })
    } catch (error) {
      console.error(`Erro no health check do MCP ${mcpName}:`, error)
      const metrics = this.metrics.get(mcpName)
      if (metrics) {
        metrics.healthStatus = 'unhealthy'
      }
    }
  }

  /**
   * Iniciar operação MCP
   */
  public startOperation(
    mcpName: string,
    operation: string,
    metadata?: Record<string, any>
  ): string {
    const operationId = `${mcpName}_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`

    const mcpOperation: MCPOperation = {
      id: operationId,
      mcpName,
      operation,
      startTime: Date.now(),
      metadata,
    }

    this.activeOperations.set(operationId, mcpOperation)

    // Log de início da operação
    audit('mcp_operation_start', 'mcp', 'system', undefined, {
      operationId,
      mcpName,
      operation,
      metadata,
      timestamp: new Date().toISOString(),
    }).catch(error => {
      console.error('Erro ao registrar início da operação MCP:', error)
    })

    return operationId
  }

  /**
   * Finalizar operação MCP
   */
  public async finishOperation(
    operationId: string,
    success: boolean,
    error?: string,
    responseTime?: number
  ): Promise<void> {
    const operation = this.activeOperations.get(operationId)
    if (!operation) return

    operation.endTime = Date.now()
    operation.success = success
    operation.error = error

    const actualResponseTime =
      responseTime || operation.endTime - operation.startTime

    // Atualizar métricas
    await this.updateMetrics(
      operation.mcpName,
      success,
      actualResponseTime,
      error
    )

    // Remover operação ativa
    this.activeOperations.delete(operationId)

    // Log de finalização da operação
    await audit('mcp_operation_finish', 'mcp', 'system', undefined, {
      operationId,
      mcpName: operation.mcpName,
      operation: operation.operation,
      success,
      responseTime: actualResponseTime,
      error,
      timestamp: new Date().toISOString(),
    })
  }

  /**
   * Atualizar métricas do MCP
   */
  private async updateMetrics(
    mcpName: string,
    success: boolean,
    responseTime: number,
    error?: string
  ): Promise<void> {
    const metrics = this.metrics.get(mcpName)
    if (!metrics) return

    metrics.totalRequests++

    if (success) {
      metrics.successfulRequests++
    } else {
      metrics.failedRequests++

      // Registrar erro
      if (error) {
        metrics.lastError = {
          timestamp: new Date().toISOString(),
          error,
          operation: 'unknown',
        }

        await this.logMCPError(mcpName, error, responseTime)
      }
    }

    // Atualizar tempo de resposta médio
    metrics.averageResponseTime =
      (metrics.averageResponseTime + responseTime) / 2
  }

  /**
   * Log de erro do MCP
   */
  private async logMCPError(
    mcpName: string,
    error: string,
    responseTime: number
  ): Promise<void> {
    try {
      // Registrar no catálogo de erros
      await logErrorToCatalog(
        'mcp_error',
        `/mcp/${mcpName}`,
        new Error(error),
        {
          mcpName,
          responseTime,
          timestamp: new Date().toISOString(),
        }
      )

      // Registrar na memória de erros
      this.errorMemory.addError({
        id: `mcp_${mcpName}_${Date.now()}`,
        errorType: 'api_error',
        title: `MCP ${mcpName} Error`,
        description: error,
        errorMessage: error,
        solution: 'Verificar configuração e conectividade do MCP',
        codeSnippet: `MCP: ${mcpName}\nError: ${error}`,
        filePath: `mcp/${mcpName}`,
        timestamp: new Date(),
        tags: ['mcp', 'error', 'monitoring'],
        severity: 'medium',
        resolved: false,
        developer: 'MCP Monitoring System',
        relatedErrors: [],
        preventionSteps: [
          'Verificar configuração do MCP',
          'Testar conectividade',
          'Verificar logs de erro',
          'Implementar retry logic',
        ],
        documentationLinks: [
          'docs/MCP_COMPLETE_GUIDE.md',
          'docs/MCP_INTEGRATION_GUIDE.md',
        ],
      })
    } catch (logError) {
      console.error('Erro ao registrar erro do MCP:', logError)
    }
  }

  /**
   * Verificar se MCP está disponível
   */
  public isMCPAvailable(mcpName: string): boolean {
    const config = this.configs.get(mcpName)
    const metrics = this.metrics.get(mcpName)

    return config?.enabled === true && metrics?.healthStatus !== 'unhealthy'
  }

  /**
   * Obter métricas de um MCP
   */
  public getMCPMetrics(mcpName: string): MCPMetrics | undefined {
    return this.metrics.get(mcpName)
  }

  /**
   * Obter métricas de todos os MCPs
   */
  public getAllMetrics(): Map<string, MCPMetrics> {
    return new Map(this.metrics)
  }

  /**
   * Obter operações ativas
   */
  public getActiveOperations(): MCPOperation[] {
    return Array.from(this.activeOperations.values())
  }

  /**
   * Obter status geral dos MCPs
   */
  public getOverallStatus(): {
    totalMCPs: number
    healthyMCPs: number
    degradedMCPs: number
    unhealthyMCPs: number
    activeOperations: number
  } {
    let healthy = 0
    let degraded = 0
    let unhealthy = 0

    this.metrics.forEach(metrics => {
      switch (metrics.healthStatus) {
        case 'healthy':
          healthy++
          break
        case 'degraded':
          degraded++
          break
        case 'unhealthy':
          unhealthy++
          break
      }
    })

    return {
      totalMCPs: this.metrics.size,
      healthyMCPs: healthy,
      degradedMCPs: degraded,
      unhealthyMCPs: unhealthy,
      activeOperations: this.activeOperations.size,
    }
  }

  /**
   * Atualizar configuração de um MCP
   */
  public updateMCPConfig(mcpName: string, newConfig: Partial<MCPConfig>): void {
    const currentConfig = this.configs.get(mcpName)
    if (currentConfig) {
      const updatedConfig = { ...currentConfig, ...newConfig }
      this.configs.set(mcpName, updatedConfig)

      // Reiniciar health check se necessário
      if (newConfig.healthCheckInterval) {
        const currentInterval = this.healthCheckIntervals.get(mcpName)
        if (currentInterval) {
          clearInterval(currentInterval)
        }

        const newInterval = setInterval(() => {
          this.performHealthCheck(mcpName)
        }, newConfig.healthCheckInterval)

        this.healthCheckIntervals.set(mcpName, newInterval)
      }
    }
  }

  /**
   * Resetar métricas de um MCP
   */
  public resetMCPMetrics(mcpName: string): void {
    this.initializeMetrics(mcpName)
  }

  /**
   * Resetar todas as métricas
   */
  public resetAllMetrics(): void {
    this.metrics.clear()
    this.configs.forEach((_, mcpName) => {
      this.initializeMetrics(mcpName)
    })
  }

  /**
   * Limpar operações antigas
   */
  public cleanupOldOperations(): void {
    const now = Date.now()
    const maxAge = 300000 // 5 minutos

    this.activeOperations.forEach((operation, operationId) => {
      if (now - operation.startTime > maxAge) {
        this.activeOperations.delete(operationId)
      }
    })
  }
}

// Instância singleton
export const mcpMonitoring = MCPMonitoringSystem.getInstance()

// Função helper para monitorar operações MCP
export function withMCPMonitoring<T extends any[], R>(
  mcpName: string,
  operation: string,
  fn: (...args: T) => Promise<R>
) {
  return async (...args: T): Promise<R> => {
    const operationId = mcpMonitoring.startOperation(mcpName, operation)

    try {
      const result = await fn(...args)
      await mcpMonitoring.finishOperation(operationId, true)
      return result
    } catch (error) {
      await mcpMonitoring.finishOperation(
        operationId,
        false,
        error instanceof Error ? error.message : String(error)
      )
      throw error
    }
  }
}
