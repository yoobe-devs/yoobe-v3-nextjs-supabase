'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/auth/auth-provider-simple'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Zap,
  Users,
  Star,
  Database,
  Settings,
  Loader2,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import { toast } from 'sonner'

interface StoreIntegration {
  id: string
  store_id: string
  integration_type: 'erp' | 'crm' | 'gamification' | 'automation'
  provider: string
  name: string
  is_active: boolean
  config: any
  created_at: string
  updated_at: string
}

export default function GestorIntegracoesPage() {
  const { user } = useAuth()
  const [integrations, setIntegrations] = useState<StoreIntegration[]>([])
  const [loading, setLoading] = useState(true)
  const [activating, setActivating] = useState<string | null>(null)

  useEffect(() => {
    loadIntegrations()
  }, [])

  const loadIntegrations = async () => {
    try {
      const response = await fetch('/api/gestor/integrations')
      if (response.ok) {
        const data = await response.json()
        setIntegrations(data.integrations || [])
      }
    } catch (error) {
      console.error('Erro ao carregar integrações:', error)
      toast.error('Erro ao carregar integrações')
    } finally {
      setLoading(false)
    }
  }

  const handleToggleIntegration = async (integrationId: string, isActive: boolean) => {
    setActivating(integrationId)
    try {
      const response = await fetch(`/api/gestor/integrations/${integrationId}`, {
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
    } finally {
      setActivating(null)
    }
  }

  const handleConfigureIntegration = async (provider: string) => {
    toast.info(`Configuração para ${provider} será implementada em breve!`)
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
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Integrações da Loja</h1>
            <p className="text-gray-600 mt-2">
              Conecte sua loja com outras plataformas para automatizar processos
            </p>
          </div>
          <Badge variant="outline" className="text-sm">
            Gestor
          </Badge>
        </div>

        <Tabs defaultValue="erp" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="erp" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              ERP/CRM
            </TabsTrigger>
            <TabsTrigger value="gamification" className="flex items-center gap-2">
              <Star className="h-4 w-4" />
              Gamificação
            </TabsTrigger>
            <TabsTrigger value="automation" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Automação
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Usuários
            </TabsTrigger>
          </TabsList>

          {/* ERP/CRM Integrations */}
          <TabsContent value="erp" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Integrações ERP/CRM
                </CardTitle>
                <CardDescription>
                  Sincronize dados de funcionários e produtos com seu ERP ou CRM
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* SAP */}
                  <Card className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Database className="h-5 w-5 text-blue-600" />
                        <h3 className="font-semibold">SAP</h3>
                      </div>
                      <Switch 
                        checked={integrations.find(i => i.provider === 'sap')?.is_active || false}
                        onCheckedChange={(checked) => {
                          const integration = integrations.find(i => i.provider === 'sap')
                          if (integration) {
                            handleToggleIntegration(integration.id, checked)
                          }
                        }}
                        disabled={activating === 'sap'}
                      />
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      Sincronize funcionários e produtos com SAP
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => handleConfigureIntegration('SAP')}
                    >
                      Configurar
                    </Button>
                  </Card>

                  {/* Salesforce */}
                  <Card className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Database className="h-5 w-5 text-blue-500" />
                        <h3 className="font-semibold">Salesforce</h3>
                      </div>
                      <Switch 
                        checked={integrations.find(i => i.provider === 'salesforce')?.is_active || false}
                        onCheckedChange={(checked) => {
                          const integration = integrations.find(i => i.provider === 'salesforce')
                          if (integration) {
                            handleToggleIntegration(integration.id, checked)
                          }
                        }}
                        disabled={activating === 'salesforce'}
                      />
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      Integre com Salesforce CRM
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => handleConfigureIntegration('Salesforce')}
                    >
                      Configurar
                    </Button>
                  </Card>

                  {/* Oracle */}
                  <Card className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Database className="h-5 w-5 text-red-600" />
                        <h3 className="font-semibold">Oracle</h3>
                      </div>
                      <Switch 
                        checked={integrations.find(i => i.provider === 'oracle')?.is_active || false}
                        onCheckedChange={(checked) => {
                          const integration = integrations.find(i => i.provider === 'oracle')
                          if (integration) {
                            handleToggleIntegration(integration.id, checked)
                          }
                        }}
                        disabled={activating === 'oracle'}
                      />
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      Conecte com Oracle ERP
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => handleConfigureIntegration('Oracle')}
                    >
                      Configurar
                    </Button>
                  </Card>
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
                  Use pontos de outras plataformas de gamificação na sua loja
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
                        checked={integrations.find(i => i.provider === 'workvivo')?.is_active || false}
                        onCheckedChange={(checked) => {
                          const integration = integrations.find(i => i.provider === 'workvivo')
                          if (integration) {
                            handleToggleIntegration(integration.id, checked)
                          }
                        }}
                        disabled={activating === 'workvivo'}
                      />
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      Use pontos de reconhecimento do Workvivo
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => handleConfigureIntegration('Workvivo')}
                    >
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
                        checked={integrations.find(i => i.provider === 'applause')?.is_active || false}
                        onCheckedChange={(checked) => {
                          const integration = integrations.find(i => i.provider === 'applause')
                          if (integration) {
                            handleToggleIntegration(integration.id, checked)
                          }
                        }}
                        disabled={activating === 'applause'}
                      />
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      Integre pontos de feedback do Applause
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => handleConfigureIntegration('Applause')}
                    >
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
                        checked={integrations.find(i => i.provider === 'human')?.is_active || false}
                        onCheckedChange={(checked) => {
                          const integration = integrations.find(i => i.provider === 'human')
                          if (integration) {
                            handleToggleIntegration(integration.id, checked)
                          }
                        }}
                        disabled={activating === 'human'}
                      />
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      Use pontos de bem-estar do Human
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => handleConfigureIntegration('Human')}
                    >
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
                  Automatize processos com plataformas de automação
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
                        checked={integrations.find(i => i.provider === 'zapier')?.is_active || false}
                        onCheckedChange={(checked) => {
                          const integration = integrations.find(i => i.provider === 'zapier')
                          if (integration) {
                            handleToggleIntegration(integration.id, checked)
                          }
                        }}
                        disabled={activating === 'zapier'}
                      />
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      Crie workflows automatizados
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => handleConfigureIntegration('Zapier')}
                    >
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
                        checked={integrations.find(i => i.provider === 'floui')?.is_active || false}
                        onCheckedChange={(checked) => {
                          const integration = integrations.find(i => i.provider === 'floui')
                          if (integration) {
                            handleToggleIntegration(integration.id, checked)
                          }
                        }}
                        disabled={activating === 'floui'}
                      />
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      Automatize processos empresariais
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => handleConfigureIntegration('Floui')}
                    >
                      Configurar
                    </Button>
                  </Card>

                  {/* Make (Integromat) */}
                  <Card className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Zap className="h-5 w-5 text-purple-600" />
                        <h3 className="font-semibold">Make</h3>
                      </div>
                      <Switch 
                        checked={integrations.find(i => i.provider === 'make')?.is_active || false}
                        onCheckedChange={(checked) => {
                          const integration = integrations.find(i => i.provider === 'make')
                          if (integration) {
                            handleToggleIntegration(integration.id, checked)
                          }
                        }}
                        disabled={activating === 'make'}
                      />
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      Crie cenários de automação
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => handleConfigureIntegration('Make')}
                    >
                      Configurar
                    </Button>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* User Management Integrations */}
          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Integrações de Gestão de Usuários
                </CardTitle>
                <CardDescription>
                  Sincronize funcionários e usuários com sistemas externos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Active Directory */}
                  <Card className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-blue-600" />
                        <h3 className="font-semibold">Active Directory</h3>
                      </div>
                      <Switch 
                        checked={integrations.find(i => i.provider === 'ad')?.is_active || false}
                        onCheckedChange={(checked) => {
                          const integration = integrations.find(i => i.provider === 'ad')
                          if (integration) {
                            handleToggleIntegration(integration.id, checked)
                          }
                        }}
                        disabled={activating === 'ad'}
                      />
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      Sincronize usuários do AD
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => handleConfigureIntegration('Active Directory')}
                    >
                      Configurar
                    </Button>
                  </Card>

                  {/* Google Workspace */}
                  <Card className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-green-600" />
                        <h3 className="font-semibold">Google Workspace</h3>
                      </div>
                      <Switch 
                        checked={integrations.find(i => i.provider === 'google')?.is_active || false}
                        onCheckedChange={(checked) => {
                          const integration = integrations.find(i => i.provider === 'google')
                          if (integration) {
                            handleToggleIntegration(integration.id, checked)
                          }
                        }}
                        disabled={activating === 'google'}
                      />
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      Sincronize usuários do Google
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => handleConfigureIntegration('Google Workspace')}
                    >
                      Configurar
                    </Button>
                  </Card>

                  {/* Microsoft 365 */}
                  <Card className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-blue-500" />
                        <h3 className="font-semibold">Microsoft 365</h3>
                      </div>
                      <Switch 
                        checked={integrations.find(i => i.provider === 'microsoft')?.is_active || false}
                        onCheckedChange={(checked) => {
                          const integration = integrations.find(i => i.provider === 'microsoft')
                          if (integration) {
                            handleToggleIntegration(integration.id, checked)
                          }
                        }}
                        disabled={activating === 'microsoft'}
                      />
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      Sincronize usuários do M365
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => handleConfigureIntegration('Microsoft 365')}
                    >
                      Configurar
                    </Button>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Status das Integrações */}
        {integrations.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Status das Integrações</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {integrations.map((integration) => (
                  <div key={integration.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Badge variant={integration.is_active ? 'default' : 'secondary'}>
                        {integration.is_active ? 'Ativa' : 'Inativa'}
                      </Badge>
                      <span className="text-sm font-medium">{integration.name}</span>
                      <span className="text-xs text-gray-500">({integration.provider})</span>
                    </div>
                    <span className="text-sm text-gray-600">
                      {new Date(integration.updated_at).toLocaleDateString('pt-BR')}
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
