import { NextRequest, NextResponse } from 'next/server'
import { supabaseService } from '@/lib/supabaseService'
import { authenticateAndAuthorize } from '@/lib/auth'

// GET - Listar produtos base (Admin Global)
export async function GET(request: NextRequest) {
  try {
    const { user, error: authError } = await authenticateAndAuthorize(request, {
      roles: ['admin_global', 'superadmin'],
    })

    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Obter parâmetros de query
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || ''
    const category = searchParams.get('category') || ''
    const status = searchParams.get('status') || 'active'

    const offset = (page - 1) * limit

    // Construir query
    let query = supabaseService.from('base_products').select(
      `
        id,
        name,
        description,
        base_code,
        base_price,
        base_points_cost,
        specifications,
        images,
        status,
        created_at,
        updated_at,
        product_categories (
          id,
          name,
          icon,
          color
        )
      `,
      { count: 'exact' }
    )

    // Aplicar filtros
    if (search) {
      query = query.or(
        `name.ilike.%${search}%,description.ilike.%${search}%,base_code.ilike.%${search}%`
      )
    }

    if (category) {
      query = query.eq('category_id', category)
    }

    if (status) {
      query = query.eq('status', status)
    }

    // Aplicar paginação
    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    const { data: products, error, count } = await query

    if (error) {
      console.error('Erro ao buscar produtos base:', error)
      return NextResponse.json(
        { error: 'Erro ao buscar produtos base' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: products || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    })
  } catch (error) {
    console.error('Erro na API de produtos base:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// POST - Criar produto base (Admin Global)
export async function POST(request: NextRequest) {
  try {
    const { user, error: authError } = await authenticateAndAuthorize(request, {
      roles: ['admin_global', 'superadmin'],
    })

    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const {
      name,
      description,
      base_code,
      base_price,
      base_points_cost,
      specifications,
      images,
      category_id,
      status = 'active',
    } = body

    // Validar dados obrigatórios
    if (!name || !base_code || !base_price) {
      return NextResponse.json(
        { error: 'Campos obrigatórios: name, base_code, base_price' },
        { status: 400 }
      )
    }

    // Verificar se o código base já existe
    const { data: existingProduct, error: existingError } =
      await supabaseService
        .from('base_products')
        .select('id')
        .eq('base_code', base_code)
        .single()

    if (existingProduct) {
      return NextResponse.json(
        { error: 'Código base já existe' },
        { status: 400 }
      )
    }

    // Criar produto base
    const productData = {
      name,
      description,
      base_code,
      base_price,
      base_points_cost: base_points_cost || 0,
      specifications: specifications || {},
      images: images || [],
      category_id,
      status,
      created_by: user.id,
      updated_by: user.id,
    }

    const { data: newProduct, error: createError } = await supabaseService
      .from('base_products')
      .insert(productData)
      .select(
        `
        id,
        name,
        description,
        base_code,
        base_price,
        base_points_cost,
        specifications,
        images,
        status,
        created_at,
        product_categories (
          id,
          name,
          icon,
          color
        )
      `
      )
      .single()

    if (createError) {
      console.error('Erro ao criar produto base:', createError)
      return NextResponse.json(
        { error: 'Erro ao criar produto base' },
        { status: 500 }
      )
    }

    // Log de auditoria
    try {
      await supabaseService.from('audit_logs').insert({
        action: 'base_product_created',
        user_id: user.id,
        resource_type: 'base_product',
        resource_id: newProduct.id,
        details: {
          name: newProduct.name,
          base_code: newProduct.base_code,
          base_price: newProduct.base_price,
        },
      })
    } catch (auditError) {
      console.error('Erro ao registrar auditoria:', auditError)
    }

    return NextResponse.json({
      success: true,
      data: newProduct,
      message: 'Produto base criado com sucesso',
    })
  } catch (error) {
    console.error('Erro na API de criação de produto base:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

