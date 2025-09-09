import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

// POST - Replicar produto para loja (com atualização de contadores)
export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Verificar autenticação
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const {
      base_product_id,
      store_id,
      status = 'draft',
      custom_sku,
      custom_price,
      custom_description,
      custom_tags,
      custom_images,
    } = body

    if (!base_product_id || !store_id) {
      return NextResponse.json(
        { error: 'base_product_id e store_id são obrigatórios' },
        { status: 400 }
      )
    }

    // Verificar se a loja existe e buscar informações da empresa
    const { data: store, error: storeError } = await supabase
      .from('stores')
      .select(
        `
        id,
        name,
        company_id,
        companies!inner(
          id,
          name,
          domain
        )
      `
      )
      .eq('id', store_id)
      .single()

    if (storeError || !store) {
      return NextResponse.json(
        { error: 'Loja não encontrada' },
        { status: 404 }
      )
    }

    // Verificar se o produto base existe
    const { data: baseProduct, error: baseProductError } = await supabase
      .from('base_products')
      .select('*')
      .eq('id', base_product_id)
      .single()

    if (baseProductError || !baseProduct) {
      return NextResponse.json(
        { error: 'Produto base não encontrado' },
        { status: 404 }
      )
    }

    // Verificar se já existe uma replicação para esta loja
    const { data: existingProduct, error: existingError } = await supabase
      .from('store_products')
      .select('id')
      .eq('base_product_id', base_product_id)
      .eq('store_id', store_id)
      .single()

    if (existingError && existingError.code !== 'PGRST116') {
      console.error('Erro ao verificar produto existente:', existingError)
      return NextResponse.json(
        { error: 'Erro ao verificar produto existente' },
        { status: 500 }
      )
    }

    if (existingProduct) {
      return NextResponse.json(
        { error: 'Produto já replicado para esta loja' },
        { status: 409 }
      )
    }

    // Gerar SKU único para a loja
    const storeSku = custom_sku || `${baseProduct.sku}-${store_id}`

    // Preparar dados do produto replicado
    const storeProductData = {
      base_product_id,
      store_id,
      status,
      store_sku: storeSku,
      price: custom_price || baseProduct.price,
      description: custom_description || baseProduct.description,
      tags: custom_tags || baseProduct.tags,
      images: custom_images || baseProduct.images,
      ean13: baseProduct.ean13, // Pode ser gerado posteriormente
      is_active: status === 'ativo',
    }

    // Inserir produto replicado (os triggers irão atualizar as estatísticas automaticamente)
    const { data: newStoreProduct, error: insertError } = await supabase
      .from('store_products')
      .insert([storeProductData])
      .select(
        `
        *,
        base_products!inner(
          id,
          name,
          sku,
          price,
          description,
          tags,
          images,
          ean13
        ),
        stores!inner(
          id,
          name,
          company_id,
          companies!inner(
            id,
            name,
            domain
          )
        )
      `
      )
      .single()

    if (insertError) {
      console.error('Erro ao replicar produto:', insertError)
      return NextResponse.json(
        { error: 'Erro ao replicar produto' },
        { status: 500 }
      )
    }

    // Buscar estatísticas atualizadas da empresa
    const { data: companyStats, error: statsError } = await supabase
      .from('company_stats')
      .select('*')
      .eq('company_id', store.company_id)
      .single()

    if (statsError) {
      console.warn('Erro ao buscar estatísticas da empresa:', statsError)
    }

    // Buscar estatísticas atualizadas da loja
    const { data: storeStats, error: storeStatsError } = await supabase
      .from('store_stats')
      .select('*')
      .eq('store_id', store_id)
      .single()

    if (storeStatsError) {
      console.warn('Erro ao buscar estatísticas da loja:', storeStatsError)
    }

    // Log da replicação
    console.log('PRODUCT_REPLICATED', {
      base_product_id,
      store_id,
      company_id: store.company_id,
      status,
      store_sku: storeSku,
      timestamp: new Date().toISOString(),
    })

    return NextResponse.json({
      success: true,
      message: 'Produto replicado com sucesso',
      data: {
        store_product: newStoreProduct,
        stats: {
          company: {
            id: store.company_id,
            name: store.companies.name,
            products_total: companyStats?.products_total || 0,
            products_draft: companyStats?.products_draft || 0,
            products_liberado: companyStats?.products_liberado || 0,
            products_ativo: companyStats?.products_ativo || 0,
            products_inativo: companyStats?.products_inativo || 0,
          },
          store: {
            id: store_id,
            name: store.name,
            products_total: storeStats?.products_total || 0,
            products_draft: storeStats?.products_draft || 0,
            products_liberado: storeStats?.products_liberado || 0,
            products_ativo: storeStats?.products_ativo || 0,
            products_inativo: storeStats?.products_inativo || 0,
          },
        },
      },
    })
  } catch (error) {
    console.error('Erro na API de replicação:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}










