// =====================================================
// FUNÇÕES UTILITÁRIAS DE CARRINHO E CHECKOUT
// YOOBE v3.0.0 - Cart Utilities
// =====================================================

import { cartService } from '@/lib/services/cart-service'
import { checkoutService } from '@/lib/services/checkout-service'
import { auditService } from '@/lib/services/audit-service'
import {
  Cart,
  CartWithItems,
  CheckoutSession,
  CheckoutSessionWithDetails,
  AddToCartRequest,
  StartCheckoutRequest,
  CartConfig,
  CheckoutConfig,
} from '@/types/cart'

// =====================================================
// FUNÇÕES PRINCIPAIS
// =====================================================

/**
 * Obtém ou cria um carrinho ativo para o usuário
 */
export async function getOrCreateCart(tenantId: string): Promise<Cart> {
  try {
    return await cartService.getOrCreateCart(tenantId)
  } catch (error) {
    console.error('Erro ao obter/criar carrinho:', error)
    throw error
  }
}

/**
 * Adiciona um produto ao carrinho
 */
export async function addToCart(
  request: AddToCartRequest,
  tenantId: string
): Promise<CartWithItems> {
  try {
    // Adicionar ao carrinho
    const cartItem = await cartService.addToCart(request, tenantId)

    // Buscar carrinho completo com itens
    const cart = await cartService.getCartWithItems(cartItem.cart_id)

    return cart
  } catch (error) {
    console.error('Erro ao adicionar ao carrinho:', error)
    throw error
  }
}

/**
 * Limpa todos os itens de um carrinho
 */
export async function clearCart(cartId: string): Promise<void> {
  try {
    await cartService.clearCart(cartId)
  } catch (error) {
    console.error('Erro ao limpar carrinho:', error)
    throw error
  }
}

/**
 * Cria uma sessão de checkout a partir de um carrinho
 */
export async function createCheckoutFromCart(
  cartId: string,
  request: StartCheckoutRequest
): Promise<CheckoutSessionWithDetails> {
  try {
    // Criar sessão de checkout
    const checkoutSession = await checkoutService.createCheckoutFromCart(
      cartId,
      request
    )

    // Buscar sessão completa com detalhes
    const sessionWithDetails = await checkoutService.getCheckoutSession(
      checkoutSession.id
    )

    return sessionWithDetails
  } catch (error) {
    console.error('Erro ao criar checkout:', error)
    throw error
  }
}

// =====================================================
// FUNÇÕES DE VALIDAÇÃO
// =====================================================

/**
 * Valida se um carrinho pode ser convertido em checkout
 */
