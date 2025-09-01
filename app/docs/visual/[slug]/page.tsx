'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { MarkdownRenderer } from '@/components/ui/markdown-renderer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, FileText } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Document {
  title: string
  content: string
  version: string
  lastUpdated: string
}

const documents: Record<string, Document> = {
  'PLATFORM_OVERVIEW': {
    title: 'Visão Geral da Plataforma',
    version: 'v2.0.0',
    lastUpdated: '17 de Janeiro, 2024',
    content: `# 🚀 Yoobe Platform - Visão Geral Completa

## 📋 Índice
- [Visão Geral](#visão-geral)
- [Arquitetura](#arquitetura)
- [Funcionalidades](#funcionalidades)
- [Integrações](#integrações)
- [APIs](#apis)
- [Banco de Dados](#banco-de-dados)
- [Deploy](#deploy)
- [Troubleshooting](#troubleshooting)

---

## 🎯 Visão Geral

A **Yoobe Platform** é uma solução completa para gestão de brindes corporativos, gamificação e fulfillment. Nossa plataforma permite que empresas criem suas próprias lojas de brindes, integrem sistemas de gamificação e gerenciem todo o processo de fulfillment através da integração com Cubbo.

### 🏗️ Stack Tecnológica

\`\`\`typescript
interface TechStack {
  frontend: 'Next.js 14' | 'React 18' | 'TypeScript'
  backend: 'Next.js API Routes' | 'Supabase'
  database: 'PostgreSQL' | 'Supabase'
  auth: 'Supabase Auth' | 'JWT'
  storage: 'Supabase Storage'
  fulfillment: 'Cubbo API'
  email: 'Nodemailer'
  ui: 'Tailwind CSS' | 'Lucide Icons'
}
\`\`\`

### 📊 Características Principais

| Característica | Descrição | Status |
|----------------|-----------|--------|
| **Multi-tenant** | Cada empresa tem sua própria loja | ✅ Ativo |
| **Gamificação** | Integração com Workvivo, Applause, Human | ✅ Ativo |
| **Fulfillment** | Integração completa com Cubbo | ✅ Ativo |
| **Automação** | Zapier, Floui, Make | ✅ Ativo |
| **ERP/CRM** | SAP, Salesforce, Oracle | 🔄 Em desenvolvimento |

---

## 🏛️ Arquitetura

### Estrutura de Pastas

\`\`\`
yoobe-v3/
├── app/                    # Next.js App Router
│   ├── admin/             # Painel administrativo global
│   ├── gestor/            # Painel do gestor da loja
│   ├── store/             # Loja pública
│   └── api/               # APIs REST
├── components/            # Componentes React
│   ├── ui/               # Componentes base
│   └── layout/           # Layouts
├── lib/                  # Utilitários e configurações
├── docs/                 # Documentação
└── supabase/            # Migrações e configurações
\`\`\`

### Fluxo de Dados

\`\`\`mermaid
sequenceDiagram
    participant U as Usuário
    participant F as Frontend
    participant A as API
    participant S as Supabase
    participant C as Cubbo
    participant E as Email

    U->>F: Acessa plataforma
    F->>A: Autenticação
    A->>S: Valida credenciais
    S-->>A: Token JWT
    A-->>F: Usuário autenticado
    
    U->>F: Cria pedido
    F->>A: POST /api/orders
    A->>S: Salva pedido
    A->>C: Sync com Cubbo
    A->>E: Envia notificação
    A-->>F: Pedido criado
\`\`\`

---

## 🎯 Funcionalidades

### 👨‍💼 Admin Global

**Funcionalidades principais:**
- ✅ Gestão de empresas e lojas
- ✅ Gerenciamento de usuários
- ✅ Produtos base e categorias
- ✅ Integrações globais (Cubbo)
- ✅ Templates de email
- ✅ Relatórios e métricas
- ✅ Configurações do sistema

### 🏪 Gestor da Loja

**Funcionalidades principais:**
- ✅ Configuração da loja
- ✅ Gestão de produtos
- ✅ Gerenciamento de funcionários
- ✅ Processamento de pedidos
- ✅ Integrações (ERP/CRM, Gamificação)
- ✅ Relatórios da loja
- ✅ Dashboard de métricas

### 👤 Funcionário/Cliente

**Funcionalidades principais:**
- ✅ Catálogo de produtos
- ✅ Carrinho de compras
- ✅ Sistema de pontos
- ✅ Histórico de pedidos
- ✅ Perfil e configurações

---

## 🔗 Integrações

### 📦 Cubbo (Fulfillment Global)

\`\`\`typescript
interface CubboIntegration {
  type: 'global'
  features: {
    productSync: boolean
    inventoryManagement: boolean
    orderProcessing: boolean
    shipmentTracking: boolean
  }
  status: 'active' | 'inactive'
  lastSync: Date
}
\`\`\`

**Funcionalidades:**
- ✅ Sincronização de produtos
- ✅ Gestão de estoque
- ✅ Processamento de pedidos
- ✅ Rastreamento de envios
- ✅ Relatórios de fulfillment

### 🎮 Gamificação

**Plataformas suportadas:**
- ✅ **Workvivo**: Reconhecimento e engajamento
- ✅ **Applause**: Feedback e avaliações
- ✅ **Human**: Desenvolvimento de pessoas

\`\`\`typescript
interface GamificationConfig {
  platform: 'workvivo' | 'applause' | 'human'
  pointsSync: boolean
  webhooks: string[]
  features: {
    pointsIntegration: boolean
    leaderboards: boolean
    achievements: boolean
  }
}
\`\`\`

### 🤖 Automação

**Plataformas suportadas:**
- ✅ **Zapier**: Automação de workflows
- ✅ **Floui**: Processos brasileiros
- ✅ **Make**: Automação avançada

### 🏢 ERP/CRM

**Sistemas suportados:**
- 🔄 **SAP**: ERP empresarial
- 🔄 **Salesforce**: CRM e vendas
- 🔄 **Oracle**: ERP/CRM unificado

---

## 📡 APIs

### Autenticação

\`\`\`typescript
// POST /api/auth/login
interface LoginRequest {
  email: string
  password: string
}

interface LoginResponse {
  success: boolean
  user: User
  token: string
  expiresIn: number
}
\`\`\`

### Produtos

\`\`\`typescript
// GET /api/products
interface ProductsResponse {
  success: boolean
  data: Product[]
  pagination: {
    page: number
    limit: number
    total: number
  }
}

// POST /api/products
interface CreateProductRequest {
  name: string
  description: string
  price: number
  category_id: string
  image_url?: string
  stock: number
}
\`\`\`

### Pedidos

\`\`\`typescript
// POST /api/orders
interface CreateOrderRequest {
  items: OrderItem[]
  shipping_address: Address
  payment_method: PaymentMethod
}

interface OrderItem {
  product_id: string
  quantity: number
  price: number
}
\`\`\`

---

## 🗄️ Banco de Dados

### Tabelas Principais

\`\`\`sql
-- Empresas
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  logo_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Usuários
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255),
  role VARCHAR(50) DEFAULT 'user',
  store_id UUID REFERENCES stores(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Lojas
CREATE TABLE stores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id),
  name VARCHAR(255) NOT NULL,
  domain VARCHAR(255) UNIQUE,
  config JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Produtos
CREATE TABLE company_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID REFERENCES stores(id),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2),
  stock INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);
\`\`\`

### RLS (Row Level Security)

\`\`\`sql
-- Políticas de segurança
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "stores_access" ON stores
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND (users.role = 'admin' OR users.store_id = stores.id)
    )
  );
\`\`\`

---

## 🚀 Deploy

### Desenvolvimento Local

\`\`\`bash
# Clonar repositório
git clone https://github.com/yoobe/platform.git
cd platform

# Instalar dependências
npm install

# Configurar Supabase
supabase start
supabase db reset

# Iniciar desenvolvimento
npm run dev
\`\`\`

### Produção

\`\`\`bash
# Build da aplicação
npm run build

# Iniciar em produção
npm start

# Com PM2
pm2 start ecosystem.config.js
\`\`\`

### Docker

\`\`\`dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3001
CMD ["npm", "start"]
\`\`\`

---

## 🔧 Troubleshooting

### Problemas Comuns

#### 1. Erro de autenticação

\`\`\`bash
# Verificar variáveis de ambiente
echo $NEXT_PUBLIC_SUPABASE_URL
echo $NEXT_PUBLIC_SUPABASE_ANON_KEY

# Testar conexão
curl -X GET "$NEXT_PUBLIC_SUPABASE_URL/rest/v1/" \\
  -H "apikey: $NEXT_PUBLIC_SUPABASE_ANON_KEY"
\`\`\`

#### 2. Problemas de RLS

\`\`\`sql
-- Verificar políticas
SELECT * FROM pg_policies WHERE tablename = 'users';

-- Desabilitar temporariamente (apenas desenvolvimento)
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
\`\`\`

#### 3. Integração Cubbo

\`\`\`bash
# Verificar API Cubbo
curl -X GET "https://api.cubbo.com/v1/health" \\
  -H "Authorization: Bearer $CUBBO_API_KEY"

# Logs de sincronização
tail -f /var/log/yoobe/cubbo-sync.log
\`\`\`

---

## 📞 Suporte

### Contatos

- **Email**: suporte@yoobe.com
- **Documentação**: https://docs.yoobe.com
- **Status**: https://status.yoobe.com

### Recursos Adicionais

- [API Reference](./API_REFERENCE.md)
- [Database Schema](./DATABASE_SCHEMA.md)
- [Deployment Guide](./DEPLOYMENT_GUIDE.md)

---

## 🎉 Conclusão

A Yoobe Platform oferece uma solução completa e escalável para gestão de brindes corporativos. Com integrações robustas, arquitetura moderna e foco na experiência do usuário, a plataforma está pronta para atender empresas de todos os tamanhos.

**Versão atual**: v2.0.0  
**Última atualização**: Janeiro 2024  
**Status**: ✅ Produção`
  },
  'CUBBO_INTEGRATION': {
    title: 'Integração Cubbo',
    version: 'v2.0.0',
    lastUpdated: '17 de Janeiro, 2024',
    content: `# 📦 Integração Cubbo - Yoobe Platform

## 📋 Índice
- [Visão Geral](#visão-geral)
- [Configuração](#configuração)
- [Funcionalidades](#funcionalidades)
- [APIs](#apis)
- [Troubleshooting](#troubleshooting)

---

## 🎯 Visão Geral

O Cubbo é nossa solução de fulfillment global que gerencia todo o processo de estoque, pedidos e envios da Yoobe Platform. A integração é configurada apenas pelos administradores globais e serve todas as lojas da plataforma.

### 🚀 Benefícios

- **Fulfillment Centralizado**: Um único ponto de controle
- **Gestão de Estoque**: Sincronização em tempo real
- **Processamento de Pedidos**: Automático e eficiente
- **Rastreamento**: Acompanhamento completo de envios

---

## ⚙️ Configuração

### 1. Configuração Global (Admin)

\`\`\`typescript
interface CubboConfig {
  apiKey: string
  baseUrl: string
  webhookUrl: string
  features: {
    productSync: boolean
    inventorySync: boolean
    orderSync: boolean
    trackingSync: boolean
  }
}
\`\`\`

### 2. Variáveis de Ambiente

\`\`\`bash
# .env.local
CUBBO_API_KEY=your_cubbo_api_key
CUBBO_BASE_URL=https://api.cubbo.com/v1
CUBBO_WEBHOOK_SECRET=your_webhook_secret
\`\`\`

### 3. Configuração via Interface

Acesse: \`http://localhost:3001/admin/integracoes\`

---

## 🎯 Funcionalidades

### 📦 Gestão de Produtos

\`\`\`typescript
// Sincronizar produto com Cubbo
const syncProduct = async (product: Product) => {
  const response = await fetch('/api/admin/cubbo-sync', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      action: 'sync_product',
      product: {
        id: product.id,
        name: product.name,
        sku: product.sku,
        price: product.price,
        weight: product.weight,
        dimensions: product.dimensions
      }
    })
  })
  
  return response.json()
}
\`\`\`

### 📊 Gestão de Estoque

\`\`\`typescript
// Atualizar estoque
const updateInventory = async (productId: string, quantity: number) => {
  const response = await fetch('/api/admin/cubbo-sync', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      action: 'update_inventory',
      product_id: productId,
      quantity: quantity
    })
  })
  
  return response.json()
}
\`\`\`

### 🛒 Processamento de Pedidos

\`\`\`typescript
// Processar pedido
const processOrder = async (order: Order) => {
  const response = await fetch('/api/admin/cubbo-sync', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      action: 'process_order',
      order: {
        id: order.id,
        customer: order.customer,
        items: order.items,
        shipping_address: order.shipping_address
      }
    })
  })
  
  return response.json()
}
\`\`\`

---

## 📡 APIs

### GET /api/admin/cubbo-integration

\`\`\`typescript
// Buscar configuração da integração
const response = await fetch('/api/admin/cubbo-integration')
const data = await response.json()

// Resposta
{
  "success": true,
  "data": {
    "isConfigured": true,
    "lastSync": "2024-01-17T10:30:00Z",
    "syncedProducts": 1250,
    "syncedOrders": 450
  }
}
\`\`\`

### POST /api/admin/cubbo-integration

\`\`\`typescript
// Configurar integração
const response = await fetch('/api/admin/cubbo-integration', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    apiKey: 'your_api_key',
    baseUrl: 'https://api.cubbo.com/v1',
    features: {
      productSync: true,
      inventorySync: true,
      orderSync: true,
      trackingSync: true
    }
  })
})
\`\`\`

### POST /api/admin/cubbo-sync

\`\`\`typescript
// Sincronizar dados
const response = await fetch('/api/admin/cubbo-sync', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    action: 'full_sync'
  })
})

// Resposta
{
  "success": true,
  "data": {
    "syncedProducts": 100,
    "syncedInventory": 100,
    "syncedOrders": 25,
    "errors": 0
  }
}
\`\`\`

---

## 🔧 Troubleshooting

### Problemas Comuns

#### 1. Erro de API Key

\`\`\`bash
# Verificar API Key
curl -X GET "https://api.cubbo.com/v1/auth/validate" \\
  -H "Authorization: Bearer $CUBBO_API_KEY"
\`\`\`

#### 2. Sincronização falhando

\`\`\`bash
# Logs de sincronização
tail -f /var/log/yoobe/cubbo-sync.log

# Forçar sincronização
curl -X POST http://localhost:3001/api/admin/cubbo-sync \\
  -H "Content-Type: application/json" \\
  -d '{"action": "full_sync"}'
\`\`\`

#### 3. Webhooks não funcionando

\`\`\`bash
# Verificar endpoint
curl -X POST http://localhost:3001/api/webhooks/cubbo \\
  -H "Content-Type: application/json" \\
  -d '{"test": true}'
\`\`\`

---

## 📞 Suporte

Para suporte técnico sobre a integração Cubbo:

- **Email**: suporte@yoobe.com
- **Documentação Cubbo**: https://developers.cubbo.com
- **Status**: https://status.yoobe.com

**Versão atual**: v2.0.0  
**Última atualização**: Janeiro 2024  
**Status**: ✅ Ativo`
  },
  'API_REFERENCE': {
    title: 'Referência da API',
    version: 'v2.0.0',
    lastUpdated: '17 de Janeiro, 2024',
    content: `# 📡 API Reference - Yoobe Platform

## 📋 Índice
- [Visão Geral](#visão-geral)
- [Autenticação](#autenticação)
- [Endpoints](#endpoints)
- [Códigos de Status](#códigos-de-status)
- [Rate Limiting](#rate-limiting)

---

## 🎯 Visão Geral

A API da Yoobe Platform é baseada em REST e utiliza JSON para comunicação. Todas as rotas estão sob o prefixo \`/api\`.

### Base URL

\`\`\`
Desenvolvimento: http://localhost:3001/api
Produção: https://api.yoobe.com
\`\`\`

---

## 🔐 Autenticação

### JWT Token

\`\`\`typescript
// Headers necessários
{
  "Authorization": "Bearer <jwt_token>",
  "Content-Type": "application/json"
}
\`\`\`

### Login

\`\`\`typescript
POST /api/auth/login
{
  "email": "admin@yoobe.com",
  "password": "password123"
}

// Resposta
{
  "success": true,
  "user": {
    "id": "uuid",
    "email": "admin@yoobe.com",
    "role": "admin"
  },
  "token": "jwt_token_here"
}
\`\`\`

---

## 📡 Endpoints

### Usuários

#### GET /api/users
Lista todos os usuários

\`\`\`bash
curl -X GET http://localhost:3001/api/users \\
  -H "Authorization: Bearer <token>"
\`\`\`

#### POST /api/users
Cria um novo usuário

\`\`\`typescript
{
  "email": "user@example.com",
  "full_name": "João Silva",
  "role": "user",
  "store_id": "uuid"
}
\`\`\`

### Produtos

#### GET /api/products
Lista produtos da loja

\`\`\`bash
curl -X GET http://localhost:3001/api/products \\
  -H "Authorization: Bearer <token>"
\`\`\`

#### POST /api/products
Cria um novo produto

\`\`\`typescript
{
  "name": "Camiseta Yoobe",
  "description": "Camiseta de algodão",
  "price": 29.90,
  "stock": 100,
  "category_id": "uuid"
}
\`\`\`

### Pedidos

#### GET /api/orders
Lista pedidos

#### POST /api/orders
Cria um novo pedido

### Integrações

#### GET /api/admin/cubbo-integration
Status da integração Cubbo

#### POST /api/admin/cubbo-sync
Sincronizar com Cubbo

---

## 📊 Códigos de Status

| Código | Significado |
|--------|-------------|
| 200 | Sucesso |
| 201 | Criado |
| 400 | Erro de validação |
| 401 | Não autorizado |
| 403 | Proibido |
| 404 | Não encontrado |
| 500 | Erro interno |

---

## ⚡ Rate Limiting

- **Limite**: 100 requests/minuto por IP
- **Headers**: X-RateLimit-Remaining, X-RateLimit-Reset

**Versão**: v2.0.0  
**Status**: ✅ Ativo`
  }
}

export default function VisualDocumentPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string
  const [document, setDocument] = useState<Document | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (slug && documents[slug]) {
      setDocument(documents[slug])
    } else {
      setDocument(null)
    }
    setLoading(false)
  }, [slug])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando documentação...</p>
        </div>
      </div>
    )
  }

  if (!document) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="container mx-auto p-6 space-y-6">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-red-600 flex items-center gap-2">
                <FileText className="h-6 w-6" />
                Documento não encontrado
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">O documento solicitado não foi encontrado.</p>
              <Button onClick={() => router.push('/admin/documentacao')} className="bg-blue-600 hover:bg-blue-700">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar para Documentação
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <MarkdownRenderer
      content={document.content}
      title={document.title}
      lastUpdated={document.lastUpdated}
      version={document.version}
    />
  )
}
