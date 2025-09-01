'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/auth/auth-provider-simple'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { 
  Store, 
  Palette, 
  Image, 
  Settings, 
  Eye, 
  Save,
  Upload,
  Globe,
  Users,
  Package,
  ShoppingCart,
  Edit
} from 'lucide-react'
import { toast } from 'sonner'

interface StoreConfig {
  id: string
  name: string
  description: string
  domain: string
  logo_url: string
  banner_url: string
  primary_color: string
  secondary_color: string
  accent_color: string
  theme: string
  layout: string
  status: string
  company_id: string
  settings: {
    enable_points: boolean
    enable_reviews: boolean
    enable_wishlist: boolean
    enable_newsletter: boolean
    require_approval: boolean
    max_points_per_order: number
    min_order_value: number
  }
}

interface Product {
  id: string
  name: string
  description: string
  price: number
  points_cost: number
  stock_quantity: number
  image_url: string
  status: string
  category_id: string
  base_product_id: string
  product_categories: {
    id: string
    name: string
    icon: string
    color: string
  }
  base_products: {
    id: string
    name: string
    base_price: number
    base_points_cost: number
  }
}

export default function ConfigurarLojaPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [storeConfig, setStoreConfig] = useState<StoreConfig | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])
  const [previewUrl, setPreviewUrl] = useState('')

  useEffect(() => {
    loadStoreData()
  }, [])

  const loadStoreData = async () => {
    try {
      // Carregar configuração da loja
      const storeResponse = await fetch('/api/gestor/store-config')
      if (storeResponse.ok) {
        const storeData = await storeResponse.json()
        setStoreConfig(storeData)
        setPreviewUrl(`http://localhost:3002/store/${storeData.domain}`)
      }

      // Carregar produtos da empresa
      const productsResponse = await fetch('/api/gestor/products')
      if (productsResponse.ok) {
        const productsData = await productsResponse.json()
        setProducts(productsData)
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
      toast.error('Erro ao carregar dados da loja')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!storeConfig) return

    setSaving(true)
    try {
      const response = await fetch('/api/gestor/store-config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(storeConfig)
      })

      if (response.ok) {
        toast.success('Configurações salvas com sucesso!')
      } else {
        throw new Error('Erro ao salvar')
      }
    } catch (error) {
      console.error('Erro ao salvar:', error)
      toast.error('Erro ao salvar configurações')
    } finally {
      setSaving(false)
    }
  }

  const handleLogoUpload = async (file: File) => {
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', 'logo')

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        const { url } = await response.json()
        setStoreConfig(prev => prev ? { ...prev, logo_url: url } : null)
        toast.success('Logo enviada com sucesso!')
      }
    } catch (error) {
      console.error('Erro ao enviar logo:', error)
      toast.error('Erro ao enviar logo')
    }
  }

  const handleBannerUpload = async (file: File) => {
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', 'banner')

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        const { url } = await response.json()
        setStoreConfig(prev => prev ? { ...prev, banner_url: url } : null)
        toast.success('Banner enviado com sucesso!')
      }
    } catch (error) {
      console.error('Erro ao enviar banner:', error)
      toast.error('Erro ao enviar banner')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando configurações...</p>
        </div>
      </div>
    )
  }

  if (!storeConfig) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600">Loja não encontrada</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Configurar Loja</h1>
              <p className="text-gray-600 mt-2">
                Personalize a aparência e comportamento da sua loja
              </p>
            </div>
            <div className="flex space-x-3">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    Visualizar Loja
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl">
                  <DialogHeader>
                    <DialogTitle>Visualizar Loja</DialogTitle>
                  </DialogHeader>
                  <div className="h-96 border rounded-lg">
                    <iframe 
                      src={previewUrl} 
                      className="w-full h-full"
                      title="Preview da Loja"
                    />
                  </div>
                </DialogContent>
              </Dialog>
              <Button 
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                {saving ? 'Salvando...' : 'Salvar Configurações'}
              </Button>
            </div>
          </div>
        </div>

        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="general">Geral</TabsTrigger>
            <TabsTrigger value="appearance">Aparência</TabsTrigger>
            <TabsTrigger value="products">Produtos</TabsTrigger>
            <TabsTrigger value="settings">Configurações</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>

          {/* Configurações Gerais */}
          <TabsContent value="general" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Store className="h-5 w-5" />
                  Informações Básicas
                </CardTitle>
                <CardDescription>
                  Configure as informações básicas da sua loja
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Nome da Loja *</Label>
                    <Input
                      id="name"
                      value={storeConfig.name}
                      onChange={(e) => setStoreConfig({ ...storeConfig, name: e.target.value })}
                      placeholder="Nome da sua loja"
                    />
                  </div>
                  <div>
                    <Label htmlFor="domain">Domínio da Loja</Label>
                    <Input
                      id="domain"
                      value={storeConfig.domain}
                      onChange={(e) => setStoreConfig({ ...storeConfig, domain: e.target.value })}
                      placeholder="minha-loja"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Sua loja ficará disponível em: {storeConfig.domain}.yoobe.com
                    </p>
                  </div>
                </div>
                <div>
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    value={storeConfig.description}
                    onChange={(e) => setStoreConfig({ ...storeConfig, description: e.target.value })}
                    placeholder="Descreva sua loja..."
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="status">Status da Loja</Label>
                  <Select
                    value={storeConfig.status}
                    onValueChange={(value) => setStoreConfig({ ...storeConfig, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Ativa</SelectItem>
                      <SelectItem value="inactive">Inativa</SelectItem>
                      <SelectItem value="maintenance">Manutenção</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Upload de Imagens */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Image className="h-5 w-5" />
                  Imagens da Loja
                </CardTitle>
                <CardDescription>
                  Faça upload do logo e banner da sua loja
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Logo da Loja</Label>
                    <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                      {storeConfig.logo_url ? (
                        <div>
                          <img 
                            src={storeConfig.logo_url} 
                            alt="Logo" 
                            className="h-20 mx-auto mb-2"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => document.getElementById('logo-upload')?.click()}
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            Alterar Logo
                          </Button>
                        </div>
                      ) : (
                        <div>
                          <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => document.getElementById('logo-upload')?.click()}
                          >
                            Enviar Logo
                          </Button>
                        </div>
                      )}
                      <input
                        id="logo-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) handleLogoUpload(file)
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Banner da Loja</Label>
                    <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                      {storeConfig.banner_url ? (
                        <div>
                          <img 
                            src={storeConfig.banner_url} 
                            alt="Banner" 
                            className="h-20 mx-auto mb-2 object-cover"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => document.getElementById('banner-upload')?.click()}
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            Alterar Banner
                          </Button>
                        </div>
                      ) : (
                        <div>
                          <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => document.getElementById('banner-upload')?.click()}
                          >
                            Enviar Banner
                          </Button>
                        </div>
                      )}
                      <input
                        id="banner-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) handleBannerUpload(file)
                        }}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aparência */}
          <TabsContent value="appearance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Cores e Tema
                </CardTitle>
                <CardDescription>
                  Personalize as cores e o tema da sua loja
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="primary-color">Cor Primária</Label>
                    <div className="flex items-center gap-2 mt-2">
                      <input
                        id="primary-color"
                        type="color"
                        value={storeConfig.primary_color}
                        onChange={(e) => setStoreConfig({ ...storeConfig, primary_color: e.target.value })}
                        className="w-12 h-10 border rounded"
                      />
                      <Input
                        value={storeConfig.primary_color}
                        onChange={(e) => setStoreConfig({ ...storeConfig, primary_color: e.target.value })}
                        placeholder="#3B82F6"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="secondary-color">Cor Secundária</Label>
                    <div className="flex items-center gap-2 mt-2">
                      <input
                        id="secondary-color"
                        type="color"
                        value={storeConfig.secondary_color}
                        onChange={(e) => setStoreConfig({ ...storeConfig, secondary_color: e.target.value })}
                        className="w-12 h-10 border rounded"
                      />
                      <Input
                        value={storeConfig.secondary_color}
                        onChange={(e) => setStoreConfig({ ...storeConfig, secondary_color: e.target.value })}
                        placeholder="#1E40AF"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="accent-color">Cor de Destaque</Label>
                    <div className="flex items-center gap-2 mt-2">
                      <input
                        id="accent-color"
                        type="color"
                        value={storeConfig.accent_color}
                        onChange={(e) => setStoreConfig({ ...storeConfig, accent_color: e.target.value })}
                        className="w-12 h-10 border rounded"
                      />
                      <Input
                        value={storeConfig.accent_color}
                        onChange={(e) => setStoreConfig({ ...storeConfig, accent_color: e.target.value })}
                        placeholder="#F59E0B"
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <Label htmlFor="theme">Tema</Label>
                  <Select
                    value={storeConfig.theme}
                    onValueChange={(value) => setStoreConfig({ ...storeConfig, theme: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Claro</SelectItem>
                      <SelectItem value="dark">Escuro</SelectItem>
                      <SelectItem value="auto">Automático</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="layout">Layout</Label>
                  <Select
                    value={storeConfig.layout}
                    onValueChange={(value) => setStoreConfig({ ...storeConfig, layout: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="grid">Grid</SelectItem>
                      <SelectItem value="list">Lista</SelectItem>
                      <SelectItem value="masonry">Masonry</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Produtos */}
          <TabsContent value="products" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Produtos da Loja
                </CardTitle>
                <CardDescription>
                  Gerencie quais produtos estarão disponíveis na sua loja
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {products.map((product) => (
                    <div key={product.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <img 
                          src={product.image_url || '/placeholder-product.png'} 
                          alt={product.name}
                          className="w-12 h-12 object-cover rounded"
                        />
                        <div>
                          <h4 className="font-medium">{product.name}</h4>
                          <p className="text-sm text-gray-600">
                            {product.product_categories?.name} • R$ {product.price.toFixed(2)}
                          </p>
                          <div className="flex gap-2 mt-1">
                            <Badge variant="outline">{product.status}</Badge>
                            <Badge variant="secondary">Estoque: {product.stock_quantity}</Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={selectedProducts.includes(product.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedProducts([...selectedProducts, product.id])
                            } else {
                              setSelectedProducts(selectedProducts.filter(id => id !== product.id))
                            }
                          }}
                        />
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Configurações */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Configurações Avançadas
                </CardTitle>
                <CardDescription>
                  Configure funcionalidades avançadas da sua loja
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Habilitar Sistema de Pontos</Label>
                      <p className="text-sm text-gray-600">Permitir que clientes usem pontos para compras</p>
                    </div>
                    <Switch
                      checked={storeConfig.settings.enable_points}
                      onCheckedChange={(checked) => setStoreConfig({
                        ...storeConfig,
                        settings: { ...storeConfig.settings, enable_points: checked }
                      })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Habilitar Avaliações</Label>
                      <p className="text-sm text-gray-600">Permitir que clientes avaliem produtos</p>
                    </div>
                    <Switch
                      checked={storeConfig.settings.enable_reviews}
                      onCheckedChange={(checked) => setStoreConfig({
                        ...storeConfig,
                        settings: { ...storeConfig.settings, enable_reviews: checked }
                      })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Habilitar Lista de Desejos</Label>
                      <p className="text-sm text-gray-600">Permitir que clientes criem lista de desejos</p>
                    </div>
                    <Switch
                      checked={storeConfig.settings.enable_wishlist}
                      onCheckedChange={(checked) => setStoreConfig({
                        ...storeConfig,
                        settings: { ...storeConfig.settings, enable_wishlist: checked }
                      })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Habilitar Newsletter</Label>
                      <p className="text-sm text-gray-600">Permitir inscrição em newsletter</p>
                    </div>
                    <Switch
                      checked={storeConfig.settings.enable_newsletter}
                      onCheckedChange={(checked) => setStoreConfig({
                        ...storeConfig,
                        settings: { ...storeConfig.settings, enable_newsletter: checked }
                      })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Exigir Aprovação de Pedidos</Label>
                      <p className="text-sm text-gray-600">Pedidos precisam ser aprovados antes do processamento</p>
                    </div>
                    <Switch
                      checked={storeConfig.settings.require_approval}
                      onCheckedChange={(checked) => setStoreConfig({
                        ...storeConfig,
                        settings: { ...storeConfig.settings, require_approval: checked }
                      })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="max-points">Máximo de Pontos por Pedido</Label>
                    <Input
                      id="max-points"
                      type="number"
                      value={storeConfig.settings.max_points_per_order}
                      onChange={(e) => setStoreConfig({
                        ...storeConfig,
                        settings: { ...storeConfig.settings, max_points_per_order: parseInt(e.target.value) || 0 }
                      })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="min-order">Valor Mínimo do Pedido</Label>
                    <Input
                      id="min-order"
                      type="number"
                      step="0.01"
                      value={storeConfig.settings.min_order_value}
                      onChange={(e) => setStoreConfig({
                        ...storeConfig,
                        settings: { ...storeConfig.settings, min_order_value: parseFloat(e.target.value) || 0 }
                      })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Preview */}
          <TabsContent value="preview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Preview da Loja
                </CardTitle>
                <CardDescription>
                  Visualize como sua loja aparecerá para os clientes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg overflow-hidden">
                  <div className="bg-gray-100 p-4 border-b">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4" />
                        <span className="text-sm font-medium">{storeConfig.domain}.yoobe.com</span>
                      </div>
                      <div className="flex gap-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      </div>
                    </div>
                  </div>
                  <div className="h-96">
                    <iframe 
                      src={previewUrl} 
                      className="w-full h-full"
                      title="Preview da Loja"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
