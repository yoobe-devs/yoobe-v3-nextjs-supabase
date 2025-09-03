import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

const supabaseService = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'service-role-key-missing'
)

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error || !user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

    const body = await request.json().catch(() => ({}))
    const product_id = body?.product_id as string
    const user_id = body?.user_id as string
    if (!product_id || !user_id) return NextResponse.json({ error: 'Parâmetros inválidos' }, { status: 400 })

    // Buscar produto
    const { data: product, error: prodErr } = await supabaseService
      .from('client_products')
      .select('id,status,stock_quantity,redeemable_points,points_value,client_id')
      .eq('id', product_id)
      .single()
    if (prodErr || !product) return NextResponse.json({ error: 'Produto não encontrado' }, { status: 404 })
    if (product.status !== 'active') return NextResponse.json({ error: 'Produto inativo' }, { status: 422 })
    if (!product.redeemable_points) return NextResponse.json({ error: 'Produto não resgatável por pontos' }, { status: 422 })
    if ((product.stock_quantity || 0) <= 0) return NextResponse.json({ error: 'Estoque indisponível' }, { status: 422 })

    // Validação por tags (se existirem) — produto deve ter alguma tag que o usuário também tenha (política mínima)
    try {
      const { data: pTags } = await supabaseService.from('product_tags').select('tag_id').eq('product_id', product_id)
      if (Array.isArray(pTags) && pTags.length) {
        const { data: uTags } = await supabaseService.from('user_tags').select('tag_id').eq('user_id', user_id)
        const allow = new Set((uTags || []).map((t: any) => t.tag_id))
        const needs = (pTags || []).some((t: any) => allow.has(t.tag_id))
        if (!needs) return NextResponse.json({ error: 'Sem permissão por tags' }, { status: 403 })
      }
    } catch {}

    // Efetivar resgate (sem gateway financeiro): debitar estoque e registrar evento
    const { error: updErr } = await supabaseService
      .from('client_products')
      .update({ stock_quantity: (product.stock_quantity || 0) - 1, updated_at: new Date().toISOString() })
      .eq('id', product_id)
    if (updErr) return NextResponse.json({ error: 'Falha ao atualizar estoque' }, { status: 500 })

    // Registrar (tabela redemptions opcional)
    try {
      await supabaseService.from('redemptions').insert({
        tenant_id: product.client_id,
        user_id,
        store_product_id: product_id,
        qty: 1,
        payment_method: 'points',
        total_points: product.points_value || 0,
        status: 'approved',
        created_by: user.id
      })
    } catch {}

    return NextResponse.json({ success: true })
  } catch (e) {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

