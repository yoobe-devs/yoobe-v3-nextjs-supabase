// =====================================================
// SERVIÇO DE MÚLTIPLAS MOEDAS
// YOOBE v3.1.0 - Currency Service
// =====================================================

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import {
  Currency,
  ExchangeRateHistory,
  CurrencyConversionRequest,
  CurrencyConversionResult,
  CurrencyStatistics,
} from '@/types/advanced-features'

export class CurrencyService {
  private supabase = createClientComponentClient()

  // =====================================================
  // FUNÇÕES PRINCIPAIS DE MOEDAS
  // =====================================================

  /**
   * Obtém todas as moedas ativas de um tenant
   */
  async getCurrencies(tenantId: string): Promise<Currency[]> {
    const { data: currencies, error } = await this.supabase
      .from('currencies')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('is_active', true)
      .order('is_base_currency', { ascending: false })
      .order('code', { ascending: true })

    if (error) throw new Error(`Erro ao buscar moedas: ${error.message}`)
    return currencies || []
  }

  /**
   * Obtém uma moeda específica
   */
  async getCurrency(currencyId: string): Promise<Currency> {
    const { data: currency, error } = await this.supabase
      .from('currencies')
      .select('*')
      .eq('id', currencyId)
      .single()

    if (error || !currency) throw new Error('Moeda não encontrada')
    return currency
  }

  /**
   * Obtém moeda por código
   */
  async getCurrencyByCode(code: string, tenantId: string): Promise<Currency> {
    const { data: currency, error } = await this.supabase
      .from('currencies')
      .select('*')
      .eq('code', code)
      .eq('tenant_id', tenantId)
      .eq('is_active', true)
      .single()

    if (error || !currency) throw new Error(`Moeda ${code} não encontrada`)
    return currency
  }

  /**
   * Obtém moeda base de um tenant
   */
  async getBaseCurrency(tenantId: string): Promise<Currency> {
    const { data: currency, error } = await this.supabase
      .from('currencies')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('is_base_currency', true)
      .eq('is_active', true)
      .single()

    if (error || !currency) throw new Error('Moeda base não encontrada')
    return currency
  }

