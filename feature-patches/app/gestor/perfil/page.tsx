'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Building2,
  MapPin,
  CreditCard,
  FileText,
  Mail,
  Phone,
  Globe,
  Save,
  Edit,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  User,
  Shield,
  Settings,
  Upload,
} from 'lucide-react'
import { toast } from 'sonner'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

interface CompanyData {
  // Dados básicos
  id: string
  name: string
  email: string
  phone: string
  website: string
  description: string

  // Endereço principal
  address: {
    street: string
    number: string
    complement: string
    neighborhood: string
    city: string
    state: string
    zipCode: string
    country: string
  }

  // Endereço de cobrança
  billingAddress: {
    street: string
    number: string
    complement: string
    neighborhood: string
    city: string
    state: string
    zipCode: string
    country: string
  }

  // Dados fiscais
  fiscal: {
    cnpj: string
    ie: string // Inscrição Estadual
    im: string // Inscrição Municipal
    regime: 'simples' | 'presumido' | 'real'
    cnae: string
  }

  // Dados para recebimento de notas fiscais
  nfe: {
    email: string
    phone: string
    responsible: string
    cpf: string
  }

  // Dados bancários
  bank: {
    bankCode: string
    bankName: string
    agency: string
    account: string
    accountType: 'corrente' | 'poupanca'
    pix: string
  }

  // Status
  status: 'active' | 'inactive' | 'pending'
  verified: boolean
  createdAt: string
  updatedAt: string
}

