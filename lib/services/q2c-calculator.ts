import { createClient } from '@supabase/supabase-js'

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321'
const serviceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

const supabaseService = createClient(supabaseUrl, serviceKey)

export interface OrcamentoTotals {
  total_items_amount: number
  total_costs_amount: number
  total_taxes_amount: number
  total_discount_amount: number
  grand_total: number
}

export interface OrcamentoSnapshot {
  orcamento: {
    id: string
    title: string
    description: string
    version: number
    currency: string
    created_at: string
  }
  items: Array<{
    id: string
    base_product_id: string
    quantity: number
    custom_price: number
    custom_points_cost: number
    notes?: string
    base_products: {
      id: string
      name: string
      base_price: number
      base_points_cost: number
    }
    subtotal: number
  }>
  custos: Array<{
    id: string
    name: string
    kind: string
    amount: number
  }>
  totals: OrcamentoTotals
  metadata: {
    snapshot_version: number
    created_at: string
    created_by: string
  }
}

export class Q2CCalculator {
  /**
   * Recalcula todos os totais de um orçamento
   */
  static async recalculateTotals(
    orcamentoId: string
  ): Promise<OrcamentoTotals> {
    try {
      // Buscar itens do orçamento
      const { data: items, error: itemsError } = await supabaseService
        .from('orcamentos_itens')
        .select(
          `
          id,
          quantity,
          custom_price,
          base_products (
            id,
            name,
            base_price,
            base_points_cost
          )
        `
        )
        .eq('orcamento_id', orcamentoId)

      if (itemsError) {
        throw new Error(`Erro ao buscar itens: ${itemsError.message}`)
      }

      // Buscar custos do orçamento
      const { data: custos, error: custosError } = await supabaseService
        .from('orcamentos_custos')
        .select('id, name, kind, amount')
        .eq('orcamento_id', orcamentoId)

      if (custosError) {
        throw new Error(`Erro ao buscar custos: ${custosError.message}`)
      }

      // Calcular total dos itens
      const total_items_amount =
        items?.reduce((sum, item) => {
          return sum + item.quantity * item.custom_price
        }, 0) || 0

      // Calcular totais por tipo de custo
      const total_costs_amount =
        custos?.reduce((sum, custo) => {
          return sum + (custo.kind === 'service' ? custo.amount : 0)
        }, 0) || 0

      const total_taxes_amount =
        custos?.reduce((sum, custo) => {
          return sum + (custo.kind === 'tax' ? custo.amount : 0)
        }, 0) || 0

      const total_discount_amount =
        custos?.reduce((sum, custo) => {
          return sum + (custo.kind === 'discount' ? custo.amount : 0)
        }, 0) || 0

      // Calcular total geral
      const grand_total =
        total_items_amount +
        total_costs_amount +
        total_taxes_amount -
        total_discount_amount

      const totals: OrcamentoTotals = {
        total_items_amount,
        total_costs_amount,
        total_taxes_amount,
        total_discount_amount,
        grand_total,
      }

      // Atualizar orçamento com novos totais
      const { error: updateError } = await supabaseService
        .from('orcamentos')
        .update({
          total_items_amount,
          total_costs_amount,
          total_taxes_amount,
          total_discount_amount,
          grand_total,
          updated_at: new Date().toISOString(),
        })
        .eq('id', orcamentoId)

      if (updateError) {
        throw new Error(`Erro ao atualizar totais: ${updateError.message}`)
      }

      return totals
    } catch (error) {
      console.error('Erro ao recalcular totais:', error)
      throw error
    }
  }

  /**
   * Gera snapshot completo do orçamento para proposta
   */
  static async generateSnapshot(
    orcamentoId: string,
    createdBy: string
  ): Promise<OrcamentoSnapshot> {
    try {
      // Buscar dados completos do orçamento
      const { data: orcamento, error: orcamentoError } = await supabaseService
        .from('orcamentos')
        .select(
          `
          id,
          title,
          description,
          version,
          currency,
          created_at,
          company_id,
          manager_id
        `
        )
        .eq('id', orcamentoId)
        .single()

      if (orcamentoError) {
        throw new Error(`Erro ao buscar orçamento: ${orcamentoError.message}`)
      }

      // Buscar itens com produtos base
      const { data: items, error: itemsError } = await supabaseService
        .from('orcamentos_itens')
        .select(
          `
          id,
          base_product_id,
          quantity,
          custom_price,
          custom_points_cost,
          notes,
          base_products (
            id,
            name,
            base_price,
            base_points_cost
          )
        `
        )
        .eq('orcamento_id', orcamentoId)

      if (itemsError) {
        throw new Error(`Erro ao buscar itens: ${itemsError.message}`)
      }

      // Buscar custos
      const { data: custos, error: custosError } = await supabaseService
        .from('orcamentos_custos')
        .select('id, name, kind, amount')
        .eq('orcamento_id', orcamentoId)

      if (custosError) {
        throw new Error(`Erro ao buscar custos: ${custosError.message}`)
      }

      // Calcular totais
      const totals = await this.recalculateTotals(orcamentoId)

      // Montar snapshot
      const snapshot: OrcamentoSnapshot = {
        orcamento: {
          id: orcamento.id,
          title: orcamento.title,
          description: orcamento.description,
          version: orcamento.version,
          currency: orcamento.currency,
          created_at: orcamento.created_at,
        },
        items:
          items?.map(item => ({
            id: item.id,
            base_product_id: item.base_product_id,
            quantity: item.quantity,
            custom_price: item.custom_price,
            custom_points_cost: item.custom_points_cost,
            notes: item.notes,
            base_products: item.base_products,
            subtotal: item.quantity * item.custom_price,
          })) || [],
        custos:
          custos?.map(custo => ({
            id: custo.id,
            name: custo.name,
            kind: custo.kind,
            amount: custo.amount,
          })) || [],
        totals,
        metadata: {
          snapshot_version: orcamento.version,
          created_at: new Date().toISOString(),
          created_by: createdBy,
        },
      }

      return snapshot
    } catch (error) {
      console.error('Erro ao gerar snapshot:', error)
      throw error
    }
  }

