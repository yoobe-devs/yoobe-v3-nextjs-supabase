'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { Settings, LogOut, User, Building, Crown, Shield } from 'lucide-react'
import { RealtimeNotificationBell } from '@/components/notifications/realtime-notification-bell'

interface HeaderProps {
  user?: {
    name: string
    email: string
    role: 'superadmin' | 'admin_gestor' | 'gestor' | 'funcionario'
    company_name?: string
  }
  onLogout?: () => void
  onProfile?: () => void
  onSettings?: () => void
}

export default function Header({
  user,
  onLogout,
  onProfile,
  onSettings,
}: HeaderProps) {
  const [isOpen, setIsOpen] = useState(false)

  const getRoleBadge = (role: string) => {
    const roleConfig = {
      superadmin: {
        variant: 'default',
        icon: Crown,
        label: 'Super Admin',
        color: 'bg-purple-100 text-purple-800',
      },
      admin_gestor: {
        variant: 'default',
        icon: Crown,
        label: 'Admin Gestor',
        color: 'bg-blue-100 text-blue-800',
      },
      gestor: {
        variant: 'default',
        icon: Shield,
        label: 'Gestor',
        color: 'bg-green-100 text-green-800',
      },
      funcionario: {
        variant: 'secondary',
        icon: User,
        label: 'Funcionário',
        color: 'bg-gray-100 text-gray-800',
      },
    }

    const config =
      roleConfig[role as keyof typeof roleConfig] || roleConfig.funcionario
    const Icon = config.icon

    return (
      <Badge className={`flex items-center gap-1 ${config.color}`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    )
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo and Brand */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">Y</span>
            </div>
            <span className="font-bold text-xl">Yoobe</span>
          </div>

          {user?.company_name && (
            <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
              <Building className="w-4 h-4" />
              <span>{user.company_name}</span>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          {/* Add navigation items here if needed */}
        </nav>

        {/* Right Side */}
        <div className="flex items-center gap-4">
          {/* Notificações em Tempo Real */}
          <RealtimeNotificationBell />

          {/* User Menu */}
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-8 w-8 rounded-full"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/avatars/01.png" alt={user.name} />
                    <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user.name}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                    <div className="mt-2">{getRoleBadge(user.role)}</div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onProfile}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Perfil</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onSettings}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Configurações</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onLogout} className="text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sair</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  )
}
