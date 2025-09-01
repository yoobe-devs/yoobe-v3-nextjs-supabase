"use client"

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { ImageUpload } from '@/components/ui/image-upload'
import { 
  ArrowLeft, 
  Save, 
  Loader2,
  Building2,
  AlertCircle
} from 'lucide-react'
import { toast } from 'sonner'

interface Company {
  id: string
  name: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  zip_code: string
  website: string
  description: string
  logo_url?: string
  status: string
  points_rate: number
  allow_points_only: boolean
  allow_mixed_payment: boolean
  created_at: string
  updated_at: string
}

export default function EditCompanyPage() {
  const params = useParams() as { id?: string }
  const router = useRouter()
  const id = params?.id as string
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip_code: '',
    website: '',
    description: '',
    status: 'active',
    points_rate: 0.1,
    allow_points_only: false,
    allow_mixed_payment: false,
    logo_url: ''
  })

  useEffect(() => {
    if (!id) {
      setLoading(false)
      return
    }
    loadCompany()
  }, [id])

  const loadCompany = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/companies/${id}`)
      
      if (response.ok) {
        const data = await response.json()
        const company = data.company
        
        setFormData({
          name: company.name || '',
          email: company.email || '',
          phone: company.phone || '',
          address: company.address || '',
          city: company.city || '',
          state: company.state || '',
          zip_code: company.zip_code || '',
          website: company.website || '',
          description: company.description || '',
          status: company.status || 'active',
          points_rate: company.points_rate || 0.1,
          allow_points_only: company.allow_points_only || false,
          allow_mixed_payment: company.allow_mixed_payment || false,
          logo_url: company.logo_url || ''
        })
      } else {
        throw new Error('Empresa não encontrada')
      }
    } catch (error) {
      console.error('Erro ao carregar empresa:', error)
      toast.error('Erro ao carregar empresa')
      router.push('/admin/empresas')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string | number | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.email) {
      toast.error('Preencha todos os campos obrigatórios')
      return
    }

    setSubmitting(true)

    try {
      const companyData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zip_code: formData.zip_code,
        website: formData.website,
        description: formData.description,
        status: formData.status,
        points_rate: formData.points_rate,
        allow_points_only: formData.allow_points_only,
        allow_mixed_payment: formData.allow_mixed_payment,
        logo_url: formData.logo_url || null
      }

      const response = await fetch(`/api/companies/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(companyData),
      })

      const result = await response.json()

      if (response.ok) {
        toast.success('Empresa atualizada com sucesso!')
        router.push('/admin/empresas')
      } else {
        throw new Error(result.error || 'Erro ao atualizar empresa')
      }
    } catch (error) {
      console.error('Erro ao atualizar empresa:', error)
      toast.error(error instanceof Error ? error.message : 'Erro ao atualizar empresa')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p>Carregando empresa...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => router.push('/admin/empresas')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar às Empresas
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Editar Empresa
                </CardTitle>
                <CardDescription>
                  Atualize as informações da empresa
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Nome */}
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome da Empresa *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Ex: Join Tecnologia"
                      required
                    />
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="Ex: contato@jointecnologia.com.br"
                      required
                    />
                  </div>

                  {/* Telefone */}
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefone</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="Ex: (11) 3000-0000"
                    />
                  </div>

                  {/* Website */}
                  <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      value={formData.website}
                      onChange={(e) => handleInputChange('website', e.target.value)}
                      placeholder="Ex: https://www.jointecnologia.com.br"
                    />
                  </div>

                  {/* Endereço */}
                  <div className="space-y-2">
                    <Label htmlFor="address">Endereço</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      placeholder="Ex: Av. Paulista, 1000"
                    />
                  </div>

                  {/* Cidade e Estado */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">Cidade</Label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                        placeholder="Ex: São Paulo"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">Estado</Label>
                      <Input
                        id="state"
                        value={formData.state}
                        onChange={(e) => handleInputChange('state', e.target.value)}
                        placeholder="Ex: SP"
                      />
                    </div>
                  </div>

                  {/* CEP */}
                  <div className="space-y-2">
                    <Label htmlFor="zip_code">CEP</Label>
                    <Input
                      id="zip_code"
                      value={formData.zip_code}
                      onChange={(e) => handleInputChange('zip_code', e.target.value)}
                      placeholder="Ex: 01310-100"
                    />
                  </div>

                  {/* Descrição */}
                  <div className="space-y-2">
                    <Label htmlFor="description">Descrição</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Descrição da empresa..."
                      rows={3}
                    />
                  </div>

                  {/* Status */}
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) => handleInputChange('status', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Ativo</SelectItem>
                        <SelectItem value="inactive">Inativo</SelectItem>
                        <SelectItem value="pending">Pendente</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Taxa de Pontos */}
                  <div className="space-y-2">
                    <Label htmlFor="points_rate">Taxa de Pontos</Label>
                    <Input
                      id="points_rate"
                      type="number"
                      step="0.01"
                      min="0"
                      max="1"
                      value={formData.points_rate}
                      onChange={(e) => handleInputChange('points_rate', parseFloat(e.target.value))}
                      placeholder="0.1"
                    />
                    <p className="text-xs text-gray-500">
                      Taxa de conversão de pontos (0.0 a 1.0)
                    </p>
                  </div>

                  {/* Configurações */}
                  <div className="space-y-4">
                    <Label className="text-base font-medium">Configurações</Label>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="allow_points_only">Apenas Pontos</Label>
                        <p className="text-sm text-gray-500">
                          Permitir pagamento apenas com pontos
                        </p>
                      </div>
                      <Switch
                        id="allow_points_only"
                        checked={formData.allow_points_only}
                        onCheckedChange={(checked) => handleInputChange('allow_points_only', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="allow_mixed_payment">Pagamento Misto</Label>
                        <p className="text-sm text-gray-500">
                          Permitir pagamento com pontos e dinheiro
                        </p>
                      </div>
                      <Switch
                        id="allow_mixed_payment"
                        checked={formData.allow_mixed_payment}
                        onCheckedChange={(checked) => handleInputChange('allow_mixed_payment', checked)}
                      />
                    </div>
                  </div>

                  {/* Submit */}
                  <div className="flex gap-4">
                    <Button
                      type="submit"
                      disabled={submitting}
                      className="flex-1"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Salvando...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Salvar Alterações
                        </>
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.push('/admin/empresas')}
                      disabled={submitting}
                    >
                      Cancelar
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Logo Upload */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Logo da Empresa</CardTitle>
                <CardDescription>
                  Atualize o logo da empresa
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ImageUpload
                  onImageUpload={async (file: File) => {
                    // Aqui você pode integrar com seu storage real; por enquanto usamos URL local
                    const objectUrl = URL.createObjectURL(file)
                    handleInputChange('logo_url', objectUrl)
                  }}
                  currentImage={formData.logo_url}
                />
              </CardContent>
            </Card>

            {/* Dicas */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  Dicas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-gray-600">
                <p>• Campos marcados com * são obrigatórios</p>
                <p>• Logo é opcional</p>
                <p>• Taxa de pontos deve estar entre 0.0 e 1.0</p>
                <p>• Clique em "Salvar" para aplicar as mudanças</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
