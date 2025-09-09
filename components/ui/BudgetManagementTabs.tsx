'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  FileText,
  Package,
  Palette,
  Send,
  Eye,
  Edit,
  Trash2,
  Plus,
  DollarSign,
  Calendar,
  User,
  Building,
  Loader2,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Download,
  Share,
  Copy,
  Archive,
  RefreshCw,
} from 'lucide-react'
import { toast } from 'sonner'
import { BudgetTimeline } from './BudgetTimeline'
import { ArtworkUploader } from './ArtworkUploader'
import { CustomizationForm } from './CustomizationForm'
import { ProductionOrderCard } from './ProductionOrderCard'
import { ArtworkList } from './ArtworkList'

interface BudgetItem {
  id?: string
  base_product_id: string
  quantity: number
  unit_price: number
  custom_price?: number
  custom_points_cost?: number
  notes?: string
  base_products?: {
    id: string
    name: string
    base_price: number
    image_url?: string
  }
}

interface Budget {
  id?: string
  title: string
  description?: string
  total_amount: number
  status: 'draft' | 'pending' | 'approved' | 'rejected'
  created_at?: string
  updated_at?: string
  submitted_at?: string
  budget_items: BudgetItem[]
}

interface BudgetManagementTabsProps {
  budget: Budget
  onUpdate?: (budget: Budget) => void
  onDelete?: (budgetId: string) => void
  onApprove?: (budgetId: string) => void
  onReject?: (budgetId: string) => void
  onReplicate?: (budgetId: string) => void
  mode?: 'gestor' | 'admin' | 'view'
}

