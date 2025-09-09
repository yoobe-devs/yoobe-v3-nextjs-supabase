import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireUser } from '@/lib/auth'
import { requireRole } from '@/lib/rbac'
import { audit } from '@/lib/audit'

const service = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// POST - Associar cliente a uma loja
export async function POST(
  req: NextRequest,
  { params }: { params: { storeId: string } }
) {
  try {
    const { userId, companyId } = await requireUser()

    if (!companyId) {
      return NextResponse.json(
        { success: false, error: 'ID da empresa é obrigatório' },
        { status: 400 }
      )
    }

    const canManage = await requireRole(userId, companyId, 'gestor')
    if (!canManage) {
      await audit(
        'store_client_attach_denied',
        'store_clients',
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
          error: 'Permissão insuficiente para gerenciar associações',
        },
        { status: 403 }
      )
    }

    const storeId = params.storeId
    const body = await req.json()
    const { client_company_id } = body

    if (!client_company_id) {
      return NextResponse.json(
        { success: false, error: 'ID da empresa cliente é obrigatório' },
        { status: 400 }
      )
    }

    // Verificar se a loja pertence à empresa
    const { data: store } = await service
      .from('stores')
      .select('id')
      .eq('id', storeId)
      .eq('company_id', companyId)
      .single()

    if (!store) {
      return NextResponse.json(
        { success: false, error: 'Loja não encontrada' },
        { status: 404 }
      )
    }

    // Verificar se a empresa cliente pertence ao tenant
    const { data: clientCompany } = await service
      .from('client_companies')
      .select('id')
      .eq('id', client_company_id)
      .eq('tenant_id', companyId)
      .single()

    if (!clientCompany) {
      return NextResponse.json(
        { success: false, error: 'Empresa cliente não encontrada' },
        { status: 404 }
      )
    }

    // Verificar se a associação já existe
    const { data: existingAssociation } = await service
      .from('store_clients')
      .select('store_id, client_company_id')
      .eq('store_id', storeId)
      .eq('client_company_id', client_company_id)
      .single()

    if (existingAssociation) {
      return NextResponse.json(
        { success: false, error: 'Associação já existe' },
        { status: 409 }
      )
    }

    // Criar associação
    const { data: association, error } = await service
      .from('store_clients')
      .insert({
        store_id: storeId,
        client_company_id,
      })
      .select()
      .single()

    if (error) {
      await audit(
        'store_client_attach_failed',
        'store_clients',
        userId,
        undefined,
        {
          companyId,
          storeId,
          client_company_id,
          error: error.message,
        }
      )
      return NextResponse.json(
        { success: false, error: 'Erro ao associar cliente à loja' },
        { status: 500 }
      )
    }

    await audit('store_client_attached', 'store_clients', userId, undefined, {
      companyId,
      storeId,
      client_company_id,
    })

    return NextResponse.json(
      { success: true, data: association },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Error attaching client to store:', error)
    await audit(
      'store_client_attach_error',
      'store_clients',
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
