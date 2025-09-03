'use client'

import React, { useState, useEffect } from 'react'
import {
  ShoppingCartIcon,
  WalletIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline'
import { usePointsCheckout } from '@/hooks/usePointsWallet'
import { PointsPrice } from './PointsWallet'

interface Product {
  id: string
  name: string
  price: number
  points_price: number
  stock_quantity?: number
  allow_points: boolean
}

interface PointsCheckoutProps {
  product: Product
  onSuccess?: (redemptionId: string) => void
  onCancel?: () => void
  className?: string
}

export function PointsCheckout({
  product,
  onSuccess,
  onCancel,
  className = '',
}: PointsCheckoutProps) {
  const [qty, setQty] = useState(1)
  const [addressId, setAddressId] = useState<string>('')
  const [addresses, setAddresses] = useState<
    Array<{ id: string; name: string }>
  >([])
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    checkoutWithPoints,
    loading: checkoutLoading,
    error: checkoutError,
  } = usePointsCheckout()

  useEffect(() => {
    // Carregar endereços do usuário (simulado)
    setAddresses([
      { id: 'home', name: 'Casa - Rua das Flores, 123' },
      { id: 'work', name: 'Trabalho - Av. Principal, 456' },
    ])
  }, [])

  const totalPoints = product.points_price * qty
  const hasStock =
    product.stock_quantity === null || product.stock_quantity >= qty

  const handleCheckout = async () => {
    if (!hasStock) {
      setError('Estoque insuficiente')
      return
    }

    if (qty <= 0) {
      setError('Quantidade deve ser maior que zero')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const success = await checkoutWithPoints(
        product.id,
        qty,
        addressId || undefined
      )

      if (success) {
        setShowConfirmation(true)
        onSuccess?.(`redemption_${Date.now()}`) // ID simulado
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }

  if (showConfirmation) {
    return (
      <div
        className={`bg-green-50 border border-green-200 rounded-lg p-6 ${className}`}
      >
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
            <CheckIcon className="h-6 w-6 text-green-600" />
          </div>
          <h3 className="text-lg font-medium text-green-800 mb-2">
            Resgate Aprovado!
          </h3>
          <p className="text-green-700 mb-4">
            Seu produto foi resgatado com sucesso por{' '}
            {totalPoints.toLocaleString()} pontos.
          </p>
          <div className="text-sm text-green-600">
            <p>• Status: Aprovado</p>
            <p>• Entrega estimada: 5-7 dias úteis</p>
            <p>• Você receberá atualizações por email</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-white border border-gray-200 rounded-lg ${className}`}>
      {/* Cabeçalho */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <ShoppingCartIcon className="h-6 w-6 text-blue-600" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Resgate por Pontos
            </h3>
            <p className="text-sm text-gray-600">
              Confirme os detalhes do seu resgate
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Informações do Produto */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-3">Produto</h4>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">{product.name}</p>
              <p className="text-sm text-gray-600">
                Estoque:{' '}
                {product.stock_quantity !== null
                  ? product.stock_quantity
                  : 'Ilimitado'}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Preço em R$</p>
              <p className="font-medium text-gray-900">
                R$ {product.price.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        {/* Quantidade */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Quantidade
          </label>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setQty(Math.max(1, qty - 1))}
              disabled={qty <= 1}
              className="p-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              -
            </button>
            <input
              type="number"
              min="1"
              max={product.stock_quantity || 999}
              value={qty}
              onChange={e => setQty(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-20 text-center border border-gray-300 rounded-md px-3 py-2"
            />
            <button
              onClick={() => setQty(qty + 1)}
              disabled={
                product.stock_quantity !== null && qty >= product.stock_quantity
              }
              className="p-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              +
            </button>
          </div>
        </div>

        {/* Endereço de Entrega */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Endereço de Entrega
          </label>
          <select
            value={addressId}
            onChange={e => setAddressId(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Selecione um endereço</option>
            {addresses.map(address => (
              <option key={address.id} value={address.id}>
                {address.name}
              </option>
            ))}
          </select>
        </div>

        {/* Resumo do Resgate */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-3">Resumo do Resgate</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-blue-700">Produto:</span>
              <span className="text-blue-900">{product.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-700">Quantidade:</span>
              <span className="text-blue-900">{qty}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-700">Preço unitário:</span>
              <PointsPrice points={product.points_price} showIcon={false} />
            </div>
            <div className="border-t border-blue-200 pt-2">
              <div className="flex justify-between">
                <span className="font-medium text-blue-900">
                  Total em pontos:
                </span>
                <PointsPrice points={totalPoints} showIcon={false} />
              </div>
            </div>
          </div>
        </div>

        {/* Alertas */}
        {!hasStock && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
              <span className="text-red-700">
                Estoque insuficiente. Disponível: {product.stock_quantity}
              </span>
            </div>
          </div>
        )}

        {checkoutError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
              <span className="text-red-700">{checkoutError}</span>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
              <span className="text-red-700">{error}</span>
            </div>
          </div>
        )}

        {/* Botões de Ação */}
        <div className="flex justify-end space-x-3">
          {onCancel && (
            <button
              onClick={onCancel}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancelar
            </button>
          )}

          <button
            onClick={handleCheckout}
            disabled={loading || checkoutLoading || !hasStock || !addressId}
            className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading || checkoutLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Processando...</span>
              </>
            ) : (
              <>
                <WalletIcon className="h-4 w-4" />
                <span>Resgatar por {totalPoints.toLocaleString()} pontos</span>
                <ArrowRightIcon className="h-4 w-4" />
              </>
            )}
          </button>
        </div>

        {/* Informações Adicionais */}
        <div className="text-xs text-gray-500 text-center">
          <p>• O resgate será processado imediatamente</p>
          <p>• Pontos serão debitados da sua carteira</p>
          <p>• Entrega estimada em 5-7 dias úteis</p>
        </div>
      </div>
    </div>
  )
}

// Componente compacto para exibir preço em pontos em cards de produto
interface ProductPointsDisplayProps {
  product: Product
  showCheckoutButton?: boolean
  onCheckoutClick?: () => void
  className?: string
}

export function ProductPointsDisplay({
  product,
  showCheckoutButton = false,
  onCheckoutClick,
  className = '',
}: ProductPointsDisplayProps) {
  if (!product.allow_points) {
    return null
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Preço em Pontos */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-600">Preço em pontos:</span>
        <PointsPrice points={product.points_price} />
      </div>

      {/* Comparação de Preços */}
      <div className="text-xs text-gray-500">
        <div className="flex justify-between">
          <span>R$ {product.price.toFixed(2)}</span>
          <span>ou</span>
          <span>{product.points_price} pts</span>
        </div>
      </div>

      {/* Botão de Resgate */}
      {showCheckoutButton && onCheckoutClick && (
        <button
          onClick={onCheckoutClick}
          className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <WalletIcon className="h-4 w-4" />
          <span>Resgatar com Pontos</span>
        </button>
      )}
    </div>
  )
}
