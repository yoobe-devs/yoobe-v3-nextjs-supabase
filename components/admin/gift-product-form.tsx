"use client"

import { useRef, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { supabase } from '@/lib/supabase'

type Props = {
  initial?: {
    name?: string
    description?: string | null
    price?: number
    image_url?: string | null
    status?: 'active' | 'inactive'
  }
  onSubmit: (data: {
    name: string
    description?: string
    price: number
    image_url?: string
    status?: 'active' | 'inactive'
  }) => Promise<void>
  submitting?: boolean
}

export function GiftProductForm({ initial, onSubmit, submitting }: Props) {
  const [name, setName] = useState(initial?.name ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [price, setPrice] = useState(initial?.price?.toString() ?? '0')
  const [imageUrl, setImageUrl] = useState(initial?.image_url ?? '')
  const [status, setStatus] = useState<'active' | 'inactive'>(initial?.status ?? 'active')
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const bucket = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET || 'public'

  async function handleImageUpload(file: File) {
    if (!file) return
    setUploading(true)
    try {
      const ext = file.name.split('.').pop() || 'jpg'
      const rand = (globalThis.crypto?.randomUUID?.() || Math.random().toString(36).slice(2))
      const path = `gift-products/${rand}.${ext}`
      const { error: upErr } = await supabase.storage.from(bucket).upload(path, file, { upsert: true })
      if (upErr) throw upErr
      const { data } = supabase.storage.from(bucket).getPublicUrl(path)
      if (data?.publicUrl) setImageUrl(data.publicUrl)
    } finally {
      setUploading(false)
    }
  }

  return (
    <form
      className="space-y-4"
      onSubmit={async (e) => {
        e.preventDefault()
        await onSubmit({
          name,
          description: description || undefined,
          price: Number(price || 0),
          image_url: imageUrl || undefined,
          status,
        })
      }}
    >
      <div className="grid gap-2">
        <Label htmlFor="name">Nome</Label>
        <Input id="name" value={name} onChange={e => setName(e.target.value)} required />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="description">Descrição</Label>
        <Textarea id="description" value={description ?? ''} onChange={e => setDescription(e.target.value)} />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="price">Preço</Label>
        <Input id="price" type="number" step="0.01" value={price} onChange={e => setPrice(e.target.value)} required />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="image">Imagem (URL)</Label>
        <Input id="image" value={imageUrl ?? ''} onChange={e => setImageUrl(e.target.value)} placeholder="https://..." />
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={e => {
            const file = e.target.files?.[0]
            if (file) void handleImageUpload(file)
          }}
        />
        <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
          {uploading ? 'Enviando...' : 'Fazer upload'}
        </Button>
        {imageUrl ? (
          <img src={imageUrl} alt="preview" className="mt-2 h-32 w-32 object-cover rounded border" />
        ) : null}
      </div>
      <div className="grid gap-2">
        <Label htmlFor="status">Status</Label>
        <select id="status" className="border rounded px-3 py-2" value={status} onChange={e => setStatus(e.target.value as any)}>
          <option value="active">Ativo</option>
          <option value="inactive">Inativo</option>
        </select>
      </div>
      <Button type="submit" disabled={submitting || uploading}>Salvar</Button>
    </form>
  )
}


