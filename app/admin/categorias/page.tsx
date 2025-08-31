'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

interface Category {
  id: string
  name: string
  description: string | null
  icon: string | null
  color: string | null
  status: string
  created_at: string
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: '',
    color: '#3B82F6'
  })

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      if (!response.ok) throw new Error('Erro ao buscar categorias')
      const data = await response.json()
      setCategories(data)
    } catch (error) {
      console.error('Erro:', error)
      toast.error('Erro ao carregar categorias')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!response.ok) throw new Error('Erro ao criar categoria')
      
      toast.success('Categoria criada com sucesso!')
      setIsDialogOpen(false)
      setFormData({ name: '', description: '', icon: '', color: '#3B82F6' })
      fetchCategories()
    } catch (error) {
      console.error('Erro:', error)
      toast.error('Erro ao criar categoria')
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Carregando categorias...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Categorias de Produtos</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>Nova Categoria</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Nova Categoria</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Nome *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="icon">Ícone</Label>
                <Input
                  id="icon"
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  placeholder="shirt, coffee, laptop, etc."
                />
              </div>
              <div>
                <Label htmlFor="color">Cor</Label>
                <Input
                  id="color"
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">Criar Categoria</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => (
          <Card key={category.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  {category.icon && (
                    <span className="text-2xl">{category.icon}</span>
                  )}
                  {category.name}
                </CardTitle>
                <Badge 
                  variant={category.status === 'active' ? 'default' : 'secondary'}
                  style={{ backgroundColor: category.color || undefined }}
                >
                  {category.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {category.description && (
                <p className="text-sm text-gray-600 mb-4">{category.description}</p>
              )}
              <div className="text-xs text-gray-500">
                Criado em: {new Date(category.created_at).toLocaleDateString('pt-BR')}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {categories.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">Nenhuma categoria encontrada</p>
        </div>
      )}
    </div>
  )
}
