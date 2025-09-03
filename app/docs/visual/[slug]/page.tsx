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
    version: 'v3.1.0',
    lastUpdated: 'Janeiro 2025',
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
  },
  'ERP_CRM_INTEGRATION': {
    title: 'Integração ERP/CRM',
    version: 'v2.0.0',
    lastUpdated: '17 de Janeiro, 2024',
    content: `# 🏢 ERP/CRM Integration - Yoobe Platform

## 📋 Índice
- [Visão Geral](#visão-geral)
- [Sistemas Suportados](#sistemas-suportados)
- [Configuração](#configuração)
- [APIs](#apis)

---

## 🎯 Visão Geral

O sistema de integração ERP/CRM da Yoobe Platform permite que empresas sincronizem dados de funcionários, produtos e pedidos com seus sistemas empresariais existentes.

### 🚀 Benefícios

- **Sincronização Automática**: Dados sempre atualizados
- **Gestão Centralizada**: Controle unificado de informações
- **Compliance**: Conformidade com políticas empresariais
- **Eficiência**: Redução de trabalho manual

---

## 🎪 Sistemas Suportados

### ✅ SAP
**Foco**: ERP empresarial

**Funcionalidades**:
- ✅ Sincronização de funcionários
- ✅ Gestão de produtos
- ✅ Processamento de pedidos
- ✅ Controle de estoque

### ✅ Salesforce
**Foco**: CRM e vendas

**Funcionalidades**:
- ✅ Sincronização de contatos
- ✅ Gestão de oportunidades
- ✅ Qualificação de leads
- ✅ Relatórios de vendas

### ✅ Oracle
**Foco**: ERP completo

**Funcionalidades**:
- ✅ Gestão de RH
- ✅ Controle de inventário
- ✅ Gestão financeira
- ✅ Compliance

---

## ⚙️ Configuração

### 1. Configuração no Admin Global

\`\`\`bash
# Acesse as configurações de integração
http://localhost:3001/admin/integracoes
\`\`\`

### 2. Configuração por Sistema

#### SAP

\`\`\`typescript
// Configuração SAP
const sapConfig = {
  apiKey: process.env.SAP_API_KEY,
  baseUrl: 'https://api.sap.com/v1',
  webhookUrl: 'https://api.yoobe.com/webhooks/sap',
  syncInterval: 300000, // 5 minutos
  features: {
    employeeSync: true,
    productSync: true,
    orderSync: true
  }
}
\`\`\`

#### Salesforce

\`\`\`typescript
// Configuração Salesforce
const salesforceConfig = {
  apiKey: process.env.SALESFORCE_API_KEY,
  baseUrl: 'https://api.salesforce.com/v1',
  webhookUrl: 'https://api.yoobe.com/webhooks/salesforce',
  syncInterval: 600000, // 10 minutos
  features: {
    contactSync: true,
    opportunitySync: true,
    leadSync: true
  }
}
\`\`\`

---

## 📡 APIs

### Sincronização de Funcionários

#### POST /api/erp-crm/sync-employees
\`\`\`typescript
// Sincronizar funcionários com ERP/CRM
POST /api/erp-crm/sync-employees
{
  "system": "sap", // sap, salesforce, oracle
  "action": "sync", // sync, update, create
  "data": {
    "employees": [
      {
        "employee_id": "SAP_EMP_123",
        "name": "João Silva",
        "email": "joao@empresa.com",
        "department": "TI",
        "position": "Desenvolvedor"
      }
    ]
  }
}
\`\`\`

### Sincronização de Produtos

#### POST /api/erp-crm/sync-products
\`\`\`typescript
// Sincronizar produtos com ERP/CRM
POST /api/erp-crm/sync-products
{
  "system": "sap",
  "action": "sync",
  "data": {
    "products": [
      {
        "product_code": "SAP_PROD_456",
        "name": "Camiseta Yoobe",
        "description": "Camiseta de algodão",
        "price": 89.90,
        "stock": 100,
        "category": "Vestuário"
      }
    ]
  }
}
\`\`\`

---

## 💡 Exemplos

### 1. Integração SAP - Sincronização de Funcionários

\`\`\`typescript
// Serviço SAP
class SAPService {
  private config: SAPConfig

  constructor(config: SAPConfig) {
    this.config = config
  }

  async syncEmployees(): Promise<number> {
    try {
      // Buscar funcionários do SAP
      const sapEmployees = await this.fetchSAPEmployees()
      
      // Mapear dados para formato Yoobe
      const mappedEmployees = sapEmployees.map(employee => ({
        user_id: employee.employee_id,
        full_name: employee.name,
        email: employee.email,
        department: employee.department,
        position: employee.position,
        source: 'sap'
      }))
      
      // Sincronizar com Yoobe
      const syncedCount = await this.syncWithYoobe(mappedEmployees)
      
      return syncedCount
    } catch (error) {
      console.error('Erro ao sincronizar funcionários SAP:', error)
      throw error
    }
  }
}
\`\`\`

---

## 🔧 Troubleshooting

### Problemas Comuns

#### 1. Sincronização falhando

\`\`\`bash
# Verificar logs de sincronização
tail -f /var/log/yoobe/erp-crm-sync.log

# Forçar sincronização manual
curl -X POST http://localhost:3001/api/erp-crm/sync-employees \\
  -H "Content-Type: application/json" \\
  -d '{"system": "sap", "action": "sync"}'
\`\`\`

#### 2. Erro de autenticação

\`\`\`bash
# Verificar credenciais
echo $SAP_API_KEY
echo $SALESFORCE_API_KEY

# Testar conexão
curl -X GET https://api.sap.com/v1/health \\
  -H "Authorization: Bearer $SAP_API_KEY"
\`\`\`

---

## 📞 Suporte

Para suporte técnico sobre integrações ERP/CRM:

- **Email**: suporte@yoobe.com
- **Documentação**: https://docs.yoobe.com/erp-crm
- **Status**: https://status.yoobe.com

**Versão atual**: v2.0.0  
**Última atualização**: Janeiro 2024  
**Status**: ✅ Ativo`
  },
  'DEPLOYMENT_GUIDE': {
    title: 'Guia de Deploy',
    version: 'v2.0.0',
    lastUpdated: '17 de Janeiro, 2024',
    content: `# 🚀 Deployment Guide - Yoobe Platform

## 📋 Índice
- [Visão Geral](#visão-geral)
- [Requisitos](#requisitos)
- [Deploy Local](#deploy-local)
- [Deploy Produção](#deploy-produção)
- [Monitoramento](#monitoramento)

---

## 🎯 Visão Geral

Este guia detalha o processo completo de deploy da Yoobe Platform, desde o ambiente de desenvolvimento até produção.

### 🚀 Características

- **Multi-ambiente**: Desenvolvimento, Staging, Produção
- **Containerização**: Docker para consistência
- **CI/CD**: Pipeline automatizado
- **Monitoramento**: Logs e métricas em tempo real

---

## 📋 Requisitos

### Sistema

\`\`\`bash
# Requisitos mínimos
- Node.js 18+
- PostgreSQL 14+
- Redis 6+
- Docker 20+
- Nginx 1.18+
\`\`\`

### Variáveis de Ambiente

\`\`\`bash
# .env.production
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_JWT_SECRET=your-jwt-secret

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Cubbo Integration
CUBBO_API_KEY=your-cubbo-api-key
CUBBO_BASE_URL=https://api.cubbo.com

# Gamification
WORKVIVO_API_KEY=your-workvivo-api-key
APPLAUSE_API_KEY=your-applause-api-key

# Automation
ZAPIER_WEBHOOK_URL=your-zapier-webhook
FLOUI_WEBHOOK_URL=your-floui-webhook
\`\`\`

---

## 🏠 Deploy Local

### 1. Setup Inicial

\`\`\`bash
# Clone do repositório
git clone https://github.com/yoobe/yoobe-platform.git
cd yoobe-platform

# Instalar dependências
npm install

# Configurar Supabase local
npx supabase start

# Configurar variáveis de ambiente
cp .env.example .env.local
# Editar .env.local com suas configurações
\`\`\`

### 2. Banco de Dados

\`\`\`bash
# Aplicar migrações
npx supabase db reset

# Seed inicial
npx supabase db seed

# Verificar status
npx supabase status
\`\`\`

### 3. Desenvolvimento

\`\`\`bash
# Iniciar servidor de desenvolvimento
npm run dev

# Acessar aplicação
http://localhost:3001
\`\`\`

---

## 🌐 Deploy Produção

### 1. PM2 (Recomendado)

\`\`\`bash
# Instalar PM2
npm install -g pm2

# Build da aplicação
npm run build

# Configurar PM2
pm2 start ecosystem.config.js

# Configurar startup automático
pm2 startup
pm2 save
\`\`\`

#### ecosystem.config.js

\`\`\`javascript
module.exports = {
  apps: [{
    name: 'yoobe-platform',
    script: 'npm',
    args: 'start',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3001
    }
  }]
}
\`\`\`

### 2. Nginx

\`\`\`nginx
# /etc/nginx/sites-available/yoobe
server {
    listen 80;
    server_name yoobe.com www.yoobe.com;

    # Redirecionar para HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yoobe.com www.yoobe.com;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/yoobe.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yoobe.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;

    # Security Headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Gzip Compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    # Proxy para Next.js
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # API Routes
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Static Files
    location /_next/static/ {
        alias /var/www/yoobe-platform/.next/static/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
\`\`\`

### 3. SSL com Let's Encrypt

\`\`\`bash
# Instalar Certbot
sudo apt install certbot python3-certbot-nginx

# Obter certificado SSL
sudo certbot --nginx -d yoobe.com -d www.yoobe.com

# Renovação automática
sudo crontab -e
# Adicionar linha:
0 12 * * * /usr/bin/certbot renew --quiet
\`\`\`

---

## 🐳 Docker

### Dockerfile

\`\`\`dockerfile
# Dockerfile
FROM node:18-alpine AS base

# Dependências
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copiar package files
COPY package.json package-lock.json* ./
RUN npm ci --only=production

# Build
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build da aplicação
RUN npm run build

# Produção
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copiar arquivos necessários
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3001

ENV PORT 3001
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
\`\`\`

### docker-compose.yml

\`\`\`yaml
# docker-compose.yml
version: '3.8'

services:
  yoobe-platform:
    build: .
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_SUPABASE_URL=\${NEXT_PUBLIC_SUPABASE_URL}
      - NEXT_PUBLIC_SUPABASE_ANON_KEY=\${NEXT_PUBLIC_SUPABASE_ANON_KEY}
      - SUPABASE_SERVICE_ROLE_KEY=\${SUPABASE_SERVICE_ROLE_KEY}
    depends_on:
      - postgres
      - redis

  postgres:
    image: postgres:14
    environment:
      POSTGRES_DB: yoobe
      POSTGRES_USER: yoobe
      POSTGRES_PASSWORD: \${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  redis:
    image: redis:6-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
\`\`\`

---

## 🔄 CI/CD

### GitHub Actions

\`\`\`yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run tests
      run: npm test
    
    - name: Build application
      run: npm run build
      env:
        NEXT_PUBLIC_SUPABASE_URL: \${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
        NEXT_PUBLIC_SUPABASE_ANON_KEY: \${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY }}
    
    - name: Deploy to server
      uses: appleboy/ssh-action@v0.1.5
      with:
        host: \${{ secrets.HOST }}
        username: \${{ secrets.USERNAME }}
        key: \${{ secrets.SSH_KEY }}
        script: |
          cd /var/www/yoobe-platform
          git pull origin main
          npm install
          npm run build
          pm2 restart yoobe-platform
\`\`\`

### Vercel

\`\`\`json
// vercel.json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/next"
    }
  ],
  "env": {
    "NEXT_PUBLIC_SUPABASE_URL": "@supabase-url",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY": "@supabase-anon-key",
    "SUPABASE_SERVICE_ROLE_KEY": "@supabase-service-role-key"
  }
}
\`\`\`

---

## 📊 Monitoramento

### Logs

\`\`\`bash
# Logs da aplicação
pm2 logs yoobe-platform

# Logs do Nginx
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Logs do sistema
sudo journalctl -u nginx -f
\`\`\`

### Métricas

\`\`\`bash
# Status PM2
pm2 status
pm2 monit

# Uso de recursos
htop
df -h
free -h
\`\`\`

### Health Check

\`\`\`bash
# Endpoint de health check
curl -X GET https://yoobe.com/api/health

# Resposta esperada
{
  "status": "healthy",
  "timestamp": "2024-01-17T10:30:00Z",
  "version": "2.0.0",
  "database": "connected",
  "services": {
    "supabase": "connected",
    "email": "connected",
    "cubbo": "connected"
  }
}
\`\`\`

---

## 🔧 Troubleshooting

### Problemas Comuns

#### 1. Aplicação não inicia

\`\`\`bash
# Verificar logs
pm2 logs yoobe-platform --lines 50

# Verificar variáveis de ambiente
pm2 env yoobe-platform

# Reiniciar aplicação
pm2 restart yoobe-platform
\`\`\`

#### 2. Erro de banco de dados

\`\`\`bash
# Verificar conexão Supabase
npx supabase status

# Verificar migrações
npx supabase db diff

# Aplicar migrações pendentes
npx supabase db push
\`\`\`

#### 3. Erro de SSL

\`\`\`bash
# Verificar certificado
sudo certbot certificates

# Renovar certificado
sudo certbot renew

# Verificar configuração Nginx
sudo nginx -t
sudo systemctl reload nginx
\`\`\`

---

## 📞 Suporte

Para suporte técnico sobre deploy:

- **Email**: suporte@yoobe.com
- **Documentação**: https://docs.yoobe.com/deployment
- **Status**: https://status.yoobe.com

**Versão atual**: v2.0.0  
**Última atualização**: Janeiro 2024  
**Status**: ✅ Ativo`
  },
  'GAMIFICATION_INTEGRATION': {
    title: 'Integração Gamificação',
    version: 'v2.0.0',
    lastUpdated: '17 de Janeiro, 2024',
    content: `# 🎮 Gamificação - Yoobe Platform

## 📋 Índice
- [Visão Geral](#visão-geral)
- [Plataformas Suportadas](#plataformas-suportadas)
- [Configuração](#configuração)
- [APIs](#apis)

---

## 🎯 Visão Geral

O sistema de gamificação da Yoobe Platform permite que empresas integrem pontos de reconhecimento, feedback e engajamento de equipes diretamente com a compra de brindes.

### 🚀 Benefícios

- **Pontos Integrados**: Pontos de gamificação convertidos em brindes
- **Engajamento**: Aumento da participação em programas de reconhecimento
- **Fulfillment**: Processo completo de entrega de brindes
- **Analytics**: Métricas de engajamento e conversão

---

## 🎪 Plataformas Suportadas

### ✅ Workvivo
**Foco**: Reconhecimento e engajamento

\`\`\`typescript
interface WorkvivoConfig {
  apiKey: string
  baseUrl: string
  features: {
    pointsSync: boolean
    leaderboards: boolean
    achievements: boolean
  }
}
\`\`\`

**Funcionalidades**:
- ✅ Sincronização de pontos
- ✅ Leaderboards integrados
- ✅ Conquistas e badges
- ✅ Reconhecimento em tempo real

### ✅ Applause
**Foco**: Feedback e avaliações

\`\`\`typescript
interface ApplauseConfig {
  apiKey: string
  baseUrl: string
  features: {
    feedbackSync: boolean
    ratings: boolean
    rewards: boolean
  }
}
\`\`\`

**Funcionalidades**:
- ✅ Sincronização de feedback
- ✅ Sistema de avaliações
- ✅ Recompensas por feedback
- ✅ Métricas de satisfação

### ✅ Human
**Foco**: Desenvolvimento de pessoas

\`\`\`typescript
interface HumanConfig {
  apiKey: string
  baseUrl: string
  features: {
    developmentSync: boolean
    skills: boolean
    growth: boolean
  }
}
\`\`\`

**Funcionalidades**:
- ✅ Sincronização de desenvolvimento
- ✅ Gestão de habilidades
- ✅ Planos de crescimento
- ✅ Mentoria integrada

---

## ⚙️ Configuração

### 1. Configuração no Gestor

\`\`\`bash
# Acesse as configurações de gamificação
http://localhost:3001/gestor/integracoes
\`\`\`

### 2. Configuração por Plataforma

#### Workvivo

\`\`\`typescript
// Configuração Workvivo
const workvivoConfig = {
  apiKey: process.env.WORKVIVO_API_KEY,
  baseUrl: 'https://api.workvivo.com/v1',
  webhookUrl: 'https://api.yoobe.com/webhooks/workvivo',
  syncInterval: 300000, // 5 minutos
  features: {
    pointsSync: true,
    leaderboards: true,
    achievements: true
  },
  mappings: {
    pointsToCurrency: 1.0, // 1 ponto = R$ 1,00
    minPointsForReward: 100,
    maxPointsPerMonth: 1000
  }
}
\`\`\`

#### Applause

\`\`\`typescript
// Configuração Applause
const applauseConfig = {
  apiKey: process.env.APPLAUSE_API_KEY,
  baseUrl: 'https://api.applause.com/v1',
  webhookUrl: 'https://api.yoobe.com/webhooks/applause',
  syncInterval: 600000, // 10 minutos
  features: {
    feedbackSync: true,
    ratings: true,
    rewards: true
  },
  mappings: {
    feedbackPoints: 10, // 10 pontos por feedback
    ratingPoints: 5, // 5 pontos por avaliação
    qualityBonus: 1.5 // 50% de bônus para feedback de qualidade
  }
}
\`\`\`

---

## 📡 APIs

### Sincronização de Pontos

#### POST /api/gamification/sync-points
\`\`\`typescript
// Sincronizar pontos com plataforma de gamificação
POST /api/gamification/sync-points
{
  "platform": "workvivo", // workvivo, applause, human
  "action": "sync", // sync, convert, reward
  "data": {
    "user_id": "12345",
    "points": 500,
    "source": "recognition"
  }
}

// Resposta
{
  "success": true,
  "data": {
    "syncedPoints": 500,
    "convertedCurrency": 500.00,
    "availableRewards": 5,
    "platform": "workvivo",
    "timestamp": "2024-01-17T10:30:00Z"
  }
}
\`\`\`

### Webhooks

#### POST /api/webhooks/workvivo
\`\`\`typescript
// Webhook Workvivo
POST /api/webhooks/workvivo
{
  "event": "points.earned",
  "data": {
    "user_id": "WORKVIVO_USER_123",
    "points": 100,
    "reason": "recognition",
    "timestamp": "2024-01-17T10:30:00Z"
  }
}
\`\`\`

#### POST /api/webhooks/applause
\`\`\`typescript
// Webhook Applause
POST /api/webhooks/applause
{
  "event": "feedback.submitted",
  "data": {
    "user_id": "APPLAUSE_USER_456",
    "feedback_id": "FEEDBACK_789",
    "rating": 5,
    "points": 10,
    "timestamp": "2024-01-17T10:30:00Z"
  }
}
\`\`\`

---

## 💡 Exemplos

### 1. Integração Workvivo - Sincronização de Pontos

\`\`\`typescript
// Serviço Workvivo
class WorkvivoService {
  private config: WorkvivoConfig

  constructor(config: WorkvivoConfig) {
    this.config = config
  }

  async syncPoints(): Promise<number> {
    try {
      // Buscar pontos do Workvivo
      const workvivoPoints = await this.fetchWorkvivoPoints()
      
      // Converter pontos para moeda Yoobe
      const convertedPoints = workvivoPoints.map(point => ({
        user_id: point.user_id,
        points: point.points,
        currency: point.points * this.config.mappings.pointsToCurrency,
        source: 'workvivo'
      }))
      
      // Sincronizar com Yoobe
      const syncedCount = await this.syncWithYoobe(convertedPoints)
      
      return syncedCount
    } catch (error) {
      console.error('Erro ao sincronizar pontos Workvivo:', error)
      throw error
    }
  }

  async createReward(userId: string, points: number, reward: any) {
    try {
      // Criar recompensa no Workvivo
      const response = await fetch(
        \`\${this.config.baseUrl}/rewards\`,
        {
          method: 'POST',
          headers: {
            'Authorization': \`Bearer \${this.config.apiKey}\`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            user_id: userId,
            points_required: points,
            reward_type: 'yoobe_product',
            reward_data: reward
          })
        }
      )
      
      return response.json()
    } catch (error) {
      console.error('Erro ao criar recompensa:', error)
      throw error
    }
  }
}
\`\`\`

### 2. Integração Applause - Sistema de Feedback

\`\`\`typescript
// Serviço Applause
class ApplauseService {
  private config: ApplauseConfig

  constructor(config: ApplauseConfig) {
    this.config = config
  }

  async syncFeedback(): Promise<number> {
    try {
      // Buscar feedback do Applause
      const applauseFeedback = await this.fetchApplauseFeedback()
      
      // Calcular pontos por feedback
      const feedbackWithPoints = applauseFeedback.map(feedback => ({
        user_id: feedback.user_id,
        feedback_id: feedback.feedback_id,
        rating: feedback.rating,
        points: this.calculatePoints(feedback),
        quality_bonus: feedback.rating >= 4 ? this.config.mappings.qualityBonus : 1.0
      }))
      
      // Sincronizar com Yoobe
      const syncedCount = await this.syncWithYoobe(feedbackWithPoints)
      
      return syncedCount
    } catch (error) {
      console.error('Erro ao sincronizar feedback Applause:', error)
      throw error
    }
  }

  private calculatePoints(feedback: any): number {
    let points = this.config.mappings.feedbackPoints
    
    if (feedback.rating >= 4) {
      points += this.config.mappings.ratingPoints
    }
    
    return points
  }
}
\`\`\`

---

## 🔧 Troubleshooting

### Problemas Comuns

#### 1. Sincronização de pontos falhando

\`\`\`bash
# Verificar logs de sincronização
tail -f /var/log/yoobe/gamification-sync.log

# Forçar sincronização manual
curl -X POST http://localhost:3001/api/gamification/sync-points \\
  -H "Content-Type: application/json" \\
  -d '{"platform": "workvivo", "action": "sync"}'
\`\`\`

#### 2. Erro de autenticação

\`\`\`bash
# Verificar credenciais
echo $WORKVIVO_API_KEY
echo $APPLAUSE_API_KEY

# Testar conexão
curl -X GET https://api.workvivo.com/v1/health \\
  -H "Authorization: Bearer $WORKVIVO_API_KEY"
\`\`\`

---

## 📞 Suporte

Para suporte técnico sobre integrações de gamificação:

- **Email**: suporte@yoobe.com
- **Documentação**: https://docs.yoobe.com/gamification
- **Status**: https://status.yoobe.com

**Versão atual**: v2.0.0  
**Última atualização**: Janeiro 2024  
**Status**: ✅ Ativo`
  },
  'AUTOMATION_INTEGRATION': {
    title: 'Integração Automação',
    version: 'v2.0.0',
    lastUpdated: '17 de Janeiro, 2024',
    content: `# 🤖 Automação - Yoobe Platform

## 📋 Índice
- [Visão Geral](#visão-geral)
- [Plataformas Suportadas](#plataformas-suportadas)
- [Configuração](#configuração)
- [APIs](#apis)

---

## 🎯 Visão Geral

O sistema de automação da Yoobe Platform permite que gestores integrem suas lojas com plataformas populares de automação como Zapier, Floui e Make. Isso possibilita a criação de workflows automatizados para sincronização de dados, notificações e integração com ERPs/CRMs.

### 🚀 Benefícios

- **Workflows Automatizados**: Processos sem intervenção manual
- **Integração Simples**: Conexão rápida com plataformas populares
- **Flexibilidade**: Workflows customizáveis por loja
- **Escalabilidade**: Automação que cresce com o negócio

---

## 🎪 Plataformas Suportadas

### ✅ Zapier
**Foco**: Automação de workflows

\`\`\`typescript
interface ZapierConfig {
  webhookUrl: string
  triggers: string[]
  actions: string[]
  features: {
    dataSync: boolean
    notifications: boolean
    workflows: boolean
  }
}
\`\`\`

**Funcionalidades**:
- ✅ Sincronização de dados
- ✅ Notificações automáticas
- ✅ Workflows personalizados
- ✅ Integração com 5000+ apps

### ✅ Floui
**Foco**: Automação brasileira

\`\`\`typescript
interface FlouiConfig {
  webhookUrl: string
  triggers: string[]
  actions: string[]
  features: {
    brazilianApps: boolean
    localIntegrations: boolean
    compliance: boolean
  }
}
\`\`\`

**Funcionalidades**:
- ✅ Apps brasileiros
- ✅ Integrações locais
- ✅ Compliance LGPD
- ✅ Suporte em português

### ✅ Make
**Foco**: Automação avançada

\`\`\`typescript
interface MakeConfig {
  webhookUrl: string
  triggers: string[]
  actions: string[]
  features: {
    complexWorkflows: boolean
    dataTransformation: boolean
    conditionalLogic: boolean
  }
}
\`\`\`

**Funcionalidades**:
- ✅ Workflows complexos
- ✅ Transformação de dados
- ✅ Lógica condicional
- ✅ Visual programming

---

## ⚙️ Configuração

### 1. Configuração no Gestor

\`\`\`bash
# Acesse as configurações de automação
http://localhost:3001/gestor/integracoes
\`\`\`

### 2. Configuração por Plataforma

#### Zapier

\`\`\`typescript
// Configuração Zapier
const zapierConfig = {
  webhookUrl: 'https://hooks.zapier.com/hooks/catch/123456/abc123/',
  triggers: [
    'order.created',
    'product.updated',
    'user.registered'
  ],
  actions: [
    'send_notification',
    'update_crm',
    'sync_inventory'
  ],
  features: {
    dataSync: true,
    notifications: true,
    workflows: true
  },
  mappings: {
    orderData: {
      'zapier.order_id': 'yoobe.order_id',
      'zapier.customer_email': 'yoobe.customer_email',
      'zapier.total_amount': 'yoobe.total_amount'
    },
    productData: {
      'zapier.product_id': 'yoobe.product_id',
      'zapier.product_name': 'yoobe.product_name',
      'zapier.product_price': 'yoobe.product_price'
    }
  }
}
\`\`\`

#### Floui

\`\`\`typescript
// Configuração Floui
const flouiConfig = {
  webhookUrl: 'https://api.floui.com/webhooks/yoobe/123456',
  triggers: [
    'order.created',
    'product.updated',
    'user.registered'
  ],
  actions: [
    'send_whatsapp',
    'update_erp',
    'sync_stock'
  ],
  features: {
    brazilianApps: true,
    localIntegrations: true,
    compliance: true
  },
  mappings: {
    orderData: {
      'floui.pedido_id': 'yoobe.order_id',
      'floui.cliente_email': 'yoobe.customer_email',
      'floui.valor_total': 'yoobe.total_amount'
    },
    productData: {
      'floui.produto_id': 'yoobe.product_id',
      'floui.produto_nome': 'yoobe.product_name',
      'floui.produto_preco': 'yoobe.product_price'
    }
  }
}
\`\`\`

---

## 📡 APIs

### Webhooks Disponíveis

#### POST /api/webhooks/zapier
\`\`\`typescript
// Webhook Zapier
POST /api/webhooks/zapier
{
  "event": "order.created",
  "data": {
    "order_id": "YOOBE_ORDER_123",
    "customer_email": "cliente@empresa.com",
    "total_amount": 299.90,
    "items": [
      {
        "product_id": "PROD_456",
        "quantity": 2,
        "price": 149.95
      }
    ]
  }
}
\`\`\`

#### POST /api/webhooks/floui
\`\`\`typescript
// Webhook Floui
POST /api/webhooks/floui
{
  "event": "product.updated",
  "data": {
    "product_id": "PROD_789",
    "product_name": "Camiseta Yoobe",
    "product_price": 89.90,
    "stock": 50,
    "store_id": "STORE_123"
  }
}
\`\`\`

### Automação de Workflows

#### POST /api/automation/workflow
\`\`\`typescript
// Criar workflow de automação
POST /api/automation/workflow
{
  "platform": "zapier", // zapier, floui, make
  "name": "Order Notification",
  "trigger": "order.created",
  "actions": [
    {
      "type": "send_notification",
      "target": "whatsapp",
      "template": "order_confirmation"
    },
    {
      "type": "update_crm",
      "system": "salesforce",
      "action": "create_opportunity"
    }
  ],
  "conditions": {
    "order_amount": "> 100",
    "customer_type": "new"
  }
}

// Resposta
{
  "success": true,
  "data": {
    "workflow_id": "WORKFLOW_123",
    "platform": "zapier",
    "status": "active",
    "webhook_url": "https://api.yoobe.com/webhooks/zapier/workflow_123"
  }
}
\`\`\`

---

## 💡 Exemplos

### 1. Workflow Zapier - Notificação de Pedido

\`\`\`typescript
// Configuração do workflow
const orderNotificationWorkflow = {
  name: "Notificação de Pedido",
  trigger: "order.created",
  actions: [
    {
      type: "send_notification",
      platform: "whatsapp",
      template: "order_confirmation",
      data: {
        customer_name: "{{customer.name}}",
        order_id: "{{order.id}}",
        total_amount: "{{order.total}}",
        tracking_url: "{{order.tracking_url}}"
      }
    },
    {
      type: "update_system",
      system: "erp",
      action: "create_order",
      data: {
        external_id: "{{order.id}}",
        customer_data: "{{customer}}",
        items: "{{order.items}}"
      }
    }
  ],
  conditions: {
    order_amount: ">= 50",
    customer_type: "in ['new', 'returning']"
  }
}

// Implementação
class ZapierWorkflowService {
  async createWorkflow(workflow: any) {
    try {
      const response = await fetch('/api/automation/workflow', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          platform: 'zapier',
          ...workflow
        })
      })
      
      return response.json()
    } catch (error) {
      console.error('Erro ao criar workflow:', error)
      throw error
    }
  }
}
\`\`\`

### 2. Workflow Floui - Sincronização de Estoque

\`\`\`typescript
// Configuração do workflow
const inventorySyncWorkflow = {
  name: "Sincronização de Estoque",
  trigger: "product.updated",
  actions: [
    {
      type: "update_system",
      system: "erp",
      action: "update_inventory",
      data: {
        product_id: "{{product.id}}",
        new_stock: "{{product.stock}}",
        last_updated: "{{product.updated_at}}"
      }
    },
    {
      type: "send_notification",
      platform: "email",
      template: "low_stock_alert",
      data: {
        product_name: "{{product.name}}",
        current_stock: "{{product.stock}}",
        threshold: "{{product.low_stock_threshold}}"
      },
      conditions: {
        stock: "< 10"
      }
    }
  ]
}

// Implementação
class FlouiWorkflowService {
  async createWorkflow(workflow: any) {
    try {
      const response = await fetch('/api/automation/workflow', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          platform: 'floui',
          ...workflow
        })
      })
      
      return response.json()
    } catch (error) {
      console.error('Erro ao criar workflow:', error)
      throw error
    }
  }
}
\`\`\`

---

## 🔧 Troubleshooting

### Problemas Comuns

#### 1. Webhook não funcionando

\`\`\`bash
# Verificar endpoint
curl -X POST http://localhost:3001/api/webhooks/zapier \\
  -H "Content-Type: application/json" \\
  -d '{"test": true}'

# Verificar logs
tail -f /var/log/yoobe/automation-webhooks.log
\`\`\`

#### 2. Workflow não executando

\`\`\`bash
# Verificar status do workflow
curl -X GET http://localhost:3001/api/automation/workflow/WORKFLOW_123

# Reativar workflow
curl -X POST http://localhost:3001/api/automation/workflow/WORKFLOW_123/activate
\`\`\`

---

## 📞 Suporte

Para suporte técnico sobre automação:

- **Email**: suporte@yoobe.com
- **Documentação**: https://docs.yoobe.com/automation
- **Status**: https://status.yoobe.com

 **Versão atual**: v2.0.0  
 **Última atualização**: Janeiro 2024  
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
