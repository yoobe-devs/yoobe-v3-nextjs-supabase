import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Usa variáveis de ambiente (com fallback para localhost) para funcionar em dev/prod
const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Buscar empresa
    const { data: company, error } = await supabase
      .from('companies')
      .select('*')
      .eq('id', params.id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Empresa não encontrada' },
          { status: 404 }
        )
      }
      console.error('Erro ao buscar empresa:', error)
      return NextResponse.json(
        { error: 'Erro ao buscar empresa' },
        { status: 500 }
      )
    }

    // Buscar lojas da empresa
    const { data: stores, error: storesError } = await supabase
      .from('stores')
      .select('id, name, status, created_at')
      .eq('company_id', params.id)

    if (storesError) {
      console.warn('Erro ao buscar lojas:', storesError)
    }

    // Buscar produtos da empresa (company_products)
    const { data: products, error: productsError } = await supabase
      .from('company_products')
      .select(
        `
        id,
        name,
        description,
        price,
        points_cost,
        final_sku,
        status,
        is_active,
        created_at,
        updated_at
      `
      )
      .eq('company_id', params.id)
      .order('created_at', { ascending: false })

    if (productsError) {
      console.warn('Erro ao buscar produtos:', productsError)
    }

    // Formatar resposta
    const companyWithDetails = {
      ...company,
      stores: (stores || []).map(s => ({
        id: s.id,
        name: s.name,
        status: s.status || 'active',
        created_at: s.created_at,
      })),
      products: products || [],
      products_total: products?.length || 0,
      products_active: products?.filter(p => p.status === 'active').length || 0,
      products_inactive:
        products?.filter(p => p.status === 'inactive').length || 0,
    }

    return NextResponse.json({ company: companyWithDetails })
  } catch (error) {
    console.error('Erro na API de empresas:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { name, email, phone, address, city, state, zip_code, status } = body

    // Validação
    if (!name || !email) {
      return NextResponse.json(
        {
          error: 'Nome e email são obrigatórios',
        },
        { status: 400 }
      )
    }

    // Verificar se email já existe em outra empresa
    const { data: existingCompany } = await supabase
      .from('companies')
      .select('id')
      .eq('email', email)
      .neq('id', params.id)
      .single()

    if (existingCompany) {
      return NextResponse.json(
        {
          error: 'Este email já está em uso',
        },
        { status: 400 }
      )
    }

    // Atualizar empresa
    const { data: company, error } = await supabase
      .from('companies')
      .update({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone || null,
        address: address || null,
        city: city || null,
        state: state || null,
        zip_code: zip_code || null,
        status: status || 'active',
        updated_at: new Date().toISOString(),
      })
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      console.error('Erro ao atualizar empresa:', error)
      return NextResponse.json(
        { error: 'Erro ao atualizar empresa' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      company,
      message: 'Empresa atualizada com sucesso',
    })
  } catch (error) {
    console.error('Erro na API de empresas:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar se a empresa existe
    const { data: existingCompany } = await supabase
      .from('companies')
      .select('id')
      .eq('id', params.id)
      .single()

    if (!existingCompany) {
      return NextResponse.json(
        { error: 'Empresa não encontrada' },
        { status: 404 }
      )
    }

    // Deletar empresa
    const { error } = await supabase
      .from('companies')
      .delete()
      .eq('id', params.id)

    if (error) {
      console.error('Erro ao deletar empresa:', error)
      return NextResponse.json(
        { error: 'Erro ao deletar empresa' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Empresa deletada com sucesso',
    })
  } catch (error) {
    console.error('Erro na API de empresas:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
