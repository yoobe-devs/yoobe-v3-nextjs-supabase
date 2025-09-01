"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import YoobeLogo from "@/components/ui/yoobe-logo"
import { 
  Store, 
  Settings, 
  Eye, 
  Edit, 
  Upload, 
  Globe, 
  Palette,
  Users,
  Package,
  BarChart3,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Clock,
  Building2,
  Mail,
  Phone,
  MapPin,
  Link,
  Copy,
  Download
} from "lucide-react"

interface StoreData {
  id: string
  name: string
  slug: string
  domain: string
  description: string
  logo_url: string
  theme: {
    primary_color: string
    secondary_color: string
    accent_color: string
  }
  settings: {
    is_public: boolean
    allow_registration: boolean
    require_approval: boolean
    max_orders_per_user: number
  }
  stats: {
    total_products: number
    total_orders: number
    total_users: number
    total_revenue: number
  }
}

const mockStoreData: StoreData = {
  id: "1",
  name: "Join Tecnologia",
  slug: "join-tecnologia",
  domain: "join.yoobe.co",
  description: "Loja corporativa da Join Tecnologia para funcionários resgatarem seus swags e produtos promocionais.",
  logo_url: "/api/placeholder/150/150",
  theme: {
    primary_color: "#1e40af",
    secondary_color: "#3b82f6",
    accent_color: "#60a5fa"
  },
  settings: {
    is_public: true,
    allow_registration: true,
    require_approval: false,
    max_orders_per_user: 5
  },
  stats: {
    total_products: 24,
    total_orders: 156,
    total_users: 89,
    total_revenue: 12450.00
  }
}

