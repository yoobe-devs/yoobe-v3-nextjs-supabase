'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { 
  ChevronLeft, 
  Menu, 
  Home, 
  Users, 
  Package, 
  FileText, 
  ShoppingCart, 
  Settings,
  BarChart3,
  Building,
  Crown,
  Shield,
  User,
  MapPin,
  Star,
  CreditCard,
  Truck,
  CheckCircle,
  UserPlus
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface SidebarItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string | number
  children?: SidebarItem[]
}

interface SidebarProps {
  items: SidebarItem[]
  isCollapsed?: boolean
  onToggle?: () => void
  className?: string
}

export default function Sidebar({ items, isCollapsed = false, onToggle, className }: SidebarProps) {
  const pathname = usePathname()
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(href + '/')
  }

  const renderSidebarItem = (item: SidebarItem) => {
    const isItemActive = isActive(item.href)
    
    return (
      <div key={item.href}>
        <Link href={item.href}>
          <Button
            variant={isItemActive ? "secondary" : "ghost"}
            className={`w-full justify-start gap-2 h-10 ${
              isCollapsed ? "px-2" : "px-3"
            }`}
          >
            <item.icon className="h-4 w-4 shrink-0" />
            {!isCollapsed && (
              <>
                <span className="truncate">{item.title}</span>
                {item.badge && (
                  <span className="ml-auto text-xs bg-primary text-primary-foreground px-2 py-1 rounded-full">
                    {item.badge}
                  </span>
                )}
              </>
            )}
          </Button>
        </Link>
        
        {item.children && !isCollapsed && (
          <div className="ml-6 mt-1 space-y-1">
            {item.children.map((child) => (
              <Link key={child.href} href={child.href}>
                <Button
                  variant={isActive(child.href) ? "secondary" : "ghost"}
                  className="w-full justify-start gap-2 h-8 px-3 text-sm"
                >
                  <child.icon className="h-3 w-3 shrink-0" />
                  <span className="truncate">{child.title}</span>
                  {child.badge && (
                    <span className="ml-auto text-xs bg-primary text-primary-foreground px-2 py-1 rounded-full">
                      {child.badge}
                    </span>
                  )}
                </Button>
              </Link>
            ))}
          </div>
        )}
      </div>
    )
  }

  const sidebarContent = (
    <div className="flex h-full flex-col gap-2">
      {/* Toggle Button */}
      {onToggle && (
        <div className="flex h-10 items-center justify-end px-2">
          <Button variant="ghost" size="sm" onClick={onToggle}>
            <ChevronLeft className={`h-4 w-4 transition-transform ${isCollapsed ? 'rotate-180' : ''}`} />
          </Button>
        </div>
      )}

      {/* Navigation Items */}
      <ScrollArea className="flex-1 px-2">
        <div className="space-y-1">
          {items.map(renderSidebarItem)}
        </div>
      </ScrollArea>
    </div>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className={`hidden md:flex h-full flex-col border-r bg-background ${className || ''}`}>
        {sidebarContent}
      </aside>

      {/* Mobile Sidebar */}
      <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="sm" className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          {sidebarContent}
        </SheetContent>
      </Sheet>
    </>
  )
}

// Predefined sidebar configurations for different user roles
export const getAdminGlobalSidebarItems = (): SidebarItem[] => [
  {
    title: "Dashboard",
    href: "/admin-global",
    icon: Home
  },
  {
    title: "Orçamentos",
    href: "/admin-global/quotes",
    icon: FileText,
    badge: "12"
  },
  {
    title: "Replicações",
    href: "/admin-global/replications",
    icon: Package,
    badge: "3"
  },
  {
    title: "Pedidos",
    href: "/admin-global/orders",
    icon: ShoppingCart,
    badge: "25"
  },
  {
    title: "Usuários",
    href: "/admin-global/users",
    icon: Users,
    badge: "48"
  },
  {
    title: "Relatórios",
    href: "/admin-global/reports",
    icon: BarChart3
  },
  {
    title: "Configurações",
    href: "/admin-global/settings",
    icon: Settings
  }
]

export const getGestorSidebarItems = (): SidebarItem[] => [
  {
    title: "Dashboard",
    href: "/gestor/dashboard",
    icon: Home
  },
  {
    title: "Minha Loja",
    href: "/gestor/minha-loja",
    icon: Building
  },
  {
    title: "Loja de Brindes",
    href: "/gestor/loja-brindes",
    icon: Package
  },
  {
    title: "Swag Track",
    href: "/gestor/swag-track",
    icon: Truck
  },
  {
    title: "Onboarding",
    href: "/gestor/onboarding",
    icon: UserPlus
  },
  {
    title: "Funcionários",
    href: "/gestor/funcionarios",
    icon: Users,
    badge: "12"
  },
  {
    title: "Produtos",
    href: "/gestor/produtos",
    icon: Package,
    badge: "24"
  },
  {
    title: "Orçamentos",
    href: "/gestor/orcamentos",
    icon: FileText,
    badge: "8"
  },
  {
    title: "Pedidos",
    href: "/gestor/pedidos",
    icon: ShoppingCart,
    badge: "15"
  },
  {
    title: "Estoque",
    href: "/gestor/estoque",
    icon: BarChart3
  },
  {
    title: "Usuários",
    href: "/gestor/usuarios",
    icon: User
  },
  {
    title: "Configurações",
    href: "/gestor/configuracoes",
    icon: Settings
  }
]

export const getStoreSidebarItems = (): SidebarItem[] => [
  {
    title: "Loja",
    href: "/store",
    icon: Home
  },
  {
    title: "Checkout",
    href: "/store/checkout",
    icon: ShoppingCart
  },
  {
    title: "Meu Perfil",
    href: "/store/profile",
    icon: User,
    children: [
      {
        title: "Informações",
        href: "/store/profile",
        icon: User
      },
      {
        title: "Endereços",
        href: "/store/profile/addresses",
        icon: MapPin
      },
      {
        title: "Carteira",
        href: "/store/profile/wallet",
        icon: Star
      }
    ]
  },
  {
    title: "Histórico",
    href: "/store/history",
    icon: CheckCircle
  }
]
