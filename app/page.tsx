'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { YoobeLogo } from '@/components/ui/yoobe-logo'
import { RedirectProgress } from '@/components/ui/redirect-progress'
import {
  ArrowRight,
  BarChart3,
  ShieldCheck,
  Sparkles,
  Trophy,
  ExternalLink,
  Calendar,
  Mail,
  Zap,
  Users,
  Package,
  Gift,
  CreditCard,
  Coffee,
  Shirt,
  Smartphone,
  ChevronLeft,
  ChevronRight,
  Award,
  Target,
  Heart,
  Star,
  Store,
  Truck,
  Palette,
  MapPin,
  FileText,
  Headphones,
  Globe,
  Warehouse,
  DollarSign,
  CheckCircle,
  Building,
  ShoppingCart,
  Coins,
  TrendingUp,
  Code,
} from 'lucide-react'
import { corporateDeck } from '@/lib/marketing/corporate-deck'
import { CodeBlock } from '@/components/ui/code-block'

const navLinks = [
  {
    label: 'API',
    href: '#api',
    external: false,
    icon: Code,
  },
  {
    label: 'Gamificação',
    href: '#gamificacao',
    external: false,
    icon: Trophy,
  },
  {
    label: 'Solução',
    href: '#solucao',
    external: false,
    icon: Sparkles,
  },
  {
    label: 'Clientes',
    href: 'https://dashboard.yoobe.app/dashboard',
    external: true,
    icon: Users,
  },
  {
    label: 'Contato',
    href: 'https://wa.me/554187582060',
    external: true,
    icon: Calendar,
  },
  {
    label: 'Catálogo',
    href: 'https://catalogo.yoobe.co',
    external: true,
    icon: Package,
  },
  {
    label: 'Fale conosco',
    href: 'mailto:vendas@yoobe.co',
    external: true,
    icon: Mail,
  },
]

const gamificationHighlights = [
  {
    title: 'APIs e Integrações',
    description:
      'Monitoramento em tempo real, auditoria completa e segurança reforçada. APIs RESTful documentadas e SDKs para integração rápida.',
    badge: 'Nível 4 · Confiável',
    icon: ShieldCheck,
    href: 'https://catalogo.yoobe.co',
    gradient: 'from-emerald-500/20 to-teal-500/20',
    iconColor: 'text-emerald-300',
  },
  {
    title: 'Novos Produtos & Fornecedores',
    description:
      'Curadoria corporativa especializada, integrações inteligentes e replicação automática de catálogos. Expansão contínua de parceiros.',
    badge: 'Expansão · +12 parceiros',
    icon: Package,
    href: 'https://catalogo.yoobe.co',
    gradient: 'from-sky-500/20 to-indigo-500/20',
    iconColor: 'text-sky-300',
  },
  {
    title: 'Loja Corporativa Gamificada',
    description:
      'Plataforma de gamificação completa com benefícios progressivos, missões corporativas e catálogo com sistema de recompensas e pontos.',
    badge: 'Próximo nível · 78%',
    icon: Trophy,
    href: 'https://dashboard.yoobe.app/dashboard',
    gradient: 'from-purple-500/20 to-fuchsia-500/20',
    iconColor: 'text-purple-300',
  },
]

const useCases = [
  {
    id: 1,
    title: 'Gamifique Clientes com Brindes Personalizados',
    description:
      'Clientes resgatam swags exclusivos ao completar missões e alcançar níveis.',
    productType: 'físico',
    category: 'clientes',
    icon: Shirt,
    gradient: 'from-blue-500/20 to-cyan-500/20',
    iconColor: 'text-blue-300',
    badge: 'Swag Personalizado',
    example: 'Camisetas, moletons e acessórios com logo da marca',
  },
  {
    id: 2,
    title: 'Recompense Times com Gift Cards Digitais',
    description:
      'Vouchers instantâneos para reconhecimento imediato de conquistas.',
    productType: 'digital',
    category: 'times',
    icon: CreditCard,
    gradient: 'from-purple-500/20 to-pink-500/20',
    iconColor: 'text-purple-300',
    badge: 'Recompensa Digital',
    example: 'Gift cards, vouchers e créditos para resgate',
  },
  {
    id: 3,
    title: 'Celebre Conquistas com Kits Premium',
    description:
      'Kits gourmet e experiências gastronômicas para momentos especiais.',
    productType: 'perecível',
    category: 'times',
    icon: Coffee,
    gradient: 'from-amber-500/20 to-orange-500/20',
    iconColor: 'text-amber-300',
    badge: 'Experiência Premium',
    example: 'Cestas, vinhos e produtos artesanais selecionados',
  },
  {
    id: 4,
    title: 'Engaje com Produtos Físicos Exclusivos',
    description:
      'Brindes corporativos personalizados para programas de fidelidade.',
    productType: 'físico',
    category: 'clientes',
    icon: Gift,
    gradient: 'from-emerald-500/20 to-teal-500/20',
    iconColor: 'text-emerald-300',
    badge: 'Fidelidade',
    example: 'Canecas, power banks e itens promocionais',
  },
  {
    id: 5,
    title: 'Reconheça com Vouchers e Créditos',
    description:
      'Sistema de pontos convertível em recompensas digitais instantâneas.',
    productType: 'digital',
    category: 'clientes',
    icon: Smartphone,
    gradient: 'from-indigo-500/20 to-violet-500/20',
    iconColor: 'text-indigo-300',
    badge: 'Recompensa Instantânea',
    example: 'Créditos em apps, assinaturas e serviços digitais',
  },
  {
    id: 6,
    title: 'Incentive Times com Swags Corporativos',
    description:
      'Equipes ganham produtos personalizados ao bater metas e objetivos.',
    productType: 'físico',
    category: 'times',
    icon: Award,
    gradient: 'from-rose-500/20 to-red-500/20',
    iconColor: 'text-rose-300',
    badge: 'Reconhecimento',
    example: 'Hoodies, notebooks e acessórios de escritório',
  },
  {
    id: 7,
    title: 'Premie com Experiências Gastronômicas',
    description:
      'Kits perecíveis premium para celebrar marcos e conquistas importantes.',
    productType: 'perecível',
    category: 'clientes',
    icon: Heart,
    gradient: 'from-pink-500/20 to-rose-500/20',
    iconColor: 'text-pink-300',
    badge: 'Experiência Única',
    example: 'Chocolates artesanais, cafés especiais e vinhos',
  },
  {
    id: 8,
    title: 'Gamifique Progressão com Níveis e Badges',
    description:
      'Sistema de níveis progressivo com recompensas físicas e digitais.',
    productType: 'digital',
    category: 'times',
    icon: Star,
    gradient: 'from-yellow-500/20 to-amber-500/20',
    iconColor: 'text-yellow-300',
    badge: 'Progressão',
    example: 'Badges digitais desbloqueiam produtos exclusivos',
  },
]

