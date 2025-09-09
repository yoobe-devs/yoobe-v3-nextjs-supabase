import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321'
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
const service = createClient(supabaseUrl, serviceKey)

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const storeId = searchParams.get('store_id') || ''
  const limit = parseInt(searchParams.get('limit') || '20')
  const offset = parseInt(searchParams.get('offset') || '0')

  if (!storeId)
    return NextResponse.json({ error: 'store_id required' }, { status: 400 })

  try {
    const { data: events, error } = await service
      .from('employee_events')
      .select(
        `
        id,
        type,
        ref_id,
        meta,
        created_at
      `
      )
      .eq('store_id', storeId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error

    // Formatar eventos para o feed
    const feedEvents =
      events?.map(event => {
        const userName = `Usuário ${event.id.slice(0, 8)}`
        const productName = event.ref_id
          ? `Produto ${event.ref_id.slice(0, 8)}`
          : 'Produto'

        // Mapear tipos de eventos para mensagens amigáveis
        const eventMessages = {
          login: `${userName} fez login no sistema`,
          product_view: `${userName} visualizou o produto ${productName}`,
          add_to_cart: `${userName} adicionou ${productName} ao carrinho`,
          save_for_later: `${userName} salvou ${productName} para depois`,
          checkout_start: `${userName} iniciou o checkout`,
          redeem_complete: `${userName} completou o resgate de ${productName}`,
          approval_requested: `${userName} solicitou aprovação`,
          approval_approved: `Aprovação de ${userName} foi aprovada`,
          inventory_low_seen: `${userName} visualizou alerta de estoque baixo`,
          profile_completed: `${userName} completou o perfil`,
          onboarding_completed: `${userName} completou o onboarding`,
        }

        return {
          id: event.id,
          type: event.type,
          message:
            eventMessages[event.type as keyof typeof eventMessages] ||
            `${userName} realizou uma ação`,
          userName,
          productName: event.type.includes('product') ? productName : null,
          productImage: null,
          meta: event.meta,
          createdAt: event.created_at,
          timestamp: new Date(event.created_at).getTime(),
        }
      }) || []

    return NextResponse.json({
      success: true,
      data: {
        events: feedEvents,
        pagination: {
          limit,
          offset,
          hasMore: events?.length === limit,
        },
      },
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
