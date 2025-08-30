import { CubboShipment } from '@/types/resgate'

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
        throw new Error(`Cubbo API error: ${response.status} ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Cubbo API request failed:', error)
      throw error
    }
  }

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

  // Webhook para atualizações de status
  async handleWebhook(webhookData: {
    shipment_id: string
    tracking_code: string
    status: string
    status_details?: string
    location?: string
    timestamp: string
  }): Promise<{ success: boolean }> {
    // Aqui você pode implementar a lógica para processar webhooks
    // Por exemplo, atualizar o status no banco de dados local
    
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