function ClientLogo({
  name,
  logo,
  alt,
  fallbackColor,
}: {
  name: string
  logo: string
  alt: string
  fallbackColor: string
}) {
  const [imageError, setImageError] = useState(false)

  return (
    <div className="flex items-center justify-center h-16 w-32 opacity-60 hover:opacity-100 transition-opacity">
      {!imageError ? (
        <Image
          src={logo}
          alt={alt}
          width={128}
          height={64}
          className="object-contain max-h-16 w-auto grayscale hover:grayscale-0 transition-all"
          onError={() => setImageError(true)}
        />
      ) : (
        <span className={`text-xl font-bold ${fallbackColor}`}>
          {name.toUpperCase()}
        </span>
      )}
    </div>
  )
}

function AnimatedUseCasesDisplay() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const interval = setInterval(() => {
      setIsVisible(false)
      setTimeout(() => {
        setCurrentIndex(prev => (prev + 1) % useCases.length)
        setIsVisible(true)
      }, 300)
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const goToNext = () => {
    setIsVisible(false)
    setTimeout(() => {
      setCurrentIndex(prev => (prev + 1) % useCases.length)
      setIsVisible(true)
    }, 300)
  }

  const goToPrevious = () => {
    setIsVisible(false)
    setTimeout(() => {
      setCurrentIndex(prev => (prev - 1 + useCases.length) % useCases.length)
      setIsVisible(true)
    }, 300)
  }

  const goToSlide = (index: number) => {
    setIsVisible(false)
    setTimeout(() => {
      setCurrentIndex(index)
      setIsVisible(true)
    }, 300)
  }

  const currentCase = useCases[currentIndex]
  const Icon = currentCase.icon

  return (
    <div className="relative w-full">
      <div className="relative overflow-hidden rounded-3xl border-2 border-white/10 bg-white/5 backdrop-blur-sm p-6 shadow-lg sm:p-8">
        <div
          className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${currentCase.gradient} opacity-20`}
        />

        <div
          className={`relative transition-opacity duration-500 ${
            isVisible ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div className="flex flex-col items-start gap-6 sm:flex-row">
            <div className="flex-shrink-0">
              <div
                className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 ${currentCase.iconColor} ring-2 ring-white/20 shadow-md sm:h-16 sm:w-16`}
              >
                <Icon className="h-7 w-7 sm:h-8 sm:w-8" />
              </div>
            </div>

            <div className="flex-1 space-y-4">
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <span className="rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-xs font-semibold uppercase tracking-wider text-slate-200 sm:px-3">
                  {currentCase.badge}
                </span>
                <span className="rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-xs font-medium text-slate-300 sm:px-3">
                  {currentCase.productType === 'físico' && '📦 Físico'}
                  {currentCase.productType === 'digital' && '💳 Digital'}
                  {currentCase.productType === 'perecível' && '🍷 Perecível'}
                </span>
                <span className="rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-xs font-medium text-slate-300 sm:px-3">
                  {currentCase.category === 'clientes' && '👥 Clientes'}
                  {currentCase.category === 'times' && '👔 Times'}
                </span>
              </div>

              <h3 className="text-xl font-bold text-white sm:text-2xl lg:text-3xl">
                {currentCase.title}
              </h3>

              <p className="text-base text-slate-200 leading-relaxed sm:text-lg">
                {currentCase.description}
              </p>

              <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-3 sm:p-4">
                <p className="text-xs font-medium text-slate-200 sm:text-sm">
                  <Sparkles className="mr-2 inline h-3.5 w-3.5 text-indigo-300 sm:h-4 sm:w-4" />
                  Exemplo: {currentCase.example}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Controles - Ocultos em mobile muito pequeno */}
        <div className="absolute left-2 top-1/2 hidden -translate-y-1/2 sm:block">
          <button
            onClick={goToPrevious}
            className="rounded-full border border-white/20 bg-white/10 p-2 text-white shadow-md backdrop-blur-sm transition-all hover:bg-white/20 hover:border-indigo-400/50 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            aria-label="Anterior"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        </div>

        <div className="absolute right-2 top-1/2 hidden -translate-y-1/2 sm:block">
          <button
            onClick={goToNext}
            className="rounded-full border border-white/20 bg-white/10 p-2 text-white shadow-md backdrop-blur-sm transition-all hover:bg-white/20 hover:border-indigo-400/50 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            aria-label="Próximo"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        {/* Indicadores */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 sm:bottom-4">
          {useCases.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`h-2 rounded-full transition-all ${
                index === currentIndex
                  ? 'w-8 bg-indigo-400 shadow-md shadow-indigo-500/50'
                  : 'w-2 bg-white/30 hover:bg-white/50'
              }`}
              aria-label={`Ir para slide ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Grid de preview (mobile) */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:hidden">
        {useCases.slice(0, 4).map((useCase, index) => {
          const CaseIcon = useCase.icon
          return (
            <div
              key={useCase.id}
              className={`rounded-xl border p-3 transition-all ${
                index === currentIndex % 4
                  ? 'border-indigo-400/50 bg-indigo-500/20'
                  : 'border-white/10 bg-white/5'
              }`}
            >
              <div className="flex items-center gap-2">
                <CaseIcon className={`h-4 w-4 ${useCase.iconColor}`} />
                <p className="text-xs font-medium text-slate-200 line-clamp-2">
                  {useCase.title}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function HomePageContent() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 text-slate-50">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_20%,rgba(99,102,241,0.15),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(56,189,248,0.12),transparent_30%),radial-gradient(circle_at_30%_80%,rgba(236,72,153,0.10),transparent_30%)]" />
        <div className="absolute inset-0 bg-grid-white/[0.03]" />
      </div>

      <header className="relative z-10 border-b border-white/10 bg-slate-900/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-6 py-6">
          <div className="flex items-center gap-4">
            <YoobeLogo size={72} showText={false} variant="white" />
          </div>

          <nav className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/5 px-2 py-1 text-sm font-medium text-slate-200 shadow-lg backdrop-blur-sm md:flex">
            {navLinks.map(item => {
              const Icon = item.icon
              const LinkComponent = item.external ? 'a' : Link
              const linkProps = item.external
                ? {
                    href: item.href,
                    target: '_blank',
                    rel: 'noopener noreferrer',
                  }
                : { href: item.href }
              return (
                <LinkComponent
                  key={item.label}
                  {...linkProps}
                  className="group inline-flex items-center gap-1.5 rounded-full px-3 py-2 transition-all duration-200 hover:bg-white/10 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-300"
                >
                  <Icon className="h-3.5 w-3.5" />
                  {item.label}
                  {item.external && (
                    <ExternalLink className="h-3 w-3 opacity-60 transition-opacity group-hover:opacity-100" />
                  )}
                </LinkComponent>
              )
            })}
          </nav>

          <div className="flex items-center gap-2">
            <a
              href="https://calendly.com/yoobeco/demo?month=2021-08"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 px-4 py-2 text-sm font-bold text-white shadow-lg transition-all duration-200 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-600 hover:shadow-xl hover:translate-y-[-1px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400"
            >
              <Calendar className="h-4 w-4" />
              Agendar Demo
              <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
            </a>
            <a
              href="https://wa.me/554187582060"
              className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-500 to-green-500 px-4 py-2 text-sm font-bold text-white shadow-lg transition-all duration-200 hover:from-emerald-600 hover:to-green-600 hover:shadow-xl hover:translate-y-[-1px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400"
            >
              WhatsApp
              <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
            </a>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-6xl px-6 pb-20 pt-14 md:pt-16 lg:pt-20">
        <section
          id="clientes"
          className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]"
        >
          <div className="space-y-8">
            <div className="inline-flex items-center gap-3 rounded-full border-2 border-amber-400/50 bg-gradient-to-r from-amber-500/20 to-yellow-500/20 px-4 py-2 text-sm font-semibold text-amber-200 shadow-md backdrop-blur-sm">
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_0_6px_rgba(52,211,153,0.3)] animate-pulse" />
              <Zap className="h-4 w-4 text-amber-300" />
              <span className="whitespace-nowrap">
                Grandes novidades em janeiro — Fique atento!
              </span>
            </div>

            <div className="space-y-4">
              <h1 className="text-3xl font-semibold leading-tight text-white sm:text-4xl lg:text-5xl">
                {corporateDeck.hero.title}
              </h1>
              <p className="max-w-2xl text-lg text-slate-200 sm:text-xl">
                {corporateDeck.hero.subtitle}{' '}
                <strong className="text-white">
                  Em janeiro teremos grandes novidades!
                </strong>{' '}
                Fique à vontade para navegar pelos atalhos abaixo.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <a
                href="https://calendly.com/yoobeco/demo?month=2021-08"
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 px-4 py-3 text-sm font-semibold text-white shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-600 hover:shadow-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400"
              >
                <Calendar className="h-4 w-4" />
                Agendar Demo
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
              </a>
              <a
                href="https://catalogo.yoobe.co"
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-2 rounded-xl border-2 border-indigo-400 bg-indigo-500/20 px-4 py-3 text-sm font-semibold text-indigo-200 shadow-sm backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-indigo-400 hover:bg-indigo-500/30 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400"
              >
                Explorar catálogo
                <ExternalLink className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
              </a>
              <a
                href="https://wa.me/554187582060"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border-2 border-emerald-400 bg-emerald-500/20 px-4 py-3 text-sm font-semibold text-emerald-200 shadow-sm backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-emerald-400 hover:bg-emerald-500/30 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400"
              >
                <Calendar className="h-4 w-4" />
                WhatsApp: +55 41 8758-2060
              </a>
            </div>

            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2 rounded-full border-2 border-purple-400/50 bg-purple-500/20 px-3 py-2 shadow-sm backdrop-blur-sm">
                <Sparkles className="h-4 w-4 text-purple-300" />
                <span className="font-semibold text-purple-200">
                  Gamificação progressiva
                </span>
              </div>
              <div className="flex items-center gap-2 rounded-full border-2 border-emerald-400/50 bg-emerald-500/20 px-3 py-2 shadow-sm backdrop-blur-sm">
                <ShieldCheck className="h-4 w-4 text-emerald-300" />
                <span className="font-semibold text-emerald-200">
                  Segurança reforçada
                </span>
              </div>
              <div className="flex items-center gap-2 rounded-full border-2 border-blue-400/50 bg-blue-500/20 px-3 py-2 shadow-sm backdrop-blur-sm">
                <BarChart3 className="h-4 w-4 text-blue-300" />
                <span className="font-semibold text-blue-200">
                  Insights corporativos
                </span>
              </div>
            </div>
          </div>

          <div
            id="catalogo"
            className="relative rounded-3xl border-2 border-white/10 bg-white/5 backdrop-blur-sm p-6 shadow-xl"
          >
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-indigo-500/10 via-transparent to-purple-500/10" />
            <div className="relative space-y-6">
              <div className="flex items-center justify-between gap-3 rounded-2xl border-2 border-white/10 bg-white/5 backdrop-blur-sm px-4 py-3 shadow-md">
                <div>
                  <p className="text-xs uppercase tracking-[0.14em] text-indigo-300 font-bold">
                    Progresso do portal
                  </p>
                  <p className="text-lg font-bold text-white">
                    Nível Corporativo 3/5
                  </p>
                </div>
                <div className="flex items-center gap-2 rounded-full border-2 border-indigo-400/50 bg-indigo-500/20 px-3 py-1 text-xs font-bold text-indigo-200 shadow-sm">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_0_6px_rgba(52,211,153,0.3)] animate-pulse" />
                  Em desenvolvimento
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm text-slate-200">
                  <p>APIs, integrações e dados</p>
                  <span className="text-xs font-semibold text-emerald-300">
                    72%
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full w-[72%] rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 shadow-sm" />
                </div>

                <div className="flex items-center justify-between text-sm text-slate-200">
                  <p>Produtos, fornecedores e catálogo</p>
                  <span className="text-xs font-semibold text-blue-300">
                    64%
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full w-[64%] rounded-full bg-gradient-to-r from-blue-500 to-indigo-400 shadow-sm" />
                </div>

                <div className="flex items-center justify-between text-sm text-slate-200">
                  <p>Loja gamificada e experiências</p>
                  <span className="text-xs font-semibold text-purple-300">
                    78%
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full w-[78%] rounded-full bg-gradient-to-r from-purple-500 to-fuchsia-400 shadow-sm" />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="flex items-center gap-3 rounded-2xl border-2 border-white/10 bg-white/5 backdrop-blur-sm px-4 py-3 shadow-md">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-400/20 text-purple-300 ring-2 ring-purple-400/30">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">
                      Releases quinzenais
                    </p>
                    <p className="text-xs text-slate-300">
                      Roadmap público e alinhado a compliance.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-2xl border-2 border-white/10 bg-white/5 backdrop-blur-sm px-4 py-3 shadow-md">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-400/20 text-emerald-300 ring-2 ring-emerald-400/30">
                    <Trophy className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">
                      Benefícios progressivos
                    </p>
                    <p className="text-xs text-slate-300">
                      Programas de nível e incentivos por entrega.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Seção: Como ajudamos */}
        <section id="solucao" className="mt-20 space-y-8">
          <div className="text-center space-y-2">
            <p className="text-sm uppercase tracking-[0.18em] text-indigo-300 font-bold">
              Nossa solução
            </p>
            <h2 className="text-2xl font-bold text-white sm:text-3xl">
              {corporateDeck.solution.title}
            </h2>
            <p className="text-lg text-slate-300 max-w-2xl mx-auto">
              {corporateDeck.solution.description}
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {corporateDeck.solution.benefits.map((benefit, index) => {
              const IconMap: Record<string, any> = {
                store: Store,
                'dollar-sign': DollarSign,
                'check-circle': CheckCircle,
                package: Package,
              }
              const Icon = IconMap[benefit.icon] || Sparkles
              const colorClasses: Record<string, string> = {
                indigo:
                  'from-indigo-500/20 to-indigo-400/20 text-indigo-300 ring-indigo-400/30',
                green:
                  'from-green-500/20 to-green-400/20 text-green-300 ring-green-400/30',
                emerald:
                  'from-emerald-500/20 to-emerald-400/20 text-emerald-300 ring-emerald-400/30',
                blue: 'from-blue-500/20 to-blue-400/20 text-blue-300 ring-blue-400/30',
              }
              const colorClass =
                colorClasses[benefit.color] || colorClasses.indigo

              return (
                <div
                  key={index}
                  className="group relative rounded-2xl border-2 border-white/10 bg-white/5 backdrop-blur-sm p-6 shadow-md transition-all duration-200 hover:-translate-y-1 hover:border-indigo-400/50 hover:bg-white/10 hover:shadow-lg"
                >
                  <div
                    className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${
                      colorClass.split(' ')[0]
                    } ${
                      colorClass.split(' ')[1]
                    } opacity-0 transition-opacity duration-200 group-hover:opacity-20`}
                  />
                  <div className="relative flex items-start gap-4">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${colorClass} flex-shrink-0`}
                    >
                      <Icon className="h-6 w-6" />
                    </div>
                    <p className="text-base font-semibold text-white leading-relaxed">
                      {benefit.title}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="text-center pt-4">
            <Link
              href="/solucao"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-600 hover:shadow-xl"
            >
              Conheça nossa solução completa
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>

        {/* Seção: API Features */}
        <section id="api" className="mt-20 space-y-8">
          <div className="text-center space-y-2">
            <p className="text-sm uppercase tracking-[0.18em] text-indigo-300 font-bold">
              Integração e Automação
            </p>
            <h2 className="text-2xl font-bold text-white sm:text-3xl">
              {corporateDeck.apiFeatures.title}
            </h2>
            <p className="text-lg text-slate-300 max-w-2xl mx-auto">
              {corporateDeck.apiFeatures.description}
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {corporateDeck.apiFeatures.features.map((feature, index) => {
              const IconMap: Record<string, any> = {
                building: Store,
                users: Users,
                package: Package,
                gift: Gift,
                'shopping-cart': CreditCard,
                'bar-chart': BarChart3,
              }
              const Icon = IconMap[feature.icon] || Sparkles
              const colorClasses: Record<string, string> = {
                blue: 'from-blue-500/20 to-blue-400/20 text-blue-300 ring-blue-400/30',
                indigo:
                  'from-indigo-500/20 to-indigo-400/20 text-indigo-300 ring-indigo-400/30',
                purple:
                  'from-purple-500/20 to-purple-400/20 text-purple-300 ring-purple-400/30',
                pink: 'from-pink-500/20 to-pink-400/20 text-pink-300 ring-pink-400/30',
                green:
                  'from-green-500/20 to-green-400/20 text-green-300 ring-green-400/30',
                orange:
                  'from-orange-500/20 to-orange-400/20 text-orange-300 ring-orange-400/30',
              }
              const colorClass =
                colorClasses[feature.color] || colorClasses.blue

              return (
                <div
                  key={index}
                  className="group relative rounded-2xl border-2 border-white/10 bg-white/5 backdrop-blur-sm p-6 shadow-md transition-all duration-200 hover:-translate-y-1 hover:border-indigo-400/50 hover:bg-white/10 hover:shadow-lg"
                >
                  <div
                    className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${
                      colorClass.split(' ')[0]
                    } ${
                      colorClass.split(' ')[1]
                    } opacity-0 transition-opacity duration-200 group-hover:opacity-20`}
                  />
                  <div className="relative">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${colorClass} mb-4`}
                    >
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="text-base font-bold text-white mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-slate-300 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Exemplos de Código da API */}
          <div className="mt-12 space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-bold text-white mb-2">
                Exemplos Práticos de Integração
              </h3>
              <p className="text-sm text-slate-400">
                Veja como é simples integrar a Yoobe na sua plataforma
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <CodeBlock
                title="Criar Empresa e Loja"
                description="Registre uma nova empresa e crie sua loja automaticamente"
                code={`POST /api/v2/admin/companies
Content-Type: application/json
Authorization: Bearer YOUR_API_KEY

{
  "name": "Minha Empresa",
  "cnpj": "12.345.678/0001-90",
  "domain": "minha-empresa",
  "settings": {
    "store_name": "Loja Corporativa",
    "branding": {
      "primary_color": "#6366f1",
      "logo_url": "https://..."
    }
  }
}

// Resposta
{
  "success": true,
  "data": {
    "company_id": "uuid",
    "store_id": "uuid",
    "store_url": "https://minha-empresa.yoobe.app"
  }
}`}
                language="http"
                docsUrl="/docs/API_REFERENCE"
              />

              <CodeBlock
                title="Sincronizar Usuários em Lote"
                description="Importe funcionários de forma eficiente"
                code={`POST /api/user-registration/bulk
Content-Type: application/json
Authorization: Bearer YOUR_API_KEY

{
  "company_id": "uuid",
  "users": [
    {
      "email": "funcionario1@empresa.com",
      "full_name": "João Silva",
      "department": "Vendas",
      "points": 1000
    },
    {
      "email": "funcionario2@empresa.com",
      "full_name": "Maria Santos",
      "department": "Marketing",
      "points": 500
    }
  ]
}

// Resposta
{
  "success": true,
  "created": 2,
  "updated": 0,
  "errors": []
}`}
                language="http"
                docsUrl="/docs/API_REFERENCE"
              />

              <CodeBlock
                title="Adicionar Pontos de Gamificação"
                description="Integre pontos do Workvivo, Applause ou outras plataformas"
                code={`POST /api/points/add
Content-Type: application/json
Authorization: Bearer YOUR_API_KEY

{
  "user_id": "uuid",
  "points": 250,
  "source": "workvivo",
  "reason": "Conquista: Vendedor do Mês",
  "metadata": {
    "achievement_id": "ach_123",
    "campaign_id": "camp_456"
  }
}

// Resposta
{
  "success": true,
  "balance": 1250,
  "transaction_id": "txn_789"
}`}
                language="http"
                docsUrl="/docs/API_REFERENCE"
              />

              <CodeBlock
                title="Processar Checkout"
                description="Finalize pedidos e resgates via API"
                code={`POST /api/checkout/confirm
Content-Type: application/json
Authorization: Bearer YOUR_API_KEY

{
  "user_id": "uuid",
  "items": [
    {
      "product_id": "prod_123",
      "quantity": 1,
      "customization": {
        "text": "João Silva",
        "color": "#FF0000"
      }
    }
  ],
  "shipping_address": {
    "street": "Rua Exemplo, 123",
    "city": "São Paulo",
    "zip_code": "01234-567"
  },
  "payment_method": "points"
}

// Resposta
{
  "success": true,
  "order_id": "ord_789",
  "tracking_code": "BR123456789BR",
  "points_deducted": 500
}`}
                language="http"
                docsUrl="/docs/API_REFERENCE"
              />
            </div>

            <div className="text-center pt-4">
              <Link
                href="/docs/API_REFERENCE"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-600 hover:shadow-xl"
              >
                Ver Documentação Completa da API
                <ExternalLink className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* Seção: Gamificação */}
        <section id="gamificacao" className="mt-20 space-y-8">
          <div className="text-center space-y-2">
            <p className="text-sm uppercase tracking-[0.18em] text-purple-300 font-bold">
              Engajamento e Reconhecimento
            </p>
            <h2 className="text-2xl font-bold text-white sm:text-3xl">
              {corporateDeck.gamificationFeatures.title}
            </h2>
            <p className="text-lg text-slate-300 max-w-2xl mx-auto">
              {corporateDeck.gamificationFeatures.description}
            </p>
          </div>

          {/* Plataformas de Gamificação */}
          <div className="grid gap-6 md:grid-cols-3">
            {corporateDeck.gamificationFeatures.platforms.map(
              (platform, index) => {
                const IconMap: Record<string, any> = {
                  trophy: Trophy,
                  hand: Award,
                  heart: Heart,
                }
                const Icon = IconMap[platform.icon] || Gift
                const colorClasses: Record<string, string> = {
                  purple:
                    'from-purple-500/20 to-purple-400/20 text-purple-300 ring-purple-400/30',
                  blue: 'from-blue-500/20 to-blue-400/20 text-blue-300 ring-blue-400/30',
                  pink: 'from-pink-500/20 to-pink-400/20 text-pink-300 ring-pink-400/30',
                }
                const colorClass =
                  colorClasses[platform.color] || colorClasses.purple

                return (
                  <div
                    key={index}
                    className="group relative rounded-2xl border-2 border-white/10 bg-white/5 backdrop-blur-sm p-6 shadow-md transition-all duration-200 hover:-translate-y-1 hover:border-purple-400/50 hover:bg-white/10 hover:shadow-lg"
                  >
                    <div
                      className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${
                        colorClass.split(' ')[0]
                      } ${
                        colorClass.split(' ')[1]
                      } opacity-0 transition-opacity duration-200 group-hover:opacity-20`}
                    />
                    <div className="relative">
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${colorClass} mb-4`}
                      >
                        <Icon className="h-6 w-6" />
                      </div>
                      <h3 className="text-lg font-bold text-white mb-2">
                        {platform.name}
                      </h3>
                      <p className="text-sm text-slate-300 mb-4 leading-relaxed">
                        {platform.description}
                      </p>
                      <ul className="space-y-2">
                        {platform.features.map((feature, fIndex) => (
                          <li
                            key={fIndex}
                            className="text-xs text-slate-400 flex items-center gap-2"
                          >
                            <CheckCircle className="h-3 w-3 text-emerald-400" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )
              }
            )}
          </div>

          {/* Benefícios da Gamificação */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mt-12">
            {corporateDeck.gamificationFeatures.benefits.map(
              (benefit, index) => {
                const IconMap: Record<string, any> = {
                  coins: Coins,
                  'trending-up': Zap,
                  truck: Truck,
                  'bar-chart-3': BarChart3,
                }
                const Icon = IconMap[benefit.icon] || Sparkles
                const colorClasses: Record<string, string> = {
                  yellow:
                    'from-yellow-500/20 to-yellow-400/20 text-yellow-300 ring-yellow-400/30',
                  green:
                    'from-green-500/20 to-green-400/20 text-green-300 ring-green-400/30',
                  blue: 'from-blue-500/20 to-blue-400/20 text-blue-300 ring-blue-400/30',
                  indigo:
                    'from-indigo-500/20 to-indigo-400/20 text-indigo-300 ring-indigo-400/30',
                }
                const colorClass =
                  colorClasses[benefit.color] || colorClasses.blue

                return (
                  <div
                    key={index}
                    className="group relative rounded-2xl border-2 border-white/10 bg-white/5 backdrop-blur-sm p-5 shadow-md transition-all duration-200 hover:-translate-y-1 hover:border-purple-400/50 hover:bg-white/10 hover:shadow-lg"
                  >
                    <div
                      className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${
                        colorClass.split(' ')[0]
                      } ${
                        colorClass.split(' ')[1]
                      } opacity-0 transition-opacity duration-200 group-hover:opacity-20`}
                    />
                    <div className="relative">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${colorClass} mb-3`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <h4 className="text-sm font-bold text-white mb-1">
                        {benefit.title}
                      </h4>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {benefit.description}
                      </p>
                    </div>
                  </div>
                )
              }
            )}
          </div>

          {/* Exemplos de Integração com Plataformas */}
          <div className="mt-12 space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-bold text-white mb-2">
                Integração com Workvivo
              </h3>
              <p className="text-sm text-slate-400">
                Sincronize pontos e conquistas automaticamente
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <CodeBlock
                title="Webhook: Nova Conquista"
                description="Receba notificações quando um usuário ganha pontos no Workvivo"
                code={`POST /api/webhooks/workvivo/achievement
Content-Type: application/json
X-Workvivo-Signature: sha256=...

{
  "event": "achievement.unlocked",
  "user": {
    "workvivo_id": "wv_123",
    "email": "joao@empresa.com"
  },
  "achievement": {
    "id": "ach_456",
    "name": "Vendedor do Mês",
    "points": 500
  },
  "timestamp": "2025-01-15T10:30:00Z"
}

// A Yoobe automaticamente:
// 1. Identifica o usuário pelo email
// 2. Adiciona os pontos na conta
// 3. Notifica o usuário
// 4. Atualiza o leaderboard`}
                language="http"
              />

              <CodeBlock
                title="Sincronizar Leaderboard"
                description="Mantenha os rankings sincronizados entre Workvivo e Yoobe"
                code={`GET /api/v1/gamification/leaderboard
Authorization: Bearer YOUR_API_KEY
X-Platform: workvivo

// Resposta
{
  "success": true,
  "leaderboard": [
    {
      "user_id": "uuid",
      "name": "João Silva",
      "points": 5000,
      "rank": 1,
      "badges": ["top_seller", "monthly_champion"],
      "workvivo_profile": "https://workvivo.com/user/123"
    },
    {
      "user_id": "uuid",
      "name": "Maria Santos",
      "points": 3500,
      "rank": 2,
      "badges": ["consistent_performer"],
      "workvivo_profile": "https://workvivo.com/user/456"
    }
  ],
  "updated_at": "2025-01-15T10:30:00Z"
}`}
                language="http"
              />

              <CodeBlock
                title="Resgate Automático de Brinde"
                description="Quando o usuário resgata no Workvivo, a Yoobe processa automaticamente"
                code={`POST /api/v1/gamification/redeem
Content-Type: application/json
Authorization: Bearer YOUR_API_KEY

{
  "platform": "workvivo",
  "user_id": "uuid",
  "product_id": "prod_789",
  "points_cost": 1000,
  "workvivo_transaction_id": "wv_txn_123"
}

// A Yoobe:
// 1. Valida saldo de pontos
// 2. Cria pedido automaticamente
// 3. Processa customização
// 4. Envia para produção
// 5. Retorna tracking code

// Resposta
{
  "success": true,
  "order_id": "ord_456",
  "tracking_code": "BR987654321BR",
  "estimated_delivery": "2025-01-25",
  "points_remaining": 4000
}`}
                language="http"
              />

              <CodeBlock
                title="Sincronização Bidirecional"
                description="Mantenha pontos sincronizados em ambas as plataformas"
                code={`// Webhook da Yoobe para Workvivo
POST https://workvivo.com/api/webhooks/yoobe
Content-Type: application/json

{
  "event": "points.updated",
  "user": {
    "email": "joao@empresa.com",
    "yoobe_user_id": "uuid"
  },
  "points": {
    "balance": 4500,
    "added": 500,
    "source": "product_purchase",
    "transaction_id": "txn_789"
  },
  "timestamp": "2025-01-15T10:35:00Z"
}

// Workvivo atualiza automaticamente
// o saldo do usuário`}
                language="http"
              />
            </div>

            <div className="text-center pt-4">
              <Link
                href="/docs/API_REFERENCE"
                className="inline-flex items-center gap-2 rounded-xl border-2 border-purple-400 bg-purple-500/20 px-6 py-3 text-sm font-semibold text-purple-200 shadow-sm backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-purple-400 hover:bg-purple-500/30 hover:shadow-md"
              >
                Ver Guia de Integração Completo
                <ExternalLink className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        <section className="mt-14 space-y-8">
          <div id="contato" className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <p className="text-sm uppercase tracking-[0.18em] text-indigo-300 font-bold">
                Experiências em evolução
              </p>
              <h2 className="text-2xl font-bold text-white sm:text-3xl whitespace-nowrap">
                Gamificação e catálogo corporativo com status de progresso.
              </h2>
            </div>
            <Link
              href="#fale-conosco"
              className="hidden items-center gap-2 text-sm font-semibold text-indigo-300 transition-colors duration-200 hover:text-indigo-200 sm:inline-flex"
            >
              Fale conosco
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {gamificationHighlights.map(highlight => {
              const Icon = highlight.icon
              return (
                <a
                  key={highlight.title}
                  href={highlight.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-5 shadow-md transition-all duration-200 hover:-translate-y-1 hover:border-indigo-400/50 hover:bg-white/10 hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400"
                >
                  <div
                    className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${highlight.gradient} opacity-0 transition-opacity duration-200 group-hover:opacity-20`}
                  />
                  <div className="relative flex items-center gap-3">
                    <div
                      className={`flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 ${highlight.iconColor} ring-1 ring-white/20 transition-colors duration-200 group-hover:ring-indigo-400/50`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                        {highlight.badge}
                      </p>
                      <p className="text-lg font-semibold text-white">
                        {highlight.title}
                      </p>
                    </div>
                  </div>
                  <p className="relative mt-3 text-sm text-slate-300 leading-relaxed">
                    {highlight.description}
                  </p>
                  <div className="relative mt-4 inline-flex items-center gap-2 text-xs font-semibold text-indigo-300 transition-colors duration-200 group-hover:text-indigo-200">
                    Ver detalhes
                    <ExternalLink className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1" />
                  </div>
                </a>
              )
            })}
          </div>
        </section>

        {/* Seção de Screenshots da Plataforma (Spoiler) */}
        <section className="mt-20 space-y-8">
          <div className="text-center space-y-2">
            <p className="text-sm uppercase tracking-[0.18em] text-indigo-300 font-bold">
              Preview da plataforma
            </p>
            <h2 className="text-2xl font-bold text-white sm:text-3xl">
              Conheça a nova experiência Yoobe
            </h2>
            <p className="text-slate-300 max-w-2xl mx-auto">
              Veja um preview das novas funcionalidades que chegam em janeiro
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Card 1 - Dashboard */}
            <Link
              href="/preview/dashboard"
              className="group relative rounded-2xl border-2 border-white/10 bg-white/5 backdrop-blur-sm p-6 shadow-lg transition-all duration-300 hover:border-indigo-400/50 hover:bg-white/10 hover:shadow-xl"
            >
              <div className="aspect-video rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center mb-4 overflow-hidden">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 text-indigo-300 mx-auto mb-2 opacity-50" />
                  <p className="text-xs text-slate-400">
                    Screenshot do Dashboard
                  </p>
                </div>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">
                Dashboard Inteligente
              </h3>
              <p className="text-sm text-slate-300">
                Visualize métricas e insights em tempo real
              </p>
              <div className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-indigo-300 transition-colors group-hover:text-indigo-200">
                Ver preview
                <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1" />
              </div>
            </Link>

            {/* Card 2 - Loja Gamificada */}
            <Link
              href="/preview/loja"
              className="group relative rounded-2xl border-2 border-white/10 bg-white/5 backdrop-blur-sm p-6 shadow-lg transition-all duration-300 hover:border-purple-400/50 hover:bg-white/10 hover:shadow-xl"
            >
              <div className="aspect-video rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-white/10 flex items-center justify-center mb-4 overflow-hidden">
                <div className="text-center">
                  <Store className="h-12 w-12 text-purple-300 mx-auto mb-2 opacity-50" />
                  <p className="text-xs text-slate-400">Screenshot da Loja</p>
                </div>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">
                Loja Gamificada
              </h3>
              <p className="text-sm text-slate-300">
                Experiência completa de resgate e gamificação
              </p>
              <div className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-purple-300 transition-colors group-hover:text-purple-200">
                Ver preview
                <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1" />
              </div>
            </Link>

            {/* Card 3 - Gestão de Produtos */}
            <Link
              href="/preview/produtos"
              className="group relative rounded-2xl border-2 border-white/10 bg-white/5 backdrop-blur-sm p-6 shadow-lg transition-all duration-300 hover:border-emerald-400/50 hover:bg-white/10 hover:shadow-xl"
            >
              <div className="aspect-video rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-white/10 flex items-center justify-center mb-4 overflow-hidden">
                <div className="text-center">
                  <Package className="h-12 w-12 text-emerald-300 mx-auto mb-2 opacity-50" />
                  <p className="text-xs text-slate-400">
                    Screenshot de Produtos
                  </p>
                </div>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">
                Gestão de Produtos
              </h3>
              <p className="text-sm text-slate-300">
                Catálogo completo com personalização avançada
              </p>
              <div className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-emerald-300 transition-colors group-hover:text-emerald-200">
                Ver preview
                <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1" />
              </div>
            </Link>
          </div>
        </section>

        {/* Seção de Funcionalidades e Diferenciais */}
        <section className="mt-20 space-y-8">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <p className="text-sm uppercase tracking-[0.18em] text-indigo-300 font-bold">
                Funcionalidades e diferenciais
              </p>
              <h2 className="text-2xl font-bold text-white sm:text-3xl">
                Tudo que você precisa para gamificar com sucesso
              </h2>
              <p className="max-w-2xl text-slate-300">
                Plataforma completa com recursos avançados para transformar
                engajamento em resultados tangíveis.
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="group relative rounded-2xl border-2 border-white/10 bg-white/5 backdrop-blur-sm p-5 shadow-md transition-all duration-200 hover:-translate-y-1 hover:border-indigo-400/50 hover:bg-white/10 hover:shadow-lg">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/20 to-indigo-400/20 text-indigo-300 ring-2 ring-indigo-400/30 mb-4">
                <Store className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">
                Loja Corporativa
              </h3>
              <p className="text-sm text-slate-300">
                Plataforma personalizada para sua empresa com catálogo exclusivo
                e gestão completa.
              </p>
            </div>

            <div className="group relative rounded-2xl border-2 border-white/10 bg-white/5 backdrop-blur-sm p-5 shadow-md transition-all duration-200 hover:-translate-y-1 hover:border-emerald-400/50 hover:bg-white/10 hover:shadow-lg">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-400/20 text-emerald-300 ring-2 ring-emerald-400/30 mb-4">
                <Truck className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">
                Envio de Kits
              </h3>
              <p className="text-sm text-slate-300">
                Envio automatizado de kits personalizados para clientes e times
                em todo o Brasil.
              </p>
            </div>

            <div className="group relative rounded-2xl border-2 border-white/10 bg-white/5 backdrop-blur-sm p-5 shadow-md transition-all duration-200 hover:-translate-y-1 hover:border-purple-400/50 hover:bg-white/10 hover:shadow-lg">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-400/20 text-purple-300 ring-2 ring-purple-400/30 mb-4">
                <Palette className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">
                Personalização de Produtos
              </h3>
              <p className="text-sm text-slate-300">
                Customize produtos com logo, cores e mensagens da sua marca de
                forma profissional.
              </p>
            </div>

            <div className="group relative rounded-2xl border-2 border-white/10 bg-white/5 backdrop-blur-sm p-5 shadow-md transition-all duration-200 hover:-translate-y-1 hover:border-blue-400/50 hover:bg-white/10 hover:shadow-lg">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-400/20 text-blue-300 ring-2 ring-blue-400/30 mb-4">
                <MapPin className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">
                Acompanhamento em Tempo Real
              </h3>
              <p className="text-sm text-slate-300">
                Rastreie todos os envios desde a produção até a entrega com
                atualizações em tempo real.
              </p>
            </div>

            <div className="group relative rounded-2xl border-2 border-white/10 bg-white/5 backdrop-blur-sm p-5 shadow-md transition-all duration-200 hover:-translate-y-1 hover:border-amber-400/50 hover:bg-white/10 hover:shadow-lg">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-400/20 text-amber-300 ring-2 ring-amber-400/30 mb-4">
                <FileText className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">
                Relatórios Analíticos
              </h3>
              <p className="text-sm text-slate-300">
                Gerador de relatórios completo com insights sobre engajamento,
                resgates e ROI.
              </p>
            </div>

            <div className="group relative rounded-2xl border-2 border-white/10 bg-white/5 backdrop-blur-sm p-5 shadow-md transition-all duration-200 hover:-translate-y-1 hover:border-pink-400/50 hover:bg-white/10 hover:shadow-lg">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-pink-500/20 to-pink-400/20 text-pink-300 ring-2 ring-pink-400/30 mb-4">
                <Headphones className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">
                Atendimento Humanizado
              </h3>
              <p className="text-sm text-slate-300">
                Suporte dedicado com equipe especializada para garantir a melhor
                experiência.
              </p>
            </div>

            <div className="group relative rounded-2xl border-2 border-white/10 bg-white/5 backdrop-blur-sm p-5 shadow-md transition-all duration-200 hover:-translate-y-1 hover:border-cyan-400/50 hover:bg-white/10 hover:shadow-lg">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500/20 to-cyan-400/20 text-cyan-300 ring-2 ring-cyan-400/30 mb-4">
                <Globe className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">
                Envios Internacionais
              </h3>
              <p className="text-sm text-slate-300">
                Expanda seu programa de gamificação para times e clientes em
                qualquer lugar do mundo.
              </p>
            </div>

            <div className="group relative rounded-2xl border-2 border-white/10 bg-white/5 backdrop-blur-sm p-5 shadow-md transition-all duration-200 hover:-translate-y-1 hover:border-teal-400/50 hover:bg-white/10 hover:shadow-lg">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500/20 to-teal-400/20 text-teal-300 ring-2 ring-teal-400/30 mb-4">
                <Warehouse className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">
                Armazenagem Inteligente
              </h3>
              <p className="text-sm text-slate-300">
                Gestão otimizada de estoque com armazenagem inteligente para
                máxima eficiência.
              </p>
            </div>
          </div>
        </section>

        {/* Seção de Casos de Uso Animados */}
        <section className="mt-20 space-y-8">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <p className="text-sm uppercase tracking-[0.18em] text-indigo-300 font-bold">
                Casos de uso em gamificação
              </p>
              <h2 className="text-2xl font-bold text-white sm:text-3xl">
                Como plataformas gamificam clientes e times com a Yoobe
              </h2>
              <p className="max-w-2xl text-slate-300">
                Descubra como empresas transformam engajamento em recompensas
                tangíveis com produtos físicos, digitais e perecíveis.
              </p>
            </div>
          </div>

          <AnimatedUseCasesDisplay />

          {/* Grid de cards complementares */}
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {useCases.slice(0, 4).map(useCase => {
              const CaseIcon = useCase.icon
              return (
                <div
                  key={useCase.id}
                  className="group relative rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-4 shadow-md transition-all duration-200 hover:-translate-y-1 hover:border-indigo-400/50 hover:bg-white/10 hover:shadow-lg sm:p-5"
                >
                  <div
                    className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${useCase.gradient} opacity-0 transition-opacity duration-200 group-hover:opacity-20`}
                  />
                  <div className="relative">
                    <div
                      className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 ${useCase.iconColor} ring-1 ring-white/20 transition-transform duration-200 group-hover:scale-110`}
                    >
                      <CaseIcon className="h-5 w-5" />
                    </div>
                    <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-slate-400">
                      {useCase.badge}
                    </p>
                    <p className="text-sm font-semibold text-white leading-tight">
                      {useCase.title}
                    </p>
                    <p className="mt-2 text-xs text-slate-300 line-clamp-2">
                      {useCase.description}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* Seção de Clientes */}
        <section className="mt-20 space-y-8">
          <div className="text-center space-y-2">
            <p className="text-sm uppercase tracking-[0.18em] text-indigo-300 font-bold">
              Empresas que confiam na Yoobe
            </p>
            <h2 className="text-2xl font-bold text-white sm:text-3xl">
              Clientes que já usam nossa plataforma
            </h2>
            <p className="text-slate-300 max-w-2xl mx-auto">
              Grandes empresas já utilizam a Yoobe para gamificar clientes e
              times com produtos físicos, digitais e perecíveis.
            </p>
          </div>

          <div className="relative overflow-hidden">
            <div className="flex items-center justify-center gap-8 md:gap-12 lg:gap-16 flex-wrap px-6 py-8 bg-white/5 backdrop-blur-sm rounded-2xl border-2 border-white/10 shadow-lg">
              {/* Lista de clientes com logos */}
              {[
                {
                  name: 'Yampi',
                  logo: '/images/clients/yampi.png',
                  alt: 'Yampi',
                  fallbackColor: 'text-slate-200',
                },
                {
                  name: 'Hapvida',
                  logo: '/images/clients/hapvida.png',
                  alt: 'Hapvida',
                  fallbackColor: 'text-emerald-300',
                },
                {
                  name: 'Prio3',
                  logo: '/images/clients/prio3.png',
                  alt: 'Prio3',
                  fallbackColor: 'text-blue-300',
                },
                {
                  name: 'Boticário',
                  logo: '/images/clients/boticario.png',
                  alt: 'Boticário',
                  fallbackColor: 'text-pink-300',
                },
                {
                  name: 'W1',
                  logo: '/images/clients/w1.png',
                  alt: 'W1',
                  fallbackColor: 'text-indigo-300',
                },
                {
                  name: 'Join',
                  logo: '/images/clients/join.png',
                  alt: 'Join Tecnologia',
                  fallbackColor: 'text-purple-300',
                },
                {
                  name: 'Contabilizei',
                  logo: '/images/clients/contabilizei.png',
                  alt: 'Contabilizei',
                  fallbackColor: 'text-cyan-300',
                },
                {
                  name: 'Workvivo',
                  logo: '/images/clients/workvivo.png',
                  alt: 'Workvivo',
                  fallbackColor: 'text-orange-300',
                },
              ].map((client, index) => (
                <ClientLogo
                  key={index}
                  name={client.name}
                  logo={client.logo}
                  alt={client.alt}
                  fallbackColor={client.fallbackColor}
                />
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer
        id="fale-conosco"
        className="relative z-10 border-t border-white/10 bg-slate-900/80 backdrop-blur-sm"
      >
        <div className="mx-auto max-w-6xl px-6 py-8">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_0_6px_rgba(52,211,153,0.3)]" />
              <div>
                <p className="text-sm font-medium text-slate-200">
                  Acompanhamento ativo — nossa equipe está disponível para
                  contato.
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  <Zap className="mr-1 inline h-3 w-3 text-amber-400" />
                  Grandes novidades chegando em janeiro!
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <a
                href="https://calendly.com/yoobeco/demo?month=2021-08"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 px-4 py-2 text-sm font-bold text-white shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-600 hover:shadow-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400"
              >
                <Calendar className="h-4 w-4" />
                Agendar Demo
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
              </a>
              <a
                href="https://wa.me/554187582060"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border-2 border-emerald-400 bg-gradient-to-r from-emerald-500/20 to-green-500/20 px-4 py-2 text-sm font-bold text-emerald-200 shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:border-emerald-400 hover:from-emerald-500/30 hover:to-green-500/30 hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400"
              >
                <Calendar className="h-4 w-4" />
                WhatsApp: +55 41 8758-2060
              </a>
              <a
                href="https://catalogo.yoobe.co"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border-2 border-indigo-400 bg-indigo-500/20 px-4 py-2 text-sm font-bold text-indigo-200 shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:border-indigo-400 hover:bg-indigo-500/30 hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400"
              >
                <Package className="h-4 w-4" />
                Catálogo
              </a>
              <a
                href="https://dashboard.yoobe.app/dashboard"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border-2 border-blue-400 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 px-4 py-2 text-sm font-bold text-blue-200 shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-400 hover:from-blue-500/30 hover:to-cyan-500/30 hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400"
              >
                <Users className="h-4 w-4" />
                Clientes
              </a>
            </div>
          </div>
          <div className="border-t border-white/10 pt-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <YoobeLogo size={24} showText={false} variant="white" />
                <span>© 2025 Yoobe. Todos os direitos reservados.</span>
              </div>
              <a
                href="mailto:vendas@yoobe.co"
                className="inline-flex items-center gap-2 text-xs font-medium text-slate-300 transition-colors duration-200 hover:text-indigo-300"
              >
                <Mail className="h-3.5 w-3.5" />
                vendas@yoobe.co
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

function isSafeInternalTarget(target: string) {
  // Allow internal routes only (prevents open-redirect from this transition page)
  return target.startsWith('/')
}

export default function HomePage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const targetUrl = useMemo(() => {
    return (
      searchParams.get('to') ||
      searchParams.get('target') ||
      searchParams.get('url') ||
      ''
    ).trim()
  }, [searchParams])

  const message = useMemo(() => {
    return (searchParams.get('message') || 'Redirecionando...').trim()
  }, [searchParams])

  const [isVisible, setIsVisible] = useState(true)
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>(
    'loading'
  )
  const [currentMessage, setCurrentMessage] = useState(message)
  const [hasTarget, setHasTarget] = useState(!!targetUrl)

  useEffect(() => {
    setCurrentMessage(message)
    setHasTarget(!!targetUrl)
  }, [message, targetUrl])

  useEffect(() => {
    if (!targetUrl) {
      // Sem destino, apenas mostra a home sem overlay
      setIsVisible(false)
      return
    }

    if (!isSafeInternalTarget(targetUrl)) {
      setStatus('error')
      setCurrentMessage('Destino inválido (somente rotas internas são permitidas)')
      setProgress(0)
      setIsVisible(true)
      return
    }

    setStatus('loading')
    setProgress(8)
    setIsVisible(true)

    const start = Date.now()
    const interval = window.setInterval(() => {
      const elapsed = Date.now() - start
      const next = Math.min(92, 8 + Math.floor((elapsed / 900) * 84))
      setProgress(next)
    }, 60)

    const timeout = window.setTimeout(() => {
      window.clearInterval(interval)
      setProgress(100)
      setStatus('success')
      setCurrentMessage('Pronto! Indo para o destino...')
      // Slight delay so users can see 100% before navigation
      window.setTimeout(() => window.location.replace(targetUrl), 250)
    }, 950)

    return () => {
      window.clearInterval(interval)
      window.clearTimeout(timeout)
    }
  }, [targetUrl])

  const onCancel = () => {
    setIsVisible(false)
    router.back()
  }

  return (
    <>
      <HomePageContent />
      {hasTarget && (
        <RedirectProgress
          isVisible={isVisible && status !== 'error'}
          progress={progress}
          message={currentMessage}
          status={status}
          targetUrl={targetUrl || undefined}
          onCancel={onCancel}
        />
      )}
    </>
  )
}
