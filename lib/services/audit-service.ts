// =====================================================
// SERVIÇO DE AUDITORIA
// YOOBE v3.0.0 - Audit Service
// =====================================================

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import {
  AuditLog,
  AuditLogFilters,
  PaginationParams,
  AuditConfig,
} from '@/types/cart'

export class AuditService {
  private supabase = createClientComponentClient()

  // =====================================================
  // FUNÇÕES PRINCIPAIS DE AUDITORIA
  // =====================================================

  /**
   * Registra uma ação de auditoria
   */
  async logAction(
    tenantId: string,
    action: string,
    tableName: string,
    recordId?: string,
    oldValues?: Record<string, any>,
    newValues?: Record<string, any>,
    metadata?: Record<string, any>
  ): Promise<AuditLog> {
    const {
      data: { user },
    } = await this.supabase.auth.getUser()

    // Obter informações do usuário e contexto
    const userAgent =
      typeof window !== 'undefined' ? window.navigator.userAgent : undefined
    const ipAddress = metadata?.ip_address || 'unknown'

    // Criar log de auditoria
    const { data: log, error } = await this.supabase
      .from('audit_logs')
      .insert({
        tenant_id: tenantId,
        user_id: user?.id || null,
        action,
        table_name: tableName,
        record_id: recordId,
        old_values: oldValues,
        new_values: newValues,
        ip_address: this.shouldLogIP() ? ipAddress : null,
        user_agent: this.shouldLogUserAgent() ? userAgent : null,
        metadata: {
          ...metadata,
          timestamp: new Date().toISOString(),
          session_id: metadata?.session_id,
        },
      })
      .select()
      .single()

    if (error) {
      console.error('Erro ao registrar log de auditoria:', error)
      // Não falhar a operação principal por erro de auditoria
      throw new Error(`Erro ao registrar auditoria: ${error.message}`)
    }

    return log
  }

  /**
   * Registra criação de registro
   */
  async logCreate(
    tenantId: string,
    tableName: string,
    recordId: string,
    newValues: Record<string, any>,
    metadata?: Record<string, any>
  ): Promise<AuditLog> {
    return this.logAction(
      tenantId,
      'CREATE',
      tableName,
      recordId,
      undefined,
      this.sanitizeValues(newValues),
      metadata
    )
  }

  /**
   * Registra atualização de registro
   */
  async logUpdate(
    tenantId: string,
    tableName: string,
    recordId: string,
    oldValues: Record<string, any>,
    newValues: Record<string, any>,
    metadata?: Record<string, any>
  ): Promise<AuditLog> {
    return this.logAction(
      tenantId,
      'UPDATE',
      tableName,
      recordId,
      this.sanitizeValues(oldValues),
      this.sanitizeValues(newValues),
      metadata
    )
  }

  /**
   * Registra exclusão de registro
   */
  async logDelete(
    tenantId: string,
    tableName: string,
    recordId: string,
    oldValues: Record<string, any>,
    metadata?: Record<string, any>
  ): Promise<AuditLog> {
    return this.logAction(
      tenantId,
      'DELETE',
      tableName,
      recordId,
      this.sanitizeValues(oldValues),
      undefined,
      metadata
    )
  }

  /**
   * Registra acesso a registro
   */
  async logAccess(
    tenantId: string,
    tableName: string,
    recordId: string,
    accessType: 'READ' | 'EXPORT' | 'DOWNLOAD',
    metadata?: Record<string, any>
  ): Promise<AuditLog> {
    return this.logAction(
      tenantId,
      accessType,
      tableName,
      recordId,
      undefined,
      undefined,
      metadata
    )
  }

  /**
   * Registra operação de sistema
   */
  async logSystemOperation(
    tenantId: string,
    operation: string,
    details: Record<string, any>,
    metadata?: Record<string, any>
  ): Promise<AuditLog> {
    return this.logAction(
      tenantId,
      operation,
      'SYSTEM',
      undefined,
      undefined,
      details,
      metadata
    )
  }

