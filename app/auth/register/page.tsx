'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  Building2, 
  User, 
  Mail, 
  Phone, 
  Globe, 
  Users, 
  Gift, 
  CheckCircle, 
  ArrowRight, 
  ArrowLeft,
  Shield,
  Zap,
  Star,
  Clock,
  CreditCard,
  Upload,
  X
} from 'lucide-react'
import { YoobeLogo } from '@/components/ui/yoobe-logo'

interface FormData {
  companyName: string
  companyEmail: string
  companyPhone: string
  companyWebsite: string
  employeeCount: string
  contactName: string
  contactEmail: string
  contactPhone: string
  password: string
  confirmPassword: string
  plan: string
  acceptTerms: boolean
  acceptMarketing: boolean
  logo: File | null
  logoPreview: string
}

export default function RegisterPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState<FormData>({
    companyName: '',
    companyEmail: '',
    companyPhone: '',
    companyWebsite: '',
    employeeCount: '',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    password: '',
    confirmPassword: '',
    plan: 'starter',
    acceptTerms: false,
    acceptMarketing: false,
    logo: null,
    logoPreview: ''
  })

  const [isLoading, setIsLoading] = useState(false)

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert('O arquivo deve ter menos de 5MB')
        return
      }
      
      const reader = new FileReader()
      reader.onload = (e) => {
        setFormData(prev => ({
          ...prev,
          logo: file,
          logoPreview: e.target?.result as string
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  const removeLogo = () => {
    setFormData(prev => ({
      ...prev,
      logo: null,
      logoPreview: ''
    }))
  }

  const plans = [
    {
      id: 'starter',
      name: 'Starter',
      price: 'R$ 299',
      period: '/mês',
      description: 'Ideal para empresas pequenas',
      features: [
        'Até 50 funcionários',
        'Loja personalizada',
        'Catálogo básico',
        'Integração com 1 plataforma',
        'Suporte por email',
        'Relatórios básicos'
      ],
      popular: false
    },
    {
      id: 'professional',
      name: 'Professional',
      price: 'R$ 599',
      period: '/mês',
      description: 'Para empresas em crescimento',
      features: [
        'Até 200 funcionários',
        'Loja personalizada avançada',
        'Catálogo completo',
        'Integração com 3 plataformas',
        'Suporte prioritário',
        'Analytics avançados',
        'API personalizada'
      ],
      popular: true
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 'Sob consulta',
      period: '',
      description: 'Para grandes empresas',
      features: [
        'Funcionários ilimitados',
        'Loja white-label',
        'Catálogo customizado',
        'Integração ilimitada',
        'Suporte dedicado 24/7',
        'Analytics customizados',
        'API completa',
        'Onboarding personalizado'
      ],
      popular: false
    }
  ]

  const employeeCountOptions = [
    { value: '1-10', label: '1-10 funcionários' },
    { value: '11-50', label: '11-50 funcionários' },
    { value: '51-200', label: '51-200 funcionários' },
    { value: '201-500', label: '201-500 funcionários' },
    { value: '500+', label: '500+ funcionários' }
  ]

  const handleInputChange = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2)
    } else if (step === 2 && validateStep2()) {
      setStep(3)
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  const validateStep1 = () => {
    return formData.companyName && formData.companyEmail && formData.employeeCount
  }

  const validateStep2 = () => {
    return formData.contactName && formData.contactEmail && formData.password && formData.confirmPassword
  }

  const validateStep3 = () => {
    return formData.acceptTerms
  }

  const handleSubmit = async () => {
    if (!validateStep3()) return

    setIsLoading(true)
    
    try {
      // Criar FormData para upload
      const submitData = new FormData()
      submitData.append('companyName', formData.companyName)
      submitData.append('companyEmail', formData.companyEmail)
      submitData.append('companyPhone', formData.companyPhone)
      submitData.append('companyWebsite', formData.companyWebsite)
      submitData.append('employeeCount', formData.employeeCount)
      submitData.append('contactName', formData.contactName)
      submitData.append('contactEmail', formData.contactEmail)
      submitData.append('contactPhone', formData.contactPhone)
      submitData.append('password', formData.password)
      submitData.append('plan', formData.plan)
      submitData.append('acceptTerms', formData.acceptTerms.toString())
      submitData.append('acceptMarketing', formData.acceptMarketing.toString())
      
      if (formData.logo) {
        submitData.append('logo', formData.logo)
      }

      // Enviar dados para API
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        body: submitData
      })

      if (response.ok) {
        const result = await response.json()
        // Redirecionar para onboarding com dados da conta criada
        router.push(`/onboarding?accountId=${result.accountId}&storeUrl=${result.storeUrl}`)
      } else {
        const error = await response.json()
        alert(`Erro ao criar conta: ${error.message}`)
      }
    } catch (error) {
      console.error('Erro ao criar conta:', error)
      alert('Erro ao criar conta. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  const getStepTitle = () => {
    switch (step) {
      case 1: return 'Informações da Empresa'
      case 2: return 'Dados do Contato'
      case 3: return 'Escolha seu Plano'
      default: return ''
    }
  }

  const getStepDescription = () => {
    switch (step) {
      case 1: return 'Conte-nos sobre sua empresa'
      case 2: return 'Dados do responsável pela conta'
      case 3: return 'Escolha o plano ideal para você'
      default: return ''
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="mb-4">
            <YoobeLogo size={40} variant="default" />
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Criar Conta Empresarial</h1>
          <p className="text-gray-600">Transforme seu programa de reconhecimento em minutos</p>
        </div>

        {/* Progress Steps */}
        <div className="max-w-md mx-auto mb-8">
          <div className="flex items-center justify-between">
            {[1, 2, 3].map((stepNumber) => (
              <div key={stepNumber} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step >= stepNumber 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {step > stepNumber ? <CheckCircle className="w-5 h-5" /> : stepNumber}
                </div>
                {stepNumber < 3 && (
                  <div className={`w-16 h-1 mx-2 ${
                    step > stepNumber ? 'bg-blue-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Form */}
            <div className="lg:col-span-2">
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-2xl">{getStepTitle()}</CardTitle>
                  <CardDescription>{getStepDescription()}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {step === 1 && (
                    <div className="space-y-4">
                      {/* Logo Upload */}
                      <div>
                        <Label>Logo da Empresa</Label>
                        <div className="mt-2">
                          {formData.logoPreview ? (
                            <div className="flex items-center space-x-4">
                              <div className="w-20 h-20 rounded-lg border-2 border-gray-200 flex items-center justify-center overflow-hidden">
                                <img 
                                  src={formData.logoPreview} 
                                  alt="Logo preview" 
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="flex-1">
                                <p className="text-sm text-gray-600">{formData.logo?.name}</p>
                                <button
                                  type="button"
                                  onClick={removeLogo}
                                  className="text-red-500 text-sm hover:text-red-700 flex items-center mt-1"
                                >
                                  <X className="w-4 h-4 mr-1" />
                                  Remover
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                              <input
                                type="file"
                                id="logo"
                                accept="image/*"
                                onChange={handleLogoUpload}
                                className="hidden"
                              />
                              <label htmlFor="logo" className="cursor-pointer">
                                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                <p className="text-sm text-gray-600">
                                  Clique para fazer upload do logo
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                  PNG, JPG até 5MB
                                </p>
                              </label>
                            </div>
                          )}
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="companyName">Nome da Empresa *</Label>
                        <Input
                          id="companyName"
                          value={formData.companyName}
                          onChange={(e) => handleInputChange('companyName', e.target.value)}
                          placeholder="Ex: TechCorp Ltda"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="companyEmail">Email Corporativo *</Label>
                        <Input
                          id="companyEmail"
                          type="email"
                          value={formData.companyEmail}
                          onChange={(e) => handleInputChange('companyEmail', e.target.value)}
                          placeholder="contato@empresa.com"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="companyPhone">Telefone</Label>
                        <Input
                          id="companyPhone"
                          value={formData.companyPhone}
                          onChange={(e) => handleInputChange('companyPhone', e.target.value)}
                          placeholder="(11) 99999-9999"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="companyWebsite">Website</Label>
                        <Input
                          id="companyWebsite"
                          value={formData.companyWebsite}
                          onChange={(e) => handleInputChange('companyWebsite', e.target.value)}
                          placeholder="https://empresa.com"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="employeeCount">Número de Funcionários *</Label>
                        <select
                          id="employeeCount"
                          value={formData.employeeCount}
                          onChange={(e) => handleInputChange('employeeCount', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Selecione...</option>
                          {employeeCountOptions.map(option => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}

                  {step === 2 && (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="contactName">Nome Completo *</Label>
                        <Input
                          id="contactName"
                          value={formData.contactName}
                          onChange={(e) => handleInputChange('contactName', e.target.value)}
                          placeholder="Seu nome completo"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="contactEmail">Email *</Label>
                        <Input
                          id="contactEmail"
                          type="email"
                          value={formData.contactEmail}
                          onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                          placeholder="seu@email.com"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="contactPhone">Telefone</Label>
                        <Input
                          id="contactPhone"
                          value={formData.contactPhone}
                          onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                          placeholder="(11) 99999-9999"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="password">Senha *</Label>
                        <Input
                          id="password"
                          type="password"
                          value={formData.password}
                          onChange={(e) => handleInputChange('password', e.target.value)}
                          placeholder="Mínimo 8 caracteres"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="confirmPassword">Confirmar Senha *</Label>
                        <Input
                          id="confirmPassword"
                          type="password"
                          value={formData.confirmPassword}
                          onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                          placeholder="Confirme sua senha"
                        />
                      </div>
                    </div>
                  )}

                  {step === 3 && (
                    <div className="space-y-4">
                      <div className="grid gap-4">
                        {plans.map((plan) => (
                          <div
                            key={plan.id}
                            className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                              formData.plan === plan.id
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                            onClick={() => handleInputChange('plan', plan.id)}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div>
                                <h3 className="font-semibold text-lg">{plan.name}</h3>
                                <p className="text-gray-600 text-sm">{plan.description}</p>
                              </div>
                              <div className="text-right">
                                <div className="text-2xl font-bold">{plan.price}</div>
                                <div className="text-gray-500 text-sm">{plan.period}</div>
                              </div>
                            </div>
                            <ul className="space-y-1 text-sm text-gray-600">
                              {plan.features.slice(0, 3).map((feature, index) => (
                                <li key={index} className="flex items-center">
                                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                                  {feature}
                                </li>
                              ))}
                            </ul>
                            {plan.popular && (
                              <Badge className="mt-2 bg-blue-100 text-blue-800">
                                Mais Popular
                              </Badge>
                            )}
                          </div>
                        ))}
                      </div>

                      <Separator />

                      <div className="space-y-3">
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={formData.acceptTerms}
                            onChange={(e) => handleInputChange('acceptTerms', e.target.checked)}
                            className="rounded border-gray-300"
                          />
                          <span className="text-sm">
                            Concordo com os{' '}
                            <Link href="/termos" className="text-blue-600 hover:underline">
                              Termos de Uso
                            </Link>{' '}
                            e{' '}
                            <Link href="/privacidade" className="text-blue-600 hover:underline">
                              Política de Privacidade
                            </Link>
                          </span>
                        </label>
                        
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={formData.acceptMarketing}
                            onChange={(e) => handleInputChange('acceptMarketing', e.target.checked)}
                            className="rounded border-gray-300"
                          />
                          <span className="text-sm">
                            Aceito receber emails sobre novidades e atualizações da Yoobe
                          </span>
                        </label>
                      </div>
                    </div>
                  )}

                  {/* Navigation Buttons */}
                  <div className="flex justify-between pt-6">
                    {step > 1 && (
                      <Button variant="outline" onClick={handleBack}>
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Voltar
                      </Button>
                    )}
                    
                    <div className="ml-auto">
                      {step < 3 ? (
                        <Button 
                          onClick={handleNext}
                          disabled={
                            (step === 1 && !validateStep1()) ||
                            (step === 2 && !validateStep2())
                          }
                        >
                          Próximo
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      ) : (
                        <Button 
                          onClick={handleSubmit}
                          disabled={!validateStep3() || isLoading}
                          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                        >
                          {isLoading ? 'Criando conta...' : 'Criar Conta'}
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Benefits */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Star className="w-5 h-5 text-yellow-500 mr-2" />
                    Benefícios Inclusos
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    <span className="text-sm">Setup em 5 minutos</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    <span className="text-sm">14 dias grátis</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    <span className="text-sm">Suporte especializado</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    <span className="text-sm">Cancelamento gratuito</span>
                  </div>
                </CardContent>
              </Card>

              {/* Security */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Shield className="w-5 h-5 text-green-500 mr-2" />
                    Segurança
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    <span className="text-sm">SSL 256-bit</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    <span className="text-sm">GDPR Compliant</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    <span className="text-sm">Backup automático</span>
                  </div>
                </CardContent>
              </Card>

              {/* Support */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Clock className="w-5 h-5 text-blue-500 mr-2" />
                    Suporte 24/7
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-3">
                    Nossa equipe está sempre pronta para ajudar você a ter sucesso.
                  </p>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center">
                      <Mail className="w-4 h-4 text-gray-400 mr-2" />
                      suporte@yoobe.com
                    </div>
                    <div className="flex items-center">
                      <Phone className="w-4 h-4 text-gray-400 mr-2" />
                      (11) 99999-9999
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-gray-600">
            Já tem uma conta?{' '}
            <Link href="/auth/login" className="text-blue-600 hover:underline font-medium">
              Fazer login
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
