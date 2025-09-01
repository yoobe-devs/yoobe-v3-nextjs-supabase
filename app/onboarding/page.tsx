'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  CheckCircle, 
  ArrowRight, 
  ArrowLeft,
  Store,
  Users,
  Gift,
  Settings,
  Zap,
  Globe,
  Palette,
  Upload,
  Mail,
  Phone,
  MapPin,
  Building2,
  Rocket,
  Star,
  Target,
  BarChart3
} from 'lucide-react'
import { YoobeLogo } from '@/components/ui/yoobe-logo'

interface OnboardingData {
  storeName: string
  storeDomain: string
  storeDescription: string
  primaryColor: string
  logo: File | null
  address: string
  city: string
  state: string
  zipCode: string
  phone: string
  website: string
  integrations: string[]
  employeeCount: number
}

export default function OnboardingPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [step, setStep] = useState(1)
  const [accountData, setAccountData] = useState<{
    accountId: string | null
    storeUrl: string | null
  }>({
    accountId: null,
    storeUrl: null
  })

  // Verificar se veio do registro
  useEffect(() => {
    const accountId = searchParams.get('accountId')
    const storeUrl = searchParams.get('storeUrl')
    
    if (accountId && storeUrl) {
      setAccountData({ accountId, storeUrl })
      setStep(5) // Ir direto para a tela de boas-vindas
    }
  }, [searchParams])
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    storeName: '',
    storeDomain: '',
    storeDescription: '',
    primaryColor: '#3B82F6',
    logo: null,
    address: '',
    city: '',
    state: '',
    zipCode: '',
    phone: '',
    website: '',
    integrations: [],
    employeeCount: 0
  })

  const [isLoading, setIsLoading] = useState(false)

  const integrationOptions = [
    { id: 'workvivo', name: 'Workvivo', description: 'Reconhecimento e engajamento', icon: '🎯' },
    { id: 'applause', name: 'Applause', description: 'Feedback e avaliações', icon: '👏' },
    { id: 'human', name: 'Human', description: 'Desenvolvimento de pessoas', icon: '💪' },
    { id: 'zapier', name: 'Zapier', description: 'Automação de workflows', icon: '🔗' },
    { id: 'floui', name: 'Floui', description: 'Automação brasileira', icon: '🇧🇷' },
    { id: 'make', name: 'Make', description: 'Workflows avançados', icon: '⚙️' }
  ]

  const colorOptions = [
    { value: '#3B82F6', name: 'Azul', class: 'bg-blue-500' },
    { value: '#10B981', name: 'Verde', class: 'bg-green-500' },
    { value: '#F59E0B', name: 'Amarelo', class: 'bg-yellow-500' },
    { value: '#EF4444', name: 'Vermelho', class: 'bg-red-500' },
    { value: '#8B5CF6', name: 'Roxo', class: 'bg-purple-500' },
    { value: '#06B6D4', name: 'Ciano', class: 'bg-cyan-500' }
  ]

  const steps = [
    {
      id: 1,
      title: 'Configuração Básica',
      description: 'Informações fundamentais da sua loja',
      icon: Store
    },
    {
      id: 2,
      title: 'Personalização',
      description: 'Marca e identidade visual',
      icon: Palette
    },
    {
      id: 3,
      title: 'Integrações',
      description: 'Conecte com suas plataformas',
      icon: Zap
    },
    {
      id: 4,
      title: 'Finalização',
      description: 'Revise e ative sua loja',
      icon: Rocket
    },
    {
      id: 5,
      title: 'Boas-vindas',
      description: 'Sua loja está pronta!',
      icon: Rocket
    }
  ]

  const handleInputChange = (field: keyof OnboardingData, value: any) => {
    setOnboardingData(prev => ({ ...prev, [field]: value }))
  }

  const handleIntegrationToggle = (integrationId: string) => {
    setOnboardingData(prev => ({
      ...prev,
      integrations: prev.integrations.includes(integrationId)
        ? prev.integrations.filter(id => id !== integrationId)
        : [...prev.integrations, integrationId]
    }))
  }

  const handleNext = () => {
    if (step < 5) {
      setStep(step + 1)
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  const handleFinish = async () => {
    setIsLoading(true)
    
    try {
      // Simular configuração da loja
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      // Redirecionar para dashboard
      router.push('/gestor/dashboard')
    } catch (error) {
      console.error('Erro ao configurar loja:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="storeName">Nome da Loja *</Label>
              <Input
                id="storeName"
                value={onboardingData.storeName}
                onChange={(e) => handleInputChange('storeName', e.target.value)}
                placeholder="Ex: Loja Corporativa TechCorp"
              />
            </div>
            
            <div>
              <Label htmlFor="storeDomain">Domínio da Loja</Label>
              <div className="flex">
                <Input
                  id="storeDomain"
                  value={onboardingData.storeDomain}
                  onChange={(e) => handleInputChange('storeDomain', e.target.value)}
                  placeholder="techcorp"
                  className="rounded-r-none"
                />
                <div className="px-3 py-2 bg-gray-100 border border-l-0 border-gray-300 rounded-r-md text-gray-600">
                  .yoobe.com
                </div>
              </div>
            </div>
            
            <div>
              <Label htmlFor="storeDescription">Descrição da Loja</Label>
              <textarea
                id="storeDescription"
                value={onboardingData.storeDescription}
                onChange={(e) => handleInputChange('storeDescription', e.target.value)}
                placeholder="Descreva sua loja corporativa..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
            </div>
            
            <div>
              <Label htmlFor="employeeCount">Número de Funcionários *</Label>
              <Input
                id="employeeCount"
                type="number"
                value={onboardingData.employeeCount}
                onChange={(e) => handleInputChange('employeeCount', parseInt(e.target.value) || 0)}
                placeholder="150"
              />
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <Label>Cor Principal da Loja</Label>
              <div className="grid grid-cols-6 gap-3 mt-2">
                {colorOptions.map((color) => (
                  <div
                    key={color.value}
                    className={`w-12 h-12 rounded-full cursor-pointer border-2 ${
                      onboardingData.primaryColor === color.value
                        ? 'border-gray-900'
                        : 'border-gray-300'
                    }`}
                    style={{ backgroundColor: color.value }}
                    onClick={() => handleInputChange('primaryColor', color.value)}
                  />
                ))}
              </div>
            </div>
            
            <div>
              <Label htmlFor="logo">Logo da Empresa</Label>
              <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">
                  Arraste e solte sua logo aqui ou{' '}
                  <button className="text-blue-600 hover:underline">clique para selecionar</button>
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  PNG, JPG até 2MB
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  value={onboardingData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="(11) 99999-9999"
                />
              </div>
              
              <div>
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  value={onboardingData.website}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                  placeholder="https://empresa.com"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="address">Endereço</Label>
              <Input
                id="address"
                value={onboardingData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="Rua das Flores, 123"
              />
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="city">Cidade</Label>
                <Input
                  id="city"
                  value={onboardingData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  placeholder="São Paulo"
                />
              </div>
              
              <div>
                <Label htmlFor="state">Estado</Label>
                <Input
                  id="state"
                  value={onboardingData.state}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                  placeholder="SP"
                />
              </div>
              
              <div>
                <Label htmlFor="zipCode">CEP</Label>
                <Input
                  id="zipCode"
                  value={onboardingData.zipCode}
                  onChange={(e) => handleInputChange('zipCode', e.target.value)}
                  placeholder="01234-567"
                />
              </div>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Escolha suas Integrações</h3>
              <p className="text-gray-600 mb-6">
                Conecte com as plataformas que você já usa para sincronizar pontos automaticamente.
              </p>
              
              <div className="grid md:grid-cols-2 gap-4">
                {integrationOptions.map((integration) => (
                  <div
                    key={integration.id}
                    className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                      onboardingData.integrations.includes(integration.id)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleIntegrationToggle(integration.id)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">{integration.icon}</div>
                      <div className="flex-1">
                        <h4 className="font-semibold">{integration.name}</h4>
                        <p className="text-sm text-gray-600">{integration.description}</p>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 ${
                        onboardingData.integrations.includes(integration.id)
                          ? 'bg-blue-500 border-blue-500'
                          : 'border-gray-300'
                      }`}>
                        {onboardingData.integrations.includes(integration.id) && (
                          <CheckCircle className="w-4 h-4 text-white" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">💡 Dica</h4>
              <p className="text-sm text-blue-800">
                Você pode adicionar ou remover integrações a qualquer momento nas configurações da sua loja.
              </p>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Tudo pronto!</h3>
              <p className="text-gray-600">
                Sua loja está configurada e pronta para uso.
              </p>
            </div>
            
            <Card className="border-2 border-green-200 bg-green-50">
              <CardContent className="p-6">
                <h4 className="font-semibold text-green-900 mb-4">Resumo da Configuração</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Nome da Loja:</span>
                    <span className="font-semibold">{onboardingData.storeName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Domínio:</span>
                    <span className="font-semibold">{onboardingData.storeDomain}.yoobe.com</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Funcionários:</span>
                    <span className="font-semibold">{onboardingData.employeeCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Integrações:</span>
                    <span className="font-semibold">{onboardingData.integrations.length}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">🚀 Próximos Passos</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Cadastre seus funcionários</li>
                <li>• Configure produtos do catálogo</li>
                <li>• Personalize sua loja</li>
                <li>• Configure integrações</li>
              </ul>
            </div>
          </div>
        )

      case 5:
        return (
          <div className="text-center space-y-8">
            {/* Logo da empresa */}
            <div className="flex justify-center">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <Store className="w-12 h-12 text-white" />
              </div>
            </div>

            {/* Mensagem de boas-vindas */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                🎉 Parabéns! Sua loja está pronta!
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                Sua conta foi criada com sucesso e sua loja corporativa já está disponível.
              </p>
            </div>

            {/* Informações da loja */}
            <Card className="border-2 border-green-200 bg-green-50">
              <CardContent className="p-6">
                <h3 className="font-semibold text-green-900 mb-4">Sua Loja</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Endereço da Loja:</span>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-sm bg-white px-2 py-1 rounded border">
                        {accountData.storeUrl || 'sua-loja.yoobe.com'}
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => navigator.clipboard.writeText(accountData.storeUrl || '')}
                      >
                        Copiar
                      </Button>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <Badge className="bg-green-100 text-green-800">Ativa</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Plano:</span>
                    <span className="font-semibold">Professional</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Ações rápidas */}
            <div className="grid md:grid-cols-2 gap-4">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                onClick={() => router.push('/gestor/dashboard')}
              >
                <Store className="w-5 h-5 mr-2" />
                Acessar Painel da Loja
              </Button>
              
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => window.open(`https://${accountData.storeUrl}`, '_blank')}
              >
                <Globe className="w-5 h-5 mr-2" />
                Ver Loja Pública
              </Button>
            </div>

            {/* Próximos passos */}
            <div className="bg-blue-50 rounded-lg p-6">
              <h4 className="font-semibold text-blue-900 mb-4">🚀 Próximos Passos</h4>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    <span>Cadastrar funcionários</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    <span>Configurar produtos</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    <span>Personalizar loja</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    <span>Configurar integrações</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Suporte */}
            <div className="border-t pt-6">
              <p className="text-gray-600 mb-4">
                Precisa de ajuda? Nossa equipe está aqui para você!
              </p>
              <div className="flex justify-center space-x-4">
                <Button variant="outline" size="sm">
                  <Mail className="w-4 h-4 mr-2" />
                  Suporte por Email
                </Button>
                <Button variant="outline" size="sm">
                  <Phone className="w-4 h-4 mr-2" />
                  Falar com Especialista
                </Button>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="mb-4">
            <YoobeLogo size={40} variant="default" />
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Configurar sua Loja</h1>
          <p className="text-gray-600">Vamos configurar sua loja corporativa em poucos passos</p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Steps Sidebar */}
            <div className="lg:col-span-1">
              <Card className="border-0 shadow-lg sticky top-8">
                <CardHeader>
                  <CardTitle className="text-lg">Progresso</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {steps.map((stepItem) => {
                      const StepIcon = stepItem.icon
                      return (
                        <div key={stepItem.id} className="flex items-start space-x-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                            step >= stepItem.id 
                              ? 'bg-blue-600 text-white' 
                              : 'bg-gray-200 text-gray-600'
                          }`}>
                            {step > stepItem.id ? <CheckCircle className="w-4 h-4" /> : stepItem.id}
                          </div>
                          <div className="flex-1">
                            <h4 className={`font-medium text-sm ${
                              step >= stepItem.id ? 'text-gray-900' : 'text-gray-600'
                            }`}>
                              {stepItem.title}
                            </h4>
                            <p className="text-xs text-gray-500 mt-1">
                              {stepItem.description}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-2xl">{steps[step - 1].title}</CardTitle>
                  <CardDescription>{steps[step - 1].description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {getStepContent()}

                  {/* Navigation Buttons */}
                  {step !== 5 && (
                    <div className="flex justify-between pt-6">
                      {step > 1 && (
                        <Button variant="outline" onClick={handleBack}>
                          <ArrowLeft className="w-4 h-4 mr-2" />
                          Voltar
                        </Button>
                      )}
                      
                      <div className="ml-auto">
                        {step < 4 ? (
                          <Button onClick={handleNext}>
                            Próximo
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </Button>
                        ) : (
                          <Button 
                            onClick={handleFinish}
                            disabled={isLoading}
                            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                          >
                            {isLoading ? 'Configurando...' : 'Ativar Loja'}
                            <Rocket className="w-4 h-4 ml-2" />
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