export function BudgetManagementTabs({
  budget,
  onUpdate,
  onDelete,
  onApprove,
  onReject,
  onReplicate,
  mode = 'gestor',
}: BudgetManagementTabsProps) {
  const [activeTab, setActiveTab] = useState('overview')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState(false)

  // Form data
  const [formData, setFormData] = useState<Budget>(budget)
  const [clientInfo, setClientInfo] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
  })

  const [selectedArtworks, setSelectedArtworks] = useState<string[]>([])
  const [customizations, setCustomizations] = useState<Record<string, any>>({})
  const [productionOrder, setProductionOrder] = useState<any>(null)

  const isGestor = mode === 'gestor'
  const isAdmin = mode === 'admin'
  const canEdit =
    isGestor && (budget.status === 'draft' || budget.status === 'rejected')
  const canApprove = isAdmin && budget.status === 'pending'
  const canReplicate = isAdmin && budget.status === 'approved'

  useEffect(() => {
    setFormData(budget)
  }, [budget])

  const updateFormData = (updates: Partial<Budget>) => {
    setFormData(prev => ({ ...prev, ...updates }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      if (onUpdate) {
        await onUpdate(formData)
      }
      setEditing(false)
      toast.success('Orçamento atualizado com sucesso!')
    } catch (error) {
      console.error('Erro ao salvar orçamento:', error)
      toast.error('Erro ao salvar orçamento')
    } finally {
      setSaving(false)
    }
  }

  const handleApprove = async () => {
    if (!canApprove) return

    setLoading(true)
    try {
      if (onApprove) {
        await onApprove(budget.id!)
      }
      toast.success('Orçamento aprovado com sucesso!')
    } catch (error) {
      console.error('Erro ao aprovar orçamento:', error)
      toast.error('Erro ao aprovar orçamento')
    } finally {
      setLoading(false)
    }
  }

  const handleReject = async () => {
    if (!canApprove) return

    setLoading(true)
    try {
      if (onReject) {
        await onReject(budget.id!)
      }
      toast.success('Orçamento rejeitado')
    } catch (error) {
      console.error('Erro ao rejeitar orçamento:', error)
      toast.error('Erro ao rejeitar orçamento')
    } finally {
      setLoading(false)
    }
  }

  const handleReplicate = async () => {
    if (!canReplicate) return

    setLoading(true)
    try {
      if (onReplicate) {
        await onReplicate(budget.id!)
      }
      toast.success('Produtos replicados com sucesso!')
    } catch (error) {
      console.error('Erro ao replicar produtos:', error)
      toast.error('Erro ao replicar produtos')
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return <Badge variant="secondary">Rascunho</Badge>
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pendente</Badge>
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">Aprovado</Badge>
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Rejeitado</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft':
        return <Edit className="h-4 w-4" />
      case 'pending':
        return <Clock className="h-4 w-4" />
      case 'approved':
        return <CheckCircle className="h-4 w-4" />
      case 'rejected':
        return <XCircle className="h-4 w-4" />
      default:
        return <AlertCircle className="h-4 w-4" />
    }
  }

  const renderOverviewTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Informações do Orçamento</CardTitle>
                {canEdit && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditing(!editing)}
                  >
                    {editing ? 'Cancelar' : 'Editar'}
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Título</Label>
                {editing ? (
                  <Input
                    value={formData.title}
                    onChange={e => updateFormData({ title: e.target.value })}
                  />
                ) : (
                  <p className="text-sm text-gray-600 mt-1">{formData.title}</p>
                )}
              </div>
              <div>
                <Label className="text-sm font-medium">Descrição</Label>
                {editing ? (
                  <Textarea
                    value={formData.description || ''}
                    onChange={e =>
                      updateFormData({ description: e.target.value })
                    }
                    rows={3}
                  />
                ) : (
                  <p className="text-sm text-gray-600 mt-1">
                    {formData.description || 'Sem descrição'}
                  </p>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label className="text-sm font-medium">Total</Label>
                  <p className="text-lg font-semibold text-blue-600">
                    R$ {formData.total_amount.toLocaleString('pt-BR')}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <div className="flex items-center gap-2 mt-1">
                    {getStatusIcon(formData.status)}
                    {getStatusBadge(formData.status)}
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Itens</Label>
                  <p className="text-sm text-gray-600 mt-1">
                    {formData.budget_items.length} produtos
                  </p>
                </div>
              </div>
              {editing && (
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setEditing(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleSave} disabled={saving}>
                    {saving ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : null}
                    Salvar
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Produtos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {formData.budget_items.map((item, index) => (
                  <div
                    key={item.id || index}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden">
                        {item.base_products?.image_url ? (
                          <img
                            src={item.base_products.image_url}
                            alt={item.base_products.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <Package className="h-6 w-6" />
                          </div>
                        )}
                      </div>
                      <div>
                        <h4 className="font-medium">
                          {item.base_products?.name || 'Produto'}
                        </h4>
                        <p className="text-sm text-gray-600">
                          R$ {(item.unit_price || 0).toLocaleString('pt-BR')}{' '}
                          cada
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">
                        Quantidade: {item.quantity}
                      </p>
                      <p className="font-medium">
                        R${' '}
                        {(
                          (item.unit_price || 0) * item.quantity
                        ).toLocaleString('pt-BR')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informações do Cliente</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label className="text-sm font-medium">Nome</Label>
                <p className="text-sm text-gray-600">
                  {clientInfo.name || 'Não informado'}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium">Email</Label>
                <p className="text-sm text-gray-600">
                  {clientInfo.email || 'Não informado'}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium">Empresa</Label>
                <p className="text-sm text-gray-600">
                  {clientInfo.company || 'Não informado'}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium">Telefone</Label>
                <p className="text-sm text-gray-600">
                  {clientInfo.phone || 'Não informado'}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ações</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {canEdit && (
                <Button className="w-full" onClick={() => setEditing(true)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Editar Orçamento
                </Button>
              )}

              {canApprove && (
                <div className="space-y-2">
                  <Button
                    className="w-full bg-green-600 hover:bg-green-700"
                    onClick={handleApprove}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Aprovar
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleReject}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Rejeitar
                  </Button>
                </div>
              )}

              {canReplicate && (
                <Button
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  onClick={handleReplicate}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Replicar Produtos
                </Button>
              )}

              <div className="border-t pt-3 space-y-2">
                <Button variant="outline" size="sm" className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar PDF
                </Button>
                <Button variant="outline" size="sm" className="w-full">
                  <Share className="h-4 w-4 mr-2" />
                  Compartilhar
                </Button>
                <Button variant="outline" size="sm" className="w-full">
                  <Copy className="h-4 w-4 mr-2" />
                  Duplicar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )

  const renderArtworksTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Gerenciar Artes</CardTitle>
        </CardHeader>
        <CardContent>
          <ArtworkUploader
            onUpload={artwork => {
              setSelectedArtworks(prev => [...prev, artwork.id])
            }}
          />
          <div className="mt-6">
            <ArtworkList
              budgetId={formData.id}
              onSelect={artworkId => {
                setSelectedArtworks(prev =>
                  prev.includes(artworkId)
                    ? prev.filter(id => id !== artworkId)
                    : [...prev, artworkId]
                )
              }}
              selected={selectedArtworks}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderCustomizationTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Especificações de Customização</CardTitle>
        </CardHeader>
        <CardContent>
          {formData.budget_items.map((item, index) => (
            <div key={item.id || index} className="mb-6">
              <h4 className="font-medium mb-3">
                {item.base_products?.name || 'Produto'}
              </h4>
              <CustomizationForm
                budgetItemId={item.id}
                onSave={customization => {
                  setCustomizations(prev => ({
                    ...prev,
                    [item.id || index]: customization,
                  }))
                }}
              />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )

  const renderTimelineTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Timeline do Orçamento</CardTitle>
        </CardHeader>
        <CardContent>
          {formData.id && <BudgetTimeline budgetId={formData.id} />}
        </CardContent>
      </Card>
    </div>
  )

  const renderProductionTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Ordem de Produção</CardTitle>
        </CardHeader>
        <CardContent>
          {productionOrder ? (
            <ProductionOrderCard
              productionOrder={productionOrder}
              onUpdate={updatedOrder => setProductionOrder(updatedOrder)}
            />
          ) : (
            <div className="text-center py-12">
              <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhuma ordem de produção
              </h3>
              <p className="text-gray-600 mb-4">
                Crie uma ordem de produção para este orçamento aprovado
              </p>
              {canReplicate && (
                <Button onClick={handleReplicate}>
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Ordem de Produção
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="artworks">Artes</TabsTrigger>
          <TabsTrigger value="customization">Customização</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="production">Produção</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {renderOverviewTab()}
        </TabsContent>

        <TabsContent value="artworks" className="space-y-4">
          {renderArtworksTab()}
        </TabsContent>

        <TabsContent value="customization" className="space-y-4">
          {renderCustomizationTab()}
        </TabsContent>

        <TabsContent value="timeline" className="space-y-4">
          {renderTimelineTab()}
        </TabsContent>

        <TabsContent value="production" className="space-y-4">
          {renderProductionTab()}
        </TabsContent>
      </Tabs>
    </div>
  )
}

