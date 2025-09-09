import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { canRedeemByTags } from '@/lib/tag-gate'

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { store_product_id, store_id, quantity = 1 } = body

    if (!store_product_id || !store_id) {
      return NextResponse.json(
        { error: 'store_product_id e store_id são obrigatórios' },
        { status: 400 }
      )
    }

    // Verificar se o usuário pode resgatar este produto
    const canRedeem = await canRedeemByTags(user.id, store_product_id, store_id)

    if (!canRedeem) {
      return NextResponse.json(
        {
          error:
            'Este produto está disponível apenas para colaboradores com as tags necessárias.',
          code: 'TAG_GATE_BLOCKED',
        },
        { status: 403 }
      )
    }

    // Verificar se o produto existe e está ativo
    const { data: product, error: productError } = await supabase
      .from('store_products')
      .select('*')
      .eq('id', store_product_id)
      .eq('store_id', store_id)
      .eq('is_active', true)
      .single()

    if (productError || !product) {
      return NextResponse.json(
        { error: 'Produto não encontrado ou inativo' },
        { status: 404 }
      )
    }

    // Verificar se o usuário já tem este produto no carrinho
    const { data: existingItem, error: existingError } = await supabase
      .from('cart_items')
      .select('*')
      .eq('user_id', user.id)
      .eq('store_product_id', store_product_id)
      .single()

    if (existingError && existingError.code !== 'PGRST116') {
      console.error('Erro ao verificar item existente:', existingError)
      return NextResponse.json(
        { error: 'Erro interno do servidor' },
        { status: 500 }
      )
    }

    if (existingItem) {
      // Atualizar quantidade
      const { error: updateError } = await supabase
        .from('cart_items')
        .update({
          quantity: existingItem.quantity + quantity,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingItem.id)

      if (updateError) {
        console.error('Erro ao atualizar item do carrinho:', updateError)
        return NextResponse.json(
          { error: 'Erro ao atualizar carrinho' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        message: 'Item atualizado no carrinho',
        item: { ...existingItem, quantity: existingItem.quantity + quantity },
      })
    } else {
      // Adicionar novo item
      const { data: newItem, error: insertError } = await supabase
        .from('cart_items')
        .insert({
          user_id: user.id,
          store_product_id,
          quantity,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (insertError) {
        console.error('Erro ao adicionar item ao carrinho:', insertError)
        return NextResponse.json(
          { error: 'Erro ao adicionar ao carrinho' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        message: 'Item adicionado ao carrinho',
        item: newItem,
      })
    }
  } catch (error) {
    console.error('Erro ao adicionar ao carrinho:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

