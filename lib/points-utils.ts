import { createClient } from '@supabase/supabase-js'
import {
  WalletAccount,
  WalletEntry,
  PointsConversionRule,
  Redemption,
  PointsPricingResponse,
  CreditPointsRequest,
  CheckoutPointsRequest,
} from '@/types/points'
import {
  generateIdempotencyKey,
  validateIdempotencyKey,
} from '@/lib/idempotency'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/**
 * Obtém ou cria uma carteira para um usuário
 */
export async function getOrCreateWallet(
  userId: string,
  tenantId: string
): Promise<WalletAccount> {
  try {
    // Tentar obter carteira existente
    const { data: existingWallet, error: selectError } = await supabase
      .from('wallet_accounts')
      .select('*')
      .eq('user_id', userId)
      .eq('tenant_id', tenantId)
      .single()

    if (existingWallet) {
      return existingWallet
    }

    // Criar nova carteira se não existir
    const { data: newWallet, error: insertError } = await supabase
      .from('wallet_accounts')
      .insert({
        user_id: userId,
        tenant_id: tenantId,
        status: 'active',
      })
      .select()
      .single()

    if (insertError) {
      throw new Error(`Erro ao criar carteira: ${insertError.message}`)
    }

    return newWallet
  } catch (error) {
    throw new Error(`Erro ao obter/criar carteira: ${error}`)
  }
}

/**
 * Obtém o saldo atual de pontos de um usuário
 */
export async function getWalletBalance(
  userId: string,
  tenantId: string
): Promise<number> {
  try {
    const { data: balance, error } = await supabase.rpc('get_wallet_balance', {
      p_user_id: userId,
      p_tenant_id: tenantId,
    })

    if (error) {
      throw new Error(`Erro ao obter saldo: ${error.message}`)
    }

    return balance || 0
  } catch (error) {
    console.error('Erro ao obter saldo da carteira:', error)
    return 0
  }
}

/**
 * Adiciona pontos à carteira de um usuário
 */
export async function addPointsToWallet(
  request: CreditPointsRequest,
  tenantId: string,
  createdBy: string
): Promise<{ entryId: string; newBalance: number }> {
  try {
    // Validar idempotência
    if (!validateIdempotencyKey(request.idempotency_key)) {
      throw new Error('Chave de idempotência inválida')
    }

    // Verificar se já foi processado
    const { data: existingEntry } = await supabase
      .from('wallet_entries')
      .select('id, amount_points')
      .eq('idempotency_key', request.idempotency_key)
      .single()

    if (existingEntry) {
      // Retornar resultado existente (idempotência)
      const newBalance = await getWalletBalance(request.user_id, tenantId)
      return {
        entryId: existingEntry.id,
        newBalance,
      }
    }

    // Obter ou criar carteira
    const wallet = await getOrCreateWallet(request.user_id, tenantId)

    // Inserir entrada de crédito
    const { data: entry, error: insertError } = await supabase
      .from('wallet_entries')
      .insert({
        wallet_id: wallet.id,
        direction: 'credit',
        amount_points: request.amount_points,
        reason: request.reason,
        ref_type: 'admin_action',
        idempotency_key: request.idempotency_key,
        meta: request.meta || {},
        created_by: createdBy,
      })
      .select()
      .single()

    if (insertError) {
      throw new Error(`Erro ao inserir entrada: ${insertError.message}`)
    }

    // Calcular novo saldo
    const newBalance = await getWalletBalance(request.user_id, tenantId)

    return {
      entryId: entry.id,
      newBalance,
    }
  } catch (error) {
    throw new Error(`Erro ao adicionar pontos: ${error}`)
  }
}

/**
 * Remove pontos da carteira de um usuário
 */
export async function deductPointsFromWallet(
  walletId: string,
  amount: number,
  reason: string,
  refType: string,
  refId: string,
  idempotencyKey: string,
  createdBy: string
): Promise<{ entryId: string; newBalance: number }> {
  try {
    // Validar idempotência
    if (!validateIdempotencyKey(idempotencyKey)) {
      throw new Error('Chave de idempotência inválida')
    }

    // Verificar se já foi processado
    const { data: existingEntry } = await supabase
      .from('wallet_entries')
      .select('id, amount_points')
      .eq('idempotency_key', idempotencyKey)
      .single()

    if (existingEntry) {
      // Retornar resultado existente (idempotência)
      const wallet = await supabase
        .from('wallet_accounts')
        .select('user_id, tenant_id')
        .eq('id', walletId)
        .single()

      if (wallet.data) {
        const newBalance = await getWalletBalance(
          wallet.data.user_id,
          wallet.data.tenant_id
        )
        return {
          entryId: existingEntry.id,
          newBalance,
        }
      }
    }

    // Verificar saldo suficiente
    const currentBalance = await getWalletBalance(
      (
        await supabase
          .from('wallet_accounts')
          .select('user_id, tenant_id')
          .eq('id', walletId)
          .single()
      ).data!.user_id,
      (
        await supabase
          .from('wallet_accounts')
          .select('user_id, tenant_id')
          .eq('id', walletId)
          .single()
      ).data!.tenant_id
    )

    if (currentBalance < amount) {
      throw new Error('Saldo insuficiente de pontos')
    }

    // Inserir entrada de débito
    const { data: entry, error: insertError } = await supabase
      .from('wallet_entries')
      .insert({
        wallet_id: walletId,
        direction: 'debit',
        amount_points: amount,
        reason,
        ref_type: refType,
        ref_id: refId,
        idempotency_key: idempotencyKey,
        created_by: createdBy,
      })
      .select()
      .single()

    if (insertError) {
      throw new Error(`Erro ao inserir entrada: ${insertError.message}`)
    }

    // Calcular novo saldo
    const wallet = await supabase
      .from('wallet_accounts')
      .select('user_id, tenant_id')
      .eq('id', walletId)
      .single()

    const newBalance = await getWalletBalance(
      wallet.data!.user_id,
      wallet.data!.tenant_id
    )

    return {
      entryId: entry.id,
      newBalance,
    }
  } catch (error) {
    throw new Error(`Erro ao deduzir pontos: ${error}`)
  }
}

