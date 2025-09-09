import { useCallback, useState } from 'react'
import { useToast } from './use-toast'

export interface SmartToastOptions {
  title: string
  description?: string
  variant?: 'default' | 'success' | 'warning' | 'destructive'
  duration?: number
  showOnEmpty?: boolean // Se deve mostrar toast quando não há dados
}

export function useSmartToast() {
  const { toast } = useToast()
  const [hasData, setHasData] = useState(false)

  const smartToast = useCallback(
    ({
      title,
      description,
      variant = 'default',
      duration = 5000,
      showOnEmpty = false,
    }: SmartToastOptions) => {
      // Se não deve mostrar em telas vazias e não há dados, não mostra o toast
      if (!showOnEmpty && !hasData) {
        return
      }

      toast({
        title,
        description,
        variant,
        duration,
      })
    },
    [toast, hasData]
  )

  const setDataState = useCallback((hasDataState: boolean) => {
    setHasData(hasDataState)
  }, [])

  const showSuccess = useCallback(
    (title: string, description?: string) => {
      smartToast({ title, description, variant: 'success' })
    },
    [smartToast]
  )

  const showError = useCallback(
    (title: string, description?: string, showOnEmpty = false) => {
      smartToast({ title, description, variant: 'destructive', showOnEmpty })
    },
    [smartToast]
  )

  const showWarning = useCallback(
    (title: string, description?: string) => {
      smartToast({ title, description, variant: 'warning' })
    },
    [smartToast]
  )

  const showInfo = useCallback(
    (title: string, description?: string) => {
      smartToast({ title, description, variant: 'default' })
    },
    [smartToast]
  )

  return {
    smartToast,
    setDataState,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  }
}
