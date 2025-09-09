import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabaseService } from '@/lib/supabaseService'
import { authenticateAndAuthorize } from '@/lib/auth'

// Schema para atualização
const updateSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  notes: z.string().optional(),
})

// GET - Buscar arte específica
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user, error: authError } = await authenticateAndAuthorize(request, {
      roles: ['gestor', 'admin', 'admin_global', 'superadmin'],
    })

    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { data: artwork, error } = await supabaseService
      .from('artworks')
      .select(
        `
        id,
        name,
        file_url,
        mime_type,
        size_bytes,
        preview_url,
        notes,
        created_at,
        companies!inner(id, name)
      `
      )
      .eq('id', params.id)
      .single()

    if (error || !artwork) {
      return NextResponse.json(
        { error: 'Arte não encontrada' },
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

      if (userData?.company_id !== artwork.company_id) {
        return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
      }
    }

    // Gerar signed URL para download
    const { data: signedUrl, error: urlError } = await supabaseService.storage
      .from('artworks')
      .createSignedUrl(artwork.file_url, 3600) // 1 hora

    if (urlError) {
      console.error('Erro ao gerar signed URL:', urlError)
      return NextResponse.json(
        { error: 'Erro ao gerar URL de download' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        ...artwork,
        download_url: signedUrl.signedUrl,
      },
    })
  } catch (error) {
    console.error('Erro na API de arte:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// PUT - Atualizar arte
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user, error: authError } = await authenticateAndAuthorize(request, {
      roles: ['gestor', 'admin', 'admin_global', 'superadmin'],
    })

    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = updateSchema.parse(body)

    // Buscar arte existente
    const { data: existingArtwork, error: fetchError } = await supabaseService
      .from('artworks')
      .select('id, company_id')
      .eq('id', params.id)
      .single()

    if (fetchError || !existingArtwork) {
      return NextResponse.json(
        { error: 'Arte não encontrada' },
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

      if (userData?.company_id !== existingArtwork.company_id) {
        return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
      }
    }

    // Atualizar arte
    const { data: updatedArtwork, error: updateError } = await supabaseService
      .from('artworks')
      .update(validatedData)
      .eq('id', params.id)
      .select()
      .single()

    if (updateError) {
      console.error('Erro ao atualizar arte:', updateError)
      return NextResponse.json(
        { error: 'Erro ao atualizar arte' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: updatedArtwork,
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

    console.error('Erro na API de atualização de arte:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// DELETE - Deletar arte
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user, error: authError } = await authenticateAndAuthorize(request, {
      roles: ['gestor', 'admin', 'admin_global', 'superadmin'],
    })

    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Buscar arte existente
    const { data: existingArtwork, error: fetchError } = await supabaseService
      .from('artworks')
      .select('id, company_id, file_url')
      .eq('id', params.id)
      .single()

    if (fetchError || !existingArtwork) {
      return NextResponse.json(
        { error: 'Arte não encontrada' },
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

      if (userData?.company_id !== existingArtwork.company_id) {
        return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
      }
    }

    // Deletar arquivo do storage
    const { error: storageError } = await supabaseService.storage
      .from('artworks')
      .remove([existingArtwork.file_url])

    if (storageError) {
      console.error('Erro ao deletar arquivo do storage:', storageError)
      // Continuar mesmo com erro no storage
    }

    // Deletar registro da tabela
    const { error: deleteError } = await supabaseService
      .from('artworks')
      .delete()
      .eq('id', params.id)

    if (deleteError) {
      console.error('Erro ao deletar registro de arte:', deleteError)
      return NextResponse.json(
        { error: 'Erro ao deletar arte' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Arte deletada com sucesso',
    })
  } catch (error) {
    console.error('Erro na API de deleção de arte:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
