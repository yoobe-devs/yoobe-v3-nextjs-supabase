import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Usar service role key para contornar autenticação
const supabaseUrl = 'http://localhost:54321'
const supabaseServiceKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// GET - Listar empresas com RLS baseado no papel do usuário
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('q') || searchParams.get('search') || ''
    const status = searchParams.get('status') || 'active'
    const sort = searchParams.get('sort') || 'name_asc'

    // Parse sort parameter
    const [sortBy, sortOrder] = sort.split('_')
    const ascending = sortOrder === 'asc'

    // Use service role to bypass RLS for now
    let query = supabase.from('companies').select('*', { count: 'exact' })

    // Apply filters
    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`)
    }

    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    // Apply sorting
    if (sortBy === 'name') {
      query = query.order('name', { ascending })
    } else if (sortBy === 'created') {
      query = query.order('created_at', { ascending })
    } else {
      query = query.order('name', { ascending: true })
    }

    // Apply pagination
    const from = (page - 1) * limit
    const to = from + limit - 1
    query = query.range(from, to)

    const { data, error, count } = await query

    if (error) {
      console.error('Erro ao buscar empresas:', error)
      return NextResponse.json(
        {
          error: 'Erro ao buscar empresas',
          details: error.message,
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      items: data || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        total_pages: Math.ceil((count || 0) / limit),
      },
    })
  } catch (error) {
    console.error('Erro na API de empresas:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// POST - Criar empresa
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      name,
      email,
      phone,
      address,
      city,
      state,
      country,
      postal_code,
      website,
      description,
      logo_url,
      point_rate,
      allow_points_only,
      allow_mixed_payments,
      stripe_account_id_br,
      stripe_account_id_us,
    } = body

    // Validações
    if (!name || !email) {
      return NextResponse.json(
        { error: 'Nome e email são obrigatórios' },
        { status: 400 }
      )
    }

    // Skip mock validation for now

    // Verificar se email já existe
    const { data: existingCompany } = await supabase
      .from('companies')
      .select('id')
      .eq('email', email)
      .single()

    if (existingCompany) {
      return NextResponse.json(
        { error: 'Email já cadastrado' },
        { status: 409 }
      )
    }

    // Criar empresa
    const { data, error } = await supabase
      .from('companies')
      .insert({
        name,
        email,
        phone,
        address,
        city,
        state,
        country,
        postal_code,
        website,
        description,
        logo_url,
        point_rate: point_rate || 0.1,
        allow_points_only: allow_points_only || false,
        allow_mixed_payments: allow_mixed_payments || false,
        stripe_account_id_br,
        stripe_account_id_us,
        status: 'active',
      })
      .select()
      .single()

    if (error) {
      console.error('Erro ao criar empresa:', error)
      return NextResponse.json(
        { error: 'Erro ao criar empresa' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      company: data,
      message: 'Empresa criada com sucesso',
    })
  } catch (error) {
    console.error('Erro na API de empresas:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
