import { useMemo } from 'react'

export default function usePoints() {
  // Minimal placeholder: return zeros
  return useMemo(() => ({ balance: 0, pending: 0, history: [] as any[] }), [])
}
