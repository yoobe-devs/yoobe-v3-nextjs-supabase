import { createClient } from '@supabase/supabase-js'
import {
  isWithinTimeWindow,
  checkRedemptionLimits as checkLimits,
} from './time-windows'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export interface UserTags {
  userId: string
  tenantId: string
  tags: Array<{
    id: string
    key: string
    value: string
  }>
}

export interface ProductTags {
  productId: string
  tenantId: string
  tags: Array<{
    id: string
    key: string
    value: string
  }>
}

export interface AccessPolicy {
  id: string
  tenantId: string
  name: string
  rule: {
    allowedDepartments?: string[]
    requiredUserTags?: Array<{
      key: string
      values: string[]
    }>
    productTagLogic?: 'ANY' | 'ALL'
    timeWindowIds?: number[]
    defaultAllowUnlessTagged?: boolean
  }
  isActive: boolean
}

/**
 * Verifica se um usuário pode visualizar um produto baseado nas tags
 */
export async function canViewProduct(
  userId: string,
  productId: string,
  tenantId: string
): Promise<boolean> {
  try {
    // 1. Buscar tags do usuário
    const userTags = await getUserTags(userId, tenantId)

    // 2. Buscar tags do produto
    const productTags = await getProductTags(productId, tenantId)

    // 3. Buscar política de acesso ativa
    const accessPolicy = await getActiveAccessPolicy(tenantId)

    // 4. Verificar janela de tempo
    const timeWindowCheck = await isWithinTimeWindow(
      tenantId,
      accessPolicy?.rule.timeWindowIds
    )
    if (!timeWindowCheck.isWithinWindow) {
      return false
    }

    // 5. Aplicar lógica de acesso
    return evaluateAccessPolicy(userTags, productTags, accessPolicy)
  } catch (error) {
    console.error('Erro ao verificar acesso por tags:', error)
    return false
  }
}

/**
 * Verifica se um usuário pode resgatar um produto
 */
export async function canRedeem(
  userId: string,
  productId: string,
  quantity: number,
  points: number,
  tenantId: string
): Promise<{
  canRedeem: boolean
  reason?: string
  requiresApproval?: boolean
}> {
  try {
    // 1. Verificar se pode visualizar o produto
    const canView = await canViewProduct(userId, productId, tenantId)
    if (!canView) {
      return {
        canRedeem: false,
        reason: 'Produto não disponível para seu perfil',
      }
    }

    // 2. Verificar limites de resgate
    const limitsCheck = await checkRedemptionLimits(
      userId,
      productId,
      quantity,
      points,
      tenantId
    )
    if (!limitsCheck.withinLimits) {
      return {
        canRedeem: false,
        reason: limitsCheck.reason,
      }
    }

    // 3. Verificar se requer aprovação
    const approvalCheck = await checkApprovalRequired(
      userId,
      productId,
      quantity,
      points,
      tenantId
    )

    return {
      canRedeem: true,
      requiresApproval: approvalCheck.requiresApproval,
      reason: approvalCheck.reason,
    }
  } catch (error) {
    console.error('Erro ao verificar resgate:', error)
    return {
      canRedeem: false,
      reason: 'Erro interno do sistema',
    }
  }
}

/**
 * Busca tags de um usuário
 */
async function getUserTags(
  userId: string,
  tenantId: string
): Promise<UserTags> {
  const { data, error } = await supabase
    .from('user_tags')
    .select(
      `
      tag_id,
      tags!inner(
        id,
        key,
        value,
        tenant_id
      )
    `
    )
    .eq('user_id', userId)
    .eq('tags.tenant_id', tenantId)

  if (error) {
    throw new Error(`Erro ao buscar tags do usuário: ${error.message}`)
  }

  return {
    userId,
    tenantId,
    tags:
      data?.map(item => ({
        id: item.tags.id,
        key: item.tags.key,
        value: item.tags.value,
      })) || [],
  }
}

/**
 * Busca tags de um produto
 */
