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
    const { items, store_id } = body

    if (!items || !Array.isArray(items) || !store_id) {
      return NextResponse.json(
        { error: 'items (array) e store_id são obrigatórios' },
        { status: 400 }
      )
    }

    const results = {
      success: [],
      failed: [],
      blocked: [],
    }

    // Processar cada item
    for (const item of items) {
      const { store_product_id, quantity = 1 } = item

      if (!store_product_id) {
        results.failed.push({
          store_product_id,
          error: 'store_product_id é obrigatório',
        })
        continue
      }

      // Verificar se o usuário pode resgatar este produto
      const canRedeem = await canRedeemByTags(
        user.id,
        store_product_id,
        store_id
      )

      if (!canRedeem) {
        results.blocked.push({
          store_product_id,
          error:
            'Este produto está disponível apenas para colaboradores com as tags necessárias.',
        })
        continue
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
        results.failed.push({
          store_product_id,
          error: 'Produto não encontrado ou inativo',
        })
        continue
      }

      // Verificar se o usuário já tem este produto no carrinho
      const { data: existingItem, error: existingError } = await supabase
        .from('cart_items')
        .select('*')
        .eq('user_id', user.id)
        .eq('store_product_id', store_product_id)
        .single()

      if (existingError && existingError.code !== 'PGRST116') {
        results.failed.push({
          store_product_id,
          error: 'Erro ao verificar item existente',
        })
        continue
      }

      try {
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
            results.failed.push({
              store_product_id,
              error: 'Erro ao atualizar carrinho',
            })
            continue
          }

          results.success.push({
            store_product_id,
            action: 'updated',
            quantity: existingItem.quantity + quantity,
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
            results.failed.push({
              store_product_id,
              error: 'Erro ao adicionar ao carrinho',
            })
            continue
          }

          results.success.push({
            store_product_id,
            action: 'added',
            quantity,
          })
        }
      } catch (error) {
        results.failed.push({
          store_product_id,
          error: 'Erro interno',
        })
      }
    }

    return NextResponse.json({
      message: 'Processamento em lote concluído',
      results,
      summary: {
        total: items.length,
        success: results.success.length,
        failed: results.failed.length,
        blocked: results.blocked.length,
      },
    })
  } catch (error) {
    console.error('Erro no bulk-add:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
