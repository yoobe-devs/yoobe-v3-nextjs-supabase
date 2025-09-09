'use client'

import { useEffect, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/select'
import { List, ArrowUp, ArrowDown, Clock } from 'lucide-react'

export type CatalogQuery = {
  q?: string
  minPrice?: number | null
  maxPrice?: number | null
  hasPoints?: boolean
  sort?: 'relevance' | 'name' | 'price_asc' | 'price_desc' | 'newest'
  category?: string
  tag?: string
}

export function CatalogToolbar({
  value,
  onChange,
}: {
  value: CatalogQuery
  onChange: (v: CatalogQuery) => void
}) {
  const [local, setLocal] = useState<CatalogQuery>({ ...value })
  const [categories, setCategories] = useState<
    Array<{ id: string; name: string }>
  >([])
  const [tags, setTags] = useState<Array<{ id: string; name: string }>>([])

  useEffect(() => {
    // carregar categorias e tags
    (async () => {
      try {
        const [cRes, tRes] = await Promise.all([
          fetch('/api/categories')
            .then(r => r.json())
            .catch(() => []),
          fetch('/api/tags')
            .then(r => r.json())
            .catch(() => []),
        ])
        setCategories(
          Array.isArray(cRes)
            ? cRes.map((c: any) => ({ id: c.id, name: c.name }))
            : []
        )
        setTags(
          Array.isArray(tRes)
            ? tRes.map((t: any) => ({ id: t.id, name: t.name }))
            : []
        )
      } catch {
        // Ignore errors
      }
    })()
  }, [])

  useEffect(() => setLocal({ ...value }), [value])

  // debounce changes
  useEffect(() => {
    const t = setTimeout(() => onChange(local), 300)
    return () => clearTimeout(t)
  }, [local])

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 items-end">
      <div className="sm:col-span-2">
        <label className="block text-xs text-gray-600 mb-1">Buscar</label>
        <Input
          placeholder="Nome, SKU, tag"
          value={local.q || ''}
          onChange={e => setLocal(prev => ({ ...prev, q: e.target.value }))}
        />
      </div>
      <div>
        <label className="block text-xs text-gray-600 mb-1">Preço mín</label>
        <Input
          type="number"
          step="0.01"
          value={local.minPrice ?? ''}
          onChange={e =>
            setLocal(p => ({
              ...p,
              minPrice: e.target.value ? Number(e.target.value) : null,
            }))
          }
          className="w-32"
        />
      </div>
      <div>
        <label className="block text-xs text-gray-600 mb-1">Preço máx</label>
        <Input
          type="number"
          step="0.01"
          value={local.maxPrice ?? ''}
          onChange={e =>
            setLocal(p => ({
              ...p,
              maxPrice: e.target.value ? Number(e.target.value) : null,
            }))
          }
          className="w-32"
        />
      </div>
      <div>
        <label className="block text-xs text-gray-600 mb-1">Categoria</label>
        <Select
          value={local.category || 'all'}
          onValueChange={v =>
            setLocal(prev => ({
              ...prev,
              category: v === 'all' ? undefined : v,
            }))
          }
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Todas" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            {categories.map(c => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <label className="block text-xs text-gray-600 mb-1">Tag</label>
        <Select
          value={local.tag || 'all'}
          onValueChange={v =>
            setLocal(prev => ({ ...prev, tag: v === 'all' ? undefined : v }))
          }
        >
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Todas" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            {tags.map(t => (
              <SelectItem key={t.id} value={t.name}>
                {t.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center gap-2">
        <label className="text-sm flex items-center gap-2">
          <input
            type="checkbox"
            checked={!!local.hasPoints}
            onChange={e =>
              setLocal(p => ({ ...p, hasPoints: e.target.checked }))
            }
          />{' '}
          Pontos
        </label>
      </div>
      <div>
        <label className="block text-xs text-gray-600 mb-1">Ordenar por</label>
        <Select
          value={local.sort || 'relevance'}
          onValueChange={v => setLocal(p => ({ ...p, sort: v as any }))}
        >
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Relevância" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="relevance">
              <span className="inline-flex items-center gap-2">
                <List className="h-3.5 w-3.5" /> Relevância
              </span>
            </SelectItem>
            <SelectItem value="name">
              <span className="inline-flex items-center gap-2">
                <List className="h-3.5 w-3.5" /> Nome (A–Z)
              </span>
            </SelectItem>
            <SelectItem value="price_asc">
              <span className="inline-flex items-center gap-2">
                <ArrowUp className="h-3.5 w-3.5" /> Preço (↑)
              </span>
            </SelectItem>
            <SelectItem value="price_desc">
              <span className="inline-flex items-center gap-2">
                <ArrowDown className="h-3.5 w-3.5" /> Preço (↓)
              </span>
            </SelectItem>
            <SelectItem value="newest">
              <span className="inline-flex items-center gap-2">
                <Clock className="h-3.5 w-3.5" /> Recentes
              </span>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button variant="outline" onClick={() => onChange(local)}>
        Aplicar
      </Button>
    </div>
  )
}
