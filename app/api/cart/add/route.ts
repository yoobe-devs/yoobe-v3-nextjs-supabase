import { NextRequest, NextResponse } from 'next/server'
import { requireUser } from '@/lib/auth'
import { AddToCartDTO } from '@/lib/validation'
import { addToCart, getOrCreateCart } from '@/lib/cart'
import { audit } from '@/lib/audit'

export async function POST(req: NextRequest) {
  try {
    const { userId, companyId } = await requireUser()
    const body = await req.json()
    const dto = AddToCartDTO.parse(body)
    const cartId = await getOrCreateCart(userId, companyId)
    await addToCart(userId, dto.productId, dto.quantity, dto.unitPrice, dto.points, dto.metadata)
    await audit('cart_item_added', 'cart', userId, cartId, { productId: dto.productId, qty: dto.quantity })
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    const status = e?.status || 400
    return NextResponse.json({ error: e?.message || 'Bad request' }, { status })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { productId, quantity } = await request.json()

    if (!productId || !quantity || quantity <= 0) {
      return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 })
    }

    // Verificar se o produto existe
    const { data: product, error: productError } = await supabase
      .from('company_products')
      .select('*')
      .eq('id', productId)
      .single()

    if (productError || !product) {
      return NextResponse.json({ error: 'Produto não encontrado' }, { status: 404 })
    }

    // Verificar estoque
    if (product.stock < quantity) {
      return NextResponse.json({ error: 'Estoque insuficiente' }, { status: 400 })
    }

    // Adicionar ao carrinho (mock - em produção seria uma tabela de carrinho)
    // Por enquanto, vamos simular sucesso
    
    return NextResponse.json({ 
      success: true, 
      message: 'Produto adicionado ao carrinho',
      cartItem: {
        id: Date.now().toString(),
        productId,
        quantity,
        product
      }
    })

  } catch (error) {
    console.error('Erro ao adicionar ao carrinho:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
