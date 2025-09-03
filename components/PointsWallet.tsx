'use client'

import React from 'react'
import { usePointsWallet } from '@/hooks/usePointsWallet'
import {
  WalletIcon,
  CurrencyDollarIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline'

interface PointsWalletProps {
  showRefreshButton?: boolean
  className?: string
}

export function PointsWallet({
  showRefreshButton = true,
  className = '',
}: PointsWalletProps) {
  const { balance, loading, error, refreshBalance } = usePointsWallet()

  if (loading) {
    return (
      <div
        className={`flex items-center space-x-2 p-4 bg-gray-50 rounded-lg ${className}`}
      >
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
        <span className="text-gray-600">Carregando carteira...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div
        className={`flex items-center space-x-2 p-4 bg-red-50 border border-red-200 rounded-lg ${className}`}
      >
        <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
        <span className="text-red-700">{error}</span>
        {showRefreshButton && (
          <button
            onClick={refreshBalance}
            className="ml-auto text-red-600 hover:text-red-800 text-sm underline"
          >
            Tentar novamente
          </button>
        )}
      </div>
    )
  }

  return (
    <div
      className={`flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg ${className}`}
    >
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-blue-100 rounded-full">
          <WalletIcon className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <p className="text-sm text-gray-600">Saldo de Pontos</p>
          <p className="text-2xl font-bold text-blue-900">
            {balance.toLocaleString()}
          </p>
        </div>
      </div>

      {showRefreshButton && (
        <button
          onClick={refreshBalance}
          className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-full transition-colors"
          title="Atualizar saldo"
        >
          <ArrowPathIcon className="h-5 w-5" />
        </button>
      )}
    </div>
  )
}

// Componente compacto para exibir apenas o saldo
export function PointsBalance({ className = '' }: { className?: string }) {
  const { balance, loading, error } = usePointsWallet()

  if (loading) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
        <span className="text-gray-600 text-sm">...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`flex items-center space-x-1 text-red-600 ${className}`}>
        <ExclamationTriangleIcon className="h-4 w-4" />
        <span className="text-sm">Erro</span>
      </div>
    )
  }

  return (
    <div className={`flex items-center space-x-1 ${className}`}>
      <WalletIcon className="h-4 w-4 text-blue-600" />
      <span className="font-medium text-blue-900">
        {balance.toLocaleString()}
      </span>
      <span className="text-sm text-gray-600">pts</span>
    </div>
  )
}

// Componente para exibir preço em pontos
interface PointsPriceProps {
  points: number
  className?: string
  showIcon?: boolean
}

export function PointsPrice({
  points,
  className = '',
  showIcon = true,
}: PointsPriceProps) {
  return (
    <div className={`flex items-center space-x-1 ${className}`}>
      {showIcon && <WalletIcon className="h-4 w-4 text-green-600" />}
      <span className="font-medium text-green-700">
        {points.toLocaleString()}
      </span>
      <span className="text-sm text-gray-600">pontos</span>
    </div>
  )
}

// Componente para comparar preços (R$ vs Pontos)
interface PriceComparisonProps {
  priceBrl: number
  pointsPrice: number
  className?: string
}

export function PriceComparison({
  priceBrl,
  pointsPrice,
  className = '',
}: PriceComparisonProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-600">Preço em R$:</span>
        <div className="flex items-center space-x-1">
          <CurrencyDollarIcon className="h-4 w-4 text-gray-600" />
          <span className="font-medium">{priceBrl.toFixed(2)}</span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-600">Preço em Pontos:</span>
        <PointsPrice points={pointsPrice} showIcon={false} />
      </div>

      <div className="border-t pt-2">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Taxa de conversão:</span>
          <span className="text-sm font-medium text-blue-600">
            {(pointsPrice / priceBrl).toFixed(1)} pts/R$
          </span>
        </div>
      </div>
    </div>
  )
}
