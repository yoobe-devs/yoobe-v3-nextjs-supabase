import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabaseService } from '@/lib/supabaseService'
import { authenticateAndAuthorize } from '@/lib/auth'

const uploadSchema = z.object({
  filename: z.string().min(1).max(255),
  original_filename: z.string().min(1).max(255),
  file_path: z.string().min(1),
  file_size: z.number().positive(),
  mime_type: z.string().min(1).max(100),
  file_type: z.enum(['artwork', 'document', 'image', 'other']),
  budget_id: z.string().uuid().optional(),
  budget_item_id: z.string().uuid().optional(),
  metadata: z.record(z.any()).optional(),
})

const querySchema = z.object({
  budget_id: z.string().uuid().optional(),
  budget_item_id: z.string().uuid().optional(),
  file_type: z.enum(['artwork', 'document', 'image', 'other']).optional(),
  status: z.enum(['pending', 'processing', 'completed', 'failed', 'deleted']).optional(),
  limit: z.string().transform(Number).optional(),
  offset: z.string().transform(Number).optional(),
})

export async function GET(request: NextRequest) {
  try {
    const authResult = await authenticateAndAuthorize(request, [
      'manager',
      'gestor',
      'admin',
      'admin_global',
      'superadmin',
    ])

    if (!authResult.success) {
      return NextResponse.json(
        { success: false, error: authResult.error },
        { status: authResult.status }
      )
    }

    const { searchParams } = new URL(request.url)
    const query = querySchema.parse({
      budget_id: searchParams.get('budget_id'),
      budget_item_id: searchParams.get('budget_item_id'),
      file_type: searchParams.get('file_type'),
      status: searchParams.get('status'),
      limit: searchParams.get('limit'),
      offset: searchParams.get('offset'),
    })

    let uploadsQuery = supabaseService
      .from('file_uploads')
      .select(`
        id,
        filename,
        original_filename,
        file_path,
        file_size,
        mime_type,
        file_type,
        status,
        budget_id,
        budget_item_id,
        metadata,
        created_at,
        updated_at,
        uploaded_by,
        company_id,
        users (
          id,
          name,
          email
        ),
        companies (
          id,
          name
        ),
        budgets (
          id,
          title,
          status
        ),
        budget_items (
          id,
          quantity,
          unit_price
        )
      `)
      .order('created_at', { ascending: false })

    // Filtros baseados no usuário autenticado
    if (authResult.user.role === 'manager' || authResult.user.role === 'gestor') {
      uploadsQuery = uploadsQuery.eq('company_id', authResult.user.company_id)
    } else if (authResult.user.role === 'admin') {
      uploadsQuery = uploadsQuery.eq('company_id', authResult.user.company_id)
    }

    // Aplicar filtros adicionais
    if (query.budget_id) {
      uploadsQuery = uploadsQuery.eq('budget_id', query.budget_id)
    }
    if (query.budget_item_id) {
      uploadsQuery = uploadsQuery.eq('budget_item_id', query.budget_item_id)
    }
    if (query.file_type) {
      uploadsQuery = uploadsQuery.eq('file_type', query.file_type)
    }
    if (query.status) {
      uploadsQuery = uploadsQuery.eq('status', query.status)
    }

    // Paginação
    const limit = query.limit || 50
    const offset = query.offset || 0
    uploadsQuery = uploadsQuery.range(offset, offset + limit - 1)

    const { data: uploads, error: uploadsError } = await uploadsQuery

    if (uploadsError) {
      console.error('Erro ao buscar uploads:', uploadsError)
      return NextResponse.json(
        { success: false, error: { message: 'Erro interno do servidor' } },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        uploads: uploads || [],
        pagination: {
          limit,
          offset,
          has_more: (uploads?.length || 0) === limit,
        },
      },
    })
  } catch (error) {
    console.error('Erro na API de uploads:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: { message: 'Parâmetros inválidos', details: error.errors } },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: { message: 'Erro interno do servidor' } },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await authenticateAndAuthorize(request, [
      'manager',
      'gestor',
      'admin',
      'admin_global',
      'superadmin',
    ])

    if (!authResult.success) {
      return NextResponse.json(
        { success: false, error: authResult.error },
        { status: authResult.status }
      )
    }

    const body = await request.json()
    const uploadData = uploadSchema.parse(body)

    // Verificar se o orçamento pertence à empresa do usuário
    if (uploadData.budget_id) {
      const { data: budget, error: budgetError } = await supabaseService
        .from('budgets')
        .select('id, company_id')
        .eq('id', uploadData.budget_id)
        .single()

      if (budgetError || !budget) {
        return NextResponse.json(
          { success: false, error: { message: 'Orçamento não encontrado' } },
          { status: 404 }
        )
      }

      if (authResult.user.role === 'manager' || authResult.user.role === 'gestor') {
        if (budget.company_id !== authResult.user.company_id) {
          return NextResponse.json(
            { success: false, error: { message: 'Acesso negado ao orçamento' } },
            { status: 403 }
          )
        }
      }
    }

    // Criar registro de upload
    const { data: upload, error } = await supabaseService
      .from('file_uploads')
      .insert([{
        ...uploadData,
        uploaded_by: authResult.user.id,
        company_id: authResult.user.company_id,
        status: 'pending',
      }])
      .select(`
        id,
        filename,
        original_filename,
        file_path,
        file_size,
        mime_type,
        file_type,
        status,
        budget_id,
        budget_item_id,
        metadata,
        created_at,
        updated_at
      `)
      .single()

    if (error) {
      console.error('Erro ao criar upload:', error)
      return NextResponse.json(
        { success: false, error: { message: 'Erro ao criar upload' } },
        { status: 500 }
      )
    }

    // Log de auditoria
    await supabaseService.from('audit_logs').insert([
      {
        action: 'create',
        table_name: 'file_uploads',
        record_id: upload.id,
        user_id: authResult.user.id,
        changes: uploadData,
        ip_address: request.headers.get('x-forwarded-for') || 'unknown',
        user_agent: request.headers.get('user-agent') || 'unknown',
      },
    ])

    return NextResponse.json({
      success: true,
      data: { upload },
    })
  } catch (error) {
    console.error('Erro na API de uploads:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: { message: 'Dados inválidos', details: error.errors } },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: { message: 'Erro interno do servidor' } },
      { status: 500 }
    )
  }
}

