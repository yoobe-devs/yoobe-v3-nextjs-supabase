import { createClient } from '@supabase/supabase-js'

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321'
const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

/**
 * Verifica se um usuário pode resgatar um produto baseado nas tags
 * @param userId ID do usuário
 * @param storeProductId ID do produto da loja
 * @param storeId ID da loja
 * @returns true se pode resgatar, false caso contrário
 */
export async function canRedeemByTags(
  userId: string | number,
  storeProductId: string | number,
  storeId: string | number
): Promise<boolean> {
  try {
    // 1) Verificar se a flag da loja está ativa
    const { data: storeSettings, error: settingsError } = await supabase
      .from('store_settings')
      .select('resgate_por_tags_enabled')
      .eq('store_id', storeId)
      .single()

    if (settingsError || !storeSettings) {
      console.error('Erro ao buscar configurações da loja:', settingsError)
      return true // Se não conseguir verificar, permite (comportamento seguro)
    }

    if (!storeSettings.resgate_por_tags_enabled) {
      return true // Tag Gate desabilitado, permite resgate
    }

    // 2) Verificar se o produto tem tags
    const { data: productTags, error: productTagsError } = await supabase
      .from('store_product_tags')
      .select('tag_id')
      .eq('store_product_id', storeProductId)

    if (productTagsError) {
      console.error('Erro ao buscar tags do produto:', productTagsError)
      return true // Se não conseguir verificar, permite (comportamento seguro)
    }

    if (!productTags || productTags.length === 0) {
      return true // Produto sem tags = "Geral", visível para todos
    }

    // 3) Verificar se o usuário tem pelo menos uma tag em comum
    const { data: userTags, error: userTagsError } = await supabase
      .from('user_tags')
      .select('tag_id')
      .eq('user_id', userId)

    if (userTagsError) {
      console.error('Erro ao buscar tags do usuário:', userTagsError)
      return false // Se não conseguir verificar tags do usuário, bloqueia
    }

    if (!userTags || userTags.length === 0) {
      return false // Usuário sem tags não pode resgatar produtos com tags
    }

    // 4) Verificar interseção (ANY)
    const productTagIds = productTags.map(pt => pt.tag_id)
    const userTagIds = userTags.map(ut => ut.tag_id)

    const hasIntersection = productTagIds.some(tagId =>
      userTagIds.includes(tagId)
    )

    return hasIntersection
  } catch (error) {
    console.error('Erro no canRedeemByTags:', error)
    return false // Em caso de erro, bloqueia por segurança
  }
}

/**
 * Busca produtos visíveis para um usuário baseado nas tags
 * @param userId ID do usuário
 * @param storeId ID da loja
 * @param filters Filtros adicionais (opcional)
 * @returns Lista de produtos visíveis
 */
export async function getVisibleProducts(
  userId: string | number,
  storeId: string | number,
  filters: {
    category?: string
    search?: string
    limit?: number
    offset?: number
  } = {}
): Promise<any[]> {
  try {
    // 1) Verificar se a flag da loja está ativa
    const { data: storeSettings, error: settingsError } = await supabase
      .from('store_settings')
      .select('resgate_por_tags_enabled')
      .eq('store_id', storeId)
      .single()

    if (
      settingsError ||
      !storeSettings ||
      !storeSettings.resgate_por_tags_enabled
    ) {
      // Tag Gate desabilitado, retornar todos os produtos
      const { data: allProducts, error: allProductsError } = await supabase
        .from('store_products')
        .select('*')
        .eq('store_id', storeId)
        .eq('is_active', true)
        .limit(filters.limit || 50)
        .offset(filters.offset || 0)

      if (allProductsError) {
        console.error('Erro ao buscar produtos:', allProductsError)
        return []
      }

      return allProducts || []
    }

    // 2) Tag Gate ativo - aplicar filtro por tags
    // Buscar tags do usuário
    const { data: userTags, error: userTagsError } = await supabase
      .from('user_tags')
      .select('tag_id')
      .eq('user_id', userId)

    if (userTagsError) {
      console.error('Erro ao buscar tags do usuário:', userTagsError)
      return []
    }

    const userTagIds = userTags?.map(ut => ut.tag_id) || []

    // 3) Buscar produtos com query complexa
    let query = supabase
      .from('store_products')
      .select(
        `
        *,
        store_product_tags!inner(tag_id)
      `
      )
      .eq('store_id', storeId)
      .eq('is_active', true)

    // Aplicar filtros adicionais
    if (filters.category) {
      query = query.eq('category', filters.category)
    }

    if (filters.search) {
      query = query.ilike('name', `%${filters.search}%`)
    }

    // Aplicar filtro de tags
    if (userTagIds.length > 0) {
      query = query.in('store_product_tags.tag_id', userTagIds)
    }

    query = query.limit(filters.limit || 50).offset(filters.offset || 0)

    const { data: taggedProducts, error: taggedProductsError } = await query

    if (taggedProductsError) {
      console.error('Erro ao buscar produtos com tags:', taggedProductsError)
      return []
    }

    // 4) Buscar produtos sem tags (produtos "Geral")
    const { data: generalProducts, error: generalProductsError } =
      await supabase
        .from('store_products')
        .select('*')
        .eq('store_id', storeId)
        .eq('is_active', true)
        .not('id', 'in', `(SELECT store_product_id FROM store_product_tags)`)

    if (generalProductsError) {
      console.error('Erro ao buscar produtos gerais:', generalProductsError)
    }

    // 5) Combinar resultados
    const visibleProducts = [
      ...(taggedProducts || []),
      ...(generalProducts || []),
    ]

    // Remover duplicatas
    const uniqueProducts = visibleProducts.filter(
      (product, index, self) =>
        index === self.findIndex(p => p.id === product.id)
    )

    return uniqueProducts
  } catch (error) {
    console.error('Erro no getVisibleProducts:', error)
    return []
  }
}

