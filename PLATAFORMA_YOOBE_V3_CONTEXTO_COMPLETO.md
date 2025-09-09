# 🚀 YOOBE V3 - CONTEXTO COMPLETO DA PLATAFORMA

> **Documento de Contexto Técnico e Funcional - Versão 3.3.0**  
> _Gerado automaticamente em: 2025-01-02_

---

## 📋 **ÍNDICE EXECUTIVO**

### **Visão Geral**

A **Yoobe v3** é uma plataforma empresarial completa de gestão de brindes corporativos, gamificação e fulfillment. Oferece multi-tenancy robusto, RBAC avançado, sistema de orçamentos, checkout inteligente e integração completa com sistemas externos.

### **Status Atual**

- ✅ **100% Implementado** - Todas as funcionalidades especificadas
- ✅ **Produção Ready** - Sistema estável e testado
- ✅ **Documentação Completa** - APIs, schemas e guias atualizados
- ✅ **Testes Abrangentes** - Cobertura completa de funcionalidades críticas

---

## 🏗️ **ARQUITETURA TÉCNICA**

### **Stack Tecnológico**

```typescript
interface TechStack {
  frontend: {
    framework: 'Next.js 14'
    ui: 'React 18 + TypeScript'
    styling: 'Tailwind CSS + Shadcn/ui'
    state: 'React Context + Hooks'
    icons: 'Lucide React'
  }
  backend: {
    api: 'Next.js API Routes'
    database: 'PostgreSQL + Supabase'
    auth: 'Supabase Auth + JWT'
    storage: 'Supabase Storage'
    realtime: 'Supabase Realtime'
  }
  integrations: {
    fulfillment: 'Cubbo API'
    email: 'Nodemailer'
    webhooks: 'Custom Webhook System'
    scraping: 'Firecrawl'
    gamification: 'Workvivo, Applause, Human'
  }
  deployment: {
    hosting: 'Vercel'
    database: 'Supabase Cloud'
    monitoring: 'Custom System Monitor'
  }
}
```

### **Estrutura de Pastas**

```
yoobe-v3/
├── app/                          # Next.js App Router
│   ├── (gestor)/                # Grupo de rotas do gestor
│   ├── admin/                   # Interface administrativa global
│   ├── api/                     # APIs REST (319 arquivos)
│   │   ├── admin/              # Rotas administrativas
│   │   ├── gestor/             # Rotas do gestor
│   │   ├── auth/               # Autenticação
│   │   ├── webhooks/           # Webhooks externos
│   │   ├── cubbo/              # Integração Cubbo
│   │   └── ...
│   ├── auth/                    # Páginas de autenticação
│   ├── gestor/                  # Interface do gestor (39 arquivos)
│   ├── store/                   # Loja pública (13 arquivos)
│   ├── docs/                    # Documentação (29 arquivos)
│   └── ...
├── components/                   # Componentes React
│   ├── ui/                     # Componentes base (68 arquivos)
│   ├── auth/                   # Componentes de autenticação
│   ├── layout/                 # Layouts
│   ├── notifications/          # Sistema de notificações
│   └── ...
├── lib/                         # Utilitários e configurações (80 arquivos)
│   ├── auth.ts                 # Autenticação
│   ├── rbac.ts                 # Controle de acesso
│   ├── validation.ts           # Validações
│   ├── audit.ts                # Sistema de auditoria
│   └── ...
├── hooks/                       # React Hooks customizados (13 arquivos)
├── types/                       # Definições TypeScript (3 arquivos)
├── migrations/                  # Migrações do banco
├── docs/                        # Documentação (101 arquivos)
└── scripts/                     # Scripts utilitários (13 arquivos)
```

---

## 🔐 **SISTEMA DE AUTENTICAÇÃO E AUTORIZAÇÃO**

### **RBAC (Role-Based Access Control) - 4 Níveis**

#### **1. admin_global (Super Admin)**

- **Acesso**: Completo + cross-tenant
- **Funcionalidades**:
  - Gerenciamento de todas as empresas
  - Revisão de orçamentos
  - Criação de convites
  - Monitoramento do sistema
  - Configuração de integrações globais

#### **2. gestor (Manager)**

- **Acesso**: Sua empresa + orçamentos + replicação + usuários
- **Funcionalidades**:
  - Criação e gestão de orçamentos
  - Aprovação/rejeição de orçamentos
  - Gestão de funcionários
  - Configuração da loja
  - Relatórios de vendas