export default function GestorPerfilPage() {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState(false)
  const [showSensitiveData, setShowSensitiveData] = useState(false)

  const [companyData, setCompanyData] = useState<CompanyData>({
    id: '',
    name: '',
    email: '',
    phone: '',
    website: '',
    description: '',
    address: {
      street: '',
      number: '',
      complement: '',
      neighborhood: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'Brasil',
    },
    billingAddress: {
      street: '',
      number: '',
      complement: '',
      neighborhood: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'Brasil',
    },
    fiscal: {
      cnpj: '',
      ie: '',
      im: '',
      regime: 'simples',
      cnae: '',
    },
    nfe: {
      email: '',
      phone: '',
      responsible: '',
      cpf: '',
    },
    bank: {
      bankCode: '',
      bankName: '',
      agency: '',
      account: '',
      accountType: 'corrente',
      pix: '',
    },
    status: 'active',
    verified: false,
    createdAt: '',
    updatedAt: '',
  })

  useEffect(() => {
    loadCompanyData()
  }, [])

  const loadCompanyData = async () => {
    try {
      setLoading(true)

      const response = await fetch('/api/gestor/empresa')
      if (!response.ok) {
        throw new Error('Erro ao carregar dados da empresa')
      }

      const { company } = await response.json()

      if (company) {
        // Mapear dados da API para o formato da interface
        const mappedData: CompanyData = {
          id: company.id,
          name: company.name || '',
          email: company.email || '',
          phone: company.phone || '',
          website: company.website || '',
          description: company.description || '',
          address: company.address || {
            street: '',
            number: '',
            complement: '',
            neighborhood: '',
            city: '',
            state: '',
            zipCode: '',
            country: 'Brasil',
          },
          billingAddress: company.billing_address || {
            street: '',
            number: '',
            complement: '',
            neighborhood: '',
            city: '',
            state: '',
            zipCode: '',
            country: 'Brasil',
          },
          fiscal: company.fiscal_data || {
            cnpj: '',
            ie: '',
            im: '',
            regime: 'simples',
            cnae: '',
          },
          nfe: company.nfe_data || {
            email: '',
            phone: '',
            responsible: '',
            cpf: '',
          },
          bank: company.bank_data || {
            bankCode: '',
            bankName: '',
            agency: '',
            account: '',
            accountType: 'corrente',
            pix: '',
          },
          status: company.status || 'active',
          verified: company.verified || false,
          createdAt: company.created_at || '',
          updatedAt: company.updated_at || '',
        }

        setCompanyData(mappedData)
      }
    } catch (error) {
      console.error('Erro ao carregar dados da empresa:', error)
      toast.error('Erro ao carregar dados da empresa')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)

      const response = await fetch('/api/gestor/empresa', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: companyData.name,
          email: companyData.email,
          phone: companyData.phone,
          website: companyData.website,
          description: companyData.description,
          address: companyData.address,
          billingAddress: companyData.billingAddress,
          fiscal: companyData.fiscal,
          nfe: companyData.nfe,
          bank: companyData.bank,
        }),
      })

      if (!response.ok) {
        throw new Error('Erro ao salvar dados da empresa')
      }

      const { company } = await response.json()

      // Atualizar dados locais
      setCompanyData(prev => ({
        ...prev,
        ...company,
        updatedAt: new Date().toISOString(),
      }))

      toast.success('Dados da empresa salvos com sucesso!')
      setEditing(false)
    } catch (error) {
      console.error('Erro ao salvar dados:', error)
      toast.error('Erro ao salvar dados da empresa')
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (section: string, field: string, value: string) => {
    setCompanyData(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof CompanyData],
        [field]: value,
      },
    }))
  }

  const formatCNPJ = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/^(\d{2})(\d)/, '$1.$2')
      .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
      .replace(/\.(\d{3})(\d)/, '.$1/$2')
      .replace(/(\d{4})(\d)/, '$1-$2')
  }

  const formatCPF = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/^(\d{3})(\d)/, '$1.$2')
      .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
      .replace(/\.(\d{3})(\d)/, '.$1-$2')
  }

  const formatCEP = (value: string) => {
    return value.replace(/\D/g, '').replace(/^(\d{5})(\d)/, '$1-$2')
  }

  const formatPhone = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/^(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4})(\d)/, '$1-$2')
      .replace(/(\d{5})(\d)/, '$1-$2')
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Carregando dados da empresa...</p>
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
          <h1 className="text-3xl font-bold text-gray-900">
            Perfil da Empresa
          </h1>
          <p className="text-gray-600">
            Gerencie os dados completos da sua empresa
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => setShowSensitiveData(!showSensitiveData)}
          >
            {showSensitiveData ? (
              <EyeOff className="h-4 w-4 mr-2" />
            ) : (
              <Eye className="h-4 w-4 mr-2" />
            )}
            {showSensitiveData ? 'Ocultar' : 'Mostrar'} Dados Sensíveis
          </Button>
          {editing ? (
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setEditing(false)}
                disabled={saving}
              >
                Cancelar
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Salvar
                  </>
                )}
              </Button>
            </div>
          ) : (
            <Button onClick={() => setEditing(true)}>
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>
          )}
        </div>
      </div>

      {/* Status Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <Building2 className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  {companyData.name}
                </h3>
                <p className="text-gray-600">{companyData.email}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge
                    variant={companyData.verified ? 'default' : 'secondary'}
                    className={
                      companyData.verified
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }
                  >
                    {companyData.verified ? (
                      <>
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Verificada
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Pendente Verificação
                      </>
                    )}
                  </Badge>
                  <Badge
                    variant={
                      companyData.status === 'active' ? 'default' : 'secondary'
                    }
                    className={
                      companyData.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }
                  >
                    {companyData.status === 'active' ? 'Ativa' : 'Inativa'}
                  </Badge>
                </div>
              </div>
            </div>
            <div className="text-right text-sm text-gray-500">
              <p>Última atualização:</p>
              <p>
                {new Date(companyData.updatedAt).toLocaleDateString('pt-BR')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="basicos" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="basicos">Básicos</TabsTrigger>
          <TabsTrigger value="endereco">Endereço</TabsTrigger>
          <TabsTrigger value="cobranca">Cobrança</TabsTrigger>
          <TabsTrigger value="fiscal">Fiscal</TabsTrigger>
          <TabsTrigger value="nfe">NFe</TabsTrigger>
          <TabsTrigger value="banco">Banco</TabsTrigger>
        </TabsList>

        {/* Dados Básicos */}
        <TabsContent value="basicos" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Dados Básicos da Empresa
              </CardTitle>
              <CardDescription>
                Informações principais da empresa
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome da Empresa *</Label>
                  <Input
                    id="name"
                    value={companyData.name}
                    onChange={e =>
                      setCompanyData(prev => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    disabled={!editing}
                    placeholder="Nome da empresa"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={companyData.email}
                    onChange={e =>
                      setCompanyData(prev => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                    disabled={!editing}
                    placeholder="contato@empresa.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone *</Label>
                  <Input
                    id="phone"
                    value={companyData.phone}
                    onChange={e =>
                      setCompanyData(prev => ({
                        ...prev,
                        phone: formatPhone(e.target.value),
                      }))
                    }
                    disabled={!editing}
                    placeholder="(11) 99999-9999"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={companyData.website}
                    onChange={e =>
                      setCompanyData(prev => ({
                        ...prev,
                        website: e.target.value,
                      }))
                    }
                    disabled={!editing}
                    placeholder="https://empresa.com"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Descrição da Empresa</Label>
                <Textarea
                  id="description"
                  value={companyData.description}
                  onChange={e =>
                    setCompanyData(prev => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  disabled={!editing}
                  placeholder="Descreva a empresa e suas atividades..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Endereço Principal */}
        <TabsContent value="endereco" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Endereço Principal
              </CardTitle>
              <CardDescription>Endereço da sede da empresa</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="address.street">Rua/Avenida *</Label>
                  <Input
                    id="address.street"
                    value={companyData.address.street}
                    onChange={e =>
                      handleInputChange('address', 'street', e.target.value)
                    }
                    disabled={!editing}
                    placeholder="Nome da rua ou avenida"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address.number">Número *</Label>
                  <Input
                    id="address.number"
                    value={companyData.address.number}
                    onChange={e =>
                      handleInputChange('address', 'number', e.target.value)
                    }
                    disabled={!editing}
                    placeholder="123"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address.complement">Complemento</Label>
                  <Input
                    id="address.complement"
                    value={companyData.address.complement}
                    onChange={e =>
                      handleInputChange('address', 'complement', e.target.value)
                    }
                    disabled={!editing}
                    placeholder="Sala 45, Andar 2"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address.neighborhood">Bairro *</Label>
                  <Input
                    id="address.neighborhood"
                    value={companyData.address.neighborhood}
                    onChange={e =>
                      handleInputChange(
                        'address',
                        'neighborhood',
                        e.target.value
                      )
                    }
                    disabled={!editing}
                    placeholder="Centro"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address.city">Cidade *</Label>
                  <Input
                    id="address.city"
                    value={companyData.address.city}
                    onChange={e =>
                      handleInputChange('address', 'city', e.target.value)
                    }
                    disabled={!editing}
                    placeholder="São Paulo"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address.state">Estado *</Label>
                  <Select
                    value={companyData.address.state}
                    onValueChange={value =>
                      handleInputChange('address', 'state', value)
                    }
                    disabled={!editing}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AC">Acre</SelectItem>
                      <SelectItem value="AL">Alagoas</SelectItem>
                      <SelectItem value="AP">Amapá</SelectItem>
                      <SelectItem value="AM">Amazonas</SelectItem>
                      <SelectItem value="BA">Bahia</SelectItem>
                      <SelectItem value="CE">Ceará</SelectItem>
                      <SelectItem value="DF">Distrito Federal</SelectItem>
                      <SelectItem value="ES">Espírito Santo</SelectItem>
                      <SelectItem value="GO">Goiás</SelectItem>
                      <SelectItem value="MA">Maranhão</SelectItem>
                      <SelectItem value="MT">Mato Grosso</SelectItem>
                      <SelectItem value="MS">Mato Grosso do Sul</SelectItem>
                      <SelectItem value="MG">Minas Gerais</SelectItem>
                      <SelectItem value="PA">Pará</SelectItem>
                      <SelectItem value="PB">Paraíba</SelectItem>
                      <SelectItem value="PR">Paraná</SelectItem>
                      <SelectItem value="PE">Pernambuco</SelectItem>
                      <SelectItem value="PI">Piauí</SelectItem>
                      <SelectItem value="RJ">Rio de Janeiro</SelectItem>
                      <SelectItem value="RN">Rio Grande do Norte</SelectItem>
                      <SelectItem value="RS">Rio Grande do Sul</SelectItem>
                      <SelectItem value="RO">Rondônia</SelectItem>
                      <SelectItem value="RR">Roraima</SelectItem>
                      <SelectItem value="SC">Santa Catarina</SelectItem>
                      <SelectItem value="SP">São Paulo</SelectItem>
                      <SelectItem value="SE">Sergipe</SelectItem>
                      <SelectItem value="TO">Tocantins</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address.zipCode">CEP *</Label>
                  <Input
                    id="address.zipCode"
                    value={companyData.address.zipCode}
                    onChange={e =>
                      handleInputChange(
                        'address',
                        'zipCode',
                        formatCEP(e.target.value)
                      )
                    }
                    disabled={!editing}
                    placeholder="01234-567"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address.country">País *</Label>
                  <Input
                    id="address.country"
                    value={companyData.address.country}
                    onChange={e =>
                      handleInputChange('address', 'country', e.target.value)
                    }
                    disabled={!editing}
                    placeholder="Brasil"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Endereço de Cobrança */}
        <TabsContent value="cobranca" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Endereço de Cobrança
              </CardTitle>
              <CardDescription>
                Endereço para envio de faturas e cobranças
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="billingAddress.street">Rua/Avenida *</Label>
                  <Input
                    id="billingAddress.street"
                    value={companyData.billingAddress.street}
                    onChange={e =>
                      handleInputChange(
                        'billingAddress',
                        'street',
                        e.target.value
                      )
                    }
                    disabled={!editing}
                    placeholder="Nome da rua ou avenida"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="billingAddress.number">Número *</Label>
                  <Input
                    id="billingAddress.number"
                    value={companyData.billingAddress.number}
                    onChange={e =>
                      handleInputChange(
                        'billingAddress',
                        'number',
                        e.target.value
                      )
                    }
                    disabled={!editing}
                    placeholder="123"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="billingAddress.complement">Complemento</Label>
                  <Input
                    id="billingAddress.complement"
                    value={companyData.billingAddress.complement}
                    onChange={e =>
                      handleInputChange(
                        'billingAddress',
                        'complement',
                        e.target.value
                      )
                    }
                    disabled={!editing}
                    placeholder="Sala 45, Andar 2"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="billingAddress.neighborhood">Bairro *</Label>
                  <Input
                    id="billingAddress.neighborhood"
                    value={companyData.billingAddress.neighborhood}
                    onChange={e =>
                      handleInputChange(
                        'billingAddress',
                        'neighborhood',
                        e.target.value
                      )
                    }
                    disabled={!editing}
                    placeholder="Centro"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="billingAddress.city">Cidade *</Label>
                  <Input
                    id="billingAddress.city"
                    value={companyData.billingAddress.city}
                    onChange={e =>
                      handleInputChange(
                        'billingAddress',
                        'city',
                        e.target.value
                      )
                    }
                    disabled={!editing}
                    placeholder="São Paulo"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="billingAddress.state">Estado *</Label>
                  <Select
                    value={companyData.billingAddress.state}
                    onValueChange={value =>
                      handleInputChange('billingAddress', 'state', value)
                    }
                    disabled={!editing}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AC">Acre</SelectItem>
                      <SelectItem value="AL">Alagoas</SelectItem>
                      <SelectItem value="AP">Amapá</SelectItem>
                      <SelectItem value="AM">Amazonas</SelectItem>
                      <SelectItem value="BA">Bahia</SelectItem>
                      <SelectItem value="CE">Ceará</SelectItem>
                      <SelectItem value="DF">Distrito Federal</SelectItem>
                      <SelectItem value="ES">Espírito Santo</SelectItem>
                      <SelectItem value="GO">Goiás</SelectItem>
                      <SelectItem value="MA">Maranhão</SelectItem>
                      <SelectItem value="MT">Mato Grosso</SelectItem>
                      <SelectItem value="MS">Mato Grosso do Sul</SelectItem>
                      <SelectItem value="MG">Minas Gerais</SelectItem>
                      <SelectItem value="PA">Pará</SelectItem>
                      <SelectItem value="PB">Paraíba</SelectItem>
                      <SelectItem value="PR">Paraná</SelectItem>
                      <SelectItem value="PE">Pernambuco</SelectItem>
                      <SelectItem value="PI">Piauí</SelectItem>
                      <SelectItem value="RJ">Rio de Janeiro</SelectItem>
                      <SelectItem value="RN">Rio Grande do Norte</SelectItem>
                      <SelectItem value="RS">Rio Grande do Sul</SelectItem>
                      <SelectItem value="RO">Rondônia</SelectItem>
                      <SelectItem value="RR">Roraima</SelectItem>
                      <SelectItem value="SC">Santa Catarina</SelectItem>
                      <SelectItem value="SP">São Paulo</SelectItem>
                      <SelectItem value="SE">Sergipe</SelectItem>
                      <SelectItem value="TO">Tocantins</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="billingAddress.zipCode">CEP *</Label>
                  <Input
                    id="billingAddress.zipCode"
                    value={companyData.billingAddress.zipCode}
                    onChange={e =>
                      handleInputChange(
                        'billingAddress',
                        'zipCode',
                        formatCEP(e.target.value)
                      )
                    }
                    disabled={!editing}
                    placeholder="01234-567"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="billingAddress.country">País *</Label>
                  <Input
                    id="billingAddress.country"
                    value={companyData.billingAddress.country}
                    onChange={e =>
                      handleInputChange(
                        'billingAddress',
                        'country',
                        e.target.value
                      )
                    }
                    disabled={!editing}
                    placeholder="Brasil"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Dados Fiscais */}
        <TabsContent value="fiscal" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Dados Fiscais
              </CardTitle>
              <CardDescription>Informações fiscais da empresa</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fiscal.cnpj">CNPJ *</Label>
                  <Input
                    id="fiscal.cnpj"
                    value={
                      showSensitiveData
                        ? companyData.fiscal.cnpj
                        : '••.•••.•••/••••-••'
                    }
                    onChange={e =>
                      handleInputChange(
                        'fiscal',
                        'cnpj',
                        formatCNPJ(e.target.value)
                      )
                    }
                    disabled={!editing}
                    placeholder="12.345.678/0001-90"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fiscal.ie">Inscrição Estadual *</Label>
                  <Input
                    id="fiscal.ie"
                    value={
                      showSensitiveData
                        ? companyData.fiscal.ie
                        : '•••.•••.•••.•••'
                    }
                    onChange={e =>
                      handleInputChange('fiscal', 'ie', e.target.value)
                    }
                    disabled={!editing}
                    placeholder="123.456.789.012"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fiscal.im">Inscrição Municipal</Label>
                  <Input
                    id="fiscal.im"
                    value={
                      showSensitiveData ? companyData.fiscal.im : '•••••••••'
                    }
                    onChange={e =>
                      handleInputChange('fiscal', 'im', e.target.value)
                    }
                    disabled={!editing}
                    placeholder="987654321"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fiscal.regime">Regime Tributário *</Label>
                  <Select
                    value={companyData.fiscal.regime}
                    onValueChange={value =>
                      handleInputChange('fiscal', 'regime', value)
                    }
                    disabled={!editing}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o regime" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="simples">Simples Nacional</SelectItem>
                      <SelectItem value="presumido">Lucro Presumido</SelectItem>
                      <SelectItem value="real">Lucro Real</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="fiscal.cnae">CNAE Principal</Label>
                  <Input
                    id="fiscal.cnae"
                    value={companyData.fiscal.cnae}
                    onChange={e =>
                      handleInputChange('fiscal', 'cnae', e.target.value)
                    }
                    disabled={!editing}
                    placeholder="6201-5/00"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Dados para NFe */}
        <TabsContent value="nfe" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Dados para Recebimento de Notas Fiscais
              </CardTitle>
              <CardDescription>
                Informações para envio de notas fiscais eletrônicas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nfe.email">E-mail para NFe *</Label>
                  <Input
                    id="nfe.email"
                    type="email"
                    value={
                      showSensitiveData
                        ? companyData.nfe.email
                        : '••••••••@••••••••.com'
                    }
                    onChange={e =>
                      handleInputChange('nfe', 'email', e.target.value)
                    }
                    disabled={!editing}
                    placeholder="fiscal@empresa.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nfe.phone">Telefone para NFe *</Label>
                  <Input
                    id="nfe.phone"
                    value={
                      showSensitiveData
                        ? companyData.nfe.phone
                        : '(••) •••••-••••'
                    }
                    onChange={e =>
                      handleInputChange(
                        'nfe',
                        'phone',
                        formatPhone(e.target.value)
                      )
                    }
                    disabled={!editing}
                    placeholder="(11) 99999-9999"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nfe.responsible">Responsável Fiscal *</Label>
                  <Input
                    id="nfe.responsible"
                    value={
                      showSensitiveData
                        ? companyData.nfe.responsible
                        : '•••••• •••••'
                    }
                    onChange={e =>
                      handleInputChange('nfe', 'responsible', e.target.value)
                    }
                    disabled={!editing}
                    placeholder="Nome do responsável"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nfe.cpf">CPF do Responsável *</Label>
                  <Input
                    id="nfe.cpf"
                    value={
                      showSensitiveData ? companyData.nfe.cpf : '•••.•••.•••-••'
                    }
                    onChange={e =>
                      handleInputChange('nfe', 'cpf', formatCPF(e.target.value))
                    }
                    disabled={!editing}
                    placeholder="123.456.789-00"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Dados Bancários */}
        <TabsContent value="banco" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Dados Bancários
              </CardTitle>
              <CardDescription>
                Informações bancárias para pagamentos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bank.bankCode">Código do Banco *</Label>
                  <Input
                    id="bank.bankCode"
                    value={
                      showSensitiveData ? companyData.bank.bankCode : '•••'
                    }
                    onChange={e =>
                      handleInputChange('bank', 'bankCode', e.target.value)
                    }
                    disabled={!editing}
                    placeholder="341"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bank.bankName">Nome do Banco *</Label>
                  <Input
                    id="bank.bankName"
                    value={
                      showSensitiveData
                        ? companyData.bank.bankName
                        : '••••••••••••••••••••'
                    }
                    onChange={e =>
                      handleInputChange('bank', 'bankName', e.target.value)
                    }
                    disabled={!editing}
                    placeholder="Itaú Unibanco"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bank.agency">Agência *</Label>
                  <Input
                    id="bank.agency"
                    value={showSensitiveData ? companyData.bank.agency : '••••'}
                    onChange={e =>
                      handleInputChange('bank', 'agency', e.target.value)
                    }
                    disabled={!editing}
                    placeholder="1234"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bank.account">Conta *</Label>
                  <Input
                    id="bank.account"
                    value={
                      showSensitiveData ? companyData.bank.account : '•••••-•'
                    }
                    onChange={e =>
                      handleInputChange('bank', 'account', e.target.value)
                    }
                    disabled={!editing}
                    placeholder="56789-0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bank.accountType">Tipo de Conta *</Label>
                  <Select
                    value={companyData.bank.accountType}
                    onValueChange={value =>
                      handleInputChange('bank', 'accountType', value)
                    }
                    disabled={!editing}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="corrente">Conta Corrente</SelectItem>
                      <SelectItem value="poupanca">Conta Poupança</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bank.pix">Chave PIX</Label>
                  <Input
                    id="bank.pix"
                    value={
                      showSensitiveData
                        ? companyData.bank.pix
                        : '••••••••@••••••••.com'
                    }
                    onChange={e =>
                      handleInputChange('bank', 'pix', e.target.value)
                    }
                    disabled={!editing}
                    placeholder="contato@empresa.com"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
