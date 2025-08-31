"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { 
  Settings, 
  Building2, 
  ArrowLeft,
  Save,
  Loader2,
  Star,
  DollarSign,
  Users,
  Package
} from "lucide-react"
import { SafeImage } from "@/components/ui/safe-image"
import { getCompanyConfig, updateCompanyConfig, type CompanyConfig } from "@/lib/queries/gestor"
import { toast } from "sonner"

export default function GestorConfiguracoesPage() {
  const [config, setConfig] = useState<CompanyConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const router = useRouter()

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    logo_url: '',
    primary_color: '#1e40af',
    points_system_enabled: true,
    max_points_per_month: 1000,
    auto_approve_orders: true,
    notification_email: ''
  })

  useEffect(() => {
    loadConfig()
  }, [])

  const loadConfig = async () => {
    try {
      setLoading(true)
      const data = await getCompanyConfig()
      setConfig(data)
      if (data) {
        setFormData({
          name: data.name || '',
          logo_url: data.logo_url || '',
          primary_color: data.primary_color || '#1e40af',
          points_system_enabled: data.points_system_enabled || true,
          max_points_per_month: data.max_points_per_month || 1000,
          auto_approve_orders: data.auto_approve_orders || true,
          notification_email: data.notification_email || ''
        })
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error)
      toast.error('Erro ao carregar configurações')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string | number | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name) {
      toast.error('Nome da empresa é obrigatório')
      return
    }

    setSaving(true)

    try {
      const updatedConfig = await updateCompanyConfig({
        name: formData.name,
        logo_url: formData.logo_url,
        primary_color: formData.primary_color,
        points_system_enabled: formData.points_system_enabled,
        max_points_per_month: formData.max_points_per_month,
        auto_approve_orders: formData.auto_approve_orders,
        notification_email: formData.notification_email
      })

      if (updatedConfig) {
        setConfig(updatedConfig)
        toast.success('Configurações atualizadas com sucesso!')
      }
    } catch (error) {
      console.error('Erro ao atualizar configurações:', error)
      toast.error('Erro ao atualizar configurações')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Carregando configurações...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            onClick={() => router.push('/gestor/dashboard')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar ao Dashboard
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Configurações</h1>
            <p className="text-gray-600">Configure sua empresa e sistema de pontos</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Company Info */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Informações da Empresa
              </CardTitle>
              <CardDescription>
                Configure as informações básicas da sua empresa
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Logo */}
                <div className="flex items-center gap-6">
                  <SafeImage
                    src={formData.logo_url}
                    alt={formData.name}
                    size={80}
                    className="w-20 h-20 rounded-lg"
                  />
                  <div className="flex-1">
                    <Label htmlFor="logo_url">URL do Logo</Label>
                    <Input
                      id="logo_url"
                      value={formData.logo_url}
                      onChange={(e) => handleInputChange('logo_url', e.target.value)}
                      placeholder="https://exemplo.com/logo.png"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Deixe vazio para usar logo padrão
                    </p>
                  </div>
                </div>

                {/* Company Name */}
                <div>
                  <Label htmlFor="name">Nome da Empresa *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Nome da sua empresa"
                    required
                  />
                </div>

                {/* Primary Color */}
                <div>
                  <Label htmlFor="primary_color">Cor Principal</Label>
                  <div className="flex items-center gap-3">
                    <Input
                      id="primary_color"
                      type="color"
                      value={formData.primary_color}
                      onChange={(e) => handleInputChange('primary_color', e.target.value)}
                      className="w-20 h-10"
                    />
                    <Input
                      value={formData.primary_color}
                      onChange={(e) => handleInputChange('primary_color', e.target.value)}
                      placeholder="#1e40af"
                    />
                  </div>
                </div>

                {/* Notification Email */}
                <div>
                  <Label htmlFor="notification_email">Email para Notificações</Label>
                  <Input
                    id="notification_email"
                    type="email"
                    value={formData.notification_email}
                    onChange={(e) => handleInputChange('notification_email', e.target.value)}
                    placeholder="admin@empresa.com"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Email para receber notificações importantes
                  </p>
                </div>

                <Button type="submit" disabled={saving} className="w-full">
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Salvar Configurações
                    </>
                  )}
                </Button>
              </form>
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
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="points_system_enabled">Sistema de Pontos Ativo</Label>
                  <p className="text-sm text-gray-600">
                    Permite que funcionários acumulem e gastem pontos
                  </p>
                </div>
                <Switch
                  id="points_system_enabled"
                  checked={formData.points_system_enabled}
                  onCheckedChange={(checked) => handleInputChange('points_system_enabled', checked)}
                />
              </div>

              <div>
                <Label htmlFor="max_points_per_month">Máximo de Pontos por Mês</Label>
                <Input
                  id="max_points_per_month"
                  type="number"
                  value={formData.max_points_per_month}
                  onChange={(e) => handleInputChange('max_points_per_month', parseInt(e.target.value))}
                  placeholder="1000"
                  min="0"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Limite máximo de pontos que um funcionário pode acumular por mês
                </p>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="auto_approve_orders">Aprovação Automática de Pedidos</Label>
                  <p className="text-sm text-gray-600">
                    Pedidos são aprovados automaticamente sem intervenção manual
                  </p>
                </div>
                <Switch
                  id="auto_approve_orders"
                  checked={formData.auto_approve_orders}
                  onCheckedChange={(checked) => handleInputChange('auto_approve_orders', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Company Preview */}
          <Card>
            <CardHeader>
              <CardTitle>Visualização da Empresa</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-4">
                <SafeImage
                  src={formData.logo_url}
                  alt={formData.name}
                  size={120}
                  className="w-30 h-30 rounded-lg mx-auto"
                />
                <div>
                  <h3 className="font-semibold text-lg">{formData.name || 'Nome da Empresa'}</h3>
                  <p className="text-sm text-gray-600">Empresa cliente</p>
                </div>
                <div 
                  className="w-full h-2 rounded-full"
                  style={{ backgroundColor: formData.primary_color }}
                ></div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Estatísticas Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-blue-600" />
                  <span className="text-sm text-gray-600">Funcionários</span>
                </div>
                <Badge variant="outline">3 ativos</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-gray-600">Produtos</span>
                </div>
                <Badge variant="outline">7 disponíveis</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-purple-600" />
                  <span className="text-sm text-gray-600">Pontos Distribuídos</span>
                </div>
                <Badge variant="outline">6.350 pts</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-gray-600">Receita</span>
                </div>
                <Badge variant="outline">R$ 79,80</Badge>
              </div>
            </CardContent>
          </Card>

          {/* System Status */}
          <Card>
            <CardHeader>
              <CardTitle>Status do Sistema</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Sistema de Pontos</span>
                <Badge variant={formData.points_system_enabled ? "default" : "secondary"}>
                  {formData.points_system_enabled ? 'Ativo' : 'Inativo'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Aprovação Automática</span>
                <Badge variant={formData.auto_approve_orders ? "default" : "secondary"}>
                  {formData.auto_approve_orders ? 'Ativa' : 'Manual'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Notificações</span>
                <Badge variant={formData.notification_email ? "default" : "secondary"}>
                  {formData.notification_email ? 'Configuradas' : 'Não configuradas'}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