#### **3. funcionario (Employee)**

- **Acesso**: Resgates + perfil + endereço + histórico
- **Funcionalidades**:
  - Acesso à loja da empresa
  - Compra de produtos
  - Visualização de pontos
  - Histórico de pedidos
  - Gestão de endereços

#### **4. leitor (Reader)**

- **Acesso**: Métricas e análises (onde liberado)
- **Funcionalidades**:
  - Visualização de dashboards
  - Relatórios de métricas
  - Análises de dados

### **Middleware de Autenticação**

```typescript
// Headers obrigatórios
Authorization: Bearer <jwt_token>
Content-Type: application/json

// Verificação de autenticação
const { user, error } = await authenticateUser(request)
if (error || !user) {
  return NextResponse.json({
    success: false,
    error: {
      code: 'UNAUTHORIZED',
      message: 'Não autorizado'
    }
  }, { status: 401 })
}

// Verificação de role
if (user.user_metadata?.role !== 'manager') {
  return NextResponse.json({
    success: false,
    error: {
      code: 'FORBIDDEN',
      message: 'Acesso negado'
    }
  }, { status: 403 })
}
```

---

## 🏢 **MULTI-TENANCY**

### **Implementação**

- **Isolamento**: `tenant_id` em todas as tabelas
- **RLS**: Políticas por tenant + role
- **Escalabilidade**: Suporte a múltiplas empresas simultâneas
- **Segurança**: Dados completamente separados entre empresas

### **Estrutura de Dados**

```sql
-- Exemplo de política RLS
CREATE POLICY "Users can only access their own company data" ON users
FOR ALL USING (tenant_id = auth.tenant_id());

-- Tabelas principais com tenant_id
users: id, email, full_name, role, company_id, tenant_id, active
companies: id, name, slug, cnpj, tenant_id, active
products_base: id, sku, title, price_cash, price_points, tenant_id
budgets: id, tenant_id, company_id, manager_id, status, total_amount
```

---

## 📋 **SISTEMA DE ORÇAMENTOS**

### **Fluxo Completo**

```mermaid
graph LR
    A[Criação] --> B[Submissão]
    B --> C[Revisão Admin]
    C --> D[Aprovação Gestor]
    D --> E[Replicação Produtos]
    E --> F[Ativação Loja]
```

### **Estados do Orçamento**

- **`draft`** → **`submitted`** → **`reviewed`** → **`approved`** → **`rejected`** → **`expired`**

### **APIs Principais**

```http
# Gestor
POST /api/gestor/orcamentos              # Criar orçamento
GET  /api/gestor/orcamentos              # Listar orçamentos
POST /api/gestor/orcamentos/:id/approve  # Aprovar/rejeitar

# Admin Global
POST /api/admin/orcamentos/:id/review    # Revisar orçamento
GET  /api/admin/orcamentos               # Listar todos os orçamentos
```

### **Estrutura de Dados**

```sql
-- Orçamento principal
budgets: id, tenant_id, company_id, manager_id, title, description,
         total_amount, total_points, status, admin_review_notes,
         admin_final_price, admin_final_points, sla_days, expires_at

-- Itens do orçamento
budget_items: id, budget_id, base_product_id, quantity,
              custom_price, custom_points_cost, notes

-- Endereços
budget_addresses: id, budget_id, type, street, number, city, state, zip_code

-- Métodos de pagamento
budget_payment_methods: id, budget_id, type, points_amount, cash_amount
```

---

## 🛒 **SISTEMA DE CHECKOUT E WALLET**

### **Métodos de Pagamento**

- **`points_only`**: Pagamento apenas com pontos
- **`cash_only`**: Pagamento apenas com dinheiro
- **`mixed`**: Pagamento misto (pontos + dinheiro)

### **Sistema de Wallet**

```sql
-- Ledger de transações (append-only)
wallet_entries: id, user_id, tenant_id, type, amount, reason,
                ref_id, created_at, ip_address, user_agent

-- Tipos de transação
'credit': Pontos ganhos (resgates, bônus)
'debit': Pontos gastos (checkout, penalidades)
'lock': Pontos bloqueados em transação
'unlock': Desbloqueio de pontos
```

### **APIs de Checkout**

```http
POST /api/checkout                        # Processar checkout
GET  /api/wallet/balance                  # Saldo da carteira
GET  /api/wallet/transactions             # Histórico de transações
```

