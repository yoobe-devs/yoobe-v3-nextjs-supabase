'use client'

import { YoobeLogo } from '@/components/ui/yoobe-logo'
import { RefreshCw } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="text-center px-4 max-w-md mx-auto">
        <div className="mb-8 flex justify-center">
          <YoobeLogo size={80} />
        </div>

        <div className="mb-6">
          <div className="inline-flex items-center justify-center mb-4">
            <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">Em Atualização</h1>
          </div>

          <p className="text-lg text-gray-600 mb-2">
            Estamos trabalhando para melhorar sua experiência
          </p>
          <p className="text-sm text-gray-500">
            Em breve estaremos de volta com novidades!
          </p>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200">
          <p className="text-xs text-gray-400">
            © 2024 Yoobe. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </div>
  )
}
