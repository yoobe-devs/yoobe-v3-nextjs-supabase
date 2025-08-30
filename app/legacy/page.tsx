"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { YoobeLogo } from "@/components/ui/yoobe-logo"
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  Store, 
  Users, 
  Gift, 
  BookOpen, 
  Boxes, 
  UserPlus, 
  BarChart,
  Settings,
  ArrowRight
} from "lucide-react"
import Link from "next/link"

const legacyPages = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    description: "Painel principal do sistema"
  },
  {
    title: "Pedidos",
    href: "/pedidos",
    icon: ShoppingCart,
    description: "Gestão de pedidos e resgates"
  },
  {
    title: "Estoque",
    href: "/estoque",
    icon: Package,
    description: "Controle de estoque de produtos"
  },
  {
    title: "Produtos",
    href: "/produtos",
    icon: Store,
    description: "Gestão de produtos"
  },
  {
    title: "Minha Loja",
    href: "/minha-loja",
    icon: Store,
    description: "Configurações da loja"
  },
  {
    title: "Usuários",
    href: "/usuarios",
    icon: Users,
    description: "Gestão de usuários"
  },
  {
    title: "Ativar Produtos",
    href: "/ativar-produtos",
    icon: Gift,
    description: "Ativação de produtos"
  },
  {
    title: "Catálogo",
    href: "/catalogo",
    icon: BookOpen,
    description: "Catálogo online"
  },
  {
    title: "Criar Kit",
    href: "/criar-kit",
    icon: Boxes,
    description: "Criação de kits de produtos"
  },
  {
    title: "Onboarding",
    href: "/onboarding",
    icon: UserPlus,
    description: "Processo de onboarding"
  },
  {
    title: "Swag Track",
    href: "/swag-track",
    icon: BarChart,
    description: "Rastreamento de swags"
  },
  {
    title: "Configurações",
    href: "/configuracoes",
    icon: Settings,
    description: "Configurações do sistema"
  }
]

export default function LegacyPage() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <YoobeLogo size="lg" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Funcionalidades Legadas</h1>
          <p className="text-gray-600">Acesse as funcionalidades antigas do sistema</p>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex gap-4 mb-6">
        <Link href="/choose-environment">
          <Button variant="outline">
            ← Voltar à Escolha de Ambiente
          </Button>
        </Link>
        <Link href="/admin/dashboard">
          <Button variant="outline">
            Ir para Admin
          </Button>
        </Link>
        <Link href="/store/dashboard">
          <Button variant="outline">
            Ir para Loja
          </Button>
        </Link>
      </div>

      {/* Legacy Pages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {legacyPages.map((page) => {
          const Icon = page.icon
          return (
            <Card key={page.href} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Icon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{page.title}</CardTitle>
                    <CardDescription>{page.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Link href={page.href}>
                  <Button className="w-full">
                    Acessar
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Info */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900">Informação</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-blue-800">
            Estas são as funcionalidades antigas do sistema. Para uma experiência mais moderna, 
            recomendamos usar o novo sistema com separação entre Admin e Loja.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}


