"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { 
  Settings, 
  Save,
  Building,
  Palette,
  Star,
  Bell,
  Mail,
  Shield,
  Users,
  Package
} from "lucide-react"
import { YoobeLogo } from "@/components/ui/yoobe-logo"
import { useAuth } from "@/components/auth/auth-provider-simple"
import { 
  getCompanyConfig, 
  updateCompanyConfig,
  type CompanyConfig 
} from "@/lib/queries/gestor"

export default function GestorConfiguracoesPage() {
  const [config, setConfig] = useState<CompanyConfig>({
    id: '',
    name: '',
    logo_url: '',
    primary_color: '#1e40af',
    points_system_enabled: true,
    max_points_per_month: 1000,
    auto_approve_orders: false,
    notification_email: '',
    created_at: '',
    updated_at: ''
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const { user, signOut } = useAuth()

  useEffect(() => {
    fetchConfig()
  }, [])

  const fetchConfig = async () => {
    try {
      setLoading(true)
      const data = await getCompanyConfig()
      if (data) {
        setConfig(data)
      } else {
        // Fallback para configuração padrão
        setConfig({
          id: 'default',
          name: 'Minha Empresa',
          logo_url: '',
          primary_color: '#1e40af',
          points_system_enabled: true,
          max_points_per_month: 1000,
          auto_approve_orders: false,
          notification_email: 'admin@empresa.com',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
      }
    } catch (error) {
      console.error('Error fetching company config:', error)
      // Fallback para configuração padrão em caso de erro
      setConfig({
        id: 'default',
        name: 'Minha Empresa',
        logo_url: '',
        primary_color: '#1e40af',
        points_system_enabled: true,
        max_points_per_month: 1000,
        auto_approve_orders: false,
        notification_email: 'admin@empresa.com',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      const updatedConfig = await updateCompanyConfig(config)
      if (updatedConfig) {
        setConfig(updatedConfig)
        setHasChanges(false)
      }
    } catch (error) {
      console.error('Error updating company config:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleConfigChange = (field: keyof CompanyConfig, value: any) => {
    setConfig(prev => ({ ...prev, [field]: value }))
    setHasChanges(true)
  }

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-3">
          <YoobeLogo size="lg" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Configurações</h1>
            <p className="text-gray-600">Configurações da empresa</p>
          </div>
        </div>
        <div className="animate-pulse space-y-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                <div className="space-y-3">
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <YoobeLogo size="lg" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Configurações</h1>
            <p className="text-gray-600">Configure as opções da sua empresa</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button 
            onClick={handleSave} 
            disabled={!hasChanges || saving}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {saving ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
          <Button variant="outline" onClick={signOut}>
            Sair
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Company Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Informações da Empresa
            </CardTitle>
            <CardDescription>
              Configure as informações básicas da sua empresa
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="company-name">Nome da Empresa</Label>
              <Input
                id="company-name"
                value={config.name}
                onChange={(e) => handleConfigChange('name', e.target.value)}
                placeholder="Nome da sua empresa"
              />
            </div>
            <div>
              <Label htmlFor="logo-url">URL do Logo</Label>
              <Input
                id="logo-url"
                value={config.logo_url}
                onChange={(e) => handleConfigChange('logo_url', e.target.value)}
                placeholder="https://exemplo.com/logo.png"
              />
              {config.logo_url && (
                <div className="mt-2">
                  <div className="h-12 w-auto bg-gradient-to-r from-blue-500 to-blue-600 rounded px-4 flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">LOGO</span>
                  </div>
                </div>
              )}
            </div>
            <div>
              <Label htmlFor="primary-color">Cor Principal</Label>
              <div className="flex gap-2">
                <Input
                  id="primary-color"
                  value={config.primary_color}
                  onChange={(e) => handleConfigChange('primary_color', e.target.value)}
                  placeholder="#1e40af"
                />
                <div
                  className="w-12 h-10 rounded border"
                  style={{ backgroundColor: config.primary_color }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Points System */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              Sistema de Pontos
            </CardTitle>
            <CardDescription>
              Configure como funciona o sistema de pontos
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="points-enabled">Sistema de Pontos Ativo</Label>
                <p className="text-sm text-gray-600">Permitir que funcionários usem pontos</p>
              </div>
              <Switch
                id="points-enabled"
                checked={config.points_system_enabled}
                onCheckedChange={(checked) => handleConfigChange('points_system_enabled', checked)}
              />
            </div>
            <div>
              <Label htmlFor="max-points">Pontos Máximos por Mês</Label>
              <Input
                id="max-points"
                type="number"
                value={config.max_points_per_month}
                onChange={(e) => handleConfigChange('max_points_per_month', parseInt(e.target.value) || 0)}
                placeholder="1000"
                disabled={!config.points_system_enabled}
              />
              <p className="text-sm text-gray-600 mt-1">
                Quantidade máxima de pontos que um funcionário pode receber por mês
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Order Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Gestão de Pedidos
            </CardTitle>
            <CardDescription>
              Configure como os pedidos são processados
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="auto-approve">Aprovação Automática</Label>
                <p className="text-sm text-gray-600">Aprovar pedidos automaticamente</p>
              </div>
              <Switch
                id="auto-approve"
                checked={config.auto_approve_orders}
                onCheckedChange={(checked) => handleConfigChange('auto_approve_orders', checked)}
              />
            </div>
            <div>
              <Label htmlFor="notification-email">Email para Notificações</Label>
              <Input
                id="notification-email"
                type="email"
                value={config.notification_email}
                onChange={(e) => handleConfigChange('notification_email', e.target.value)}
                placeholder="notificacoes@empresa.com"
              />
              <p className="text-sm text-gray-600 mt-1">
                Email que receberá notificações sobre novos pedidos
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Security & Privacy */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Segurança e Privacidade
            </CardTitle>
            <CardDescription>
              Configurações de segurança da plataforma
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900">Segurança</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    Todos os dados são criptografados e armazenados de forma segura.
                    Acessos são registrados e monitorados.
                  </p>
                </div>
              </div>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-start gap-3">
                <Users className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-green-900">Controle de Acesso</h4>
                  <p className="text-sm text-green-700 mt-1">
                    Apenas funcionários autorizados podem acessar a plataforma.
                    Logs de acesso são mantidos para auditoria.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configurações Adicionais
          </CardTitle>
          <CardDescription>
            Outras configurações da plataforma
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="company-description">Descrição da Empresa</Label>
            <Textarea
              id="company-description"
              placeholder="Descreva sua empresa, missão, valores..."
              rows={4}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="contact-phone">Telefone de Contato</Label>
              <Input
                id="contact-phone"
                placeholder="(11) 99999-9999"
              />
            </div>
            <div>
              <Label htmlFor="contact-email">Email de Contato</Label>
              <Input
                id="contact-email"
                type="email"
                placeholder="contato@empresa.com"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

