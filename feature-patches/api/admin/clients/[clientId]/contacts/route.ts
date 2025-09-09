import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireUser } from '@/lib/auth'
import { requireRole } from '@/lib/rbac'
import { audit } from '@/lib/audit'
import { validateUserData } from '@/lib/validation/mock-data'

const service = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// GET - Listar contatos de uma empresa cliente
export async function GET(
  req: NextRequest,
  { params }: { params: { clientId: string } }
) {
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
        'client_contacts_list_denied',
        'client_contacts',
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
          error: 'Permissão insuficiente para listar contatos',
        },
        { status: 403 }
      )
    }

    const clientId = parseInt(params.clientId)
    if (isNaN(clientId)) {
      return NextResponse.json(
        { success: false, error: 'ID da empresa cliente inválido' },
        { status: 400 }
      )
    }

    // Verificar se a empresa cliente pertence ao tenant
    const { data: clientCompany } = await service
      .from('client_companies')
      .select('id')
      .eq('id', clientId)
      .eq('tenant_id', companyId)
      .single()

    if (!clientCompany) {
      return NextResponse.json(
        { success: false, error: 'Empresa cliente não encontrada' },
        { status: 404 }
      )
    }

    // Buscar contatos
    const { data: contacts, error } = await service
      .from('client_contacts')
      .select('*')
      .eq('client_company_id', clientId)
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (error) {
      await audit(
        'client_contacts_list_error',
        'client_contacts',
        userId,
        undefined,
        {
          companyId,
          clientId,
          error: error.message,
        }
      )
      return NextResponse.json(
        { success: false, error: 'Erro ao buscar contatos' },
        { status: 500 }
      )
    }

    await audit(
      'client_contacts_listed',
      'client_contacts',
      userId,
      undefined,
      {
        companyId,
        clientId,
        count: contacts?.length || 0,
      }
    )

    return NextResponse.json({ success: true, data: contacts || [] })
  } catch (error: any) {
    console.error('Error listing client contacts:', error)
    await audit(
      'client_contacts_list_error',
      'client_contacts',
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

// POST - Criar contato para uma empresa cliente
export async function POST(
  req: NextRequest,
  { params }: { params: { clientId: string } }
) {
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
        'client_contact_creation_denied',
        'client_contacts',
        userId,
        undefined,
        {
          companyId,
          reason: 'insufficient_permissions',
        }
      )
      return NextResponse.json(
        { success: false, error: 'Permissão insuficiente para criar contato' },
        { status: 403 }
      )
    }

    const clientId = parseInt(params.clientId)
    if (isNaN(clientId)) {
      return NextResponse.json(
        { success: false, error: 'ID da empresa cliente inválido' },
        { status: 400 }
      )
    }

    const body = await req.json()
    const { name, email, phone } = body

    // Validações básicas
    if (!name || !email) {
      return NextResponse.json(
        { success: false, error: 'Nome e email são obrigatórios' },
        { status: 400 }
      )
    }

    // Validar dados mockados
    const mockValidation = validateUserData({
      email: email,
      name: name,
      id: body.id,
    })

    if (!mockValidation.isValid) {
      await audit(
        'client_contact_creation_denied',
        'client_contacts',
        userId,
        undefined,
        {
          companyId,
          clientId,
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

    // Verificar se a empresa cliente pertence ao tenant
    const { data: clientCompany } = await service
      .from('client_companies')
      .select('id')
      .eq('id', clientId)
      .eq('tenant_id', companyId)
      .single()

    if (!clientCompany) {
      return NextResponse.json(
        { success: false, error: 'Empresa cliente não encontrada' },
        { status: 404 }
      )
    }

    // Verificar se já existe contato com mesmo email
    const { data: existingContact } = await service
      .from('client_contacts')
      .select('id')
      .eq('client_company_id', clientId)
      .eq('email', email)
      .single()

    if (existingContact) {
      await audit(
        'client_contact_creation_failed',
        'client_contacts',
        userId,
        undefined,
        {
          companyId,
          clientId,
          reason: 'email_already_exists',
          email,
        }
      )
      return NextResponse.json(
        { success: false, error: 'Contato com este email já existe' },
        { status: 409 }
      )
    }

    // Criar contato
    const { data: contact, error } = await service
      .from('client_contacts')
      .insert({
        client_company_id: clientId,
        name,
        email,
        phone: phone || null,
        is_active: true,
      })
      .select()
      .single()

    if (error) {
      await audit(
        'client_contact_creation_failed',
        'client_contacts',
        userId,
        undefined,
        {
          companyId,
          clientId,
          error: error.message,
        }
      )
      return NextResponse.json(
        { success: false, error: 'Erro ao criar contato' },
        { status: 500 }
      )
    }

    await audit(
      'client_contact_created',
      'client_contacts',
      userId,
      contact.id,
      {
        companyId,
        clientId,
        contactName: name,
        contactEmail: email,
      }
    )

    return NextResponse.json({ success: true, data: contact }, { status: 201 })
  } catch (error: any) {
    console.error('Error creating client contact:', error)
    await audit(
      'client_contact_creation_error',
      'client_contacts',
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
