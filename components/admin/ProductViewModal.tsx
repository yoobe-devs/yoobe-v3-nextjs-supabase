'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Package, 
  Eye, 
  Edit, 
  ShoppingCart, 
  X, 
  Warehouse, 
  DollarSign, 
  TrendingUp,
  Calendar,
  Image as ImageIcon,
  CheckCircle,
  XCircle
} from 'lucide-react'

interface ProductBase {
  id: string
  sku: string
  title: string
  description: string
  price_cash: number
  price_points: number
  category: string
  active: boolean
  tenant_id: string
  media: string[]
  variations: any[]
  created_at: string
  updated_at: string
  stock_snapshots?: StockSnapshot[]
}

interface StockSnapshot {
  warehouse: string
  qty_available: number
  last_updated: string
}

interface ProductViewModalProps {
  product: ProductBase
  isOpen: boolean
  onClose: () => void
  onAddToBudget: () => void
  onEdit: () => void
}

export function ProductViewModal({
  product,
  isOpen,
  onClose,
  onAddToBudget,
  onEdit
}: ProductViewModalProps) {
  const [activeTab, setActiveTab] = useState('dados')

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const formatPoints = (value: number) => {
    return new Intl.NumberFormat('pt-BR').format(value)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Package className="h-5 w-5" />
            <span>Detalhes do Produto</span>
          </DialogTitle>
          <DialogDescription>
            Visualize informações completas sobre {product.title}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header do Produto */}
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 bg-blue-100 rounded-lg flex items-center justify-center">
                <Package className="h-10 w-10 text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{product.title}</h2>
                <p className="text-gray-600">SKU: {product.sku}</p>
                <div className="flex items-center space-x-2 mt-2">
                  <Badge variant={product.active ? "default" : "secondary"}>
                    {product.active ? (
                      <>
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Ativo
                      </>
                    ) : (
                      <>
                        <XCircle className="h-3 w-3 mr-1" />
                        Inativo
                      </>
                    )}
                  </Badge>
                  <Badge variant="outline">{product.category}</Badge>
                </div>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={onEdit}>
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Button>
              <Button onClick={onAddToBudget}>
                <ShoppingCart className="h-4 w-4 mr-2" />
                Adicionar ao Orçamento
              </Button>
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="dados">Dados</TabsTrigger>
              <TabsTrigger value="estoque">Estoque</TabsTrigger>
              <TabsTrigger value="midia">Mídia</TabsTrigger>
            </TabsList>

            {/* Tab: Dados */}
            <TabsContent value="dados" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Informações Básicas</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Título</label>
                      <p className="text-sm text-gray-900">{product.title}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">SKU</label>
                      <p className="text-sm text-gray-900 font-mono">{product.sku}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Categoria</label>
                      <p className="text-sm text-gray-900">{product.category}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Status</label>
                      <Badge variant={product.active ? "default" : "secondary"}>
                        {product.active ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Preços e Pontos</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Preço em Dinheiro</label>
                      <p className="text-lg font-bold text-green-600">{formatCurrency(product.price_cash)}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Preço em Pontos</label>
                      <p className="text-lg font-bold text-blue-600">{formatPoints(product.price_points)} pontos</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Descrição</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">{product.description || 'Nenhuma descrição disponível.'}</p>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Informações do Sistema</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Criado em</label>
                      <p className="text-sm text-gray-900">{formatDate(product.created_at)}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Última atualização</label>
                      <p className="text-sm text-gray-900">{formatDate(product.updated_at)}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Tenant ID</label>
                      <p className="text-sm text-gray-900 font-mono">{product.tenant_id}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Variações</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {product.variations && product.variations.length > 0 ? (
                      <div className="space-y-2">
                        {product.variations.map((variation, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <span className="text-sm">{variation.name || `Variação ${index + 1}`}</span>
                            <Badge variant="outline">{variation.value}</Badge>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">Nenhuma variação configurada.</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Tab: Estoque */}
            <TabsContent value="estoque" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Warehouse className="h-5 w-5" />
                    <span>Estoque por Armazém</span>
                  </CardTitle>
                  <CardDescription>
                    Informações de estoque sincronizadas com Cubbo
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {product.stock_snapshots && product.stock_snapshots.length > 0 ? (
                    <div className="space-y-4">
                      {product.stock_snapshots.map((stock, index) => (
                        <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <Warehouse className="h-5 w-5 text-blue-600" />
                            <div>
                              <h4 className="font-medium text-gray-900">{stock.warehouse}</h4>
                              <p className="text-sm text-gray-500">
                                Atualizado: {formatDate(stock.last_updated)}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-blue-600">
                              {stock.qty_available}
                            </div>
                            <p className="text-sm text-gray-500">unidades</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Warehouse className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum estoque disponível</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Este produto ainda não possui informações de estoque sincronizadas.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Resumo de Estoque</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {product.stock_snapshots?.reduce((sum, stock) => sum + stock.qty_available, 0) || 0}
                      </div>
                      <p className="text-sm text-blue-600">Total em Estoque</p>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {product.stock_snapshots?.length || 0}
                      </div>
                      <p className="text-sm text-green-600">Armazéns</p>
                    </div>
                    <div className="text-center p-4 bg-yellow-50 rounded-lg">
                      <div className="text-2xl font-bold text-yellow-600">
                        {product.stock_snapshots?.some(stock => stock.qty_available < 10) ? 'Baixo' : 'OK'}
                      </div>
                      <p className="text-sm text-yellow-600">Status</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab: Mídia */}
            <TabsContent value="midia" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <ImageIcon className="h-5 w-5" />
                    <span>Imagens e Mídia</span>
                  </CardTitle>
                  <CardDescription>
                    Galeria de imagens e arquivos do produto
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {product.media && product.media.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {product.media.map((mediaUrl, index) => (
                        <div key={index} className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                          <img
                            src={mediaUrl}
                            alt={`${product.title} - Imagem ${index + 1}`}
                            className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                            onClick={() => window.open(mediaUrl, '_blank')}
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhuma imagem disponível</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Este produto ainda não possui imagens cadastradas.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            <X className="h-4 w-4 mr-2" />
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
