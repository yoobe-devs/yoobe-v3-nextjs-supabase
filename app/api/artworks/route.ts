import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabaseService } from '@/lib/supabaseService'
import { authenticateAndAuthorize } from '@/lib/auth'

// Schema para criação de upload
const createUploadSchema = z.object({
  company_id: z.string().uuid(),
  budget_id: z.string().uuid().optional(),
  budget_item_id: z.string().uuid().optional(),
  filename: z.string().min(1).max(255),
  mime_type: z.string().min(1),
  size_bytes: z.number().positive().max(52428800), // 50MB max
})

// Schema para listagem
const listSchema = z.object({
  company_id: z.string().uuid().optional(),
  q: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
})

// GET - Listar artes
export async function GET(request: NextRequest) {
  try {
    const { user, error: authError } = await authenticateAndAuthorize(request, {
      roles: ['gestor', 'admin', 'admin_global', 'superadmin'],
    })

    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const params = listSchema.parse({
      company_id: searchParams.get('company_id'),
      q: searchParams.get('q'),
      page: searchParams.get('page'),
      limit: searchParams.get('limit'),
    })

    // Determinar company_id baseado no papel
    let companyId = params.company_id
    if (user.role === 'gestor' && !companyId) {
      // Buscar company_id do usuário
      const { data: userData } = await supabaseService
        .from('users')
        .select('company_id')
        .eq('id', user.id)
        .single()

      if (userData?.company_id) {
        companyId = userData.company_id
      }
    }

    if (!companyId) {
      return NextResponse.json(
        { error: 'company_id é obrigatório' },
        { status: 400 }
      )
    }

    // Construir query
    let query = supabaseService
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
      .eq('company_id', companyId)

    // Filtro de busca
    if (params.q) {
      query = query.or(`name.ilike.%${params.q}%,notes.ilike.%${params.q}%`)
    }

    // Paginação
    const offset = (params.page - 1) * params.limit
    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + params.limit - 1)

    const { data: artworks, error, count } = await query

    if (error) {
      console.error('Erro ao buscar artes:', error)
      return NextResponse.json(
        { error: 'Erro interno do servidor' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        artworks: artworks || [],
        pagination: {
          page: params.page,
          limit: params.limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / params.limit),
        },
      },
    })
  } catch (error) {
    console.error('Erro na API de artes:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// POST - Criar upload (retorna signed URL)
export async function POST(request: NextRequest) {
  try {
    const { user, error: authError } = await authenticateAndAuthorize(request, {
      roles: ['gestor', 'admin', 'admin_global', 'superadmin'],
    })

    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = createUploadSchema.parse(body)

    // Verificar se o usuário tem acesso à empresa
    if (user.role === 'gestor') {
      const { data: userData } = await supabaseService
        .from('users')
        .select('company_id')
        .eq('id', user.id)
        .single()

      if (userData?.company_id !== validatedData.company_id) {
        return NextResponse.json(
          { error: 'Acesso negado à empresa' },
          { status: 403 }
        )
      }
    }

    // Validar formatos permitidos
    const allowedMimeTypes = [
      'image/jpeg',
      'image/png',
      'image/svg+xml',
      'application/pdf',
      'application/postscript',
      'application/illustrator',
      'application/zip',
      'application/x-zip-compressed',
    ]

    if (!allowedMimeTypes.includes(validatedData.mime_type)) {
      return NextResponse.json(
        {
          error: 'Formato de arquivo não permitido',
          details: 'Formatos aceitos: JPEG, PNG, SVG, PDF, AI, EPS, ZIP',
        },
        { status: 400 }
      )
    }

    // Gerar nome único para o arquivo
    const timestamp = Date.now()
    const sanitizedFilename = validatedData.filename
      .replace(/[^a-zA-Z0-9.-]/g, '_')
      .toLowerCase()
    const filePath = `artworks/${validatedData.company_id}/${timestamp}_${sanitizedFilename}`

    // Criar registro na tabela artworks
    const { data: artwork, error: createError } = await supabaseService
      .from('artworks')
      .insert({
        company_id: validatedData.company_id,
        uploader_id: user.id,
        name: validatedData.filename,
        file_url: filePath,
        mime_type: validatedData.mime_type,
        size_bytes: validatedData.size_bytes,
        notes: validatedData.budget_id
          ? `Upload para orçamento ${validatedData.budget_id}`
          : null,
      })
      .select()
      .single()

    if (createError) {
      console.error('Erro ao criar registro de arte:', createError)
      return NextResponse.json(
        { error: 'Erro ao criar registro' },
        { status: 500 }
      )
    }

    // Gerar signed URL para upload
    const { data: signedUrl, error: urlError } = await supabaseService.storage
      .from('artworks')
      .createSignedUploadUrl(filePath, {
        upsert: false,
      })

    if (urlError) {
      console.error('Erro ao gerar signed URL:', urlError)
      // Limpar registro criado
      await supabaseService.from('artworks').delete().eq('id', artwork.id)

      return NextResponse.json(
        { error: 'Erro ao gerar URL de upload' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        artwork_id: artwork.id,
        signed_url: signedUrl.signedUrl,
        path: filePath,
        expires_at: signedUrl.expiresAt,
      },
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

    console.error('Erro na API de upload de artes:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
