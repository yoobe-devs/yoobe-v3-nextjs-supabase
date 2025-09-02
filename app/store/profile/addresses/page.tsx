"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { 
  MapPin,
  Plus,
  Edit,
  Trash2,
  Star,
  Check
} from "lucide-react"
import { YoobeLogo } from "@/components/ui/yoobe-logo"

interface Address {
  id: string
  name: string
  taxId?: string
  phone?: string
  street: string
  number: string
  neighborhood: string
  city: string
  state: string
  country: string
  zip: string
  isDefault: boolean
}

const mockAddresses: Address[] = [
  {
    id: "1",
    name: "João Silva",
    taxId: "123.456.789-00",
    phone: "(11) 99999-9999",
    street: "Rua das Flores",
    number: "123",
    neighborhood: "Centro",
    city: "São Paulo",
    state: "SP",
    country: "Brasil",
    zip: "01234-567",
    isDefault: true
  },
  {
    id: "2",
    name: "João Silva",
    taxId: "123.456.789-00",
    phone: "(11) 99999-9999",
    street: "Av. Paulista",
    number: "1000",
    neighborhood: "Bela Vista",
    city: "São Paulo",
    state: "SP",
    country: "Brasil",
    zip: "01310-100",
    isDefault: false
  }
]

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>(mockAddresses)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState<Partial<Address>>({
    name: "",
    taxId: "",
    phone: "",
    street: "",
    number: "",
    neighborhood: "",
    city: "",
    state: "",
    country: "Brasil",
    zip: ""
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (editingId) {
      // Update existing address
      setAddresses(prev => prev.map(addr => 
        addr.id === editingId ? { ...addr, ...formData } : addr
      ))
      setEditingId(null)
    } else {
      // Add new address
      const { id, ...addressData } = formData as Address
      const newAddress: Address = {
        id: Date.now().toString(),
        ...addressData,
        isDefault: addresses.length === 0
      }
      setAddresses(prev => [...prev, newAddress])
    }
    setShowForm(false)
    setFormData({
      name: "",
      taxId: "",
      phone: "",
      street: "",
      number: "",
      neighborhood: "",
      city: "",
      state: "",
      country: "Brasil",
      zip: ""
    })
  }

  const handleEdit = (address: Address) => {
    setEditingId(address.id)
    setFormData(address)
    setShowForm(true)
  }

  const handleDelete = (id: string) => {
    setAddresses(prev => prev.filter(addr => addr.id !== id))
  }

  const handleSetDefault = async (id: string) => {
    setAddresses(prev => prev.map(addr => ({
      ...addr,
      isDefault: addr.id === id
    })))
    // TODO: Call API to set default address
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <YoobeLogo className="h-8 w-auto" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Meus Endereços</h1>
                <p className="text-sm text-gray-600">Gerencie seus endereços de entrega</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Lista de Endereços */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Endereços Cadastrados
                </CardTitle>
                <CardDescription>
                  {addresses.length} endereço{addresses.length !== 1 ? 's' : ''} cadastrado{addresses.length !== 1 ? 's' : ''}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {addresses.map((address) => (
                  <div key={address.id} className="border rounded-lg p-4 relative">
                    {address.isDefault && (
                      <Badge className="absolute top-2 right-2" variant="secondary">
                        <Star className="h-3 w-3 mr-1" />
                        Padrão
                      </Badge>
                    )}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold">{address.name}</h3>
                        <div className="flex items-center gap-2">
                          {!address.isDefault && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleSetDefault(address.id)}
                            >
                              <Check className="h-4 w-4 mr-1" />
                              Definir Padrão
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(address)}
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Editar
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(address.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Excluir
                          </Button>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600">
                        {address.street}, {address.number}
                        {address.neighborhood && ` - ${address.neighborhood}`}
                      </p>
                      <p className="text-sm text-gray-600">
                        {address.city} - {address.state}, {address.zip}
                      </p>
                      {address.taxId && (
                        <p className="text-sm text-gray-600">CPF/CNPJ: {address.taxId}</p>
                      )}
                      {address.phone && (
                        <p className="text-sm text-gray-600">Telefone: {address.phone}</p>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Formulário */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {editingId ? (
                    <>
                      <Edit className="h-5 w-5" />
                      Editar Endereço
                    </>
                  ) : (
                    <>
                      <Plus className="h-5 w-5" />
                      Novo Endereço
                    </>
                  )}
                </CardTitle>
                <CardDescription>
                  {editingId ? 'Atualize os dados do endereço' : 'Adicione um novo endereço de entrega'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Nome Completo *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="taxId">CPF/CNPJ</Label>
                      <Input
                        id="taxId"
                        value={formData.taxId}
                        onChange={(e) => setFormData(prev => ({ ...prev, taxId: e.target.value }))}
                        placeholder="123.456.789-00"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Telefone</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="(11) 99999-9999"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="street">Rua *</Label>
                    <Input
                      id="street"
                      value={formData.street}
                      onChange={(e) => setFormData(prev => ({ ...prev, street: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="number">Número *</Label>
                      <Input
                        id="number"
                        value={formData.number}
                        onChange={(e) => setFormData(prev => ({ ...prev, number: e.target.value }))}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="neighborhood">Bairro *</Label>
                      <Input
                        id="neighborhood"
                        value={formData.neighborhood}
                        onChange={(e) => setFormData(prev => ({ ...prev, neighborhood: e.target.value }))}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="city">Cidade *</Label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="state">Estado *</Label>
                      <Input
                        id="state"
                        value={formData.state}
                        onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="zip">CEP *</Label>
                      <Input
                        id="zip"
                        value={formData.zip}
                        onChange={(e) => setFormData(prev => ({ ...prev, zip: e.target.value }))}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="country">País</Label>
                    <Input
                      id="country"
                      value={formData.country}
                      onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button type="submit" className="flex-1">
                      {editingId ? 'Atualizar' : 'Adicionar'} Endereço
                    </Button>
                    {editingId && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setEditingId(null)
                          setFormData({
                            name: "",
                            taxId: "",
                            phone: "",
                            street: "",
                            number: "",
                            neighborhood: "",
                            city: "",
                            state: "",
                            country: "Brasil",
                            zip: ""
                          })
                        }}
                      >
                        Cancelar
                      </Button>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

