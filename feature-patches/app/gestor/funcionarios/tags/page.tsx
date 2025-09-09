'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Tag,
  User,
  Plus,
  Search,
  Save,
  ArrowLeft,
  Users,
  Settings,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface User {
  id: string
  email: string
  full_name: string
  role: string
  tags: Array<{
    key: string
    value: string
    description?: string
    color?: string
  }>
}

interface AvailableTag {
  id: string
  key: string
  value: string
  description?: string
  color?: string
}

export default function GestorFuncionariosTagsPage() {
  const [users, setUsers] = useState<User[]>([])
  const [availableTags, setAvailableTags] = useState<AvailableTag[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser()

        if (error || !user) {
          router.push('/auth/login')
          return
        }

        const userRole = user.user_metadata?.role
        if (!['gestor', 'manager', 'admin'].includes(userRole)) {
          setError('Você não tem permissão para gerenciar tags de funcionários')
          return
        }

        await Promise.all([fetchUsers(), fetchAvailableTags()])
      } catch (err) {
        console.error('Erro ao verificar autenticação:', err)
        setError('Erro ao verificar autenticação')
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [router, supabase])

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/gestor/employees')
      const data = await response.json()

      if (data.success) {
        // Buscar tags para cada usuário
        const usersWithTags = await Promise.all(
          data.data.map(async (user: any) => {
            const tagsResponse = await fetch(`/api/me/tags?userId=${user.id}`)
            const tagsData = await tagsResponse.json()

            return {
              ...user,
              tags: tagsData.success ? tagsData.data.tags : [],
            }
          })
        )

        setUsers(usersWithTags)
      } else {
        setError(data.error?.message || 'Erro ao carregar funcionários')
      }
    } catch (err) {
      console.error('Erro ao buscar funcionários:', err)
      setError('Erro ao carregar funcionários')
    }
  }

  const fetchAvailableTags = async () => {
    try {
      // Buscar tags disponíveis da empresa
      const { data: tags, error } = await supabase
        .from('employee_tags_system')
        .select('*')
        .eq('is_active', true)
        .order('key, value')

      if (error) {
        console.error('Erro ao buscar tags disponíveis:', error)
        return
      }

      setAvailableTags(tags || [])
    } catch (err) {
      console.error('Erro ao buscar tags disponíveis:', err)
    }
  }

  const handleEditUserTags = (user: User) => {
    setSelectedUser(user)
    setSelectedTagIds(
      user.tags
        .map(
          tag =>
            availableTags.find(t => t.key === tag.key && t.value === tag.value)
              ?.id || ''
        )
        .filter(Boolean)
    )
    setIsDialogOpen(true)
  }

  const handleSaveUserTags = async () => {
    if (!selectedUser) return

    setIsSaving(true)
    try {
      const response = await fetch('/api/me/tags', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          targetUserId: selectedUser.id,
          tagIds: selectedTagIds,
        }),
      })

      const data = await response.json()

      if (data.success) {
        // Atualizar lista de usuários
        await fetchUsers()
        setIsDialogOpen(false)
        setSelectedUser(null)
        setSelectedTagIds([])
      } else {
        setError(data.error?.message || 'Erro ao salvar tags')
      }
    } catch (err) {
      console.error('Erro ao salvar tags:', err)
      setError('Erro ao salvar tags do usuário')
    } finally {
      setIsSaving(false)
    }
  }

  const handleTagToggle = (tagId: string) => {
    setSelectedTagIds(prev =>
      prev.includes(tagId) ? prev.filter(id => id !== tagId) : [...prev, tagId]
    )
  }

  const filteredUsers = users.filter(
    user =>
      user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const groupedTags = availableTags.reduce((acc, tag) => {
    if (!acc[tag.key]) {
      acc[tag.key] = []
    }
    acc[tag.key].push(tag)
    return acc
  }, {} as Record<string, AvailableTag[]>)

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Erro</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push('/')} className="w-full">
              Voltar ao Início
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Voltar
              </Button>

              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Gerenciar Tags de Funcionários
                </h1>
                <p className="text-gray-600">
                  Configure as tags de elegibilidade para cada funcionário
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant="outline" className="gap-1">
                <Users className="h-3 w-3" />
                {users.length} funcionários
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar funcionários..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Users List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers.map(user => (
            <Card key={user.id} className="h-full">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="h-5 w-5" />
                  {user.full_name || user.email}
                </CardTitle>
                <CardDescription>{user.email}</CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium">Tags Atribuídas</span>
                  </div>

                  {user.tags.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {user.tags.map((tag, index) => (
                        <Badge
                          key={`${tag.key}-${tag.value}-${index}`}
                          variant="outline"
                          className="text-xs"
                          style={{
                            borderColor: tag.color || '#3B82F6',
                            color: tag.color || '#3B82F6',
                          }}
                        >
                          {tag.key}: {tag.value}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">
                      Nenhuma tag atribuída
                    </p>
                  )}
                </div>

                <Button
                  onClick={() => handleEditUserTags(user)}
                  variant="outline"
                  size="sm"
                  className="w-full gap-2"
                >
                  <Settings className="h-4 w-4" />
                  Gerenciar Tags
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhum funcionário encontrado
            </h3>
            <p className="text-gray-600">
              {searchTerm
                ? 'Tente ajustar o termo de busca.'
                : 'Não há funcionários cadastrados.'}
            </p>
          </div>
        )}
      </div>

      {/* Edit Tags Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Tag className="h-5 w-5" />
              Gerenciar Tags - {selectedUser?.full_name || selectedUser?.email}
            </DialogTitle>
            <DialogDescription>
              Selecione as tags que este funcionário deve possuir para
              determinar sua elegibilidade aos produtos.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {Object.entries(groupedTags).map(([key, tags]) => (
              <div key={key} className="space-y-3">
                <h4 className="font-medium text-base capitalize">{key}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {tags.map(tag => (
                    <div key={tag.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={tag.id}
                        checked={selectedTagIds.includes(tag.id)}
                        onCheckedChange={() => handleTagToggle(tag.id)}
                      />
                      <label
                        htmlFor={tag.id}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
                      >
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className="text-xs"
                            style={{
                              borderColor: tag.color || '#3B82F6',
                              color: tag.color || '#3B82F6',
                            }}
                          >
                            {tag.value}
                          </Badge>
                          {tag.description && (
                            <span className="text-gray-500 text-xs">
                              {tag.description}
                            </span>
                          )}
                        </div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              disabled={isSaving}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSaveUserTags}
              disabled={isSaving}
              className="gap-2"
            >
              {isSaving ? (
                'Salvando...'
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Salvar Tags
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
