'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  MapPin, 
  CheckCircle, 
  Globe, 
  Navigation, 
  Search,
  ArrowRight,
  ExternalLink,
  BookOpen,
  Code,
  Database,
  Settings,
  BarChart3,
  User,
  Building,
  Package,
  FileText,
  FileCheck,
  Zap,
  AlertTriangle,
  Shield,
  Mail,
  Phone,
  Home,
  CreditCard
} from 'lucide-react'
import Link from 'next/link'

export default function AddressManagementPage() {
  const [activeTab, setActiveTab] = useState('overview')

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <MapPin className="h-8 w-8 text-blue-600" />
            Gestão de Endereços v3.0.0
          </h1>
          <p className="text-gray-600 mt-2">
            Sistema completo de gestão de endereços múltiplos com validação e padrão único
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            Ativo
          </Badge>
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            <Code className="h-3 w-3 mr-1" />
            v3.0.0
          </Badge>
        </div>
      </div>

      {/* Navigation Breadcrumb */}
      <nav className="flex items-center space-x-2 text-sm text-gray-500">
        <Link href="/docs" className="hover:text-blue-600">Documentação</Link>
        <ArrowRight className="h-4 w-4" />
        <span className="text-gray-900 font-medium">Gestão de Endereços</span>
      </nav>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="workflow">Fluxo de Gestão</TabsTrigger>
          <TabsTrigger value="features">Funcionalidades</TabsTrigger>
          <TabsTrigger value="api">API Reference</TabsTrigger>
          <TabsTrigger value="examples">Exemplos</TabsTrigger>
          <TabsTrigger value="troubleshooting">Troubleshooting</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-blue-600" />
                Visão Geral do Sistema
              </CardTitle>
              <CardDescription>
                Sistema completo de gestão de endereços com validação automática e padrão único
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900">Características Principais</h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Múltiplos endereços por usuário
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Validação automática de CEP
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Padrão único de endereços
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Integração com checkout
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Geocodificação automática
                    </li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900">Tecnologias Utilizadas</h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center gap-2">
                      <Code className="h-4 w-4 text-blue-500" />
                      Next.js 14 + TypeScript
                    </li>
                    <li className="flex items-center gap-2">
                      <Database className="h-4 w-4 text-green-500" />
                      Supabase (PostgreSQL)
                    </li>
                    <li className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-purple-500" />
                      API de CEP e geocodificação
                    </li>
                    <li className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-orange-500" />
                      RLS (Row Level Security)
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Address Types */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Navigation className="h-5 w-5 text-blue-600" />
                Tipos de Endereço
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Home className="h-6 w-6 text-blue-600" />
                  </div>
                  <h4 className="font-medium text-gray-900">Residencial</h4>
                  <p className="text-sm text-gray-600">Endereço de casa</p>
                  <Badge className="mt-2 bg-blue-100 text-blue-800">Padrão</Badge>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Building className="h-6 w-6 text-green-600" />
                  </div>
                  <h4 className="font-medium text-gray-900">Comercial</h4>
                  <p className="text-sm text-gray-600">Endereço de trabalho</p>
                  <Badge className="mt-2 bg-green-100 text-green-800">Empresa</Badge>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Package className="h-6 w-6 text-purple-600" />
                  </div>
                  <h4 className="font-medium text-gray-900">Entrega</h4>
                  <p className="text-sm text-gray-600">Endereço para envios</p>
                  <Badge className="mt-2 bg-purple-100 text-purple-800">Logística</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Workflow Tab */}
        <TabsContent value="workflow" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5 text-blue-600" />
                Fluxo de Gestão
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Address Management Flow */}
                <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-blue-600 font-bold">1</span>
                    </div>
                    <h4 className="font-medium text-sm">Entrada</h4>
                    <p className="text-xs text-gray-500">Usuário digita CEP</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-yellow-600 font-bold">2</span>
                    </div>
                    <h4 className="font-medium text-sm">Validação</h4>
                    <p className="text-xs text-gray-500">API valida CEP</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-purple-600 font-bold">3</span>
                    </div>
                    <h4 className="font-medium text-sm">Preenchimento</h4>
                    <p className="text-xs text-gray-500">Campos automáticos</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-green-600 font-bold">4</span>
                    </div>
                    <h4 className="font-medium text-sm">Complemento</h4>
                    <p className="text-xs text-gray-500">Usuário adiciona</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-orange-600 font-bold">5</span>
                    </div>
                    <h4 className="font-medium text-sm">Geocodificação</h4>
                    <p className="text-xs text-gray-500">Coordenadas</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-red-600 font-bold">6</span>
                    </div>
                    <h4 className="font-medium text-sm">Salvamento</h4>
                    <p className="text-xs text-gray-500">Banco de dados</p>
                  </div>
                </div>

                <Separator />

                {/* Address Structure */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Estrutura do Endereço</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-green-100 text-green-800">CEP</Badge>
                        <span className="text-sm text-gray-600">Código postal brasileiro</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-blue-100 text-blue-800">Logradouro</Badge>
                        <span className="text-sm text-gray-600">Rua, avenida, etc.</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-purple-100 text-purple-800">Número</Badge>
                        <span className="text-sm text-gray-600">Número do endereço</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Bairro</Badge>
                        <span className="text-sm text-gray-600">Bairro da cidade</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-orange-100 text-orange-800">Cidade/UF</Badge>
                        <span className="text-sm text-gray-600">Cidade e estado</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-red-100 text-red-800">Complemento</Badge>
                        <span className="text-sm text-gray-600">Apto, sala, etc.</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Features Tab */}
        <TabsContent value="features" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Core Features */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-blue-600" />
                  Funcionalidades Principais
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <h5 className="font-medium text-gray-900">Validação Automática</h5>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Validação de CEP via API</li>
                    <li>• Preenchimento automático de campos</li>
                    <li>• Verificação de endereços válidos</li>
                    <li>• Correção de erros comuns</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h5 className="font-medium text-gray-900">Gestão de Endereços</h5>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Múltiplos endereços por usuário</li>
                    <li>• Tipos de endereço configuráveis</li>
                    <li>• Endereço padrão definível</li>
                    <li>• Histórico de endereços</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Advanced Features */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-yellow-600" />
                  Funcionalidades Avançadas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <h5 className="font-medium text-gray-900">Geocodificação</h5>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Conversão para coordenadas</li>
                    <li>• Cálculo de distâncias</li>
                    <li>• Mapas interativos</li>
                    <li>• Roteirização</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h5 className="font-medium text-gray-900">Integrações</h5>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Checkout automático</li>
                    <li>• Cálculo de frete</li>
                    <li>• Validação de entrega</li>
                    <li>• APIs de terceiros</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* API Reference Tab */}
        <TabsContent value="api" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5 text-blue-600" />
                Referência da API
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Endpoints Principais</h4>
                  <div className="space-y-2">
                    <div className="bg-gray-50 p-3 rounded">
                      <code className="text-sm">
                        <span className="text-green-600">POST</span> /api/addresses
                        <span className="text-gray-500 ml-2">- Criar endereço</span>
                      </code>
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                      <code className="text-sm">
                        <span className="text-blue-600">GET</span> /api/addresses
                        <span className="text-gray-500 ml-2">- Listar endereços</span>
                      </code>
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                      <code className="text-sm">
                        <span className="text-yellow-600">GET</span> /api/addresses/validate/{'{cep}'}
                        <span className="text-gray-500 ml-2">- Validar CEP</span>
                      </code>
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                      <code className="text-sm">
                        <span className="text-purple-600">PUT</span> /api/addresses/{'{id}'}
                        <span className="text-gray-500 ml-2">- Atualizar endereço</span>
                      </code>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Modelos de Dados</h4>
                  <div className="bg-gray-50 p-4 rounded">
                    <pre className="text-sm text-gray-700">
{`interface Address {
  id: string
  user_id: string
  type: 'residential' | 'commercial' | 'delivery'
  cep: string
  logradouro: string
  numero: string
  complemento?: string
  bairro: string
  cidade: string
  uf: string
  is_default: boolean
  coordinates?: {
    lat: number
    lng: number
  }
  created_at: string
  updated_at: string
}

interface CEPValidation {
  cep: string
  logradouro: string
  bairro: string
  cidade: string
  uf: string
  valid: boolean
}`}
                    </pre>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Examples Tab */}
        <TabsContent value="examples" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileCheck className="h-5 w-5 text-blue-600" />
                Exemplos de Uso
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Validar CEP e Preencher Endereço</h4>
                  <div className="bg-gray-50 p-4 rounded">
                    <pre className="text-sm text-gray-700">
{`// Validar CEP e preencher automaticamente
const validateCEP = async (cep: string) => {
  const response = await fetch(\`/api/addresses/validate/\${cep}\`)
  const data = await response.json()
  
  if (data.valid) {
    // Preencher campos automaticamente
    setFormData({
      logradouro: data.logradouro,
      bairro: data.bairro,
      cidade: data.cidade,
      uf: data.uf
    })
  } else {
    showError('CEP inválido')
  }
}

// Usar no input de CEP
<input 
  type="text" 
  placeholder="00000-000"
  onBlur={(e) => validateCEP(e.target.value)}
/>`}
                    </pre>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Criar Novo Endereço</h4>
                  <div className="bg-gray-50 p-4 rounded">
                    <pre className="text-sm text-gray-700">
{`// Criar novo endereço
const createAddress = async (addressData: AddressFormData) => {
  const response = await fetch('/api/addresses', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: 'residential',
      cep: addressData.cep,
      logradouro: addressData.logradouro,
      numero: addressData.numero,
      complemento: addressData.complemento,
      bairro: addressData.bairro,
      cidade: addressData.cidade,
      uf: addressData.uf,
      is_default: addressData.is_default
    })
  })

  const newAddress = await response.json()
  console.log('Endereço criado:', newAddress.id)
}`}
                    </pre>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Listar Endereços do Usuário</h4>
                  <div className="bg-gray-50 p-4 rounded">
                    <pre className="text-sm text-gray-700">
{`// Listar endereços do usuário
const getUserAddresses = async () => {
  const response = await fetch('/api/addresses?user_id=user_123')
  const addresses = await response.json()
  
  // Separar por tipo
  const residential = addresses.filter(addr => addr.type === 'residential')
  const commercial = addresses.filter(addr => addr.type === 'commercial')
  const delivery = addresses.filter(addr => addr.type === 'delivery')
  
  // Encontrar endereço padrão
  const defaultAddress = addresses.find(addr => addr.is_default)
  
  return { addresses, residential, commercial, delivery, defaultAddress }
}`}
                    </pre>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Calcular Distância Entre Endereços</h4>
                  <div className="bg-gray-50 p-4 rounded">
                    <pre className="text-sm text-gray-700">
{`// Calcular distância entre dois endereços
const calculateDistance = (address1: Address, address2: Address) => {
  if (!address1.coordinates || !address2.coordinates) {
    return null
  }
  
  const lat1 = address1.coordinates.lat
  const lng1 = address1.coordinates.lng
  const lat2 = address2.coordinates.lat
  const lng2 = address2.coordinates.lng
  
  // Fórmula de Haversine para calcular distância
  const R = 6371 // Raio da Terra em km
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng/2) * Math.sin(dLng/2)
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  const distance = R * c
  
  return distance.toFixed(2) // Distância em km
}`}
                    </pre>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Troubleshooting Tab */}
        <TabsContent value="troubleshooting" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-blue-600" />
                Troubleshooting
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Problemas Comuns</h4>
                  <div className="space-y-3">
                    <div className="border-l-4 border-yellow-400 pl-4">
                      <h5 className="font-medium text-gray-900">CEP não é validado</h5>
                      <p className="text-sm text-gray-600">Verificar conexão com API de CEP, formato do CEP e limites de requisição.</p>
                    </div>
                    <div className="border-l-4 border-red-400 pl-4">
                      <h5 className="font-medium text-gray-900">Endereço não é salvo</h5>
                      <p className="text-sm text-gray-600">Verificar permissões do usuário, validação de dados e conexão com banco.</p>
                    </div>
                    <div className="border-l-4 border-blue-400 pl-4">
                      <h5 className="font-medium text-gray-900">Geocodificação falha</h5>
                      <p className="text-sm text-gray-600">Verificar API de geocodificação, formato de endereço e limites de uso.</p>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Comandos de Diagnóstico</h4>
                  <div className="space-y-2">
                    <div className="bg-gray-50 p-3 rounded">
                      <code className="text-sm">
                        curl -X GET "http://localhost:3000/api/addresses/health"
                        <span className="text-gray-500 ml-2">- Verificar saúde do sistema</span>
                      </code>
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                      <code className="text-sm">
                        curl -X GET "http://localhost:3000/api/addresses/validate/01310-100"
                        <span className="text-gray-500 ml-2">- Testar validação de CEP</span>
                      </code>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Related Documentation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ExternalLink className="h-5 w-5 text-blue-600" />
            Documentação Relacionada
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/docs/CHECKOUT_SYSTEM" className="block">
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Package className="h-5 w-5 text-blue-600" />
                    <h4 className="font-medium">Sistema de Checkout</h4>
                  </div>
                  <p className="text-sm text-gray-600">Integração com endereços de entrega</p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/docs/WALLET_SYSTEM" className="block">
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CreditCard className="h-5 w-5 text-green-600" />
                    <h4 className="font-medium">Sistema de Carteira</h4>
                  </div>
                  <p className="text-sm text-gray-600">Gestão de endereços de cobrança</p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/docs/QUOTES_SYSTEM" className="block">
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="h-5 w-5 text-purple-600" />
                    <h4 className="font-medium">Sistema de Orçamentos</h4>
                  </div>
                  <p className="text-sm text-gray-600">Endereços para orçamentos</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
