'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { RedirectProgress } from '@/components/ui/redirect-progress'
import HomePage from '@/app/page'

function isSafeInternalTarget(target: string) {
  // Allow internal routes only (prevents open-redirect from this transition page)
  return target.startsWith('/')
}

export default function TransicaoPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const targetUrl = useMemo(() => {
    return (
      searchParams.get('to') ||
      searchParams.get('target') ||
      searchParams.get('url') ||
      ''
    ).trim()
  }, [searchParams])

  const message = useMemo(() => {
    return (searchParams.get('message') || 'Redirecionando...').trim()
  }, [searchParams])

  const [isVisible, setIsVisible] = useState(true)
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>(
    'loading'
  )
  const [currentMessage, setCurrentMessage] = useState(message)
  const [hasTarget, setHasTarget] = useState(!!targetUrl)

  useEffect(() => {
    setCurrentMessage(message)
    setHasTarget(!!targetUrl)
  }, [message, targetUrl])

  useEffect(() => {
    if (!targetUrl) {
      // Sem destino, apenas mostra a home sem overlay
      setIsVisible(false)
      return
    }

    if (!isSafeInternalTarget(targetUrl)) {
      setStatus('error')
      setCurrentMessage('Destino inválido (somente rotas internas são permitidas)')
      setProgress(0)
      setIsVisible(true)
      return
    }

    setStatus('loading')
    setProgress(8)
    setIsVisible(true)

    const start = Date.now()
    const interval = window.setInterval(() => {
      const elapsed = Date.now() - start
      const next = Math.min(92, 8 + Math.floor((elapsed / 900) * 84))
      setProgress(next)
    }, 60)

    const timeout = window.setTimeout(() => {
      window.clearInterval(interval)
      setProgress(100)
      setStatus('success')
      setCurrentMessage('Pronto! Indo para o destino...')
      // Slight delay so users can see 100% before navigation
      window.setTimeout(() => window.location.replace(targetUrl), 250)
    }, 950)

    return () => {
      window.clearInterval(interval)
      window.clearTimeout(timeout)
    }
  }, [targetUrl])

  const onCancel = () => {
    setIsVisible(false)
    router.back()
  }

  return (
    <>
      <HomePage />
      {hasTarget && (
        <RedirectProgress
          isVisible={isVisible && status !== 'error'}
          progress={progress}
          message={currentMessage}
          status={status}
          targetUrl={targetUrl || undefined}
          onCancel={onCancel}
        />
      )}
    </>
  )
}


