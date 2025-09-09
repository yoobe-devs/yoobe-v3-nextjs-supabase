"use client"

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface StoreLite { id: string; name: string; company_id: string }
interface ProductForm {
  name: string
  description: string | null
  price: number
  points_cost: number | null
  stock_quantity: number | null
  image_url: string | null
  status: 'active' | 'inactive' | 'draft'
}

export default function EditStoreProductPage() {
  const params = useParams() as { id?: string; productId?: string }
  const router = useRouter()
  const supabase = createClientComponentClient()
  const storeId = params?.id as string
  const productId = params?.productId as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [store, setStore] = useState<StoreLite | null>(null)
  const [form, setForm] = useState<ProductForm | null>(null)

  useEffect(() => {
    if (!storeId || !productId) return
    load()
  }, [storeId, productId])

  const load = async () => {
    try {
      setLoading(true)
      const { data: s } = await supabase
        .from('stores')
        .select('id, name, company_id')
        .eq('id', storeId)
        .single()
      if (!s) {
        toast.error('Loja não encontrada')
        router.back()
        return
      }
      setStore(s as StoreLite)

      const { data: p, error: perr } = await supabase
        .from('client_products')
        .select('*')
        .eq('id', productId)
        .eq('client_id', s.company_id)
        .single()
      if (perr || !p) {
        toast.error('Produto não encontrado para esta loja')
        return
      }
      setForm({
        name: p.name || '',
        description: p.description || '',
        price: p.price || 0,
        points_cost: p.points_cost ?? 0,
        stock_quantity: p.stock_quantity ?? 0,
        image_url: p.image_url || '',
        status: (p.status as 'active' | 'inactive' | 'draft') || 'inactive',
      })
    } catch (e) {
      console.error(e)
      toast.error('Erro ao carregar produto')
    } finally {
      setLoading(false)
    }
  }

  const onChange = (key: keyof ProductForm, value: any) => {
    setForm(prev => (prev ? { ...prev, [key]: value } : prev))
  }

  const save = async () => {
    if (!form || !store) return
    try {
      setSaving(true)
      const res = await fetch(`/api/admin/lojas/${storeId}/produtos/${productId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name?.trim(),
          description: form.description || null,
          price: Number(form.price) || 0,
          points_cost: form.points_cost == null ? null : Number(form.points_cost),
          stock_quantity: form.stock_quantity == null ? null : Number(form.stock_quantity),
          image_url: form.image_url || null,
          status: form.status,
        }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || 'Falha ao salvar')
      }
      toast.success('Produto atualizado com sucesso')
      router.push(`/admin/lojas/${storeId}/produtos`)
    } catch (e) {
      console.error(e)
      toast.error(e instanceof Error ? e.message : 'Erro ao salvar produto')
    } finally {
      setSaving(false)
    }
  }

  if (loading || !form) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Voltar
          </Button>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Carregando produto...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Voltar
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Editar Produto</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="name">Nome</Label>
            <Input id="name" value={form.name} onChange={e => onChange('name', e.target.value)} />
          </div>
          <div>
            <Label htmlFor="description">Descrição</Label>
            <Textarea id="description" value={form.description || ''} onChange={e => onChange('description', e.target.value)} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="price">Preço</Label>
              <Input id="price" type="number" step="0.01" value={form.price} onChange={e => onChange('price', e.target.value)} />
            </div>
            <div>
              <Label htmlFor="points">Pontos</Label>
              <Input id="points" type="number" value={form.points_cost ?? 0} onChange={e => onChange('points_cost', e.target.value)} />
            </div>
            <div>
              <Label htmlFor="stock">Estoque</Label>
              <Input id="stock" type="number" value={form.stock_quantity ?? 0} onChange={e => onChange('stock_quantity', e.target.value)} />
            </div>
          </div>
          <div>
            <Label htmlFor="image">URL da Imagem</Label>
            <Input id="image" value={form.image_url || ''} onChange={e => onChange('image_url', e.target.value)} />
          </div>
          <div>
            <Label htmlFor="status">Status</Label>
            <select
              id="status"
              className="border rounded-md px-3 py-2 text-sm w-full"
              value={form.status}
              onChange={e => onChange('status', e.target.value as ProductForm['status'])}
            >
              <option value="active">Ativo</option>
              <option value="inactive">Inativo</option>
              <option value="draft">Rascunho</option>
            </select>
          </div>
          <div className="flex gap-2">
            <Button onClick={save} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Salvar
            </Button>
            <Button variant="outline" onClick={() => router.push(`/admin/lojas/${storeId}/produtos`)}>Cancelar</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
