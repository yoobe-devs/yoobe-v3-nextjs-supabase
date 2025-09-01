'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Download, ExternalLink, FileText } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Label } from '@/components/ui/label'

interface Document {
  title: string
  content: string
  type: 'markdown' | 'html'
}

const documents: Record<string, Document> = {
  'PLATFORM_OVERVIEW.md': {
    title: 'Visão Geral da Plataforma - Yoobe Platform',
    type: 'markdown',
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

\`\`\`mermaid
graph TB
    A[Next.js 14] --> B[React 18]
    B --> C[TypeScript]
    A --> D[Supabase]
    D --> E[PostgreSQL]
    D --> F[Auth]
    D --> G[Storage]
    A --> H[Cubbo API]
    H --> I[Fulfillment]
    A --> J[Email Service]
    A --> K[File Upload]
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
    A-->>F: Sessão ativa
    F->>A: Requisições CRUD
    A->>S: Operações no banco
    S-->>A: Dados
    A-->>F: Resposta
    F->>C: Sincronização (se necessário)
    C-->>F: Status
    F->>E: Envio de emails
\`\`\`

---

## ⚡ Funcionalidades

### 👥 Perfis de Usuário

#### **Admin Global**
- Gerenciamento de todas as empresas
- Configuração de integrações globais
- Monitoramento do sistema
- Gestão de usuários globais

#### **Gestor da Loja**
- Gerenciamento da própria loja
- Configuração de produtos
- Gestão de funcionários
- Relatórios de vendas

#### **Funcionário**
- Acesso à loja da empresa
- Compra de produtos
- Visualização de pontos
- Histórico de pedidos

### 🏪 Sistema de Lojas

Cada empresa pode ter uma ou mais lojas com:

- **Domínio personalizado**: \`loja.empresa.yoobe.com\`
- **Design customizável**: Cores, logo, layout
- **Catálogo de produtos**: Produtos específicos da empresa
- **Sistema de pontos**: Integração com gamificação
- **Checkout integrado**: Processamento de pedidos

### 🎮 Gamificação

Integração com plataformas populares:

| Plataforma | Funcionalidade | Status |
|------------|----------------|--------|
| **Workvivo** | Pontos e recompensas | ✅ Ativo |
| **Applause** | Gamificação de feedback | ✅ Ativo |
| **Human** | Engajamento de equipes | ✅ Ativo |

---

## 🔗 Integrações

### 🚚 Cubbo (Fulfillment)

A integração com Cubbo é o coração do sistema de fulfillment:

\`\`\`typescript
// Exemplo de configuração
const cubboConfig = {
  apiKey: process.env.CUBBO_API_KEY,
  baseUrl: 'https://api.cubbo.com/v1',
  isGlobal: true, // Integração global para todas as lojas
  features: {
    products: true,
    inventory: true,
    orders: true,
    tracking: true
  }
}
\`\`\`

#### Funcionalidades Cubbo

- ✅ **Sincronização de Produtos**: Produtos criados na Yoobe são automaticamente sincronizados
- ✅ **Gestão de Estoque**: Controle centralizado do estoque
- ✅ **Processamento de Pedidos**: Pedidos são enviados automaticamente para fulfillment
- ✅ **Rastreamento**: Status de entrega em tempo real
- ✅ **Logs Detalhados**: Registro completo de todas as operações

### 🤖 Automação (Zapier, Floui, Make)

Permite integração com:

- **ERP/CRM**: SAP, Salesforce, Oracle
- **Gestão de Usuários**: AD, Google Workspace, M365
- **Marketing**: HubSpot, Mailchimp
- **Analytics**: Google Analytics, Mixpanel

---

## 🔌 APIs

### Autenticação

Todas as APIs requerem autenticação via JWT:

\`\`\`bash
curl -X GET https://api.yoobe.com/v1/users \\
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
\`\`\`

### Endpoints Principais

#### Usuários
\`\`\`typescript
// Listar usuários
GET /api/users

// Criar usuário
POST /api/users
{
  "email": "user@company.com",
  "full_name": "Nome Completo",
  "role": "user",
  "company_id": "uuid"
}
\`\`\`

#### Empresas
\`\`\`typescript
// Listar empresas
GET /api/companies

// Criar empresa
POST /api/companies
{
  "name": "Empresa Exemplo",
  "email": "contato@empresa.com",
  "phone": "+5511999999999"
}
\`\`\`

#### Lojas
\`\`\`typescript
// Listar lojas
GET /api/stores

// Criar loja
POST /api/stores
{
  "name": "Loja Exemplo",
  "domain": "loja-exemplo",
  "company_id": "uuid"
}
\`\`\`

#### Produtos
\`\`\`typescript
// Listar produtos
GET /api/products

// Criar produto
POST /api/products
{
  "name": "Produto Exemplo",
  "price": 99.90,
  "points_cost": 100,
  "store_id": "uuid"
}
\`\`\`

### Códigos de Status

| Código | Descrição |
|--------|-----------|
| \`200\` | Sucesso |
| \`201\` | Criado com sucesso |
| \`400\` | Requisição inválida |
| \`401\` | Não autorizado |
| \`403\` | Acesso negado |
| \`404\` | Não encontrado |
| \`500\` | Erro interno |

---

## 🗄️ Banco de Dados

### Schema Principal

\`\`\`sql
-- Usuários
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'user',
  company_id UUID REFERENCES companies(id),
  store_id UUID REFERENCES stores(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Empresas
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  address TEXT,
  logo_url TEXT,
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Lojas
CREATE TABLE stores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  domain VARCHAR(255) UNIQUE,
  company_id UUID REFERENCES companies(id),
  description TEXT,
  logo_url TEXT,
  primary_color VARCHAR(7),
  secondary_color VARCHAR(7),
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Produtos
CREATE TABLE company_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  points_cost INTEGER DEFAULT 0,
  stock_quantity INTEGER DEFAULT 0,
  image_url TEXT,
  store_id UUID REFERENCES stores(id),
  category_id UUID REFERENCES product_categories(id),
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
\`\`\`

### Relacionamentos

\`\`\`mermaid
erDiagram
    COMPANIES ||--o{ STORES : has
    COMPANIES ||--o{ USERS : employs
    STORES ||--o{ COMPANY_PRODUCTS : sells
    STORES ||--o{ USERS : manages
    USERS ||--o{ ORDERS : places
    COMPANY_PRODUCTS ||--o{ ORDER_ITEMS : contains
    ORDERS ||--o{ ORDER_ITEMS : includes
    PRODUCT_CATEGORIES ||--o{ COMPANY_PRODUCTS : categorizes
\`\`\`

---

## 🚀 Deploy

### Variáveis de Ambiente

\`\`\`bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Cubbo Integration
CUBBO_API_KEY=your_cubbo_api_key
CUBBO_BASE_URL=https://api.cubbo.com/v1

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# JWT
JWT_SECRET=your_jwt_secret

# Environment
NODE_ENV=production
\`\`\`

### Comandos de Deploy

\`\`\`bash
# Instalar dependências
npm install

# Build da aplicação
npm run build

# Iniciar em produção
npm start

# Ou usando PM2
pm2 start npm --name "yoobe-platform" -- start
\`\`\`

### Docker

\`\`\`dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
\`\`\`

---

## 🔧 Troubleshooting

### Problemas Comuns

#### 1. Erro de Autenticação
\`\`\`bash
# Verificar se as credenciais estão corretas
curl -X POST https://api.yoobe.com/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{"email": "test@example.com", "password": "password"}'
\`\`\`

#### 2. Sincronização Cubbo Falhando
\`\`\`bash
# Verificar logs
tail -f /var/log/yoobe/cubbo-sync.log

# Testar conexão
curl -X GET https://api.cubbo.com/v1/health \\
  -H "Authorization: Bearer YOUR_CUBBO_API_KEY"
\`\`\`

#### 3. Upload de Imagens
\`\`\`bash
# Verificar permissões do bucket
supabase storage list-buckets

# Verificar políticas RLS
supabase db reset
\`\`\`

### Logs do Sistema

\`\`\`bash
# Logs da aplicação
pm2 logs yoobe-platform

# Logs do banco
supabase db logs

# Logs de autenticação
supabase auth logs
\`\`\`

### Monitoramento

\`\`\`bash
# Status do sistema
curl -X GET https://api.yoobe.com/health

# Métricas
curl -X GET https://api.yoobe.com/metrics
\`\`\`

---

## 📞 Suporte

### Contatos

- **Email**: suporte@yoobe.com
- **Documentação**: https://docs.yoobe.com
- **Status**: https://status.yoobe.com
- **GitHub**: https://github.com/yoobe/platform

### Recursos Adicionais

- [API Reference](./API_REFERENCE.md)
- [Database Schema](./DATABASE_SCHEMA.md)
- [Cubbo Integration](./CUBBO_INTEGRATION.md)
- [Changelog](../CHANGELOG.md)

---

## 🎉 Conclusão

A Yoobe Platform oferece uma solução completa e escalável para gestão de brindes corporativos, com integrações robustas e uma arquitetura moderna. Nossa plataforma está pronta para crescer junto com seu negócio.

**Versão atual**: v2.0.0  
**Última atualização**: Janeiro 2024  
**Status**: ✅ Produção`
  },
  'CUBBO_INTEGRATION.md': {
    title: 'Integração Cubbo - Yoobe Platform',
    type: 'markdown',
    content: `# Integração Cubbo - Yoobe Platform

## Visão Geral

A integração com Cubbo é o sistema principal de fulfillment da Yoobe Platform, responsável por gerenciar estoque, pedidos e logística para todas as lojas.

## Configuração

### 1. Credenciais da API

\`\`\`bash
# Variáveis de ambiente necessárias
CUBBO_API_KEY=your_cubbo_api_key_here
CUBBO_BASE_URL=https://api.cubbo.com/v1
\`\`\`

### 2. Configuração no Admin

1. Acesse \`/admin/integracoes\`
2. Configure as credenciais da Cubbo
3. Teste a conexão
4. Ative a sincronização automática

## Funcionalidades

### Gestão de Produtos

- **Sincronização Automática**: Produtos são sincronizados automaticamente com Cubbo
- **Gestão de Estoque**: Controle centralizado do estoque
- **Preços**: Sincronização de preços e disponibilidade

### Gestão de Pedidos

- **Criação Automática**: Pedidos são criados automaticamente na Cubbo
- **Rastreamento**: Status de entrega em tempo real
- **Fulfillment**: Processamento automático de pedidos

### Logs e Monitoramento

- **Logs de Sincronização**: Registro completo de todas as operações
- **Status de Integração**: Monitoramento em tempo real
- **Alertas**: Notificações de problemas

## APIs Disponíveis

### Produtos

\`\`\`typescript
// Criar produto
POST /api/admin/cubbo-sync
{
  "type": "product",
  "action": "create",
  "data": {
    "name": "Produto Exemplo",
    "sku": "PROD001",
    "price": 99.90,
    "stock": 100
  }
}

// Sincronizar produtos
POST /api/admin/cubbo-sync
{
  "type": "products",
  "action": "sync"
}
\`\`\`

### Estoque

\`\`\`typescript
// Atualizar estoque
POST /api/admin/cubbo-sync
{
  "type": "inventory",
  "action": "update",
  "data": {
    "sku": "PROD001",
    "quantity": 50
  }
}
\`\`\`

### Pedidos

\`\`\`typescript
// Sincronizar pedidos
POST /api/admin/cubbo-sync
{
  "type": "orders",
  "action": "sync"
}
\`\`\`

## Troubleshooting

### Problemas Comuns

1. **Erro de Autenticação**
   - Verifique se a API key está correta
   - Confirme se a URL base está correta

2. **Sincronização Falhando**
   - Verifique os logs em \`/admin/integracoes\`
   - Confirme se o produto existe na Cubbo

3. **Estoque Não Atualizado**
   - Aguarde alguns minutos para sincronização
   - Verifique se o SKU está correto

### Logs

Os logs de sincronização estão disponíveis em:
- **Tabela**: \`product_sync_log\`
- **Interface**: \`/admin/integracoes\`

## Suporte

Para suporte técnico:
- **Documentação Cubbo**: https://developers.cubbo.com/
- **Email**: suporte@yoobe.com
- **Status**: https://status.cubbo.com/`
  },
  'GAMIFICATION_INTEGRATION.md': {
    title: 'Gamificação - Yoobe Platform',
    type: 'markdown',
    content: `# 🎮 Gamificação - Yoobe Platform

## 📋 Índice
- [Visão Geral](#visão-geral)
- [Plataformas Suportadas](#plataformas-suportadas)
- [Configuração](#configuração)
- [APIs](#apis)
- [Exemplos](#exemplos)
- [Troubleshooting](#troubleshooting)

---

## 🎯 Visão Geral

O sistema de gamificação da Yoobe Platform permite que empresas integrem pontos de reconhecimento, feedback e engajamento de equipes diretamente com a compra de brindes. Funcionários podem usar seus pontos acumulados para adquirir produtos na loja da empresa.

### 🏆 Benefícios

- **Engajamento**: Aumenta a participação em programas de reconhecimento
- **Retenção**: Melhora a retenção de talentos
- **Produtividade**: Incentiva comportamentos positivos
- **Satisfação**: Funcionários se sentem valorizados

---

## 🎪 Plataformas Suportadas

### ✅ Workvivo
**Foco**: Reconhecimento e recompensas

\`\`\`typescript
interface WorkvivoConfig {
  apiKey: string
  baseUrl: string
  companyId: string
  features: {
    recognition: boolean
    rewards: boolean
    points: boolean
    leaderboards: boolean
  }
}
\`\`\`

**Funcionalidades**:
- ✅ Sincronização de pontos
- ✅ Reconhecimento automático
- ✅ Leaderboards integrados
- ✅ Recompensas personalizadas

### ✅ Applause
**Foco**: Feedback e gamificação

\`\`\`typescript
interface ApplauseConfig {
  apiKey: string
  baseUrl: string
  projectId: string
  features: {
    feedback: boolean
    gamification: boolean
    achievements: boolean
    badges: boolean
  }
}
\`\`\`

**Funcionalidades**:
- ✅ Pontos por feedback
- ✅ Sistema de badges
- ✅ Achievements automáticos
- ✅ Gamificação de processos

### ✅ Human
**Foco**: Bem-estar e engajamento

\`\`\`typescript
interface HumanConfig {
  apiKey: string
  baseUrl: string
  organizationId: string
  features: {
    wellness: boolean
    engagement: boolean
    challenges: boolean
    rewards: boolean
  }
}
\`\`\`

**Funcionalidades**:
- ✅ Pontos por bem-estar
- ✅ Desafios de saúde
- ✅ Engajamento de equipes
- ✅ Recompensas por metas

---

## ⚙️ Configuração

### 1. Configuração no Admin Global

\`\`\`bash
# Acesse as configurações de gamificação
http://localhost:3001/admin/integracoes
\`\`\`

### 2. Configuração por Plataforma

#### Workvivo

\`\`\`typescript
// Configuração Workvivo
const workvivoConfig = {
  apiKey: process.env.WORKVIVO_API_KEY,
  baseUrl: 'https://api.workvivo.com/v1',
  companyId: 'your_company_id',
  webhookUrl: 'https://api.yoobe.com/webhooks/workvivo',
  syncInterval: 300000, // 5 minutos
  features: {
    recognition: true,
    rewards: true,
    points: true,
    leaderboards: true
  }
}
\`\`\`

#### Applause

\`\`\`typescript
// Configuração Applause
const applauseConfig = {
  apiKey: process.env.APPLAUSE_API_KEY,
  baseUrl: 'https://api.applause.com/v1',
  projectId: 'your_project_id',
  webhookUrl: 'https://api.yoobe.com/webhooks/applause',
  syncInterval: 600000, // 10 minutos
  features: {
    feedback: true,
    gamification: true,
    achievements: true,
    badges: true
  }
}
\`\`\`

#### Human

\`\`\`typescript
// Configuração Human
const humanConfig = {
  apiKey: process.env.HUMAN_API_KEY,
  baseUrl: 'https://api.human.com/v1',
  organizationId: 'your_org_id',
  webhookUrl: 'https://api.yoobe.com/webhooks/human',
  syncInterval: 900000, // 15 minutos
  features: {
    wellness: true,
    engagement: true,
    challenges: true,
    rewards: true
  }
}
\`\`\`

### 3. Configuração de Pontos

\`\`\`typescript
// Configuração de conversão de pontos
const pointsConfig = {
  workvivo: {
    recognitionPoint: 10,    // 1 reconhecimento = 10 pontos
    rewardPoint: 50,         // 1 recompensa = 50 pontos
    leaderboardPoint: 5      // 1 posição = 5 pontos
  },
  applause: {
    feedbackPoint: 15,       // 1 feedback = 15 pontos
    achievementPoint: 100,   // 1 achievement = 100 pontos
    badgePoint: 25          // 1 badge = 25 pontos
  },
  human: {
    wellnessPoint: 20,       // 1 atividade = 20 pontos
    challengePoint: 200,     // 1 desafio = 200 pontos
    engagementPoint: 10      // 1 engajamento = 10 pontos
  }
}
\`\`\`

---

## 🔌 APIs

### Sincronização de Pontos

#### GET /api/gamification/points/{userId}
\`\`\`typescript
// Buscar pontos do usuário
GET /api/gamification/points/550e8400-e29b-41d4-a716-446655440040

// Resposta
{
  "success": true,
  "data": {
    "userId": "550e8400-e29b-41d4-a716-446655440040",
    "totalPoints": 1250,
    "breakdown": {
      "workvivo": 450,
      "applause": 300,
      "human": 500
    },
    "lastSync": "2024-01-17T10:30:00Z",
    "nextSync": "2024-01-17T10:35:00Z"
  }
}
\`\`\`

#### POST /api/gamification/sync
\`\`\`typescript
// Forçar sincronização
POST /api/gamification/sync
{
  "platform": "workvivo", // opcional
  "userId": "550e8400-e29b-41d4-a716-446655440040" // opcional
}

// Resposta
{
  "success": true,
  "data": {
    "syncedUsers": 45,
    "newPoints": 1250,
    "platforms": ["workvivo", "applause", "human"],
    "duration": "2.3s"
  }
}
\`\`\`

### Webhooks

#### POST /api/webhooks/workvivo
\`\`\`typescript
// Webhook Workvivo
POST /api/webhooks/workvivo
{
  "event": "recognition.created",
  "data": {
    "userId": "550e8400-e29b-41d4-a716-446655440040",
    "recognitionId": "rec_123",
    "points": 10,
    "message": "Excelente trabalho no projeto!"
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
    "userId": "550e8400-e29b-41d4-a716-446655440040",
    "feedbackId": "fb_456",
    "points": 15,
    "category": "product_improvement"
  }
}
\`\`\`

#### POST /api/webhooks/human
\`\`\`typescript
// Webhook Human
POST /api/webhooks/human
{
  "event": "challenge.completed",
  "data": {
    "userId": "550e8400-e29b-41d4-a716-446655440040",
    "challengeId": "ch_789",
    "points": 200,
    "challengeName": "30 dias de exercícios"
  }
}
\`\`\`

---

## 💡 Exemplos

### 1. Integração Workvivo

\`\`\`typescript
// Serviço Workvivo
class WorkvivoService {
  private config: WorkvivoConfig

  constructor(config: WorkvivoConfig) {
    this.config = config
  }

  async syncUserPoints(userId: string): Promise<number> {
    try {
      // Buscar reconhecimentos
      const recognitions = await this.fetchRecognitions(userId)
      
      // Buscar recompensas
      const rewards = await this.fetchRewards(userId)
      
      // Calcular pontos
      const totalPoints = (recognitions.length * this.config.points.recognition) +
                         (rewards.length * this.config.points.reward)
      
      // Salvar no banco
      await this.saveUserPoints(userId, totalPoints, 'workvivo')
      
      return totalPoints
    } catch (error) {
      console.error('Erro ao sincronizar pontos Workvivo:', error)
      throw error
    }
  }

  private async fetchRecognitions(userId: string) {
    const response = await fetch(
      \`\${this.config.baseUrl}/recognitions?userId=\${userId}\`,
      {
        headers: {
          'Authorization': \`Bearer \${this.config.apiKey}\`,
          'Content-Type': 'application/json'
        }
      }
    )
    
    return response.json()
  }
}
\`\`\`

### 2. Uso na Loja

\`\`\`typescript
// Componente de pontos na loja
function PointsDisplay({ userId }: { userId: string }) {
  const [points, setPoints] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchPoints() {
      try {
        const response = await fetch(\`/api/gamification/points/\${userId}\`)
        const data = await response.json()
        
        if (data.success) {
          setPoints(data.data.totalPoints)
        }
      } catch (error) {
        console.error('Erro ao buscar pontos:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPoints()
  }, [userId])

  if (loading) {
    return <div>Carregando pontos...</div>
  }

  return (
    <div className="points-display">
      <h3>Seus Pontos</h3>
      <div className="points-value">{points.toLocaleString()}</div>
      <div className="points-breakdown">
        <span>Workvivo: 450</span>
        <span>Applause: 300</span>
        <span>Human: 500</span>
      </div>
    </div>
  )
}
\`\`\`

### 3. Checkout com Pontos

\`\`\`typescript
// Processamento de checkout com pontos
async function processCheckoutWithPoints(orderData: OrderData) {
  try {
    // Verificar se tem pontos suficientes
    const userPoints = await fetchUserPoints(orderData.userId)
    const requiredPoints = orderData.items.reduce((total, item) => {
      return total + (item.points_cost * item.quantity)
    }, 0)

    if (userPoints < requiredPoints) {
      throw new Error('Pontos insuficientes')
    }

    // Criar pedido
    const order = await createOrder(orderData)

    // Deduzir pontos
    await deductPoints(orderData.userId, requiredPoints, {
      orderId: order.id,
      platform: 'mixed',
      description: \`Compra na loja - Pedido #\${order.id}\`
    })

    // Enviar para fulfillment
    await sendToFulfillment(order)

    return order
  } catch (error) {
    console.error('Erro no checkout:', error)
    throw error
  }
}
\`\`\`

---

## 🔧 Troubleshooting

### Problemas Comuns

#### 1. Pontos não sincronizando

\`\`\`bash
# Verificar logs de sincronização
tail -f /var/log/yoobe/gamification-sync.log

# Forçar sincronização manual
curl -X POST http://localhost:3001/api/gamification/sync \\
  -H "Content-Type: application/json" \\
  -d '{"platform": "workvivo"}'
\`\`\`

#### 2. Webhook não recebendo dados

\`\`\`bash
# Verificar se o webhook está ativo
curl -X GET http://localhost:3001/api/webhooks/status

# Testar webhook manualmente
curl -X POST http://localhost:3001/api/webhooks/workvivo \\
  -H "Content-Type: application/json" \\
  -d '{"event": "test", "data": {"userId": "test"}}'
\`\`\`

#### 3. Erro de autenticação

\`\`\`bash
# Verificar credenciais
echo $WORKVIVO_API_KEY
echo $APPLAUSE_API_KEY
echo $HUMAN_API_KEY

# Testar conexão
curl -X GET https://api.workvivo.com/v1/health \\
  -H "Authorization: Bearer $WORKVIVO_API_KEY"
\`\`\`

### Logs do Sistema

\`\`\`bash
# Logs de gamificação
pm2 logs yoobe-gamification

# Logs de webhooks
pm2 logs yoobe-webhooks

# Logs de sincronização
pm2 logs yoobe-sync
\`\`\`

### Monitoramento

\`\`\`bash
# Status das integrações
curl -X GET http://localhost:3001/api/gamification/status

# Métricas de pontos
curl -X GET http://localhost:3001/api/gamification/metrics

# Usuários com mais pontos
curl -X GET http://localhost:3001/api/gamification/leaderboard
\`\`\`

---

## 📊 Métricas e Relatórios

### Dashboard de Gamificação

\`\`\`typescript
// Métricas principais
interface GamificationMetrics {
  totalUsers: number
  totalPoints: number
  averagePointsPerUser: number
  topPlatform: string
  syncSuccessRate: number
  lastSyncTime: string
  nextSyncTime: string
}

// Relatórios disponíveis
const reports = {
  pointsByPlatform: 'Pontos por plataforma',
  pointsByUser: 'Pontos por usuário',
  pointsByTime: 'Pontos por período',
  conversionRate: 'Taxa de conversão',
  topUsers: 'Usuários com mais pontos',
  platformUsage: 'Uso das plataformas'
}
\`\`\`

---

## 🚀 Próximas Funcionalidades

### v2.1.0 (Próxima)
- ✅ Webhooks em tempo real
- ✅ Dashboard avançado
- ✅ Relatórios detalhados
- ✅ Notificações push

### v2.2.0 (Futuro)
- 🤖 IA para recomendações
- 📱 Mobile app
- 🎯 Gamificação personalizada
- 🔄 Sincronização bidirecional

---

## 📞 Suporte

### Contatos

- **Email**: suporte@yoobe.com
- **Documentação**: https://docs.yoobe.com/gamification
- **Status**: https://status.yoobe.com

### Recursos Adicionais

- [API Reference](../API_REFERENCE.md)
- [Cubbo Integration](./CUBBO_INTEGRATION.md)
- [Platform Overview](./PLATFORM_OVERVIEW.md)

---

## 🎉 Conclusão

O sistema de gamificação da Yoobe Platform oferece uma solução completa para integração com plataformas populares de reconhecimento e engajamento. Com APIs robustas e webhooks em tempo real, sua empresa pode criar uma experiência única de recompensas para seus funcionários.

**Versão atual**: v2.0.0  
**Última atualização**: Janeiro 2024  
**Status**: ✅ Produção`
  },
  'AUTOMATION_INTEGRATION.md': {
    title: 'Automação - Yoobe Platform',
    type: 'markdown',
    content: `# 🤖 Automação - Yoobe Platform

## 📋 Índice
- [Visão Geral](#visão-geral)
- [Plataformas Suportadas](#plataformas-suportadas)
- [Configuração](#configuração)
- [APIs](#apis)
- [Exemplos](#exemplos)
- [Troubleshooting](#troubleshooting)

---

## 🎯 Visão Geral

O sistema de automação da Yoobe Platform permite que gestores integrem suas lojas com plataformas populares de automação como Zapier, Floui e Make. Isso possibilita a criação de workflows automatizados para sincronização de dados, notificações e integração com ERPs/CRMs.

### 🚀 Benefícios

- **Automação**: Reduz trabalho manual e erros
- **Integração**: Conecta com sistemas existentes
- **Eficiência**: Acelera processos de negócio
- **Escalabilidade**: Cresce com sua empresa

---

## 🎪 Plataformas Suportadas

### ✅ Zapier
**Foco**: Automação de workflows

\`\`\`typescript
interface ZapierConfig {
  apiKey: string
  baseUrl: string
  webhookUrl: string
  features: {
    triggers: boolean
    actions: boolean
    filters: boolean
    scheduling: boolean
  }
}
\`\`\`

**Funcionalidades**:
- ✅ Triggers automáticos
- ✅ Ações personalizadas
- ✅ Filtros condicionais
- ✅ Agendamento de tarefas

### ✅ Floui
**Foco**: Automação empresarial

\`\`\`typescript
interface FlouiConfig {
  apiKey: string
  baseUrl: string
  workspaceId: string
  features: {
    workflows: boolean
    integrations: boolean
    analytics: boolean
    monitoring: boolean
  }
}
\`\`\`

**Funcionalidades**:
- ✅ Workflows visuais
- ✅ Integrações nativas
- ✅ Analytics avançados
- ✅ Monitoramento em tempo real

### ✅ Make (Integromat)
**Foco**: Cenários de automação

\`\`\`typescript
interface MakeConfig {
  apiKey: string
  baseUrl: string
  scenarioId: string
  features: {
    scenarios: boolean
    connections: boolean
    routing: boolean
    errorHandling: boolean
  }
}
\`\`\`

**Funcionalidades**:
- ✅ Cenários complexos
- ✅ Conexões múltiplas
- ✅ Roteamento inteligente
- ✅ Tratamento de erros

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
  apiKey: process.env.ZAPIER_API_KEY,
  baseUrl: 'https://api.zapier.com/v1',
  webhookUrl: 'https://api.yoobe.com/webhooks/zapier',
  triggers: {
    newOrder: true,
    lowStock: true,
    userRegistration: true,
    pointsEarned: true
  },
  actions: {
    createUser: true,
    updateProduct: true,
    sendNotification: true,
    syncInventory: true
  }
}
\`\`\`

#### Floui

\`\`\`typescript
// Configuração Floui
const flouiConfig = {
  apiKey: process.env.FLOUI_API_KEY,
  baseUrl: 'https://api.floui.com/v1',
  workspaceId: 'your_workspace_id',
  workflows: {
    orderProcessing: true,
    inventorySync: true,
    userManagement: true,
    reporting: true
  },
  integrations: {
    erp: true,
    crm: true,
    email: true,
    sms: true
  }
}
\`\`\`

#### Make

\`\`\`typescript
// Configuração Make
const makeConfig = {
  apiKey: process.env.MAKE_API_KEY,
  baseUrl: 'https://api.make.com/v1',
  scenarioId: 'your_scenario_id',
  scenarios: {
    orderFulfillment: true,
    customerSync: true,
    productCatalog: true,
    analytics: true
  },
  connections: {
    webhook: true,
    api: true,
    database: true,
    file: true
  }
}
\`\`\`

### 3. Webhooks Disponíveis

\`\`\`typescript
// Webhooks da Yoobe Platform
const webhooks = {
  // Pedidos
  'order.created': 'Novo pedido criado',
  'order.updated': 'Pedido atualizado',
  'order.cancelled': 'Pedido cancelado',
  'order.completed': 'Pedido finalizado',
  
  // Produtos
  'product.created': 'Novo produto criado',
  'product.updated': 'Produto atualizado',
  'product.deleted': 'Produto deletado',
  'product.low_stock': 'Estoque baixo',
  
  // Usuários
  'user.registered': 'Usuário registrado',
  'user.updated': 'Usuário atualizado',
  'user.deleted': 'Usuário deletado',
  
  // Pontos
  'points.earned': 'Pontos ganhos',
  'points.spent': 'Pontos gastos',
  'points.expired': 'Pontos expirados',
  
  // Integração
  'cubbo.sync': 'Sincronização Cubbo',
  'inventory.updated': 'Estoque atualizado'
}
\`\`\`

---

## 🔌 APIs

### Webhooks

#### POST /api/webhooks/zapier
\`\`\`typescript
// Webhook Zapier
POST /api/webhooks/zapier
{
  "event": "order.created",
  "data": {
    "orderId": "550e8400-e29b-41d4-a716-446655440040",
    "userId": "user_123",
    "totalAmount": 99.90,
    "items": [
      {
        "productId": "prod_456",
        "quantity": 2,
        "price": 49.95
      }
    ],
    "createdAt": "2024-01-17T10:30:00Z"
  }
}
\`\`\`

#### POST /api/webhooks/floui
\`\`\`typescript
// Webhook Floui
POST /api/webhooks/floui
{
  "event": "product.low_stock",
  "data": {
    "productId": "prod_789",
    "productName": "Caneta Personalizada",
    "currentStock": 5,
    "minStock": 10,
    "storeId": "store_123"
  }
}
\`\`\`

#### POST /api/webhooks/make
\`\`\`typescript
// Webhook Make
POST /api/webhooks/make
{
  "event": "points.earned",
  "data": {
    "userId": "user_456",
    "points": 100,
    "source": "workvivo",
    "description": "Reconhecimento por projeto",
    "earnedAt": "2024-01-17T10:30:00Z"
  }
}
\`\`\`

### APIs de Automação

#### GET /api/automation/triggers
\`\`\`typescript
// Listar triggers disponíveis
GET /api/automation/triggers

// Resposta
{
  "success": true,
  "data": {
    "triggers": [
      {
        "id": "order.created",
        "name": "Novo Pedido",
        "description": "Disparado quando um novo pedido é criado",
        "fields": ["orderId", "userId", "totalAmount", "items"],
        "platforms": ["zapier", "floui", "make"]
      },
      {
        "id": "product.low_stock",
        "name": "Estoque Baixo",
        "description": "Disparado quando o estoque fica abaixo do mínimo",
        "fields": ["productId", "productName", "currentStock", "minStock"],
        "platforms": ["zapier", "floui", "make"]
      }
    ]
  }
}
\`\`\`

#### POST /api/automation/actions
\`\`\`typescript
// Executar ação de automação
POST /api/automation/actions
{
  "action": "create_user",
  "data": {
    "email": "user@company.com",
    "full_name": "Nome Completo",
    "role": "user",
    "company_id": "company_123"
  }
}

// Resposta
{
  "success": true,
  "data": {
    "userId": "user_789",
    "status": "created",
    "message": "Usuário criado com sucesso"
  }
}
\`\`\`

---

## 💡 Exemplos

### 1. Workflow Zapier - Novo Pedido

\`\`\`typescript
// Trigger: Novo pedido criado
// Ação: Enviar email de confirmação

const zapierWorkflow = {
  trigger: {
    platform: 'yoobe',
    event: 'order.created',
    webhook: 'https://hooks.zapier.com/hooks/catch/123/abc/'
  },
  actions: [
    {
      platform: 'gmail',
      action: 'send_email',
      config: {
        to: '{{order.user.email}}',
        subject: 'Pedido Confirmado - #{{order.id}}',
        body: \`
          Olá {{order.user.full_name}},
          
          Seu pedido foi confirmado!
          
          Pedido: #{{order.id}}
          Total: R$ {{order.total_amount}}
          Status: {{order.status}}
          
          Acompanhe seu pedido em: {{order.tracking_url}}
        \`
      }
    },
    {
      platform: 'slack',
      action: 'send_message',
      config: {
        channel: '#pedidos',
        message: \`Novo pedido: #{{order.id}} - R$ {{order.total_amount}}\`
      }
    }
  ]
}
\`\`\`

### 2. Workflow Floui - Sincronização de Estoque

\`\`\`typescript
// Trigger: Estoque baixo
// Ação: Sincronizar com ERP

const flouiWorkflow = {
  trigger: {
    platform: 'yoobe',
    event: 'product.low_stock',
    webhook: 'https://api.floui.com/webhooks/yoobe/stock'
  },
  actions: [
    {
      platform: 'sap',
      action: 'update_inventory',
      config: {
        productId: '{{product.sap_id}}',
        quantity: '{{product.current_stock}}',
        warehouse: '{{product.warehouse}}'
      }
    },
    {
      platform: 'email',
      action: 'send_alert',
      config: {
        to: 'compras@company.com',
        subject: 'Alerta de Estoque Baixo',
        body: \`
          Produto: {{product.name}}
          Estoque Atual: {{product.current_stock}}
          Estoque Mínimo: {{product.min_stock}}
          Loja: {{product.store_name}}
        \`
      }
    }
  ]
}
\`\`\`

### 3. Cenário Make - Gestão de Usuários

\`\`\`typescript
// Trigger: Usuário registrado
// Ação: Sincronizar com CRM e enviar welcome

const makeScenario = {
  trigger: {
    platform: 'yoobe',
    event: 'user.registered',
    webhook: 'https://hook.make.com/yoobe-user-registration'
  },
  actions: [
    {
      platform: 'salesforce',
      action: 'create_contact',
      config: {
        firstName: '{{user.first_name}}',
        lastName: '{{user.last_name}}',
        email: '{{user.email}}',
        company: '{{user.company_name}}',
        source: 'Yoobe Platform'
      }
    },
    {
      platform: 'mailchimp',
      action: 'add_to_list',
      config: {
        listId: 'welcome_list',
        email: '{{user.email}}',
        firstName: '{{user.first_name}}',
        lastName: '{{user.last_name}}'
      }
    },
    {
      platform: 'yoobe',
      action: 'send_welcome_email',
      config: {
        userId: '{{user.id}}',
        template: 'welcome_new_user'
      }
    }
  ]
}
\`\`\`

---

## 🔧 Troubleshooting

### Problemas Comuns

#### 1. Webhook não recebendo dados

\`\`\`bash
# Verificar se o webhook está ativo
curl -X GET http://localhost:3001/api/automation/webhooks/status

# Testar webhook manualmente
curl -X POST http://localhost:3001/api/webhooks/zapier \\
  -H "Content-Type: application/json" \\
  -d '{"event": "test", "data": {"test": true}}'
\`\`\`

#### 2. Erro de autenticação

\`\`\`bash
# Verificar credenciais
echo $ZAPIER_API_KEY
echo $FLOUI_API_KEY
echo $MAKE_API_KEY

# Testar conexão
curl -X GET https://api.zapier.com/v1/me \\
  -H "Authorization: Bearer $ZAPIER_API_KEY"
\`\`\`

#### 3. Workflow não executando

\`\`\`bash
# Verificar logs de automação
tail -f /var/log/yoobe/automation.log

# Verificar status dos workflows
curl -X GET http://localhost:3001/api/automation/workflows/status
\`\`\`

### Logs do Sistema

\`\`\`bash
# Logs de automação
pm2 logs yoobe-automation

# Logs de webhooks
pm2 logs yoobe-webhooks

# Logs de workflows
pm2 logs yoobe-workflows
\`\`\`

### Monitoramento

\`\`\`bash
# Status das integrações
curl -X GET http://localhost:3001/api/automation/status

# Métricas de automação
curl -X GET http://localhost:3001/api/automation/metrics

# Workflows ativos
curl -X GET http://localhost:3001/api/automation/workflows
\`\`\`

---

## 📊 Métricas e Relatórios

### Dashboard de Automação

\`\`\`typescript
// Métricas principais
interface AutomationMetrics {
  totalWorkflows: number
  activeWorkflows: number
  totalExecutions: number
  successRate: number
  averageExecutionTime: number
  lastExecution: string
  nextExecution: string
}

// Relatórios disponíveis
const reports = {
  workflowExecutions: 'Execuções por workflow',
  platformUsage: 'Uso por plataforma',
  errorRates: 'Taxa de erros',
  executionTimes: 'Tempos de execução',
  triggerFrequency: 'Frequência de triggers',
  actionSuccess: 'Sucesso das ações'
}
\`\`\`

---

## 🚀 Próximas Funcionalidades

### v2.1.0 (Próxima)
- ✅ Webhooks em tempo real
- ✅ Editor visual de workflows
- ✅ Templates pré-configurados
- ✅ Analytics avançados

### v2.2.0 (Futuro)
- 🤖 IA para otimização
- 📱 Mobile app
- 🔄 Sincronização bidirecional
- 🎯 Automação inteligente

---

## 📞 Suporte

### Contatos

- **Email**: suporte@yoobe.com
- **Documentação**: https://docs.yoobe.com/automation
- **Status**: https://status.yoobe.com

### Recursos Adicionais

- [API Reference](../API_REFERENCE.md)
- [Gamification Integration](./GAMIFICATION_INTEGRATION.md)
- [Platform Overview](./PLATFORM_OVERVIEW.md)

---

## 🎉 Conclusão

O sistema de automação da Yoobe Platform oferece uma solução completa para integração com plataformas populares de automação. Com webhooks robustos e APIs flexíveis, sua empresa pode criar workflows automatizados que aumentam a eficiência e reduzem o trabalho manual.

**Versão atual**: v2.0.0  
**Última atualização**: Janeiro 2024  
**Status**: ✅ Produção`
  },
  'API_REFERENCE.md': {
    title: 'API Reference - Yoobe Platform',
    type: 'markdown',
    content: `# API Reference - Yoobe Platform

## Visão Geral

Esta documentação descreve todas as APIs disponíveis na Yoobe Platform v2.0.0.

## Autenticação

Todas as APIs requerem autenticação via JWT token.

\`\`\`bash
Authorization: Bearer <your-jwt-token>
\`\`\`

## Endpoints

### Usuários

#### GET /api/users
Lista todos os usuários (apenas admin)

\`\`\`bash
curl -X GET http://localhost:3000/api/users \\
  -H "Authorization: Bearer <token>"
\`\`\`

#### POST /api/users
Cria um novo usuário

\`\`\`bash
curl -X POST http://localhost:3000/api/users \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer <token>" \\
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "full_name": "Nome Completo",
    "role": "user",
    "company_id": "uuid"
  }'
\`\`\`

### Empresas

#### GET /api/companies
Lista todas as empresas

\`\`\`bash
curl -X GET http://localhost:3000/api/companies \\
  -H "Authorization: Bearer <token>"
\`\`\`

#### POST /api/companies
Cria uma nova empresa

\`\`\`bash
curl -X POST http://localhost:3000/api/companies \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer <token>" \\
  -d '{
    "name": "Empresa Exemplo",
    "email": "contato@empresa.com",
    "phone": "+5511999999999",
    "address": "Endereço completo"
  }'
\`\`\`

### Lojas

#### GET /api/stores
Lista todas as lojas

\`\`\`bash
curl -X GET http://localhost:3000/api/stores \\
  -H "Authorization: Bearer <token>"
\`\`\`

#### POST /api/stores
Cria uma nova loja

\`\`\`bash
curl -X POST http://localhost:3000/api/stores \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer <token>" \\
  -d '{
    "name": "Loja Exemplo",
    "domain": "loja-exemplo",
    "company_id": "uuid",
    "status": "active"
  }'
\`\`\`

### Produtos

#### GET /api/products
Lista todos os produtos

\`\`\`bash
curl -X GET http://localhost:3000/api/products \\
  -H "Authorization: Bearer <token>"
\`\`\`

#### POST /api/products
Cria um novo produto

\`\`\`bash
curl -X POST http://localhost:3000/api/products \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer <token>" \\
  -d '{
    "name": "Produto Exemplo",
    "description": "Descrição do produto",
    "price": 99.90,
    "points_cost": 100,
    "stock_quantity": 50,
    "store_id": "uuid",
    "category_id": "uuid"
  }'
\`\`\`

### Integração Cubbo

#### GET /api/admin/cubbo-integration
Obtém configuração da integração Cubbo

\`\`\`bash
curl -X GET http://localhost:3000/api/admin/cubbo-integration \\
  -H "Authorization: Bearer <token>"
\`\`\`

#### POST /api/admin/cubbo-integration
Configura integração Cubbo

\`\`\`bash
curl -X POST http://localhost:3000/api/admin/cubbo-integration \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer <token>" \\
  -d '{
    "api_key": "your-cubbo-api-key",
    "base_url": "https://api.cubbo.com/v1",
    "is_active": true
  }'
\`\`\`

#### POST /api/admin/cubbo-sync
Sincroniza dados com Cubbo

\`\`\`bash
curl -X POST http://localhost:3000/api/admin/cubbo-sync \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer <token>" \\
  -d '{
    "type": "products",
    "action": "sync"
  }'
\`\`\`

### Changelog

#### GET /api/changelog
Obtém changelog da plataforma

\`\`\`bash
curl -X GET http://localhost:3000/api/changelog
\`\`\`

#### GET /api/changelog?version=2.0.0
Filtra por versão específica

\`\`\`bash
curl -X GET "http://localhost:3000/api/changelog?version=2.0.0"
\`\`\`

## Códigos de Status

- \`200\` - Sucesso
- \`201\` - Criado com sucesso
- \`400\` - Requisição inválida
- \`401\` - Não autorizado
- \`403\` - Acesso negado
- \`404\` - Não encontrado
- \`500\` - Erro interno do servidor

## Exemplos de Resposta

### Sucesso
\`\`\`json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Exemplo",
    "created_at": "2024-12-31T00:00:00Z"
  }
}
\`\`\`

### Erro
\`\`\`json
{
  "success": false,
  "error": "Mensagem de erro",
  "code": "ERROR_CODE"
}
\`\`\`

## Rate Limiting

- **Limite**: 1000 requisições por hora por IP
- **Headers**: \`X-RateLimit-Limit\`, \`X-RateLimit-Remaining\`, \`X-RateLimit-Reset\`

## Suporte

Para suporte técnico:
- **Email**: suporte@yoobe.com
- **Documentação**: https://docs.yoobe.com
- **Status**: https://status.yoobe.com`
  },
  'DATABASE_SCHEMA.md': {
    title: 'Database Schema - Yoobe Platform',
    type: 'markdown',
    content: `# Database Schema - Yoobe Platform

## Visão Geral

Este documento descreve a estrutura completa do banco de dados da Yoobe Platform v2.0.0.

## Tabelas Principais

### users
Tabela de usuários do sistema

\`\`\`sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'user',
  company_id UUID REFERENCES companies(id),
  store_id UUID REFERENCES stores(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
\`\`\`

**Campos:**
- \`id\`: Identificador único
- \`email\`: Email do usuário (único)
- \`full_name\`: Nome completo
- \`role\`: Papel no sistema (admin, manager, user)
- \`company_id\`: Referência à empresa
- \`store_id\`: Referência à loja
- \`created_at\`: Data de criação
- \`updated_at\`: Data de atualização

### companies
Tabela de empresas

\`\`\`sql
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  address TEXT,
  logo_url TEXT,
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
\`\`\`

### stores
Tabela de lojas

\`\`\`sql
CREATE TABLE stores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  domain VARCHAR(255) UNIQUE,
  company_id UUID REFERENCES companies(id),
  description TEXT,
  logo_url TEXT,
  primary_color VARCHAR(7),
  secondary_color VARCHAR(7),
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
\`\`\`

### company_products
Tabela de produtos das empresas

\`\`\`sql
CREATE TABLE company_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  points_cost INTEGER DEFAULT 0,
  stock_quantity INTEGER DEFAULT 0,
  image_url TEXT,
  store_id UUID REFERENCES stores(id),
  category_id UUID REFERENCES product_categories(id),
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
\`\`\`

### orders
Tabela de pedidos

\`\`\`sql
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  store_id UUID REFERENCES stores(id),
  total_amount DECIMAL(10,2) NOT NULL,
  points_used INTEGER DEFAULT 0,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
\`\`\`

### order_items
Itens dos pedidos

\`\`\`sql
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id),
  product_id UUID REFERENCES company_products(id),
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
\`\`\`

## Tabelas de Categorização

### product_categories
Categorias de produtos

\`\`\`sql
CREATE TABLE product_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  icon VARCHAR(50),
  color VARCHAR(7),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
\`\`\`

### base_products
Produtos base para replicação

\`\`\`sql
CREATE TABLE base_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  base_price DECIMAL(10,2) NOT NULL,
  category_id UUID REFERENCES product_categories(id),
  image_url TEXT,
  is_global BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
\`\`\`

## Tabelas de Integração

### cubbo_integrations
Configurações de integração Cubbo

\`\`\`sql
CREATE TABLE cubbo_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID REFERENCES stores(id),
  is_global BOOLEAN DEFAULT false,
  api_key VARCHAR(255),
  base_url VARCHAR(255),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT check_store_or_global CHECK (
    (store_id IS NOT NULL AND is_global = false) OR 
    (store_id IS NULL AND is_global = true)
  )
);
\`\`\`

### cubbo_orders
Pedidos sincronizados com Cubbo

\`\`\`sql
CREATE TABLE cubbo_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id),
  cubbo_order_id VARCHAR(255),
  sync_status VARCHAR(50) DEFAULT 'pending',
  sync_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
\`\`\`

### product_sync_log
Logs de sincronização de produtos

\`\`\`sql
CREATE TABLE product_sync_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES company_products(id),
  sync_type VARCHAR(50) NOT NULL,
  status VARCHAR(50) NOT NULL,
  details JSONB,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
\`\`\`

### inventory_sync
Sincronização de estoque

\`\`\`sql
CREATE TABLE inventory_sync (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES company_products(id),
  cubbo_sku VARCHAR(255),
  quantity INTEGER NOT NULL,
  sync_status VARCHAR(50) DEFAULT 'pending',
  last_sync_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
\`\`\`

## Tabelas de Sistema

### notifications
Notificações do sistema

\`\`\`sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) DEFAULT 'info',
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
\`\`\`

### points_transactions
Transações de pontos

\`\`\`sql
CREATE TABLE points_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  points INTEGER NOT NULL,
  transaction_type VARCHAR(50) NOT NULL,
  description TEXT,
  reference_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
\`\`\`

### email_templates
Templates de email

\`\`\`sql
CREATE TABLE email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  body TEXT NOT NULL,
  variables JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
\`\`\`

## Relacionamentos

### Principais Relacionamentos

1. **users** → **companies** (M:1)
2. **users** → **stores** (M:1)
3. **stores** → **companies** (M:1)
4. **company_products** → **stores** (M:1)
5. **company_products** → **product_categories** (M:1)
6. **orders** → **users** (M:1)
7. **orders** → **stores** (M:1)
8. **order_items** → **orders** (M:1)
9. **order_items** → **company_products** (M:1)

### Relacionamentos de Integração

1. **cubbo_integrations** → **stores** (M:1)
2. **cubbo_orders** → **orders** (1:1)
3. **product_sync_log** → **company_products** (M:1)
4. **inventory_sync** → **company_products** (M:1)

## Índices

### Índices Principais

\`\`\`sql
-- Usuários
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_company_id ON users(company_id);
CREATE INDEX idx_users_store_id ON users(store_id);
CREATE INDEX idx_users_role ON users(role);

-- Produtos
CREATE INDEX idx_company_products_store_id ON company_products(store_id);
CREATE INDEX idx_company_products_category_id ON company_products(category_id);
CREATE INDEX idx_company_products_status ON company_products(status);

-- Pedidos
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_store_id ON orders(store_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at);

-- Integração
CREATE INDEX idx_cubbo_integrations_store_id ON cubbo_integrations(store_id);
CREATE INDEX idx_cubbo_integrations_is_global ON cubbo_integrations(is_global);
\`\`\`

## Políticas RLS

### Exemplo de Política

\`\`\`sql
-- Política para usuários verem apenas seus próprios dados
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

-- Política para admins verem todos os usuários
CREATE POLICY "Admins can view all users" ON users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
\`\`\`

## Triggers

### Trigger de updated_at

\`\`\`sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar em todas as tabelas
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
\`\`\`

## Backup e Recuperação

### Backup Automático

\`\`\`sql
-- Configurar backup automático
SELECT pg_backup_start('backup_name', true);
\`\`\`

### Restauração

\`\`\`sql
-- Restaurar backup
SELECT pg_backup_stop();
\`\`\`

## Monitoramento

### Queries de Monitoramento

\`\`\`sql
-- Tamanho das tabelas
SELECT 
  schemaname,
  tablename,
  attname,
  n_distinct,
  correlation
FROM pg_stats
WHERE schemaname = 'public'
ORDER BY tablename, attname;

-- Performance de queries
SELECT 
  query,
  calls,
  total_time,
  mean_time
FROM pg_stat_statements
ORDER BY total_time DESC
LIMIT 10;
\`\`\`

## Suporte

Para dúvidas sobre o schema:
- **Email**: suporte@yoobe.com
- **Documentação**: https://docs.yoobe.com/database
- **GitHub**: https://github.com/yoobe/platform`
  }
}

