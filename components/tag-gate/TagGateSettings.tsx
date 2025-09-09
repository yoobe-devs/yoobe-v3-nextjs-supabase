'use client'

import { useState, useEffect } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Shield,
  Users,
  Package,
  Settings,
  AlertTriangle,
  CheckCircle,
  Info,
} from 'lucide-react'
import { toast } from 'sonner'

interface TagGateSettingsProps {
  storeId: string
}

export function TagGateSettings({ storeId }: TagGateSettingsProps) {
  const [tagGateEnabled, setTagGateEnabled] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadSettings()
  }, [storeId])

  const loadSettings = async () => {
    try {
      setLoading(true)
      const response = await fetch(
        `/api/v2/gestor/store/tag-settings?store_id=${storeId}`
      )

      if (response.ok) {
        const data = await response.json()
        setTagGateEnabled(data.settings.resgate_por_tags_enabled)
      } else {
        console.error('Erro ao carregar configurações')
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleToggle = async (enabled: boolean) => {
    try {
      setSaving(true)
      const response = await fetch('/api/v2/gestor/store/tag-settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          store_id: storeId,
          resgate_por_tags_enabled: enabled,
        }),
      })

      if (response.ok) {
        setTagGateEnabled(enabled)
        toast.success(
          enabled
            ? 'Tag Gate ativado com sucesso!'
            : 'Tag Gate desativado com sucesso!'
        )
      } else {
        const error = await response.json()
        toast.error(error.error || 'Erro ao atualizar configurações')
      }
    } catch (error) {
      console.error('Erro ao salvar configurações:', error)
      toast.error('Erro ao salvar configurações')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Tag Gate
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-sm text-gray-600">
                Carregando configurações...
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Configuração Principal */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Tag Gate
            <Badge variant={tagGateEnabled ? 'default' : 'secondary'}>
              {tagGateEnabled ? 'Ativo' : 'Inativo'}
            </Badge>
          </CardTitle>
          <CardDescription>
            Controle de acesso a produtos baseado em tags de usuários
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label
                htmlFor="tag-gate-toggle"
                className="text-base font-medium"
              >
                Ativar Resgate por Tags
              </Label>
              <p className="text-sm text-gray-600">
                Com o Tag Gate ativo, produtos só aparecem para usuários com
                tags compatíveis
              </p>
            </div>
            <Switch
              id="tag-gate-toggle"
              checked={tagGateEnabled}
              onCheckedChange={handleToggle}
              disabled={saving}
            />
          </div>

          {tagGateEnabled && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <strong>Tag Gate Ativo:</strong> Produtos sem tags são
                considerados &quot;Geral&quot; e aparecem para todos. Produtos
                com tags só aparecem para usuários que possuem pelo menos uma
                tag em comum.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Como Funciona */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Como Funciona
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <Users className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <h4 className="font-medium mb-1">1. Usuários</h4>
              <p className="text-sm text-gray-600">
                Colaboradores recebem tags (VIP, Gerente, etc.)
              </p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <Package className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <h4 className="font-medium mb-1">2. Produtos</h4>
              <p className="text-sm text-gray-600">
                Produtos são categorizados com tags específicas
              </p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <Shield className="h-8 w-8 mx-auto mb-2 text-purple-600" />
              <h4 className="font-medium mb-1">3. Controle</h4>
              <p className="text-sm text-gray-600">
                Acesso baseado na interseção de tags
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Regras de Negócio */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Regras de Negócio
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium">Produtos sem tags</h4>
              <p className="text-sm text-gray-600">
                Considerados &quot;Geral&quot; e visíveis para todos os usuários
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium">Produtos com tags</h4>
              <p className="text-sm text-gray-600">
                Visíveis apenas para usuários que possuem pelo menos uma tag em
                comum
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium">Usuários sem tags</h4>
              <p className="text-sm text-gray-600">
                Veem apenas produtos &quot;Geral&quot; (sem tags específicas)
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium">Lógica ANY</h4>
              <p className="text-sm text-gray-600">
                Basta ter uma tag em comum para acessar o produto
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ações Rápidas */}
      <Card>
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
          <CardDescription>
            Gerencie tags de usuários e produtos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => window.open('/admin/tags', '_blank')}
            >
              <Package className="h-4 w-4 mr-2" />
              Gerenciar Tags
            </Button>
            <Button
              variant="outline"
              onClick={() => window.open('/admin/usuarios', '_blank')}
            >
              <Users className="h-4 w-4 mr-2" />
              Gerenciar Usuários
            </Button>
            <Button
              variant="outline"
              onClick={() => window.open('/admin/produtos', '_blank')}
            >
              <Package className="h-4 w-4 mr-2" />
              Gerenciar Produtos
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