  /**
   * Valida se um orçamento pode ser enviado para o admin
   */
  static async validateForSubmission(
    orcamentoId: string
  ): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = []

    try {
      // Verificar se tem itens
      const { data: items, error: itemsError } = await supabaseService
        .from('orcamentos_itens')
        .select('id')
        .eq('orcamento_id', orcamentoId)

      if (itemsError) {
        errors.push('Erro ao verificar itens do orçamento')
        return { valid: false, errors }
      }

      if (!items || items.length === 0) {
        errors.push('Orçamento deve ter pelo menos um item')
      }

      // Verificar se todos os itens têm preço válido
      const { data: itemsWithPrice, error: priceError } = await supabaseService
        .from('orcamentos_itens')
        .select('id, custom_price, quantity')
        .eq('orcamento_id', orcamentoId)
        .gt('custom_price', 0)
        .gt('quantity', 0)

      if (priceError) {
        errors.push('Erro ao verificar preços dos itens')
        return { valid: false, errors }
      }

      if (itemsWithPrice.length !== items.length) {
        errors.push('Todos os itens devem ter preço e quantidade válidos')
      }

      // Verificar se o total é maior que zero
      const totals = await this.recalculateTotals(orcamentoId)
      if (totals.grand_total <= 0) {
        errors.push('Total do orçamento deve ser maior que zero')
      }

      return { valid: errors.length === 0, errors }
    } catch (error) {
      console.error('Erro na validação:', error)
      errors.push('Erro interno na validação')
      return { valid: false, errors }
    }
  }

  /**
   * Gera número de fatura único
   */
  static async generateFaturaNumber(storeId: string): Promise<string> {
    try {
      const year = new Date().getFullYear()
      const prefix = `YO-${year}-`

      // Buscar última fatura do ano
      const { data: lastFatura, error } = await supabaseService
        .from('faturas')
        .select('number')
        .like('number', prefix + '%')
        .order('number', { ascending: false })
        .limit(1)

      if (error) {
        throw new Error(`Erro ao buscar última fatura: ${error.message}`)
      }

      let sequence = 1
      if (lastFatura && lastFatura.length > 0) {
        const lastNumber = lastFatura[0].number
        const lastSequence = parseInt(lastNumber.replace(prefix, ''))
        sequence = lastSequence + 1
      }

      return `${prefix}${sequence.toString().padStart(6, '0')}`
    } catch (error) {
      console.error('Erro ao gerar número da fatura:', error)
      throw error
    }
  }

  /**
   * Calcula diferenças entre duas versões de orçamento
   */
  static calculateDifferences(
    oldSnapshot: OrcamentoSnapshot,
    newSnapshot: OrcamentoSnapshot
  ) {
    const differences = {
      items_changed: false,
      costs_changed: false,
      total_changed: false,
      changes: [] as string[],
    }

    // Verificar mudanças nos itens
    if (oldSnapshot.items.length !== newSnapshot.items.length) {
      differences.items_changed = true
      differences.changes.push(
        `Quantidade de itens: ${oldSnapshot.items.length} → ${newSnapshot.items.length}`
      )
    }

    // Verificar mudanças nos custos
    if (oldSnapshot.custos.length !== newSnapshot.custos.length) {
      differences.costs_changed = true
      differences.changes.push(
        `Quantidade de custos: ${oldSnapshot.custos.length} → ${newSnapshot.custos.length}`
      )
    }

    // Verificar mudança no total
    if (oldSnapshot.totals.grand_total !== newSnapshot.totals.grand_total) {
      differences.total_changed = true
      differences.changes.push(
        `Total: ${oldSnapshot.totals.grand_total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} → ${newSnapshot.totals.grand_total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`
      )
    }

    return differences
  }
}
