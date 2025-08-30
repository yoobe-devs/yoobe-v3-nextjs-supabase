"use client"

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
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

interface Store {
  id: string
  name: string
  status: string
  logo_url?: string
  company_id: string
  created_at: string
}

export default function EditLojaPage() {
  const params = useParams() as { id?: string }
  const router = useRouter()
  const id = params?.id as string
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [companies, setCompanies] = useState<Company[]>([])

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    company_id: '',
    status: 'active',
    logo_url: ''
  })

  useEffect(() => {
    if (!id) {
      setLoading(false)
      return
    }
    loadStore()
    loadCompanies()
  }, [id])

  const loadStore = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/stores/${id}`)
      
      if (response.ok) {
        const data = await response.json()
        const store = data.store
        
        setFormData({
          name: store.name || '',
          company_id: store.company_id || '',
          status: store.status || 'active',
          logo_url: store.logo_url || ''
        })
      } else {
        throw new Error('Loja não encontrada')
      }
    } catch (error) {
      console.error('Erro ao carregar loja:', error)
      toast.error('Erro ao carregar loja')
      router.push('/admin/lojas')
    } finally {
      setLoading(false)
    }
  }

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

    setSubmitting(true)

    try {
      const storeData = {
        name: formData.name,
        company_id: formData.company_id,
        status: formData.status,
        logo_url: formData.logo_url || null
      }

      const response = await fetch(`/api/stores/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(storeData),
      })

      const result = await response.json()

      if (response.ok) {
        toast.success('Loja atualizada com sucesso!')
        router.push('/admin/lojas')
      } else {
        throw new Error(result.error || 'Erro ao atualizar loja')
      }
    } catch (error) {
      console.error('Erro ao atualizar loja:', error)
      toast.error(error instanceof Error ? error.message : 'Erro ao atualizar loja')
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
              <p>Carregando loja...</p>
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
            onClick={() => router.push('/admin/lojas')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar às Lojas
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Store className="h-5 w-5" />
                  Editar Loja
                </CardTitle>
                <CardDescription>
                  Atualize as informações da loja
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
                      onClick={() => router.push('/admin/lojas')}
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
                <CardTitle>Logo da Loja</CardTitle>
                <CardDescription>
                  Atualize o logo da loja
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ImageUpload
                  onImageUpload={(url: string) => handleInputChange('logo_url', url)}
                  currentImage={formData.logo_url}
                  bucket="company-logos"
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
                <p>• Clique em "Salvar" para aplicar as mudanças</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
