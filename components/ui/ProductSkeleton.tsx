import React from 'react'

export function ProductSkeleton() {
  return (
    <div className="border rounded-lg shadow-md animate-pulse">
      {/* Imagem */}
      <div className="aspect-square bg-gray-200 rounded-t-lg" />

      {/* Conteúdo */}
      <div className="p-4 space-y-3">
        {/* Título */}
        <div className="h-5 bg-gray-200 rounded w-3/4" />

        {/* Descrição */}
        <div className="space-y-2">
          <div className="h-3 bg-gray-200 rounded w-full" />
          <div className="h-3 bg-gray-200 rounded w-2/3" />
        </div>

        {/* Preço */}
        <div className="flex justify-between items-center">
          <div className="h-6 bg-gray-200 rounded w-20" />
          <div className="h-4 bg-gray-200 rounded w-16" />
        </div>

        {/* Especificações */}
        <div className="space-y-2">
          <div className="flex gap-2">
            <div className="h-4 bg-gray-200 rounded w-12" />
            <div className="h-4 bg-gray-200 rounded w-12" />
            <div className="h-4 bg-gray-200 rounded w-12" />
          </div>
          <div className="flex gap-2">
            <div className="h-4 bg-gray-200 rounded w-8" />
            <div className="h-4 bg-gray-200 rounded w-8" />
            <div className="h-4 bg-gray-200 rounded w-8" />
          </div>
        </div>

        {/* Tags */}
        <div className="flex gap-1">
          <div className="h-4 bg-gray-200 rounded w-16" />
          <div className="h-4 bg-gray-200 rounded w-20" />
        </div>
      </div>

      {/* Botões */}
      <div className="p-4 pt-0 flex gap-2">
        <div className="h-8 bg-gray-200 rounded flex-1" />
        <div className="h-8 bg-gray-200 rounded flex-1" />
      </div>
    </div>
  )
}