  /**
   * Converte valor entre moedas
   */
  async convertCurrency(
    request: CurrencyConversionRequest
  ): Promise<CurrencyConversionResult> {
    try {
      // Se as moedas são iguais, retornar o valor original
      if (request.from_currency === request.to_currency) {
        return {
          original_amount: request.amount,
          converted_amount: request.amount,
          from_currency: request.from_currency,
          to_currency: request.to_currency,
          exchange_rate: 1,
          conversion_date: new Date().toISOString(),
        }
      }

      // Buscar taxas de câmbio atuais
      const fromCurrency = await this.getCurrencyByCode(
        request.from_currency,
        request.tenant_id
      )
      const toCurrency = await this.getCurrencyByCode(
        request.to_currency,
        request.tenant_id
      )

      // Calcular taxa de conversão
      const exchangeRate = toCurrency.exchange_rate / fromCurrency.exchange_rate

      // Converter valor
      const convertedAmount = request.amount * exchangeRate

      // Arredondar conforme configuração da moeda de destino
      const roundedAmount = this.roundAmount(
        convertedAmount,
        toCurrency.decimal_places,
        toCurrency.rounding_mode
      )

      return {
        original_amount: request.amount,
        converted_amount: roundedAmount,
        from_currency: request.from_currency,
        to_currency: request.to_currency,
        exchange_rate: exchangeRate,
        conversion_date: new Date().toISOString(),
      }
    } catch (error) {
      console.error('Erro ao converter moeda:', error)
      throw new Error(
        `Erro ao converter moeda: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      )
    }
  }

  /**
   * Atualiza taxa de câmbio de uma moeda
   */
  async updateExchangeRate(
    currencyId: string,
    newRate: number,
    source: string = 'manual'
  ): Promise<void> {
    try {
      // Buscar moeda atual
      const currentCurrency = await this.getCurrency(currencyId)

      // Registrar histórico da taxa anterior
      await this.recordExchangeRateHistory(
        currencyId,
        currentCurrency.exchange_rate,
        source,
        new Date(Date.now() - 1000).toISOString(), // 1 segundo atrás
        new Date().toISOString()
      )

      // Atualizar taxa atual
      const { error: updateError } = await this.supabase
        .from('currencies')
        .update({
          exchange_rate: newRate,
          updated_at: new Date().toISOString(),
        })
        .eq('id', currencyId)

      if (updateError)
        throw new Error(`Erro ao atualizar taxa: ${updateError.message}`)

      // Registrar nova taxa no histórico
      await this.recordExchangeRateHistory(
        currencyId,
        newRate,
        source,
        new Date().toISOString()
      )
    } catch (error) {
      console.error('Erro ao atualizar taxa de câmbio:', error)
      throw error
    }
  }

  /**
   * Atualiza taxas de câmbio em lote (para APIs externas)
   */
  async updateExchangeRatesFromAPI(tenantId: string): Promise<{
    updated: number
    errors: string[]
  }> {
    const errors: string[] = []
    let updated = 0

    try {
      // Obter moedas ativas
      const currencies = await this.getCurrencies(tenantId)
      const baseCurrency = await this.getBaseCurrency(tenantId)

      // Simular atualização de taxas (em produção, isso viria de uma API real)
      for (const currency of currencies) {
        if (currency.is_base_currency) continue

        try {
          // Simular taxa de câmbio (em produção, buscar de API externa)
          const mockRate = this.generateMockExchangeRate(
            currency.code,
            baseCurrency.code
          )

          await this.updateExchangeRate(currency.id, mockRate, 'api')
          updated++
        } catch (error) {
          errors.push(
            `Erro ao atualizar ${currency.code}: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
          )
        }
      }
    } catch (error) {
      errors.push(
        `Erro geral: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      )
    }

    return { updated, errors }
  }

  /**
   * Cria uma nova moeda
   */
  async createCurrency(currencyData: Partial<Currency>): Promise<Currency> {
    const { data: currency, error } = await this.supabase
      .from('currencies')
      .insert(currencyData)
      .select()
      .single()

    if (error) throw new Error(`Erro ao criar moeda: ${error.message}`)
    return currency
  }

  /**
   * Atualiza uma moeda existente
   */
  async updateCurrency(
    id: string,
    updates: Partial<Currency>
  ): Promise<Currency> {
    const { data: currency, error } = await this.supabase
      .from('currencies')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw new Error(`Erro ao atualizar moeda: ${error.message}`)
    return currency
  }

  /**
   * Desativa uma moeda
   */
  async deactivateCurrency(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('currencies')
      .update({
        is_active: false,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)

    if (error) throw new Error(`Erro ao desativar moeda: ${error.message}`)
  }

  /**
   * Define uma moeda como base
   */
  async setBaseCurrency(currencyId: string, tenantId: string): Promise<void> {
    // Primeiro, remover status de base de todas as moedas do tenant
    const { error: resetError } = await this.supabase
      .from('currencies')
      .update({
        is_base_currency: false,
        updated_at: new Date().toISOString(),
      })
      .eq('tenant_id', tenantId)

    if (resetError)
      throw new Error(`Erro ao resetar moedas base: ${resetError.message}`)

    // Definir nova moeda base
    const { error: setError } = await this.supabase
      .from('currencies')
      .update({
        is_base_currency: true,
        exchange_rate: 1.0, // Taxa base sempre 1.0
        updated_at: new Date().toISOString(),
      })
      .eq('id', currencyId)

    if (setError)
      throw new Error(`Erro ao definir moeda base: ${setError.message}`)
  }

  /**
   * Obtém histórico de taxas de câmbio
   */
  async getExchangeRateHistory(
    currencyId: string,
    limit: number = 100
  ): Promise<ExchangeRateHistory[]> {
    const { data: history, error } = await this.supabase
      .from('exchange_rate_history')
      .select('*')
      .eq('currency_id', currencyId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw new Error(`Erro ao buscar histórico: ${error.message}`)
    return history || []
  }

  /**
   * Obtém estatísticas de moedas
   */
  async getCurrencyStatistics(tenantId: string): Promise<CurrencyStatistics> {
    try {
      const currencies = await this.getCurrencies(tenantId)
      const baseCurrency = await this.getBaseCurrency(tenantId)

      // Contar atualizações de taxa
      const { data: rateUpdates, error: rateError } = await this.supabase
        .from('exchange_rate_history')
        .select('id')
        .in(
          'currency_id',
          currencies.map(c => c.id)
        )

      if (rateError)
        throw new Error(`Erro ao buscar atualizações: ${rateError.message}`)

      // Simular contagem de conversões (em produção, seria uma tabela real)
      const conversionRequests = Math.floor(Math.random() * 1000) + 100

      return {
        base_currency: baseCurrency.code,
        total_currencies: currencies.length,
        active_currencies: currencies.filter(c => c.is_active).length,
        exchange_rate_updates: rateUpdates?.length || 0,
        last_update: new Date().toISOString(),
        conversion_requests: conversionRequests,
      }
    } catch (error) {
      console.error('Erro ao obter estatísticas de moedas:', error)
      throw error
    }
  }

  // =====================================================
  // FUNÇÕES AUXILIARES
  // =====================================================

  /**
   * Registra histórico de taxa de câmbio
   */
  private async recordExchangeRateHistory(
    currencyId: string,
    rate: number,
    source: string,
    validFrom: string,
    validUntil?: string
  ): Promise<void> {
    const { error } = await this.supabase.from('exchange_rate_history').insert({
      currency_id: currencyId,
      exchange_rate: rate,
      source,
      valid_from: validFrom,
      valid_until: validUntil,
    })

    if (error) {
      console.error('Erro ao registrar histórico de taxa:', error)
    }
  }

  /**
   * Arredonda valor conforme configuração da moeda
   */
  private roundAmount(
    amount: number,
    decimalPlaces: number,
    roundingMode: string
  ): number {
    const factor = Math.pow(10, decimalPlaces)

    switch (roundingMode) {
      case 'up':
        return Math.ceil(amount * factor) / factor
      case 'down':
        return Math.floor(amount * factor) / factor
      case 'half_even':
      default:
        return Math.round(amount * factor) / factor
    }
  }

  /**
   * Gera taxa de câmbio simulada para demonstração
   */
  private generateMockExchangeRate(
    fromCurrency: string,
    toCurrency: string
  ): number {
    // Taxas simuladas baseadas em valores reais aproximados
    const rates: Record<string, number> = {
      BRL: 1.0, // Real brasileiro (base)
      USD: 0.21, // Dólar americano
      EUR: 0.19, // Euro
      GBP: 0.16, // Libra esterlina
      JPY: 30.5, // Iene japonês
      CAD: 0.28, // Dólar canadense
      AUD: 0.31, // Dólar australiano
      CHF: 0.18, // Franco suíço
      CNY: 1.48, // Yuan chinês
      MXN: 3.85, // Peso mexicano
    }

    const fromRate = rates[fromCurrency] || 1.0
    const toRate = rates[toCurrency] || 1.0

    // Adicionar variação aleatória de ±2%
    const variation = 1 + (Math.random() - 0.5) * 0.04
    return (toRate / fromRate) * variation
  }

  /**
   * Formata valor monetário
   */
  formatCurrency(
    amount: number,
    currencyCode: string,
    locale: string = 'pt-BR'
  ): string {
    const currencySymbols: Record<string, string> = {
      BRL: 'R$',
      USD: '$',
      EUR: '€',
      GBP: '£',
      JPY: '¥',
      CAD: 'C$',
      AUD: 'A$',
      CHF: 'CHF',
      CNY: '¥',
      MXN: '$',
    }

    const symbol = currencySymbols[currencyCode] || currencyCode

    try {
      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currencyCode,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(amount)
    } catch {
      // Fallback para formatação simples
      return `${symbol} ${amount.toFixed(2)}`
    }
  }

  /**
   * Obtém símbolo da moeda
   */
  getCurrencySymbol(currencyCode: string): string {
    const symbols: Record<string, string> = {
      BRL: 'R$',
      USD: '$',
      EUR: '€',
      GBP: '£',
      JPY: '¥',
      CAD: 'C$',
      AUD: 'A$',
      CHF: 'CHF',
      CNY: '¥',
      MXN: '$',
    }
    return symbols[currencyCode] || currencyCode
  }
}

// Instância singleton do serviço
export const currencyService = new CurrencyService()
