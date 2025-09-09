import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321'
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
const supabaseService = createClient(supabaseUrl, serviceKey)

function isValidUuid(value: unknown): value is string {
  return typeof value === 'string' && /^[0-9a-fA-F-]{36}$/.test(value)
}

async function authenticateUser(request: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies })
  let { data: { user }, error } = await supabase.auth.getUser()
  if (!user) {
    const authHeader = request.headers.get('authorization')
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.substring(7)
      const info = await supabaseService.auth.getUser(token)
      user = info.data.user || null
      error = info.error || null
    }
  }
  return { user, error }
}

// GET - Buscar orçamento por ID (com relacionamentos)
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const budgetId = params.id
    if (!isValidUuid(budgetId)) return NextResponse.json({ error: 'ID inválido' }, { status: 400 })

    const { user, error } = await authenticateUser(request)
    if (error || !user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

    const { data: budget, error: fetchError } = await supabaseService
      .from('budgets')
      .select(`
        *,
        budget_items (
          id,
          base_product_id,
          quantity,
          custom_price,
          custom_points_cost,
          notes,
          base_products (
            id,
            name,
            description,
            base_price,
            base_points_cost,
            image_url,
            product_categories ( id, name )
          )
        )
      `)
      .eq('id', budgetId)
      .single()

    if (fetchError || !budget) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 })

    return NextResponse.json({ success: true, budget })
  } catch (e) {
    console.error('get budget error', e)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

// PATCH - Editar orçamento (titulo/descrição/itens) enquanto em draft
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const budgetId = params.id
    if (!isValidUuid(budgetId)) return NextResponse.json({ error: 'ID inválido' }, { status: 400 })

    const { user, error } = await authenticateUser(request)
    if (error || !user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

    const role = (user.user_metadata as any)?.role
    if (!['manager','gestor','admin','admin_global','superadmin'].includes(role)) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const body = await request.json()
    const { title, description, items } = body

    // Buscar orçamento atual
    const { data: existing, error: fetchError } = await supabaseService
      .from('budgets')
      .select('*')
      .eq('id', budgetId)
      .single()
    if (fetchError || !existing) return NextResponse.json({ error: 'Orçamento não encontrado' }, { status: 404 })

    if (!['draft','rejected'].includes(existing.status)) {
      return NextResponse.json({ error: `Não é possível editar em status ${existing.status}` }, { status: 409 })
    }

    let totalAmount = existing.total_amount || 0
    let totalPoints = existing.total_points || 0

    // Se incluir itens, recalcular totais substituindo os existentes
    if (Array.isArray(items)) {
      totalAmount = 0
      totalPoints = 0
      // Apaga itens antigos
      await supabaseService.from('budget_items').delete().eq('budget_id', budgetId)
      // Recria
      const toInsert: any[] = []
      for (const it of items) {
        if (!isValidUuid(it.base_product_id)) continue
        const { data: bp } = await supabaseService
          .from('base_products')
          .select('base_price, base_points_cost')
          .eq('id', it.base_product_id)
          .single()
        const quantity = it.quantity && it.quantity > 0 ? it.quantity : 1
        const price = it.custom_price ?? bp?.base_price ?? 0
        const pts = it.custom_points_cost ?? bp?.base_points_cost ?? 0
        totalAmount += price * quantity
        totalPoints += pts * quantity
        toInsert.push({
          budget_id: budgetId,
          base_product_id: it.base_product_id,
          quantity,
          custom_price: it.custom_price ?? null,
          custom_points_cost: it.custom_points_cost ?? null,
          notes: it.notes ?? null,
        })
      }
      if (toInsert.length) {
        const { error: insErr } = await supabaseService.from('budget_items').insert(toInsert)
        if (insErr) return NextResponse.json({ error: 'Falha ao atualizar itens' }, { status: 500 })
      }
    }

    const updateData: any = {
      updated_at: new Date().toISOString(),
      updated_by: user.id,
      total_amount: totalAmount,
      total_points: totalPoints,
    }
    if (typeof title === 'string') updateData.title = title.trim()
    if (typeof description === 'string') updateData.description = description.trim()

    const { data: updated, error: updErr } = await supabaseService
      .from('budgets')
      .update(updateData)
      .eq('id', budgetId)
      .select('*')
      .single()
    if (updErr) return NextResponse.json({ error: 'Falha ao atualizar orçamento' }, { status: 500 })

    return NextResponse.json({ success: true, budget: updated })
  } catch (e) {
    console.error('edit budget error', e)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
