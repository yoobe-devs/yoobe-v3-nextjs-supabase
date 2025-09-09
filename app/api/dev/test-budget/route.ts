import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@supabase/supabase-js'

const CreateBudgetSchema = z.object({
  company_id: z.string().uuid(),
  title: z.string().optional(),
  items: z
    .array(
      z.object({
        base_product_id: z.string().uuid(),
        quantity: z.number().int().positive(),
        custom_price: z.number().nonnegative().default(0),
        custom_points_cost: z.number().int().nonnegative().default(0),
      })
    )
    .min(1),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const parse = CreateBudgetSchema.safeParse(body)

    if (!parse.success) {
      return NextResponse.json(
        { error: 'Invalid payload', details: parse.error.format() },
        { status: 400 }
      )
    }

    const { company_id, title, items } = parse.data

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    )

    // Calculate total
    const totalAmount = items.reduce(
      (sum, item) => sum + item.quantity * item.custom_price,
      0
    )

    // Create budget
    const { data: budget, error: budgetError } = await supabase
      .from('budgets')
      .insert({
        company_id,
        manager_id: '550e8400-e29b-41d4-a716-446655440000',
        title: title || 'Test Budget',
        total_amount: totalAmount,
        status: 'pending',
      })
      .select('id')
      .single()

    if (budgetError) {
      return NextResponse.json(
        { error: 'Failed to create budget', details: budgetError.message },
        { status: 500 }
      )
    }

    // Create budget items
    const budgetItems = items.map(item => ({
      budget_id: budget.id,
      base_product_id: item.base_product_id,
      quantity: item.quantity,
      custom_price: item.custom_price,
      custom_points_cost: item.custom_points_cost,
    }))

    const { error: itemsError } = await supabase
      .from('budget_items')
      .insert(budgetItems)

    if (itemsError) {
      // Rollback
      await supabase.from('budgets').delete().eq('id', budget.id)
      return NextResponse.json(
        { error: 'Failed to create budget items', details: itemsError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      ok: true,
      id: budget.id,
      total_amount: totalAmount,
      items_count: items.length,
    })
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
