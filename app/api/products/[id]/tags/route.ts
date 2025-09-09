import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    const { data, error } = await supabase
      .from('product_tags')
      .select(
        `
        id,
        tag_id,
        tags (
          id,
          name,
          description,
          color,
          is_active
        )
      `
      )
      .eq('product_id', params.id)
      .eq('tags.is_active', true)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const tags = data?.map(item => item.tags).filter(Boolean) || []
    return NextResponse.json(tags)
  } catch (error) {
    console.error('Erro ao buscar tags do produto:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const role = (user.user_metadata as any)?.role
    if (!['admin', 'admin_global', 'superadmin', 'manager'].includes($1)) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const body = await request.json().catch(() => ({}))
    const { tagIds } = body

    if (!Array.isArray(tagIds)) {
      return NextResponse.json(
        { error: 'tagIds deve ser um array' },
        { status: 400 }
      )
    }

    // Remover tags existentes
    await supabase.from('product_tags').delete().eq('product_id', params.id)

    // Adicionar novas tags
    if (tagIds.length > 0) {
      const productTags = tagIds.map(tagId => ({
        product_id: params.id,
        tag_id: tagId,
      }))

      const { error: insertError } = await supabase
        .from('product_tags')
        .insert(productTags)

      if (insertError) {
        return NextResponse.json(
          { error: insertError.message },
          { status: 500 }
        )
      }
    }

    // Buscar tags atualizadas
    const { data: updatedTags, error: fetchError } = await supabase
      .from('product_tags')
      .select(
        `
        id,
        tag_id,
        tags (
          id,
          name,
          description,
          color,
          is_active
        )
      `
      )
      .eq('product_id', params.id)
      .eq('tags.is_active', true)

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 500 })
    }

    const tags = updatedTags?.map(item => item.tags).filter(Boolean) || []
    return NextResponse.json({ tags })
  } catch (error) {
    console.error('Erro ao atualizar tags do produto:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

