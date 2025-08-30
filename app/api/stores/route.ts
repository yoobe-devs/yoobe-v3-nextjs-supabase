import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Usar service role key para contornar autenticação
const supabaseUrl = 'http://localhost:54321'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const status = searchParams.get('status')
    const company_id = searchParams.get('company_id')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = (page - 1) * limit

    let query = supabase
      .from('stores')
      .select(`
        id,
        name,
        company_id,
        status,
        created_at,
        companies(id, name)
      `, { count: 'exact' })

    // Aplicar filtros
    if (search) {
      query = query.or(`name.ilike.%${search}%,companies.name.ilike.%${search}%`)
    }
    if (status && status !== 'all') {
      query = query.eq('status', status)
    }
    if (company_id) {
      query = query.eq('company_id', company_id)
    }

    // Aplicar paginação
    query = query.order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    const { data: stores, error, count } = await query

    if (error) {
      console.error('Erro ao buscar lojas:', error)
      return NextResponse.json({ error: 'Erro ao buscar lojas' }, { status: 500 })
    }

    console.log('Lojas encontradas:', stores?.length || 0)

    // Adicionar campos calculados para compatibilidade com o frontend
    const storesWithCalculatedFields = stores?.map(store => ({
      ...store,
      domain: `${store.name.toLowerCase().replace(/\s+/g, '-')}.com`,
      logo_url: null,
      users_count: 0,
      products_count: 0,
      orders_count: 0,
      revenue: 0
    })) || []

    return NextResponse.json({
      stores: storesWithCalculatedFields,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    })

  } catch (error) {
    console.error('Erro na API de lojas:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, domain, company_id, status, logo_url } = body

    // Validação
    if (!name || !company_id) {
      return NextResponse.json({ 
        error: 'Nome e empresa são obrigatórios' 
      }, { status: 400 })
    }

    // Verificar se a empresa existe
    const { data: company } = await supabase
      .from('companies')
      .select('id')
      .eq('id', company_id)
      .single()

    if (!company) {
      return NextResponse.json({ 
        error: 'Empresa não encontrada' 
      }, { status: 400 })
    }

    // Inserir loja
    const { data: store, error } = await supabase
      .from('stores')
      .insert({
        name: name.trim(),
        company_id,
        status: status || 'active'
      })
      .select(`
        id,
        name,
        company_id,
        status,
        created_at,
        companies(name)
      `)
      .single()

    if (error) {
      console.error('Erro ao criar loja:', error)
      return NextResponse.json({ error: 'Erro ao criar loja' }, { status: 500 })
    }

    return NextResponse.json({
      store,
      message: 'Loja criada com sucesso'
    }, { status: 201 })

  } catch (error) {
    console.error('Erro na API de lojas:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
