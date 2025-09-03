"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/auth/auth-provider-simple'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
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

export default function NovaEmpresaPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    country: 'Brasil',
    postal_code: '',
    website: '',
    description: '',
    logo_url: '',
    point_rate: '0.1',
    allow_points_only: false,
    allow_mixed_payments: false,
    stripe_account_id_br: '',
    stripe_account_id_us: '',
    status: 'active'
  })

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.email) {
      toast.error('Nome e email são obrigatórios')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/companies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          country: formData.country,
          postal_code: formData.postal_code,
          website: formData.website,
          description: formData.description,
          logo_url: formData.logo_url,
          point_rate: parseFloat(formData.point_rate),
          allow_points_only: formData.allow_points_only,
          allow_mixed_payments: formData.allow_mixed_payments,
          stripe_account_id_br: formData.stripe_account_id_br || null,
          stripe_account_id_us: formData.stripe_account_id_us || null,
          status: formData.status
        }),
      })

      const result = await response.json()

      if (response.ok) {
        toast.success('Empresa criada com sucesso!')
        router.push('/admin/empresas')
      } else {
        throw new Error(result.error || 'Erro ao criar empresa')
      }
    } catch (error) {
      console.error('Erro ao criar empresa:', error)
      toast.error(error instanceof Error ? error.message : 'Erro ao criar empresa')
    } finally {
      setLoading(false)
    }
  }

  const estados = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 
    'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 
    'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
  ]

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Nova Empresa
                </CardTitle>
                <CardDescription>
                  Preencha as informações da empresa
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Nome e Email */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nome da Empresa *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        placeholder="Ex: Minha Empresa LTDA"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        placeholder="contato@empresa.com"
                        required
                      />
                    </div>
                  </div>

                  {/* Telefone e Website */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Telefone</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        placeholder="(11) 99999-9999"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="website">Website</Label>
                      <Input
                        id="website"
                        type="url"
                        value={formData.website}
                        onChange={(e) => handleInputChange('website', e.target.value)}
                        placeholder="https://www.empresa.com"
                      />
                    </div>
                  </div>

                  {/* Endereço */}
                  <div className="space-y-2">
                    <Label htmlFor="address">Endereço</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      placeholder="Rua das Flores, 123"
                    />
                  </div>

                  {/* Cidade, Estado e CEP */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">Cidade</Label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                        placeholder="São Paulo"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">Estado</Label>
                      <Select
                        value={formData.state}
                        onValueChange={(value) => handleInputChange('state', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          {estados.map((estado) => (
                            <SelectItem key={estado} value={estado}>
                              {estado}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="postal_code">CEP</Label>
                      <Input
                        id="postal_code"
                        value={formData.postal_code}
                        onChange={(e) => handleInputChange('postal_code', e.target.value)}
                        placeholder="01234-567"
                      />
                    </div>
                  </div>

                  {/* Descrição */}
                  <div className="space-y-2">
                    <Label htmlFor="description">Descrição</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Descreva a empresa..."
                      rows={3}
                    />
                  </div>

                  {/* Configurações de Pontos */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Configurações de Pontos</h3>
                    
                    <div className="space-y-2">
                      <Label htmlFor="point_rate">Taxa de Pontos (R$ por ponto)</Label>
                      <Input
                        id="point_rate"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.point_rate}
                        onChange={(e) => handleInputChange('point_rate', e.target.value)}
                        placeholder="0.10"
                      />
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="points_only"
                          checked={formData.allow_points_only}
                          onCheckedChange={(checked) => handleInputChange('allow_points_only', checked)}
                        />
                        <Label htmlFor="points_only">Permitir pagamento apenas com pontos</Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="mixed_payments"
                          checked={formData.allow_mixed_payments}
                          onCheckedChange={(checked) => handleInputChange('allow_mixed_payments', checked)}
                        />
                        <Label htmlFor="mixed_payments">Permitir pagamento misto (pontos + dinheiro)</Label>
                      </div>
                    </div>
                  </div>

                  {/* Stripe Accounts */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Contas Stripe</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="stripe_br">Stripe Account ID (Brasil)</Label>
                        <Input
                          id="stripe_br"
                          value={formData.stripe_account_id_br}
                          onChange={(e) => handleInputChange('stripe_account_id_br', e.target.value)}
                          placeholder="acct_..."
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="stripe_us">Stripe Account ID (EUA)</Label>
                        <Input
                          id="stripe_us"
                          value={formData.stripe_account_id_us}
                          onChange={(e) => handleInputChange('stripe_account_id_us', e.target.value)}
                          placeholder="acct_..."
                        />
                      </div>
                    </div>
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
                        <SelectItem value="active">Ativa</SelectItem>
                        <SelectItem value="inactive">Inativa</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Submit */}
                  <div className="flex gap-4">
                    <Button
                      type="submit"
                      disabled={loading}
                      className="flex-1"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Criando...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Criar Empresa
                        </>
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.back()}
                      disabled={loading}
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
                  Adicione o logo da empresa
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ImageUpload
                  currentImage={formData.logo_url}
                  onImageUpload={async (file: File) => {
                    const objectUrl = URL.createObjectURL(file)
                    handleInputChange('logo_url', objectUrl)
                  }}
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
                <p>• Taxa de pontos padrão: R$ 0,10 por ponto</p>
                <p>• Logo é opcional</p>
                <p>• Contas Stripe são opcionais</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
