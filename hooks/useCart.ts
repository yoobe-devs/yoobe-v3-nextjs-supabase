// =====================================================
// HOOK: USO DO CARRINHO
// YOOBE v3.0.0 - Cart Hook
// =====================================================

import { useState, useEffect, useCallback } from 'react'
import { cartService } from '@/lib/services/cart-service'
import { auditService } from '@/lib/services/audit-service'
import {
  Cart,
  CartWithItems,
  CartItem,
  AddToCartRequest,
  UpdateCartItemRequest,
  CartFilters,
  PaginationParams,
} from '@/types/cart'

interface UseCartOptions {
  tenantId: string
  autoRefresh?: boolean
  refreshInterval?: number
}

interface UseCartReturn {
  // Estado do carrinho
  cart: CartWithItems | null
  isLoading: boolean
  error: string | null

  // Funções do carrinho
  addToCart: (request: AddToCartRequest) => Promise<void>
  updateCartItem: (
    itemId: string,
    request: UpdateCartItemRequest
  ) => Promise<void>
  removeFromCart: (itemId: string) => Promise<void>
  clearCart: () => Promise<void>
  refreshCart: () => Promise<void>

  // Funções de busca
  getCarts: (
    filters: CartFilters,
    pagination: PaginationParams
  ) => Promise<Cart[]>

  // Estado de operações
  isAdding: boolean
  isUpdating: boolean
  isRemoving: boolean
}

export function useCart(options: UseCartOptions): UseCartReturn {
  const { tenantId, autoRefresh = true, refreshInterval = 30000 } = options

  // Estados
  const [cart, setCart] = useState<CartWithItems | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isRemoving, setIsRemoving] = useState(false)

  // =====================================================
  // FUNÇÕES PRINCIPAIS
  // =====================================================

  /**
   * Busca ou cria carrinho ativo
   */
  const getOrCreateCart = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const activeCart = await cartService.getOrCreateCart(tenantId)
      const cartWithItems = await cartService.getCartWithItems(activeCart.id)

      setCart(cartWithItems)
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Erro ao buscar carrinho'
      setError(errorMessage)
      console.error('Erro ao buscar/criar carrinho:', err)
    } finally {
      setIsLoading(false)
    }
  }, [tenantId])

  /**
   * Adiciona produto ao carrinho
   */
  const addToCart = useCallback(
    async (request: AddToCartRequest) => {
      try {
        setIsAdding(true)
        setError(null)

        const cartItem = await cartService.addToCart(request, tenantId)
        const updatedCart = await cartService.getCartWithItems(cartItem.cart_id)

        setCart(updatedCart)

        // Registrar auditoria
        try {
          await auditService.logCreate(
            tenantId,
            'cart_items',
            cartItem.id,
            request,
            { operation: 'add_to_cart' }
          )
        } catch (auditError) {
          console.error('Erro ao registrar auditoria:', auditError)
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Erro ao adicionar ao carrinho'
        setError(errorMessage)
        console.error('Erro ao adicionar ao carrinho:', err)
        throw err
      } finally {
        setIsAdding(false)
      }
    },
    [tenantId]
  )

  /**
   * Atualiza item do carrinho
   */
  const updateCartItem = useCallback(
    async (itemId: string, request: UpdateCartItemRequest) => {
      try {
        setIsUpdating(true)
        setError(null)

        await cartService.updateCartItem(itemId, request)

        // Atualizar carrinho local
        if (cart) {
          const updatedCart = await cartService.getCartWithItems(cart.id)
          setCart(updatedCart)
        }

        // Registrar auditoria
        try {
          await auditService.logUpdate(
            tenantId,
            'cart_items',
            itemId,
            { quantity: request.quantity },
            { operation: 'update_cart_item' }
          )
        } catch (auditError) {
          console.error('Erro ao registrar auditoria:', auditError)
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Erro ao atualizar item'
        setError(errorMessage)
        console.error('Erro ao atualizar item:', err)
        throw err
      } finally {
        setIsUpdating(false)
      }
    },
    [tenantId, cart]
  )

  /**
   * Remove item do carrinho
   */
  const removeFromCart = useCallback(
    async (itemId: string) => {
      try {
        setIsRemoving(true)
        setError(null)

        // Obter item antes de remover para auditoria
        let oldItem: CartItem | null = null
        if (cart) {
          oldItem = cart.items.find(item => item.id === itemId) || null
        }

        await cartService.removeFromCart(itemId)

        // Atualizar carrinho local
        if (cart) {
          const updatedCart = await cartService.getCartWithItems(cart.id)
          setCart(updatedCart)
        }

        // Registrar auditoria
        if (oldItem) {
          try {
            await auditService.logDelete(
              tenantId,
              'cart_items',
              itemId,
              oldItem,
              { operation: 'remove_from_cart' }
            )
          } catch (auditError) {
            console.error('Erro ao registrar auditoria:', auditError)
          }
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Erro ao remover item'
        setError(errorMessage)
        console.error('Erro ao remover item:', err)
        throw err
      } finally {
        setIsRemoving(false)
      }
    },
    [tenantId, cart]
  )

  /**
   * Limpa todos os itens do carrinho
   */
  const clearCart = useCallback(async () => {
    try {
      setIsUpdating(true)
      setError(null)

      if (!cart) return

      await cartService.clearCart(cart.id)

      // Atualizar carrinho local
      const updatedCart = await cartService.getCartWithItems(cart.id)
      setCart(updatedCart)

      // Registrar auditoria
      try {
        await auditService.logSystemOperation(
          tenantId,
          'CLEAR_CART',
          { cart_id: cart.id, item_count: cart.items.length },
          { operation: 'clear_cart' }
        )
      } catch (auditError) {
        console.error('Erro ao registrar auditoria:', auditError)
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Erro ao limpar carrinho'
      setError(errorMessage)
      console.error('Erro ao limpar carrinho:', err)
      throw err
    } finally {
      setIsUpdating(false)
    }
  }, [tenantId, cart])

  /**
   * Atualiza carrinho
   */
  const refreshCart = useCallback(async () => {
    if (cart) {
      await getOrCreateCart()
    }
  }, [cart, getOrCreateCart])

  /**
   * Busca carrinhos com filtros
   */
  const getCarts = useCallback(
    async (filters: CartFilters, pagination: PaginationParams) => {
      try {
        setError(null)
        return await cartService.getCarts(filters, pagination)
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Erro ao buscar carrinhos'
        setError(errorMessage)
        console.error('Erro ao buscar carrinhos:', err)
        throw err
      }
    },
    []
  )

  // =====================================================
  // EFEITOS
  // =====================================================

  // Carregar carrinho inicial
  useEffect(() => {
    getOrCreateCart()
  }, [getOrCreateCart])

  // Auto-refresh do carrinho
  useEffect(() => {
    if (!autoRefresh || !cart) return

    const interval = setInterval(() => {
      refreshCart()
    }, refreshInterval)

    return () => clearInterval(interval)
  }, [autoRefresh, cart, refreshCart, refreshInterval])

  // =====================================================
  // RETORNO
  // =====================================================

  return {
    // Estado
    cart,
    isLoading,
    error,

    // Funções
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    refreshCart,
    getCarts,

    // Estados de operação
    isAdding,
    isUpdating,
    isRemoving,
  }
}
