"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { 
  Search, 
  Filter,
  Heart,
  Star,
  ShoppingCart,
  Package,
  Grid,
  List,
  Gift,
  Eye
} from "lucide-react"
import { YoobeLogo } from "@/components/ui/yoobe-logo"
import { cn } from "@/lib/utils"

interface Product {
  id: string
  name: string
  description: string
  points: number
  image_url: string
  category: string
  stock: number
  rating: number
  reviews: number
  is_featured: boolean
  is_favorite: boolean
}

const mockProducts: Product[] = [
  {
    id: "1",
    name: "Camiseta Join Tecnologia",
    description: "Camiseta oficial da Join Tecnologia com logo bordado",
    points: 150,
    image_url: "https://via.placeholder.com/300x300/1e40af/ffffff?text=Camiseta",
    category: "Vestuário",
    stock: 50,
    rating: 4.8,
    reviews: 24,
    is_featured: true,
    is_favorite: false
  },
  {
    id: "2",
    name: "Mochila Corporativa",
    description: "Mochila para laptop com logo da empresa",
    points: 300,
    image_url: "https://via.placeholder.com/300x300/3b82f6/ffffff?text=Mochila",
    category: "Acessórios",
    stock: 25,
    rating: 4.9,
    reviews: 18,
    is_featured: true,
    is_favorite: true
  },
  {
    id: "3",
    name: "Caneca Personalizada",
    description: "Caneca de cerâmica com logo da Join",
    points: 80,
    image_url: "https://via.placeholder.com/300x300/60a5fa/ffffff?text=Caneca",
    category: "Acessórios",
    stock: 100,
    rating: 4.7,
    reviews: 32,
    is_featured: false,
    is_favorite: false
  },
  {
    id: "4",
    name: "Boné Join",
    description: "Boné ajustável com logo bordado",
    points: 120,
    image_url: "https://via.placeholder.com/300x300/1e40af/ffffff?text=Boné",
    category: "Vestuário",
    stock: 75,
    rating: 4.6,
    reviews: 15,
    is_featured: false,
    is_favorite: false
  },
  {
    id: "5",
    name: "Garrafa Térmica",
    description: "Garrafa de água térmica 500ml",
    points: 200,
    image_url: "https://via.placeholder.com/300x300/3b82f6/ffffff?text=Garrafa",
    category: "Acessórios",
    stock: 40,
    rating: 4.8,
    reviews: 28,
    is_featured: false,
    is_favorite: true
  },
  {
    id: "6",
    name: "Notebook Join",
    description: "Caderno personalizado com capa dura",
    points: 60,
    image_url: "https://via.placeholder.com/300x300/60a5fa/ffffff?text=Notebook",
    category: "Papelaria",
    stock: 200,
    rating: 4.5,
    reviews: 45,
    is_featured: false,
    is_favorite: false
  }
]

export default function StoreCatalogPage() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>(mockProducts)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  const categories = ["all", "Vestuário", "Acessórios", "Papelaria"]

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const toggleFavorite = (productId: string) => {
    setProducts(products.map(product => 
      product.id === productId 
        ? { ...product, is_favorite: !product.is_favorite }
        : product
    ))
  }

  const handleRedeem = (product: Product) => {
    // Implementar lógica de resgate
    console.log("Resgatando produto:", product.name)
  }

  const handleViewProduct = (product: Product) => {
    router.push(`/store/product/${product.id}`)
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <YoobeLogo size={40} />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Catálogo de Produtos</h1>
            <p className="text-gray-600">Resgate seus produtos favoritos com pontos</p>
          </div>
        </div>
        <div className="flex gap-2">
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

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar produtos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
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
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filtros
          </Button>
        </div>
      </div>

      {/* Products Grid */}
      <div className={cn(
        "grid gap-6",
        viewMode === "grid" 
          ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          : "grid-cols-1"
      )}>
        {filteredProducts.map((product) => (
          <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="aspect-square overflow-hidden relative bg-gray-100">
              <div className="w-full h-full flex items-center justify-center">
                <Package className="h-16 w-16 text-gray-400" />
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-2 right-2 p-1 h-8 w-8"
                onClick={() => toggleFavorite(product.id)}
              >
                <Heart 
                  className={cn(
                    "h-4 w-4",
                    product.is_favorite ? "fill-red-500 text-red-500" : "text-gray-400"
                  )} 
                />
              </Button>
              {product.is_featured && (
                <Badge className="absolute top-2 left-2 bg-blue-500 text-white">
                  Destaque
                </Badge>
              )}
            </div>
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <Badge variant="secondary" className="text-xs">
                  {product.category}
                </Badge>
              </div>
              <h3 className="font-semibold text-lg mb-2 line-clamp-2">{product.name}</h3>
              <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>
              
              <div className="flex items-center gap-1 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      "h-4 w-4",
                      i < Math.floor(product.rating) 
                        ? "text-yellow-400 fill-current" 
                        : "text-gray-300"
                    )}
                  />
                ))}
                <span className="text-sm text-gray-600 ml-1">({product.reviews})</span>
              </div>
              
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-purple-600" />
                  <span className="text-lg font-bold text-purple-600">{product.points} pts</span>
                </div>
                <span className="text-sm text-gray-500">{product.stock} em estoque</span>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  variant="outline"
                  className="flex-1" 
                  onClick={() => handleViewProduct(product)}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Ver Detalhes
                </Button>
                <Button 
                  className="flex-1" 
                  onClick={() => handleRedeem(product)}
                  disabled={product.stock === 0}
                >
                  <Gift className="h-4 w-4 mr-2" />
                  {product.stock === 0 ? "Indisponível" : "Resgatar"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum produto encontrado</h3>
          <p className="text-gray-600">Tente ajustar os filtros ou termos de busca</p>
        </div>
      )}
    </div>
  )
}


