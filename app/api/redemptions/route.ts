import { NextRequest, NextResponse } from 'next/server'
import { requireUser } from '@/lib/auth'
import { CreateRedemptionDTO } from '@/lib/validation'
import { audit } from '@/lib/audit'
import { createClient } from '@supabase/supabase-js'

const service = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const { userId, companyId } = await requireUser()
    const body = await req.json()
    const redemptionData = CreateRedemptionDTO.parse(body)

    // Verificar se produto existe e está ativo
    const { data: product, error: productError } = await service
      .from('products')
      .select('*')
      .eq('id', redemptionData.product_id)
      .eq('active', true)
      .single()

    if (productError || !product) {
      await audit('redemption_creation_failed', 'redemptions', userId, undefined, { 
        companyId, 
        reason: 'product_not_found_or_inactive',
        product_id: redemptionData.product_id 
      })
      return NextResponse.json(
        { success: false, error: 'Produto não encontrado ou inativo' },
        { status: 404 }
      )
    }

    // Se pagamento com pontos, verificar saldo da carteira
    if (redemptionData.payment_method === 'points') {
      const { data: wallet, error: walletError } = await service
        .from('wallets')
        .select('balance')
        .eq('user_id', userId)
        .single()

      if (walletError || !wallet) {
        await audit('redemption_creation_failed', 'redemptions', userId, undefined, { 
          companyId, 
          reason: 'wallet_not_found',
          product_id: redemptionData.product_id 
        })
        return NextResponse.json(
          { success: false, error: 'Carteira não encontrada' },
          { status: 404 }
        )
      }

      if (wallet.balance < product.points) {
        await audit('redemption_creation_failed', 'redemptions', userId, undefined, { 
          companyId, 
          reason: 'insufficient_points',
          product_id: redemptionData.product_id,
          required: product.points,
          available: wallet.balance
        })
        return NextResponse.json(
          { success: false, error: 'Pontos insuficientes na carteira' },
          { status: 400 }
        )
      }
    }

    // Verificar se endereço existe e pertence ao usuário
    if (redemptionData.address_id) {
      const { data: address, error: addressError } = await service
        .from('addresses')
        .select('id')
        .eq('id', redemptionData.address_id)
        .eq('user_id', userId)
        .single()

      if (addressError || !address) {
        await audit('redemption_creation_failed', 'redemptions', userId, undefined, { 
          companyId, 
          reason: 'address_not_found_or_unauthorized',
          address_id: redemptionData.address_id 
        })
        return NextResponse.json(
          { success: false, error: 'Endereço não encontrado ou não autorizado' },
          { status: 404 }
        )
      }
    }

    // Calcular valor total
    const total = product.price

    // Criar redemption
    const { data: redemption, error } = await service
      .from('redemptions')
      .insert({
        user_id: userId,
        product_id: redemptionData.product_id,
        payment_method: redemptionData.payment_method,
        amount: total,
        address_id: redemptionData.address_id,
        status: 'pending'
      })
      .select(`
        *,
        product:products(id, name, sku, points, price),
        address:addresses(*)
      `)
      .single()

    if (error) {
      await audit('redemption_creation_failed', 'redemptions', userId, undefined, { 
        companyId, 
        error: error.message,
        product_id: redemptionData.product_id 
      })
      return NextResponse.json(
        { success: false, error: 'Erro ao criar pedido' },
        { status: 500 }
      )
    }

    // Se pagamento com pontos, debitar carteira
    if (redemptionData.payment_method === 'points') {
      const { error: debitError } = await service
        .from('wallets')
        .update({ 
          balance: service.rpc('debit_wallet', { 
            user_id: userId, 
            amount: product.points 
          })
        })
        .eq('user_id', userId)

      if (debitError) {
        // Rollback: deletar redemption
        await service.from('redemptions').delete().eq('id', redemption.id)
        await audit('redemption_creation_failed', 'redemptions', userId, undefined, { 
          companyId, 
          reason: 'wallet_debit_failed',
          product_id: redemptionData.product_id 
        })
        return NextResponse.json(
          { success: false, error: 'Erro ao debitar pontos da carteira' },
          { status: 500 }
        )
      }

      // Registrar transação na carteira
      const { error: transactionError } = await service
        .from('wallet_transactions')
        .insert({
          wallet_id: (await service.from('wallets').select('id').eq('user_id', userId).single()).data?.id,
          delta: -product.points,
          reason: `Resgate: ${product.name}`,
          related_order_id: redemption.id
        })

      if (transactionError) {
        console.warn('Warning: Could not create wallet transaction:', transactionError)
      }
    }

    await audit('redemption_created', 'redemptions', userId, redemption.id, { 
      companyId,
      product_id: redemptionData.product_id,
      payment_method: redemptionData.payment_method,
      amount: total
    })

    return NextResponse.json({ 
      success: true, 
      data: redemption,
      message: 'Pedido criado com sucesso'
    }, { status: 201 })
  } catch (error: any) {
    console.error('Error creating redemption:', error)
    await audit('redemption_creation_error', 'redemptions', 'system', undefined, { error: error.message })
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    const { userId, companyId } = await requireUser()
    const searchParams = req.nextUrl.searchParams
    const targetUserId = searchParams.get('userId') || userId
    const status = searchParams.get('status')
    const paymentMethod = searchParams.get('payment_method')

    // Verificar se usuário pode ver pedidos de outros (gestor ou admin)
    if (targetUserId !== userId) {
      const { data: userRole } = await service
        .from('user_company_roles')
        .select('role')
        .eq('user_id', userId)
        .eq('company_id', companyId)
        .single()

      if (!userRole || !['gestor', 'admin_gestor', 'superadmin'].includes(userRole.role)) {
        await audit('redemptions_list_denied', 'redemptions', userId, undefined, { 
          companyId, 
          reason: 'insufficient_permissions',
          target_user_id: targetUserId 
        })
        return NextResponse.json(
          { success: false, error: 'Permissão insuficiente para ver pedidos de outros usuários' },
          { status: 403 }
        )
      }
    }

    let query = service
      .from('redemptions')
      .select(`
        *,
        product:products(id, name, sku, points, price),
        address:addresses(*),
        user:users(id, name, surname, email)
      `)
      .eq('user_id', targetUserId)

    if (status) {
      query = query.eq('status', status)
    }
    if (paymentMethod) {
      query = query.eq('payment_method', paymentMethod)
    }

    const { data: redemptions, error } = await query.order('created_at', { ascending: false })

    if (error) {
      await audit('redemptions_list_error', 'redemptions', userId, undefined, { 
        companyId, 
        error: error.message,
        target_user_id: targetUserId 
      })
      return NextResponse.json(
        { success: false, error: 'Erro ao buscar pedidos' },
        { status: 500 }
      )
    }

    await audit('redemptions_listed', 'redemptions', userId, undefined, { 
      companyId, 
      count: redemptions?.length || 0,
      target_user_id: targetUserId 
    })

    return NextResponse.json({ success: true, data: redemptions || [] })
  } catch (error: any) {
    console.error('Error listing redemptions:', error)
    await audit('redemptions_list_error', 'redemptions', 'system', undefined, { error: error.message })
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
