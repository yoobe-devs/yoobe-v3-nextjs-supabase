'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import {
  Gift,
  ArrowLeft,
  CreditCard,
  MapPin,
  User,
  Phone,
  Mail,
  Lock,
  CheckCircle,
  Truck,
  Package,
  Shield,
  Eye,
  ShoppingCart,
  Loader2,
} from 'lucide-react'

interface CartItem {
  productId: string
  name: string
  price: number
  points_cost: number
  quantity: number
  image: string
}

interface CustomerData {
  name: string
  email: string
  phone: string
  cpf: string
}

interface AddressData {
  zipCode: string
  street: string
  number: string
  complement: string
  neighborhood: string
  city: string
  state: string
}

export default function CheckoutPage() {
  const router = useRouter()
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [currentStep, setCurrentStep] = useState(1)
  const [customerData, setCustomerData] = useState<CustomerData>({
    name: '',
    email: '',
    phone: '',
    cpf: '',
  })
  const [addressData, setAddressData] = useState<AddressData>({
    zipCode: '',
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
  })
  const [paymentMethod, setPaymentMethod] = useState('points')
  const [savedAddress, setSavedAddress] = useState<any>(null)
  const [cartSummary, setCartSummary] = useState<any>(null)
  const [loadingAddress, setLoadingAddress] = useState(false)
  const [loadingCart, setLoadingCart] = useState(false)
  const [processingOrder, setProcessingOrder] = useState(false)

  useEffect(() => {
    loadCart()
    loadSavedAddress()
    loadCartSummary()
  }, [])

  const loadCart = () => {
    try {
      const cart = JSON.parse(localStorage.getItem('brindes_cart') || '[]')
      setCartItems(cart)
      if (cart.length === 0) {
        router.push('/loja-brindes-preview/carrinho')
      }
    } catch (error) {
      console.error('Erro ao carregar carrinho:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadSavedAddress = async () => {
    try {
      setLoadingAddress(true)
      const response = await fetch('/api/me/address')
      if (response.ok) {
        const data = await response.json()
        const primaryAddress = data.addresses?.find(
          (addr: any) => addr.is_primary
        )
        if (primaryAddress) {
          setSavedAddress(primaryAddress)
          // Mostrar toast de endereço encontrado
          toast('Endereço encontrado', {
            description: 'Usar o endereço salvo no seu perfil?',
            action: {
              label: 'Usar agora',
              onClick: () => useSavedAddress(primaryAddress),
            },
            cancel: {
              label: 'Editar',
              onClick: () => {},
            },
          })
        }
      }
    } catch (error) {
      console.error('Erro ao carregar endereço salvo:', error)
    } finally {
      setLoadingAddress(false)
    }
  }

  const loadCartSummary = async () => {
    try {
      setLoadingCart(true)
      const response = await fetch('/api/cart/summary')
      if (response.ok) {
        const data = await response.json()
        setCartSummary(data)
        // Mostrar toast de resumo do carrinho
        toast('Resumo do Carrinho', {
          description: `${data.items.length} itens • R$ ${data.subtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} • ${data.subtotalPoints} pontos`,
          action: {
            label: 'Ver detalhes',
            onClick: () => router.push('/loja-brindes-preview/carrinho'),
          },
        })
      }
    } catch (error) {
      console.error('Erro ao carregar resumo do carrinho:', error)
    } finally {
      setLoadingCart(false)
    }
  }

  const useSavedAddress = (address: any) => {
    setAddressData({
      zipCode: address.postal_code || '',
      street: address.street || '',
      number: address.number || '',
      complement: address.complement || '',
      neighborhood: address.neighborhood || '',
      city: address.city || '',
      state: address.state || '',
    })
    setCustomerData({
      name: address.full_name || '',
      email: '',
      phone: address.phone || '',
      cpf: address.document_id || '',
    })
    toast.success('Endereço aplicado com sucesso!')
  }

  const handleZipCodeChange = async (zipCode: string) => {
    if (zipCode.length === 8) {
      try {
        const response = await fetch(
          `/api/address/autofill?postal_code=${zipCode}`
        )
        if (response.ok) {
          const data = await response.json()
          setAddressData(prev => ({
            ...prev,
            zipCode: data.postal_code,
            state: data.state,
            city: data.city,
            neighborhood: data.neighborhood,
            street: data.street,
          }))
          toast.success('Endereço preenchido automaticamente!')
        }
      } catch (error) {
        console.error('Erro ao buscar CEP:', error)
      }
    }
  }

  const getTotalPoints = () => {
    return cartItems.reduce(
      (total, item) => total + item.points_cost * item.quantity,
      0
    )
  }

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0)
  }

  const handleNextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleFinalizeOrder = async () => {
    try {
      setProcessingOrder(true)

      // Validar dados obrigatórios
      if (!customerData.name || !customerData.email || !customerData.phone) {
        toast.error('Preencha todos os dados pessoais obrigatórios')
        return
      }

      if (
        !addressData.zipCode ||
        !addressData.street ||
        !addressData.number ||
        !addressData.city ||
        !addressData.state
      ) {
        toast.error('Preencha todos os dados de endereço obrigatórios')
        return
      }

      // Chamar API de confirmação do checkout
      const response = await fetch('/api/checkout/confirm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          addressInline: addressData,
          saveAsPrimary: true, // Salvar como endereço principal
          paymentMethod,
          mixRatio: 1,
          notes: 'Pedido via loja de brindes',
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        toast.error(errorData.error || 'Erro ao processar pedido')
        return
      }

      const result = await response.json()

      // Toast de sucesso
      toast.success('Pedido confirmado!', {
        description: `Número do pedido: ${result.number}`,
        action: {
          label: 'Ver pedido',
          onClick: () => router.push(result.redirectTo),
        },
      })

      // Redirecionar para a página do pedido
      router.push(result.redirectTo)
    } catch (error) {
      console.error('Erro ao finalizar pedido:', error)
      toast.error('Erro ao processar pedido. Tente novamente.')
    } finally {
      setProcessingOrder(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando checkout...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/loja-brindes-preview/carrinho')}
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
              <div className="flex items-center space-x-2">
                <CreditCard className="h-6 w-6 text-blue-600" />
                <span className="font-semibold">Checkout</span>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {cartSummary && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push('/loja-brindes-preview/carrinho')}
                  className="text-blue-600 border-blue-300 hover:bg-blue-50"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Ver Carrinho ({cartSummary.items.length})
                </Button>
              )}
            </div>

            {/* Progress Steps */}
            <div className="flex items-center space-x-4">
              {[1, 2, 3].map(step => (
                <div key={step} className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      step <= currentStep
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {step}
                  </div>
                  {step < 3 && (
                    <div
                      className={`w-8 h-0.5 mx-2 ${
                        step < currentStep ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Checkout Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Step 1: Customer Data */}
            {currentStep === 1 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <User className="h-5 w-5 mr-2" />
                    Dados Pessoais
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nome Completo *
                      </label>
                      <Input
                        value={customerData.name}
                        onChange={e =>
                          setCustomerData({
                            ...customerData,
                            name: e.target.value,
                          })
                        }
                        placeholder="Seu nome completo"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        CPF *
                      </label>
                      <Input
                        value={customerData.cpf}
                        onChange={e =>
                          setCustomerData({
                            ...customerData,
                            cpf: e.target.value,
                          })
                        }
                        placeholder="000.000.000-00"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        E-mail *
                      </label>
                      <Input
                        type="email"
                        value={customerData.email}
                        onChange={e =>
                          setCustomerData({
                            ...customerData,
                            email: e.target.value,
                          })
                        }
                        placeholder="seu@email.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Telefone *
                      </label>
                      <Input
                        value={customerData.phone}
                        onChange={e =>
                          setCustomerData({
                            ...customerData,
                            phone: e.target.value,
                          })
                        }
                        placeholder="(11) 99999-9999"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 2: Address */}
            {currentStep === 2 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MapPin className="h-5 w-5 mr-2" />
                    Endereço de Entrega
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        CEP *
                      </label>
                      <Input
                        value={addressData.zipCode}
                        onChange={e => {
                          const value = e.target.value.replace(/\D/g, '')
                          setAddressData({
                            ...addressData,
                            zipCode: value,
                          })
                          handleZipCodeChange(value)
                        }}
                        placeholder="00000000"
                        maxLength={8}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Rua/Avenida *
                      </label>
                      <Input
                        value={addressData.street}
                        onChange={e =>
                          setAddressData({
                            ...addressData,
                            street: e.target.value,
                          })
                        }
                        placeholder="Nome da rua"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Número *
                      </label>
                      <Input
                        value={addressData.number}
                        onChange={e =>
                          setAddressData({
                            ...addressData,
                            number: e.target.value,
                          })
                        }
                        placeholder="123"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Complemento
                      </label>
                      <Input
                        value={addressData.complement}
                        onChange={e =>
                          setAddressData({
                            ...addressData,
                            complement: e.target.value,
                          })
                        }
                        placeholder="Apartamento, bloco, etc."
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Bairro *
                      </label>
                      <Input
                        value={addressData.neighborhood}
                        onChange={e =>
                          setAddressData({
                            ...addressData,
                            neighborhood: e.target.value,
                          })
                        }
                        placeholder="Nome do bairro"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Cidade *
                      </label>
                      <Input
                        value={addressData.city}
                        onChange={e =>
                          setAddressData({
                            ...addressData,
                            city: e.target.value,
                          })
                        }
                        placeholder="Nome da cidade"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Estado *
                      </label>
                      <Input
                        value={addressData.state}
                        onChange={e =>
                          setAddressData({
                            ...addressData,
                            state: e.target.value,
                          })
                        }
                        placeholder="SP"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 3: Payment */}
            {currentStep === 3 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Lock className="h-5 w-5 mr-2" />
                    Forma de Pagamento
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div
                      className={`p-4 border rounded-lg cursor-pointer ${
                        paymentMethod === 'points'
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-200'
                      }`}
                      onClick={() => setPaymentMethod('points')}
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-4 h-4 rounded-full border-2 ${
                            paymentMethod === 'points'
                              ? 'border-blue-600 bg-blue-600'
                              : 'border-gray-300'
                          }`}
                        >
                          {paymentMethod === 'points' && (
                            <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">
                            Pagamento com Pontos
                          </div>
                          <div className="text-sm text-gray-600">
                            Use seus pontos acumulados para finalizar a compra
                          </div>
                        </div>
                        <Badge className="bg-yellow-500">
                          {getTotalPoints()} pontos
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Security Info */}
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Shield className="h-5 w-5 text-green-600" />
                      <span className="font-semibold text-green-900">
                        Compra Segura
                      </span>
                    </div>
                    <p className="text-sm text-green-800">
                      Seus dados são protegidos com criptografia SSL e não são
                      compartilhados com terceiros.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={handlePrevStep}
                disabled={currentStep === 1}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>

              {currentStep < 3 ? (
                <Button onClick={handleNextStep}>Continuar</Button>
              ) : (
                <Button
                  onClick={handleFinalizeOrder}
                  disabled={processingOrder}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {processingOrder ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <CheckCircle className="h-4 w-4 mr-2" />
                  )}
                  {processingOrder ? 'Processando...' : 'Finalizar Pedido'}
                </Button>
              )}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle>Resumo do Pedido</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Order Items */}
                <div className="space-y-3">
                  {cartItems.map(item => (
                    <div
                      key={item.productId}
                      className="flex items-center space-x-3"
                    >
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg flex items-center justify-center">
                        <Gift className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-sm">{item.name}</div>
                        <div className="text-xs text-gray-600">
                          Qtd: {item.quantity}
                        </div>
                      </div>
                      <div className="text-sm font-medium">
                        {item.points_cost * item.quantity} pts
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal ({getTotalItems()} itens)</span>
                    <span>{getTotalPoints()} pontos</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Entrega</span>
                    <span className="text-green-600">Grátis</span>
                  </div>
                  <div className="border-t pt-2">
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span className="text-blue-600">
                        {getTotalPoints()} pontos
                      </span>
                    </div>
                  </div>
                </div>

                {/* Shipping Info */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Truck className="h-5 w-5 text-blue-600" />
                    <span className="font-semibold text-blue-900">Entrega</span>
                  </div>
                  <p className="text-sm text-blue-800">
                    Entrega em 24-48 horas para todo o Brasil
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
