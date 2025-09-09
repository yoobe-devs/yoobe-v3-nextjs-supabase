'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, Search, Building2, Mail, Phone, Users } from 'lucide-react'
import { toast } from 'sonner'
import { EmptyState } from '@/components/ui/empty-state'

interface ClientCompany {
  id: number
  name: string
  doc?: string
  billing_email?: string
  phone?: string
  address: any
  created_at: string
}

export default function ClientesPage() {
  const [clients, setClients] = useState<ClientCompany[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const fetchClients = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...(search && { q: search }),
      })

      const response = await fetch(`/api/v2/admin/clients?${params}`)
      const data = await response.json()

      if (data.success) {
        setClients(data.data)
        setTotalPages(data.pagination.totalPages)
      } else {
        toast.error('Erro ao carregar empresas cliente')
      }
    } catch (error) {
      console.error('Error fetching clients:', error)
      toast.error('Erro ao carregar empresas cliente')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchClients()
  }, [page, search])

  const handleSearch = (value: string) => {
    setSearch(value)
    setPage(1)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Empresas Cliente</h1>
          <p className="text-muted-foreground">
            Gerencie empresas cliente para orçamentos B2B
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nova Empresa
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar empresas..."
                value={search}
                onChange={e => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {clients.length === 0 ? (
            <EmptyState
              icon={Building2}
              title="Nenhuma empresa cliente encontrada"
              description="Comece criando sua primeira empresa cliente para orçamentos B2B"
              action={
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Primeira Empresa
                </Button>
              }
            />
          ) : (
            <div className="space-y-4">
              {clients.map(client => (
                <Card
                  key={client.id}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Building2 className="h-5 w-5 text-blue-500" />
                          <h3 className="text-lg font-semibold">
                            {client.name}
                          </h3>
                        </div>

                        <div className="space-y-1 text-sm text-muted-foreground">
                          {client.doc && (
                            <div className="flex items-center space-x-2">
                              <span className="font-medium">CNPJ:</span>
                              <span>{client.doc}</span>
                            </div>
                          )}

                          {client.billing_email && (
                            <div className="flex items-center space-x-2">
                              <Mail className="h-4 w-4" />
                              <span>{client.billing_email}</span>
                            </div>
                          )}

                          {client.phone && (
                            <div className="flex items-center space-x-2">
                              <Phone className="h-4 w-4" />
                              <span>{client.phone}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm">
                          <Users className="h-4 w-4 mr-2" />
                          Contatos
                        </Button>
                        <Button variant="outline" size="sm">
                          Editar
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-center space-x-2 mt-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
              >
                Anterior
              </Button>
              <span className="text-sm text-muted-foreground">
                Página {page} de {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page + 1)}
                disabled={page === totalPages}
              >
                Próxima
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
