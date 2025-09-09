'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Eye, ArrowLeft, ToggleLeft, ToggleRight } from 'lucide-react'

export default function ClientReplicatedProductsPage() {
  const params = useParams<{ clientId: string }>()
  const clientId = params?.clientId
  const supabase = createClientComponentClient()
  const router = useRouter()

  const [clientName, setClientName] = useState<string>('')
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState('')
  const [activeFilter, setActiveFilter] = useState<
    'all' | 'active' | 'inactive'
  >('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [clients, setClients] = useState<{ id: string; name: string }[]>([])

  const load = async () => {
    setLoading(true)
    try {
      const [{ data: client }, { data: products }, { data: allClients }] =
        await Promise.all([
          supabase
            .from('companies')
            .select('id,name')
            .eq('id', clientId)
            .single(),
          supabase
            .from('client_products')
            .select(
              '*, base_products ( id, name, base_price, base_points_cost )'
            )
            .eq('client_id', clientId)
            .order('created_at', { ascending: false }),
          supabase
            .from('companies')
            .select('id,name')
            .order('name', { ascending: true }),
        ])
      setClientName(client?.name || '')

      setItems(products || [])
      setClients(allClients || [])
    } catch (e) {
      console.error(e)
      toast.error('Erro ao carregar produtos replicados')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (clientId) load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientId])

  const categories = useMemo(() => {
    // Como não há relação com product_categories, retornar array vazio
    return []
  }, [items])

  const filtered = useMemo(() => {
    const term = q.toLowerCase()
    return items.filter(it => {
      const matchesText =
        !term ||
        (it.name || '').toLowerCase().includes(term) ||
        (it.base_products?.name || '').toLowerCase().includes(term)
      const matchesActive =
        activeFilter === 'all' ||
        (activeFilter === 'active'
          ? it.status === 'active'
          : it.status !== 'active')
      const matchesCategory = true // Sem filtro de categoria por enquanto
      return matchesText && matchesActive && matchesCategory
    })
  }, [items, q, activeFilter, categoryFilter])

  const toggleActive = async (id: string, currentStatus: string) => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active'
      const res = await fetch(
        `/api/clients/${clientId}/products/${id}/status`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            ...(session?.access_token
              ? { Authorization: `Bearer ${session.access_token}` }
              : {}),
          },
          body: JSON.stringify({ status: newStatus }),
        }
      )
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.error || 'Falha ao atualizar')
      toast.success(
        `Produto ${newStatus === 'active' ? 'ativado' : 'inativado'}`
      )
      load()
    } catch (e) {
      console.error(e)
      toast.error(e instanceof Error ? e.message : 'Erro ao atualizar produto')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">
            Carregando produtos replicados...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">Produtos Replicados</h1>
          <p className="text-gray-600">Cliente: {clientName || clientId}</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => router.push('/admin/produtos/catalogo-base')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" /> Voltar ao Catálogo Base
          </Button>
          <select
            className="px-3 py-2 border rounded-md text-sm"
            value={clientId}
            onChange={e =>
              router.push(`/admin/clientes/${e.target.value}/produtos`)
            }
          >
            {clients.map(c => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 flex-wrap">
        <Input
          placeholder="Buscar por nome..."
          value={q}
          onChange={e => setQ(e.target.value)}
          className="max-w-sm"
        />
        <div className="flex items-center gap-2">
          <select
            className="px-3 py-2 border rounded-md text-sm"
            value={activeFilter}
            onChange={e => setActiveFilter(e.target.value as any)}
          >
            <option value="all">Todos</option>
            <option value="active">Ativos</option>
            <option value="inactive">Inativos</option>
          </select>
        </div>
        <div className="text-sm text-gray-600">{filtered.length} itens</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(p => (
          <Card key={p.id}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">
                  {p.name || p.base_products?.name}
                </CardTitle>
                <Badge
                  variant={p.status === 'active' ? 'default' : 'secondary'}
                >
                  {p.status === 'active' ? 'Ativo' : 'Inativo'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-sm text-gray-600">
                <div>Preço: R$ {(p.price || 0).toLocaleString()}</div>
                <div>SKU: {p.final_sku || '—'}</div>
              </div>
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    router.push(`/admin/produtos/${p.base_product_id}`)
                  }
                >
                  <Eye className="h-4 w-4 mr-1" /> Base
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleActive(p.id, p.status)}
                >
                  {p.status === 'active' ? (
                    <>
                      <ToggleRight className="h-4 w-4 mr-1" /> Desativar
                    </>
                  ) : (
                    <>
                      <ToggleLeft className="h-4 w-4 mr-1" /> Ativar
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
