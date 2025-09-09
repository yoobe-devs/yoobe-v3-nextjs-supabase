import { NextRequest, NextResponse } from 'next/server'
import { supabaseService } from '@/lib/supabaseService'
import { authenticateAndAuthorize } from '@/lib/auth'

// POST - Finalizar upload (gerar preview se necessário)
export async function POST(
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
    const { data: artwork, error: fetchError } = await supabaseService
      .from('artworks')
      .select('id, company_id, file_url, mime_type, name')
      .eq('id', params.id)
      .single()

    if (fetchError || !artwork) {
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

    // Verificar se o arquivo existe no storage
    const { data: fileData, error: fileError } = await supabaseService.storage
      .from('artworks')
      .list(artwork.file_url.split('/').slice(0, -1).join('/'), {
        search: artwork.file_url.split('/').pop(),
      })

    if (fileError || !fileData || fileData.length === 0) {
      return NextResponse.json(
        { error: 'Arquivo não encontrado no storage' },
        { status: 404 }
      )
    }

    // Gerar preview para imagens
    let previewUrl = null
    if (artwork.mime_type.startsWith('image/')) {
      try {
        // Para imagens, usar o próprio arquivo como preview
        const { data: previewSignedUrl } = await supabaseService.storage
          .from('artworks')
          .createSignedUrl(artwork.file_url, 86400) // 24 horas

        previewUrl = previewSignedUrl?.signedUrl || null
      } catch (previewError) {
        console.error('Erro ao gerar preview:', previewError)
        // Continuar sem preview
      }
    }

    // Atualizar arte com preview_url
    const { data: updatedArtwork, error: updateError } = await supabaseService
      .from('artworks')
      .update({
        preview_url: previewUrl,
      })
      .eq('id', params.id)
      .select()
      .single()

    if (updateError) {
      console.error('Erro ao atualizar arte:', updateError)
      return NextResponse.json(
        { error: 'Erro ao finalizar upload' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: updatedArtwork,
      message: 'Upload finalizado com sucesso',
    })
  } catch (error) {
    console.error('Erro na API de finalização de arte:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

