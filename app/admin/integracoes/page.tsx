'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/auth/auth-provider-simple'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Settings, 
  RefreshCw, 
  CheckCircle, 
  AlertCircle, 
  Package,
  Truck,
  ShoppingCart,
  Loader2,
  Database,
  Zap,
  Users,
  Star,
  Globe
} from 'lucide-react'
import { toast } from 'sonner'

interface CubboIntegration {
  id: string
  cubbo_api_key: string
  cubbo_warehouse_id: string
  cubbo_company_id: string
  is_active: boolean
  sync_products: boolean
  sync_orders: boolean
  sync_inventory: boolean
  last_sync_at: string
  created_at: string
  updated_at: string
}

interface GlobalIntegration {
  id: string
  name: string
  type: 'fulfillment' | 'gamification' | 'automation' | 'erp'
  provider: string
  is_active: boolean
  config: any
  created_at: string
  updated_at: string
}

export default function AdminIntegracoesPage() {
  const { user } = useAuth()
  const [cubboIntegration, setCubboIntegration] = useState<CubboIntegration | null>(null)
  const [globalIntegrations, setGlobalIntegrations] = useState<GlobalIntegration[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [syncing, setSyncing] = useState(false)
  
  const [cubboForm, setCubboForm] = useState({
    cubbo_api_key: '',
    cubbo_warehouse_id: '',
    cubbo_company_id: '',
    sync_products: true,
    sync_orders: true,
    sync_inventory: true
  })

  useEffect(() => {
    loadIntegrations()
  }, [])

  const loadIntegrations = async () => {
    try {
      // Carregar integração Cubbo global
      const cubboResponse = await fetch('/api/admin/cubbo-integration')
      if (cubboResponse.ok) {
        const data = await cubboResponse.json()
        setCubboIntegration(data.integration)
        
        if (data.integration) {
          setCubboForm({
            cubbo_api_key: data.integration.cubbo_api_key || '',
            cubbo_warehouse_id: data.integration.cubbo_warehouse_id || '',
            cubbo_company_id: data.integration.cubbo_company_id || '',
            sync_products: data.integration.sync_products,
            sync_orders: data.integration.sync_orders,
            sync_inventory: data.integration.sync_inventory
          })
        }
      }

      // Carregar integrações globais
      const globalResponse = await fetch('/api/admin/integrations')
      if (globalResponse.ok) {
        const data = await globalResponse.json()
        setGlobalIntegrations(data.integrations || [])
      }
    } catch (error) {
      console.error('Erro ao carregar integrações:', error)
      toast.error('Erro ao carregar integrações')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveCubboIntegration = async () => {
    setSaving(true)
    try {
      const response = await fetch('/api/admin/cubbo-integration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cubboForm)
      })

      if (response.ok) {
        const data = await response.json()
        setCubboIntegration(data.integration)
        toast.success('Integração Cubbo configurada com sucesso!')
        await loadIntegrations()
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

  const handleSyncCubbo = async (syncType: string) => {
    setSyncing(true)
    try {
      const response = await fetch('/api/admin/cubbo-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sync_type: syncType })
      })

      if (response.ok) {
        const data = await response.json()
        toast.success(data.message)
        await loadIntegrations()
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

  const handleToggleIntegration = async (integrationId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/admin/integrations/${integrationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: isActive })
      })

      if (response.ok) {
        toast.success(`Integração ${isActive ? 'ativada' : 'desativada'} com sucesso!`)
        await loadIntegrations()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Erro ao atualizar integração')
      }
    } catch (error) {
      console.error('Erro ao atualizar integração:', error)
      toast.error('Erro ao atualizar integração')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Carregando integrações...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Integrações Globais</h1>
            <p className="text-gray-600 mt-2">
              Configure integrações globais para todas as lojas da plataforma Yoobe
            </p>
          </div>
          <Badge variant="outline" className="text-sm">
            Admin Global
          </Badge>
        </div>

        <Tabs defaultValue="cubbo" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="cubbo" className="flex items-center gap-2">
              <Truck className="h-4 w-4" />
              Cubbo (Fulfillment)
            </TabsTrigger>
            <TabsTrigger value="gamification" className="flex items-center gap-2">
              <Star className="h-4 w-4" />
              Gamificação
            </TabsTrigger>
            <TabsTrigger value="automation" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Automação
            </TabsTrigger>
          </TabsList>

          {/* Cubbo Integration */}
          <TabsContent value="cubbo" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Integração Cubbo - Fulfillment Global
                </CardTitle>
                <CardDescription>
                  Configure a integração com Cubbo como fulfillment padrão para todas as lojas
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Configuração */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Configuração Cubbo</h3>
                    
                    <div>
                      <Label htmlFor="cubbo_api_key">API Key do Cubbo *</Label>
                      <Input
                        id="cubbo_api_key"
                        type="password"
                        value={cubboForm.cubbo_api_key}
                        onChange={(e) => setCubboForm({ ...cubboForm, cubbo_api_key: e.target.value })}
                        placeholder="Sua API Key do Cubbo"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="cubbo_warehouse_id">ID do Warehouse</Label>
                        <Input
                          id="cubbo_warehouse_id"
                          value={cubboForm.cubbo_warehouse_id}
                          onChange={(e) => setCubboForm({ ...cubboForm, cubbo_warehouse_id: e.target.value })}
                          placeholder="ID do warehouse no Cubbo"
                        />
                      </div>
                      <div>
                        <Label htmlFor="cubbo_company_id">ID da Empresa</Label>
                        <Input
                          id="cubbo_company_id"
                          value={cubboForm.cubbo_company_id}
                          onChange={(e) => setCubboForm({ ...cubboForm, cubbo_company_id: e.target.value })}
                          placeholder="ID da empresa no Cubbo"
                        />
                      </div>
                    </div>

                    {/* Sync Options */}
                    <div className="space-y-3">
                      <h4 className="font-medium">Opções de Sincronização</h4>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4" />
                          <span>Sincronizar Produtos</span>
                        </div>
                        <Switch
                          checked={cubboForm.sync_products}
                          onCheckedChange={(checked) => setCubboForm({ ...cubboForm, sync_products: checked })}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <ShoppingCart className="h-4 w-4" />
                          <span>Sincronizar Pedidos</span>
                        </div>
                        <Switch
                          checked={cubboForm.sync_orders}
                          onCheckedChange={(checked) => setCubboForm({ ...cubboForm, sync_orders: checked })}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Truck className="h-4 w-4" />
                          <span>Sincronizar Estoque</span>
                        </div>
                        <Switch
                          checked={cubboForm.sync_inventory}
                          onCheckedChange={(checked) => setCubboForm({ ...cubboForm, sync_inventory: checked })}
                        />
                      </div>
                    </div>

                    <Button 
                      onClick={handleSaveCubboIntegration}
                      disabled={saving || !cubboForm.cubbo_api_key}
                      className="w-full"
                    >
                      {saving ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Salvando...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Salvar Configuração Cubbo
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Status e Controles */}
                  <div className="space-y-6">
                    {/* Status */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Status da Integração</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Status:</span>
                          <Badge variant={cubboIntegration?.is_active ? 'default' : 'secondary'}>
                            {cubboIntegration?.is_active ? 'Ativa' : 'Inativa'}
                          </Badge>
                        </div>
                        
                        {cubboIntegration?.last_sync_at && (
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Última sincronização:</span>
                            <span className="text-sm">
                              {new Date(cubboIntegration.last_sync_at).toLocaleString('pt-BR')}
                            </span>
                          </div>
                        )}

                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Escopo:</span>
                          <Badge variant="outline">
                            <Globe className="h-3 w-3 mr-1" />
                            Global
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Controles */}
                    {cubboIntegration?.is_active && (
                      <Card>
                        <CardHeader>
                          <CardTitle>Sincronização Manual</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <Button 
                            onClick={() => handleSyncCubbo('products')}
                            disabled={syncing}
                            variant="outline"
                            className="w-full justify-start"
                          >
                            <Package className="h-4 w-4 mr-2" />
                            Sincronizar Todos os Produtos
                          </Button>
                          
                          <Button 
                            onClick={() => handleSyncCubbo('inventory')}
                            disabled={syncing}
                            variant="outline"
                            className="w-full justify-start"
                          >
                            <Truck className="h-4 w-4 mr-2" />
                            Sincronizar Todo o Estoque
                          </Button>
                          
                          <Button 
                            onClick={() => handleSyncCubbo('orders')}
                            disabled={syncing}
                            variant="outline"
                            className="w-full justify-start"
                          >
                            <ShoppingCart className="h-4 w-4 mr-2" />
                            Sincronizar Todos os Pedidos
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
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Gamification Integrations */}
          <TabsContent value="gamification" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  Integrações de Gamificação
                </CardTitle>
                <CardDescription>
                  Configure integrações com plataformas de gamificação para permitir uso de pontos externos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Workvivo */}
                  <Card className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Star className="h-5 w-5 text-blue-600" />
                        <h3 className="font-semibold">Workvivo</h3>
                      </div>
                      <Switch 
                        checked={globalIntegrations.find(i => i.provider === 'workvivo')?.is_active || false}
                        onCheckedChange={(checked) => {
                          const integration = globalIntegrations.find(i => i.provider === 'workvivo')
                          if (integration) {
                            handleToggleIntegration(integration.id, checked)
                          }
                        }}
                      />
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      Integração com Workvivo para uso de pontos de reconhecimento
                    </p>
                    <Button variant="outline" size="sm" className="w-full">
                      Configurar
                    </Button>
                  </Card>

                  {/* Applause */}
                  <Card className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Star className="h-5 w-5 text-green-600" />
                        <h3 className="font-semibold">Applause</h3>
                      </div>
                      <Switch 
                        checked={globalIntegrations.find(i => i.provider === 'applause')?.is_active || false}
                        onCheckedChange={(checked) => {
                          const integration = globalIntegrations.find(i => i.provider === 'applause')
                          if (integration) {
                            handleToggleIntegration(integration.id, checked)
                          }
                        }}
                      />
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      Integração com Applause para gamificação de feedback
                    </p>
                    <Button variant="outline" size="sm" className="w-full">
                      Configurar
                    </Button>
                  </Card>

                  {/* Human */}
                  <Card className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Star className="h-5 w-5 text-purple-600" />
                        <h3 className="font-semibold">Human</h3>
                      </div>
                      <Switch 
                        checked={globalIntegrations.find(i => i.provider === 'human')?.is_active || false}
                        onCheckedChange={(checked) => {
                          const integration = globalIntegrations.find(i => i.provider === 'human')
                          if (integration) {
                            handleToggleIntegration(integration.id, checked)
                          }
                        }}
                      />
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      Integração com Human para pontos de bem-estar
                    </p>
                    <Button variant="outline" size="sm" className="w-full">
                      Configurar
                    </Button>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Automation Integrations */}
          <TabsContent value="automation" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Integrações de Automação
                </CardTitle>
                <CardDescription>
                  Configure integrações com plataformas de automação para gestores
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Zapier */}
                  <Card className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Zap className="h-5 w-5 text-orange-600" />
                        <h3 className="font-semibold">Zapier</h3>
                      </div>
                      <Switch 
                        checked={globalIntegrations.find(i => i.provider === 'zapier')?.is_active || false}
                        onCheckedChange={(checked) => {
                          const integration = globalIntegrations.find(i => i.provider === 'zapier')
                          if (integration) {
                            handleToggleIntegration(integration.id, checked)
                          }
                        }}
                      />
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      Automação com Zapier para workflows personalizados
                    </p>
                    <Button variant="outline" size="sm" className="w-full">
                      Configurar
                    </Button>
                  </Card>

                  {/* Floui */}
                  <Card className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Zap className="h-5 w-5 text-blue-600" />
                        <h3 className="font-semibold">Floui</h3>
                      </div>
                      <Switch 
                        checked={globalIntegrations.find(i => i.provider === 'floui')?.is_active || false}
                        onCheckedChange={(checked) => {
                          const integration = globalIntegrations.find(i => i.provider === 'floui')
                          if (integration) {
                            handleToggleIntegration(integration.id, checked)
                          }
                        }}
                      />
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      Automação com Floui para processos empresariais
                    </p>
                    <Button variant="outline" size="sm" className="w-full">
                      Configurar
                    </Button>
                  </Card>

                  {/* ERP/CRM */}
                  <Card className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Database className="h-5 w-5 text-gray-600" />
                        <h3 className="font-semibold">ERP/CRM</h3>
                      </div>
                      <Switch 
                        checked={globalIntegrations.find(i => i.provider === 'erp')?.is_active || false}
                        onCheckedChange={(checked) => {
                          const integration = globalIntegrations.find(i => i.provider === 'erp')
                          if (integration) {
                            handleToggleIntegration(integration.id, checked)
                          }
                        }}
                      />
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      Integração com ERPs e CRMs para sincronização de dados
                    </p>
                    <Button variant="outline" size="sm" className="w-full">
                      Configurar
                    </Button>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
