import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireUser } from '@/lib/auth'
import { requireRole } from '@/lib/rbac'
import { audit } from '@/lib/audit'
import { validateCompanyData } from '@/lib/validation/mock-data'

const service = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// GET - Listar empresas cliente
export async function GET(req: NextRequest) {
  try {
    const { userId, companyId } = await requireUser()

    if (!companyId) {
      return NextResponse.json(
        { success: false, error: 'ID da empresa é obrigatório' },
        { status: 400 }
      )
    }

    const canRead = await requireRole(userId, companyId, 'gestor')
    if (!canRead) {
      await audit(
        'client_companies_list_denied',
        'client_companies',
        userId,
        undefined,
        {
          companyId,
          reason: 'insufficient_permissions',
        }
      )
      return NextResponse.json(
        {
          success: false,
          error: 'Permissão insuficiente para listar empresas cliente',
        },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('q') || ''
    const offset = (page - 1) * limit

    let query = service
      .from('client_companies')
      .select('*', { count: 'exact' })
      .eq('tenant_id', companyId)
      .order('created_at', { ascending: false })

    // Aplicar filtro de busca
    if (search) {
      query = query.or(
        `name.ilike.%${search}%,doc.ilike.%${search}%,billing_email.ilike.%${search}%`
      )
    }

    // Aplicar paginação
    query = query.range(offset, offset + limit - 1)

    const { data: clients, error, count } = await query

    if (error) {
      await audit(
        'client_companies_list_error',
        'client_companies',
        userId,
        undefined,
        {
          companyId,
          error: error.message,
        }
      )
      return NextResponse.json(
        { success: false, error: 'Erro ao buscar empresas cliente' },
        { status: 500 }
      )
    }

    await audit(
      'client_companies_listed',
      'client_companies',
      userId,
      undefined,
      {
        companyId,
        count: clients?.length || 0,
      }
    )

    return NextResponse.json({
      success: true,
      data: clients || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    })
  } catch (error: any) {
    console.error('Error listing client companies:', error)
    await audit(
      'client_companies_list_error',
      'client_companies',
      'system',
      undefined,
      {
        error: error.message,
      }
    )
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// POST - Criar empresa cliente
export async function POST(req: NextRequest) {
  try {
    const { userId, companyId } = await requireUser()

    if (!companyId) {
      return NextResponse.json(
        { success: false, error: 'ID da empresa é obrigatório' },
        { status: 400 }
      )
    }

    const canCreate = await requireRole(userId, companyId, 'gestor')
    if (!canCreate) {
      await audit(
        'client_company_creation_denied',
        'client_companies',
        userId,
        undefined,
        {
          companyId,
          reason: 'insufficient_permissions',
        }
      )
      return NextResponse.json(
        {
          success: false,
          error: 'Permissão insuficiente para criar empresa cliente',
        },
        { status: 403 }
      )
    }

    const body = await req.json()
    const { name, doc, billing_email, phone, address } = body

    // Validações básicas
    if (!name) {
      return NextResponse.json(
        { success: false, error: 'Nome da empresa é obrigatório' },
        { status: 400 }
      )
    }

    // Validar dados mockados
    const mockValidation = validateCompanyData({
      email: billing_email,
      name: name,
      id: body.id,
    })

    if (!mockValidation.isValid) {
      await audit(
        'client_company_creation_denied',
        'client_companies',
        userId,
        undefined,
        {
          companyId,
          reason: 'mock_data_detected',
          errors: mockValidation.errors,
        }
      )
      return NextResponse.json(
        {
          success: false,
          error: 'Dados mockados detectados',
          details: mockValidation.errors,
        },
        { status: 400 }
      )
    }

    // Verificar se já existe empresa com mesmo nome
    const { data: existingClient } = await service
      .from('client_companies')
      .select('id')
      .eq('tenant_id', companyId)
      .eq('name', name)
      .single()

    if (existingClient) {
      await audit(
        'client_company_creation_failed',
        'client_companies',
        userId,
        undefined,
        {
          companyId,
          reason: 'name_already_exists',
          name,
        }
      )
      return NextResponse.json(
        { success: false, error: 'Empresa cliente com este nome já existe' },
        { status: 409 }
      )
    }

    // Criar empresa cliente
    const { data: client, error } = await service
      .from('client_companies')
      .insert({
        tenant_id: companyId,
        name,
        doc: doc || null,
        billing_email: billing_email || null,
        phone: phone || null,
        address: address || {},
      })
      .select()
      .single()

    if (error) {
      await audit(
        'client_company_creation_failed',
        'client_companies',
        userId,
        undefined,
        {
          companyId,
          error: error.message,
        }
      )
      return NextResponse.json(
        { success: false, error: 'Erro ao criar empresa cliente' },
        { status: 500 }
      )
    }

    await audit(
      'client_company_created',
      'client_companies',
      userId,
      client.id,
      {
        companyId,
        clientName: name,
      }
    )

    return NextResponse.json({ success: true, data: client }, { status: 201 })
  } catch (error: any) {
    console.error('Error creating client company:', error)
    await audit(
      'client_company_creation_error',
      'client_companies',
      'system',
      undefined,
      {
        error: error.message,
      }
    )
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
