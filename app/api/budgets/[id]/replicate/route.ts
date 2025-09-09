import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createRouteHandlerClient({ cookies })

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user)
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  const role = (user.user_metadata as any)?.role
  const isAdmin = ['admin', 'admin_global', 'superadmin'].includes(String(role))
  const isGestor = ['manager', 'gestor', 'admin_gestor'].includes(String(role))

  const budgetId = params.id

  // Checar budget + gate
  const { data: budget, error: eBudget } = await supabase
    .from('budgets')
    .select('id, status, replication_released, company_id')
    .eq('id', budgetId)
    .maybeSingle()
  if (eBudget || !budget)
    return NextResponse.json(
      { error: 'Orçamento não encontrado' },
      { status: 404 }
    )

  if (!isAdmin) {
    const okStatus = ['paid', 'approved']
    if (
      !okStatus.includes(String(budget.status)) ||
      !budget.replication_released
    ) {
      return NextResponse.json(
        { error: 'Replicação não liberada' },
        { status: 403 }
      )
    }
  }

  // Itens elegíveis
  const { data: items, error: eItems } = await supabase
    .from('budget_items')
    .select('id, base_product_id')
    .eq('budget_id', budgetId)
    .eq('replication_allowed', true)
    .is('replicated_at', null)
  if (eItems)
    return NextResponse.json({ error: eItems.message }, { status: 500 })
  if (!items?.length)
    return NextResponse.json(
      { error: 'no_items_to_replicate' },
      { status: 409 }
    )

  // Buscar códigos base/client
  const { data: company } = await supabase
    .from('companies')
    .select('id, client_code')
    .eq('id', budget.company_id)
    .maybeSingle()
  const clientCode = company?.client_code || 'CLIENT'

  const baseIds = items.map((i: any) => i.base_product_id)
  const { data: bases } = await supabase
    .from('base_products')
    .select(
      'id, base_code, name, description, base_price, base_points_cost, category_id'
    )
    .in('id', baseIds)
  const byId = new Map((bases || []).map((b: any) => [b.id, b]))

  const sink = (
    process.env.REPLICATION_SINK || 'company_products'
  ).toLowerCase()
  const created: any[] = []

  for (const it of items) {
    const base = byId.get(it.base_product_id)
    if (!base) continue

    // SKU/EAN
    const { data: skuRow } = await supabase.rpc('make_final_sku', {
      company_id: budget.company_id,
      base_code: base.base_code || base.name || 'BASE',
      client_code: clientCode,
    } as any)
    const finalSku = Array.isArray(skuRow) ? skuRow[0] : skuRow
    const { data: eanRow } = await supabase.rpc('gen_ean13', {
      sku: finalSku,
    } as any)
    const ean13 = Array.isArray(eanRow) ? eanRow[0] : eanRow

    if (sink === 'company_products') {
      const { data: cp, error: ecp } = await supabase
        .from('company_products')
        .insert({
          company_id: budget.company_id,
          base_product_id: base.id,
          name: base.name,
          description: base.description,
          price: base.base_price,
          points_cost: base.base_points_cost,
          category_id: base.category_id,
          status: 'inactive',
          final_sku: finalSku,
          ean_13: ean13,
        })
        .select('id')
        .single()
      if (ecp) return NextResponse.json({ error: ecp.message }, { status: 500 })
      created.push(cp)
    } else {
      const { data: ps, error: eps } = await supabase
        .from('product_store')
        .insert({
          tenant_id: budget.company_id,
          company_id: budget.company_id,
          base_product_id: base.id,
          name: base.name,
          description: base.description,
          price: base.base_price,
          points_cost: base.base_points_cost,
          category_id: base.category_id,
          status: 'inactive',
          is_replicated: true,
          source_budget_id: budgetId,
          final_sku: finalSku,
          ean_13: ean13,
        })
        .select('id')
        .single()
      if (eps) return NextResponse.json({ error: eps.message }, { status: 500 })
      created.push(ps)
    }
  }

  // Marcar itens como replicados
  const { error: upd } = await supabase
    .from('budget_items')
    .update({ replicated_at: new Date().toISOString() })
    .eq('budget_id', budgetId)
    .eq('replication_allowed', true)
    .is('replicated_at', null)
  if (upd) return NextResponse.json({ error: upd.message }, { status: 500 })

  // Audit
  try {
    await supabase.from('audit_log').insert({
      event_type: 'replicate',
      actor_id: user.id,
      target: 'budgets',
      target_id: budgetId,
      payload: { sink, created: created.length },
      created_at: new Date().toISOString(),
    })
  } catch {}

  return NextResponse.json({ ok: true, created: created.length })
}
