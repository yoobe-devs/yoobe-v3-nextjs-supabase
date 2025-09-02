'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { 
  ShoppingCart, 
  Package, 
  MapPin, 
  CreditCard, 
  Star, 
  Plus,
  Trash2,
  ArrowRight,
  CheckCircle,
  Clock,
  User,
  Building
} from 'lucide-react'

interface CartItem {
  id: string
  product_id: string
  product_name: string
  product_sku: string
  quantity: number
  unit_price: number
  total: number
  points: number
  image?: string
}

interface Address {
  id: string
  street: string
  number: string
  neighborhood: string
  city: string
  state: string
  country: string
  zip_code: string
  is_default: boolean
}

interface PaymentMethod {
  id: string
  type: 'points' | 'credit_card' | 'pix' | 'debit' | 'boleto' | 'donation'
  label: string
  description: string
  icon: any
}

export default function StoreCheckoutPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [addresses, setAddresses] = useState<Address[]>([])
  const [selectedAddress, setSelectedAddress] = useState<string>('')
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'address' | 'payment' | 'confirmation'>('cart')
  const [walletBalance, setWalletBalance] = useState(500) // Mock balance

  const paymentMethods: PaymentMethod[] = [
    {
      id: 'points',
      type: 'points',
      label: 'Pontos da Carteira',
      description: `Saldo disponível: ${walletBalance} pontos`,
      icon: Star
    },
    {
      id: 'credit_card',
      type: 'credit_card',
      label: 'Cartão de Crédito',
      description: 'Visa, Mastercard, Elo e outros',
      icon: CreditCard
    },
    {
      id: 'pix',
      type: 'pix',
      label: 'PIX',
      description: 'Pagamento instantâneo',
      icon: CreditCard
    },
    {
      id: 'boleto',
      type: 'boleto',
      label: 'Boleto Bancário',
      description: 'Vencimento em 3 dias úteis',
      icon: CreditCard
    }
  ]

  // Mock data for demonstration
  useEffect(() => {
    const mockCartItems: CartItem[] = [
      {
        id: '1',
        product_id: 'prod-1',
        product_name: 'Camiseta Corporativa TechCorp',
        product_sku: 'CAM-001',
        quantity: 2,
        unit_price: 75.00,
        total: 150.00,
        points: 150,
        image: '/placeholder-1.jpg'
      },
      {
        id: '2',
        product_id: 'prod-2',
        product_name: 'Mochila Executiva Premium',
        product_sku: 'MOC-002',
        quantity: 1,
        unit_price: 150.00,
        total: 150.00,
        points: 300,
        image: '/placeholder-3.jpg'
      }
    ]

    const mockAddresses: Address[] = [
      {
        id: '1',
        street: 'Rua das Flores',
        number: '123',
        neighborhood: 'Centro',
        city: 'São Paulo',
        state: 'SP',
        country: 'Brasil',
        zip_code: '01234-567',
        is_default: true
      },
      {
        id: '2',
        street: 'Avenida Paulista',
        number: '1000',
        neighborhood: 'Bela Vista',
        city: 'São Paulo',
        state: 'SP',
        country: 'Brasil',
        zip_code: '01310-100',
        is_default: false
      }
    ]

    setCartItems(mockCartItems)
    setAddresses(mockAddresses)
    setSelectedAddress(mockAddresses.find(addr => addr.is_default)?.id || '')
    setLoading(false)
  }, [])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const getTotalPrice = () => {
    return cartItems.reduce((sum, item) => sum + item.total, 0)
  }

  const getTotalPoints = () => {
    return cartItems.reduce((sum, item) => sum + (item.points * item.quantity), 0)
  }

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      setCartItems(prev => prev.filter(item => item.id !== itemId))
    } else {
      setCartItems(prev => prev.map(item => 
        item.id === itemId 
          ? { ...item, quantity: newQuantity, total: newQuantity * item.unit_price }
          : item
      ))
    }
  }

  const handleRemoveItem = (itemId: string) => {
    setCartItems(prev => prev.filter(item => item.id !== itemId))
  }

  const handleAddNewAddress = () => {
    // Mock: add new address
    const newAddress: Address = {
      id: Date.now().toString(),
      street: 'Nova Rua',
      number: '456',
      neighborhood: 'Novo Bairro',
      city: 'São Paulo',
      state: 'SP',
      country: 'Brasil',
      zip_code: '04567-890',
      is_default: false
    }
    setAddresses(prev => [...prev, newAddress])
    setSelectedAddress(newAddress.id)
  }

  const handleProceedToAddress = () => {
    if (cartItems.length === 0) return
    setCheckoutStep('address')
  }

  const handleProceedToPayment = () => {
    if (!selectedAddress) return
    setCheckoutStep('payment')
  }

  const handleProceedToConfirmation = () => {
    if (!selectedPaymentMethod) return
    setCheckoutStep('confirmation')
  }

  const handleCompleteOrder = async () => {
    // Mock order completion
    await new Promise(resolve => setTimeout(resolve, 2000))
    // Redirect to confirmation or order history
  }

  const handleBackToCart = () => {
    setCheckoutStep('cart')
  }

  const handleBackToAddress = () => {
    setCheckoutStep('address')
  }

  const handleBackToPayment = () => {
    setCheckoutStep('payment')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-gray-600">Carregando checkout...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight">Checkout</h1>
        <p className="text-muted-foreground">
          Finalize seu pedido e escolha a forma de pagamento
        </p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center">
        <div className="flex items-center space-x-4">
          <div className={`flex items-center space-x-2 ${checkoutStep === 'cart' ? 'text-blue-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${checkoutStep === 'cart' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
              1
            </div>
            <span className="text-sm font-medium">Carrinho</span>
          </div>
          <div className="w-16 h-0.5 bg-gray-200"></div>
          <div className={`flex items-center space-x-2 ${checkoutStep === 'address' ? 'text-blue-600' : checkoutStep === 'payment' || checkoutStep === 'confirmation' ? 'text-green-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${checkoutStep === 'address' ? 'bg-blue-600 text-white' : checkoutStep === 'payment' || checkoutStep === 'confirmation' ? 'bg-green-600 text-white' : 'bg-gray-200'}`}>
              2
            </div>
            <span className="text-sm font-medium">Endereço</span>
          </div>
          <div className="w-16 h-0.5 bg-gray-200"></div>
          <div className={`flex items-center space-x-2 ${checkoutStep === 'payment' ? 'text-blue-600' : checkoutStep === 'confirmation' ? 'text-green-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${checkoutStep === 'payment' ? 'bg-blue-600 text-white' : checkoutStep === 'confirmation' ? 'bg-green-600 text-white' : 'bg-gray-200'}`}>
              3
            </div>
            <span className="text-sm font-medium">Pagamento</span>
          </div>
          <div className="w-16 h-0.5 bg-gray-200"></div>
          <div className={`flex items-center space-x-2 ${checkoutStep === 'confirmation' ? 'text-blue-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${checkoutStep === 'confirmation' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
              4
            </div>
            <span className="text-sm font-medium">Confirmação</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Cart Items */}
          {checkoutStep === 'cart' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5" />
                  Carrinho de Compras
                </CardTitle>
                <CardDescription>
                  {cartItems.length} item(s) no carrinho
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {cartItems.length === 0 ? (
                  <div className="text-center py-8">
                    <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Seu carrinho está vazio</p>
                    <Button className="mt-4" onClick={() => window.history.back()}>
                      Continuar Comprando
                    </Button>
                  </div>
                ) : (
                  <>
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex items-center gap-4 p-4 border rounded-lg">
                        <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                          {item.image ? (
                            <img 
                              src={item.image} 
                              alt={item.product_name}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          ) : (
                            <Package className="w-8 h-8 text-gray-400" />
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium">{item.product_name}</h3>
                          <p className="text-sm text-muted-foreground">SKU: {item.product_sku}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary">
                              <Star className="w-3 h-3 mr-1" />
                              {item.points} pts
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {formatCurrency(item.unit_price)} cada
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                          >
                            -
                          </Button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                          >
                            +
                          </Button>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{formatCurrency(item.total)}</div>
                          <div className="text-sm text-muted-foreground">
                            {item.points * item.quantity} pts
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRemoveItem(item.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                    
                    <div className="flex justify-end">
                      <Button onClick={handleProceedToAddress} disabled={cartItems.length === 0}>
                        Continuar para Endereço
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )}

          {/* Address Selection */}
          {checkoutStep === 'address' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Endereço de Entrega
                </CardTitle>
                <CardDescription>
                  Escolha o endereço para entrega dos produtos
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <RadioGroup value={selectedAddress} onValueChange={setSelectedAddress}>
                  {addresses.map((address) => (
                    <div key={address.id} className="flex items-center space-x-3 p-4 border rounded-lg">
                      <RadioGroupItem value={address.id} id={address.id} />
                      <Label htmlFor={address.id} className="flex-1 cursor-pointer">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">
                            {address.street}, {address.number}
                          </span>
                          {address.is_default && (
                            <Badge variant="secondary">Padrão</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {address.neighborhood}, {address.city} - {address.state}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          CEP: {address.zip_code}
                        </p>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>

                <Button variant="outline" onClick={handleAddNewAddress} className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Novo Endereço
                </Button>

                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleBackToCart}>
                    Voltar ao Carrinho
                  </Button>
                  <Button 
                    onClick={handleProceedToPayment} 
                    disabled={!selectedAddress}
                    className="flex-1"
                  >
                    Continuar para Pagamento
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Payment Method */}
          {checkoutStep === 'payment' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Método de Pagamento
                </CardTitle>
                <CardDescription>
                  Escolha como deseja pagar pelos produtos
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <RadioGroup value={selectedPaymentMethod} onValueChange={setSelectedPaymentMethod}>
                  {paymentMethods.map((method) => (
                    <div key={method.id} className="flex items-center space-x-3 p-4 border rounded-lg">
                      <RadioGroupItem value={method.id} id={method.id} />
                      <Label htmlFor={method.id} className="flex-1 cursor-pointer">
                        <div className="flex items-center gap-3">
                          <method.icon className="w-5 h-5 text-muted-foreground" />
                          <div>
                            <div className="font-medium">{method.label}</div>
                            <p className="text-sm text-muted-foreground">{method.description}</p>
                          </div>
                        </div>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>

                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleBackToAddress}>
                    Voltar ao Endereço
                  </Button>
                  <Button 
                    onClick={handleProceedToConfirmation} 
                    disabled={!selectedPaymentMethod}
                    className="flex-1"
                  >
                    Continuar para Confirmação
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Order Confirmation */}
          {checkoutStep === 'confirmation' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  Confirmação do Pedido
                </CardTitle>
                <CardDescription>
                  Revise os detalhes antes de finalizar
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Order Summary */}
                <div>
                  <h3 className="font-medium mb-3">Resumo do Pedido</h3>
                  <div className="space-y-2">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span>{item.product_name} x{item.quantity}</span>
                        <span>{formatCurrency(item.total)}</span>
                      </div>
                    ))}
                    <Separator />
                    <div className="flex justify-between font-medium">
                      <span>Total</span>
                      <span>{formatCurrency(getTotalPrice())}</span>
                    </div>
                  </div>
                </div>

                {/* Address */}
                <div>
                  <h3 className="font-medium mb-3">Endereço de Entrega</h3>
                  {addresses.find(addr => addr.id === selectedAddress) && (
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">
                          {addresses.find(addr => addr.id === selectedAddress)?.street}, {addresses.find(addr => addr.id === selectedAddress)?.number}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {addresses.find(addr => addr.id === selectedAddress)?.neighborhood}, {addresses.find(addr => addr.id === selectedAddress)?.city} - {addresses.find(addr => addr.id === selectedAddress)?.state}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        CEP: {addresses.find(addr => addr.id === selectedAddress)?.zip_code}
                      </p>
                    </div>
                  )}
                </div>

                {/* Payment Method */}
                <div>
                  <h3 className="font-medium mb-3">Método de Pagamento</h3>
                  {paymentMethods.find(method => method.id === selectedPaymentMethod) && (
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        {(() => {
                          const Icon = paymentMethods.find(method => method.id === selectedPaymentMethod)?.icon
                          return Icon ? <Icon className="w-4 h-4 text-muted-foreground" /> : null
                        })()}
                        <span className="font-medium">
                          {paymentMethods.find(method => method.id === selectedPaymentMethod)?.label}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {paymentMethods.find(method => method.id === selectedPaymentMethod)?.description}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleBackToPayment}>
                    Voltar ao Pagamento
                  </Button>
                  <Button onClick={handleCompleteOrder} className="flex-1">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Finalizar Pedido
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Order Summary Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Resumo do Pedido</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {cartItems.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span>{item.product_name} x{item.quantity}</span>
                  <span>{formatCurrency(item.total)}</span>
                </div>
              ))}
              
              <Separator />
              
              <div className="flex justify-between font-medium text-lg">
                <span>Total</span>
                <span>{formatCurrency(getTotalPrice())}</span>
              </div>
              
              <div className="text-sm text-muted-foreground text-center">
                Total de pontos: {getTotalPoints()}
              </div>
            </CardContent>
          </Card>

          {/* Wallet Balance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="w-5 h-5" />
                Sua Carteira
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{walletBalance}</div>
                <p className="text-sm text-muted-foreground">pontos disponíveis</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
