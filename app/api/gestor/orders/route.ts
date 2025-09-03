import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

// GET - Buscar pedidos da empresa do gestor
export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Buscar dados do usuário
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('company_id, role, store_id')
      .eq('id', user.id)
      .single()

    if (userError || !userData) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }

    if (userData.role !== 'manager') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    // Buscar pedidos da loja
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select(`
        *,
        users (
          id,
          full_name,
          email
        ),
        order_items (
          id,
          quantity,
          unit_price,
          points_cost,
          company_products (
            id,
            name,
            image_url
          )
        )
      `)
      .eq('store_id', userData.store_id)
      .order('created_at', { ascending: false })

    if (ordersError) {
      console.error('Erro ao buscar pedidos:', ordersError)
      return NextResponse.json({ error: 'Erro ao buscar pedidos' }, { status: 500 })
    }

    return NextResponse.json(orders || [])
  } catch (error) {
    console.error('Erro na API de pedidos do gestor:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
