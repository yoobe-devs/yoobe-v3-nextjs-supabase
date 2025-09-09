import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export interface TimeWindow {
  id: string
  tenantId: string
  name: string
  description?: string
  dow: number[] // 1=Segunda, 2=Terça, ..., 7=Domingo
  startTime: string // HH:MM
  endTime: string // HH:MM
  timezone: string
  isActive: boolean
}

export interface RedemptionLimit {
  id: string
  tenantId: string
  scope: 'user' | 'department' | 'category'
  refId?: string
  period: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly'
  maxQty?: number
  maxPoints?: number
  maxAmount?: number
  isActive: boolean
}

/**
 * Verifica se o acesso está dentro de uma janela de tempo permitida
 */
export async function isWithinTimeWindow(
  tenantId: string,
  timeWindowIds?: number[]
): Promise<{
  isWithinWindow: boolean
  activeWindows: TimeWindow[]
  reason?: string
}> {
  try {
    // Buscar janelas de acesso ativas
    const { data: windows, error } = await supabase
      .from('access_time_windows')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('is_active', true)
      .in('id', timeWindowIds || [])

    if (error) {
      throw new Error(`Erro ao buscar janelas de acesso: ${error.message}`)
    }

    if (!windows || windows.length === 0) {
      return {
        isWithinWindow: true, // Se não há janelas configuradas, permitir acesso
        activeWindows: [],
      }
    }

    const now = new Date()
    const currentDay = now.getDay() === 0 ? 7 : now.getDay() // Converter domingo de 0 para 7
    const currentTime = now
      .toLocaleTimeString('pt-BR', {
        hour12: false,
        timeZone: windows[0].tz || 'America/Sao_Paulo',
      })
      .substring(0, 5)

    const activeWindows: TimeWindow[] = []

    for (const window of windows) {
      // Verificar se o dia da semana está permitido
      if (window.dow.includes(currentDay)) {
        // Verificar se o horário está dentro da janela
        if (
          currentTime >= window.start_time &&
          currentTime <= window.end_time
        ) {
          activeWindows.push({
            id: window.id.toString(),
            tenantId: window.tenant_id.toString(),
            name: window.name,
            description: window.description,
            dow: window.dow,
            startTime: window.start_time,
            endTime: window.end_time,
            timezone: window.tz,
            isActive: window.is_active,
          })
        }
      }
    }

    return {
      isWithinWindow: activeWindows.length > 0,
      activeWindows,
      reason:
        activeWindows.length === 0
          ? 'Fora do horário de acesso permitido'
          : undefined,
    }
  } catch (error) {
    console.error('Erro ao verificar janela de tempo:', error)
    return {
      isWithinWindow: false,
      activeWindows: [],
      reason: 'Erro ao verificar horário de acesso',
    }
  }
}

/**
 * Verifica limites de resgate
 */
export async function checkRedemptionLimits(
  userId: string,
  productId: string,
  quantity: number,
  points: number,
  amount: number,
  tenantId: string
): Promise<{
  withinLimits: boolean
  reason?: string
  limits: RedemptionLimit[]
}> {
  try {
    // Buscar limites de resgate ativos
    const { data: limits, error } = await supabase
      .from('redemption_limits')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('is_active', true)

    if (error) {
      throw new Error(`Erro ao buscar limites de resgate: ${error.message}`)
    }

    if (!limits || limits.length === 0) {
      return {
        withinLimits: true,
        limits: [],
      }
    }

    const activeLimits: RedemptionLimit[] = []
    let withinLimits = true
    let reason: string | undefined

    for (const limit of limits) {
      const limitData: RedemptionLimit = {
        id: limit.id.toString(),
        tenantId: limit.tenant_id.toString(),
        scope: limit.scope,
        refId: limit.ref_id?.toString(),
        period: limit.period,
        maxQty: limit.max_qty,
        maxPoints: limit.max_points,
        maxAmount: limit.max_amount,
        isActive: limit.is_active,
      }

      activeLimits.push(limitData)

      // Verificar se o limite se aplica ao usuário/produto
      if (limit.scope === 'user' && limit.ref_id?.toString() === userId) {
        const usage = await getRedemptionUsage(
          userId,
          productId,
          limit.period,
          tenantId
        )

        if (limit.max_qty && usage.quantity + quantity > limit.max_qty) {
          withinLimits = false
          reason = `Limite de quantidade excedido: ${usage.quantity + quantity}/${limit.max_qty}`
          break
        }

        if (limit.max_points && usage.points + points > limit.max_points) {
          withinLimits = false
          reason = `Limite de pontos excedido: ${usage.points + points}/${limit.max_points}`
          break
        }

        if (limit.max_amount && usage.amount + amount > limit.max_amount) {
          withinLimits = false
          reason = `Limite de valor excedido: R$ ${(usage.amount + amount).toFixed(2)}/R$ ${limit.max_amount.toFixed(2)}`
          break
        }
      }
    }

    return {
      withinLimits,
      reason,
      limits: activeLimits,
    }
  } catch (error) {
    console.error('Erro ao verificar limites de resgate:', error)
    return {
      withinLimits: false,
      reason: 'Erro ao verificar limites de resgate',
      limits: [],
    }
  }
}

