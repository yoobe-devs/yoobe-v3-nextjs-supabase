'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'
import {
  Palette,
  Ruler,
  FileText,
  Plus,
  X,
  Brush,
  Zap,
  Target,
  Printer,
} from 'lucide-react'
import { toast } from 'sonner'

interface CustomizationData {
  method: string
  placements: string[]
  colors: string[]
  size_mm?: {
    width: number
    height: number
  }
  notes?: string
  files?: Array<{
    file_url: string
    mime_type: string
  }>
}

interface CustomizationFormProps {
  budgetId: string
  itemId: string
  initialData?: CustomizationData
  onSave?: (data: CustomizationData) => void
  onCancel?: () => void
  readOnly?: boolean
  className?: string
}

const CUSTOMIZATION_METHODS = [
  {
    value: 'silkscreen',
    label: 'Serigrafia',
    icon: Brush,
    description: 'Tinta aplicada através de tela',
  },
  {
    value: 'bordado',
    label: 'Bordado',
    icon: Target,
    description: 'Fios costurados no tecido',
  },
  {
    value: 'UV',
    label: 'UV',
    icon: Zap,
    description: 'Tinta curada com luz ultravioleta',
  },
  {
    value: 'laser',
    label: 'Laser',
    icon: Printer,
    description: 'Gravura a laser',
  },
  {
    value: 'sublimacao',
    label: 'Sublimação',
    icon: Palette,
    description: 'Transferência por calor',
  },
  {
    value: 'transfer',
    label: 'Transfer',
    icon: FileText,
    description: 'Transferência de imagem',
  },
  {
    value: 'outro',
    label: 'Outro',
    icon: Brush,
    description: 'Método personalizado',
  },
]

const PLACEMENT_OPTIONS = [
  { value: 'front_center', label: 'Frente Central' },
  { value: 'front_left', label: 'Frente Esquerda' },
  { value: 'front_right', label: 'Frente Direita' },
  { value: 'back_center', label: 'Costas Central' },
  { value: 'back_left', label: 'Costas Esquerda' },
  { value: 'back_right', label: 'Costas Direita' },
  { value: 'sleeve_left', label: 'Manga Esquerda' },
  { value: 'sleeve_right', label: 'Manga Direita' },
  { value: 'collar', label: 'Gola' },
  { value: 'pocket', label: 'Bolso' },
  { value: 'hem', label: 'Barra' },
  { value: 'custom', label: 'Personalizado' },
]

const COMMON_COLORS = [
  'Preto',
  'Branco',
  'Vermelho',
  'Azul',
  'Verde',
  'Amarelo',
  'Rosa',
  'Roxo',
  'Laranja',
  'Marrom',
  'Cinza',
  'Dourado',
  'Prata',
  'PMS 186C',
  'PMS 286C',
  'PMS 355C',
  'PMS 1235C',
  'PMS 376C',
  'PMS 2597C',
]