/**
 * Atribui tags a um usuário
 * @param userId ID do usuário
 * @param tagIds Array de IDs das tags
 */
export async function assignTagsToUser(
  userId: string | number,
  tagIds: string[] | number[]
): Promise<boolean> {
  try {
    // Remover tags existentes
    await supabase.from('user_tags').delete().eq('user_id', userId)

    // Inserir novas tags
    if (tagIds.length > 0) {
      const userTags = tagIds.map(tagId => ({
        user_id: userId,
        tag_id: tagId,
      }))

      const { error: insertError } = await supabase
        .from('user_tags')
        .insert(userTags)

      if (insertError) {
        console.error('Erro ao atribuir tags ao usuário:', insertError)
        return false
      }
    }

    return true
  } catch (error) {
    console.error('Erro no assignTagsToUser:', error)
    return false
  }
}

/**
 * Atribui tags a um produto
 * @param storeProductId ID do produto da loja
 * @param tagIds Array de IDs das tags
 */
export async function assignTagsToProduct(
  storeProductId: string | number,
  tagIds: string[] | number[]
): Promise<boolean> {
  try {
    // Remover tags existentes
    await supabase
      .from('store_product_tags')
      .delete()
      .eq('store_product_id', storeProductId)

    // Inserir novas tags
    if (tagIds.length > 0) {
      const productTags = tagIds.map(tagId => ({
        store_product_id: storeProductId,
        tag_id: tagId,
      }))

      const { error: insertError } = await supabase
        .from('store_product_tags')
        .insert(productTags)

      if (insertError) {
        console.error('Erro ao atribuir tags ao produto:', insertError)
        return false
      }
    }

    return true
  } catch (error) {
    console.error('Erro no assignTagsToProduct:', error)
    return false
  }
}

/**
 * Busca tags de um usuário
 * @param userId ID do usuário
 * @returns Array de tags do usuário
 */
export async function getUserTags(userId: string | number): Promise<any[]> {
  try {
    const { data: userTags, error } = await supabase
      .from('user_tags')
      .select(
        `
        tag_id,
        tags!inner(id, name, color, description)
      `
      )
      .eq('user_id', userId)

    if (error) {
      console.error('Erro ao buscar tags do usuário:', error)
      return []
    }

    return userTags?.map(ut => ut.tags).filter(Boolean) || []
  } catch (error) {
    console.error('Erro no getUserTags:', error)
    return []
  }
}

/**
 * Busca tags de um produto
 * @param storeProductId ID do produto da loja
 * @returns Array de tags do produto
 */
export async function getProductTags(
  storeProductId: string | number
): Promise<any[]> {
  try {
    const { data: productTags, error } = await supabase
      .from('store_product_tags')
      .select(
        `
        tag_id,
        tags!inner(id, name, color, description)
      `
      )
      .eq('store_product_id', storeProductId)

    if (error) {
      console.error('Erro ao buscar tags do produto:', error)
      return []
    }

    return productTags?.map(pt => pt.tags).filter(Boolean) || []
  } catch (error) {
    console.error('Erro no getProductTags:', error)
    return []
  }
}

