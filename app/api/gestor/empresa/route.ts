import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Buscar dados da empresa do usuário logado
    const { data: user } = await supabase
      .from('users')
      .select('company_id')
      .eq('id', session.user.id)
      .single()

    if (!user?.company_id) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 })
    }

    // Buscar dados completos da empresa
    const { data: company, error } = await supabase
      .from('companies')
      .select(
        `
        id,
        name,
        email,
        phone,
        website,
        description,
        address,
        billing_address,
        fiscal_data,
        nfe_data,
        bank_data,
        status,
        verified,
        created_at,
        updated_at
      `
      )
      .eq('id', user.company_id)
      .single()

    if (error) {
      console.error('Erro ao buscar empresa:', error)
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }

    return NextResponse.json({ company })
  } catch (error) {
    console.error('Erro na API de empresa:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    // Buscar company_id do usuário
    const { data: user } = await supabase
      .from('users')
      .select('company_id')
      .eq('id', session.user.id)
      .single()

    if (!user?.company_id) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 })
    }

    // Preparar dados para atualização
    const updateData = {
      name: body.name,
      email: body.email,
      phone: body.phone,
      website: body.website,
      description: body.description,
      address: body.address,
      billing_address: body.billingAddress,
      fiscal_data: body.fiscal,
      nfe_data: body.nfe,
      bank_data: body.bank,
      updated_at: new Date().toISOString(),
    }

    // Atualizar empresa
    const { data: company, error } = await supabase
      .from('companies')
      .update(updateData)
      .eq('id', user.company_id)
      .select()
      .single()

    if (error) {
      console.error('Erro ao atualizar empresa:', error)
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }

    return NextResponse.json({ company })
  } catch (error) {
    console.error('Erro na API de empresa:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
