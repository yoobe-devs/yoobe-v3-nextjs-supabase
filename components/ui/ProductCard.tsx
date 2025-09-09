import React from 'react'
import Image from 'next/image'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Clock, Palette, Ruler, Star, Tag } from 'lucide-react'

interface ProductCardProps {
  product: {
    id: string
    name: string
    description: string
    description_long?: string
    base_price: number
    base_points_cost: number
    images: string[]
    specifications: Record<string, any>
    features: string[]
    available_colors: string[]
    available_sizes: string[]
    customization_options: Record<string, any>
    lead_time_days: number
    min_quantity: number
    max_quantity: number
    is_featured: boolean
    tags: string[]
    product_categories?: {
      id: string
      name: string
      icon?: string
      color?: string
    }
  }
  onSelect?: (product: any) => void
  onViewDetails?: (product: any) => void
  showActions?: boolean
}

export function ProductCard({
  product,
  onSelect,
  onViewDetails,
  showActions = true,
}: ProductCardProps) {
  const primaryImage = product.images?.[0] || '/placeholder-product.jpg'
  const customizationMethods = product.customization_options?.methods || []

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 border-0 shadow-md">
      <CardHeader className="p-0">
        <div className="relative aspect-square overflow-hidden rounded-t-lg">
          <Image
            src={primaryImage}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          {product.is_featured && (
            <Badge className="absolute top-2 left-2 bg-yellow-500 hover:bg-yellow-600">
              <Star className="w-3 h-3 mr-1" />
              Destaque
            </Badge>
          )}
          {product.product_categories && (
            <Badge
              className="absolute top-2 right-2"
              style={{
                backgroundColor: product.product_categories.color || '#3b82f6',
              }}
            >
              {product.product_categories.name}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-3">
        <div>
          <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-blue-600 transition-colors">
            {product.name}
          </h3>
          <p className="text-sm text-gray-600 line-clamp-2 mt-1">
            {product.description}
          </p>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-2xl font-bold text-green-600">
              R$ {product.base_price.toFixed(2)}
            </span>
            <span className="text-sm text-gray-500">
              {product.base_points_cost} pontos
            </span>
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <Clock className="w-4 h-4 mr-1" />
            {product.lead_time_days} dias
          </div>
        </div>

        {/* Especificações principais */}
        <div className="space-y-2">
          {product.available_colors.length > 0 && (
            <div className="flex items-center gap-2">
              <Palette className="w-4 h-4 text-gray-400" />
              <div className="flex gap-1 flex-wrap">
                {product.available_colors.slice(0, 3).map((color, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {color}
                  </Badge>
                ))}
                {product.available_colors.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{product.available_colors.length - 3}
                  </Badge>
                )}
              </div>
            </div>
          )}

          {product.available_sizes.length > 0 && (
            <div className="flex items-center gap-2">
              <Ruler className="w-4 h-4 text-gray-400" />
              <div className="flex gap-1 flex-wrap">
                {product.available_sizes.slice(0, 4).map((size, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {size}
                  </Badge>
                ))}
                {product.available_sizes.length > 4 && (
                  <Badge variant="outline" className="text-xs">
                    +{product.available_sizes.length - 4}
                  </Badge>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Métodos de customização */}
        {customizationMethods.length > 0 && (
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-gray-400" />
            <div className="flex gap-1 flex-wrap">
              {customizationMethods
                .slice(0, 2)
                .map((method: string, index: number) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {method}
                  </Badge>
                ))}
              {customizationMethods.length > 2 && (
                <Badge variant="secondary" className="text-xs">
                  +{customizationMethods.length - 2}
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Tags */}
        {product.tags.length > 0 && (
          <div className="flex gap-1 flex-wrap">
            {product.tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Quantidade mínima */}
        <div className="text-xs text-gray-500">
          Quantidade mínima: {product.min_quantity} unidades
        </div>
      </CardContent>

      {showActions && (
        <CardFooter className="p-4 pt-0 space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewDetails?.(product)}
            className="flex-1"
          >
            Ver Detalhes
          </Button>
          <Button
            size="sm"
            onClick={() => onSelect?.(product)}
            className="flex-1"
          >
            Selecionar
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}