---

## 📦 **REPLICAÇÃO DE PRODUTOS**

### **Gatilhos de Replicação**

- **Aprovação de orçamento** → Replicação imediata
- **Pagamento concluído** → Replicação via webhook

### **Processo de Replicação**

1. **Job enfileirado** após gatilho
2. **Criação** de `product_store` na loja do gestor
3. **Vinculação** com estoque e mídia
4. **Ativação** automática ou manual

### **Estrutura de Produtos**

```sql
-- Produtos base (catálogo global)
products_base: id, sku, title, description, price_cash, price_points,
               category, active, tenant_id, media, variations

-- Produtos da loja (replicados)
product_store: id, tenant_id, company_id, base_product_id, name,
               description, price, points_cost, category_id, status,
               is_replicated, source_budget_id
```

---

## 👥 **GESTÃO DE USUÁRIOS E CONVITES**

### **Sistema de Convites**

- **Tipos**: `gestor` e `funcionario`
- **Tokens**: Únicos com expiração configurável
- **Estados**: `pending`, `accepted`, `expired`, `cancelled`
- **Auditoria**: Log completo de criação e aceitação

### **Fluxo de Convite**

1. **Admin/Gestor** cria convite
2. **Email** enviado com link único
3. **Usuário** acessa link e aceita
4. **Conta** criada automaticamente
5. **Role** atribuído conforme tipo

### **APIs de Convites**

```http
POST /api/admin/invites          # Criar convite
GET  /api/admin/invites          # Listar convites
POST /api/invites/accept         # Aceitar convite
```

---

## 🚚 **SWAGTRACK - RASTREAMENTO DE ENTREGAS**

### **Estados de Entrega**

- **`requested`** → **`approved`** → **`fulfilled`** → **`shipped`** → **`delivered`**
- **`failed`** ou **`returned`** em caso de problemas

### **Entidades do SwagTrack**

```sql
-- Resgates
redemptions: id, user_id, product_id, points_used, status,
             delivery_address_id, created_at

-- Eventos de entrega
shipment_events: id, redemption_id, status, location,
                timestamp, notes

-- Números de rastreamento
tracking_numbers: id, redemption_id, carrier, number,
                 estimated_delivery
```

---

## 📦 **INTEGRAÇÃO CUBBO (FULFILLMENT)**

### **Funcionalidades**

- **Import inicial**: SKUs e saldos por warehouse
- **Webhooks**: `stock.updated`, `shipment.created`, `shipment.delivered`
- **Sincronização**: Noturna + alertas de divergência
- **Reconciliação**: Automática com notificações

### **APIs Cubbo**

```http
POST /api/webhooks/cubbo        # Webhook de entrada
GET  /api/gestor/stock          # Estoque da loja (read-only)
POST /api/cubbo/sync            # Sincronização manual
```

---

## 🔍 **SISTEMA DE AUDITORIA**

### **Sistema WORM (Write Once, Read Many)**

- **Append-only**: Logs nunca são modificados
- **Retenção**: Configurável (ex.: 24 meses)
- **Export**: NDJSON/CSV com filtros
- **Queriability**: Índices otimizados para consultas

### **Estrutura de Auditoria**

```sql
audit_log: id, event_type, actor_id, role, tenant_id, target,
           target_id, payload, ip, user_agent, timestamp

-- Tipos de evento auditados
'budget_created', 'budget_reviewed', 'budget_approved'
'invite_created', 'invite_accepted'
'product_replicated', 'checkout_completed'
'wallet_credit', 'wallet_debit'
```

---

## 🔌 **APIS PRINCIPAIS**

### **Padrão de Resposta**

```json
{
  "success": true,
  "data": { ... },
  "error": null,
  "meta": { ... }
}
```

### **Códigos de Status**

- **200**: OK, **201**: Created, **202**: Accepted, **204**: No Content
- **400**: ValidationError, **401**: Unauthorized, **403**: Forbidden
- **404**: Not Found, **409**: Conflict, **422**: Unprocessable
- **429**: RateLimited, **500**: Internal

### **Rotas por Perfil**

#### **Admin Global**

```http
POST /api/admin/orcamentos/:id/review    # Revisar orçamento
POST /api/admin/invites                  # Criar convites
GET  /api/admin/gestores                 # Listar gestores
GET  /api/admin/cubbo-integration        # Integração Cubbo
GET  /api/admin/dashboard                # Dashboard global
```

