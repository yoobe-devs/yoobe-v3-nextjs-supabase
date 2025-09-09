"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  ArrowLeft,
  Save,
  Loader2,
  UserPlus,
  Building2
} from "lucide-react"
import { toast } from "sonner"

interface Company {
  id: string
  name: string
  logo_url?: string
}

export default function NovoGestorPage() {
  const [loading, setLoading] = useState(false)
  const [companies, setCompanies] = useState<Company[]>([])
  const [loadingCompanies, setLoadingCompanies] = useState(true)
  const router = useRouter()

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company_id: '',
    password: '',
    confirmPassword: ''
  })

  useEffect(() => {
    loadCompanies()
  }, [])

  const loadCompanies = async () => {
    try {
      setLoadingCompanies(true)
      const response = await fetch('/api/companies')
      
      if (!response.ok) {
        throw new Error('Erro ao carregar empresas')
      }

      const data = await response.json()
      setCompanies(data.companies || [])
    } catch (error) {
      console.error('Erro ao carregar empresas:', error)
      toast.error('Erro ao carregar empresas')
    } finally {
      setLoadingCompanies(false)
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

    // Validações
    if (!formData.name || !formData.email || !formData.company_id || !formData.password) {
      toast.error('Preencha todos os campos obrigatórios')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('As senhas não coincidem')
      return
    }

    if (formData.password.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/admin/gestores', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          company_id: formData.company_id,
          password: formData.password
        }),
      })

      const result = await response.json()

      if (response.ok) {
        toast.success('Gestor criado com sucesso!')
        router.push('/admin/gestores')
      } else {
        throw new Error(result.error || 'Erro ao criar gestor')
      }
    } catch (error) {
      console.error('Erro ao criar gestor:', error)
      toast.error(error instanceof Error ? error.message : 'Erro ao criar gestor')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            onClick={() => router.push('/admin/gestores')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar aos Gestores
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Novo Gestor</h1>
            <p className="text-gray-600">Cadastre um novo gestor para uma empresa</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Informações do Gestor
            </CardTitle>
            <CardDescription>
              Preencha as informações do novo gestor
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Nome */}
              <div>
                <Label htmlFor="name">Nome Completo *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Nome completo do gestor"
                  required
                />
              </div>

              {/* Email */}
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="email@empresa.com"
                  required
                />
              </div>

              {/* Telefone */}
              <div>
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="(11) 99999-9999"
                />
              </div>

              {/* Empresa */}
              <div>
                <Label htmlFor="company">Empresa *</Label>
                <Select
                  value={formData.company_id}
                  onValueChange={(value) => handleInputChange('company_id', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma empresa" />
                  </SelectTrigger>
                  <SelectContent>
                    {loadingCompanies ? (
                      <SelectItem value="loading" disabled>
                        <div className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Carregando empresas...
                        </div>
                      </SelectItem>
                    ) : companies.length === 0 ? (
                      <SelectItem value="empty" disabled>
                        Nenhuma empresa encontrada
                      </SelectItem>
                    ) : (
                      companies.map((company) => (
                        <SelectItem key={company.id} value={company.id}>
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4" />
                            {company.name}
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Senha */}
              <div>
                <Label htmlFor="password">Senha *</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  A senha será enviada por email para o gestor
                </p>
              </div>

              {/* Confirmar Senha */}
              <div>
                <Label htmlFor="confirmPassword">Confirmar Senha *</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  placeholder="Digite a senha novamente"
                  required
                />
              </div>

              {/* Submit */}
              <div className="flex gap-4 pt-4">
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Criando Gestor...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Criar Gestor
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/admin/gestores')}
                  disabled={loading}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Dicas */}
        <Card>
          <CardHeader>
            <CardTitle>Dicas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-gray-600">
            <p>• Campos marcados com * são obrigatórios</p>
            <p>• O gestor receberá um email com as credenciais de acesso</p>
            <p>• O gestor terá acesso apenas aos dados da empresa selecionada</p>
            <p>• A senha pode ser alterada pelo gestor após o primeiro login</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
