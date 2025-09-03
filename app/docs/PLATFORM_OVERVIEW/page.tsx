'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { BookOpen, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function PlatformOverviewPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/docs">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <BookOpen className="h-8 w-8 text-blue-600" />
              Visão Geral da Plataforma v3.1.0
            </h1>
            <p className="text-gray-600 mt-2">
              Introdução completa à Yoobe Platform v3.1.0, arquitetura e conceitos fundamentais
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            v3.1.0
          </Badge>
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            Ativa
          </Badge>
        </div>
      </div>

      <Separator />

      {/* Conteúdo Principal */}
      <Card>
        <CardHeader>
          <CardTitle>🎯 Visão Geral da Yoobe Platform v3.1.0</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-700">
            A <strong>Yoobe Platform v3.1.0</strong> é uma solução completa e escalável para gestão corporativa de brindes, 
            recompensas e fulfillment, implementando um sistema de orçamentos/aprovação com liberação e replicação 
            automática de produtos após pagamento.
          </p>
          
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">🏗️ Stack Tecnológica</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
              <div><strong>Frontend:</strong> Next.js 14, React 18, TypeScript</div>
              <div><strong>Backend:</strong> Next.js API Routes, Supabase</div>
              <div><strong>Banco:</strong> PostgreSQL via Supabase</div>
              <div><strong>Auth:</strong> Supabase Auth, JWT</div>
              <div><strong>UI:</strong> Tailwind CSS, shadcn/ui</div>
              <div><strong>Validação:</strong> Zod</div>
            </div>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-semibold text-green-900 mb-2">✨ Principais Funcionalidades v3.1.0</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
              <div>✅ <strong>Sistema RBAC:</strong> 4 níveis de acesso com permissões granulares</div>
              <div>✅ <strong>Multi-tenancy:</strong> Empresas independentes com isolamento total</div>
              <div>✅ <strong>Sistema de Orçamentos:</strong> Fluxo completo com aprovação e pagamento</div>
              <div>✅ <strong>Replicação Automática:</strong> Produtos replicados após pagamento</div>
              <div>✅ <strong>Checkout Avançado:</strong> Múltiplos métodos de pagamento</div>
              <div>✅ <strong>Sistema de Carteira:</strong> Gestão de pontos e transações</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="text-center">
        <Link href="/docs">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para Documentação
          </Button>
        </Link>
      </div>
    </div>
  )
}
