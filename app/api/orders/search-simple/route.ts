import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// GET - Buscar pedidos por número (versão simples sem autenticação)
export async function GET(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { error: 'Configuração do Supabase não encontrada' },
        { status: 500 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseKey)
    const { searchParams } = new URL(request.url)

    const orderNumber = searchParams.get('order_number')

    if (!orderNumber) {
      return NextResponse.json(
        { error: 'Número do pedido é obrigatório' },
        { status: 400 }
      )
    }

    // Query simples - primeiro vamos ver todos os pedidos para entender a estrutura
    const { data: allOrders, error: allError } = await supabase
      .from('orders')
      .select('*')
      .limit(5)

    if (allError) {
      console.error('Erro ao buscar todos os pedidos:', allError)
      return NextResponse.json(
        { error: 'Erro ao buscar pedidos: ' + allError.message },
        { status: 500 }
      )
    }

    // Filtrar pelo número do pedido (pode ser em diferentes campos)
    const filteredOrders = allOrders?.filter(order => {
      return order.order_number === orderNumber || 
             order.id === orderNumber ||
             order.tracking_code === orderNumber
    }) || []

    return NextResponse.json({
      success: true,
      data: filteredOrders,
      count: filteredOrders.length,
      debug: {
        totalOrders: allOrders?.length || 0,
        searchTerm: orderNumber,
        availableFields: allOrders?.[0] ? Object.keys(allOrders[0]) : []
      }
    })
  } catch (error) {
    console.error('Erro na API de busca de pedidos:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor: ' + error.message },
      { status: 500 }
    )
  }
}
