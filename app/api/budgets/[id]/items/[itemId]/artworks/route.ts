import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabaseService } from '@/lib/supabaseService'
import { authenticateAndAuthorize } from '@/lib/auth'

// Schema para vinculação de arte a item
const linkItemArtworkSchema = z.object({
  artwork_id: z.string().uuid(),
  placement: z.string().optional(),
  color_refs: z.array(z.string()).optional(),
  notes: z.string().optional(),
})

// GET - Listar artes vinculadas ao item
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; itemId: string } }
) {
  try {
    const { user, error: authError } = await authenticateAndAuthorize(request, {
      roles: ['gestor', 'admin', 'admin_global', 'superadmin'],
    })

    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Verificar se o orçamento e item existem
    const { data: budgetItem, error: itemError } = await supabaseService
      .from('budget_items')
      .select(
        `
        id,
        budget_id,
        budgets!inner(id, company_id)
      `
      )
      .eq('id', params.itemId)
      .eq('budget_id', params.id)
      .single()

    if (itemError || !budgetItem) {
      return NextResponse.json(
        { error: 'Item não encontrado' },
        { status: 404 }
      )
    }

    // Verificar acesso à empresa
    if (user.role === 'gestor') {
      const { data: userData } = await supabaseService
        .from('users')
        .select('company_id')
        .eq('id', user.id)
        .single()

      if (userData?.company_id !== budgetItem.budgets.company_id) {
        return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
      }
    }

    // Buscar artes vinculadas ao item
    const { data: itemArtworks, error } = await supabaseService
      .from('budget_item_artworks')
      .select(
        `
        id,
        scope,
        placement,
        color_refs,
        notes,
        created_at,
        artworks!inner(
          id,
          name,
          file_url,
          mime_type,
          size_bytes,
          preview_url,
          created_at
        )
      `
      )
      .eq('budget_id', params.id)
      .eq('budget_item_id', params.itemId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Erro ao buscar artes do item:', error)
      return NextResponse.json(
        { error: 'Erro interno do servidor' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        budget_id: params.id,
        item_id: params.itemId,
        artworks: itemArtworks || [],
      },
    })
  } catch (error) {
    console.error('Erro na API de artes do item:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// POST - Vincular arte ao item
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string; itemId: string } }
) {
  try {
    const { user, error: authError } = await authenticateAndAuthorize(request, {
      roles: ['gestor', 'admin', 'admin_global', 'superadmin'],
    })

    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = linkItemArtworkSchema.parse(body)

    // Verificar se o orçamento e item existem
    const { data: budgetItem, error: itemError } = await supabaseService
      .from('budget_items')
      .select(
        `
        id,
        budget_id,
        budgets!inner(id, company_id)
      `
      )
      .eq('id', params.itemId)
      .eq('budget_id', params.id)
      .single()

    if (itemError || !budgetItem) {
      return NextResponse.json(
        { error: 'Item não encontrado' },
        { status: 404 }
      )
    }

    // Verificar acesso à empresa
    if (user.role === 'gestor') {
      const { data: userData } = await supabaseService
        .from('users')
        .select('company_id')
        .eq('id', user.id)
        .single()

      if (userData?.company_id !== budgetItem.budgets.company_id) {
        return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
      }
    }

    // Verificar se a arte existe e pertence à mesma empresa
    const { data: artwork, error: artworkError } = await supabaseService
      .from('artworks')
      .select('id, company_id')
      .eq('id', validatedData.artwork_id)
      .single()

    if (artworkError || !artwork) {
      return NextResponse.json(
        { error: 'Arte não encontrada' },
        { status: 404 }
      )
    }

    if (artwork.company_id !== budgetItem.budgets.company_id) {
      return NextResponse.json(
        { error: 'Arte não pertence à mesma empresa' },
        { status: 400 }
      )
    }

    // Verificar se já existe vinculação
    const { data: existingLink, error: linkError } = await supabaseService
      .from('budget_item_artworks')
      .select('id')
      .eq('budget_id', params.id)
      .eq('budget_item_id', params.itemId)
      .eq('artwork_id', validatedData.artwork_id)
      .single()

    if (existingLink) {
      return NextResponse.json(
        { error: 'Arte já está vinculada a este item' },
        { status: 400 }
      )
    }

    // Criar vinculação
    const { data: link, error: createError } = await supabaseService
      .from('budget_item_artworks')
      .insert({
        budget_id: params.id,
        budget_item_id: params.itemId,
        artwork_id: validatedData.artwork_id,
        scope: 'item',
        placement: validatedData.placement,
        color_refs: validatedData.color_refs,
        notes: validatedData.notes,
      })
      .select(
        `
        id,
        scope,
        placement,
        color_refs,
        notes,
        created_at,
        artworks!inner(
          id,
          name,
          file_url,
          mime_type,
          preview_url
        )
      `
      )
      .single()

    if (createError) {
      console.error('Erro ao vincular arte ao item:', createError)
      return NextResponse.json(
        { error: 'Erro ao vincular arte' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: link,
      message: 'Arte vinculada ao item com sucesso',
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Dados inválidos',
          details: error.errors
            .map(e => `${e.path.join('.')}: ${e.message}`)
            .join(', '),
        },
        { status: 400 }
      )
    }

    console.error('Erro na API de vinculação de arte ao item:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
