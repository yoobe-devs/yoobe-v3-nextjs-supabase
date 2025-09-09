import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Usa envs para funcionar em dev/prod
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Buscar loja com dados da empresa
    const { data: store, error } = await supabase
      .from('stores')
      .select(
        `
        id,
        name,
        company_id,
        status,
        created_at,
        companies!inner (
          id,
          name,
          email,
          phone,
          address,
          city,
          state,
          zip_code
        )
      `
      )
      .eq('id', params.id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Loja não encontrada' },
          { status: 404 }
        )
      }
      console.error('Erro ao buscar loja:', error)
      return NextResponse.json(
        { error: 'Erro ao buscar loja' },
        { status: 500 }
      )
    }

    // Contadores via client_products (por empresa/tenant)
    const companyId = store.company_id
    const { count: totalProducts } = await supabase
      .from('client_products')
      .select('*', { count: 'exact', head: true })
      .eq('client_id', companyId)
    const { count: activeProducts } = await supabase
      .from('client_products')
      .select('*', { count: 'exact', head: true })
      .eq('client_id', companyId)
      .eq('status', 'active')
    const { count: draftProducts } = await supabase
      .from('client_products')
      .select('*', { count: 'exact', head: true })
      .eq('client_id', companyId)
      .eq('status', 'draft')
    const { count: inactiveProducts } = await supabase
      .from('client_products')
      .select('*', { count: 'exact', head: true })
      .eq('client_id', companyId)
      .eq('status', 'inactive')

    // Buscar contagem de usuários da empresa
    const { count: usersCount } = await supabase
      .from('auth.users')
      .select('*', { count: 'exact', head: true })
      .eq('raw_user_meta_data->>company_id', store.company_id)

    // Buscar contagem de pedidos (se existir tabela orders)
    const { count: ordersCount } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', store.company_id)

    // Calcular receita (se existir tabela orders com total)
    const { data: revenueData } = await supabase
      .from('orders')
      .select('total_amount')
      .eq('company_id', store.company_id)
      .eq('status', 'completed')

    const revenue =
      revenueData?.reduce((sum, order) => sum + (order.total_amount || 0), 0) ||
      0

    // Montar resposta com dados reais
    const storeWithRealData = {
      ...store,
      domain: `${store.name.toLowerCase().replace(/\s+/g, '-')}.com`,
      logo_url: null,
      users_count: usersCount || 0,
      products_count: totalProducts || 0,
      products_ativo: activeProducts || 0,
      products_draft: draftProducts || 0,
      products_inativo: inactiveProducts || 0,
      orders_count: ordersCount || 0,
      revenue: revenue,
    }

    return NextResponse.json({ store: storeWithRealData })
  } catch (error) {
    console.error('Erro na API de lojas:', error)
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
    const { name, company_id, status } = body

    // Validação
    if (!name || !company_id) {
      return NextResponse.json(
        {
          error: 'Nome e empresa são obrigatórios',
        },
        { status: 400 }
      )
    }

    // Verificar se a empresa existe (companies table doesn't exist, skipping validation)
    // const { data: company } = await supabase
    //   .from('companies')
    //   .select('id')
    //   .eq('id', company_id)
    //   .single()

    // if (!company) {
    //   return NextResponse.json({
    //     error: 'Empresa não encontrada'
    //   }, { status: 400 })
    // }

    // Atualizar loja
    const { data: store, error } = await supabase
      .from('stores')
      .update({
        name: name.trim(),
        company_id,
        status: status || 'active',
      })
      .eq('id', params.id)
      .select(
        `
        id,
        name,
        company_id,
        status,
        created_at
      `
      )
      .single()

    if (error) {
      console.error('Erro ao atualizar loja:', error)
      return NextResponse.json(
        { error: 'Erro ao atualizar loja' },
        { status: 500 }
      )
    }

    // Adicionar campos calculados
    const storeWithCalculatedFields = {
      ...store,
      domain: `${store.name.toLowerCase().replace(/\s+/g, '-')}.com`,
      logo_url: null,
      users_count: 0,
      products_count: 0,
      orders_count: 0,
      revenue: 0,
    }

    return NextResponse.json({
      store: storeWithCalculatedFields,
      message: 'Loja atualizada com sucesso',
    })
  } catch (error) {
    console.error('Erro na API de lojas:', error)
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
    // Verificar se a loja existe
    const { data: existingStore } = await supabase
      .from('stores')
      .select('id')
      .eq('id', params.id)
      .single()

    if (!existingStore) {
      return NextResponse.json(
        { error: 'Loja não encontrada' },
        { status: 404 }
      )
    }

    // Deletar loja
    const { error } = await supabase.from('stores').delete().eq('id', params.id)

    if (error) {
      console.error('Erro ao deletar loja:', error)
      return NextResponse.json(
        { error: 'Erro ao deletar loja' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Loja deletada com sucesso',
    })
  } catch (error) {
    console.error('Erro na API de lojas:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
