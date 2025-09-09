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
  ArrowLeft,
  ArrowRight,
  Check,
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
} from 'lucide-react'
import { toast } from 'sonner'
import { BudgetTimeline } from './BudgetTimeline'
import { ArtworkUploader } from './ArtworkUploader'
import { CustomizationForm } from './CustomizationForm'
import { ProductionOrderCard } from './ProductionOrderCard'
import { ArtworkList } from './ArtworkList'
import { ProductSelector } from './ProductSelector'

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

interface BudgetWizardProps {
  budget?: Budget
  onSave?: (budget: Budget) => void
  onCancel?: () => void
  mode?: 'create' | 'edit' | 'view'
}

const WIZARD_STEPS = [
  {
    id: 'basic',
    title: 'Informações Básicas',
    description: 'Título, descrição e dados do cliente',
    icon: FileText,
  },
  {
    id: 'products',
    title: 'Produtos',
    description: 'Seleção e configuração dos produtos',
    icon: Package,
  },
  {
    id: 'customization',
    title: 'Customização',
    description: 'Artes, personalização e especificações',
    icon: Palette,
  },
  {
    id: 'review',
    title: 'Revisão',
    description: 'Revisar e enviar orçamento',
    icon: Send,
  },
]

export function BudgetWizard({
  budget,
  onSave,
  onCancel,
  mode = 'create',
}: BudgetWizardProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')

  // Form data
  const [formData, setFormData] = useState<Budget>({
    title: budget?.title || '',
    description: budget?.description || '',
    total_amount: budget?.total_amount || 0,
    status: budget?.status || 'draft',
    budget_items: budget?.budget_items || [],
  })

  // Step-specific data
  const [clientInfo, setClientInfo] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
  })

  const [selectedArtworks, setSelectedArtworks] = useState<string[]>([])
  const [customizations, setCustomizations] = useState<Record<string, any>>({})

  const isViewMode = mode === 'view'
  const isEditMode = mode === 'edit'
  const canEdit =
    !isViewMode &&
    (formData.status === 'draft' || formData.status === 'rejected')

  const updateFormData = (updates: Partial<Budget>) => {
    setFormData(prev => ({ ...prev, ...updates }))
  }

  const nextStep = () => {
    if (currentStep < WIZARD_STEPS.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const goToStep = (step: number) => {
    if (step >= 0 && step < WIZARD_STEPS.length) {
      setCurrentStep(step)
    }
  }

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 0: // Basic info
        return formData.title.trim().length > 0
      case 1: // Products
        return formData.budget_items.length > 0
      case 2: // Customization
        return true // Optional step
      case 3: // Review
        return true
      default:
        return false
    }
  }

  const handleSave = async () => {
    if (!validateStep(currentStep)) {
      toast.error('Por favor, preencha todos os campos obrigatórios')
      return
    }

    setSaving(true)
    try {
      const budgetData = {
        ...formData,
        client_info: clientInfo,
        artworks: selectedArtworks,
        customizations,
      }

      if (onSave) {
        await onSave(budgetData)
      }

      toast.success('Orçamento salvo com sucesso!')
    } catch (error) {
      console.error('Erro ao salvar orçamento:', error)
      toast.error('Erro ao salvar orçamento')
    } finally {
      setSaving(false)
    }
  }

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) {
      toast.error('Por favor, preencha todos os campos obrigatórios')
      return
    }

    setLoading(true)
    try {
      const budgetData = {
        ...formData,
        status: 'pending' as const,
        client_info: clientInfo,
        artworks: selectedArtworks,
        customizations,
      }

      if (onSave) {
        await onSave(budgetData)
      }

      toast.success('Orçamento enviado para aprovação!')
    } catch (error) {
      console.error('Erro ao enviar orçamento:', error)
      toast.error('Erro ao enviar orçamento')
    } finally {
      setLoading(false)
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Título do Orçamento *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={e => updateFormData({ title: e.target.value })}
                    disabled={!canEdit}
                    placeholder="Ex: Orçamento para Evento Corporativo"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={e =>
                      updateFormData({ description: e.target.value })
                    }
                    disabled={!canEdit}
                    rows={4}
                    placeholder="Descreva os detalhes do orçamento..."
                  />
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="clientName">Nome do Cliente</Label>
                  <Input
                    id="clientName"
                    value={clientInfo.name}
                    onChange={e =>
                      setClientInfo(prev => ({ ...prev, name: e.target.value }))
                    }
                    disabled={!canEdit}
                    placeholder="Nome completo"
                  />
                </div>
                <div>
                  <Label htmlFor="clientEmail">Email do Cliente</Label>
                  <Input
                    id="clientEmail"
                    type="email"
                    value={clientInfo.email}
                    onChange={e =>
                      setClientInfo(prev => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                    disabled={!canEdit}
                    placeholder="email@exemplo.com"
                  />
                </div>
                <div>
                  <Label htmlFor="clientCompany">Empresa</Label>
                  <Input
                    id="clientCompany"
                    value={clientInfo.company}
                    onChange={e =>
                      setClientInfo(prev => ({
                        ...prev,
                        company: e.target.value,
                      }))
                    }
                    disabled={!canEdit}
                    placeholder="Nome da empresa"
                  />
                </div>
                <div>
                  <Label htmlFor="clientPhone">Telefone</Label>
                  <Input
                    id="clientPhone"
                    value={clientInfo.phone}
                    onChange={e =>
                      setClientInfo(prev => ({
                        ...prev,
                        phone: e.target.value,
                      }))
                    }
                    disabled={!canEdit}
                    placeholder="(11) 99999-9999"
                  />
                </div>
              </div>
            </div>
          </div>
        )

      case 1:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">
                Seleção de Produtos
              </h3>
              <ProductSelector
                selectedProducts={formData.budget_items.map(item => ({
                  id: item.base_product_id,
                  name: item.base_products?.name || 'Produto',
                  price: item.unit_price || 0,
                  image: item.base_products?.image_url,
                  quantity: item.quantity,
                }))}
                onProductsChange={products => {
                  const budgetItems = products.map(product => ({
                    id: product.id,
                    base_product_id: product.id,
                    quantity: product.quantity,
                    unit_price: product.price,
                    base_products: {
                      id: product.id,
                      name: product.name,
                      base_price: product.price,
                      image_url: product.image,
                    },
                  }))
                  updateFormData({
                    budget_items: budgetItems,
                    total_amount: products.reduce(
                      (total, product) =>
                        total + product.price * product.quantity,
                      0
                    ),
                  })
                }}
                disabled={!canEdit}
              />
            </div>

            {formData.budget_items.length > 0 && (
              <div className="border-t pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">
                    Total do Orçamento:
                  </span>
                  <span className="text-2xl font-bold text-blue-600">
                    R$ {formData.total_amount.toLocaleString('pt-BR')}
                  </span>
                </div>
              </div>
            )}
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Visão Geral</TabsTrigger>
                <TabsTrigger value="artworks">Artes</TabsTrigger>
                <TabsTrigger value="customization">Customização</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Resumo da Customização</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium mb-2">Artes Vinculadas</h4>
                        <p className="text-sm text-gray-600">
                          {selectedArtworks.length} arte(s) selecionada(s)
                        </p>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Customizações</h4>
                        <p className="text-sm text-gray-600">
                          {Object.keys(customizations).length} item(s)
                          customizado(s)
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="artworks" className="space-y-4">
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
              </TabsContent>

              <TabsContent value="customization" className="space-y-4">
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
              </TabsContent>
            </Tabs>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Informações do Orçamento</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <Label className="text-sm font-medium">Título</Label>
                      <p className="text-sm text-gray-600">{formData.title}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Descrição</Label>
                      <p className="text-sm text-gray-600">
                        {formData.description || 'Sem descrição'}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Total</Label>
                      <p className="text-lg font-semibold text-blue-600">
                        R$ {formData.total_amount.toLocaleString('pt-BR')}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Status</Label>
                      <Badge variant="outline">{formData.status}</Badge>
                    </div>
                  </CardContent>
                </Card>

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
              </div>

              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Produtos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {formData.budget_items.map((item, index) => (
                        <div
                          key={item.id || index}
                          className="flex items-center justify-between p-3 border rounded"
                        >
                          <div>
                            <p className="font-medium">
                              {item.base_products?.name || 'Produto'}
                            </p>
                            <p className="text-sm text-gray-600">
                              {item.quantity}x R${' '}
                              {(item.unit_price || 0).toLocaleString('pt-BR')}
                            </p>
                          </div>
                          <p className="font-medium">
                            R${' '}
                            {(
                              (item.unit_price || 0) * item.quantity
                            ).toLocaleString('pt-BR')}
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {formData.id && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Timeline</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <BudgetTimeline budgetId={formData.id} />
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {mode === 'create'
                ? 'Novo Orçamento'
                : mode === 'edit'
                ? 'Editar Orçamento'
                : 'Visualizar Orçamento'}
            </h1>
            <p className="text-gray-600 mt-1">
              {WIZARD_STEPS[currentStep].description}
            </p>
          </div>
          {onCancel && (
            <Button variant="outline" onClick={onCancel}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
          )}
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-between">
          {WIZARD_STEPS.map((step, index) => {
            const isActive = index === currentStep
            const isCompleted = index < currentStep
            const Icon = step.icon

            return (
              <div key={step.id} className="flex items-center">
                <div className="flex items-center">
                  <button
                    onClick={() => goToStep(index)}
                    disabled={!canEdit && !isViewMode}
                    className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors ${
                      isActive
                        ? 'border-blue-500 bg-blue-500 text-white'
                        : isCompleted
                        ? 'border-green-500 bg-green-500 text-white'
                        : 'border-gray-300 bg-white text-gray-400'
                    }`}
                  >
                    {isCompleted ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      <Icon className="h-5 w-5" />
                    )}
                  </button>
                  <div className="ml-3">
                    <p
                      className={`text-sm font-medium ${
                        isActive
                          ? 'text-blue-600'
                          : isCompleted
                          ? 'text-green-600'
                          : 'text-gray-500'
                      }`}
                    >
                      {step.title}
                    </p>
                  </div>
                </div>
                {index < WIZARD_STEPS.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-4 ${
                      isCompleted ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Content */}
      <Card>
        <CardContent className="p-6">{renderStepContent()}</CardContent>
      </Card>

      {/* Footer */}
      <div className="flex items-center justify-between mt-6">
        <Button
          variant="outline"
          onClick={prevStep}
          disabled={currentStep === 0}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Anterior
        </Button>

        <div className="flex items-center space-x-3">
          {canEdit && (
            <Button variant="outline" onClick={handleSave} disabled={saving}>
              {saving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <FileText className="h-4 w-4 mr-2" />
              )}
              Salvar Rascunho
            </Button>
          )}

          {currentStep < WIZARD_STEPS.length - 1 ? (
            <Button onClick={nextStep} disabled={!validateStep(currentStep)}>
              Próximo
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={loading || !canEdit}>
              {loading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              Enviar para Aprovação
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