export default function MinhaLojaPage() {
  const [storeData, setStoreData] = useState<StoreData>(mockStoreData)
  const [isEditing, setIsEditing] = useState(false)
  const [editedData, setEditedData] = useState<StoreData>(mockStoreData)

  const handleSave = () => {
    setStoreData(editedData)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditedData(storeData)
    setIsEditing(false)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const openStorePreview = () => {
    window.open(`http://localhost:3000/store/${storeData.slug}`, '_blank')
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <YoobeLogo size={40} />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Minha Loja</h1>
            <p className="text-gray-600">Gerencie sua loja corporativa e configurações</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            onClick={openStorePreview}
            className="flex items-center gap-2"
          >
            <Eye className="h-4 w-4" />
            Visualizar Loja
          </Button>
          <Button 
            onClick={() => setIsEditing(!isEditing)}
            className="flex items-center gap-2"
          >
            <Edit className="h-4 w-4" />
            {isEditing ? 'Cancelar' : 'Editar'}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="settings">Configurações</TabsTrigger>
          <TabsTrigger value="appearance">Aparência</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Package className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total de Produtos</p>
                    <p className="text-2xl font-bold">{storeData.stats.total_products}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <BarChart3 className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total de Pedidos</p>
                    <p className="text-2xl font-bold">{storeData.stats.total_orders}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Users className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Usuários Ativos</p>
                    <p className="text-2xl font-bold">{storeData.stats.total_users}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Store className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Receita Total</p>
                    <p className="text-2xl font-bold">R$ {storeData.stats.total_revenue.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Store Info */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Informações da Loja
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Store className="h-8 w-8 text-gray-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{storeData.name}</h3>
                    <p className="text-gray-600">{storeData.description}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">URL da Loja:</span>
                    <div className="flex items-center gap-2">
                      <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                        {storeData.domain}
                      </code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(storeData.domain)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Status:</span>
                    <Badge className={storeData.settings.is_public ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                      {storeData.settings.is_public ? "Pública" : "Privada"}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Registros:</span>
                    <Badge className={storeData.settings.allow_registration ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                      {storeData.settings.allow_registration ? "Permitidos" : "Bloqueados"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Links e Acesso
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <Label className="text-sm text-gray-600">Link da Vitrine</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Input 
                        value={`http://localhost:3000/store/${storeData.slug}`}
                        readOnly
                        className="text-sm"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(`http://localhost:3000/store/${storeData.slug}`)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm text-gray-600">Domínio Personalizado</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Input 
                        value={storeData.domain}
                        readOnly
                        className="text-sm"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(storeData.domain)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="pt-4">
                    <Button 
                      onClick={openStorePreview}
                      className="w-full flex items-center gap-2"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Abrir Vitrine da Loja
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configurações Gerais</CardTitle>
              <CardDescription>
                Configure as opções básicas da sua loja
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="store-name">Nome da Loja</Label>
                  <Input
                    id="store-name"
                    value={editedData.name}
                    onChange={(e) => setEditedData({...editedData, name: e.target.value})}
                    disabled={!isEditing}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="store-slug">Identificador (Slug)</Label>
                  <Input
                    id="store-slug"
                    value={editedData.slug}
                    onChange={(e) => setEditedData({...editedData, slug: e.target.value})}
                    disabled={!isEditing}
                    placeholder="minha-empresa"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="store-description">Descrição</Label>
                <Textarea
                  id="store-description"
                  value={editedData.description}
                  onChange={(e) => setEditedData({...editedData, description: e.target.value})}
                  disabled={!isEditing}
                  rows={3}
                />
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Configurações de Acesso</h4>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="public-store">Loja Pública</Label>
                    <p className="text-sm text-gray-600">Permitir acesso público à vitrine</p>
                  </div>
                  <Switch
                    id="public-store"
                    checked={editedData.settings.is_public}
                    onCheckedChange={(checked) => setEditedData({
                      ...editedData, 
                      settings: {...editedData.settings, is_public: checked}
                    })}
                    disabled={!isEditing}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="allow-registration">Permitir Registros</Label>
                    <p className="text-sm text-gray-600">Novos usuários podem se cadastrar</p>
                  </div>
                  <Switch
                    id="allow-registration"
                    checked={editedData.settings.allow_registration}
                    onCheckedChange={(checked) => setEditedData({
                      ...editedData, 
                      settings: {...editedData.settings, allow_registration: checked}
                    })}
                    disabled={!isEditing}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="require-approval">Aprovação Necessária</Label>
                    <p className="text-sm text-gray-600">Aprovar novos usuários manualmente</p>
                  </div>
                  <Switch
                    id="require-approval"
                    checked={editedData.settings.require_approval}
                    onCheckedChange={(checked) => setEditedData({
                      ...editedData, 
                      settings: {...editedData.settings, require_approval: checked}
                    })}
                    disabled={!isEditing}
                  />
                </div>
              </div>

              {isEditing && (
                <div className="flex gap-3 pt-4">
                  <Button onClick={handleSave}>Salvar Alterações</Button>
                  <Button variant="outline" onClick={handleCancel}>Cancelar</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Personalização Visual
              </CardTitle>
              <CardDescription>
                Customize as cores e aparência da sua loja
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="primary-color">Cor Primária</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="primary-color"
                      type="color"
                      value={editedData.theme.primary_color}
                      onChange={(e) => setEditedData({
                        ...editedData,
                        theme: {...editedData.theme, primary_color: e.target.value}
                      })}
                      disabled={!isEditing}
                      className="w-16 h-10"
                    />
                    <Input
                      value={editedData.theme.primary_color}
                      onChange={(e) => setEditedData({
                        ...editedData,
                        theme: {...editedData.theme, primary_color: e.target.value}
                      })}
                      disabled={!isEditing}
                      className="flex-1"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="secondary-color">Cor Secundária</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="secondary-color"
                      type="color"
                      value={editedData.theme.secondary_color}
                      onChange={(e) => setEditedData({
                        ...editedData,
                        theme: {...editedData.theme, secondary_color: e.target.value}
                      })}
                      disabled={!isEditing}
                      className="w-16 h-10"
                    />
                    <Input
                      value={editedData.theme.secondary_color}
                      onChange={(e) => setEditedData({
                        ...editedData,
                        theme: {...editedData.theme, secondary_color: e.target.value}
                      })}
                      disabled={!isEditing}
                      className="flex-1"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="accent-color">Cor de Destaque</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="accent-color"
                      type="color"
                      value={editedData.theme.accent_color}
                      onChange={(e) => setEditedData({
                        ...editedData,
                        theme: {...editedData.theme, accent_color: e.target.value}
                      })}
                      disabled={!isEditing}
                      className="w-16 h-10"
                    />
                    <Input
                      value={editedData.theme.accent_color}
                      onChange={(e) => setEditedData({
                        ...editedData,
                        theme: {...editedData.theme, accent_color: e.target.value}
                      })}
                      disabled={!isEditing}
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>

              {/* Preview */}
              <div className="border rounded-lg p-4 bg-gray-50">
                <h4 className="font-medium mb-3">Preview das Cores</h4>
                <div className="flex items-center gap-4">
                  <div 
                    className="w-8 h-8 rounded"
                    style={{ backgroundColor: editedData.theme.primary_color }}
                  />
                  <div 
                    className="w-8 h-8 rounded"
                    style={{ backgroundColor: editedData.theme.secondary_color }}
                  />
                  <div 
                    className="w-8 h-8 rounded"
                    style={{ backgroundColor: editedData.theme.accent_color }}
                  />
                </div>
              </div>

              {isEditing && (
                <div className="flex gap-3 pt-4">
                  <Button onClick={handleSave}>Salvar Alterações</Button>
                  <Button variant="outline" onClick={handleCancel}>Cancelar</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Analytics e Relatórios</CardTitle>
              <CardDescription>
                Visualize métricas e performance da sua loja
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Analytics detalhados em desenvolvimento</p>
                <Button variant="outline" className="mt-4">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar Relatório
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

