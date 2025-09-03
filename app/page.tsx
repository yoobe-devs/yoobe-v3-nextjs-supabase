'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { YoobeLogo } from '@/components/ui/yoobe-logo'

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    // Por enquanto, redireciona para o landing
    // TODO: Implementar lógica de autenticação para redirecionar para dashboard apropriado
    router.push('/landing')
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center">
        <YoobeLogo className="w-24 h-24 mx-auto mb-6" />
        <h1 className="text-2xl font-bold text-gray-800 mb-2">YOOBE v3.1.0</h1>
        <p className="text-gray-600">Carregando...</p>
      </div>
    </div>
  )
}
