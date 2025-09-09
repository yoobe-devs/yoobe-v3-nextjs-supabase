import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321'
const serviceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'
const service = createClient(supabaseUrl, serviceKey)

function isUuid(v: any) {
  return typeof v === 'string' && /^[0-9a-fA-F-]{36}$/.test(v)
}

async function authUser(request: NextRequest) {
  const sb = createRouteHandlerClient({ cookies })
  let {
    data: { user },
    error,
  } = await sb.auth.getUser()
  if (!user) {
    const h = request.headers.get('authorization')
    if (h?.startsWith('Bearer ')) {
      const tok = h.substring(7)
      const info = await service.auth.getUser(tok)
      user = info.data.user || null
      error = info.error || null
    }
  }
  return { user, error }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user, error } = await authUser(request)
    if (error || !user)
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    const role = (user.user_metadata as any)?.role
    if (
      !['gestor', 'manager', 'admin', 'admin_global', 'superadmin'].includes(
        role
      )
    ) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const budgetId = params.id
    if (!isUuid(budgetId))
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 })
    const companyId = (user.user_metadata as any)?.company_id
    if (!isUuid(companyId))
      return NextResponse.json({ error: 'Empresa inválida' }, { status: 400 })

    // Carregar orçamento aprovado e itens
    const { data: budget, error: bErr } = await service
      .from('budgets')
      .select('id,status,company_id')
      .eq('id', budgetId)
      .eq('company_id', companyId)
      .single()
    if (bErr || !budget)
      return NextResponse.json(
        { error: 'Orçamento não encontrado' },
        { status: 404 }
      )
    if (budget.status !== 'approved')
      return NextResponse.json(
        { error: 'Orçamento não está aprovado' },
        { status: 409 }
      )

    const { data: items, error: iErr } = await service
      .from('budget_items')
      .select(
        'base_product_id, quantity, custom_price, custom_points_cost, base_products ( id, name, description, base_price, base_points_cost )'
      )
      .eq('budget_id', budgetId)
    if (iErr)
      return NextResponse.json(
        { error: 'Erro ao carregar itens' },
        { status: 500 }
      )

    let created = 0,
      existed = 0,
      errors: any[] = []
    for (const it of items || []) {
      // Verificar se já existe em company_products
      const { data: exists } = await service
        .from('company_products')
        .select('id')
        .eq('company_id', companyId)
        .eq('base_product_id', it.base_product_id)
        .maybeSingle()
      if (exists) {
        existed++
        continue
      }

      const base = (it as any).base_products
      const price = it.custom_price ?? base?.base_price ?? 0
      // Compose SKU components
      const { data: company } = await service
        .from('companies')
        .select('name, client_code')
        .eq('id', companyId)
        .single()
      const clientCode = (
        company?.client_code ||
        (company?.name ?? 'cliente')
      ).toString()
      const sanitizedClient = clientCode
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
      const baseCode = (base?.id || it.base_product_id).toString().slice(0, 8)
      // Best-effort next sequence via sku_counters or fallback later
      let finalSku: string | null = null
      try {
        const { data: seq } = await service.rpc('next_company_seq', {
          p_company: companyId,
        })
        const padded = String(seq || 1).padStart(4, '0')
        finalSku = `${baseCode}-${padded}-${sanitizedClient}`
      } catch {
        // Fallback: try to find max seq via regex on existing final_sku
        const { data: list } = await service
          .from('company_products')
          .select('final_sku')
          .eq('company_id', companyId)
          .order('created_at', { ascending: false })
          .limit(200)
        let maxSeq = 0
        for (const r of list || []) {
          const m = String(r.final_sku || '').match(/-(\d{4})-/)
          if (m) maxSeq = Math.max(maxSeq, parseInt(m[1], 10))
        }
        const next = (maxSeq + 1).toString().padStart(4, '0')
        finalSku = `${baseCode}-${next}-${sanitizedClient}`
      }

      // Generate EAN-13
      let ean13: string | null = null
      try {
        const { data } = await service.rpc('gen_ean13', { p: finalSku })
        ean13 = (data as any) || null
      } catch {
        const digits = (finalSku || '')
          .replace(/[^0-9]/g, '')
          .slice(0, 12)
          .padEnd(12, '0')
        let sum = 0
        for (let i = 0; i < 12; i++)
          sum += (i % 2 === 0 ? 1 : 3) * parseInt(digits[i] || '0', 10)
        const chk = (10 - (sum % 10)) % 10
        ean13 = digits + String(chk)
      }

      const insert: any = {
        company_id: companyId,
        base_product_id: it.base_product_id,
        name: base?.name || 'Produto do Orçamento',
        description: base?.description || null,
        price,
        is_active: false,
        stock_quantity: 0,
        final_sku: finalSku,
        ean_13: ean13,
        source_budget_id: budgetId,
      }
      const { error: insErr } = await service
        .from('company_products')
        .insert(insert)
      if (insErr) errors.push(insErr.message)
      else created++
    }

    return NextResponse.json({ success: true, created, existed, errors })
  } catch (e) {
    console.error('replicate budget error', e)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
