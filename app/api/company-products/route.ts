import { NextRequest, NextResponse } from 'next/server'
import { supabaseService } from '@/lib/supabaseService'
import { authenticateAndAuthorize } from '@/lib/auth'

// GET - Listar produtos da empresa
export async function GET(request: NextRequest) {
  try {
    const { user, error: authError } = await authenticateAndAuthorize(request, {
      roles: ['gestor', 'admin', 'admin_global', 'superadmin', 'funcionario'],
    })

    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Obter parâmetros de query
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''
    const category = searchParams.get('category') || ''

    const offset = (page - 1) * limit

    // Determinar company_id baseado no role
    let companyId = null
    if (
      user.role === 'gestor' ||
      user.role === 'admin' ||
      user.role === 'funcionario'
    ) {
      const { data: userData } = await supabaseService
        .from('users')
        .select('company_id')
        .eq('id', user.id)
        .single()

      if (!userData?.company_id) {
        return NextResponse.json(
          { error: 'Usuário não associado a empresa' },
          { status: 400 }
        )
      }
      companyId = userData.company_id
    }

    // Construir query
    let query = supabaseService.from('company_products').select(
      `
        id,
        name,
        description,
        base_code,
        final_sku,
        ean_13,
        price,
        points_cost,
        specifications,
        images,
        status,
        is_replicated,
        source_budget_id,
        created_at,
        updated_at,
        product_categories (
          id,
          name,
          icon,
          color
        ),
        base_products (
          id,
          name,
          description,
          base_code
        )
      `,
      { count: 'exact' }
    )

    // Aplicar filtros
    if (companyId) {
      query = query.eq('company_id', companyId)
    }

    if (search) {
      query = query.or(
        `name.ilike.%${search}%,description.ilike.%${search}%,final_sku.ilike.%${search}%`
      )
    }

    if (status) {
      query = query.eq('status', status)
    }

    if (category) {
      query = query.eq('category_id', category)
    }

    // Aplicar paginação
    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    const { data: products, error, count } = await query

    if (error) {
      console.error('Erro ao buscar produtos:', error)
      return NextResponse.json(
        { error: 'Erro ao buscar produtos' },
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
    console.error('Erro na API de produtos da empresa:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// POST - Criar produto da empresa
export async function POST(request: NextRequest) {
  try {
    const { user, error: authError } = await authenticateAndAuthorize(request, {
      roles: ['gestor', 'admin', 'admin_global', 'superadmin'],
    })

    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const {
      base_product_id,
      name,
      description,
      price,
      points_cost,
      specifications,
      images,
      category_id,
      final_sku,
      ean_13,
    } = body

    // Validar dados obrigatórios
    if (!base_product_id || !name || !price) {
      return NextResponse.json(
        { error: 'Campos obrigatórios: base_product_id, name, price' },
        { status: 400 }
      )
    }

    // Obter company_id
    let companyId = null
    if (user.role === 'gestor' || user.role === 'admin') {
      const { data: userData } = await supabaseService
        .from('users')
        .select('company_id')
        .eq('id', user.id)
        .single()

      if (!userData?.company_id) {
        return NextResponse.json(
          { error: 'Usuário não associado a empresa' },
          { status: 400 }
        )
      }
      companyId = userData.company_id
    }

    // Verificar se o produto base existe
    const { data: baseProduct, error: baseError } = await supabaseService
      .from('base_products')
      .select('id, name, description, base_code, base_price, base_points_cost')
      .eq('id', base_product_id)
      .eq('status', 'active')
      .single()

    if (baseError || !baseProduct) {
      return NextResponse.json(
        { error: 'Produto base não encontrado' },
        { status: 404 }
      )
    }

    // Verificar se já existe produto replicado
    const { data: existingProduct, error: existingError } =
      await supabaseService
        .from('company_products')
        .select('id')
        .eq('base_product_id', base_product_id)
        .eq('company_id', companyId)
        .single()

    if (existingProduct) {
      return NextResponse.json(
        { error: 'Produto já foi replicado para esta empresa' },
        { status: 400 }
      )
    }

    // Gerar SKU final se não fornecido
    let finalSku = final_sku
    if (!finalSku) {
      const { data: skuData, error: skuError } = await supabaseService.rpc(
        'make_final_sku',
        {
          p_base_code: baseProduct.base_code,
          p_company_id: companyId,
        }
      )

      if (skuError) {
        console.error('Erro ao gerar SKU:', skuError)
        return NextResponse.json(
          { error: 'Erro ao gerar SKU final' },
          { status: 500 }
        )
      }
      finalSku = skuData
    }

    // Gerar EAN-13 se não fornecido
    let ean13 = ean_13
    if (!ean13) {
      const { data: eanData, error: eanError } = await supabaseService.rpc(
        'gen_ean13',
        {
          p_company_id: companyId,
        }
      )

      if (eanError) {
        console.error('Erro ao gerar EAN-13:', eanError)
        return NextResponse.json(
          { error: 'Erro ao gerar EAN-13' },
          { status: 500 }
        )
      }
      ean13 = eanData
    }

    // Criar produto
    const productData = {
      company_id: companyId,
      base_product_id,
      name: name || baseProduct.name,
      description: description || baseProduct.description,
      base_code: baseProduct.base_code,
      final_sku: finalSku,
      ean_13: ean13,
      price: price || baseProduct.base_price,
      points_cost: points_cost || baseProduct.base_points_cost,
      specifications: specifications || baseProduct.specifications,
      images: images || baseProduct.images,
      category_id,
      status: 'active',
      is_replicated: false,
      created_by: user.id,
      updated_by: user.id,
    }

    const { data: newProduct, error: createError } = await supabaseService
      .from('company_products')
      .insert(productData)
      .select(
        `
        id,
        name,
        description,
        base_code,
        final_sku,
        ean_13,
        price,
        points_cost,
        specifications,
        images,
        status,
        is_replicated,
        created_at,
        product_categories (
          id,
          name,
          icon,
          color
        ),
        base_products (
          id,
          name,
          description,
          base_code
        )
      `
      )
      .single()

    if (createError) {
      console.error('Erro ao criar produto:', createError)
      return NextResponse.json(
        { error: 'Erro ao criar produto' },
        { status: 500 }
      )
    }

    // Log de auditoria
    try {
      await supabaseService.from('audit_logs').insert({
        action: 'company_product_created',
        user_id: user.id,
        company_id: companyId,
        resource_type: 'company_product',
        resource_id: newProduct.id,
        details: {
          name: newProduct.name,
          final_sku: newProduct.final_sku,
          price: newProduct.price,
        },
      })
    } catch (auditError) {
      console.error('Erro ao registrar auditoria:', auditError)
    }

    return NextResponse.json({
      success: true,
      data: newProduct,
      message: 'Produto criado com sucesso',
    })
  } catch (error) {
    console.error('Erro na API de criação de produto:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
