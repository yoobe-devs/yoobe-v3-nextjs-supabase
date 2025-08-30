"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  User, 
  Star,
  ShoppingCart,
  Package,
  Truck,
  Settings,
  Edit,
  Save,
  X,
  MapPin,
  Phone,
  Mail,
  Building2,
  Calendar,
  Award,
  History
} from "lucide-react"
import { YoobeLogo } from "@/components/ui/yoobe-logo"

interface UserProfile {
  id: string
  name: string
  email: string
  phone: string
  department: string
  position: string
  joinDate: string
  points: number
  totalOrders: number
  avatar: string
  address: {
    street: string
    complement: string
    city: string
    state: string
    zipCode: string
  }
}

const mockProfile: UserProfile = {
  id: "1",
  name: "João Silva",
  email: "joao.silva@jointecnologia.com",
  phone: "(11) 99999-9999",
  department: "TI",
  position: "Desenvolvedor",
  joinDate: "2024-01-01",
  points: 1250,
  totalOrders: 8,
  avatar: "https://via.placeholder.com/150x150/1e40af/ffffff?text=JS",
  address: {
    street: "Rua das Flores, 123",
    complement: "Apto 45",
    city: "São Paulo",
    state: "SP",
    zipCode: "01234-567"
  }
}

const mockOrderHistory = [
  {
    id: "1",
    orderNumber: "#ORD-2024-001",
    date: "2024-01-15",
    status: "Entregue",
    items: ["Camiseta Corporativa", "Caneca Personalizada"],
    points: 225,
    trackingCode: "BR123456789BR"
  },
  {
    id: "2",
    orderNumber: "#ORD-2024-002",
    date: "2024-01-10",
    status: "Em Trânsito",
    items: ["Mochila Corporativa"],
    points: 300,
    trackingCode: "BR987654321BR"
  },
  {
    id: "3",
    orderNumber: "#ORD-2024-003",
    date: "2024-01-05",
    status: "Processando",
    items: ["Garrafa Térmica"],
    points: 150,
    trackingCode: null
  }
]

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile>(mockProfile)
  const [isEditing, setIsEditing] = useState(false)
  const [editedProfile, setEditedProfile] = useState<UserProfile>(mockProfile)
  const [loading, setLoading] = useState(false)

  const handleSave = async () => {
    setLoading(true)
    // Simular salvamento
    setTimeout(() => {
      setProfile(editedProfile)
      setIsEditing(false)
      setLoading(false)
    }, 1000)
  }

  const handleCancel = () => {
    setEditedProfile(profile)
    setIsEditing(false)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Entregue':
        return <Badge className="bg-green-100 text-green-800">Entregue</Badge>
      case 'Em Trânsito':
        return <Badge className="bg-blue-100 text-blue-800">Em Trânsito</Badge>
      case 'Processando':
        return <Badge className="bg-yellow-100 text-yellow-800">Processando</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <YoobeLogo size="lg" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Meu Perfil</h1>
              <p className="text-gray-600">Gerencie suas informações pessoais</p>
            </div>
          </div>
          <div className="flex gap-3">
            {!isEditing ? (
              <Button onClick={() => setIsEditing(true)}>
                <Edit className="h-4 w-4 mr-2" />
                Editar Perfil
              </Button>
            ) : (
              <>
                <Button variant="outline" onClick={handleCancel}>
                  <X className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
                <Button onClick={handleSave} disabled={loading}>
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Salvando...
                    </div>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Salvar
                    </>
                  )}
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Info */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="personal" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="personal">Dados Pessoais</TabsTrigger>
                <TabsTrigger value="address">Endereço</TabsTrigger>
                <TabsTrigger value="history">Histórico</TabsTrigger>
              </TabsList>

              <TabsContent value="personal" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Informações Pessoais
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-4">
                      <img 
                        src={profile.avatar} 
                        alt={profile.name}
                        className="w-20 h-20 rounded-full object-cover"
                      />
                      <div>
                        <h3 className="text-xl font-semibold">{profile.name}</h3>
                        <p className="text-gray-600">{profile.position}</p>
                        <p className="text-sm text-gray-500">{profile.department}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Nome Completo</Label>
                        <Input 
                          id="name"
                          value={isEditing ? editedProfile.name : profile.name}
                          onChange={(e) => isEditing && setEditedProfile({...editedProfile, name: e.target.value})}
                          disabled={!isEditing}
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input 
                          id="email"
                          name="email"
                          type="email"
                          value={isEditing ? editedProfile.email : profile.email}
                          onChange={(e) => isEditing && setEditedProfile({...editedProfile, email: e.target.value})}
                          disabled={!isEditing}
                          autoComplete="email"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="phone">Telefone</Label>
                        <Input 
                          id="phone"
                          value={isEditing ? editedProfile.phone : profile.phone}
                          onChange={(e) => isEditing && setEditedProfile({...editedProfile, phone: e.target.value})}
                          disabled={!isEditing}
                        />
                      </div>
                      <div>
                        <Label htmlFor="department">Departamento</Label>
                        <Input 
                          id="department"
                          value={isEditing ? editedProfile.department : profile.department}
                          onChange={(e) => isEditing && setEditedProfile({...editedProfile, department: e.target.value})}
                          disabled={!isEditing}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="position">Cargo</Label>
                        <Input 
                          id="position"
                          value={isEditing ? editedProfile.position : profile.position}
                          onChange={(e) => isEditing && setEditedProfile({...editedProfile, position: e.target.value})}
                          disabled={!isEditing}
                        />
                      </div>
                      <div>
                        <Label htmlFor="joinDate">Data de Admissão</Label>
                        <Input 
                          id="joinDate"
                          value={new Date(profile.joinDate).toLocaleDateString('pt-BR')}
                          disabled
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="address" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      Endereço de Entrega
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="street">Endereço</Label>
                      <Input 
                        id="street"
                        value={isEditing ? editedProfile.address.street : profile.address.street}
                        onChange={(e) => isEditing && setEditedProfile({
                          ...editedProfile, 
                          address: {...editedProfile.address, street: e.target.value}
                        })}
                        disabled={!isEditing}
                      />
                    </div>

                    <div>
                      <Label htmlFor="complement">Complemento</Label>
                      <Input 
                        id="complement"
                        value={isEditing ? editedProfile.address.complement : profile.address.complement}
                        onChange={(e) => isEditing && setEditedProfile({
                          ...editedProfile, 
                          address: {...editedProfile.address, complement: e.target.value}
                        })}
                        disabled={!isEditing}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="city">Cidade</Label>
                        <Input 
                          id="city"
                          value={isEditing ? editedProfile.address.city : profile.address.city}
                          onChange={(e) => isEditing && setEditedProfile({
                            ...editedProfile, 
                            address: {...editedProfile.address, city: e.target.value}
                          })}
                          disabled={!isEditing}
                        />
                      </div>
                      <div>
                        <Label htmlFor="state">Estado</Label>
                        <Input 
                          id="state"
                          value={isEditing ? editedProfile.address.state : profile.address.state}
                          onChange={(e) => isEditing && setEditedProfile({
                            ...editedProfile, 
                            address: {...editedProfile.address, state: e.target.value}
                          })}
                          disabled={!isEditing}
                        />
                      </div>
                      <div>
                        <Label htmlFor="zipCode">CEP</Label>
                        <Input 
                          id="zipCode"
                          value={isEditing ? editedProfile.address.zipCode : profile.address.zipCode}
                          onChange={(e) => isEditing && setEditedProfile({
                            ...editedProfile, 
                            address: {...editedProfile.address, zipCode: e.target.value}
                          })}
                          disabled={!isEditing}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="history" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <History className="h-5 w-5" />
                      Histórico de Pedidos
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {mockOrderHistory.map((order) => (
                        <div key={order.id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <h4 className="font-semibold">{order.orderNumber}</h4>
                              <p className="text-sm text-gray-600">
                                {new Date(order.date).toLocaleDateString('pt-BR')}
                              </p>
                            </div>
                            {getStatusBadge(order.status)}
                          </div>
                          <div className="space-y-2">
                            <p className="text-sm">
                              <strong>Itens:</strong> {order.items.join(', ')}
                            </p>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1 text-purple-600">
                                <Star className="h-4 w-4" />
                                <span className="font-semibold">{order.points} pts</span>
                              </div>
                              {order.trackingCode && (
                                <div className="flex items-center gap-2 text-sm">
                                  <Truck className="h-4 w-4" />
                                  <span>Rastreamento: {order.trackingCode}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Stats Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Estatísticas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Star className="h-6 w-6 text-purple-600" />
                    <span className="text-2xl font-bold text-purple-600">{profile.points}</span>
                  </div>
                  <p className="text-sm text-gray-600">Pontos Disponíveis</p>
                </div>
                
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <ShoppingCart className="h-6 w-6 text-blue-600" />
                    <span className="text-2xl font-bold text-blue-600">{profile.totalOrders}</span>
                  </div>
                  <p className="text-sm text-gray-600">Pedidos Realizados</p>
                </div>

                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Package className="h-6 w-6 text-green-600" />
                    <span className="text-2xl font-bold text-green-600">12</span>
                  </div>
                  <p className="text-sm text-gray-600">Itens Resgatados</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Informações da Empresa
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Empresa</p>
                  <p className="font-medium">Join Tecnologia</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Departamento</p>
                  <p className="font-medium">{profile.department}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Cargo</p>
                  <p className="font-medium">{profile.position}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Admissão</p>
                  <p className="font-medium">{new Date(profile.joinDate).toLocaleDateString('pt-BR')}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
