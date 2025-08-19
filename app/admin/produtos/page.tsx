"use client"

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useGiftProducts } from '@/hooks/useGiftProducts'

export default function AdminGiftProductsPage() {
  const { items, loading, error } = useGiftProducts()

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Produtos da Loja</h1>
        <Link href="/admin/produtos/novo"><Button>Novo produto</Button></Link>
      </div>
      {error && <div className="text-red-600">{error}</div>}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading && Array.from({ length: 6 }).map((_, i) => (
          <Card key={i}><CardHeader><div className="w-full h-40 bg-gray-100 rounded" /></CardHeader><CardContent><div className="h-6 bg-gray-100 rounded w-2/3" /></CardContent></Card>
        ))}
        {!loading && items.map(item => (
          <Card key={item.id}>
            <CardHeader>
              <img src={item.image_url || '/placeholder.svg?height=160&width=320'} alt={item.name} className="w-full h-40 object-cover rounded" />
            </CardHeader>
            <CardContent>
              <div className="flex items-start justify-between">
                <CardTitle>{item.name}</CardTitle>
                <Link href={`/admin/produtos/editar/${item.id}`}><Button variant="outline" size="sm">Editar</Button></Link>
              </div>
              <div className="text-sm text-gray-500 mt-2">R$ {Number(item.price).toFixed(2)} • {item.status}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}