export function CustomizationForm({
  budgetId,
  itemId,
  initialData,
  onSave,
  onCancel,
  readOnly = false,
  className = '',
}: CustomizationFormProps) {
  const [formData, setFormData] = useState<CustomizationData>({
    method: '',
    placements: [],
    colors: [],
    size_mm: { width: 0, height: 0 },
    notes: '',
    files: [],
    ...initialData,
  })

  const [customPlacement, setCustomPlacement] = useState('')
  const [customColor, setCustomColor] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleMethodChange = (method: string) => {
    setFormData(prev => ({ ...prev, method }))
  }

  const handlePlacementToggle = (placement: string) => {
    setFormData(prev => ({
      ...prev,
      placements: prev.placements.includes(placement)
        ? prev.placements.filter(p => p !== placement)
        : [...prev.placements, placement],
    }))
  }

  const addCustomPlacement = () => {
    if (
      customPlacement.trim() &&
      !formData.placements.includes(customPlacement.trim())
    ) {
      setFormData(prev => ({
        ...prev,
        placements: [...prev.placements, customPlacement.trim()],
      }))
      setCustomPlacement('')
    }
  }

  const removePlacement = (placement: string) => {
    setFormData(prev => ({
      ...prev,
      placements: prev.placements.filter(p => p !== placement),
    }))
  }

  const addColor = (color: string) => {
    if (!formData.colors.includes(color)) {
      setFormData(prev => ({
        ...prev,
        colors: [...prev.colors, color],
      }))
    }
  }

  const addCustomColor = () => {
    if (customColor.trim() && !formData.colors.includes(customColor.trim())) {
      setFormData(prev => ({
        ...prev,
        colors: [...prev.colors, customColor.trim()],
      }))
      setCustomColor('')
    }
  }

  const removeColor = (color: string) => {
    setFormData(prev => ({
      ...prev,
      colors: prev.colors.filter(c => c !== color),
    }))
  }

  const handleSizeChange = (field: 'width' | 'height', value: string) => {
    const numValue = parseFloat(value) || 0
    setFormData(prev => ({
      ...prev,
      size_mm: {
        ...prev.size_mm,
        [field]: numValue,
      },
    }))
  }

  const handleSave = async () => {
    if (!formData.method || formData.placements.length === 0) {
      toast.error('Método e posicionamento são obrigatórios')
      return
    }

    setIsLoading(true)
    try {
      const url = initialData
        ? `/api/budgets/${budgetId}/items/${itemId}/customization`
        : `/api/budgets/${budgetId}/items/${itemId}/customization`

      const method = initialData ? 'PATCH' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error('Erro ao salvar customização')
      }

      toast.success('Customização salva com sucesso')
      onSave?.(formData)
    } catch (error) {
      console.error('Erro ao salvar customização:', error)
      toast.error('Erro ao salvar customização')
    } finally {
      setIsLoading(false)
    }
  }

  const selectedMethod = CUSTOMIZATION_METHODS.find(
    m => m.value === formData.method
  )

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Método de Customização */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brush className="h-5 w-5" />
            Método de Customização
          </CardTitle>
          <CardDescription>
            Selecione o método de personalização para este item
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {CUSTOMIZATION_METHODS.map(method => {
              const Icon = method.icon
              return (
                <div
                  key={method.value}
                  className={`
                    p-4 border rounded-lg cursor-pointer transition-colors
                    ${
                      formData.method === method.value
                        ? 'border-primary bg-primary/5'
                        : 'border-muted hover:border-primary/50'
                    }
                    ${readOnly ? 'cursor-not-allowed opacity-50' : ''}
                  `}
                  onClick={() => !readOnly && handleMethodChange(method.value)}
                >
                  <div className="flex items-start gap-3">
                    <Icon className="h-5 w-5 mt-0.5 text-primary" />
                    <div>
                      <h4 className="font-medium">{method.label}</h4>
                      <p className="text-sm text-muted-foreground">
                        {method.description}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Posicionamento */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Posicionamento
          </CardTitle>
          <CardDescription>
            Selecione onde a personalização será aplicada
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {PLACEMENT_OPTIONS.map(placement => (
              <div
                key={placement.value}
                className={`
                  p-3 border rounded-lg cursor-pointer transition-colors text-center
                  ${
                    formData.placements.includes(placement.value)
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-muted hover:border-primary/50'
                  }
                  ${readOnly ? 'cursor-not-allowed opacity-50' : ''}
                `}
                onClick={() =>
                  !readOnly && handlePlacementToggle(placement.value)
                }
              >
                <span className="text-sm font-medium">{placement.label}</span>
              </div>
            ))}
          </div>

          {/* Posicionamento personalizado */}
          {!readOnly && (
            <div className="flex gap-2">
              <Input
                placeholder="Posicionamento personalizado"
                value={customPlacement}
                onChange={e => setCustomPlacement(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && addCustomPlacement()}
              />
              <Button onClick={addCustomPlacement} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Posicionamentos selecionados */}
          {formData.placements.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.placements.map(placement => (
                <Badge
                  key={placement}
                  variant="secondary"
                  className="flex items-center gap-1"
                >
                  {placement}
                  {!readOnly && (
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => removePlacement(placement)}
                    />
                  )}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Cores */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Cores
          </CardTitle>
          <CardDescription>
            Selecione as cores para a personalização
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Cores comuns */}
          <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
            {COMMON_COLORS.map(color => (
              <div
                key={color}
                className={`
                  p-2 border rounded cursor-pointer transition-colors text-center text-sm
                  ${
                    formData.colors.includes(color)
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-muted hover:border-primary/50'
                  }
                  ${readOnly ? 'cursor-not-allowed opacity-50' : ''}
                `}
                onClick={() => !readOnly && addColor(color)}
              >
                {color}
              </div>
            ))}
          </div>

          {/* Cor personalizada */}
          {!readOnly && (
            <div className="flex gap-2">
              <Input
                placeholder="Cor personalizada (ex: PMS 186C)"
                value={customColor}
                onChange={e => setCustomColor(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && addCustomColor()}
              />
              <Button onClick={addCustomColor} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Cores selecionadas */}
          {formData.colors.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.colors.map(color => (
                <Badge
                  key={color}
                  variant="secondary"
                  className="flex items-center gap-1"
                >
                  {color}
                  {!readOnly && (
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => removeColor(color)}
                    />
                  )}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dimensões */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ruler className="h-5 w-5" />
            Dimensões
          </CardTitle>
          <CardDescription>
            Especifique as dimensões da área de personalização
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="width">Largura (mm)</Label>
              <Input
                id="width"
                type="number"
                min="0"
                step="0.1"
                value={formData.size_mm?.width || ''}
                onChange={e => handleSizeChange('width', e.target.value)}
                disabled={readOnly}
                placeholder="Ex: 50"
              />
            </div>
            <div>
              <Label htmlFor="height">Altura (mm)</Label>
              <Input
                id="height"
                type="number"
                min="0"
                step="0.1"
                value={formData.size_mm?.height || ''}
                onChange={e => handleSizeChange('height', e.target.value)}
                disabled={readOnly}
                placeholder="Ex: 30"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Observações */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Observações
          </CardTitle>
          <CardDescription>
            Informações adicionais sobre a customização
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Ex: Sangria de 3mm, área segura de 3mm, fontes em curvas..."
            value={formData.notes || ''}
            onChange={e =>
              setFormData(prev => ({ ...prev, notes: e.target.value }))
            }
            disabled={readOnly}
            rows={4}
          />
        </CardContent>
      </Card>

      {/* Ações */}
      {!readOnly && (
        <div className="flex gap-3 justify-end">
          {onCancel && (
            <Button variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
          )}
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? 'Salvando...' : 'Salvar Customização'}
          </Button>
        </div>
      )}
    </div>
  )
}