export function validateCartForCheckout(cart: CartWithItems): {
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []

  // Verificar se o carrinho tem itens
  if (!cart.items || cart.items.length === 0) {
    errors.push('Carrinho vazio')
  }

  // Verificar se o carrinho está ativo
  if (cart.status !== 'active') {
    errors.push('Carrinho não está ativo')
  }

  // Verificar se o carrinho não expirou
  if (new Date(cart.expires_at) < new Date()) {
    errors.push('Carrinho expirado')
  }

  // Verificar valor mínimo (se configurado)
  const config = getCartConfig()
  if (config.min_value && cart.total_amount < config.min_value) {
    errors.push(`Valor mínimo não atingido: R$ ${config.min_value.toFixed(2)}`)
  }

  // Verificar limite de itens (se configurado)
  if (config.max_items && cart.total_items > config.max_items) {
    errors.push(`Limite de itens excedido: ${config.max_items}`)
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

/**
 * Valida endereço de envio
 */
export function validateShippingAddress(address: any): {
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []

  if (!address.street || address.street.trim().length === 0) {
    errors.push('Rua é obrigatória')
  }

  if (!address.number || address.number.trim().length === 0) {
    errors.push('Número é obrigatório')
  }

  if (!address.neighborhood || address.neighborhood.trim().length === 0) {
    errors.push('Bairro é obrigatório')
  }

  if (!address.city || address.city.trim().length === 0) {
    errors.push('Cidade é obrigatória')
  }

  if (!address.state || address.state.trim().length === 0) {
    errors.push('Estado é obrigatório')
  }

  if (!address.zip_code || address.zip_code.trim().length === 0) {
    errors.push('CEP é obrigatório')
  }

  if (!address.country || address.country.trim().length === 0) {
    address.country = 'Brasil' // Default para Brasil
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

// =====================================================
// FUNÇÕES DE CONFIGURAÇÃO
// =====================================================

/**
 * Obtém configuração do carrinho
 */
export function getCartConfig(): CartConfig {
  // Em produção, isso viria de uma tabela de configuração ou variáveis de ambiente
  return {
    max_items: 50,
    max_value: 10000.0,
    expiration_days: 7,
    allow_anonymous: false,
    min_value: 10.0, // Valor mínimo para checkout
  }
}

/**
 * Obtém configuração do checkout
 */
export function getCheckoutConfig(): CheckoutConfig {
  // Em produção, isso viria de uma tabela de configuração ou variáveis de ambiente
  return {
    session_timeout_minutes: 30,
    require_shipping_address: true,
    require_billing_address: false,
    supported_payment_methods: ['pix', 'credit_card', 'boleto'],
    supported_currencies: ['BRL'],
  }
}

// =====================================================
// FUNÇÕES DE CÁLCULO
// =====================================================

/**
 * Calcula total do carrinho
 */
export function calculateCartTotal(items: any[]): {
  subtotal: number
  tax: number
  shipping: number
  total: number
} {
  const subtotal = items.reduce((sum, item) => sum + item.total_price, 0)
  const tax = subtotal * 0.1 // 10% de imposto (exemplo)
  const shipping = subtotal > 100 ? 0 : 15.9 // Frete grátis acima de R$ 100
  const total = subtotal + tax + shipping

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    tax: Math.round(tax * 100) / 100,
    shipping: Math.round(shipping * 100) / 100,
    total: Math.round(total * 100) / 100,
  }
}

/**
 * Calcula desconto baseado em cupom
 */
export function calculateDiscount(
  subtotal: number,
  discountType: 'percentage' | 'fixed',
  discountValue: number
): number {
  if (discountType === 'percentage') {
    return Math.min(subtotal * (discountValue / 100), subtotal * 0.5) // Máximo 50%
  } else {
    return Math.min(discountValue, subtotal * 0.5) // Máximo 50% do subtotal
  }
}

// =====================================================
// FUNÇÕES DE FORMATO
// =====================================================

/**
 * Formata valor monetário
 */
export function formatCurrency(
  value: number,
  currency: string = 'BRL'
): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency,
  }).format(value)
}

/**
 * Formata data para exibição
 */
export function formatDate(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(dateObj)
}

/**
 * Formata status do carrinho
 */
export function formatCartStatus(status: string): string {
  const statusMap: Record<string, string> = {
    active: 'Ativo',
    abandoned: 'Abandonado',
    converted: 'Convertido',
    expired: 'Expirado',
  }
  return statusMap[status] || status
}

/**
 * Formata status do checkout
 */
export function formatCheckoutStatus(status: string): string {
  const statusMap: Record<string, string> = {
    pending: 'Pendente',
    processing: 'Processando',
    completed: 'Concluído',
    failed: 'Falhou',
    cancelled: 'Cancelado',
  }
  return statusMap[status] || status
}

// =====================================================
// FUNÇÕES DE ESTATÍSTICAS
// =====================================================

/**
 * Calcula estatísticas básicas do carrinho
 */
export function calculateCartStats(carts: Cart[]): {
  totalCarts: number
  activeCarts: number
  totalValue: number
  averageValue: number
} {
  const totalCarts = carts.length
  const activeCarts = carts.filter(cart => cart.status === 'active').length
  const totalValue = carts.reduce((sum, cart) => sum + cart.total_amount, 0)
  const averageValue = totalCarts > 0 ? totalValue / totalCarts : 0

  return {
    totalCarts,
    activeCarts,
    totalValue: Math.round(totalValue * 100) / 100,
    averageValue: Math.round(averageValue * 100) / 100,
  }
}

/**
 * Calcula taxa de conversão
 */
export function calculateConversionRate(
  totalCarts: number,
  convertedCarts: number
): number {
  if (totalCarts === 0) return 0
  return Math.round((convertedCarts / totalCarts) * 10000) / 100 // 2 casas decimais
}
