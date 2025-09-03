// =====================================================
// SERVIÇO DE CARRINHO DE COMPRAS
// YOOBE v3.0.0 - Cart Service
// =====================================================

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import {
  Cart,
  CartItem,
  CartWithItems,
  AddToCartRequest,
  UpdateCartItemRequest,
  CartFilters,
  PaginationParams,
  CartResponse,
  CartStatistics,
} from '@/types/cart'

export class CartService {
  private supabase = createClientComponentClient()

  // =====================================================
  // FUNÇÕES PRINCIPAIS DO CARRINHO
  // =====================================================

  /**
   * Obtém ou cria um carrinho ativo para o usuário
   */
  async getOrCreateCart(tenantId: string): Promise<Cart> {
    const {
      data: { user },
    } = await this.supabase.auth.getUser()
    if (!user) throw new Error('Usuário não autenticado')

    // Buscar carrinho ativo existente
    let { data: existingCart } = await this.supabase
      .from('carts')
      .select('*')
      .eq('user_id', user.id)
      .eq('tenant_id', tenantId)
      .eq('status', 'active')
      .single()

    if (existingCart) {
      return existingCart
    }

    // Criar novo carrinho
    const { data: newCart, error } = await this.supabase
      .from('carts')
      .insert({
        user_id: user.id,
        tenant_id: tenantId,
        status: 'active',
        expires_at: new Date(
          Date.now() + 7 * 24 * 60 * 60 * 1000
        ).toISOString(),
      })
      .select()
      .single()

    if (error) throw new Error(`Erro ao criar carrinho: ${error.message}`)
    return newCart
  }

  /**
   * Adiciona um produto ao carrinho
   */
  async addToCart(
    request: AddToCartRequest,
    tenantId: string
  ): Promise<CartItem> {
    const {
      data: { user },
    } = await this.supabase.auth.getUser()
    if (!user) throw new Error('Usuário não autenticado')

    // Obter ou criar carrinho
    const cart = await this.getOrCreateCart(tenantId)

    // Verificar se o produto já existe no carrinho
    const { data: existingItem } = await this.supabase
      .from('cart_items')
      .select('*')
      .eq('cart_id', cart.id)
      .eq('product_id', request.product_id)
      .single()

    if (existingItem) {
      // Atualizar quantidade existente
      const newQuantity = existingItem.quantity + request.quantity
      const { data: updatedItem, error } = await this.supabase
        .from('cart_items')
        .update({
          quantity: newQuantity,
          total_price: existingItem.unit_price * newQuantity,
          metadata: { ...existingItem.metadata, ...request.metadata },
        })
        .eq('id', existingItem.id)
        .select()
        .single()

      if (error) throw new Error(`Erro ao atualizar item: ${error.message}`)
      return updatedItem
    }

    // Buscar informações do produto
    const { data: product } = await this.supabase
      .from('products')
      .select('price')
      .eq('id', request.product_id)
      .single()

    if (!product) throw new Error('Produto não encontrado')

    // Adicionar novo item
    const { data: newItem, error } = await this.supabase
      .from('cart_items')
      .insert({
        cart_id: cart.id,
        product_id: request.product_id,
        quantity: request.quantity,
        unit_price: product.price,
        total_price: product.price * request.quantity,
        metadata: request.metadata || {},
      })
      .select()
      .single()

    if (error) throw new Error(`Erro ao adicionar item: ${error.message}`)
    return newItem
  }

  /**
   * Atualiza um item do carrinho
   */
  async updateCartItem(
    itemId: string,
    request: UpdateCartItemRequest
  ): Promise<CartItem> {
    const {
      data: { user },
    } = await this.supabase.auth.getUser()
    if (!user) throw new Error('Usuário não autenticado')

    // Verificar se o item pertence ao usuário
    const { data: existingItem } = await this.supabase
      .from('cart_items')
      .select('*, carts!inner(*)')
      .eq('id', itemId)
      .eq('carts.user_id', user.id)
      .single()

    if (!existingItem) throw new Error('Item não encontrado')

    // Atualizar item
    const { data: updatedItem, error } = await this.supabase
      .from('cart_items')
      .update({
        quantity: request.quantity,
        total_price: existingItem.unit_price * request.quantity,
        metadata: { ...existingItem.metadata, ...request.metadata },
        updated_at: new Date().toISOString(),
      })
      .eq('id', itemId)
      .select()
      .single()

    if (error) throw new Error(`Erro ao atualizar item: ${error.message}`)
    return updatedItem
  }

  /**
   * Remove um item do carrinho
   */
  async removeFromCart(itemId: string): Promise<void> {
    const {
      data: { user },
    } = await this.supabase.auth.getUser()
    if (!user) throw new Error('Usuário não autenticado')

    // Verificar se o item pertence ao usuário
    const { data: existingItem } = await this.supabase
      .from('cart_items')
      .select('*, carts!inner(*)')
      .eq('id', itemId)
      .eq('carts.user_id', user.id)
      .single()

    if (!existingItem) throw new Error('Item não encontrado')

    // Remover item
    const { error } = await this.supabase
      .from('cart_items')
      .delete()
      .eq('id', itemId)

    if (error) throw new Error(`Erro ao remover item: ${error.message}`)
  }

