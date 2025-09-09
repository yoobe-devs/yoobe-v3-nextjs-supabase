import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET(req: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const tenantId = user.user_metadata?.tenant_id
    const employeeId = user.user_metadata?.employee_id

    if (!tenantId || !employeeId) {
      return NextResponse.json(
        { error: 'ID do tenant ou funcionário não encontrado' },
        { status: 400 }
      )
    }

    // Buscar endereços do funcionário
    const { data: addresses, error } = await supabase
      .from('employee_addresses')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('employee_id', employeeId)
      .order('is_primary', { ascending: false })
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Erro ao buscar endereços:', error)
      return NextResponse.json(
        { error: 'Erro ao buscar endereços' },
        { status: 500 }
      )
    }

    return NextResponse.json({ addresses })
  } catch (error) {
    console.error('Erro no GET /api/me/address:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function PUT(req: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const tenantId = user.user_metadata?.tenant_id
    const employeeId = user.user_metadata?.employee_id

    if (!tenantId || !employeeId) {
      return NextResponse.json(
        { error: 'ID do tenant ou funcionário não encontrado' },
        { status: 400 }
      )
    }

    const body = await req.json()
    const {
      is_primary = true,
      full_name,
      document_id,
      phone,
      country = 'BR',
      postal_code,
      state,
      city,
      neighborhood,
      street,
      number,
      complement,
      reference,
      lat,
      lng,
    } = body

    // Validações básicas
    if (!postal_code || !street || !number || !city || !state) {
      return NextResponse.json(
        {
          error:
            'Campos obrigatórios: postal_code, street, number, city, state',
        },
        { status: 400 }
      )
    }

    // Se is_primary = true, desmarcar outros como não primários
    if (is_primary) {
      await supabase
        .from('employee_addresses')
        .update({ is_primary: false })
        .eq('tenant_id', tenantId)
        .eq('employee_id', employeeId)
    }

    // Criar ou atualizar endereço principal
    const addressData = {
      tenant_id: tenantId,
      employee_id: employeeId,
      is_primary,
      full_name,
      document_id,
      phone,
      country,
      postal_code,
      state,
      city,
      neighborhood,
      street,
      number,
      complement,
      reference,
      lat,
      lng,
    }

    const { data: address, error } = await supabase
      .from('employee_addresses')
      .upsert(addressData, {
        onConflict: 'tenant_id,employee_id,is_primary',
        ignoreDuplicates: false,
      })
      .select()
      .single()

    if (error) {
      console.error('Erro ao salvar endereço:', error)
      return NextResponse.json(
        { error: 'Erro ao salvar endereço' },
        { status: 500 }
      )
    }

    return NextResponse.json({ address })
  } catch (error) {
    console.error('Erro no PUT /api/me/address:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}










