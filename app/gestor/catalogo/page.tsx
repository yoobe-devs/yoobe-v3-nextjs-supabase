'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/auth/auth-provider-simple'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { SafeImage } from '@/components/ui/safe-image'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { 
  Package, 
  Search,
  Filter,
  Eye,
  Copy,
  Loader2,
  CheckCircle,
  AlertCircle,
  DollarSign,
  Award,
  Grid3X3,
  List,
  FileText,
  Lock
} from 'lucide-react'
import { toast } from 'sonner'

interface BaseProduct {
  id: string
  name: string
  description: string
  base_price: number
  base_points_cost: number
  image_url: string
  status: string
  category_id: string
  specifications: Record<string, any>
  product_categories: {
    id: string
    name: string
    icon: string
    color: string
  }
  is_replicated: boolean
}

interface Category {
  id: string
  name: string
  icon: string
  color: string
}

interface Budget {
  id: string
  title: string
  status: string
  total_amount: number
}

export default function CatalogoPage() {
  const { user } = useAuth()
  const [baseProducts, setBaseProducts] = useState<BaseProduct[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [approvedBudgets, setApprovedBudgets] = useState<Budget[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedProduct, setSelectedProduct] = useState<BaseProduct | null>(null)
  const [showReplicateDialog, setShowReplicateDialog] = useState(false)
  const [replicating, setReplicating] = useState(false)
  const [customPrice, setCustomPrice] = useState('')
  const [customPoints, setCustomPoints] = useState('')
  const [customStock, setCustomStock] = useState('')
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  })

  useEffect(() => {
    loadData()
  }, [pagination.page, searchTerm, selectedCategory])

  const loadData = async () => {
    try {
      setLoading(true)
      
      // Carregar produtos base
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString()
      })
      
      if (searchTerm) params.append('search', searchTerm)
      if (selectedCategory) params.append('category', selectedCategory)

      const baseProductsResponse = await fetch(`/api/gestor/base-products?${params}`)
      if (baseProductsResponse.ok) {
        const baseProductsData = await baseProductsResponse.json()
        setBaseProducts(baseProductsData.products || [])
        setPagination(prev => ({
          ...prev,
          total: baseProductsData.pagination.total,
          totalPages: baseProductsData.pagination.totalPages
        }))
      }

      // Carregar categorias
      const categoriesResponse = await fetch('/api/categories')
      if (categoriesResponse.ok) {
        const categoriesData = await categoriesResponse.json()
        setCategories(categoriesData.categories || [])
      }

      // Carregar orçamentos aprovados
      const budgetsResponse = await fetch('/api/gestor/orcamentos?status=approved')
      if (budgetsResponse.ok) {
        const budgetsData = await budgetsResponse.json()
        setApprovedBudgets(budgetsData.budgets || [])
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
      toast.error('Erro ao carregar catálogo')
    } finally {
      setLoading(false)
    }
  }

  const handleReplicate = async () => {
    if (!selectedProduct) return

    // Verificar se há orçamento aprovado
    if (approvedBudgets.length === 0) {
      toast.error('Você precisa ter um orçamento aprovado para replicar produtos. Acesse a página de orçamentos primeiro.')
      setShowReplicateDialog(false)
      return
    }

    try {
      setReplicating(true)
      
      // Usar o primeiro orçamento aprovado
      const approvedBudget = approvedBudgets[0]
      
      const response = await fetch('/api/gestor/base-products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          base_product_id: selectedProduct.id,
          budget_id: approvedBudget.id,
          custom_price: customPrice ? parseFloat(customPrice) : undefined,
          custom_points_cost: customPoints ? parseInt(customPoints) : undefined,
          custom_stock_quantity: customStock ? parseInt(customStock) : undefined
        })
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Produto replicado com sucesso!')
        setShowReplicateDialog(false)
        setSelectedProduct(null)
        setCustomPrice('')
        setCustomPoints('')
        setCustomStock('')
        loadData() // Recarregar para atualizar status
      } else {
        toast.error(data.error || 'Erro ao replicar produto')
      }
    } catch (error) {
      console.error('Erro ao replicar produto:', error)
      toast.error('Erro ao replicar produto')
    } finally {
      setReplicating(false)
    }
  }

  const openReplicateDialog = (product: BaseProduct) => {
    // Verificar se há orçamento aprovado antes de abrir o diálogo
    if (approvedBudgets.length === 0) {
      toast.error('Você precisa ter um orçamento aprovado para replicar produtos. Acesse a página de orçamentos primeiro.')
      return
    }

    setSelectedProduct(product)
    setCustomPrice(product.base_price.toString())
    setCustomPoints(product.base_points_cost.toString())
    setCustomStock('0')
    setShowReplicateDialog(true)
  }

  const filteredProducts = baseProducts.filter(product => {
    const matchesSearch = !searchTerm || 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCategory = !selectedCategory || product.category_id === selectedCategory
    
    return matchesSearch && matchesCategory
  })

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
            <p className="mt-2 text-sm text-gray-600">Carregando catálogo...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Catálogo Base</h1>
          <p className="text-muted-foreground">
            Visualize produtos do catálogo base. Replicação disponível apenas com orçamento aprovado.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Aviso sobre orçamento */}
      {approvedBudgets.length === 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-orange-600" />
              <div>
                <h3 className="font-semibold text-orange-800">Orçamento Necessário</h3>
                <p className="text-sm text-orange-700">
                  Para replicar produtos, você precisa ter um orçamento aprovado pelo Admin Global. 
                  <Button 
                    variant="link" 
                    className="p-0 h-auto text-orange-700 underline"
                    onClick={() => window.location.href = '/gestor/orcamentos'}
                  >
                    Acesse a página de orçamentos
                  </Button>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Orçamento aprovado */}
      {approvedBudgets.length > 0 && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <h3 className="font-semibold text-green-800">Orçamento Aprovado</h3>
                <p className="text-sm text-green-700">
                  Orçamento "{approvedBudgets[0].title}" aprovado. Você pode replicar produtos.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filtros */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar produtos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full md:w-48">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="">Todas as categorias</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total de Produtos</p>
                <p className="text-2xl font-bold">{pagination.total}</p>
              </div>
              <Package className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Replicados</p>
                <p className="text-2xl font-bold">
                  {baseProducts.filter(p => p.is_replicated).length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Disponíveis</p>
                <p className="text-2xl font-bold">
                  {baseProducts.filter(p => !p.is_replicated).length}
                </p>
              </div>
              <AlertCircle className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Orçamentos Aprovados</p>
                <p className="text-2xl font-bold">{approvedBudgets.length}</p>
              </div>
              <FileText className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Produtos */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <Card key={product.id} className="overflow-hidden">
              <div className="aspect-square relative">
                <SafeImage
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                {product.is_replicated && (
                  <Badge className="absolute top-2 right-2 bg-green-600">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Replicado
                  </Badge>
                )}
                {!product.is_replicated && approvedBudgets.length === 0 && (
                  <Badge className="absolute top-2 right-2 bg-orange-600">
                    <Lock className="h-3 w-3 mr-1" />
                    Bloqueado
                  </Badge>
                )}
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                  {product.description}
                </p>
                
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant="outline" style={{ 
                    backgroundColor: product.product_categories?.color + '20',
                    color: product.product_categories?.color,
                    borderColor: product.product_categories?.color
                  }}>
                    {product.product_categories?.name}
                  </Badge>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    <span className="font-semibold">R$ {product.base_price.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Award className="h-4 w-4 text-blue-600" />
                    <span className="font-semibold">{product.base_points_cost} pts</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => setSelectedProduct(product)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Ver
                  </Button>
                  {!product.is_replicated && approvedBudgets.length > 0 && (
                    <Button
                      size="sm"
                      className="flex-1"
                      onClick={() => openReplicateDialog(product)}
                    >
                      <Copy className="h-4 w-4 mr-1" />
                      Replicar
                    </Button>
                  )}
                  {!product.is_replicated && approvedBudgets.length === 0 && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      disabled
                      title="Necessário orçamento aprovado"
                    >
                      <Lock className="h-4 w-4 mr-1" />
                      Bloqueado
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredProducts.map((product) => (
            <Card key={product.id}>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 relative">
                    <SafeImage
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-full object-cover rounded"
                    />
                    {product.is_replicated && (
                      <Badge className="absolute -top-1 -right-1 bg-green-600 text-xs">
                        <CheckCircle className="h-3 w-3" />
                      </Badge>
                    )}
                    {!product.is_replicated && approvedBudgets.length === 0 && (
                      <Badge className="absolute -top-1 -right-1 bg-orange-600 text-xs">
                        <Lock className="h-3 w-3" />
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{product.name}</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      {product.description}
                    </p>
                    
                    <div className="flex items-center gap-4">
                      <Badge variant="outline" style={{ 
                        backgroundColor: product.product_categories?.color + '20',
                        color: product.product_categories?.color,
                        borderColor: product.product_categories?.color
                      }}>
                        {product.product_categories?.name}
                      </Badge>
                      
                      <div className="flex items-center gap-4 text-sm">
                        <span className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4 text-green-600" />
                          R$ {product.base_price.toFixed(2)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Award className="h-4 w-4 text-blue-600" />
                          {product.base_points_cost} pts
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedProduct(product)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Ver
                    </Button>
                    {!product.is_replicated && approvedBudgets.length > 0 && (
                      <Button
                        size="sm"
                        onClick={() => openReplicateDialog(product)}
                      >
                        <Copy className="h-4 w-4 mr-1" />
                        Replicar
                      </Button>
                    )}
                    {!product.is_replicated && approvedBudgets.length === 0 && (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled
                        title="Necessário orçamento aprovado"
                      >
                        <Lock className="h-4 w-4 mr-1" />
                        Bloqueado
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Paginação */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={pagination.page === 1}
            onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
          >
            Anterior
          </Button>
          
          <span className="text-sm">
            Página {pagination.page} de {pagination.totalPages}
          </span>
          
          <Button
            variant="outline"
            size="sm"
            disabled={pagination.page === pagination.totalPages}
            onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
          >
            Próxima
          </Button>
        </div>
      )}

      {/* Modal de Detalhes */}
      {selectedProduct && (
        <Dialog open={!!selectedProduct} onOpenChange={() => setSelectedProduct(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{selectedProduct.name}</DialogTitle>
            </DialogHeader>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <SafeImage
                  src={selectedProduct.image_url}
                  alt={selectedProduct.name}
                  className="w-full h-64 object-cover rounded"
                />
              </div>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Descrição</h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedProduct.description}
                  </p>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Categoria</h3>
                  <Badge variant="outline" style={{ 
                    backgroundColor: selectedProduct.product_categories?.color + '20',
                    color: selectedProduct.product_categories?.color,
                    borderColor: selectedProduct.product_categories?.color
                  }}>
                    {selectedProduct.product_categories?.name}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold mb-1">Preço Base</h3>
                    <p className="text-lg font-bold text-green-600">
                      R$ {selectedProduct.base_price.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Pontos Base</h3>
                    <p className="text-lg font-bold text-blue-600">
                      {selectedProduct.base_points_cost} pts
                    </p>
                  </div>
                </div>
                
                {selectedProduct.specifications && Object.keys(selectedProduct.specifications).length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">Especificações</h3>
                    <div className="text-sm space-y-1">
                      {Object.entries(selectedProduct.specifications).map(([key, value]) => (
                        <div key={key} className="flex justify-between">
                          <span className="capitalize">{key}:</span>
                          <span className="text-muted-foreground">{String(value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {!selectedProduct.is_replicated && approvedBudgets.length > 0 && (
                  <Button
                    className="w-full"
                    onClick={() => {
                      setSelectedProduct(null)
                      openReplicateDialog(selectedProduct)
                    }}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Replicar para Minha Empresa
                  </Button>
                )}
                
                {!selectedProduct.is_replicated && approvedBudgets.length === 0 && (
                  <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Lock className="h-4 w-4 text-orange-600" />
                      <span className="font-semibold text-orange-800">Replicação Bloqueada</span>
                    </div>
                    <p className="text-sm text-orange-700 mb-3">
                      Para replicar este produto, você precisa ter um orçamento aprovado pelo Admin Global.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.location.href = '/gestor/orcamentos'}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Criar Orçamento
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Modal de Replicação */}
      <Dialog open={showReplicateDialog} onOpenChange={setShowReplicateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Replicar Produto</DialogTitle>
          </DialogHeader>
          
          {selectedProduct && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold mb-2">{selectedProduct.name}</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  {selectedProduct.description}
                </p>
                <div className="flex items-center gap-4 text-sm">
                  <span>Preço base: R$ {selectedProduct.base_price.toFixed(2)}</span>
                  <span>Pontos base: {selectedProduct.base_points_cost}</span>
                </div>
                {approvedBudgets.length > 0 && (
                  <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded">
                    <p className="text-sm text-green-700">
                      <CheckCircle className="h-4 w-4 inline mr-1" />
                      Orçamento "{approvedBudgets[0].title}" aprovado
                    </p>
                  </div>
                )}
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Preço Personalizado (R$)
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    value={customPrice}
                    onChange={(e) => setCustomPrice(e.target.value)}
                    placeholder={selectedProduct.base_price.toString()}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Pontos Personalizados
                  </label>
                  <Input
                    type="number"
                    value={customPoints}
                    onChange={(e) => setCustomPoints(e.target.value)}
                    placeholder={selectedProduct.base_points_cost.toString()}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Estoque Inicial
                  </label>
                  <Input
                    type="number"
                    value={customStock}
                    onChange={(e) => setCustomStock(e.target.value)}
                    placeholder="0"
                  />
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowReplicateDialog(false)}
                  disabled={replicating}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleReplicate}
                  disabled={replicating}
                  className="flex-1"
                >
                  {replicating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Replicando...
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-2" />
                      Replicar Produto
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}


