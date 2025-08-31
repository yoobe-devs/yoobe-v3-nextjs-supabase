import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

// PUT - Atualizar status do pedido
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const body = await request.json()
    const { status } = body

    if (!status) {
      return NextResponse.json({ error: 'Status é obrigatório' }, { status: 400 })
    }

    // Verificar se o pedido pertence à loja do gestor
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id, store_id')
      .eq('id', params.id)
      .eq('store_id', userData.store_id)
      .single()

    if (orderError || !order) {
      return NextResponse.json({ error: 'Pedido não encontrado' }, { status: 404 })
    }

    // Atualizar status do pedido
    const { data: updatedOrder, error: updateError } = await supabase
      .from('orders')
      .update({
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)
      .select()
      .single()

    if (updateError) {
      console.error('Erro ao atualizar pedido:', updateError)
      return NextResponse.json({ error: 'Erro ao atualizar pedido' }, { status: 500 })
    }

    return NextResponse.json({ 
      message: 'Status do pedido atualizado com sucesso',
      order: updatedOrder
    })
  } catch (error) {
    console.error('Erro na API de atualização de pedido:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