/**
 * Busca uso de resgate em um período
 */
async function getRedemptionUsage(
  userId: string,
  productId: string,
  period: string,
  tenantId: string
): Promise<{
  quantity: number
  points: number
  amount: number
}> {
  try {
    // Calcular data de início do período
    const now = new Date()
    let startDate: Date

    switch (period) {
      case 'daily':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        break
      case 'weekly':
        const dayOfWeek = now.getDay()
        startDate = new Date(now.getTime() - dayOfWeek * 24 * 60 * 60 * 1000)
        startDate.setHours(0, 0, 0, 0)
        break
      case 'monthly':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        break
      case 'quarterly':
        const quarter = Math.floor(now.getMonth() / 3)
        startDate = new Date(now.getFullYear(), quarter * 3, 1)
        break
      case 'yearly':
        startDate = new Date(now.getFullYear(), 0, 1)
        break
      default:
        startDate = new Date(0) // Desde o início
    }

    // Buscar resgates no período
    const { data: redemptions, error } = await supabase
      .from('redemptions')
      .select('quantity, points_used, amount_paid')
      .eq('user_id', userId)
      .eq('tenant_id', tenantId)
      .gte('created_at', startDate.toISOString())
      .eq('status', 'completed')

    if (error) {
      throw new Error(`Erro ao buscar resgates: ${error.message}`)
    }

    const usage = redemptions?.reduce(
      (acc, redemption) => ({
        quantity: acc.quantity + (redemption.quantity || 0),
        points: acc.points + (redemption.points_used || 0),
        amount: acc.amount + (redemption.amount_paid || 0),
      }),
      { quantity: 0, points: 0, amount: 0 }
    ) || { quantity: 0, points: 0, amount: 0 }

    return usage
  } catch (error) {
    console.error('Erro ao buscar uso de resgate:', error)
    return { quantity: 0, points: 0, amount: 0 }
  }
}

/**
 * Cria uma janela de acesso
 */
export async function createTimeWindow(
  tenantId: string,
  name: string,
  description: string,
  dow: number[],
  startTime: string,
  endTime: string,
  timezone: string = 'America/Sao_Paulo'
): Promise<TimeWindow> {
  const { data, error } = await supabase
    .from('access_time_windows')
    .insert({
      tenant_id: tenantId,
      name,
      description,
      dow,
      start_time: startTime,
      end_time: endTime,
      tz: timezone,
      is_active: true,
    })
    .select()
    .single()

  if (error) {
    throw new Error(`Erro ao criar janela de acesso: ${error.message}`)
  }

  return {
    id: data.id.toString(),
    tenantId: data.tenant_id.toString(),
    name: data.name,
    description: data.description,
    dow: data.dow,
    startTime: data.start_time,
    endTime: data.end_time,
    timezone: data.tz,
    isActive: data.is_active,
  }
}

/**
 * Cria um limite de resgate
 */
export async function createRedemptionLimit(
  tenantId: string,
  scope: 'user' | 'department' | 'category',
  refId: string,
  period: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly',
  maxQty?: number,
  maxPoints?: number,
  maxAmount?: number
): Promise<RedemptionLimit> {
  const { data, error } = await supabase
    .from('redemption_limits')
    .insert({
      tenant_id: tenantId,
      scope,
      ref_id: refId,
      period,
      max_qty: maxQty,
      max_points: maxPoints,
      max_amount: maxAmount,
      is_active: true,
    })
    .select()
    .single()

  if (error) {
    throw new Error(`Erro ao criar limite de resgate: ${error.message}`)
  }

  return {
    id: data.id.toString(),
    tenantId: data.tenant_id.toString(),
    scope: data.scope,
    refId: data.ref_id?.toString(),
    period: data.period,
    maxQty: data.max_qty,
    maxPoints: data.max_points,
    maxAmount: data.max_amount,
    isActive: data.is_active,
  }
}
