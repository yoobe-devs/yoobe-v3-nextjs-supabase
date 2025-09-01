'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/auth/auth-provider-simple'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { 
  Settings, 
  RefreshCw, 
  CheckCircle, 
  AlertCircle, 
  Package,
  Truck,
  ShoppingCart,
  Loader2
} from 'lucide-react'
import { toast } from 'sonner'

interface CubboIntegration {
  id: string
  store_id: string
  cubbo_api_key: string
  cubbo_warehouse_id: string
  cubbo_company_id: string
  olist_api_key: string
  olist_company_id: string
  is_active: boolean
  sync_products: boolean
  sync_orders: boolean
  sync_inventory: boolean
  last_sync_at: string
  created_at: string
  updated_at: string
}

interface SyncLog {
  id: string
  product_id: string
  store_id: string
  sync_type: string
  sync_status: string
  cubbo_product_id: string
  sync_data: any
  error_message: string
  last_sync_attempt: string
  created_at: string
}

interface InventorySync {
  id: string
  product_id: string
  store_id: string
  cubbo_quantity: number
  olist_quantity: number
  local_quantity: number
  last_sync_at: string
  sync_status: string
}

export default function IntegracaoCubboPage() {
  const { user } = useAuth()
  const [integration, setIntegration] = useState<CubboIntegration | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [syncLogs, setSyncLogs] = useState<SyncLog[]>([])
  const [inventoryStatus, setInventoryStatus] = useState<InventorySync[]>([])
  
  const [formData, setFormData] = useState({
    cubbo_api_key: '',
    cubbo_warehouse_id: '',
    cubbo_company_id: '',
    olist_api_key: '',
    olist_company_id: '',
    sync_products: true,
    sync_orders: true,
    sync_inventory: true
  })

  useEffect(() => {
    loadIntegrationData()
  }, [])

  const loadIntegrationData = async () => {
    try {
      const response = await fetch('/api/cubbo/integration')
      if (response.ok) {
        const data = await response.json()
        setIntegration(data.integration)
        
        if (data.integration) {
          setFormData({
            cubbo_api_key: data.integration.cubbo_api_key || '',
            cubbo_warehouse_id: data.integration.cubbo_warehouse_id || '',
            cubbo_company_id: data.integration.cubbo_company_id || '',
            olist_api_key: data.integration.olist_api_key || '',
            olist_company_id: data.integration.olist_company_id || '',
            sync_products: data.integration.sync_products,
            sync_orders: data.integration.sync_orders,
            sync_inventory: data.integration.sync_inventory
          })
        }
      }

      // Carregar status da sincronização
      const syncResponse = await fetch('/api/cubbo/sync')
      if (syncResponse.ok) {
        const syncData = await syncResponse.json()
        setSyncLogs(syncData.sync_logs || [])
        setInventoryStatus(syncData.inventory_status || [])
      }
    } catch (error) {
      console.error('Erro ao carregar dados da integração:', error)
      toast.error('Erro ao carregar dados da integração')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveIntegration = async () => {
    setSaving(true)
    try {
      const response = await fetch('/api/cubbo/integration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        const data = await response.json()
        setIntegration(data.integration)
        toast.success('Integração configurada com sucesso!')
        await loadIntegrationData()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Erro ao configurar integração')
      }
    } catch (error) {
      console.error('Erro ao salvar integração:', error)
      toast.error('Erro ao salvar integração')
    } finally {
      setSaving(false)
    }
  }

  const handleSync = async (syncType: string) => {
    setSyncing(true)
    try {
      const response = await fetch('/api/cubbo/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sync_type: syncType })
      })

      if (response.ok) {
        const data = await response.json()
        toast.success(data.message)
        await loadIntegrationData()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Erro na sincronização')
      }
    } catch (error) {
      console.error('Erro na sincronização:', error)
      toast.error('Erro na sincronização')
    } finally {
      setSyncing(false)
    }
  }

  const handleDisableIntegration = async () => {
    try {
      const response = await fetch('/api/cubbo/integration', {
        method: 'DELETE'
      })

      if (response.ok) {
        setIntegration(null)
        toast.success('Integração desativada com sucesso!')
        await loadIntegrationData()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Erro ao desativar integração')
      }
    } catch (error) {
      console.error('Erro ao desativar integração:', error)
      toast.error('Erro ao desativar integração')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Carregando configurações...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Integração Cubbo</h1>
            <p className="text-gray-600 mt-2">
              Configure a integração com a plataforma Cubbo para gestão de estoque e fulfillment
            </p>
          </div>
          <Badge variant={integration?.is_active ? 'default' : 'secondary'}>
            {integration?.is_active ? 'Ativa' : 'Inativa'}
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Configuração da Integração */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Configuração da Integração
                </CardTitle>
                <CardDescription>
                  Configure as credenciais e opções de sincronização com a Cubbo
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Cubbo Configuration */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Configuração Cubbo</h3>
                  
                  <div>
                    <Label htmlFor="cubbo_api_key">API Key do Cubbo *</Label>
                    <Input
                      id="cubbo_api_key"
                      type="password"
                      value={formData.cubbo_api_key}
                      onChange={(e) => setFormData({ ...formData, cubbo_api_key: e.target.value })}
                      placeholder="Sua API Key do Cubbo"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="cubbo_warehouse_id">ID do Warehouse</Label>
                      <Input
                        id="cubbo_warehouse_id"
                        value={formData.cubbo_warehouse_id}
                        onChange={(e) => setFormData({ ...formData, cubbo_warehouse_id: e.target.value })}
                        placeholder="ID do warehouse no Cubbo"
                      />
                    </div>
                    <div>
                      <Label htmlFor="cubbo_company_id">ID da Empresa</Label>
                      <Input
                        id="cubbo_company_id"
                        value={formData.cubbo_company_id}
                        onChange={(e) => setFormData({ ...formData, cubbo_company_id: e.target.value })}
                        placeholder="ID da empresa no Cubbo"
                      />
                    </div>
                  </div>
                </div>

                {/* Olist Configuration */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Configuração Olist (Opcional)</h3>
                  
                  <div>
                    <Label htmlFor="olist_api_key">API Key do Olist</Label>
                    <Input
                      id="olist_api_key"
                      type="password"
                      value={formData.olist_api_key}
                      onChange={(e) => setFormData({ ...formData, olist_api_key: e.target.value })}
                      placeholder="Sua API Key do Olist"
                    />
                  </div>

                  <div>
                    <Label htmlFor="olist_company_id">ID da Empresa Olist</Label>
                    <Input
                      id="olist_company_id"
                      value={formData.olist_company_id}
                      onChange={(e) => setFormData({ ...formData, olist_company_id: e.target.value })}
                      placeholder="ID da empresa no Olist"
                    />
                  </div>
                </div>

                {/* Sync Options */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Opções de Sincronização</h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4" />
                        <span>Sincronizar Produtos</span>
                      </div>
                      <Switch
                        checked={formData.sync_products}
                        onCheckedChange={(checked) => setFormData({ ...formData, sync_products: checked })}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <ShoppingCart className="h-4 w-4" />
                        <span>Sincronizar Pedidos</span>
                      </div>
                      <Switch
                        checked={formData.sync_orders}
                        onCheckedChange={(checked) => setFormData({ ...formData, sync_orders: checked })}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Truck className="h-4 w-4" />
                        <span>Sincronizar Estoque</span>
                      </div>
                      <Switch
                        checked={formData.sync_inventory}
                        onCheckedChange={(checked) => setFormData({ ...formData, sync_inventory: checked })}
                      />
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <Button 
                    onClick={handleSaveIntegration}
                    disabled={saving || !formData.cubbo_api_key}
                    className="flex-1"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Salvando...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Salvar Configuração
                      </>
                    )}
                  </Button>
                  
                  {integration?.is_active && (
                    <Button 
                      variant="outline"
                      onClick={handleDisableIntegration}
                      disabled={saving}
                    >
                      Desativar Integração
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Status e Controles */}
          <div className="space-y-6">
            {/* Status da Integração */}
            <Card>
              <CardHeader>
                <CardTitle>Status da Integração</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Status:</span>
                  <Badge variant={integration?.is_active ? 'default' : 'secondary'}>
                    {integration?.is_active ? 'Ativa' : 'Inativa'}
                  </Badge>
                </div>
                
                {integration?.last_sync_at && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Última sincronização:</span>
                    <span className="text-sm">
                      {new Date(integration.last_sync_at).toLocaleString('pt-BR')}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Ambiente:</span>
                  <Badge variant="outline">
                    {process.env.NODE_ENV === 'development' ? 'Desenvolvimento' : 'Produção'}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Controles de Sincronização */}
            {integration?.is_active && (
              <Card>
                <CardHeader>
                  <CardTitle>Sincronização Manual</CardTitle>
                  <CardDescription>
                    Execute sincronizações manuais quando necessário
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    onClick={() => handleSync('products')}
                    disabled={syncing}
                    variant="outline"
                    className="w-full justify-start"
                  >
                    <Package className="h-4 w-4 mr-2" />
                    Sincronizar Produtos
                  </Button>
                  
                  <Button 
                    onClick={() => handleSync('inventory')}
                    disabled={syncing}
                    variant="outline"
                    className="w-full justify-start"
                  >
                    <Truck className="h-4 w-4 mr-2" />
                    Sincronizar Estoque
                  </Button>
                  
                  <Button 
                    onClick={() => handleSync('orders')}
                    disabled={syncing}
                    variant="outline"
                    className="w-full justify-start"
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Sincronizar Pedidos
                  </Button>
                  
                  {syncing && (
                    <div className="flex items-center justify-center text-sm text-gray-600">
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Sincronizando...
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Estatísticas */}
            <Card>
              <CardHeader>
                <CardTitle>Estatísticas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Produtos sincronizados:</span>
                  <span className="font-semibold">{inventoryStatus.length}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Logs de sincronização:</span>
                  <span className="font-semibold">{syncLogs.length}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Última sincronização:</span>
                  <span className="text-sm">
                    {syncLogs[0]?.last_sync_attempt 
                      ? new Date(syncLogs[0].last_sync_attempt).toLocaleString('pt-BR')
                      : 'Nunca'
                    }
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Logs de Sincronização */}
        {syncLogs.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Logs de Sincronização Recentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {syncLogs.slice(0, 5).map((log) => (
                  <div key={log.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Badge variant={log.sync_status === 'success' ? 'default' : 'destructive'}>
                        {log.sync_status}
                      </Badge>
                      <span className="text-sm font-medium">{log.sync_type}</span>
                    </div>
                    <span className="text-sm text-gray-600">
                      {new Date(log.last_sync_attempt).toLocaleString('pt-BR')}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
