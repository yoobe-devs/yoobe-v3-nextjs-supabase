"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { 
  ShoppingCart, 
  Star,
  Package,
  Truck,
  CreditCard,
  ArrowRight,
  CheckCircle,
  MapPin,
  User,
  Phone,
  Mail,
  Loader2
} from "lucide-react"
import { YoobeLogo } from "@/components/ui/yoobe-logo"
import { useToast } from "@/hooks/use-toast"
import { ToastContainer } from "@/components/ui/toast"

interface CheckoutItem {
  id: string
  name: string
  points: number
  quantity: number
  image: string
}

const mockCheckoutItems: CheckoutItem[] = [
  {
    id: "1",
    name: "Camiseta Corporativa",
    points: 150,
    quantity: 2,
    image: "https://via.placeholder.com/100x100/1e40af/ffffff?text=CC"
  },
  {
    id: "2",
    name: "Caneca Personalizada",
    points: 75,
    quantity: 1,
    image: "https://via.placeholder.com/100x100/3b82f6/ffffff?text=CP"
  }
]

export default function CheckoutPage() {
  const { toast, dismiss, toasts } = useToast()
  const [checkoutItems, setCheckoutItems] = useState<CheckoutItem[]>(mockCheckoutItems)
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1)
  const [shippingAddress, setShippingAddress] = useState({
    name: "João Silva",
    email: "joao.silva@jointecnologia.com",
    phone: "(11) 99999-9999",
    address: "Rua das Flores, 123",
    complement: "Apto 45",
    city: "São Paulo",
    state: "SP",
    zipCode: "01234-567"
  })

  const totalPoints = checkoutItems.reduce((sum, item) => sum + (item.points * item.quantity), 0)
  const totalItems = checkoutItems.reduce((sum, item) => sum + item.quantity, 0)

  const handleConfirmOrder = async () => {
    setLoading(true)
    // Simular processamento do pedido
    setTimeout(() => {
      setLoading(false)
      setStep(3) // Sucesso
    }, 2000)
  }

  if (step === 3) {
    return (
      <div className="p-6">
        <div className="max-w-2xl mx-auto text-center">
          <div className="mb-8">
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Resgate Confirmado!</h1>
            <p className="text-gray-600">Seu pedido foi processado com sucesso</p>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Detalhes do Pedido</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span>Número do Pedido:</span>
                <span className="font-semibold">#ORD-2024-001</span>
              </div>
              <div className="flex justify-between">
                <span>Total de Pontos:</span>
                <span className="flex items-center gap-1 text-purple-600 font-semibold">
                  <Star className="h-4 w-4" />
                  {totalPoints}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Status:</span>
                <Badge className="bg-green-100 text-green-800">Confirmado</Badge>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <Button 
              className="w-full" 
              onClick={() => window.location.href = '/store/orders'}
            >
              Acompanhar Pedidos
            </Button>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => window.location.href = '/store/catalog'}
            >
              Continuar Comprando
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Toast Container */}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
      
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <YoobeLogo size={40} />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Finalizar Resgate</h1>
                <p className="text-gray-600">Confirme seus dados e finalize o pedido</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={step >= 1 ? "default" : "secondary"}>1. Dados</Badge>
              <ArrowRight className="h-4 w-4" />
              <Badge variant={step >= 2 ? "default" : "secondary"}>2. Confirmação</Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Checkout Form */}
            <div className="lg:col-span-2 space-y-6">
              {step === 1 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      Endereço de Entrega
                    </CardTitle>
                    <CardDescription>
                      Confirme seus dados para entrega
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Nome Completo</Label>
                        <Input 
                          id="name"
                          value={shippingAddress.name}
                          onChange={(e) => setShippingAddress({...shippingAddress, name: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input 
                          id="email"
                          name="email"
                          type="email"
                          value={shippingAddress.email}
                          onChange={(e) => setShippingAddress({...shippingAddress, email: e.target.value})}
                          autoComplete="email"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="phone">Telefone</Label>
                        <Input 
                          id="phone"
                          value={shippingAddress.phone}
                          onChange={(e) => setShippingAddress({...shippingAddress, phone: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="zipCode">CEP</Label>
                        <Input 
                          id="zipCode"
                          value={shippingAddress.zipCode}
                          onChange={(e) => setShippingAddress({...shippingAddress, zipCode: e.target.value})}
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="address">Endereço</Label>
                      <Input 
                        id="address"
                        value={shippingAddress.address}
                        onChange={(e) => setShippingAddress({...shippingAddress, address: e.target.value})}
                      />
                    </div>

                    <div>
                      <Label htmlFor="complement">Complemento</Label>
                      <Input 
                        id="complement"
                        value={shippingAddress.complement}
                        onChange={(e) => setShippingAddress({...shippingAddress, complement: e.target.value})}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="city">Cidade</Label>
                        <Input 
                          id="city"
                          value={shippingAddress.city}
                          onChange={(e) => setShippingAddress({...shippingAddress, city: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="state">Estado</Label>
                        <Input 
                          id="state"
                          value={shippingAddress.state}
                          onChange={(e) => setShippingAddress({...shippingAddress, state: e.target.value})}
                        />
                      </div>
                    </div>

                    <Button 
                      className="w-full" 
                      onClick={() => setStep(2)}
                    >
                      Continuar para Confirmação
                    </Button>
                  </CardContent>
                </Card>
              )}

              {step === 2 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5" />
                      Confirmação do Pedido
                    </CardTitle>
                    <CardDescription>
                      Revise seus dados antes de confirmar
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h3 className="font-semibold mb-2">Endereço de Entrega</h3>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="font-medium">{shippingAddress.name}</p>
                        <p className="text-gray-600">{shippingAddress.address}</p>
                        {shippingAddress.complement && (
                          <p className="text-gray-600">{shippingAddress.complement}</p>
                        )}
                        <p className="text-gray-600">
                          {shippingAddress.city} - {shippingAddress.state} - {shippingAddress.zipCode}
                        </p>
                        <p className="text-gray-600">{shippingAddress.phone}</p>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-2">Itens do Pedido</h3>
                      <div className="space-y-2">
                        {checkoutItems.map((item) => (
                          <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-3">
                              <img 
                                src={item.image} 
                                alt={item.name}
                                className="w-12 h-12 rounded object-cover"
                              />
                              <div>
                                <p className="font-medium">{item.name}</p>
                                <p className="text-sm text-gray-600">Qtd: {item.quantity}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 text-purple-600 font-semibold">
                              <Star className="h-4 w-4" />
                              <span>{item.points * item.quantity}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Button 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => setStep(1)}
                      >
                        Voltar
                      </Button>
                      <Button 
                        className="flex-1"
                        onClick={handleConfirmOrder}
                        disabled={loading}
                      >
                        {loading ? (
                          <div className="flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Processando...
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            Confirmar Resgate
                            <CheckCircle className="h-4 w-4" />
                          </div>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5" />
                    Resumo do Pedido
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    {checkoutItems.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span>{item.name} x{item.quantity}</span>
                        <span className="flex items-center gap-1">
                          <Star className="h-3 w-3 text-purple-600" />
                          {item.points * item.quantity}
                        </span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center text-lg font-semibold">
                      <span>Total de Pontos</span>
                      <span className="flex items-center gap-1 text-purple-600">
                        <Star className="h-5 w-5" />
                        {totalPoints}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Package className="h-4 w-4" />
                      <span>Entrega gratuita</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Truck className="h-4 w-4" />
                      <span>Entrega em 3-5 dias úteis</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
