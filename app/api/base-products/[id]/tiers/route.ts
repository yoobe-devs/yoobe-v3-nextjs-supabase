import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data, error } = await supabase
      .from('base_pricing_tiers')
      .select('*')
      .eq('base_product_id', params.id)
      .order('min_qty', { ascending: true })
    if (error) throw error
    return NextResponse.json(data)
  } catch (e) {
    return NextResponse.json({ error: 'Erro ao listar tiers' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || user.user_metadata?.role !== 'admin') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }
    const body = await request.json()
    const { min_qty, unit_price, discount_pct } = body as { min_qty: number, unit_price?: number, discount_pct?: number }
    if (!min_qty || min_qty <= 0) {
      return NextResponse.json({ error: 'min_qty inválido' }, { status: 400 })
    }
    const { data, error } = await supabase
      .from('base_pricing_tiers')
      .insert({ base_product_id: params.id, min_qty, unit_price: unit_price ?? null, discount_pct: discount_pct ?? null })
      .select('*')
      .single()
    if (error) throw error
    return NextResponse.json(data, { status: 201 })
  } catch (e) {
    return NextResponse.json({ error: 'Erro ao criar tier' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || user.user_metadata?.role !== 'admin') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }
    const { searchParams } = new URL(request.url)
    const tierId = searchParams.get('tierId')
    if (!tierId) return NextResponse.json({ error: 'tierId requerido' }, { status: 400 })
    const { error } = await supabase.from('base_pricing_tiers').delete().eq('id', tierId)
    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (e) {
    return NextResponse.json({ error: 'Erro ao remover tier' }, { status: 500 })
  }
}


