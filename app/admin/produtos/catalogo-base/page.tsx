'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Plus, Search, Filter, Download, Upload, Edit, Eye, Trash2, Package, Tag, DollarSign, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

interface BaseProduct {
  id: string
  name: string
  description: string
  base_price: number
  base_points_cost: number
  sku: string
  ncm: string
  stock_quantity: number
  production_time: string
  material: string
  producer: string
  image_url: string
  status_fluxo: string
  created_at: string
  product_categories: {
    id: string
    name: string
    icon: string
    color: string
  }
}

interface Category {
  id: string
  name: string
  icon: string
  color: string
}

export default function CatalogoBasePage() {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [products, setProducts] = useState<BaseProduct[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [importDialogOpen, setImportDialogOpen] = useState(false)
  const [importLoading, setImportLoading] = useState(false)
  const [importPage, setImportPage] = useState(1)
  const [importProgress, setImportProgress] = useState(0)

  // Buscar produtos base
  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/base-products')
      if (!response.ok) throw new Error('Erro ao buscar produtos')
      
      const data = await response.json()
      setProducts(Array.isArray(data) ? data : (data.products || []))
    } catch (error) {
      console.error('Erro ao buscar produtos:', error)
      toast.error('Erro ao carregar produtos')
    } finally {
      setLoading(false)
    }
  }

  // Buscar categorias
  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      if (!response.ok) throw new Error('Erro ao buscar categorias')
      
      const data = await response.json()
      setCategories(Array.isArray(data) ? data : (data.categories || []))
    } catch (error) {
      console.error('Erro ao buscar categorias:', error)
    }
  }

  // Importar produtos do catálogo externo
  const importProducts = async () => {
    if (!importPage || importPage < 1) {
      toast.error('Página inválida')
      return
    }

    setImportLoading(true)
    setImportProgress(0)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('Usuário não autenticado')

      const response = await fetch('/api/scraping/import-catalog', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          page: importPage,
          limit: 50
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro na importação')
      }

      const data = await response.json()
      toast.success(data.message || `Importação concluída! ${data.imported ?? 0} produtos importados`)
      
      // Recarregar produtos
      await fetchProducts()
      setImportDialogOpen(false)
      setImportPage(1)
    } catch (error) {
      console.error('Erro na importação:', error)
      toast.error(error instanceof Error ? error.message : 'Erro na importação')
    } finally {
      setImportLoading(false)
      setImportProgress(0)
    }
  }

  // Filtrar produtos
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.sku.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCategory = selectedCategory === 'all' || product.product_categories?.id === selectedCategory
    
    return matchesSearch && matchesCategory
  })

  useEffect(() => {
    fetchProducts()
    fetchCategories()
  }, [])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Disponível</Badge>
      case 'orcamento_aprovado':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Orçamento Aprovado</Badge>
      case 'em_producao':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Em Produção</Badge>
      case 'enviado_logistica':
        return <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">Enviado Logística</Badge>
      case 'disponivel':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Disponível</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Carregando catálogo...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Catálogo Base de Produtos</h1>
          <p className="text-gray-600">Gerencie o catálogo base de produtos disponíveis para orçamentos</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Importar do Catálogo
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Importar Produtos</DialogTitle>
                <DialogDescription>
                  Importe produtos do catálogo externo (catalogo.yoobe.co)
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="page">Página para importar</Label>
                  <Input
                    id="page"
                    type="number"
                    min="1"
                    value={importPage}
                    onChange={(e) => setImportPage(parseInt(e.target.value) || 1)}
                    placeholder="1"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Cada página contém até 50 produtos
                  </p>
                </div>
                <Button 
                  onClick={importProducts} 
                  disabled={importLoading}
                  className="w-full"
                >
                  {importLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Importando...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Importar Produtos
                    </>
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          
          <Button 
            onClick={() => router.push('/admin/produtos/novo')}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Novo Produto
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar produtos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Todas as categorias" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as categorias</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total de Produtos</p>
                <p className="text-2xl font-bold text-gray-900">{products.length}</p>
              </div>
              <Package className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Categorias</p>
                <p className="text-2xl font-bold text-gray-900">{categories.length}</p>
              </div>
              <Tag className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Valor Total</p>
                <p className="text-2xl font-bold text-gray-900">
                  R$ {products.reduce((sum, p) => sum + p.base_price, 0).toLocaleString()}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Disponíveis</p>
                <p className="text-2xl font-bold text-gray-900">
                  {products.filter(p => (p as any).status === 'active' || (p as any).status_fluxo === 'disponivel').length}
                </p>
              </div>
              <Star className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Produtos */}
      {filteredProducts.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm || selectedCategory ? 'Nenhum produto encontrado' : 'Nenhum produto no catálogo'}
              </h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || selectedCategory 
                  ? 'Tente ajustar os filtros de busca'
                  : 'Comece importando produtos do catálogo externo ou criando produtos manualmente.'
                }
              </p>
              {!searchTerm && !selectedCategory && (
                <div className="flex gap-2 justify-center">
                  <Button onClick={() => setImportDialogOpen(true)}>
                    <Upload className="h-4 w-4 mr-2" />
                    Importar Produtos
                  </Button>
                  <Button variant="outline" onClick={() => router.push('/admin/produtos/novo')}>
                    <Plus className="h-4 w-4 mr-2" />
                    Criar Produto
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <Card key={product.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg line-clamp-2">{product.name}</CardTitle>
                    <CardDescription className="line-clamp-1">
                      SKU: {product.sku}
                    </CardDescription>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => router.push(`/admin/produtos/${product.id}`)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => router.push(`/admin/produtos/editar/${product.id}`)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3">
                {product.image_url && (
                  <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                      }}
                    />
                  </div>
                )}
                
                <div className="space-y-2">
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {product.description}
                  </p>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-green-600">
                      R$ {product.base_price.toLocaleString()}
                    </span>
                    <span className="text-sm text-gray-500">
                      {product.base_points_cost} pts
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <Badge variant="outline" className="text-xs">
                      {product.product_categories?.name || 'Sem categoria'}
                    </Badge>
                    {getStatusBadge((product as any).status || (product as any).status_fluxo || 'active')}
                  </div>
                  
                  <div className="text-xs text-gray-500 space-y-1">
                    <div>Estoque: {product.stock_quantity}</div>
                    <div>Produção: {product.production_time}</div>
                    <div>Material: {product.material}</div>
                    <div>Fabricante: {product.producer}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
