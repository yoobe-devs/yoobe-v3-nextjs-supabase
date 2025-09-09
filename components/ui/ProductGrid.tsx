import React, { useState, useEffect } from 'react'
import { ProductCard } from './ProductCard'
import { ProductFilters } from './ProductFilters'
import { ProductSkeleton } from './ProductSkeleton'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Search, Filter, Grid, List } from 'lucide-react'

interface ProductGridProps {
  onProductSelect?: (product: any) => void
  onProductViewDetails?: (product: any) => void
  showFilters?: boolean
  showSearch?: boolean
  showViewToggle?: boolean
  initialFilters?: {
    category?: string
    featured?: boolean
    colors?: string[]
    sizes?: string[]
    tags?: string[]
  }
}

export function ProductGrid({
  onProductSelect,
  onProductViewDetails,
  showFilters = true,
  showSearch = true,
  showViewToggle = true,
  initialFilters = {},
}: ProductGridProps) {
  const [products, setProducts] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState({
    category: initialFilters.category || '',
    featured: initialFilters.featured || false,
    colors: initialFilters.colors || [],
    sizes: initialFilters.sizes || [],
    tags: initialFilters.tags || [],
    sort: 'name',
    order: 'asc' as 'asc' | 'desc',
  })
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0,
  })

  // Buscar produtos
  const fetchProducts = async () => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        sort: filters.sort,
        order: filters.order,
      })

      if (searchTerm) params.append('q', searchTerm)
      if (filters.category) params.append('category_id', filters.category)
      if (filters.featured) params.append('featured', 'true')
      if (filters.colors.length > 0)
        params.append('colors', filters.colors.join(','))
      if (filters.sizes.length > 0)
        params.append('sizes', filters.sizes.join(','))

      const response = await fetch(`/api/base-products?${params}`)
      const data = await response.json()

      if (data.success) {
        setProducts(data.data.products)
        setPagination(prev => ({
          ...prev,
          total: data.data.pagination.total,
          totalPages: data.data.pagination.totalPages,
        }))
      } else {
        setError(data.error?.message || 'Erro ao carregar produtos')
      }
    } catch (err) {
      setError('Erro de conexão')
    } finally {
      setLoading(false)
    }
  }

  // Buscar categorias
  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/base-products/categories')
      const data = await response.json()

      if (data.success) {
        setCategories(data.data.categories)
      }
    } catch (err) {
      console.error('Erro ao carregar categorias:', err)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [filters, pagination.page, searchTerm])

  useEffect(() => {
    fetchCategories()
  }, [])

  const handleFilterChange = (newFilters: Partial<typeof filters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const handleSearch = (value: string) => {
    setSearchTerm(value)
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, page }))
  }

  if (loading && products.length === 0) {
    return (
      <div className="space-y-6">
        {showSearch && (
          <div className="flex gap-4 items-center">
            <div className="flex-1">
              <div className="h-10 bg-gray-200 rounded animate-pulse" />
            </div>
            <div className="h-10 w-24 bg-gray-200 rounded animate-pulse" />
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <ProductSkeleton key={i} />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 mb-4">{error}</div>
        <Button onClick={fetchProducts}>Tentar novamente</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Barra de pesquisa e controles */}
      <div className="flex flex-col sm:flex-row gap-4 items-center">
        {showSearch && (
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Buscar produtos..."
              value={searchTerm}
              onChange={e => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        )}

        <div className="flex gap-2">
          <Select
            value={filters.sort}
            onValueChange={value => handleFilterChange({ sort: value })}
          >
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Nome</SelectItem>
              <SelectItem value="base_price">Preço</SelectItem>
              <SelectItem value="lead_time_days">Prazo</SelectItem>
              <SelectItem value="created_at">Data</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              handleFilterChange({
                order: filters.order === 'asc' ? 'desc' : 'asc',
              })
            }
          >
            {filters.order === 'asc' ? '↑' : '↓'}
          </Button>

          {showViewToggle && (
            <div className="flex border rounded-md">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="rounded-r-none"
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="rounded-l-none"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Filtros */}
      {showFilters && (
        <ProductFilters
          categories={categories}
          filters={filters}
          onFiltersChange={handleFilterChange}
        />
      )}

      {/* Grid de produtos */}
      {products.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500 mb-4">Nenhum produto encontrado</div>
          <Button
            variant="outline"
            onClick={() => {
              setSearchTerm('')
              setFilters({
                category: '',
                featured: false,
                colors: [],
                sizes: [],
                tags: [],
                sort: 'name',
                order: 'asc',
              })
            }}
          >
            Limpar filtros
          </Button>
        </div>
      ) : (
        <div
          className={`grid gap-6 ${
            viewMode === 'grid'
              ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
              : 'grid-cols-1'
          }`}
        >
          {products.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              onSelect={onProductSelect}
              onViewDetails={onProductViewDetails}
            />
          ))}
        </div>
      )}

      {/* Paginação */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page === 1}
          >
            Anterior
          </Button>

          <div className="flex gap-1">
            {Array.from(
              { length: Math.min(5, pagination.totalPages) },
              (_, i) => {
                const page = i + 1
                return (
                  <Button
                    key={page}
                    variant={pagination.page === page ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handlePageChange(page)}
                    className="w-8 h-8 p-0"
                  >
                    {page}
                  </Button>
                )
              }
            )}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page === pagination.totalPages}
          >
            Próximo
          </Button>
        </div>
      )}

      {/* Informações de paginação */}
      <div className="text-center text-sm text-gray-500">
        Mostrando {products.length} de {pagination.total} produtos
      </div>
    </div>
  )
}

