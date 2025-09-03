'use client'

import React, { useState, useEffect } from 'react'
import {
  Cog6ToothIcon,
  CurrencyDollarIcon,
  ArrowPathIcon,
  CheckIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'

interface ConversionRule {
  id: string
  points_per_currency: number
  rounding_mode: 'ceil' | 'floor' | 'round'
  status: 'active' | 'scheduled' | 'inactive'
  effective_from: string
  effective_to?: string
  created_at: string
}

interface PointsConversionConfigProps {
  className?: string
}

export function PointsConversionConfig({
  className = '',
}: PointsConversionConfigProps) {
  const [rules, setRules] = useState<ConversionRule[]>([])
  const [activeRule, setActiveRule] = useState<ConversionRule | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    points_per_currency: 10,
    rounding_mode: 'ceil' as 'ceil' | 'floor' | 'round',
    min_points: 0,
    max_points: '',
    effective_from: new Date().toISOString().slice(0, 16),
    effective_to: '',
  })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchConversionRules()
  }, [])

  const fetchConversionRules = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/gestor/points-conversion')
      if (!response.ok) {
        throw new Error('Erro ao carregar regras de conversão')
      }

      const data = await response.json()
      setRules(data.data.rules_history || [])
      setActiveRule(data.data.active_rule)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setSubmitting(true)
      setError(null)

      const response = await fetch('/api/gestor/points-conversion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          max_points: formData.max_points || null,
          effective_to: formData.effective_to || null,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error?.message || 'Erro ao criar regra')
      }

      // Recarregar regras
      await fetchConversionRules()

      // Resetar formulário
      setFormData({
        points_per_currency: 10,
        rounding_mode: 'ceil',
        min_points: 0,
        max_points: '',
        effective_from: new Date().toISOString().slice(0, 16),
        effective_to: '',
      })
      setShowForm(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setSubmitting(false)
    }
  }

  const activateRule = async (ruleId: string) => {
    try {
      setError(null)

      const response = await fetch(
        `/api/gestor/points-conversion/${ruleId}/activate`,
        {
          method: 'PUT',
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error?.message || 'Erro ao ativar regra')
      }

      // Recarregar regras
      await fetchConversionRules()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    }
  }

  const calculatePreview = (
    pointsPerCurrency: number,
    roundingMode: string
  ) => {
    const values = [100, 50, 25, 10, 5]
    const preview: Record<string, number> = {}

    values.forEach(value => {
      let points: number
      switch (roundingMode) {
        case 'ceil':
          points = Math.ceil(value * pointsPerCurrency)
          break
        case 'floor':
          points = Math.floor(value * pointsPerCurrency)
          break
        case 'round':
          points = Math.round(value * pointsPerCurrency)
          break
        default:
          points = Math.ceil(value * pointsPerCurrency)
      }
      preview[`brl_${value}`] = points
    })

    return preview
  }

  if (loading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Carregando configurações...</span>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Cog6ToothIcon className="h-8 w-8 text-blue-600" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Conversão de Pontos
            </h2>
            <p className="text-gray-600">
              Configure como R$ se converte em pontos
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          {showForm ? 'Cancelar' : 'Nova Regra'}
        </button>
      </div>

      {/* Regra Ativa */}
      {activeRule && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-green-800">
                Regra Ativa
              </h3>
              <p className="text-green-700">
                {activeRule.points_per_currency} pontos por R$1 (
                {activeRule.rounding_mode === 'ceil'
                  ? 'arredondamento para cima'
                  : activeRule.rounding_mode === 'floor'
                    ? 'arredondamento para baixo'
                    : 'arredondamento normal'}
                )
              </p>
              <p className="text-sm text-green-600 mt-1">
                Ativa desde{' '}
                {new Date(activeRule.effective_from).toLocaleDateString(
                  'pt-BR'
                )}
              </p>
            </div>
            <div className="text-right">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                <CheckIcon className="h-4 w-4 mr-1" />
                Ativa
              </span>
            </div>
          </div>

          {/* Preview */}
          <div className="mt-4 pt-4 border-t border-green-200">
            <h4 className="text-sm font-medium text-green-800 mb-2">
              Preview de Conversão:
            </h4>
            <div className="grid grid-cols-5 gap-4">
              {Object.entries(
                calculatePreview(
                  activeRule.points_per_currency,
                  activeRule.rounding_mode
                )
              ).map(([key, points]) => (
                <div key={key} className="text-center">
                  <div className="text-lg font-bold text-green-900">
                    {points}
                  </div>
                  <div className="text-xs text-green-600">pontos</div>
                  <div className="text-xs text-green-500">
                    R$ {key.replace('brl_', '')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Formulário para Nova Regra */}
      {showForm && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Nova Regra de Conversão
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pontos por R$1 *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={formData.points_per_currency}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      points_per_currency: parseFloat(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Arredondamento *
                </label>
                <select
                  value={formData.rounding_mode}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      rounding_mode: e.target.value as
                        | 'ceil'
                        | 'floor'
                        | 'round',
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="ceil">Para cima (ceil)</option>
                  <option value="floor">Para baixo (floor)</option>
                  <option value="round">Normal (round)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pontos mínimos
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.min_points}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      min_points: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pontos máximos
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.max_points}
                  onChange={e =>
                    setFormData({ ...formData, max_points: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Sem limite"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Efetiva a partir de *
                </label>
                <input
                  type="datetime-local"
                  value={formData.effective_from}
                  onChange={e =>
                    setFormData({ ...formData, effective_from: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Efetiva até
                </label>
                <input
                  type="datetime-local"
                  value={formData.effective_to}
                  onChange={e =>
                    setFormData({ ...formData, effective_to: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Indefinido"
                />
              </div>
            </div>

            {/* Preview em tempo real */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                Preview da Conversão:
              </h4>
              <div className="grid grid-cols-5 gap-4">
                {Object.entries(
                  calculatePreview(
                    formData.points_per_currency,
                    formData.rounding_mode
                  )
                ).map(([key, points]) => (
                  <div key={key} className="text-center">
                    <div className="text-lg font-bold text-blue-900">
                      {points}
                    </div>
                    <div className="text-xs text-gray-600">pontos</div>
                    <div className="text-xs text-gray-500">
                      R$ {key.replace('brl_', '')}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {submitting ? 'Criando...' : 'Criar Regra'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Histórico de Regras */}
      {rules.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Histórico de Regras
            </h3>
          </div>

          <div className="divide-y divide-gray-200">
            {rules.map(rule => (
              <div key={rule.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-900">
                        {rule.points_per_currency} pontos por R$1
                      </span>
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          rule.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : rule.status === 'scheduled'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {rule.status === 'active'
                          ? 'Ativa'
                          : rule.status === 'scheduled'
                            ? 'Agendada'
                            : 'Inativa'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      Arredondamento: {rule.rounding_mode} • Efetiva:{' '}
                      {new Date(rule.effective_from).toLocaleDateString(
                        'pt-BR'
                      )}
                      {rule.effective_to &&
                        ` até ${new Date(rule.effective_to).toLocaleDateString('pt-BR')}`}
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    {rule.status !== 'active' && (
                      <button
                        onClick={() => activateRule(rule.id)}
                        className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                      >
                        Ativar
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Botão de Atualizar */}
      <div className="flex justify-center">
        <button
          onClick={fetchConversionRules}
          className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <ArrowPathIcon className="h-4 w-4" />
          <span>Atualizar</span>
        </button>
      </div>
    </div>
  )
}
