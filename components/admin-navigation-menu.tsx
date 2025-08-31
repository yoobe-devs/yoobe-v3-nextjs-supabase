"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/auth/auth-provider-simple"
import { YoobeLogo } from "@/components/ui/yoobe-logo"
import { 
  LayoutDashboard, 
  Building2, 
  Users, 
  Package, 
  ShoppingCart, 
  Settings, 
  LogOut, 
  HelpCircle,
  BarChart3,
  Store,
  FileText
} from 'lucide-react'

const mainNav = [
  {
    title: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard
  },
  {
    title: "Empresas",
    href: "/admin/empresas",
    icon: Building2
  },
  {
    title: "Usuários",
    href: "/admin/usuarios",
    icon: Users
  },
  {
    title: "Produtos",
    href: "/admin/produtos",
    icon: Package
  },
  {
    title: "Pedidos",
    href: "/admin/pedidos",
    icon: ShoppingCart
  },
  {
    title: "Lojas",
    href: "/admin/lojas",
    icon: Store
  },
  {
    title: "Relatórios",
    href: "/admin/relatorios",
    icon: BarChart3
  },
  {
    title: "Templates",
    href: "/admin/templates",
    icon: FileText
  },
  {
    title: "Configurações",
    href: "/admin/configuracoes",
    icon: Settings
  }
]

const footerNav = [
  {
    title: "Política de Privacidade",
    href: "/privacidade"
  },
  {
    title: "Termos de Uso", 
    href: "/termos"
  },
  {
    title: "Contato",
    href: "/contato"
  }
]

export function AdminNavigationMenu() {
  const pathname = usePathname()
  const { signOut } = useAuth()

  const handleLogout = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Erro ao fazer logout:', error)
    }
  }

  return (
    <div className="flex h-screen flex-col border-r bg-white">
      <div className="p-6">
        <Link href="/admin/dashboard">
          <div className="flex items-center space-x-2">
            <YoobeLogo size="lg" />
            <span className="font-bold text-xl">Admin</span>
          </div>
        </Link>
      </div>
      <div className="flex-1 overflow-auto py-2">
        <nav className="grid items-start px-4 text-sm font-medium">
          {mainNav.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900",
                  pathname === item.href ? "bg-gray-100 text-gray-900" : ""
                )}
              >
                <Icon className="h-4 w-4" />
                {item.title}
              </Link>
            )
          })}
        </nav>
      </div>
      <div className="mt-auto p-4">
        <nav className="grid gap-1">
          {footerNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm text-gray-500 hover:text-gray-900"
            >
              {item.title}
            </Link>
          ))}
        </nav>
        <Button variant="outline" className="mt-6 w-full justify-start gap-2">
          <HelpCircle className="h-4 w-4" />
          Ajuda
        </Button>
        <Button 
          variant="ghost" 
          className="mt-2 w-full justify-start gap-2 text-red-500 hover:text-red-600"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          Sair
        </Button>
      </div>
    </div>
  )
}