  /**
   * Registra operação de autenticação
   */
  async logAuthOperation(
    tenantId: string,
    operation: 'LOGIN' | 'LOGOUT' | 'PASSWORD_CHANGE' | 'PERMISSION_CHANGE',
    userId: string,
    details: Record<string, any>,
    metadata?: Record<string, any>
  ): Promise<AuditLog> {
    return this.logAction(
      tenantId,
      operation,
      'AUTH',
      userId,
      undefined,
      details,
      metadata
    )
  }

  /**
   * Obtém logs de auditoria com filtros e paginação
   */
  async getAuditLogs(
    filters: AuditLogFilters,
    pagination: PaginationParams
  ): Promise<AuditLog[]> {
    const {
      data: { user },
    } = await this.supabase.auth.getUser()
    if (!user) throw new Error('Usuário não autenticado')

    let query = this.supabase.from('audit_logs').select('*')

    // Aplicar filtros
    if (filters.tenant_id) query = query.eq('tenant_id', filters.tenant_id)
    if (filters.user_id) query = query.eq('user_id', filters.user_id)
    if (filters.action) query = query.eq('action', filters.action)
    if (filters.table_name) query = query.eq('table_name', filters.table_name)
    if (filters.created_after)
      query = query.gte('created_at', filters.created_after)
    if (filters.created_before)
      query = query.lte('created_at', filters.created_before)

    // Aplicar paginação
    const offset = (pagination.page - 1) * pagination.limit
    query = query.range(offset, offset + pagination.limit - 1)

    // Aplicar ordenação
    if (pagination.sort_by) {
      query = query.order(pagination.sort_by, {
        ascending: pagination.sort_order === 'asc',
      })
    } else {
      query = query.order('created_at', { ascending: false })
    }

    const { data, error } = await query
    if (error) throw new Error(`Erro ao buscar logs: ${error.message}`)

    return data || []
  }

  /**
   * Obtém log de auditoria específico
   */
  async getAuditLog(logId: string): Promise<AuditLog> {
    const {
      data: { user },
    } = await this.supabase.auth.getUser()
    if (!user) throw new Error('Usuário não autenticado')

    const { data: log, error } = await this.supabase
      .from('audit_logs')
      .select('*')
      .eq('id', logId)
      .single()

    if (error || !log) throw new Error('Log de auditoria não encontrado')

    return log
  }

  /**
   * Busca logs de auditoria por texto
   */
  async searchAuditLogs(
    searchTerm: string,
    filters: AuditLogFilters,
    pagination: PaginationParams
  ): Promise<AuditLog[]> {
    const {
      data: { user },
    } = await this.supabase.auth.getUser()
    if (!user) throw new Error('Usuário não autenticado')

    let query = this.supabase
      .from('audit_logs')
      .select('*')
      .or(
        `action.ilike.%${searchTerm}%,table_name.ilike.%${searchTerm}%,metadata::text.ilike.%${searchTerm}%`
      )

    // Aplicar filtros
    if (filters.tenant_id) query = query.eq('tenant_id', filters.tenant_id)
    if (filters.user_id) query = query.eq('user_id', filters.user_id)
    if (filters.action) query = query.eq('action', filters.action)
    if (filters.table_name) query = query.eq('table_name', filters.table_name)
    if (filters.created_after)
      query = query.gte('created_at', filters.created_after)
    if (filters.created_before)
      query = query.lte('created_at', filters.created_before)

    // Aplicar paginação
    const offset = (pagination.page - 1) * pagination.limit
    query = query.range(offset, offset + pagination.limit - 1)

    // Aplicar ordenação
    query = query.order('created_at', { ascending: false })

    const { data, error } = await query
    if (error) throw new Error(`Erro ao buscar logs: ${error.message}`)

    return data || []
  }

