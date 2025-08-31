import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

const supabaseUrl = 'http://localhost:54321'
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

const supabaseService = createClient(supabaseUrl, serviceKey)

// GET - Buscar produtos da empresa do gestor
export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Buscar dados do usuário usando service role
    const { data: userData, error: userError } = await supabaseService
      .from('users')
      .select('company_id, role, store_id')
      .eq('id', user.id)
      .single()

    if (userError || !userData) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }

    if (userData.role !== 'manager') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    // Buscar produtos da loja usando service role
    const { data: products, error: productsError } = await supabaseService
      .from('company_products')
      .select(`
        *,
        product_categories (
          id,
          name,
          icon,
          color
        ),
        base_products (
          id,
          name,
          base_price,
          base_points_cost
        )
      `)
      .eq('store_id', userData.store_id)
      .order('created_at', { ascending: false })

    if (productsError) {
      console.error('Erro ao buscar produtos:', productsError)
      return NextResponse.json({ error: 'Erro ao buscar produtos' }, { status: 500 })
    }

    return NextResponse.json(products || [])
  } catch (error) {
    console.error('Erro na API de produtos do gestor:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

// POST - Criar novo produto
export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Buscar dados do usuário usando service role
    const { data: userData, error: userError } = await supabaseService
      .from('users')
      .select('company_id, role, store_id')
      .eq('id', user.id)
      .single()

    if (userError || !userData) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }

    if (userData.role !== 'manager') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const body = await request.json()
    const {
      name,
      description,
      price,
      points_cost,
      stock_quantity,
      image_url,
      category_id,
      base_product_id
    } = body

    // Criar novo produto usando service role
    const { data: newProduct, error: createError } = await supabaseService
      .from('company_products')
      .insert({
        name,
        description,
        price,
        points_cost,
        stock_quantity,
        image_url,
        category_id,
        base_product_id,
        company_id: userData.company_id,
        store_id: userData.store_id,
        status: 'active'
      })
      .select()
      .single()

    if (createError) {
      console.error('Erro ao criar produto:', createError)
      return NextResponse.json({ error: 'Erro ao criar produto' }, { status: 500 })
    }

    return NextResponse.json({ 
      message: 'Produto criado com sucesso',
      product: newProduct
    })
  } catch (error) {
    console.error('Erro na API de produtos do gestor:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
