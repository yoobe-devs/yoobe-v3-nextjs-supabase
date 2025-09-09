'use client'

import { SafeImage } from '@/components/ui/safe-image'
import { Button } from '@/components/ui/button'

export type BaseProductListItem = {
  id: string
  name: string
  thumbnail?: string | null
  badges?: string[]
  priceFrom?: number | null
  pointsFrom?: number | null
  hasVariants?: boolean
  short?: string | null
  tags?: string[]
}

export function CatalogGrid({
  items,
  onSelect,
}: {
  items: BaseProductListItem[]
  onSelect: (id: string) => void
}) {
  // Verificar se items é undefined ou null
  if (!items || !Array.isArray(items)) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <div className="col-span-full text-center py-8 text-gray-500">
          Carregando produtos...
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {items.map(it => (
        <div
          key={it.id}
          className="border rounded overflow-hidden hover:shadow-sm transition"
        >
          <div className="aspect-[3/2] bg-gray-50">
            <SafeImage
              src={it.thumbnail}
              alt={it.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="p-3 space-y-1">
            <div className="font-medium truncate" title={it.name}>
              {it.name}
            </div>
            <div
              className="text-xs text-gray-600 truncate"
              title={it.short || ''}
            >
              {it.short}
            </div>
            <div className="text-sm text-gray-800">
              {it.priceFrom != null && (
                <span>R$ {it.priceFrom.toLocaleString('pt-BR')}</span>
              )}
              {it.pointsFrom != null && (
                <span className="ml-2">• {it.pointsFrom} pts</span>
              )}
            </div>
            <div className="pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onSelect(it.id)}
              >
                Selecionar
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
