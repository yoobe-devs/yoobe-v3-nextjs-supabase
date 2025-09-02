'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  User, 
  MapPin, 
  Edit, 
  Plus, 
  Trash2, 
  Star, 
  Building,
  Mail,
  Phone,
  Calendar,
  Shield,
  Save,
  X,
  CheckCircle
} from 'lucide-react'

interface UserProfile {
  id: string
  email: string
  name: string
  surname: string
  phone: string
  tax_id: string
  fiscal_regime: string
  role: 'superadmin' | 'admin_gestor' | 'gestor' | 'funcionario'
  status: 'active' | 'inactive'
  created_at: string
  updated_at: string
  company_name?: string
}

interface Address {
  id: string
  street: string
  number: string
  neighborhood: string
  city: string
  state: string
  country: string
  zip_code: string
  is_default: boolean
  created_at: string
}

interface WalletTransaction {
  id: string
  delta: number
  reason: string
  created_at: string
}

export default function StoreProfileAddressesPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [addresses, setAddresses] = useState<Address[]>([])
  const [walletTransactions, setWalletTransactions] = useState<WalletTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddressDialog, setShowAddressDialog] = useState(false)
  const [editingAddress, setEditingAddress] = useState<Address | null>(null)
  const [addressForm, setAddressForm] = useState({
    street: '',
    number: '',
    neighborhood: '',
    city: '',
    state: '',
    country: 'Brasil',
    zip_code: '',
    is_default: false
  })
  const [walletBalance, setWalletBalance] = useState(500)

  // Mock data for demonstration
  useEffect(() => {
    const mockProfile: UserProfile = {
      id: '1',
      email: 'joao.silva@techcorp.com',
      name: 'João',
      surname: 'Silva',
      phone: '(11) 99999-9999',
      tax_id: '123.456.789-00',
      fiscal_regime: 'Simples Nacional',
      role: 'funcionario',
      status: 'active',
      created_at: '2024-01-10T09:00:00Z',
      updated_at: '2024-01-15T14:30:00Z',
      company_name: 'TechCorp Brasil'
    }

    const mockAddresses: Address[] = [
      {
        id: '1',
        street: 'Rua das Flores',
        number: '123',
        neighborhood: 'Centro',
        city: 'São Paulo',
        state: 'SP',
        country: 'Brasil',
        zip_code: '01234-567',
        is_default: true,
        created_at: '2024-01-10T09:00:00Z'
      },
      {
        id: '2',
        street: 'Avenida Paulista',
        number: '1000',
        neighborhood: 'Bela Vista',
        city: 'São Paulo',
        state: 'SP',
        country: 'Brasil',
        zip_code: '01310-100',
        is_default: false,
        created_at: '2024-01-12T11:00:00Z'
      }
    ]

    const mockTransactions: WalletTransaction[] = [
      {
        id: '1',
        delta: 100,
        reason: 'Crédito por atividade',
        created_at: '2024-01-15T10:00:00Z'
      },
      {
        id: '2',
        delta: -50,
        reason: 'Resgate de produto',
        created_at: '2024-01-14T15:00:00Z'
      },
      {
        id: '3',
        delta: 200,
        reason: 'Bônus mensal',
        created_at: '2024-01-01T09:00:00Z'
      }
    ]

    setProfile(mockProfile)
    setAddresses(mockAddresses)
    setWalletTransactions(mockTransactions)
    setLoading(false)
  }, [])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getRoleBadge = (role: string) => {
    const roleConfig = {
      superadmin: { variant: 'default', icon: Shield, label: 'Super Admin', color: 'bg-purple-100 text-purple-800' },
      admin_gestor: { variant: 'default', icon: Shield, label: 'Admin Gestor', color: 'bg-blue-100 text-blue-800' },
      gestor: { variant: 'default', icon: Shield, label: 'Gestor', color: 'bg-green-100 text-green-800' },
      funcionario: { variant: 'secondary', icon: User, label: 'Funcionário', color: 'bg-gray-100 text-gray-800' }
    }

    const config = roleConfig[role as keyof typeof roleConfig] || roleConfig.funcionario
    const Icon = config.icon

    return (
      <Badge className={`flex items-center gap-1 ${config.color}`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    )
  }

  const handleAddAddress = () => {
    setEditingAddress(null)
    setAddressForm({
      street: '',
      number: '',
      neighborhood: '',
      city: '',
      state: '',
      country: 'Brasil',
      zip_code: '',
      is_default: false
    })
    setShowAddressDialog(true)
  }

  const handleEditAddress = (address: Address) => {
    setEditingAddress(address)
    setAddressForm({
      street: address.street,
      number: address.number,
      neighborhood: address.neighborhood,
      city: address.city,
      state: address.state,
      country: address.country,
      zip_code: address.zip_code,
      is_default: address.is_default
    })
    setShowAddressDialog(true)
  }

  const handleSaveAddress = async () => {
    if (editingAddress) {
      // Update existing address
      setAddresses(prev => prev.map(addr => 
        addr.id === editingAddress.id 
          ? { ...addr, ...addressForm, updated_at: new Date().toISOString() }
          : addr
      ))
    } else {
      // Add new address
      const newAddress: Address = {
        id: Date.now().toString(),
        ...addressForm,
        created_at: new Date().toISOString()
      }
      setAddresses(prev => [...prev, newAddress])
    }

    // Handle default address logic
    if (addressForm.is_default) {
      setAddresses(prev => prev.map(addr => ({
        ...addr,
        is_default: addr.id === (editingAddress?.id || Date.now().toString())
      })))
    }

    setShowAddressDialog(false)
    setEditingAddress(null)
  }

  const handleDeleteAddress = async (addressId: string) => {
    if (confirm('Tem certeza que deseja excluir este endereço?')) {
      setAddresses(prev => prev.filter(addr => addr.id !== addressId))
    }
  }

  const handleSetDefaultAddress = async (addressId: string) => {
    setAddresses(prev => prev.map(addr => ({
      ...addr,
      is_default: addr.id === addressId
    })))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-gray-600">Carregando perfil...</p>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="text-center py-8">
        <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">Perfil não encontrado</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight">Meu Perfil</h1>
        <p className="text-muted-foreground">
          Gerencie suas informações pessoais e endereços
        </p>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile">Perfil</TabsTrigger>
          <TabsTrigger value="addresses">Endereços ({addresses.length})</TabsTrigger>
          <TabsTrigger value="wallet">Carteira</TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile" className="space-y-6">
          {/* Profile Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Informações Pessoais
              </CardTitle>
              <CardDescription>
                Suas informações básicas e dados da empresa
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium">Nome</label>
                  <p className="text-sm text-muted-foreground">{profile.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Sobrenome</label>
                  <p className="text-sm text-muted-foreground">{profile.surname}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Email</label>
                  <p className="text-sm text-muted-foreground">{profile.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Telefone</label>
                  <p className="text-sm text-muted-foreground">{profile.phone}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">CPF/CNPJ</label>
                  <p className="text-sm text-muted-foreground">{profile.tax_id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Regime Fiscal</label>
                  <p className="text-sm text-muted-foreground">{profile.fiscal_regime}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Role</label>
                  <div className="mt-1">{getRoleBadge(profile.role)}</div>
                </div>
                <div>
                  <label className="text-sm font-medium">Status</label>
                  <p className="text-sm text-muted-foreground">
                    {profile.status === 'active' ? 'Ativo' : 'Inativo'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">Empresa</label>
                  <p className="text-sm text-muted-foreground">{profile.company_name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Data de Criação</label>
                  <p className="text-sm text-muted-foreground">{formatDate(profile.created_at)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Última Atualização</label>
                  <p className="text-sm text-muted-foreground">{formatDate(profile.updated_at)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="addresses" className="space-y-6">
          {/* Addresses Management */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Meus Endereços
                  </CardTitle>
                  <CardDescription>
                    Gerencie seus endereços de entrega
                  </CardDescription>
                </div>
                <Button onClick={handleAddAddress}>
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Endereço
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {addresses.length === 0 ? (
                <div className="text-center py-8">
                  <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Nenhum endereço cadastrado</p>
                  <Button onClick={handleAddAddress} className="mt-4">
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Primeiro Endereço
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {addresses.map((address) => (
                    <div key={address.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <MapPin className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">
                            {address.street}, {address.number}
                          </span>
                          {address.is_default && (
                            <Badge variant="secondary">Padrão</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {address.neighborhood}, {address.city} - {address.state}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          CEP: {address.zip_code}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Criado em: {formatDate(address.created_at)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {!address.is_default && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSetDefaultAddress(address.id)}
                          >
                            <Star className="w-4 h-4 mr-1" />
                            Padrão
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditAddress(address)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteAddress(address.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="wallet" className="space-y-6">
          {/* Wallet Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="w-5 h-5" />
                Minha Carteira
              </CardTitle>
              <CardDescription>
                Saldo atual e histórico de transações
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Balance */}
              <div className="text-center p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg">
                <div className="text-4xl font-bold text-green-600">{walletBalance}</div>
                <p className="text-lg text-muted-foreground">pontos disponíveis</p>
              </div>

              {/* Transactions */}
              <div>
                <h3 className="text-lg font-medium mb-4">Histórico de Transações</h3>
                {walletTransactions.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">
                    Nenhuma transação encontrada
                  </p>
                ) : (
                  <div className="space-y-3">
                    {walletTransactions.map((transaction) => (
                      <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            transaction.delta > 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                          }`}>
                            {transaction.delta > 0 ? '+' : ''}{transaction.delta}
                          </div>
                          <div>
                            <p className="font-medium">{transaction.reason}</p>
                            <p className="text-sm text-muted-foreground">
                              {formatDate(transaction.created_at)}
                            </p>
                          </div>
                        </div>
                        <Badge variant={transaction.delta > 0 ? 'default' : 'secondary'}>
                          {transaction.delta > 0 ? 'Crédito' : 'Débito'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Address Dialog */}
      <Dialog open={showAddressDialog} onOpenChange={setShowAddressDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingAddress ? 'Editar Endereço' : 'Novo Endereço'}
            </DialogTitle>
            <DialogDescription>
              {editingAddress ? 'Atualize as informações do endereço' : 'Adicione um novo endereço de entrega'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="street">Rua</Label>
                <Input
                  id="street"
                  value={addressForm.street}
                  onChange={(e) => setAddressForm(prev => ({ ...prev, street: e.target.value }))}
                  placeholder="Nome da rua"
                />
              </div>
              <div>
                <Label htmlFor="number">Número</Label>
                <Input
                  id="number"
                  value={addressForm.number}
                  onChange={(e) => setAddressForm(prev => ({ ...prev, number: e.target.value }))}
                  placeholder="Número"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="neighborhood">Bairro</Label>
              <Input
                id="neighborhood"
                value={addressForm.neighborhood}
                onChange={(e) => setAddressForm(prev => ({ ...prev, neighborhood: e.target.value }))}
                placeholder="Nome do bairro"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="city">Cidade</Label>
                <Input
                  id="city"
                  value={addressForm.city}
                  onChange={(e) => setAddressForm(prev => ({ ...prev, city: e.target.value }))}
                  placeholder="Nome da cidade"
                />
              </div>
              <div>
                <Label htmlFor="state">Estado</Label>
                <Input
                  id="state"
                  value={addressForm.state}
                  onChange={(e) => setAddressForm(prev => ({ ...prev, state: e.target.value }))}
                  placeholder="UF"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="country">País</Label>
                <Input
                  id="country"
                  value={addressForm.country}
                  onChange={(e) => setAddressForm(prev => ({ ...prev, country: e.target.value }))}
                  placeholder="Nome do país"
                />
              </div>
              <div>
                <Label htmlFor="zip_code">CEP</Label>
                <Input
                  id="zip_code"
                  value={addressForm.zip_code}
                  onChange={(e) => setAddressForm(prev => ({ ...prev, zip_code: e.target.value }))}
                  placeholder="00000-000"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is_default"
                checked={addressForm.is_default}
                onChange={(e) => setAddressForm(prev => ({ ...prev, is_default: e.target.checked }))}
              />
              <Label htmlFor="is_default">Definir como endereço padrão</Label>
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => setShowAddressDialog(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleSaveAddress}
                disabled={!addressForm.street || !addressForm.number || !addressForm.city || !addressForm.state}
                className="flex-1"
              >
                <Save className="w-4 h-4 mr-2" />
                {editingAddress ? 'Atualizar' : 'Salvar'} Endereço
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
