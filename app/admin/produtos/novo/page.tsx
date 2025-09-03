"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useAuth } from '@/components/auth/auth-provider-simple'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  ArrowLeft, 
  Save, 
  Loader2,
  AlertCircle,
  Package,
  DollarSign,
  Award,
  Clock,
  Factory,
  Box,
  Image as ImageIcon,
  Plus
} from 'lucide-react'
import { toast } from 'sonner'

export default function NovoProdutoPage() {
  const router = useRouter()
  const { user } = useAuth()
  const supabase = createClientComponentClient()
  
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [categories, setCategories] = useState<any[]>([])
  const [gallery, setGallery] = useState<{ url: string; uploading?: boolean }[]>([])
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category_id: '',
    base_price: '',
    base_points_cost: '',
    image_url: '',
    status: 'active',
    specifications: {
      sku: '',
      ncm: '',
      price_quantity: '100',
      min_quantity: '10',
      stock_available: '0',
      production_time: '',
      material: '',
      manufacturer: ''
    }
  })

  // Verificar se é admin (aceita admin, admin_global, superadmin)
  useEffect(() => {
    const role = user?.user_metadata?.role
    const allowed = ['admin', 'admin_global', 'superadmin']
    if (user && (!role || !allowed.includes(role))) {
      router.push('/admin/dashboard')
      toast.error('Acesso negado - Apenas administradores podem acessar esta página')
    }
  }, [user, router])

  // Carregar categorias
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/categories')
        const data = await response.json()
        
        if (response.ok) {
          setCategories(data.categories || [])
        }
      } catch (error) {
        console.error('Erro ao carregar categorias:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [])

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSpecificationChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      specifications: {
        ...prev.specifications,
        [field]: value
      }
    }))
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      setUploadingImage(true)
      
      // Verificar tipo de arquivo
      if (!file.type.startsWith('image/')) {
        throw new Error('Arquivo deve ser uma imagem')
      }

      // Verificar tamanho (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('Imagem deve ter no máximo 5MB')
      }

      // Upload para o bucket
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}.${fileExt}`
      const filePath = `products/${fileName}`

      const { data, error } = await supabase.storage
        .from('product-images')
        .upload(filePath, file)

      if (error) {
        throw new Error(`Erro no upload: ${error.message}`)
      }

      // Obter URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath)

      // Atualizar formulário com nova imagem
      handleInputChange('image_url', publicUrl)
      toast.success('Imagem enviada com sucesso!')
      
    } catch (error) {
      console.error('Erro no upload:', error)
      toast.error(error instanceof Error ? error.message : 'Erro ao enviar imagem')
    } finally {
      setUploadingImage(false)
    }
  }

  const handleGalleryUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    if (!files.length) return
    const remaining = Math.max(0, 6 - gallery.length)
    const toUpload = files.slice(0, remaining)
    const placeholders: { url: string; uploading: boolean }[] = toUpload.map(() => ({ url: '', uploading: true }))
    setGallery(prev => [...prev, ...placeholders])
    try {
      const uploads: string[] = []
      for (let idx = 0; idx < toUpload.length; idx++) {
        const file = toUpload[idx]
        if (!file.type.startsWith('image/')) throw new Error('Arquivo deve ser imagem')
        if (file.size > 5 * 1024 * 1024) throw new Error('Imagem até 5MB')
        const ext = file.name.split('.').pop()
        const key = `products/gallery/${Date.now()}_${idx}.${ext}`
        const { error } = await supabase.storage.from('product-images').upload(key, file)
        if (error) throw error
        const { data: { publicUrl } } = supabase.storage.from('product-images').getPublicUrl(key)
        uploads.push(publicUrl)
      }
      // Replace placeholders
      setGallery(prev => {
        const next = [...prev]
        let p = next.findIndex(i => i.uploading)
        uploads.forEach(url => {
          if (p !== -1) { next[p] = { url }; p = next.findIndex(i => i.uploading) }
          else next.push({ url })
        })
        return next.filter(Boolean).slice(0, 6)
      })
      toast.success('Imagens enviadas!')
    } catch (e) {
      console.error(e)
      toast.error(e instanceof Error ? e.message : 'Erro ao enviar imagens')
      // remove placeholders
      setGallery(prev => prev.filter(i => !i.uploading))
    }
  }

  const generateSKU = () => {
    const prefix = formData.name.substring(0, 3).toUpperCase()
    const timestamp = Date.now().toString().slice(-6)
    const sku = `${prefix}-${timestamp}`
    handleSpecificationChange('sku', sku)
  }

  const handleSave = async () => {
    try {
      setSaving(true)

      // Validar campos obrigatórios
      if (!formData.name?.trim()) {
        throw new Error('Nome do produto é obrigatório')
      }

      if (!formData.base_price || parseFloat(formData.base_price) <= 0) {
        throw new Error('Preço unitário deve ser maior que zero')
      }

      // Gerar SKU se não foi preenchido
      if (!formData.specifications.sku) {
        generateSKU()
      }

      // Preparar dados para envio
      const productData = {
        name: formData.name.trim(),
        description: formData.description?.trim() || '',
        category_id: formData.category_id || null,
        base_price: parseFloat(formData.base_price),
        base_points_cost: formData.base_points_cost ? parseInt(formData.base_points_cost) : Math.round(parseFloat(formData.base_price) * 10),
        image_url: formData.image_url,
        status: formData.status,
        specifications: {
          sku: formData.specifications.sku || generateSKU(),
          ncm: formData.specifications.ncm || '00000000',
          price_quantity: parseInt(formData.specifications.price_quantity) || 100,
          min_quantity: parseInt(formData.specifications.min_quantity) || 10,
          stock_available: parseInt(formData.specifications.stock_available) || 0,
          production_time: formData.specifications.production_time || '',
          material: formData.specifications.material || '',
          manufacturer: formData.specifications.manufacturer || ''
        },
        gallery: gallery.map(i => i.url)
      }

      const response = await fetch('/api/base-products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData)
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Produto criado com sucesso!')
        router.push('/admin/produtos')
      } else {
        throw new Error(data.error || 'Erro ao criar produto')
      }
    } catch (error) {
      console.error('Erro ao salvar:', error)
      toast.error(error instanceof Error ? error.message : 'Erro ao salvar produto')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
            <p className="mt-2 text-sm text-gray-600">Carregando categorias...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Novo Produto</h1>
            <p className="text-muted-foreground">
              Cadastre um novo produto no catálogo base
            </p>
          </div>
        </div>
        <Button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2"
        >
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Criar Produto
            </>
          )}
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Informações Básicas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Informações Básicas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Nome do Produto *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Digite o nome do produto"
              />
            </div>

            <div>
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Digite a descrição do produto"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="category">Categoria</Label>
              <select
                id="category"
                value={formData.category_id}
                onChange={(e) => handleInputChange('category_id', e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="">Selecione uma categoria</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="active">Ativo</option>
                <option value="inactive">Inativo</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Preços e Pontos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Preços e Pontos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="base_price">Preço Unitário (R$) *</Label>
              <Input
                id="base_price"
                type="number"
                step="0.01"
                min="0"
                value={formData.base_price}
                onChange={(e) => handleInputChange('base_price', e.target.value)}
                placeholder="0.00"
              />
            </div>

            <div>
              <Label htmlFor="base_points_cost">Pontos</Label>
              <Input
                id="base_points_cost"
                type="number"
                min="0"
                value={formData.base_points_cost}
                onChange={(e) => handleInputChange('base_points_cost', e.target.value)}
                placeholder="0"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Calculado automaticamente: {Math.round((parseFloat(formData.base_price) || 0) * 10)} pts
              </p>
            </div>

            <div>
              <Label htmlFor="price_quantity">Preço por Quantidade</Label>
              <Input
                id="price_quantity"
                type="number"
                min="1"
                value={formData.specifications.price_quantity}
                onChange={(e) => handleSpecificationChange('price_quantity', e.target.value)}
                placeholder="100"
              />
            </div>

            <div>
              <Label htmlFor="min_quantity">Quantidade Mínima</Label>
              <Input
                id="min_quantity"
                type="number"
                min="1"
                value={formData.specifications.min_quantity}
                onChange={(e) => handleSpecificationChange('min_quantity', e.target.value)}
                placeholder="10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Estoque e Produção */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Box className="h-5 w-5" />
              Estoque e Produção
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="stock_available">Estoque Disponível</Label>
              <Input
                id="stock_available"
                type="number"
                min="0"
                value={formData.specifications.stock_available}
                onChange={(e) => handleSpecificationChange('stock_available', e.target.value)}
                placeholder="0"
              />
            </div>

            <div>
              <Label htmlFor="production_time">Tempo de Produção</Label>
              <Input
                id="production_time"
                value={formData.specifications.production_time}
                onChange={(e) => handleSpecificationChange('production_time', e.target.value)}
                placeholder="ex: 5-7 dias úteis"
              />
            </div>

            <div>
              <Label htmlFor="material">Material</Label>
              <Input
                id="material"
                value={formData.specifications.material}
                onChange={(e) => handleSpecificationChange('material', e.target.value)}
                placeholder="ex: 100% Algodão"
              />
            </div>

            <div>
              <Label htmlFor="manufacturer">Fabricante</Label>
              <Input
                id="manufacturer"
                value={formData.specifications.manufacturer}
                onChange={(e) => handleSpecificationChange('manufacturer', e.target.value)}
                placeholder="ex: Yoobe Brasil"
              />
            </div>
          </CardContent>
        </Card>

        {/* Imagem e Códigos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5" />
              Imagem e Códigos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Upload de Imagem */}
            <div>
              <Label>Imagem do Produto</Label>
              <div className="mt-2 space-y-2">
                {formData.image_url && (
                  <div className="relative w-32 h-32">
                    <img
                      src={formData.image_url}
                      alt="Preview"
                      className="w-full h-full object-cover rounded"
                    />
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploadingImage}
                    className="flex-1"
                  />
                  {uploadingImage && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}
                </div>
              </div>
            </div>

            {/* Galeria de Imagens (até 6) */}
            <div>
              <Label>Galeria (até 6)</Label>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {gallery.map((img, idx) => (
                  <div key={idx} className="relative w-24 h-24 border rounded overflow-hidden">
                    {img.uploading ? (
                      <div className="flex items-center justify-center h-full text-xs text-gray-500">Enviando...</div>
                    ) : (
                      <img src={img.url} alt="Galeria" className="w-full h-full object-cover" />
                    )}
                    {!img.uploading && (
                      <button
                        type="button"
                        className="absolute top-1 right-1 bg-white/80 text-xs px-1 rounded"
                        onClick={() => setGallery(prev => prev.filter((_, i) => i !== idx))}
                      >
                        Remover
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <div className="mt-2 flex items-center gap-2">
                <Input type="file" accept="image/*" multiple onChange={handleGalleryUpload} disabled={gallery.length >= 6} />
                <span className="text-xs text-gray-500">{gallery.length}/6</span>
              </div>
            </div>

            <div>
              <Label htmlFor="sku">SKU</Label>
              <div className="flex gap-2">
                <Input
                  id="sku"
                  value={formData.specifications.sku}
                  onChange={(e) => handleSpecificationChange('sku', e.target.value)}
                  placeholder="ex: CAM-001"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={generateSKU}
                  disabled={!formData.name}
                >
                  Gerar
                </Button>
              </div>
            </div>

            <div>
              <Label htmlFor="ncm">NCM</Label>
              <Input
                id="ncm"
                value={formData.specifications.ncm}
                onChange={(e) => handleSpecificationChange('ncm', e.target.value)}
                placeholder="ex: 6104.43.00"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
