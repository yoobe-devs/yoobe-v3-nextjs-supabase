import { CubboShipment } from '@/types/resgate'

export interface CubboProduct {
  id: string
  name: string
  sku: string
  description?: string
  price: number
  weight: number
  dimensions: {
    length: number
    width: number
    height: number
  }
  category?: string
  brand?: string
  images?: string[]
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface CubboInventory {
  product_id: string
  warehouse_id: string
  quantity: number
  reserved_quantity: number
  available_quantity: number
  last_updated: string
}

export interface CubboOrder {
  id: string
  order_number: string
  status: string
  customer: {
    name: string
    email: string
    phone?: string
    address: {
      street: string
      city: string
      state: string
      postal_code: string
      country: string
    }
  }
  items: Array<{
    product_id: string
    sku: string
    name: string
    quantity: number
    unit_price: number
  }>
  total_amount: number
  shipping_method?: string
  tracking_code?: string
  created_at: string
  updated_at: string
}

export class CubboService {
  private apiKey: string
  private baseUrl: string

  constructor(apiKey: string, baseUrl: string) {
    this.apiKey = apiKey
    this.baseUrl = baseUrl
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseUrl}${endpoint}`
    const headers = {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
      ...options.headers,
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(`Cubbo API error: ${response.status} ${response.statusText} - ${errorData.message || ''}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Cubbo API request failed:', error)
      throw error
    }
  }

  // ===== GESTÃO DE PRODUTOS =====

  // Criar produto
  async createProduct(productData: {
    name: string
    sku: string
    description?: string
    price: number
    weight: number
    dimensions: {
      length: number
      width: number
      height: number
    }
    category?: string
    brand?: string
    images?: string[]
  }): Promise<CubboProduct> {
    return this.makeRequest('/products', {
      method: 'POST',
      body: JSON.stringify(productData),
    })
  }

  // Buscar produto por ID
  async getProduct(productId: string): Promise<CubboProduct> {
    return this.makeRequest(`/products/${productId}`)
  }

  // Buscar produto por SKU
  async getProductBySku(sku: string): Promise<CubboProduct> {
    return this.makeRequest(`/products/sku/${sku}`)
  }

  // Listar produtos
  async listProducts(params?: {
    page?: number
    limit?: number
    category?: string
    brand?: string
    is_active?: boolean
  }): Promise<{
    products: CubboProduct[]
    total: number
    page: number
    limit: number
  }> {
    const queryParams = new URLSearchParams()
    
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.limit) queryParams.append('limit', params.limit.toString())
    if (params?.category) queryParams.append('category', params.category)
    if (params?.brand) queryParams.append('brand', params.brand)
    if (params?.is_active !== undefined) queryParams.append('is_active', params.is_active.toString())

    const endpoint = `/products${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    return this.makeRequest(endpoint)
  }

  // Atualizar produto
  async updateProduct(productId: string, updates: Partial<CubboProduct>): Promise<CubboProduct> {
    return this.makeRequest(`/products/${productId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    })
  }

  // Deletar produto
  async deleteProduct(productId: string): Promise<{ success: boolean }> {
    return this.makeRequest(`/products/${productId}`, {
      method: 'DELETE',
    })
  }

  // ===== GESTÃO DE ESTOQUE =====

  // Buscar estoque de um produto
  async getInventory(productId: string, warehouseId?: string): Promise<CubboInventory[]> {
    const queryParams = new URLSearchParams()
    if (warehouseId) queryParams.append('warehouse_id', warehouseId)
    
    const endpoint = `/products/${productId}/inventory${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    return this.makeRequest(endpoint)
  }

  // Atualizar estoque
  async updateInventory(productId: string, warehouseId: string, quantity: number): Promise<CubboInventory> {
    return this.makeRequest(`/products/${productId}/inventory`, {
      method: 'PUT',
      body: JSON.stringify({
        warehouse_id: warehouseId,
        quantity: quantity
      }),
    })
  }

  // Sincronizar estoque em lote
  async syncInventoryBatch(updates: Array<{
    product_id: string
    warehouse_id: string
    quantity: number
  }>): Promise<{
    success: number
    failed: number
    errors: Array<{ product_id: string; error: string }>
  }> {
    return this.makeRequest('/inventory/batch', {
      method: 'POST',
      body: JSON.stringify({ updates }),
    })
  }

  // ===== GESTÃO DE PEDIDOS =====

  // Criar pedido
  async createOrder(orderData: {
    order_number: string
    customer: {
      name: string
      email: string
      phone?: string
      address: {
        street: string
        city: string
        state: string
        postal_code: string
        country: string
      }
    }
    items: Array<{
      product_id: string
      quantity: number
      unit_price: number
    }>
    shipping_method?: string
  }): Promise<CubboOrder> {
    return this.makeRequest('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    })
  }

  // Buscar pedido por ID
  async getOrder(orderId: string): Promise<CubboOrder> {
    return this.makeRequest(`/orders/${orderId}`)
  }

  // Buscar pedido por número
  async getOrderByNumber(orderNumber: string): Promise<CubboOrder> {
    return this.makeRequest(`/orders/number/${orderNumber}`)
  }

  // Listar pedidos
  async listOrders(params?: {
    page?: number
    limit?: number
    status?: string
    start_date?: string
    end_date?: string
  }): Promise<{
    orders: CubboOrder[]
    total: number
    page: number
    limit: number
  }> {
    const queryParams = new URLSearchParams()
    
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.limit) queryParams.append('limit', params.limit.toString())
    if (params?.status) queryParams.append('status', params.status)
    if (params?.start_date) queryParams.append('start_date', params.start_date)
    if (params?.end_date) queryParams.append('end_date', params.end_date)

    const endpoint = `/orders${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    return this.makeRequest(endpoint)
  }

  // Atualizar status do pedido
  async updateOrderStatus(orderId: string, status: string, trackingCode?: string): Promise<CubboOrder> {
    return this.makeRequest(`/orders/${orderId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, tracking_code: trackingCode }),
    })
  }

  // ===== ENVIOS E RASTREAMENTO =====

  // Criar envio
  async createShipment(shipmentData: {
    order_id: string
    recipient_name: string
    recipient_email: string
    recipient_phone: string
    street_address: string
    city: string
    state: string
    postal_code: string
    country: string
    items: Array<{
      name: string
      quantity: number
      weight: number
      dimensions: {
        length: number
        width: number
        height: number
      }
    }>
  }): Promise<CubboShipment> {
    return this.makeRequest('/shipments', {
      method: 'POST',
      body: JSON.stringify(shipmentData),
    })
  }

  // Buscar envio por ID
  async getShipment(shipmentId: string): Promise<CubboShipment> {
    return this.makeRequest(`/shipments/${shipmentId}`)
  }

  // Buscar envio por código de rastreamento
  async getShipmentByTrackingCode(trackingCode: string): Promise<CubboShipment> {
    return this.makeRequest(`/shipments/tracking/${trackingCode}`)
  }

  // Atualizar status do envio
  async updateShipmentStatus(shipmentId: string, status: string, details?: string): Promise<CubboShipment> {
    return this.makeRequest(`/shipments/${shipmentId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, details }),
    })
  }

  // Buscar tracking de envio
  async getShipmentTracking(trackingCode: string): Promise<{
    tracking_code: string
    status: string
    estimated_delivery?: string
    actual_delivery?: string
    tracking_url?: string
    events: Array<{
      status: string
      location?: string
      description?: string
      timestamp: string
    }>
  }> {
    return this.makeRequest(`/shipments/tracking/${trackingCode}/events`)
  }

  // Cancelar envio
  async cancelShipment(shipmentId: string, reason?: string): Promise<{ success: boolean }> {
    return this.makeRequest(`/shipments/${shipmentId}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    })
  }

  // Calcular frete
  async calculateShipping(origin: {
    postal_code: string
    city: string
    state: string
  }, destination: {
    postal_code: string
    city: string
    state: string
  }, items: Array<{
    weight: number
    dimensions: {
      length: number
      width: number
      height: number
    }
  }>): Promise<{
    service: string
    price: number
    delivery_time: number
    estimated_delivery: string
  }[]> {
    return this.makeRequest('/shipping/calculate', {
      method: 'POST',
      body: JSON.stringify({ origin, destination, items }),
    })
  }

  // Buscar transportadoras disponíveis
  async getAvailableCarriers(): Promise<{
    id: string
    name: string
    code: string
    is_active: boolean
  }[]> {
    return this.makeRequest('/carriers')
  }

  // Gerar etiqueta de envio
  async generateShippingLabel(shipmentId: string): Promise<{
    label_url: string
    tracking_code: string
  }> {
    return this.makeRequest(`/shipments/${shipmentId}/label`, {
      method: 'POST',
    })
  }

  // ===== WEBHOOKS E NOTIFICAÇÕES =====

  // Webhook para atualizações de status
  async handleWebhook(webhookData: {
    shipment_id: string
    tracking_code: string
    status: string
    status_details?: string
    location?: string
    timestamp: string
  }): Promise<{ success: boolean }> {
    console.log('Cubbo webhook received:', webhookData)
    return { success: true }
  }

  // Buscar histórico de envios
  async getShipmentHistory(shipmentId: string): Promise<{
    timestamp: string
    status: string
    location?: string
    details?: string
  }[]> {
    return this.makeRequest(`/shipments/${shipmentId}/history`)
  }

  // ===== RELATÓRIOS =====

  // Relatório de envios
  async getShipmentReport(params?: {
    start_date?: string
    end_date?: string
    status?: string
    carrier?: string
  }): Promise<{
    total_shipments: number
    delivered: number
    in_transit: number
    failed: number
    average_delivery_time: number
  }> {
    const queryParams = new URLSearchParams()
    
    if (params?.start_date) queryParams.append('start_date', params.start_date)
    if (params?.end_date) queryParams.append('end_date', params.end_date)
    if (params?.status) queryParams.append('status', params.status)
    if (params?.carrier) queryParams.append('carrier', params.carrier)

    const endpoint = `/reports/shipments${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    return this.makeRequest(endpoint)
  }

  // Relatório de estoque
  async getInventoryReport(warehouseId?: string): Promise<{
    total_products: number
    low_stock_products: number
    out_of_stock_products: number
    total_value: number
  }> {
    const queryParams = new URLSearchParams()
    if (warehouseId) queryParams.append('warehouse_id', warehouseId)
    
    const endpoint = `/reports/inventory${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    return this.makeRequest(endpoint)
  }

  // ===== SINCRONIZAÇÃO EM LOTE =====

  // Sincronizar produtos em lote
  async syncProductsBatch(products: Array<{
    name: string
    sku: string
    description?: string
    price: number
    weight: number
    dimensions: {
      length: number
      width: number
      height: number
    }
    category?: string
    brand?: string
    images?: string[]
  }>): Promise<{
    success: number
    failed: number
    errors: Array<{ sku: string; error: string }>
  }> {
    return this.makeRequest('/products/batch', {
      method: 'POST',
      body: JSON.stringify({ products }),
    })
  }

  // Sincronizar pedidos em lote
  async syncOrdersBatch(orders: Array<{
    order_number: string
    customer: {
      name: string
      email: string
      phone?: string
      address: {
        street: string
        city: string
        state: string
        postal_code: string
        country: string
      }
    }
    items: Array<{
      product_id: string
      quantity: number
      unit_price: number
    }>
  }>): Promise<{
    success: number
    failed: number
    errors: Array<{ order_number: string; error: string }>
  }> {
    return this.makeRequest('/orders/batch', {
      method: 'POST',
      body: JSON.stringify({ orders }),
    })
  }
}

// Instância singleton
let cubboService: CubboService | null = null

export function getCubboService(): CubboService {
  if (!cubboService) {
    const apiKey = process.env.CUBBO_API_KEY || ''
    const baseUrl = process.env.CUBBO_BASE_URL || 'https://api.cubbo.com/v1'
    
    if (!apiKey) {
      throw new Error('CUBBO_API_KEY environment variable is required')
    }
    
    cubboService = new CubboService(apiKey, baseUrl)
  }
  
  return cubboService
}


