// DEV route - only enabled in development
// Note: This check is at module level, so server restart may be needed
// Temporarily disabled build guard for testing
// if (process.env.NODE_ENV === "production" || process.env.ENABLE_DEV_ROUTES !== "true") {
//   throw new Error("DEV route disabled in this environment");
// }

import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@supabase/supabase-js'

// Configs do segmento/route (evitar cache/stale)
export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'

// Schema flexível que aceita tanto formato antigo quanto novo
const ItemSchema = z
  .object({
    base_product_id: z.string().uuid(),
    // Aceita tanto formato antigo quanto novo
    qty: z.number().int().positive().optional(),
    quantity: z.number().int().positive().optional(),
    unit_price: z.number().nonnegative().default(0).optional(),
    custom_price: z.number().nonnegative().default(0).optional(),
    unit_points: z.number().int().nonnegative().default(0).optional(),
    custom_points_cost: z.number().int().nonnegative().default(0).optional(),
    notes: z.string().max(500).optional(),
  })
  .refine(data => data.qty || data.quantity, {
    message: 'Either qty or quantity is required',
  })
  .refine(
    data => data.unit_price !== undefined || data.custom_price !== undefined,
    { message: 'Either unit_price or custom_price is required' }
  )

const CreateBudgetSchema = z.object({
  company_id: z.string().uuid(),
  customer_company_id: z.string().uuid().optional(),
  manager_id: z.string().uuid().optional(),
  title: z.string().max(200).optional(),
  status: z.string().optional(),
  notes: z.string().max(1000).optional(),
  items: z.array(ItemSchema).min(1),
})

export async function POST(req: Request) {
  // Double protection at runtime
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'Disabled in production' },
      { status: 403 }
    )
  }

  try {
    const body = await req.json()

    // Reject product_id (force base_product_id)
    if (JSON.stringify(body).includes('"product_id"')) {
      return NextResponse.json(
        { error: 'Use base_product_id (product_id is not allowed)' },
        { status: 400 }
      )
    }

    // Validate payload
    const parse = CreateBudgetSchema.safeParse(body)
    if (!parse.success) {
      return NextResponse.json(
        {
          error: 'Invalid payload',
          details: parse.error.format(),
        },
        { status: 400 }
      )
    }

    const {
      company_id,
      customer_company_id,
      manager_id,
      title,
      status,
      notes,
      items,
    } = parse.data

    // Initialize Supabase client with service role (server-only)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    )

    // 1) Resolve manager_id with fallback
    const resolvedManagerId = await resolveManagerId(supabase, manager_id)

    // 2) Normalizar items para formato atual (Shape B)
    const normalizedItems = items.map(item => ({
      base_product_id: item.base_product_id,
      quantity: item.quantity || item.qty || 1,
      custom_price: item.custom_price || item.unit_price || 0,
      custom_points_cost: item.custom_points_cost || item.unit_points || 0,
      notes: item.notes || null,
    }))

    // 3) Cálculo server-side (subtotais e totais)
    const computedItems = normalizedItems.map(item => ({
      ...item,
      subtotal_cash: +(item.quantity * item.custom_price).toFixed(2),
      subtotal_points: item.quantity * item.custom_points_cost,
    }))

    const totalAmount = computedItems.reduce(
      (sum, item) => sum + item.subtotal_cash,
      0
    )

    // 4) Mapeamento para Shape B (real atual) - SEM introspecção por enquanto
    const budgetData = {
      company_id,
      manager_id: resolvedManagerId,
      title: title || 'Orçamento DEV',
      status: status || 'pending',
      total_amount: totalAmount,
      ...(customer_company_id && { customer_company_id }),
      ...(notes && { notes }),
    }

    // 5) Insert budget
    const { data: budget, error: budgetError } = await supabase
      .from('budgets')
      .insert(budgetData)
      .select('id')
      .single()

    if (budgetError) {
      console.error('Budget creation error:', budgetError)
      return NextResponse.json(
        {
          error: 'Failed to create budget',
          details: budgetError.message,
        },
        { status: 500 }
      )
    }

    // 6) Insert budget items (Shape B - real atual)
    const itemData = computedItems.map(item => ({
      budget_id: budget.id,
      base_product_id: item.base_product_id,
      quantity: item.quantity,
      custom_price: item.custom_price,
      custom_points_cost: item.custom_points_cost,
      ...(item.notes && { notes: item.notes }),
    }))

    const { error: itemsError } = await supabase
      .from('budget_items')
      .insert(itemData)

    if (itemsError) {
      // Manual rollback: delete the budget if items failed
      await supabase.from('budgets').delete().eq('id', budget.id)
      console.error('Budget items creation error:', itemsError)
      return NextResponse.json(
        {
          error: 'Failed to create budget items',
          details: itemsError.message,
        },
        { status: 500 }
      )
    }

    // 7) Audit
    try {
      await supabase.from('audit_log').insert({
        event: 'budget.dev_created',
        details: {
          budget_id: budget.id,
          company_id,
          customer_company_id,
          created_by: resolvedManagerId,
          total_amount,
          items_count: computedItems.length,
        },
      })
    } catch (auditError) {
      console.log('Audit log skipped (table may not exist)')
    }

    // 8) Retorno
    return NextResponse.json({
      ok: true,
      id: budget.id,
      total_amount: totalAmount,
      items_count: computedItems.length,
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

async function resolveManagerId(
  supabase: any,
  preferred?: string
): Promise<string> {
  if (preferred) return preferred

  // 1) Try to find gestor@yoobe.com
  try {
    const { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('email', 'gestor@yoobe.com')
      .eq('is_active', true)
      .single()

    if (user) return user.id
  } catch (error) {
    console.log('gestor@yoobe.com not found, trying first active user')
  }

  // 2) Try to find any active user
  try {
    const { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('is_active', true)
      .limit(1)
      .single()

    if (user) return user.id
  } catch (error) {
    console.log('No active users found')
  }

  throw new Error('No manager_id could be resolved')
}
