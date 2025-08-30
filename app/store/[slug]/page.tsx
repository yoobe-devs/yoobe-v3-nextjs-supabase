"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { YoobeLogo } from "@/components/ui/yoobe-logo"
import { 
  Search, 
  ShoppingCart, 
  Heart, 
  Star,
  Package,
  Truck,
  CheckCircle,
  AlertCircle,
  Clock,
  User,
  Mail,
  Phone,
  MapPin,
  ExternalLink,
  Filter,
  Grid,
  List
} from "lucide-react"

interface Product {
  id: string
  name: string
  description: string
  price: number
  image_url: string
  category: string
  stock: number
  rating: number
  reviews: number
  is_featured: boolean
}

interface StoreData {
  id: string
  name: string
  slug: string
  description: string
  logo_url: string
  theme: {
    primary_color: string
    secondary_color: string
    accent_color: string
  }
  contact: {
    email: string
    phone: string
    address: string
  }
}

const mockProducts: Product[] = [
  {
    id: "1",
    name: "Camiseta Join Tecnologia",
    description: "Camiseta oficial da Join Tecnologia com logo bordado",
    price: 49.90,
    image_url: "https://via.placeholder.com/300x300/1e40af/ffffff?text=Camiseta",
    category: "Vestuário",
    stock: 50,
    rating: 4.8,
    reviews: 24,
    is_featured: true
  },
  {
    id: "2",
    name: "Mochila Corporativa",
    description: "Mochila para laptop com logo da empresa",
    price: 129.90,
    image_url: "https://via.placeholder.com/300x300/3b82f6/ffffff?text=Mochila",
    category: "Acessórios",
    stock: 25,
    rating: 4.9,
    reviews: 18,
    is_featured: true
  },
  {
    id: "3",
    name: "Caneca Personalizada",
    description: "Caneca de cerâmica com logo da Join",
    price: 29.90,
    image_url: "https://via.placeholder.com/300x300/60a5fa/ffffff?text=Caneca",
    category: "Acessórios",
    stock: 100,
    rating: 4.7,
    reviews: 32,
    is_featured: false
  },
  {
    id: "4",
    name: "Boné Join",
    description: "Boné ajustável com logo bordado",
    price: 39.90,
    image_url: "https://via.placeholder.com/300x300/1e40af/ffffff?text=Boné",
    category: "Vestuário",
    stock: 75,
    rating: 4.6,
    reviews: 15,
    is_featured: false
  },
  {
    id: "5",
    name: "Garrafa Térmica",
    description: "Garrafa de água térmica 500ml",
    price: 59.90,
    image_url: "https://via.placeholder.com/300x300/3b82f6/ffffff?text=Garrafa",
    category: "Acessórios",
    stock: 40,
    rating: 4.8,
    reviews: 28,
    is_featured: false
  },
  {
    id: "6",
    name: "Notebook Join",
    description: "Caderno personalizado com capa dura",
    price: 19.90,
    image_url: "https://via.placeholder.com/300x300/60a5fa/ffffff?text=Notebook",
    category: "Papelaria",
    stock: 200,
    rating: 4.5,
    reviews: 45,
    is_featured: false
  }
]

const mockStoreData: StoreData = {
  id: "1",
  name: "Join Tecnologia",
  slug: "join-tecnologia",
  description: "Loja corporativa da Join Tecnologia para funcionários resgatarem seus swags e produtos promocionais.",
  logo_url: "/api/placeholder/150/150",
  theme: {
    primary_color: "#1e40af",
    secondary_color: "#3b82f6",
    accent_color: "#60a5fa"
  },
  contact: {
    email: "contato@jointecnologia.com.br",
    phone: "(11) 3000-0000",
    address: "Av. Paulista, 1000 - São Paulo, SP"
  }
}