  /**
   * Limpa todo o carrinho
   */
  async clearCart(cartId: string): Promise<void> {
    const {
      data: { user },
    } = await this.supabase.auth.getUser()
    if (!user) throw new Error('Usuário não autenticado')

    // Verificar se o carrinho pertence ao usuário
    const { data: cart } = await this.supabase
      .from('carts')
      .select('*')
      .eq('id', cartId)
      .eq('user_id', user.id)
      .single()

    if (!cart) throw new Error('Carrinho não encontrado')

    // Remover todos os itens
    const { error } = await this.supabase
      .from('cart_items')
      .delete()
      .eq('cart_id', cartId)

    if (error) throw new Error(`Erro ao limpar carrinho: ${error.message}`)
  }

  /**
   * Obtém o carrinho completo com itens
   */
  async getCartWithItems(cartId: string): Promise<CartWithItems> {
    const {
      data: { user },
    } = await this.supabase.auth.getUser()
    if (!user) throw new Error('Usuário não autenticado')

    // Buscar carrinho com itens
    const { data: cart, error: cartError } = await this.supabase
      .from('carts')
      .select('*')
      .eq('id', cartId)
      .eq('user_id', user.id)
      .single()

    if (cartError || !cart) throw new Error('Carrinho não encontrado')

    // Buscar itens do carrinho
    const { data: items, error: itemsError } = await this.supabase
      .from('cart_items')
      .select(
        `
        *,
        products (
          id,
          name,
          description,
          price,
          images
        )
      `
      )
      .eq('cart_id', cartId)

    if (itemsError)
      throw new Error(`Erro ao buscar itens: ${itemsError.message}`)

    return {
      ...cart,
      items: items || [],
    }
  }

  /**
   * Obtém carrinhos com filtros e paginação
   */
  async getCarts(
    filters: CartFilters,
    pagination: PaginationParams
  ): Promise<Cart[]> {
    const {
      data: { user },
    } = await this.supabase.auth.getUser()
    if (!user) throw new Error('Usuário não autenticado')

    let query = this.supabase.from('carts').select('*').eq('user_id', user.id)

    // Aplicar filtros
    if (filters.status) query = query.eq('status', filters.status)
    if (filters.tenant_id) query = query.eq('tenant_id', filters.tenant_id)
    if (filters.created_after)
      query = query.gte('created_at', filters.created_after)
    if (filters.created_before)
      query = query.lte('created_at', filters.created_before)

    // Aplicar paginação
    const offset = (pagination.page - 1) * pagination.limit
    query = query.range(offset, offset + pagination.limit - 1)

    // Aplicar ordenação
    if (pagination.sort_by) {
      query = query.order(pagination.sort_by, {
        ascending: pagination.sort_order === 'asc',
      })
    } else {
      query = query.order('created_at', { ascending: false })
    }

    const { data, error } = await query
    if (error) throw new Error(`Erro ao buscar carrinhos: ${error.message}`)

    return data || []
  }

  /**
   * Obtém estatísticas do carrinho
   */
  async getCartStatistics(tenantId: string): Promise<CartStatistics> {
    const {
      data: { user },
    } = await this.supabase.auth.getUser()
    if (!user) throw new Error('Usuário não autenticado')

    // Buscar estatísticas
    const { data, error } = await this.supabase.rpc('get_cart_statistics', {
      tenant_id: tenantId,
      user_id: user.id,
    })

    if (error) throw new Error(`Erro ao buscar estatísticas: ${error.message}`)

    return (
      data || {
        total_carts: 0,
        active_carts: 0,
        abandoned_carts: 0,
        converted_carts: 0,
        total_value: 0,
        average_cart_value: 0,
      }
    )
  }

  /**
   * Abandona um carrinho (marca como abandonado)
   */
  async abandonCart(cartId: string): Promise<void> {
    const {
      data: { user },
    } = await this.supabase.auth.getUser()
    if (!user) throw new Error('Usuário não autenticado')

    // Verificar se o carrinho pertence ao usuário
    const { data: cart } = await this.supabase
      .from('carts')
      .select('*')
      .eq('id', cartId)
      .eq('user_id', user.id)
      .single()

    if (!cart) throw new Error('Carrinho não encontrado')

    // Marcar como abandonado
    const { error } = await this.supabase
      .from('carts')
      .update({
        status: 'abandoned',
        updated_at: new Date().toISOString(),
      })
      .eq('id', cartId)

    if (error) throw new Error(`Erro ao abandonar carrinho: ${error.message}`)
  }

  /**
   * Converte um carrinho (marca como convertido)
   */
  async convertCart(cartId: string): Promise<void> {
    const {
      data: { user },
    } = await this.supabase.auth.getUser()
    if (!user) throw new Error('Usuário não autenticado')

    // Verificar se o carrinho pertence ao usuário
    const { data: cart } = await this.supabase
      .from('carts')
      .select('*')
      .eq('id', cartId)
      .eq('user_id', user.id)
      .single()

    if (!cart) throw new Error('Carrinho não encontrado')

    // Marcar como convertido
    const { error } = await this.supabase
      .from('carts')
      .update({
        status: 'converted',
        updated_at: new Date().toISOString(),
      })
      .eq('id', cartId)

    if (error) throw new Error(`Erro ao converter carrinho: ${error.message}`)
  }
}

// Instância singleton do serviço
export const cartService = new CartService()
