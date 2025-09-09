'use client'

import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Filter, X } from 'lucide-react'

interface DashboardFiltersProps {
  filters: {
    period: string
    department: string
    tags: string
    category: string
    method: string
  }
  onFiltersChange: (filters: any) => void
}

export function DashboardFilters({
  filters,
  onFiltersChange,
}: DashboardFiltersProps) {
  const updateFilter = (key: string, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    })
  }

  const clearFilters = () => {
    onFiltersChange({
      period: '30d',
      department: 'all',
      tags: 'all',
      category: 'all',
      method: 'all',
    })
  }

  const hasActiveFilters =
    filters.department !== 'all' ||
    filters.tags !== 'all' ||
    filters.category !== 'all' ||
    filters.method !== 'all'

  return (
    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4" />
        <span className="text-sm font-medium">Filtros:</span>
      </div>

      {/* Período */}
      <Select
        value={filters.period}
        onValueChange={value => updateFilter('period', value)}
      >
        <SelectTrigger className="w-32">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="7d">7 dias</SelectItem>
          <SelectItem value="30d">30 dias</SelectItem>
          <SelectItem value="90d">90 dias</SelectItem>
        </SelectContent>
      </Select>

      {/* Departamento */}
      <Select
        value={filters.department}
        onValueChange={value => updateFilter('department', value)}
      >
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Departamento" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos</SelectItem>
          <SelectItem value="vendas">Vendas</SelectItem>
          <SelectItem value="marketing">Marketing</SelectItem>
          <SelectItem value="rh">RH</SelectItem>
          <SelectItem value="ti">TI</SelectItem>
        </SelectContent>
      </Select>

      {/* Tags */}
      <Select
        value={filters.tags}
        onValueChange={value => updateFilter('tags', value)}
      >
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Tags" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas</SelectItem>
          <SelectItem value="premium">Premium</SelectItem>
          <SelectItem value="basico">Básico</SelectItem>
          <SelectItem value="promocao">Promoção</SelectItem>
        </SelectContent>
      </Select>

      {/* Categoria */}
      <Select
        value={filters.category}
        onValueChange={value => updateFilter('category', value)}
      >
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Categoria" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas</SelectItem>
          <SelectItem value="eletronicos">Eletrônicos</SelectItem>
          <SelectItem value="roupas">Roupas</SelectItem>
          <SelectItem value="casa">Casa</SelectItem>
          <SelectItem value="esportes">Esportes</SelectItem>
        </SelectContent>
      </Select>

      {/* Método de Resgate */}
      <Select
        value={filters.method}
        onValueChange={value => updateFilter('method', value)}
      >
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Método" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos</SelectItem>
          <SelectItem value="online">Online</SelectItem>
          <SelectItem value="presencial">Presencial</SelectItem>
          <SelectItem value="delivery">Delivery</SelectItem>
        </SelectContent>
      </Select>

      {/* Badges de filtros ativos */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2">
          {filters.department !== 'all' && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Dept: {filters.department}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => updateFilter('department', 'all')}
              />
            </Badge>
          )}
          {filters.tags !== 'all' && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Tag: {filters.tags}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => updateFilter('tags', 'all')}
              />
            </Badge>
          )}
          {filters.category !== 'all' && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Cat: {filters.category}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => updateFilter('category', 'all')}
              />
            </Badge>
          )}
          {filters.method !== 'all' && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Método: {filters.method}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => updateFilter('method', 'all')}
              />
            </Badge>
          )}
        </div>
      )}

      {/* Botão limpar filtros */}
      {hasActiveFilters && (
        <Button variant="outline" size="sm" onClick={clearFilters}>
          <X className="h-4 w-4 mr-1" />
          Limpar
        </Button>
      )}
    </div>
  )
}
