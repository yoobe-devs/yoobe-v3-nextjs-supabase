'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { 
  Settings, 
  Save, 
  Palette,
  Globe,
  Shield,
  Bell,
  CreditCard,
  Truck,
  Mail,
  Phone,
  MapPin,
  Image,
  Eye,
  EyeOff,
  Upload,
  Download,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Store,
  Users,
  Package
} from 'lucide-react'

interface StoreConfig {
  id: string
  name: string
  slug: string
  domain: string
  description: string
  primaryColor: string
  secondaryColor: string
  logo: string
  favicon: string
  contactEmail: string
  contactPhone: string
  address: string
  policies: {
    returnPolicy: string
    shippingPolicy: string
    privacyPolicy: string
    termsOfService: string
  }
  features: {
    pointsEnabled: boolean
    cashEnabled: boolean
    mixedPayment: boolean
    autoActivation: boolean
    emailNotifications: boolean
    smsNotifications: boolean
  }
  limits: {
    maxPointsPerOrder: number
    maxCashPerOrder: number
    minOrderValue: number
    maxOrderValue: number
  }
  lastUpdated: string
}

export default function ConfiguracoesPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('general')
  
  const [config, setConfig] = useState<StoreConfig>({
    id: '1',
    name: 'Join Tech Store',
    slug: 'jointech',
    domain: 'jointech.yoobe.app',
    description: 'Loja oficial da Join Tecnologia com produtos personalizados e brindes corporativos.',
    primaryColor: '#3B82F6',
    secondaryColor: '#1E40AF',
    logo: '/logos/jointech-logo.png',
    favicon: '/favicons/jointech-favicon.ico',
    contactEmail: 'contato@jointech.com',
    contactPhone: '(11) 99999-9999',
    address: 'Rua das Flores, 123 - São Paulo, SP - CEP: 01234-567',
    policies: {
      returnPolicy: 'Produtos podem ser trocados em até 7 dias após a compra, desde que em perfeito estado.',
      shippingPolicy: 'Entrega gratuita para pedidos acima de R$ 100,00. Prazo de 3-5 dias úteis.',
      privacyPolicy: 'Seus dados são protegidos e não serão compartilhados com terceiros.',
      termsOfService: 'Ao utilizar nossos serviços, você concorda com nossos termos e condições.'
    },
    features: {
      pointsEnabled: true,
      cashEnabled: true,
      mixedPayment: true,
      autoActivation: false,
      emailNotifications: true,
      smsNotifications: false
    },
    limits: {
      maxPointsPerOrder: 50000,
      maxCashPerOrder: 5000,
      minOrderValue: 50,
      maxOrderValue: 10000
    },
    lastUpdated: '2025-01-02T10:30:00Z'
  })

  const tabs = [
    { id: 'general', label: 'Geral', icon: Store },
    { id: 'branding', label: 'Marca', icon: Palette },
    { id: 'policies', label: 'Políticas', icon: Shield },
    { id: 'features', label: 'Funcionalidades', icon: Package },
    { id: 'notifications', label: 'Notificações', icon: Bell },
    { id: 'limits', label: 'Limites', icon: CreditCard }
  ]

  const handleSave = async () => {
    setIsLoading(true)
    try {
      // Simular salvamento
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Atualizar timestamp
      setConfig(prev => ({
        ...prev,
        lastUpdated: new Date().toISOString()
      }))
      
      console.log('Configurações salvas com sucesso!')
    } catch (error) {
      console.error('Erro ao salvar:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Simular upload
      const reader = new FileReader()
      reader.onload = (e) => {
        setConfig(prev => ({
          ...prev,
          logo: e.target?.result as string
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  const generateStoreUrl = () => {
    return `https://${config.slug}.yoobe.app`
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Configurações da Loja</h1>
          <p className="text-gray-600">Personalize sua loja, políticas e funcionalidades.</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {/* General Tab */}
        {activeTab === 'general' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informações Básicas</CardTitle>
                <CardDescription>Configure o nome, slug e domínio da sua loja</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nome da Loja
                    </label>
                    <Input
                      value={config.name}
                      onChange={(e) => setConfig(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Nome da sua loja"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Slug (URL)
                    </label>
                    <Input
                      value={config.slug}
                      onChange={(e) => setConfig(prev => ({ ...prev, slug: e.target.value }))}
                      placeholder="slug-da-loja"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Domínio Personalizado
                  </label>
                  <Input
                    value={config.domain}
                    onChange={(e) => setConfig(prev => ({ ...prev, domain: e.target.value }))}
                    placeholder="minhaloja.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descrição
                  </label>
                  <Textarea
                    value={config.description}
                    onChange={(e) => setConfig(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Descreva sua loja..."
                    rows={3}
                  />
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Globe className="h-5 w-5 text-blue-600" />
                    <span className="font-medium text-blue-900">URL da Loja</span>
                  </div>
                  <p className="text-blue-700 text-sm">
                    Sua loja estará disponível em: <strong>{generateStoreUrl()}</strong>
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Informações de Contato</CardTitle>
                <CardDescription>Configure como os clientes podem entrar em contato</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email de Contato
                    </label>
                    <Input
                      value={config.contactEmail}
                      onChange={(e) => setConfig(prev => ({ ...prev, contactEmail: e.target.value }))}
                      placeholder="contato@minhaloja.com"
                      type="email"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Telefone
                    </label>
                    <Input
                      value={config.contactPhone}
                      onChange={(e) => setConfig(prev => ({ ...prev, contactPhone: e.target.value }))}
                      placeholder="(11) 99999-9999"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Endereço
                  </label>
                  <Textarea
                    value={config.address}
                    onChange={(e) => setConfig(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="Endereço completo da empresa..."
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Branding Tab */}
        {activeTab === 'branding' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Identidade Visual</CardTitle>
                <CardDescription>Personalize as cores e imagens da sua loja</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cor Primária
                    </label>
                    <div className="flex items-center space-x-2">
                      <Input
                        value={config.primaryColor}
                        onChange={(e) => setConfig(prev => ({ ...prev, primaryColor: e.target.value }))}
                        type="color"
                        className="w-16 h-10"
                      />
                      <Input
                        value={config.primaryColor}
                        onChange={(e) => setConfig(prev => ({ ...prev, primaryColor: e.target.value }))}
                        placeholder="#3B82F6"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cor Secundária
                    </label>
                    <div className="flex items-center space-x-2">
                      <Input
                        value={config.secondaryColor}
                        onChange={(e) => setConfig(prev => ({ ...prev, secondaryColor: e.target.value }))}
                        type="color"
                        className="w-16 h-10"
                      />
                      <Input
                        value={config.secondaryColor}
                        onChange={(e) => setConfig(prev => ({ ...prev, secondaryColor: e.target.value }))}
                        placeholder="#1E40AF"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Logo da Loja
                    </label>
                    <div className="space-y-2">
                      {config.logo && (
                        <div className="w-32 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                          <img src={config.logo} alt="Logo" className="max-w-full max-h-full object-contain" />
                        </div>
                      )}
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm" onClick={() => document.getElementById('logo-upload')?.click()}>
                          <Upload className="h-4 w-4 mr-2" />
                          Upload
                        </Button>
                        <input
                          id="logo-upload"
                          type="file"
                          accept="image/*"
                          onChange={handleLogoUpload}
                          className="hidden"
                        />
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          Visualizar
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Favicon
                    </label>
                    <div className="space-y-2">
                      {config.favicon && (
                        <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                          <img src={config.favicon} alt="Favicon" className="max-w-full max-h-full object-contain" />
                        </div>
                      )}
                      <Button variant="outline" size="sm">
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Favicon
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Policies Tab */}
        {activeTab === 'policies' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Políticas da Loja</CardTitle>
                <CardDescription>Configure as políticas de retorno, envio e privacidade</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Política de Retorno
                  </label>
                  <Textarea
                    value={config.policies.returnPolicy}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      policies: { ...prev.policies, returnPolicy: e.target.value }
                    }))}
                    placeholder="Descreva sua política de retorno..."
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Política de Envio
                  </label>
                  <Textarea
                    value={config.policies.shippingPolicy}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      policies: { ...prev.policies, shippingPolicy: e.target.value }
                    }))}
                    placeholder="Descreva sua política de envio..."
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Política de Privacidade
                  </label>
                  <Textarea
                    value={config.policies.privacyPolicy}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      policies: { ...prev.policies, privacyPolicy: e.target.value }
                    }))}
                    placeholder="Descreva sua política de privacidade..."
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Termos de Serviço
                  </label>
                  <Textarea
                    value={config.policies.termsOfService}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      policies: { ...prev.policies, termsOfService: e.target.value }
                    }))}
                    placeholder="Descreva seus termos de serviço..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Features Tab */}
        {activeTab === 'features' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Funcionalidades da Loja</CardTitle>
                <CardDescription>Ative ou desative funcionalidades específicas</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="pointsEnabled"
                      checked={config.features.pointsEnabled}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        features: { ...prev.features, pointsEnabled: e.target.checked }
                      }))}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="pointsEnabled" className="text-sm font-medium text-gray-700">
                      Sistema de Pontos
                    </label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="cashEnabled"
                      checked={config.features.cashEnabled}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        features: { ...prev.features, cashEnabled: e.target.checked }
                      }))}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="cashEnabled" className="text-sm font-medium text-gray-700">
                      Pagamento em Dinheiro
                    </label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="mixedPayment"
                      checked={config.features.mixedPayment}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        features: { ...prev.features, mixedPayment: e.target.checked }
                      }))}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="mixedPayment" className="text-sm font-medium text-gray-700">
                      Pagamento Misto
                    </label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="autoActivation"
                      checked={config.features.autoActivation}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        features: { ...prev.features, autoActivation: e.target.checked }
                      }))}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="autoActivation" className="text-sm font-medium text-gray-700">
                      Ativação Automática
                    </label>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Configurações de Notificação</CardTitle>
                <CardDescription>Configure como e quando enviar notificações</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="emailNotifications"
                      checked={config.features.emailNotifications}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        features: { ...prev.features, emailNotifications: e.target.checked }
                      }))}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="emailNotifications" className="text-sm font-medium text-gray-700">
                      Notificações por Email
                    </label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="smsNotifications"
                      checked={config.features.smsNotifications}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        features: { ...prev.features, smsNotifications: e.target.checked }
                      }))}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="smsNotifications" className="text-sm font-medium text-gray-700">
                      Notificações por SMS
                    </label>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Limits Tab */}
        {activeTab === 'limits' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Limites e Restrições</CardTitle>
                <CardDescription>Configure limites para pedidos e pagamentos</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Máximo de Pontos por Pedido
                    </label>
                    <Input
                      value={config.limits.maxPointsPerOrder}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        limits: { ...prev.limits, maxPointsPerOrder: parseInt(e.target.value) || 0 }
                      }))}
                      type="number"
                      placeholder="50000"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Máximo em Dinheiro por Pedido
                    </label>
                    <Input
                      value={config.limits.maxCashPerOrder}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        limits: { ...prev.limits, maxCashPerOrder: parseInt(e.target.value) || 0 }
                      }))}
                      type="number"
                      placeholder="5000"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Valor Mínimo do Pedido
                    </label>
                    <Input
                      value={config.limits.minOrderValue}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        limits: { ...prev.limits, minOrderValue: parseInt(e.target.value) || 0 }
                      }))}
                      type="number"
                      placeholder="50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Valor Máximo do Pedido
                    </label>
                    <Input
                      value={config.limits.maxOrderValue}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        limits: { ...prev.limits, maxOrderValue: parseInt(e.target.value) || 0 }
                      }))}
                      type="number"
                      placeholder="10000"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Status Bar */}
      <Card className="bg-gray-50">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-sm text-gray-600">
                Última atualização: {new Date(config.lastUpdated).toLocaleString('pt-BR')}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline">
                <Store className="h-3 w-3 mr-1" />
                {config.name}
              </Badge>
              <Badge variant="outline">
                <Globe className="h-3 w-3 mr-1" />
                {config.slug}.yoobe.app
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
