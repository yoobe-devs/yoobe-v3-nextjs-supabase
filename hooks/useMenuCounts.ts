"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

type Counts = {
  employees: number
  products: number
  quotations: number
  orders: number
  updatedAt: string
}

export function useMenuCounts(tenantId?: string) {
  const supabase = createClientComponentClient()
  const [counts, setCounts] = useState<Counts | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const fetchCounts = useCallback(async () => {
    try {
      setError(null)
      const headers: Record<string, string> = {}
      if (tenantId) headers['x-tenant-id'] = tenantId
      const res = await fetch('/api/menu-counts', { headers })
      if (!res.ok) throw new Error('Falha ao carregar contadores')
      const j = (await res.json()) as Counts
      setCounts(j)
    } catch (e: any) {
      setError(e?.message || 'Erro')
    } finally {
      setLoading(false)
    }
  }, [tenantId])

  // Initial load + polling fallback
  useEffect(() => {
    fetchCounts()
    timerRef.current = setInterval(fetchCounts, 60_000) // fallback polling 60s
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [fetchCounts])

  // Realtime subscriptions (Postgres Changes)
  useEffect(() => {
    const channel = supabase.channel('menu-counts')

    const refetch = () => {
      // debounce small window
      if ((refetch as any)._t) clearTimeout((refetch as any)._t)
      ;(refetch as any)._t = setTimeout(() => fetchCounts(), 750)
    }

    const filter = tenantId ? `company_id=eq.${tenantId}` : undefined
    const filterUsers = tenantId ? `company_id=eq.${tenantId}` : undefined
    const filterProd = tenantId ? `client_id=eq.${tenantId}` : undefined

    // users -> employees count
    channel.on('postgres_changes', { event: '*', schema: 'public', table: 'users', filter: filterUsers }, refetch)

    // products -> client_products preferred; fallback company_products
    channel.on('postgres_changes', { event: '*', schema: 'public', table: 'client_products', filter: filterProd }, refetch)
    channel.on('postgres_changes', { event: '*', schema: 'public', table: 'company_products', filter }, refetch)

    // budgets / orcamentos
    channel.on('postgres_changes', { event: '*', schema: 'public', table: 'budgets', filter }, refetch)
    channel.on('postgres_changes', { event: '*', schema: 'public', table: 'orcamentos', filter: tenantId ? `client_id=eq.${tenantId}` : undefined }, refetch)

    // orders
    channel.on('postgres_changes', { event: '*', schema: 'public', table: 'orders', filter }, refetch)

    channel.subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, tenantId, fetchCounts])

  return { counts, loading, error, refetch: fetchCounts }
}

