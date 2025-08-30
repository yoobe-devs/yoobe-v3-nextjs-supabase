"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { YoobeLogo } from "@/components/ui/yoobe-logo"
import { useAuth } from "@/components/auth/auth-provider-simple"
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Heart, 
  Star, 
  User, 
  Settings, 
  LogOut,
  Gift,
  Clock,
  MapPin,
  Bell
} from 'lucide-react'

const mainNav = [
  {
    title: "Dashboard",
    href: "/store/dashboard",
    icon: LayoutDashboard
  },
  {
    title: "Catálogo",
    href: "/store/catalog",
    icon: Package
  },
  {
    title: "Carrinho",
    href: "/store/cart",
    icon: ShoppingCart
  },
  {
    title: "Meus Pedidos",
    href: "/store/orders",
    icon: ShoppingCart
  },
  {
    title: "Favoritos",
    href: "/store/favorites",
    icon: Heart
  },
  {
    title: "Pontos",
    href: "/store/points",
    icon: Star
  },
  {
    title: "Perfil",
    href: "/store/profile",
    icon: User
  }
]

const footerNav = [
  {
    title: "Configurações",
    href: "/store/settings"
  },
  {
    title: "Ajuda",
    href: "/store/help"
  }
]

export function StoreNavigationMenu() {
  const pathname = usePathname()
  const { signOut } = useAuth()
  const [cartItemCount, setCartItemCount] = useState(0)

  useEffect(() => {
    // Mock cart count - em produção viria do contexto/estado
    setCartItemCount(2)
  }, [])

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
        <Link href="/store/dashboard">
          <div className="flex items-center space-x-2">
            <YoobeLogo size="lg" />
            <span className="font-bold text-xl">Loja</span>
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
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 relative",
                  pathname === item.href ? "bg-gray-100 text-gray-900" : ""
                )}
              >
                <Icon className="h-4 w-4" />
                {item.title}
                {item.title === "Carrinho" && cartItemCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs">
                    {cartItemCount}
                  </Badge>
                )}
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
        <Button 
          variant="ghost" 
          className="mt-6 w-full justify-start gap-2 text-red-500 hover:text-red-600"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          Sair
        </Button>
      </div>
    </div>
  )
}