async function getProductTags(
  productId: string,
  tenantId: string
): Promise<ProductTags> {
  const { data, error } = await supabase
    .from('product_tags')
    .select(
      `
      tag_id,
      tags!inner(
        id,
        key,
        value,
        tenant_id
      )
    `
    )
    .eq('store_product_id', productId)
    .eq('tags.tenant_id', tenantId)

  if (error) {
    throw new Error(`Erro ao buscar tags do produto: ${error.message}`)
  }

  return {
    productId,
    tenantId,
    tags:
      data?.map(item => ({
        id: item.tags.id,
        key: item.tags.key,
        value: item.tags.value,
      })) || [],
  }
}

/**
 * Busca política de acesso ativa
 */
async function getActiveAccessPolicy(
  tenantId: string
): Promise<AccessPolicy | null> {
  const { data, error } = await supabase
    .from('access_policies')
    .select('*')
    .eq('tenant_id', tenantId)
    .eq('is_active', true)
    .single()

  if (error && error.code !== 'PGRST116') {
    throw new Error(`Erro ao buscar política de acesso: ${error.message}`)
  }

  return data
}

/**
 * Avalia política de acesso
 */
function evaluateAccessPolicy(
  userTags: UserTags,
  productTags: ProductTags,
  accessPolicy: AccessPolicy | null
): boolean {
  // Se não há política ativa, permitir acesso
  if (!accessPolicy) {
    return true
  }

  const { rule } = accessPolicy

  // 1. Verificar se produto tem tags
  if (productTags.tags.length === 0) {
    // Produto sem tags - usar regra padrão
    return rule.defaultAllowUnlessTagged ?? true
  }

  // 2. Verificar interseção de tags
  const userTagMap = new Map(
    userTags.tags.map(tag => [`${tag.key}:${tag.value}`, tag])
  )

  const productTagMap = new Map(
    productTags.tags.map(tag => [`${tag.key}:${tag.value}`, tag])
  )

  // 3. Aplicar lógica de tags
  if (rule.productTagLogic === 'ALL') {
    // Usuário deve ter TODAS as tags do produto
    return productTags.tags.every(productTag =>
      userTagMap.has(`${productTag.key}:${productTag.value}`)
    )
  } else {
    // Usuário deve ter PELO MENOS UMA tag do produto (ANY)
    return productTags.tags.some(productTag =>
      userTagMap.has(`${productTag.key}:${productTag.value}`)
    )
  }
}

/**
 * Verifica limites de resgate
 */
async function checkRedemptionLimits(
  userId: string,
  productId: string,
  quantity: number,
  points: number,
  tenantId: string
): Promise<{
  withinLimits: boolean
  reason?: string
}> {
  try {
    const limitsCheck = await checkLimits(
      userId,
      productId,
      quantity,
      points,
      0,
      tenantId
    )
    return {
      withinLimits: limitsCheck.withinLimits,
      reason: limitsCheck.reason,
    }
  } catch (error) {
    console.error('Erro ao verificar limites de resgate:', error)
    return { withinLimits: false, reason: 'Erro ao verificar limites' }
  }
}

/**
 * Verifica se requer aprovação
 */
async function checkApprovalRequired(
  userId: string,
  productId: string,
  quantity: number,
  points: number,
  tenantId: string
): Promise<{
  requiresApproval: boolean
  reason?: string
}> {
  // TODO: Implementar verificação de aprovação
  // Por enquanto, não requer aprovação
  return { requiresApproval: false }
}

/**
 * Middleware para verificar acesso por tags
 */
export function withABAC<T extends any[]>(
  handler: (...args: T) => Promise<Response>
) {
  return async (...args: T): Promise<Response> => {
    try {
      // Extrair userId, productId, tenantId dos argumentos
      const [request] = args
      const url = new URL(request.url)
      const productId = url.searchParams.get('productId')
      const tenantId = url.searchParams.get('tenantId')

      // TODO: Extrair userId do token JWT
      const userId = 'temp-user-id'

      if (productId && tenantId) {
        const canView = await canViewProduct(userId, productId, tenantId)
        if (!canView) {
          return new Response(JSON.stringify({ error: 'Acesso negado' }), {
            status: 403,
            headers: { 'Content-Type': 'application/json' },
          })
        }
      }

      return handler(...args)
    } catch (error) {
      console.error('Erro no middleware ABAC:', error)
      return new Response(
        JSON.stringify({ error: 'Erro interno do servidor' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }
  }
}