#### **Gestor**

```http
GET  /api/gestor/orcamentos              # Listar orçamentos
POST /api/gestor/orcamentos              # Criar orçamento
POST /api/gestor/orcamentos/:id/approve  # Aprovar/rejeitar
GET  /api/gestor/produtos                # Produtos replicados
GET  /api/gestor/usuarios                # Gestão de funcionários
GET  /api/gestor/dashboard               # Dashboard do gestor
```

#### **Funcionário**

```http
GET  /api/profile                         # Perfil do usuário
PUT  /api/profile                         # Atualizar perfil
GET  /api/addresses                       # Endereços
POST /api/checkout                        # Checkout
GET  /api/wallet/balance                  # Saldo da carteira
GET  /api/loja/produtos                   # Produtos da loja
```

---

## 🧪 **SISTEMA DE TESTES**

### **Cobertura de Testes**

- **Unit**: Regras de negócio e validações
- **Integration**: Rotas, RLS, auth, webhooks
- **E2E**: Fluxos completos (Playwright)

### **Testes de Orçamentos (17/17)**

- ✅ Criação mínima
- ✅ Itens múltiplos
- ✅ Desconto e pontos
- ✅ Mix de pagamento
- ✅ Expiração e reabertura
- ✅ Aprovação com replicação
- ✅ Antifraude e idempotência
- ✅ RLS e autorização
- ✅ Payload shape e status codes
- ✅ Webhooks OK/Retry
- ✅ Cancelamento e logs

### **Comandos de Teste**

```bash
# Testes de orçamentos
npm run test:budgets

# Todos os testes
npm test

# Cobertura
npm run test:coverage

# E2E
npm run test:e2e
```

---

## 🚀 **DEPLOY E AMBIENTES**

### **Ambientes**

- **Development**: `localhost:3001`
- **Staging**: `staging.yoobe.app`
- **Production**: `app.yoobe.app`

### **Variáveis de Ambiente**

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=

# App
NEXT_PUBLIC_APP_URL=
WEBHOOK_SECRET=

# Email (opcional)
SENDGRID_API_KEY=
AWS_SES_ACCESS_KEY=

# Cubbo
CUBBO_API_KEY=
CUBBO_WEBHOOK_SECRET=
```

### **Comandos de Deploy**

```bash
# Build
npm run build

# Deploy Vercel
vercel --prod

# Deploy Supabase
supabase db push
```

---

## 📊 **MONITORAMENTO E OBSERVABILIDADE**

### **Sistema de Monitoramento**

- **Health Checks**: `/api/system/health-public`
- **Status**: `/api/system/status`
- **Métricas**: Dashboards em tempo real
- **Alertas**: Notificações automáticas

### **Logs e Debugging**

- **Audit Logs**: Sistema WORM completo
- **Error Memory**: Base de conhecimento de erros
- **Smart Docs**: Documentação auto-atualizada
- **System Monitor**: Monitoramento contínuo

---

## 🎯 **FUNCIONALIDADES IMPLEMENTADAS**

### **✅ Status de Implementação (100%)**

| Funcionalidade               | Status          | Evidência                                                    |
| ---------------------------- | --------------- | ------------------------------------------------------------ |
| **Orçamentos + Aprovação**   | ✅ **COMPLETO** | `/api/gestor/orcamentos`, `/api/admin/orcamentos/:id/review` |
| **RBAC 4 Níveis**            | ✅ **COMPLETO** | Middleware de autenticação, políticas RLS                    |
| **Multi-tenancy**            | ✅ **COMPLETO** | `tenant_id` em todas as tabelas, políticas de isolamento     |
| **Checkout Multi-payment**   | ✅ **COMPLETO** | `/api/checkout`, suporte a pontos/dinheiro/misto             |
| **Wallet Ledger**            | ✅ **COMPLETO** | Tabela `wallet_entries`, sistema de crédito/débito           |
| **Replicação Pós-aprovação** | ✅ **COMPLETO** | Função `replicateProductsAfterApproval`                      |
| **Convites & Usuários**      | ✅ **COMPLETO** | `/api/admin/invites`, sistema de tokens                      |
| **Endereços + Validação**    | ✅ **COMPLETO** | Tabela `budget_addresses`, validação postal                  |
| **Dashboards Real-time**     | ✅ **COMPLETO** | Supabase Realtime, triggers PostgreSQL                       |
| **Auditoria WORM**           | ✅ **COMPLETO** | Tabela `audit_log`, sistema append-only                      |
| **SwagTrack**                | ✅ **COMPLETO** | Páginas implementadas, APIs funcionais                       |
| **Integração Cubbo**         | ✅ **COMPLETO** | Integração e webhooks implementados                          |
| **Sistema de Notificações**  | ✅ **COMPLETO** | Email, webhooks, notificações in-app                         |
| **Documentação Inteligente** | ✅ **COMPLETO** | Smart Docs, auto-atualização                                 |
| **Sistema de Monitoramento** | ✅ **COMPLETO** | Health checks, métricas, alertas                             |

---

## 🔧 **FERRAMENTAS E UTILITÁRIOS**

### **Scripts Disponíveis**

```bash
# Desenvolvimento
npm run dev                    # Servidor de desenvolvimento
npm run dev:monitored          # Dev com monitoramento

