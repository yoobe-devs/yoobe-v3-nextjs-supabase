'use client'

import { useEffect, useState } from 'react'
import {
  listGiftProducts,
  getGiftProduct,
  createGiftProduct,
  updateGiftProduct,
  deleteGiftProduct,
  type GiftProduct,
  type GiftProductCreateInput,
  type GiftProductUpdateInput,
} from '@/lib/queries/gift-products'

export function useGiftProducts() {
  const [items, setItems] = useState<GiftProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refetch = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await listGiftProducts()
      setItems(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Falha ao carregar produtos')
    } finally {
      setLoading(false)
    }
  }

  const create = async (input: GiftProductCreateInput) => {
    const created = await createGiftProduct(input)
    setItems(prev => [created, ...prev])
    return created
  }

  const update = async (input: GiftProductUpdateInput) => {
    const updated = await updateGiftProduct(input)
    setItems(prev => prev.map(p => (p.id === updated.id ? updated : p)))
    return updated
  }

  const remove = async (id: string) => {
    await deleteGiftProduct(id)
    setItems(prev => prev.filter(p => p.id !== id))
    return true
  }

  useEffect(() => {
    refetch()
  }, [])

  return { items, loading, error, refetch, create, update, remove }
}

export function useGiftProduct(id: string | null) {
  const [item, setItem] = useState<GiftProduct | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) { setItem(null); setLoading(false); return }
    const run = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await getGiftProduct(id)
        setItem(data)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Falha ao carregar produto')
      } finally {
        setLoading(false)
      }
    }
    run()
  }, [id])

  return { item, loading, error }
}


