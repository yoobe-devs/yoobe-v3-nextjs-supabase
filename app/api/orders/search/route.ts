import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

// GET - Buscar pedidos por número
export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { searchParams } = new URL(request.url)

    const orderNumber = searchParams.get('order_number')
    const email = searchParams.get('email')

    if (!orderNumber && !email) {
      return NextResponse.json(
        {
          error: 'Número do pedido ou email é obrigatório',
        },
        { status: 400 }
      )
    }

    // Construir query base (simplificada para evitar problemas de RLS)
    let query = supabase.from('orders').select(`
        id,
        order_number,
        status,
        total_amount,
        created_at,
        shipping_address
      `)

    // Aplicar filtros
    if (orderNumber) {
      query = query.eq('order_number', orderNumber)
    }

    // Filtro por email removido temporariamente para evitar problemas de RLS
    // if (email) {
    //   query = query.eq('users.email', email)
    // }

    // Executar query
    const { data: orders, error } = await query

    if (error) {
      console.error('Erro ao buscar pedidos:', error)
      return NextResponse.json(
        {
          error: 'Erro ao buscar pedidos',
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: orders || [],
      count: orders?.length || 0,
    })
  } catch (error) {
    console.error('Erro na API de busca de pedidos:', error)
    return NextResponse.json(
      {
        error: 'Erro interno do servidor',
      },
      { status: 500 }
    )
  }
}