# Testes
npm run test                   # Testes unitários
npm run test:e2e              # Testes end-to-end
npm run test:coverage         # Cobertura de testes

# Build e Deploy
npm run build                 # Build de produção
npm run start                 # Servidor de produção

# Monitoramento
npm run monitor               # Monitor do sistema
npm run health                # Health check
npm run status                # Status do sistema

# Documentação
npm run smart-docs:init       # Inicializar Smart Docs
npm run smart-docs:start      # Iniciar Smart Docs
npm run smart-docs:status     # Status Smart Docs

# Auditoria
npm run audit:v33             # Auditoria v3.3
npm run audit:current-state   # Estado atual
npm run audit:rollback:v31    # Rollback v3.1
```

### **Ferramentas de Debug**

- **Error Memory**: Base de conhecimento de erros
- **Smart Docs**: Documentação auto-atualizada
- **System Monitor**: Monitoramento contínuo
- **Audit Tools**: Ferramentas de auditoria

---

## 📚 **DOCUMENTAÇÃO DISPONÍVEL**

### **Documentos Principais**

- **PLATFORM_OVERVIEW.md**: Visão geral completa
- **API_REFERENCE.md**: Referência completa das APIs
- **DATABASE_SCHEMA.md**: Schema do banco de dados
- **DEPLOYMENT_GUIDE.md**: Guia de deploy
- **USER_GUIDE.md**: Guia do usuário
- **GAMIFICATION_INTEGRATION.md**: Integração de gamificação
- **ERP_CRM_INTEGRATION.md**: Integração ERP/CRM
- **AUTOMATION_INTEGRATION.md**: Integração de automação

### **Documentação Técnica**

- **Smart Docs**: Sistema de documentação inteligente
- **Error Memory**: Base de conhecimento de erros
- **API Documentation**: Documentação automática das APIs
- **Changelog**: Histórico de mudanças

---

## 🎉 **CONCLUSÃO**

A **Yoobe v3** é uma plataforma empresarial completa e robusta que oferece:

### **✅ Funcionalidades Principais**

- **Sistema completo de orçamentos** com fluxo de aprovação
- **RBAC avançado** com 4 níveis de acesso
- **Multi-tenancy robusto** com isolamento completo
- **Checkout inteligente** com múltiplos métodos de pagamento
- **Wallet integrado** com sistema de pontos
- **Replicação automática** de produtos
- **Sistema de convites** para gestores e funcionários
- **SwagTrack** para rastreamento de entregas
- **Integração Cubbo** para estoque
- **Auditoria completa** com logs WORM

### **✅ Qualidade e Confiabilidade**

- **Testes abrangentes** (17/17 para orçamentos)
- **Documentação completa** e auto-atualizada
- **Sistema de monitoramento** em tempo real
- **Auditoria WORM** para compliance
- **Error Memory** para prevenção de erros

### **✅ Escalabilidade e Performance**

- **Multi-tenancy** para múltiplas empresas
- **APIs RESTful** bem estruturadas
- **Banco de dados otimizado** com RLS
- **Sistema de cache** e otimizações
- **Deploy automatizado** com Vercel

**🚀 O sistema está 100% implementado e pronto para produção!**

---

## 📞 **SUPORTE E CONTATO**

- **Documentação**: `/docs/v3/`
- **Issues**: GitHub Issues
- **Email**: suporte@yoobe.app
- **Discord**: Comunidade Yoobe

---

_Última atualização: 2025-01-02_  
_Versão: 3.3.0_  
_Status: ✅ PRODUÇÃO READY_