export default function DocumentPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string

  const [document, setDocument] = useState<Document | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (slug && documents[slug]) {
      setDocument(documents[slug])
    }
    setLoading(false)
  }, [slug])

  const handleDownload = () => {
    if (document) {
      const blob = new Blob([document.content], { type: 'text/markdown' })
      const url = URL.createObjectURL(blob)
      const a = window.document.createElement('a')
      a.href = url
      a.download = slug
      window.document.body.appendChild(a)
      a.click()
      window.document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <FileText className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Carregando documento...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!document) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-red-600 mb-2">Documento não encontrado</h3>
          <p className="text-gray-600 mb-4">O documento solicitado não foi encontrado.</p>
          <Button onClick={() => router.push('/admin/documentacao')}>
            Voltar para Documentação
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/admin/documentacao')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{document.title}</h1>
            <p className="text-gray-600 mt-2">
              Documentação da Yoobe Platform
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleDownload}>
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
          <Button variant="outline" onClick={() => window.open(`/docs/${slug}`, '_blank')}>
            <ExternalLink className="h-4 w-4 mr-2" />
            Abrir em Nova Aba
          </Button>
        </div>
      </div>

      {/* Conteúdo */}
      <Card>
        <CardContent className="p-6">
          <div className="prose prose-lg max-w-none">
            <pre className="whitespace-pre-wrap font-mono text-sm bg-gray-50 p-4 rounded-lg overflow-x-auto">
              {document.content}
            </pre>
          </div>
        </CardContent>
      </Card>

      {/* Informações */}
      <Card>
        <CardHeader>
          <CardTitle>Informações do Documento</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-gray-500">Título</Label>
              <p className="text-lg">{document.title}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500">Tipo</Label>
              <p className="text-lg">{document.type}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500">Arquivo</Label>
              <p className="text-lg">{slug}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500">Tamanho</Label>
              <p className="text-lg">{document.content.length} caracteres</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
