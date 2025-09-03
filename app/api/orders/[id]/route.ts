import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

// GET - Buscar pedido específico
export async function GET(
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

    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        companies(name),
        users(name, email)
      `)
      .eq('id', params.id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Pedido não encontrado' }, { status: 404 })
      }
      console.error('Erro ao buscar pedido:', error)
      return NextResponse.json({ error: 'Erro ao buscar pedido' }, { status: 500 })
    }

    return NextResponse.json({ order: data })

  } catch (error) {
    console.error('Erro na API de pedido:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

// PUT - Atualizar pedido
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

    const body = await request.json()
    const { 
      status, 
      total_amount, 
      points_used, 
      currency, 
      items,
      shipping_address,
      notes
    } = body

    // Validações
    if (total_amount !== undefined && total_amount < 0) {
      return NextResponse.json({ error: 'Valor total deve ser positivo' }, { status: 400 })
    }

    // Atualizar pedido
    const { data, error } = await supabase
      .from('orders')
      .update({
        status,
        total_amount,
        points_used,
        currency,
        items,
        shipping_address,
        notes,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)
      .select(`
        *,
        companies(name),
        users(name, email)
      `)
      .single()

    if (error) {
      console.error('Erro ao atualizar pedido:', error)
      return NextResponse.json({ error: 'Erro ao atualizar pedido' }, { status: 500 })
    }

    return NextResponse.json({ order: data, message: 'Pedido atualizado com sucesso' })

  } catch (error) {
    console.error('Erro na API de pedido:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

// DELETE - Excluir pedido
export async function DELETE(
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

    // Verificar se o pedido existe
    const { data: existingOrder } = await supabase
      .from('orders')
      .select('id, status')
      .eq('id', params.id)
      .single()

    if (!existingOrder) {
      return NextResponse.json({ error: 'Pedido não encontrado' }, { status: 404 })
    }

    // Verificar se o pedido pode ser excluído
    if (existingOrder.status === 'confirmed' || existingOrder.status === 'shipped') {
      return NextResponse.json({ 
        error: 'Não é possível excluir um pedido confirmado ou enviado' 
      }, { status: 400 })
    }

    // Excluir pedido
    const { error } = await supabase
      .from('orders')
      .delete()
      .eq('id', params.id)

    if (error) {
      console.error('Erro ao excluir pedido:', error)
      return NextResponse.json({ error: 'Erro ao excluir pedido' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Pedido excluído com sucesso' })

  } catch (error) {
    console.error('Erro na API de pedido:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
