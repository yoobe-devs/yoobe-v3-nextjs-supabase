'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
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
  Package,
  ShoppingCart,
  Loader2,
  Tag,
  BarChart3,
  Activity,
  TrendingUp,
  Eye as EyeIcon,
} from 'lucide-react'
import { toast } from 'sonner'
import { TagGateSettings } from '@/components/tag-gate/TagGateSettings'

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
  const [loading, setLoading] = useState(true)
  const [checkoutV2Enabled, setCheckoutV2Enabled] = useState(false)
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const [checkoutError, setCheckoutError] = useState<string | null>(null)
  const [analyticsEnabled, setAnalyticsEnabled] = useState(true)
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [autoBackupEnabled, setAutoBackupEnabled] = useState(false)

  // Estados para o Editor Visual
  const [visualConfig, setVisualConfig] = useState({
    primaryColor: '#3B82F6',
    secondaryColor: '#10B981',
    accentColor: '#F59E0B',
    backgroundColor: '#FFFFFF',
    fontFamily: 'Inter',
    fontSize: '16px',
    containerWidth: 'Fluido (100%)',
    headerStyle: 'Header Fixo',
    buttonStyle: 'Arredondado',
    cardStyle: 'Com Sombra',
    formStyle: 'Borda Completa',
  })
  const supabase = createClientComponentClient()

  const [config, setConfig] = useState<StoreConfig>({
    id: '1',
    name: 'Loja Yoobe',
    slug: 'yoobe',
    domain: 'loja.yoobe.com',
    description:
      'Loja oficial da Yoobe com produtos personalizados e brindes corporativos.',
    primaryColor: '#3B82F6',
    secondaryColor: '#1E40AF',
    logo: '/logos/yoobe-logo.png',
    favicon: '/favicons/yoobe-favicon.ico',
    contactEmail: 'contato@yoobe.com',
    contactPhone: '(11) 99999-9999',
    address: 'Endereço da Loja Yoobe - São Paulo, SP',
    policies: {
      returnPolicy:
        'Produtos podem ser trocados em até 7 dias após a compra, desde que em perfeito estado.',
      shippingPolicy:
        'Entrega gratuita para pedidos acima de R$ 100,00. Prazo de 3-5 dias úteis.',
      privacyPolicy:
        'Seus dados são protegidos e não serão compartilhados com terceiros.',
      termsOfService:
        'Ao utilizar nossos serviços, você concorda com nossos termos e condições.',
    },
    features: {
      pointsEnabled: true,
      cashEnabled: true,
      mixedPayment: true,
      autoActivation: false,
      emailNotifications: true,
      smsNotifications: false,
    },
    limits: {
      maxPointsPerOrder: 50000,
      maxCashPerOrder: 5000,
      minOrderValue: 50,
      maxOrderValue: 10000,
    },
    lastUpdated: '2025-01-02T10:30:00Z',
  })

  useEffect(() => {
    fetchCompanyData()
    fetchCheckoutSettings()
  }, [])

  const fetchCheckoutSettings = async () => {
    try {
      const response = await fetch('/api/gestor/settings/checkout')
      if (response.ok) {
        const data = await response.json()
        setCheckoutV2Enabled(data.checkout_v2_enabled)
      } else {
        console.error('Erro ao carregar configurações do checkout')
      }
    } catch (error) {
      console.error('Erro ao carregar configurações do checkout:', error)
    }
  }

  const updateCheckoutSettings = async (enabled: boolean) => {
    try {
      setCheckoutLoading(true)
      setCheckoutError(null)

      const response = await fetch('/api/gestor/settings/checkout', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ checkout_v2_enabled: enabled }),
      })

      if (response.ok) {
        const data = await response.json()
        setCheckoutV2Enabled(data.checkout_v2_enabled)

        // Toast de sucesso
        if (enabled) {
          toast.success('Checkout v2 ativado com sucesso!')
        } else {
          toast.success('Checkout v2 desativado com sucesso!')
        }
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao salvar configurações')
      }
    } catch (error) {
      console.error('Erro ao atualizar configurações do checkout:', error)
      setCheckoutError(
        error instanceof Error ? error.message : 'Erro desconhecido'
      )

      // Reverter o estado em caso de erro
      setCheckoutV2Enabled(!enabled)

      // Toast de erro
      toast.error('Falha ao salvar configurações, tente novamente.')
    } finally {
      setCheckoutLoading(false)
    }
  }

  const fetchCompanyData = async () => {
    try {
      setLoading(true)

      // Buscar dados do usuário logado
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const companyId = user.user_metadata?.company_id
      if (!companyId) return

      // Buscar dados da empresa
      const { data: company } = await supabase
        .from('companies')
        .select('*')
        .eq('id', companyId)
        .single()

      // Buscar dados da loja
      const { data: store } = await supabase
        .from('stores')
        .select('*')
        .eq('company_id', companyId)
        .single()

      if (company) {
        setConfig(prev => ({
          ...prev,
          name: company.name || 'Loja Yoobe',
          contactEmail: company.email || 'contato@yoobe.com',
          contactPhone: company.phone || '(11) 99999-9999',
          address: company.address || 'Endereço da Loja Yoobe - São Paulo, SP',
          domain:
            `${company.name?.toLowerCase().replace(/\s+/g, '')}.yoobe.com` ||
            'loja.yoobe.com',
          slug: company.name?.toLowerCase().replace(/\s+/g, '') || 'yoobe',
        }))
      }

      if (store) {
        setConfig(prev => ({
          ...prev,
          name: store.name || 'Loja Yoobe',
          contactEmail: store.email || 'contato@yoobe.com',
          contactPhone: store.phone || '(11) 99999-9999',
          address: store.address || 'Endereço da Loja Yoobe - São Paulo, SP',
        }))
      }
    } catch (error) {
      console.error('Erro ao buscar dados da empresa:', error)
    } finally {
      setLoading(false)
    }
  }

  const tabGroups = [
    {
      title: 'Configurações Básicas',
      tabs: [{ id: 'general', label: 'Geral', icon: Store, color: 'blue' }],
    },
    {
      title: 'Aparência e Design',
      tabs: [
        { id: 'branding', label: 'Marca', icon: Palette, color: 'purple' },
        {
          id: 'visual-editor',
          label: 'Editor Visual',
          icon: Palette,
          color: 'pink',
        },
      ],
    },
    {
      title: 'Funcionalidades',
      tabs: [
        {
          id: 'features',
          label: 'Funcionalidades',
          icon: Package,
          color: 'green',
        },
        {
          id: 'checkout',
          label: 'Checkout',
          icon: ShoppingCart,
          color: 'orange',
        },
        { id: 'tag-gate', label: 'Tag Gate', icon: Tag, color: 'indigo' },
      ],
    },
    {
      title: 'Análise e Relatórios',
      tabs: [
        { id: 'analytics', label: 'Analytics', icon: BarChart3, color: 'cyan' },
      ],
    },
    {
      title: 'Configurações Avançadas',
      tabs: [
        {
          id: 'notifications',
          label: 'Notificações',
          icon: Bell,
          color: 'yellow',
        },
        { id: 'limits', label: 'Limites', icon: CreditCard, color: 'red' },
        { id: 'policies', label: 'Políticas', icon: Shield, color: 'gray' },
        { id: 'security', label: 'Segurança', icon: Shield, color: 'emerald' },
      ],
    },
  ]

  // Flatten tabs for backward compatibility
  const tabs = tabGroups.flatMap(group => group.tabs)

  // Função para obter classes CSS baseadas na cor
  const getColorClasses = (color: string, isActive: boolean) => {
    const colorMap = {
      blue: {
        active: 'bg-blue-100 text-blue-700 border-blue-200',
        inactive: 'text-blue-600 hover:bg-blue-50 hover:text-blue-700',
      },
      purple: {
        active: 'bg-purple-100 text-purple-700 border-purple-200',
        inactive: 'text-purple-600 hover:bg-purple-50 hover:text-purple-700',
      },
      pink: {
        active: 'bg-pink-100 text-pink-700 border-pink-200',
        inactive: 'text-pink-600 hover:bg-pink-50 hover:text-pink-700',
      },
      green: {
        active: 'bg-green-100 text-green-700 border-green-200',
        inactive: 'text-green-600 hover:bg-green-50 hover:text-green-700',
      },
      orange: {
        active: 'bg-orange-100 text-orange-700 border-orange-200',
        inactive: 'text-orange-600 hover:bg-orange-50 hover:text-orange-700',
      },
      indigo: {
        active: 'bg-indigo-100 text-indigo-700 border-indigo-200',
        inactive: 'text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700',
      },
      cyan: {
        active: 'bg-cyan-100 text-cyan-700 border-cyan-200',
        inactive: 'text-cyan-600 hover:bg-cyan-50 hover:text-cyan-700',
      },
      yellow: {
        active: 'bg-yellow-100 text-yellow-700 border-yellow-200',
        inactive: 'text-yellow-600 hover:bg-yellow-50 hover:text-yellow-700',
      },
      red: {
        active: 'bg-red-100 text-red-700 border-red-200',
        inactive: 'text-red-600 hover:bg-red-50 hover:text-red-700',
      },
      gray: {
        active: 'bg-gray-100 text-gray-700 border-gray-200',
        inactive: 'text-gray-600 hover:bg-gray-50 hover:text-gray-700',
      },
      emerald: {
        active: 'bg-emerald-100 text-emerald-700 border-emerald-200',
        inactive: 'text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700',
      },
    }

    return colorMap[color as keyof typeof colorMap] || colorMap.blue
  }

  const handleSave = async () => {
    setIsLoading(true)
    try {
      // Simular salvamento
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Atualizar timestamp
      setConfig(prev => ({
        ...prev,
        lastUpdated: new Date().toISOString(),
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
      reader.onload = e => {
        setConfig(prev => ({
          ...prev,
          logo: e.target?.result as string,
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  const generateStoreUrl = () => {
    return `https://${config.slug}.yoobe.app`
  }

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Carregando configurações...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <h1 className="text-3xl font-bold text-gray-900">
              Configurações da Loja
            </h1>
            {activeTab && (
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm font-medium text-blue-600">
                  {tabs.find(tab => tab.id === activeTab)?.label}
                </span>
              </div>
            )}
          </div>
          <p className="text-gray-600">
            Personalize sua loja, políticas e funcionalidades.
          </p>
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
      <div className="bg-white border-b border-gray-200">
        {/* Desktop Navigation */}
        <nav className="hidden lg:block px-6 py-4 space-y-4">
          {tabGroups.map((group, groupIndex) => (
            <div key={group.title} className="space-y-2">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                {group.title}
              </h3>
              <div className="flex flex-wrap gap-2">
                {group.tabs.map(tab => {
                  const Icon = tab.icon
                  const colorClasses = getColorClasses(
                    tab.color || 'blue',
                    activeTab === tab.id
                  )
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`px-3 py-2 rounded-lg font-medium text-sm flex items-center space-x-2 transition-all duration-200 border ${
                        activeTab === tab.id
                          ? `${colorClasses.active} shadow-sm`
                          : `${colorClasses.inactive} border-transparent`
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{tab.label}</span>
                    </button>
                  )
                })}
              </div>
              {groupIndex < tabGroups.length - 1 && (
                <div className="border-b border-gray-100 mt-4"></div>
              )}
            </div>
          ))}
        </nav>

        {/* Mobile Navigation */}
        <nav className="lg:hidden px-4 py-3">
          <div className="flex flex-wrap gap-2">
            {tabs.map(tab => {
              const Icon = tab.icon
              const colorClasses = getColorClasses(
                tab.color || 'blue',
                activeTab === tab.id
              )
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-2 py-1 rounded-md font-medium text-xs flex items-center space-x-1 transition-all duration-200 border ${
                    activeTab === tab.id
                      ? `${colorClasses.active}`
                      : `${colorClasses.inactive} border-transparent`
                  }`}
                >
                  <Icon className="h-3 w-3" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              )
            })}
          </div>
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
                <CardDescription>
                  Configure o nome, slug e domínio da sua loja
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nome da Loja
                    </label>
                    <Input
                      value={config.name}
                      onChange={e =>
                        setConfig(prev => ({ ...prev, name: e.target.value }))
                      }
                      placeholder="Nome da sua loja"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Slug (URL)
                    </label>
                    <Input
                      value={config.slug}
                      onChange={e =>
                        setConfig(prev => ({ ...prev, slug: e.target.value }))
                      }
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
                    onChange={e =>
                      setConfig(prev => ({ ...prev, domain: e.target.value }))
                    }
                    placeholder="minhaloja.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descrição
                  </label>
                  <Textarea
                    value={config.description}
                    onChange={e =>
                      setConfig(prev => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    placeholder="Descreva sua loja..."
                    rows={3}
                  />
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Globe className="h-5 w-5 text-blue-600" />
                    <span className="font-medium text-blue-900">
                      URL da Loja
                    </span>
                  </div>
                  <p className="text-blue-700 text-sm">
                    Sua loja estará disponível em:{' '}
                    <strong>{generateStoreUrl()}</strong>
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Informações de Contato</CardTitle>
                <CardDescription>
                  Configure como os clientes podem entrar em contato
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email de Contato
                    </label>
                    <Input
                      value={config.contactEmail}
                      onChange={e =>
                        setConfig(prev => ({
                          ...prev,
                          contactEmail: e.target.value,
                        }))
                      }
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
                      onChange={e =>
                        setConfig(prev => ({
                          ...prev,
                          contactPhone: e.target.value,
                        }))
                      }
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
                    onChange={e =>
                      setConfig(prev => ({ ...prev, address: e.target.value }))
                    }
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
                <CardDescription>
                  Personalize as cores e imagens da sua loja
                </CardDescription>
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
                        onChange={e =>
                          setConfig(prev => ({
                            ...prev,
                            primaryColor: e.target.value,
                          }))
                        }
                        type="color"
                        className="w-16 h-10"
                      />
                      <Input
                        value={config.primaryColor}
                        onChange={e =>
                          setConfig(prev => ({
                            ...prev,
                            primaryColor: e.target.value,
                          }))
                        }
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
                        onChange={e =>
                          setConfig(prev => ({
                            ...prev,
                            secondaryColor: e.target.value,
                          }))
                        }
                        type="color"
                        className="w-16 h-10"
                      />
                      <Input
                        value={config.secondaryColor}
                        onChange={e =>
                          setConfig(prev => ({
                            ...prev,
                            secondaryColor: e.target.value,
                          }))
                        }
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
                          <img
                            src={config.logo}
                            alt="Logo"
                            className="max-w-full max-h-full object-contain"
                          />
                        </div>
                      )}
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            document.getElementById('logo-upload')?.click()
                          }
                        >
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
                          <img
                            src={config.favicon}
                            alt="Favicon"
                            className="max-w-full max-h-full object-contain"
                          />
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

        {/* Visual Editor Tab */}
        {activeTab === 'visual-editor' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Editor Visual da Loja</CardTitle>
                <CardDescription>
                  Personalize completamente a aparência da sua loja com nosso
                  editor visual
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Cores e Tema */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <Palette className="h-5 w-5 mr-2 text-purple-600" />
                    Cores e Tema
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Cor Principal
                      </label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="color"
                          className="w-12 h-10 rounded border"
                          value={visualConfig.primaryColor}
                          onChange={e =>
                            setVisualConfig({
                              ...visualConfig,
                              primaryColor: e.target.value,
                            })
                          }
                        />
                        <Input
                          placeholder="#3B82F6"
                          className="flex-1"
                          value={visualConfig.primaryColor}
                          onChange={e =>
                            setVisualConfig({
                              ...visualConfig,
                              primaryColor: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Cor Secundária
                      </label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="color"
                          className="w-12 h-10 rounded border"
                          value={visualConfig.secondaryColor}
                          onChange={e =>
                            setVisualConfig({
                              ...visualConfig,
                              secondaryColor: e.target.value,
                            })
                          }
                        />
                        <Input
                          placeholder="#10B981"
                          className="flex-1"
                          value={visualConfig.secondaryColor}
                          onChange={e =>
                            setVisualConfig({
                              ...visualConfig,
                              secondaryColor: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Cor de Destaque
                      </label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="color"
                          className="w-12 h-10 rounded border"
                          defaultValue="#F59E0B"
                        />
                        <Input placeholder="#F59E0B" className="flex-1" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Cor de Fundo
                      </label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="color"
                          className="w-12 h-10 rounded border"
                          defaultValue="#FFFFFF"
                        />
                        <Input placeholder="#FFFFFF" className="flex-1" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tipografia */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <Settings className="h-5 w-5 mr-2 text-blue-600" />
                    Tipografia
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Fonte Principal
                      </label>
                      <select className="w-full p-2 border rounded-md">
                        <option>Inter</option>
                        <option>Roboto</option>
                        <option>Open Sans</option>
                        <option>Poppins</option>
                        <option>Montserrat</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Tamanho Base
                      </label>
                      <select className="w-full p-2 border rounded-md">
                        <option>14px</option>
                        <option>16px</option>
                        <option>18px</option>
                        <option>20px</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Layout */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <Globe className="h-5 w-5 mr-2 text-green-600" />
                    Layout
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Largura do Container
                      </label>
                      <select className="w-full p-2 border rounded-md">
                        <option>Fluido (100%)</option>
                        <option>Largura Fixa (1200px)</option>
                        <option>Largura Média (960px)</option>
                        <option>Largura Pequena (768px)</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Estilo do Header
                      </label>
                      <select className="w-full p-2 border rounded-md">
                        <option>Header Fixo</option>
                        <option>Header Estático</option>
                        <option>Header Transparente</option>
                        <option>Header Compacto</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Componentes */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <Package className="h-5 w-5 mr-2 text-orange-600" />
                    Componentes
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <ShoppingCart className="h-5 w-5 text-blue-600" />
                        <div>
                          <h4 className="font-medium">Botões</h4>
                          <p className="text-sm text-gray-600">
                            Estilo dos botões
                          </p>
                        </div>
                      </div>
                      <select className="text-sm border rounded px-2 py-1">
                        <option>Arredondado</option>
                        <option>Quadrado</option>
                        <option>Pill</option>
                      </select>
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Image className="h-5 w-5 text-green-600" />
                        <div>
                          <h4 className="font-medium">Cards</h4>
                          <p className="text-sm text-gray-600">
                            Estilo dos cards
                          </p>
                        </div>
                      </div>
                      <select className="text-sm border rounded px-2 py-1">
                        <option>Com Sombra</option>
                        <option>Borda Simples</option>
                        <option>Sem Borda</option>
                      </select>
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <BarChart3 className="h-5 w-5 text-purple-600" />
                        <div>
                          <h4 className="font-medium">Formulários</h4>
                          <p className="text-sm text-gray-600">
                            Estilo dos inputs
                          </p>
                        </div>
                      </div>
                      <select className="text-sm border rounded px-2 py-1">
                        <option>Borda Completa</option>
                        <option>Borda Inferior</option>
                        <option>Fundo Colorido</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Preview */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <EyeIcon className="h-5 w-5 mr-2 text-cyan-600" />
                    Preview em Tempo Real
                  </h3>

                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                    <div
                      className="max-w-2xl mx-auto"
                      style={{
                        fontFamily: visualConfig.fontFamily,
                        fontSize: visualConfig.fontSize,
                        backgroundColor: visualConfig.backgroundColor,
                      }}
                    >
                      {/* Header Preview */}
                      <div
                        className="p-4 mb-4 rounded-lg"
                        style={{
                          backgroundColor: visualConfig.primaryColor,
                          color: 'white',
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <h2 className="text-xl font-bold">{config.name}</h2>
                          <div className="flex space-x-2">
                            <div className="w-8 h-8 bg-white bg-opacity-20 rounded"></div>
                            <div className="w-8 h-8 bg-white bg-opacity-20 rounded"></div>
                          </div>
                        </div>
                      </div>

                      {/* Content Preview */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div
                          className={`p-4 rounded-lg ${
                            visualConfig.cardStyle === 'Com Sombra'
                              ? 'shadow-lg'
                              : visualConfig.cardStyle === 'Borda Simples'
                                ? 'border-2 border-gray-200'
                                : 'border border-gray-100'
                          }`}
                          style={{
                            backgroundColor: visualConfig.backgroundColor,
                          }}
                        >
                          <h3
                            className="font-semibold mb-2"
                            style={{ color: visualConfig.primaryColor }}
                          >
                            Produto em Destaque
                          </h3>
                          <p className="text-gray-600 text-sm mb-3">
                            Descrição do produto com preço especial
                          </p>
                          <button
                            className={`w-full py-2 px-4 font-medium text-white ${
                              visualConfig.buttonStyle === 'Arredondado'
                                ? 'rounded-lg'
                                : visualConfig.buttonStyle === 'Quadrado'
                                  ? 'rounded-none'
                                  : 'rounded-full'
                            }`}
                            style={{
                              backgroundColor: visualConfig.secondaryColor,
                            }}
                          >
                            Adicionar ao Carrinho
                          </button>
                        </div>

                        <div
                          className={`p-4 rounded-lg ${
                            visualConfig.cardStyle === 'Com Sombra'
                              ? 'shadow-lg'
                              : visualConfig.cardStyle === 'Borda Simples'
                                ? 'border-2 border-gray-200'
                                : 'border border-gray-100'
                          }`}
                          style={{
                            backgroundColor: visualConfig.backgroundColor,
                          }}
                        >
                          <h3
                            className="font-semibold mb-2"
                            style={{ color: visualConfig.primaryColor }}
                          >
                            Oferta Especial
                          </h3>
                          <p className="text-gray-600 text-sm mb-3">
                            Desconto de 20% em todos os produtos
                          </p>
                          <button
                            className={`w-full py-2 px-4 font-medium text-white ${
                              visualConfig.buttonStyle === 'Arredondado'
                                ? 'rounded-lg'
                                : visualConfig.buttonStyle === 'Quadrado'
                                  ? 'rounded-none'
                                  : 'rounded-full'
                            }`}
                            style={{
                              backgroundColor: visualConfig.accentColor,
                            }}
                          >
                            Ver Ofertas
                          </button>
                        </div>
                      </div>

                      {/* Form Preview */}
                      <div
                        className={`p-4 rounded-lg ${
                          visualConfig.cardStyle === 'Com Sombra'
                            ? 'shadow-lg'
                            : visualConfig.cardStyle === 'Borda Simples'
                              ? 'border-2 border-gray-200'
                              : 'border border-gray-100'
                        }`}
                        style={{
                          backgroundColor: visualConfig.backgroundColor,
                        }}
                      >
                        <h3
                          className="font-semibold mb-3"
                          style={{ color: visualConfig.primaryColor }}
                        >
                          Newsletter
                        </h3>
                        <div className="space-y-3">
                          <input
                            type="email"
                            placeholder="Seu email"
                            className={`w-full p-3 ${
                              visualConfig.formStyle === 'Borda Completa'
                                ? 'border border-gray-300 rounded-lg'
                                : visualConfig.formStyle === 'Borda Inferior'
                                  ? 'border-b-2 border-gray-300 bg-transparent'
                                  : 'bg-gray-100 rounded-lg border-0'
                            }`}
                            style={{
                              fontFamily: visualConfig.fontFamily,
                              fontSize: visualConfig.fontSize,
                            }}
                          />
                          <button
                            className={`w-full py-2 px-4 font-medium text-white ${
                              visualConfig.buttonStyle === 'Arredondado'
                                ? 'rounded-lg'
                                : visualConfig.buttonStyle === 'Quadrado'
                                  ? 'rounded-none'
                                  : 'rounded-full'
                            }`}
                            style={{
                              backgroundColor: visualConfig.primaryColor,
                            }}
                          >
                            Inscrever-se
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Ações */}
                <div className="flex items-center justify-between pt-6 border-t">
                  <div className="flex items-center space-x-4">
                    <Button variant="outline">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Resetar Tema
                    </Button>
                    <Button variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Exportar Tema
                    </Button>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Button variant="outline">
                      <EyeIcon className="h-4 w-4 mr-2" />
                      Visualizar
                    </Button>
                    <Button onClick={handleSave} disabled={isLoading}>
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4 mr-2" />
                      )}
                      Salvar Tema
                    </Button>
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
                <CardDescription>
                  Configure as políticas de retorno, envio e privacidade
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Política de Retorno
                  </label>
                  <Textarea
                    value={config.policies.returnPolicy}
                    onChange={e =>
                      setConfig(prev => ({
                        ...prev,
                        policies: {
                          ...prev.policies,
                          returnPolicy: e.target.value,
                        },
                      }))
                    }
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
                    onChange={e =>
                      setConfig(prev => ({
                        ...prev,
                        policies: {
                          ...prev.policies,
                          shippingPolicy: e.target.value,
                        },
                      }))
                    }
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
                    onChange={e =>
                      setConfig(prev => ({
                        ...prev,
                        policies: {
                          ...prev.policies,
                          privacyPolicy: e.target.value,
                        },
                      }))
                    }
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
                    onChange={e =>
                      setConfig(prev => ({
                        ...prev,
                        policies: {
                          ...prev.policies,
                          termsOfService: e.target.value,
                        },
                      }))
                    }
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
                <CardDescription>
                  Ative ou desative funcionalidades específicas
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="pointsEnabled"
                      checked={config.features.pointsEnabled}
                      onChange={e =>
                        setConfig(prev => ({
                          ...prev,
                          features: {
                            ...prev.features,
                            pointsEnabled: e.target.checked,
                          },
                        }))
                      }
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor="pointsEnabled"
                      className="text-sm font-medium text-gray-700"
                    >
                      Sistema de Pontos
                    </label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="cashEnabled"
                      checked={config.features.cashEnabled}
                      onChange={e =>
                        setConfig(prev => ({
                          ...prev,
                          features: {
                            ...prev.features,
                            cashEnabled: e.target.checked,
                          },
                        }))
                      }
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor="cashEnabled"
                      className="text-sm font-medium text-gray-700"
                    >
                      Pagamento em Dinheiro
                    </label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="mixedPayment"
                      checked={config.features.mixedPayment}
                      onChange={e =>
                        setConfig(prev => ({
                          ...prev,
                          features: {
                            ...prev.features,
                            mixedPayment: e.target.checked,
                          },
                        }))
                      }
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor="mixedPayment"
                      className="text-sm font-medium text-gray-700"
                    >
                      Pagamento Misto
                    </label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="autoActivation"
                      checked={config.features.autoActivation}
                      onChange={e =>
                        setConfig(prev => ({
                          ...prev,
                          features: {
                            ...prev.features,
                            autoActivation: e.target.checked,
                          },
                        }))
                      }
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor="autoActivation"
                      className="text-sm font-medium text-gray-700"
                    >
                      Ativação Automática
                    </label>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === 'checkout' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Configurações de Checkout</CardTitle>
                <CardDescription>
                  Configure as opções de checkout e pagamento
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <ShoppingCart className="h-6 w-6 text-blue-600" />
                    <div>
                      <h3 className="font-medium text-gray-900">Checkout v2</h3>
                      <p className="text-sm text-gray-600">
                        Nova experiência de checkout com melhor UX e performance
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Badge
                      variant={checkoutV2Enabled ? 'default' : 'secondary'}
                    >
                      {checkoutV2Enabled ? 'Ativo' : 'Inativo'}
                    </Badge>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={checkoutV2Enabled}
                        onChange={e => updateCheckoutSettings(e.target.checked)}
                        disabled={checkoutLoading}
                        className="sr-only peer"
                      />
                      <div
                        className={`w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 ${checkoutLoading ? 'opacity-50' : ''}`}
                      >
                        {checkoutLoading && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Loader2 className="h-3 w-3 animate-spin text-white" />
                          </div>
                        )}
                      </div>
                    </label>
                  </div>
                </div>

                {checkoutV2Enabled && (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">
                      Recursos do Checkout v2:
                    </h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Interface mais intuitiva e responsiva</li>
                      <li>• Processamento de pagamento mais rápido</li>
                      <li>• Melhor integração com gateways de pagamento</li>
                      <li>• Suporte a múltiplas moedas</li>
                      <li>• Analytics avançados de conversão</li>
                    </ul>
                  </div>
                )}

                {/* Link de Visualização do Checkout */}
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-green-900 mb-1">
                        Visualizar Checkout
                      </h4>
                      <p className="text-sm text-green-800">
                        Teste a experiência completa de compra
                      </p>
                    </div>
                    <Button
                      onClick={() =>
                        window.open('/produto-demo-checkout', '_blank')
                      }
                      variant="outline"
                      size="sm"
                      className="border-green-300 text-green-700 hover:bg-green-100"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Abrir Demo
                    </Button>
                  </div>
                  <div className="mt-3 text-xs text-green-700">
                    <p>
                      URL:{' '}
                      <code className="bg-green-100 px-1 rounded">
                        /produto-demo-checkout
                      </code>
                    </p>
                    <p>Produto de teste: Camiseta Corporativa - Replicado</p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <CreditCard className="h-6 w-6 text-green-600" />
                    <div>
                      <h3 className="font-medium text-gray-900">
                        Pagamento Misto
                      </h3>
                      <p className="text-sm text-gray-600">
                        Permite combinar pontos e dinheiro no mesmo pedido
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Badge
                      variant={
                        config.features.mixedPayment ? 'default' : 'secondary'
                      }
                    >
                      {config.features.mixedPayment ? 'Ativo' : 'Inativo'}
                    </Badge>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={config.features.mixedPayment}
                        onChange={e =>
                          setConfig(prev => ({
                            ...prev,
                            features: {
                              ...prev.features,
                              mixedPayment: e.target.checked,
                            },
                          }))
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Configurações de Notificação</CardTitle>
                <CardDescription>
                  Configure como e quando enviar notificações
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="emailNotifications"
                      checked={config.features.emailNotifications}
                      onChange={e =>
                        setConfig(prev => ({
                          ...prev,
                          features: {
                            ...prev.features,
                            emailNotifications: e.target.checked,
                          },
                        }))
                      }
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor="emailNotifications"
                      className="text-sm font-medium text-gray-700"
                    >
                      Notificações por Email
                    </label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="smsNotifications"
                      checked={config.features.smsNotifications}
                      onChange={e =>
                        setConfig(prev => ({
                          ...prev,
                          features: {
                            ...prev.features,
                            smsNotifications: e.target.checked,
                          },
                        }))
                      }
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor="smsNotifications"
                      className="text-sm font-medium text-gray-700"
                    >
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
                <CardDescription>
                  Configure limites para pedidos e pagamentos
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Máximo de Pontos por Pedido
                    </label>
                    <Input
                      value={config.limits.maxPointsPerOrder}
                      onChange={e =>
                        setConfig(prev => ({
                          ...prev,
                          limits: {
                            ...prev.limits,
                            maxPointsPerOrder: parseInt(e.target.value) || 0,
                          },
                        }))
                      }
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
                      onChange={e =>
                        setConfig(prev => ({
                          ...prev,
                          limits: {
                            ...prev.limits,
                            maxCashPerOrder: parseInt(e.target.value) || 0,
                          },
                        }))
                      }
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
                      onChange={e =>
                        setConfig(prev => ({
                          ...prev,
                          limits: {
                            ...prev.limits,
                            minOrderValue: parseInt(e.target.value) || 0,
                          },
                        }))
                      }
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
                      onChange={e =>
                        setConfig(prev => ({
                          ...prev,
                          limits: {
                            ...prev.limits,
                            maxOrderValue: parseInt(e.target.value) || 0,
                          },
                        }))
                      }
                      type="number"
                      placeholder="10000"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Configurações de Analytics</CardTitle>
                <CardDescription>
                  Configure o rastreamento e análise de dados da sua loja
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <BarChart3 className="h-6 w-6 text-blue-600" />
                    <div>
                      <h3 className="font-medium text-gray-900">
                        Google Analytics
                      </h3>
                      <p className="text-sm text-gray-600">
                        Rastreamento avançado de visitantes e conversões
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Badge variant={analyticsEnabled ? 'default' : 'secondary'}>
                      {analyticsEnabled ? 'Ativo' : 'Inativo'}
                    </Badge>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={analyticsEnabled}
                        onChange={e => setAnalyticsEnabled(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Activity className="h-6 w-6 text-green-600" />
                    <div>
                      <h3 className="font-medium text-gray-900">
                        Relatórios em Tempo Real
                      </h3>
                      <p className="text-sm text-gray-600">
                        Monitoramento ao vivo de vendas e tráfego
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Badge variant="default">Sempre Ativo</Badge>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <TrendingUp className="h-6 w-6 text-purple-600" />
                    <div>
                      <h3 className="font-medium text-gray-900">
                        Análise de Conversão
                      </h3>
                      <p className="text-sm text-gray-600">
                        Funil de vendas e otimização de conversão
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Badge variant="default">Ativo</Badge>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <EyeIcon className="h-6 w-6 text-orange-600" />
                    <div>
                      <h3 className="font-medium text-gray-900">
                        Heatmaps e Gravações
                      </h3>
                      <p className="text-sm text-gray-600">
                        Comportamento do usuário em tempo real
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Badge variant="secondary">Em Breve</Badge>
                  </div>
                </div>

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">
                    Métricas Disponíveis:
                  </h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Vendas em tempo real</li>
                    <li>• Taxa de conversão</li>
                    <li>• Produtos mais vendidos</li>
                    <li>• Origem do tráfego</li>
                    <li>• Comportamento do usuário</li>
                    <li>• Tempo de sessão</li>
                    <li>• Taxa de rejeição</li>
                    <li>• Páginas mais visitadas</li>
                  </ul>
                </div>

                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h4 className="font-medium text-green-900 mb-2">
                    Relatórios Personalizados:
                  </h4>
                  <ul className="text-sm text-green-800 space-y-1">
                    <li>• Dashboard executivo</li>
                    <li>• Relatório de vendas por período</li>
                    <li>• Análise de produtos</li>
                    <li>• Relatório de clientes</li>
                    <li>• Exportação em PDF/Excel</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tag Gate Tab */}
        {activeTab === 'tag-gate' && (
          <div className="space-y-6">
            <TagGateSettings storeId={config.id} />
          </div>
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Configurações de Segurança</CardTitle>
                <CardDescription>
                  Proteja sua loja com configurações avançadas de segurança
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Shield className="h-6 w-6 text-green-600" />
                    <div>
                      <h3 className="font-medium text-gray-900">
                        Backup Automático
                      </h3>
                      <p className="text-sm text-gray-600">
                        Backup diário automático dos dados da loja
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Badge
                      variant={autoBackupEnabled ? 'default' : 'secondary'}
                    >
                      {autoBackupEnabled ? 'Ativo' : 'Inativo'}
                    </Badge>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={autoBackupEnabled}
                        onChange={e => setAutoBackupEnabled(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Bell className="h-6 w-6 text-orange-600" />
                    <div>
                      <h3 className="font-medium text-gray-900">
                        Alertas de Segurança
                      </h3>
                      <p className="text-sm text-gray-600">
                        Notificações para atividades suspeitas
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Badge
                      variant={notificationsEnabled ? 'default' : 'secondary'}
                    >
                      {notificationsEnabled ? 'Ativo' : 'Inativo'}
                    </Badge>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notificationsEnabled}
                        onChange={e =>
                          setNotificationsEnabled(e.target.checked)
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>

                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h4 className="font-medium text-green-900 mb-2">
                    Recursos de Segurança:
                  </h4>
                  <ul className="text-sm text-green-800 space-y-1">
                    <li>• Criptografia SSL/TLS</li>
                    <li>• Proteção contra ataques DDoS</li>
                    <li>• Monitoramento de tentativas de login</li>
                    <li>• Backup criptografado</li>
                    <li>• Conformidade com LGPD</li>
                  </ul>
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
                Última atualização:{' '}
                {new Date(config.lastUpdated).toLocaleString('pt-BR')}
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
