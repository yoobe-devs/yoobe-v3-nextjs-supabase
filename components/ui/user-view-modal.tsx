"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { 
  User, 
  Mail, 
  Building2, 
  Star, 
  ShoppingCart, 
  Calendar,
  MapPin,
  Briefcase,
  Edit,
  X
} from "lucide-react"

interface UserData {
  id: string
  name: string
  full_name: string
  email: string
  role: 'admin' | 'user' | 'manager'
  status: 'active' | 'inactive' | 'suspended'
  points_balance: number
  department: string
  position: string
  company_id: string
  avatar_url: string
  created_at: string
  company?: {
    name: string
  }
  orders_count?: number
}

interface UserViewModalProps {
  user: UserData | null
  isOpen: boolean
  onClose: () => void
  onEdit?: (user: UserData) => void
}

export function UserViewModal({ user, isOpen, onClose, onEdit }: UserViewModalProps) {
  const [imageError, setImageError] = useState(false)

  if (!user) return null

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Ativo</Badge>
      case 'inactive':
        return <Badge className="bg-red-100 text-red-800">Inativo</Badge>
      case 'suspended':
        return <Badge className="bg-yellow-100 text-yellow-800">Suspenso</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <Badge className="bg-purple-100 text-purple-800">Administrador</Badge>
      case 'manager':
        return <Badge className="bg-blue-100 text-blue-800">Gerente</Badge>
      case 'user':
        return <Badge className="bg-gray-100 text-gray-800">Usuário</Badge>
      default:
        return <Badge variant="secondary">{role}</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getImageUrl = () => {
    if (imageError || !user.avatar_url) {
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || user.full_name)}&background=1e40af&color=ffffff&size=300`
    }
    return user.avatar_url
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold">Detalhes do Usuário</DialogTitle>
            <div className="flex gap-2">
              {onEdit && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onEdit(user)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Avatar e Informações Básicas */}
          <div className="space-y-4">
            <div className="relative">
              <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                <img
                  src={getImageUrl()}
                  alt={user.name || user.full_name}
                  className="w-full h-full object-cover"
                  onError={() => setImageError(true)}
                />
              </div>
              <div className="absolute top-2 right-2">
                {getStatusBadge(user.status)}
              </div>
            </div>
            
            {/* Estatísticas Rápidas */}
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <Star className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Pontos</p>
                  <p className="text-lg font-bold">{user.points_balance || 0}</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 text-center">
                  <ShoppingCart className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Pedidos</p>
                  <p className="text-lg font-bold">{user.orders_count || 0}</p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Informações Detalhadas */}
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {user.name || user.full_name}
              </h2>
              <div className="flex gap-2 mb-3">
                {getRoleBadge(user.role)}
              </div>
            </div>

            {/* Detalhes */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{user.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Building2 className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Empresa</p>
                  <p className="font-medium">{user.company?.name || 'N/A'}</p>
                </div>
              </div>

              {user.department && (
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Departamento</p>
                    <p className="font-medium">{user.department}</p>
                  </div>
                </div>
              )}

              {user.position && (
                <div className="flex items-center gap-3">
                  <Briefcase className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Cargo</p>
                    <p className="font-medium">{user.position}</p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Data de Cadastro</p>
                  <p className="font-medium">{formatDate(user.created_at)}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">ID do Usuário</p>
                  <p className="font-mono text-sm">{user.id}</p>
                </div>
              </div>
            </div>

            {/* Status e Ações */}
            <div className="pt-4 border-t">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Status da Conta</p>
                  {getStatusBadge(user.status)}
                </div>
                
                <div className="text-right">
                  <p className="text-sm text-gray-500">Tipo de Usuário</p>
                  {getRoleBadge(user.role)}
                </div>
              </div>
            </div>

            {/* Informações Adicionais */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Informações Adicionais</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <p>• Usuário {user.role === 'admin' ? 'administrador' : user.role === 'manager' ? 'gerente' : 'comum'}</p>
                <p>• {user.points_balance || 0} pontos disponíveis</p>
                <p>• {user.orders_count || 0} pedidos realizados</p>
                <p>• Conta criada em {formatDate(user.created_at)}</p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
