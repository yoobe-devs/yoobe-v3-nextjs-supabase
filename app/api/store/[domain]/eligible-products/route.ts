import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

// GET - Buscar produtos elegíveis para o usuário baseado em tags
export async function GET(
  request: NextRequest,
  { params }: { params: { domain: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Primeiro buscar a loja pelo domínio
    const { data: store, error: storeError } = await supabase
      .from('stores')
      .select('id, company_id')
      .eq('domain', params.domain)
      .eq('status', 'active')
      .single()

    if (storeError || !store) {
      return NextResponse.json(
        { error: 'Loja não encontrada' },
        { status: 404 }
      )
    }

    // Verificar se há usuário autenticado
    const {
      data: { session },
    } = await supabase.auth.getSession()

    let userTags: string[] = []
    if (session?.user) {
      // Buscar tags do usuário
      const { data: tags } = await supabase
        .from('user_tags')
        .select('tag_id, tags(name)')
        .eq('user_id', session.user.id)

      userTags = tags?.map(t => t.tags?.name).filter(Boolean) || []
    }

    // Buscar produtos da loja com tags
    const { data: products, error: productsError } = await supabase
      .from('company_products')
      .select(
        `
        *,
        product_categories (
          id,
          name,
          icon,
          color
        ),
        company_product_tags (
          tag_id,
          tags (
            id,
            name,
            color,
            icon
          )
        )
      `
      )
      .eq('store_id', store.id)
      .eq('status', 'active')
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (productsError) {
      console.error('Erro ao buscar produtos:', productsError)
      return NextResponse.json(
        { error: 'Erro ao buscar produtos' },
        { status: 500 }
      )
    }

    // Filtrar produtos elegíveis
    const eligibleProducts =
      products?.filter(product => {
        const productTags =
          product.company_product_tags
            ?.map((cpt: any) => cpt.tags?.name)
            .filter(Boolean) || []

        // Se o produto não tem tags, é elegível para todos
        if (productTags.length === 0) {
          return true
        }

        // Se o usuário não tem tags, só pode ver produtos sem tags
        if (userTags.length === 0) {
          return false
        }

        // Verificar se há interseção entre tags do usuário e do produto
        const hasCommonTags = productTags.some((tag: string) =>
          userTags.includes(tag)
        )
        return hasCommonTags
      }) || []

    // Adicionar informações de elegibilidade
    const productsWithEligibility = eligibleProducts.map(product => ({
      ...product,
      eligibility: {
        isEligible: true,
        reason:
          product.company_product_tags?.length === 0
            ? 'no_tags'
            : 'has_matching_tags',
        userTags,
        productTags:
          product.company_product_tags
            ?.map((cpt: any) => cpt.tags?.name)
            .filter(Boolean) || [],
      },
    }))

    return NextResponse.json({
      products: productsWithEligibility,
      userTags,
      total: productsWithEligibility.length,
    })
  } catch (error) {
    console.error('Erro na API de produtos elegíveis:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}







