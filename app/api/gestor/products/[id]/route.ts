import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

const supabaseUrl = 'http://localhost:54321'
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

const supabaseService = createClient(supabaseUrl, serviceKey)

// PUT - Atualizar produto
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

    // Buscar dados do usuário usando service role
    const { data: userData, error: userError } = await supabaseService
      .from('users')
      .select('company_id, role, store_id')
      .eq('id', user.id)
      .single()

    if (userError || !userData) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }

    if (!['manager','gestor'].includes(userData.role)) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const body = await request.json()
    const { name, description, price, points_cost, stock_quantity, image_url, category_id, status } = body

    // Verificar se o produto pertence à loja do gestor
    const { data: product, error: productError } = await supabaseService
      .from('client_products')
      .select('id, store_id')
      .eq('id', params.id)
      .eq('store_id', userData.store_id)
      .single()

    if (productError || !product) {
      return NextResponse.json({ error: 'Produto não encontrado' }, { status: 404 })
    }

    // Atualizar produto
    const { data: updatedProduct, error: updateError } = await supabaseService
      .from('client_products')
      .update({
        name,
        description,
        price,
        stock_quantity,
        image_url,
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)
      .select()
      .single()

    if (updateError) {
      console.error('Erro ao atualizar produto:', updateError)
      return NextResponse.json({ error: 'Erro ao atualizar produto' }, { status: 500 })
    }

    return NextResponse.json({ 
      message: 'Produto atualizado com sucesso',
      product: updatedProduct
    })
  } catch (error) {
    console.error('Erro na API de produtos do gestor:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

// DELETE - Excluir produto
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

    // Buscar dados do usuário usando service role
    const { data: userData, error: userError } = await supabaseService
      .from('users')
      .select('company_id, role, store_id')
      .eq('id', user.id)
      .single()

    if (userError || !userData) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }

    if (!['manager','gestor'].includes(userData.role)) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    // Verificar se o produto pertence à loja do gestor
    const { data: product, error: productError } = await supabaseService
      .from('client_products')
      .select('id, store_id')
      .eq('id', params.id)
      .eq('store_id', userData.store_id)
      .single()

    if (productError || !product) {
      return NextResponse.json({ error: 'Produto não encontrado' }, { status: 404 })
    }

    // Excluir produto
    const { error: deleteError } = await supabaseService
      .from('client_products')
      .delete()
      .eq('id', params.id)

    if (deleteError) {
      console.error('Erro ao excluir produto:', deleteError)
      return NextResponse.json({ error: 'Erro ao excluir produto' }, { status: 500 })
    }

    return NextResponse.json({ 
      message: 'Produto excluído com sucesso'
    })
  } catch (error) {
    console.error('Erro na API de produtos do gestor:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