/**
 * Obtém a regra de conversão ativa para um tenant
 */
export async function getActiveConversionRule(
  tenantId: string
): Promise<PointsConversionRule | null> {
  try {
    const { data: rule, error } = await supabase
      .from('points_conversion_rules')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('status', 'active')
      .lte('effective_from', new Date().toISOString())
      .or(`effective_to.is.null,effective_to.gt.${new Date().toISOString()}`)
      .order('effective_from', { ascending: false })
      .limit(1)
      .single()

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Erro ao obter regra de conversão: ${error.message}`)
    }

    return rule
  } catch (error) {
    console.error('Erro ao obter regra de conversão ativa:', error)
    return null
  }
}

/**
 * Calcula o preço em pontos de um produto
 */
export async function calculateProductPointsPrice(
  productId: string,
  tenantId: string
): Promise<PointsPricingResponse | null> {
  try {
    // Obter informações do produto
    const { data: product, error: productError } = await supabase
      .from('product_store')
      .select(
        'price, allow_points, points_price, points_override, points_override_value'
      )
      .eq('id', productId)
      .single()

    if (productError) {
      throw new Error(`Erro ao obter produto: ${productError.message}`)
    }

    if (!product.allow_points) {
      return null
    }

    // Se tem override, usar valor fixo
    if (product.points_override && product.points_override_value) {
      return {
        success: true,
        data: {
          store_product_id: productId,
          price_brl: product.price,
          points_price: product.points_override_value,
          conversion_rate: 0,
          rounding_mode: 'override',
          is_override: true,
        },
        error: null,
        meta: {
          calculated_at: new Date().toISOString(),
        },
      }
    }

    // Calcular via regra de conversão
    const rule = await getActiveConversionRule(tenantId)
    if (!rule) {
      return null
    }

    const pointsPrice = await supabase.rpc('calculate_points_price', {
      p_price_brl: product.price,
      p_tenant_id: tenantId,
      p_rounding_mode: rule.rounding_mode,
    })

    if (pointsPrice.error) {
      throw new Error(
        `Erro ao calcular preço em pontos: ${pointsPrice.error.message}`
      )
    }

    return {
      success: true,
      data: {
        store_product_id: productId,
        price_brl: product.price,
        points_price: pointsPrice.data,
        conversion_rate: rule.points_per_currency,
        rounding_mode: rule.rounding_mode,
        is_override: false,
      },
      error: null,
      meta: {
        calculated_at: new Date().toISOString(),
        rule_id: rule.id,
      },
    }
  } catch (error) {
    console.error('Erro ao calcular preço em pontos:', error)
    return null
  }
}

/**
 * Processa checkout por pontos
 */
export async function processPointsCheckout(
  request: CheckoutPointsRequest,
  userId: string,
  tenantId: string
): Promise<{ redemptionId: string; totalPoints: number }> {
  try {
    // Validar idempotência
    if (!validateIdempotencyKey(request.idempotency_key)) {
      throw new Error('Chave de idempotência inválida')
    }

    // Verificar se já foi processado
    const { data: existingRedemption } = await supabase
      .from('redemptions')
      .select('id, total_points')
      .eq('idempotency_key', request.idempotency_key)
      .single()

    if (existingRedemption) {
      return {
        redemptionId: existingRedemption.id,
        totalPoints: existingRedemption.total_points,
      }
    }

    // Calcular preço em pontos
    const pricing = await calculateProductPointsPrice(
      request.store_product_id,
      tenantId
    )
    if (!pricing) {
      throw new Error('Produto não disponível para resgate por pontos')
    }

    const totalPoints = pricing.data.points_price * request.qty

    // Verificar saldo
    const balance = await getWalletBalance(userId, tenantId)
    if (balance < totalPoints) {
      throw new Error('Saldo insuficiente de pontos')
    }

    // Obter carteira
    const wallet = await getOrCreateWallet(userId, tenantId)

    // Deduzir pontos
    const deduction = await deductPointsFromWallet(
      wallet.id,
      totalPoints,
      'redemption',
      'redemption',
      '', // será preenchido após criar o resgate
      request.idempotency_key,
      userId
    )

    // Criar resgate
    const { data: redemption, error: redemptionError } = await supabase
      .from('redemptions')
      .insert({
        tenant_id: tenantId,
        user_id: userId,
        store_product_id: request.store_product_id,
        qty: request.qty,
        payment_method: 'points',
        total_points: totalPoints,
        status: 'approved',
        address_id: request.address_id,
        meta: request.meta || {},
        idempotency_key: request.idempotency_key,
        conversion_snapshot: pricing.meta,
        created_by: userId,
      })
      .select()
      .single()

    if (redemptionError) {
      throw new Error(`Erro ao criar resgate: ${redemptionError.message}`)
    }

    // Atualizar referência na entrada de débito
    await supabase
      .from('wallet_entries')
      .update({ ref_id: redemption.id })
      .eq('idempotency_key', request.idempotency_key)

    return {
      redemptionId: redemption.id,
      totalPoints,
    }
  } catch (error) {
    throw new Error(`Erro ao processar checkout por pontos: ${error}`)
  }
}

/**
 * Obtém estatísticas do dashboard de pontos
 */
export async function getPointsDashboard(tenantId: string): Promise<{
  totalPointsDistributed: number
  totalRedemptions: number
  conversionRate: number
  topProducts: Array<{
    productId: string
    productName: string
    redemptionsCount: number
    totalPointsSpent: number
  }>
}> {
  try {
    // Total de pontos distribuídos
    const { data: totalPoints, error: pointsError } = await supabase
      .from('wallet_entries')
      .select('amount_points')
      .eq('direction', 'credit')
      .in(
        'wallet_id',
        supabase.from('wallet_accounts').select('id').eq('tenant_id', tenantId)
      )

    const totalPointsDistributed =
      totalPoints?.reduce((sum, entry) => sum + entry.amount_points, 0) || 0

    // Total de resgates
    const { data: redemptions, error: redemptionsError } = await supabase
      .from('redemptions')
      .select('total_points')
      .eq('tenant_id', tenantId)

    const totalRedemptions =
      redemptions?.reduce(
        (sum, redemption) => sum + redemption.total_points,
        0
      ) || 0

    // Taxa de conversão (resgates / distribuição)
    const conversionRate =
      totalPointsDistributed > 0
        ? (totalRedemptions / totalPointsDistributed) * 100
        : 0

    // Top produtos
    const { data: topProducts, error: topProductsError } = await supabase
      .from('redemptions')
      .select(
        `
        store_product_id,
        total_points,
        product_store!inner(name)
      `
      )
      .eq('tenant_id', tenantId)
      .order('total_points', { ascending: false })
      .limit(5)

    const topProductsFormatted =
      topProducts?.map(redemption => ({
        productId: redemption.store_product_id,
        productName: redemption.product_store?.name || 'Produto desconhecido',
        redemptionsCount: 1, // Simplificado, seria melhor agrupar
        totalPointsSpent: redemption.total_points,
      })) || []

    return {
      totalPointsDistributed,
      totalRedemptions,
      conversionRate,
      topProducts: topProductsFormatted,
    }
  } catch (error) {
    console.error('Erro ao obter dashboard de pontos:', error)
    return {
      totalPointsDistributed: 0,
      totalRedemptions: 0,
      conversionRate: 0,
      topProducts: [],
    }
  }
}

/**
 * Registra erro no catálogo para aprendizado
 */
export async function logErrorToCatalog(
  errorType: string,
  route: string,
  error: Error,
  context: Record<string, any> = {},
  tenantId?: string
): Promise<void> {
  try {
    const stackTraceHash = generateIdempotencyKey(error.stack || '')

    // Verificar se erro já existe
    const { data: existingError } = await supabase
      .from('errors_catalog')
      .select('id, occurrence_count')
      .eq('error_type', errorType)
      .eq('stack_trace_hash', stackTraceHash)
      .single()

    if (existingError) {
      // Incrementar contador
      await supabase
        .from('errors_catalog')
        .update({
          occurrence_count: existingError.occurrence_count + 1,
          last_occurrence: new Date().toISOString(),
        })
        .eq('id', existingError.id)
    } else {
      // Criar novo registro
      await supabase.from('errors_catalog').insert({
        tenant_id: tenantId,
        error_type: errorType,
        route,
        stack_trace_hash: stackTraceHash,
        context,
        occurrence_count: 1,
        first_occurrence: new Date().toISOString(),
        last_occurrence: new Date().toISOString(),
      })
    }
  } catch (logError) {
    console.error('Erro ao registrar erro no catálogo:', logError)
  }
}