export default function StorePage({ params }: { params: { slug: string } }) {
  const [products, setProducts] = useState<Product[]>(mockProducts)
  const [storeData, setStoreData] = useState<StoreData>(mockStoreData)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [cart, setCart] = useState<Product[]>([])

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const categories = ["all", ...Array.from(new Set(products.map(p => p.category)))]

  const addToCart = (product: Product) => {
    setCart([...cart, product])
  }

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.id !== productId))
  }

  const getStarRating = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header 
        className="bg-white shadow-sm border-b"
        style={{ borderColor: storeData.theme.primary_color }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <YoobeLogo size="md" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">{storeData.name}</h1>
                <p className="text-sm text-gray-600">Loja Corporativa</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar produtos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              
              <Button 
                variant="outline"
                className="relative"
                onClick={() => {/* Abrir carrinho */}}
              >
                <ShoppingCart className="h-4 w-4" />
                {cart.length > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
                    {cart.length}
                  </Badge>
                )}
              </Button>
              
              <Button 
                style={{ backgroundColor: storeData.theme.primary_color }}
                className="text-white hover:opacity-90"
              >
                Entrar
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section 
        className="py-12"
        style={{ backgroundColor: storeData.theme.primary_color }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Bem-vindo à {storeData.name}
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            {storeData.description}
          </p>
          <Button 
            size="lg"
            className="bg-white text-blue-600 hover:bg-gray-100"
          >
            Ver Produtos
          </Button>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters and Controls */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === "all" ? "Todas as Categorias" : category}
                  </option>
                ))}
              </select>
            </div>
            
            <span className="text-sm text-gray-600">
              {filteredProducts.length} produtos encontrados
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === "grid" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("grid")}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("list")}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Products Grid */}
        <div className={viewMode === "grid" 
          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          : "space-y-4"
        }>
          {filteredProducts.map((product) => (
            <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="aspect-square overflow-hidden">
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
              
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <Badge variant="secondary" className="text-xs">
                    {product.category}
                  </Badge>
                  {product.is_featured && (
                    <Badge 
                      className="text-xs"
                      style={{ backgroundColor: storeData.theme.accent_color, color: 'white' }}
                    >
                      Destaque
                    </Badge>
                  )}
                </div>
                
                <CardTitle className="text-lg mb-2 line-clamp-2">
                  {product.name}
                </CardTitle>
                
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                  {product.description}
                </p>
                
                <div className="flex items-center gap-1 mb-3">
                  {getStarRating(product.rating)}
                  <span className="text-sm text-gray-600 ml-1">
                    ({product.reviews})
                  </span>
                </div>
                
                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl font-bold text-gray-900">
                    R$ {product.price.toFixed(2)}
                  </span>
                  <span className="text-sm text-gray-500">
                    {product.stock} em estoque
                  </span>
                </div>
                
                <Button 
                  className="w-full"
                  style={{ backgroundColor: storeData.theme.primary_color }}
                  onClick={() => addToCart(product)}
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Adicionar ao Carrinho
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhum produto encontrado
            </h3>
            <p className="text-gray-600">
              Tente ajustar os filtros ou termos de busca
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <YoobeLogo size="sm" />
                <span className="font-bold">{storeData.name}</span>
              </div>
              <p className="text-gray-400 text-sm">
                {storeData.description}
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Contato</h3>
              <div className="space-y-2 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  {storeData.contact.email}
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  {storeData.contact.phone}
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {storeData.contact.address}
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Links Úteis</h3>
              <div className="space-y-2 text-sm text-gray-400">
                <a href="#" className="block hover:text-white">Sobre Nós</a>
                <a href="#" className="block hover:text-white">Política de Privacidade</a>
                <a href="#" className="block hover:text-white">Termos de Uso</a>
                <a href="#" className="block hover:text-white">Suporte</a>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Redes Sociais</h3>
              <div className="space-y-2 text-sm text-gray-400">
                <a href="#" className="block hover:text-white">LinkedIn</a>
                <a href="#" className="block hover:text-white">Instagram</a>
                <a href="#" className="block hover:text-white">Facebook</a>
                <a href="#" className="block hover:text-white">Twitter</a>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2024 {storeData.name}. Todos os direitos reservados.</p>
            <p className="mt-2">
              Powered by{" "}
              <a 
                href="https://yoobe.co" 
                className="text-blue-400 hover:text-blue-300"
                target="_blank"
                rel="noopener noreferrer"
              >
                Yoobe.co
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}


