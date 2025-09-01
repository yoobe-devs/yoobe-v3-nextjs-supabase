"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ImageUpload } from '@/components/ui/image-upload'
import { 
  ArrowLeft, 
  Save, 
  Loader2,
  Store,
  AlertCircle
} from 'lucide-react'
import { toast } from 'sonner'

interface Company {
  id: string
  name: string
}

export default function NovaLojaPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [companies, setCompanies] = useState<Company[]>([])

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    company_id: '',
    status: 'active',
    logo_url: ''
  })

  useEffect(() => {
    loadCompanies()
  }, [])

  const loadCompanies = async () => {
    try {
      const response = await fetch('/api/companies')
      if (response.ok) {
        const data = await response.json()
        setCompanies(data.companies || [])
      }
    } catch (error) {
      console.error('Erro ao carregar empresas:', error)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.company_id) {
      toast.error('Preencha todos os campos obrigatórios')
      return
    }

    setLoading(true)

    try {
      const storeData = {
        name: formData.name,
        company_id: formData.company_id,
        status: formData.status,
        logo_url: formData.logo_url || null
      }

      const response = await fetch('/api/stores', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(storeData),
      })

      const result = await response.json()

      if (response.ok) {
        toast.success('Loja criada com sucesso!')
        router.push('/admin/lojas')
      } else {
        throw new Error(result.error || 'Erro ao criar loja')
      }
    } catch (error) {
      console.error('Erro ao criar loja:', error)
      toast.error(error instanceof Error ? error.message : 'Erro ao criar loja')
    } finally {
      setLoading(false)
    }
  }

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
                  <Store className="h-5 w-5" />
                  Nova Loja
                </CardTitle>
                <CardDescription>
                  Preencha as informações da loja
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Nome */}
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome da Loja *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Ex: Loja Corporativa Join"
                      required
                    />
                  </div>

                  {/* Empresa */}
                  <div className="space-y-2">
                    <Label htmlFor="company">Empresa *</Label>
                    <Select
                      value={formData.company_id}
                      onValueChange={(value) => handleInputChange('company_id', value)}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma empresa" />
                      </SelectTrigger>
                      <SelectContent>
                        {companies.map((company) => (
                          <SelectItem key={company.id} value={company.id}>
                            {company.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                        <SelectItem value="maintenance">Manutenção</SelectItem>
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
                          Criar Loja
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
                <CardTitle>Logo da Loja</CardTitle>
                <CardDescription>
                  Adicione um logo para a loja
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ImageUpload
                  onImageUpload={async (file: File) => {
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
                <p>• O domínio será gerado automaticamente</p>
                <p>• Logo é opcional</p>
                <p>• Lojas ativas ficam disponíveis para usuários</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
