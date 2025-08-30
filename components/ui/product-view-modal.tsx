"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { 
  Package, 
  DollarSign, 
  Star, 
  ShoppingCart, 
  Building2,
  Tag,
  Calendar,
  Edit,
  X
} from "lucide-react"

interface Product {
  id: string
  name: string
  description: string
  price: number
  points_cost: number
  stock_quantity: number
  image_url?: string
  status: string
  created_at: string
  companies?: { name: string }
  categories?: { name: string }
}

interface ProductViewModalProps {
  product: Product | null
  isOpen: boolean
  onClose: () => void
  onEdit?: (product: Product) => void
}

export function ProductViewModal({ product, isOpen, onClose, onEdit }: ProductViewModalProps) {
  const [imageError, setImageError] = useState(false)

  if (!product) return null

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Ativo</Badge>
      case 'inactive':
        return <Badge className="bg-red-100 text-red-800">Inativo</Badge>
      case 'out_of_stock':
        return <Badge className="bg-yellow-100 text-yellow-800">Sem Estoque</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
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

  const getImageUrl = () => {
    if (imageError || !product.image_url) {
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(product.name)}&background=1e40af&color=ffffff&size=300`
    }
    return product.image_url
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold">Detalhes do Produto</DialogTitle>
            <div className="flex gap-2">
              {onEdit && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onEdit(product)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Imagem do Produto */}
          <div className="space-y-4">
            <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
              <img
                src={getImageUrl()}
                alt={product.name}
                className="w-full h-full object-cover"
                onError={() => setImageError(true)}
              />
              <div className="absolute top-2 right-2">
                {getStatusBadge(product.status)}
              </div>
            </div>
            
            {/* Estatísticas Rápidas */}
            <div className="grid grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <DollarSign className="h-6 w-6 text-green-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Preço</p>
                  <p className="text-lg font-bold">R$ {product.price.toFixed(2)}</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 text-center">
                  <Star className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Pontos</p>
                  <p className="text-lg font-bold">{product.points_cost}</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 text-center">
                  <ShoppingCart className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Estoque</p>
                  <p className="text-lg font-bold">{product.stock_quantity}</p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Informações do Produto */}
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{product.name}</h2>
              <p className="text-gray-600 leading-relaxed">{product.description}</p>
            </div>

            {/* Detalhes */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Building2 className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Empresa</p>
                  <p className="font-medium">{product.companies?.name || 'N/A'}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Tag className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Categoria</p>
                  <p className="font-medium">{product.categories?.name || 'Sem categoria'}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Data de Criação</p>
                  <p className="font-medium">{formatDate(product.created_at)}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Package className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">ID do Produto</p>
                  <p className="font-mono text-sm">{product.id}</p>
                </div>
              </div>
            </div>

            {/* Status e Ações */}
            <div className="pt-4 border-t">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Status</p>
                  {getStatusBadge(product.status)}
                </div>
                
                <div className="text-right">
                  <p className="text-sm text-gray-500">Disponibilidade</p>
                  <p className={`font-medium ${product.stock_quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {product.stock_quantity > 0 ? 'Em estoque' : 'Sem estoque'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