  /**
   * Exporta logs de auditoria
   */
  async exportAuditLogs(
    filters: AuditLogFilters,
    format: 'csv' | 'json' = 'json'
  ): Promise<string> {
    const {
      data: { user },
    } = await this.supabase.auth.getUser()
    if (!user) throw new Error('Usuário não autenticado')

    // Buscar todos os logs que correspondem aos filtros
    let query = this.supabase.from('audit_logs').select('*')

    // Aplicar filtros
    if (filters.tenant_id) query = query.eq('tenant_id', filters.tenant_id)
    if (filters.user_id) query = query.eq('user_id', filters.user_id)
    if (filters.action) query = query.eq('action', filters.action)
    if (filters.table_name) query = query.eq('table_name', filters.table_name)
    if (filters.created_after)
      query = query.gte('created_at', filters.created_after)
    if (filters.created_before)
      query = query.lte('created_at', filters.created_before)

    const { data, error } = await query
    if (error) throw new Error(`Erro ao exportar logs: ${error.message}`)

    const logs = data || []

    // Registrar operação de exportação
    await this.logSystemOperation(
      filters.tenant_id || 'unknown',
      'EXPORT_AUDIT_LOGS',
      {
        format,
        record_count: logs.length,
        filters,
      },
      { exported_by: user.id }
    )

    if (format === 'csv') {
      return this.convertToCSV(logs)
    } else {
      return JSON.stringify(logs, null, 2)
    }
  }

  /**
   * Limpa logs antigos baseado na política de retenção
   */
  async cleanupOldLogs(tenantId: string): Promise<number> {
    const {
      data: { user },
    } = await this.supabase.auth.getUser()
    if (!user) throw new Error('Usuário não autenticado')

    const retentionDays = this.getRetentionDays()
    const cutoffDate = new Date(
      Date.now() - retentionDays * 24 * 60 * 60 * 1000
    )

    const { data, error } = await this.supabase
      .from('audit_logs')
      .delete()
      .eq('tenant_id', tenantId)
      .lt('created_at', cutoffDate.toISOString())
      .select('id')

    if (error) throw new Error(`Erro ao limpar logs: ${error.message}`)

    const deletedCount = data?.length || 0

    // Registrar operação de limpeza
    await this.logSystemOperation(tenantId, 'CLEANUP_AUDIT_LOGS', {
      deleted_count: deletedCount,
      cutoff_date: cutoffDate.toISOString(),
      retention_days: retentionDays,
    })

    return deletedCount
  }

  // =====================================================
  // FUNÇÕES AUXILIARES
  // =====================================================

  /**
   * Sanitiza valores sensíveis antes de registrar
   */
  private sanitizeValues(values: Record<string, any>): Record<string, any> {
    if (!values) return values

    const sensitiveFields = this.getSensitiveFields()
    const sanitized = { ...values }

    for (const field of sensitiveFields) {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]'
      }
    }

    return sanitized
  }

  /**
   * Verifica se deve registrar endereço IP
   */
  private shouldLogIP(): boolean {
    return this.getAuditConfig().log_ip_addresses
  }

  /**
   * Verifica se deve registrar user agent
   */
  private shouldLogUserAgent(): boolean {
    return this.getAuditConfig().log_user_agents
  }

  /**
   * Obtém campos sensíveis da configuração
   */
  private getSensitiveFields(): string[] {
    return this.getAuditConfig().sensitive_fields
  }

  /**
   * Obtém dias de retenção da configuração
   */
  private getRetentionDays(): number {
    return this.getAuditConfig().retention_days
  }

  /**
   * Obtém configuração de auditoria
   */
  private getAuditConfig(): AuditConfig {
    // Em produção, isso viria de uma tabela de configuração
    return {
      log_user_actions: true,
      log_ip_addresses: true,
      log_user_agents: true,
      retention_days: 365,
      sensitive_fields: ['password', 'token', 'secret', 'key', 'credential'],
    }
  }

  /**
   * Converte logs para formato CSV
   */
  private convertToCSV(logs: AuditLog[]): string {
    if (logs.length === 0) return ''

    const headers = Object.keys(logs[0])
    const csvRows = [headers.join(',')]

    for (const log of logs) {
      const values = headers.map(header => {
        const value = log[header as keyof AuditLog]
        if (typeof value === 'object') {
          return `"${JSON.stringify(value).replace(/"/g, '""')}"`
        }
        return `"${String(value || '').replace(/"/g, '""')}"`
      })
      csvRows.push(values.join(','))
    }

    return csvRows.join('\n')
  }
}

// Instância singleton do serviço
export const auditService = new AuditService()
