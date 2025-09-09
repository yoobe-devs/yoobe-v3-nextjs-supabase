'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus, Trash2, Save, Send } from 'lucide-react'
import { toast } from 'sonner'
import { CompanySelect } from '@/components/ui/company-select'

interface Store {
  id: string
  name: string
}

interface Company {
  id: string
  name: string
  email: string
}

interface ClientContact {
  id: number
  name: string
  email: string
}

interface BudgetItem {
  id: string
  store_product_id?: string
  catalog_product_id?: string
  product_name: string
  qty: number
  unit_amount: number
  notes?: string
}

export default function NovoOrcamentoPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const audience = searchParams.get('audience') || 'internal'

  const [loading, setLoading] = useState(false)
  const [stores, setStores] = useState<Store[]>([])
  const [userInfo, setUserInfo] = useState<any>(null)

  const [formData, setFormData] = useState({
    company_id: '', // tenant_id - empresa para quem é o orçamento
    title: '',
    description: '',
    client_company_id: '', // customer_tenant_id - empresa cliente (B2B)
    primary_contact_id: '',
    valid_until: '',
    notes_client: '',
  })

  const [items, setItems] = useState<BudgetItem[]>([])

  useEffect(() => {
    // Get user info from localStorage
    const storedUserInfo = localStorage.getItem('userInfo')
    if (storedUserInfo) {
      const user = JSON.parse(storedUserInfo)
      setUserInfo(user)

      // Set default company_id for gestor (their own company)
      if (user.role === 'gestor' && user.company_id) {
        setFormData(prev => ({
          ...prev,
          company_id: user.company_id,
        }))
      }
    }

    fetchStores()
  }, [audience])

  const fetchStores = async () => {
    try {
      const response = await fetch('/api/admin/stores')
      const data = await response.json()
      if (data.success) {
        setStores(data.data)
      }
    } catch (error) {
      console.error('Error fetching stores:', error)
    }
  }

  // Removed old client companies functions - now using CompanySelect component

  const addItem = () => {
    const newItem: BudgetItem = {
      id: Date.now().toString(),
      product_name: '',
      qty: 1,
      unit_amount: 0,
    }
    setItems([...items, newItem])
  }

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id))
  }

  const updateItem = (id: string, field: keyof BudgetItem, value: any) => {
    setItems(
      items.map(item => (item.id === id ? { ...item, [field]: value } : item))
    )
  }

  const calculateTotal = () => {
    return items.reduce((total, item) => total + item.qty * item.unit_amount, 0)
  }

  const handleSubmit = async (action: 'save' | 'submit') => {
    if (!formData.company_id || !formData.title || items.length === 0) {
      toast.error('Preencha todos os campos obrigatórios')
      return
    }

    if (audience === 'external_b2b') {
      if (!formData.client_company_id || !formData.valid_until) {
        toast.error('Para orçamentos B2B, preencha empresa cliente e validade')
        return
      }
    }

    setLoading(true)

    try {
      const payload = {
        tenant_id: formData.company_id, // empresa para quem é o orçamento
        customer_tenant_id:
          audience === 'external_b2b' ? formData.client_company_id : null,
        title: formData.title,
        description: formData.description,
        audience,
        valid_until: formData.valid_until || null,
        notes_client: formData.notes_client || null,
        items: items.map(item => ({
          store_product_id: item.store_product_id || null,
          catalog_product_id: item.catalog_product_id || null,
          qty: item.qty,
          unit_amount: item.unit_amount,
          notes: item.notes,
        })),
      }

      const response = await fetch('/api/v2/gestor/orcamentos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Orçamento criado com sucesso!')

        if (action === 'submit' && audience === 'external_b2b') {
          // Enviar ao cliente
          const submitResponse = await fetch(
            `/api/v2/gestor/orcamentos/${data.data.id}/submit-to-client`,
            {
              method: 'POST',
            }
          )

          if (submitResponse.ok) {
            toast.success('Orçamento enviado ao cliente!')
          }
        }

        router.push('/gestor/orcamentos')
      } else {
        toast.error(data.error || 'Erro ao criar orçamento')
      }
    } catch (error) {
      console.error('Error creating budget:', error)
      toast.error('Erro ao criar orçamento')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            {audience === 'external_b2b'
              ? 'Novo Orçamento B2B'
              : 'Novo Orçamento'}
          </h1>
          <p className="text-muted-foreground">
            {audience === 'external_b2b'
              ? 'Crie um orçamento para enviar a um cliente'
              : 'Crie um orçamento interno'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulário Principal */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informações Básicas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="company_id">Empresa *</Label>
                  <CompanySelect
                    value={formData.company_id}
                    onValueChange={value =>
                      setFormData({ ...formData, company_id: value })
                    }
                    mode="internal"
                    placeholder="Selecione a empresa"
                    disabled={userInfo?.role === 'gestor'} // Gestor só pode criar para sua própria empresa
                  />
                </div>

                <div>
                  <Label htmlFor="title">Título *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={e =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    placeholder="Título do orçamento"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={e =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Descrição do orçamento"
                  rows={3}
                />
              </div>

              {audience === 'external_b2b' && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="client_company_id">
                        Empresa Cliente *
                      </Label>
                      <CompanySelect
                        value={formData.client_company_id}
                        onValueChange={value =>
                          setFormData({
                            ...formData,
                            client_company_id: value,
                            primary_contact_id: '',
                          })
                        }
                        mode="b2b"
                        placeholder="Selecione a empresa cliente"
                      />
                    </div>

                    <div>
                      <Label htmlFor="primary_contact_id">
                        Contato Principal
                      </Label>
                      <Input
                        id="primary_contact_id"
                        value={formData.primary_contact_id}
                        onChange={e =>
                          setFormData({
                            ...formData,
                            primary_contact_id: e.target.value,
                          })
                        }
                        placeholder="Email do contato principal"
                        disabled={!formData.client_company_id}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="valid_until">Validade *</Label>
                      <Input
                        id="valid_until"
                        type="date"
                        value={formData.valid_until}
                        onChange={e =>
                          setFormData({
                            ...formData,
                            valid_until: e.target.value,
                          })
                        }
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="notes_client">Notas para o Cliente</Label>
                    <Textarea
                      id="notes_client"
                      value={formData.notes_client}
                      onChange={e =>
                        setFormData({
                          ...formData,
                          notes_client: e.target.value,
                        })
                      }
                      placeholder="Mensagem que será enviada ao cliente"
                      rows={3}
                    />
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Itens do Orçamento */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Itens do Orçamento</CardTitle>
                <Button onClick={addItem} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Item
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {items.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhum item adicionado. Clique em &quot;Adicionar Item&quot; para
                  começar.
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map(item => (
                    <div
                      key={item.id}
                      className="grid grid-cols-12 gap-4 items-end p-4 border rounded-lg"
                    >
                      <div className="col-span-5">
                        <Label>Produto</Label>
                        <Input
                          value={item.product_name}
                          onChange={e =>
                            updateItem(item.id, 'product_name', e.target.value)
                          }
                          placeholder="Nome do produto"
                        />
                      </div>
                      <div className="col-span-2">
                        <Label>Qtd</Label>
                        <Input
                          type="number"
                          min="1"
                          value={item.qty}
                          onChange={e =>
                            updateItem(
                              item.id,
                              'qty',
                              parseInt(e.target.value) || 1
                            )
                          }
                        />
                      </div>
                      <div className="col-span-2">
                        <Label>Preço Unit.</Label>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          value={item.unit_amount}
                          onChange={e =>
                            updateItem(
                              item.id,
                              'unit_amount',
                              parseFloat(e.target.value) || 0
                            )
                          }
                        />
                      </div>
                      <div className="col-span-2">
                        <Label>Total</Label>
                        <Input
                          value={`R$ ${(item.qty * item.unit_amount).toFixed(2)}`}
                          disabled
                          className="bg-muted"
                        />
                      </div>
                      <div className="col-span-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeItem(item.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Resumo */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Resumo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span>Total de Itens:</span>
                <span>{items.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Quantidade Total:</span>
                <span>{items.reduce((sum, item) => sum + item.qty, 0)}</span>
              </div>
              <div className="flex justify-between font-semibold text-lg">
                <span>Valor Total:</span>
                <span>R$ {calculateTotal().toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-2">
            <Button
              onClick={() => handleSubmit('save')}
              className="w-full"
              disabled={loading}
            >
              <Save className="h-4 w-4 mr-2" />
              Salvar Rascunho
            </Button>

            {audience === 'external_b2b' && (
              <Button
                onClick={() => handleSubmit('submit')}
                className="w-full"
                disabled={loading}
              >
                <Send className="h-4 w-4 mr-2" />
                Enviar ao Cliente
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
