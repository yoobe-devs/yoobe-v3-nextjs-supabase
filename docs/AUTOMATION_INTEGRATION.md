# 🤖 Automação - Yoobe Platform

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

```typescript
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
```

**Funcionalidades**:
- ✅ Triggers automáticos
- ✅ Ações personalizadas
- ✅ Filtros condicionais
- ✅ Agendamento de tarefas

### ✅ Floui
**Foco**: Automação empresarial

```typescript
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
```

**Funcionalidades**:
- ✅ Workflows visuais
- ✅ Integrações nativas
- ✅ Analytics avançados
- ✅ Monitoramento em tempo real

### ✅ Make (Integromat)
**Foco**: Cenários de automação

```typescript
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
```

**Funcionalidades**:
- ✅ Cenários complexos
- ✅ Conexões múltiplas
- ✅ Roteamento inteligente
- ✅ Tratamento de erros

---

## ⚙️ Configuração

### 1. Configuração no Gestor

```bash
# Acesse as configurações de automação
http://localhost:3001/gestor/integracoes
```

### 2. Configuração por Plataforma

#### Zapier

```typescript
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
```

#### Floui

```typescript
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
```

#### Make

```typescript
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
```

### 3. Webhooks Disponíveis

```typescript
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
```

---

## 🔌 APIs

### Webhooks

#### POST /api/webhooks/zapier
```typescript
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
```

#### POST /api/webhooks/floui
```typescript
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
```

#### POST /api/webhooks/make
```typescript
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
```

### APIs de Automação

#### GET /api/automation/triggers
```typescript
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
```

#### POST /api/automation/actions
```typescript
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
```

---

## 💡 Exemplos

### 1. Workflow Zapier - Novo Pedido

```typescript
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
        body: `
          Olá {{order.user.full_name}},
          
          Seu pedido foi confirmado!
          
          Pedido: #{{order.id}}
          Total: R$ {{order.total_amount}}
          Status: {{order.status}}
          
          Acompanhe seu pedido em: {{order.tracking_url}}
        `
      }
    },
    {
      platform: 'slack',
      action: 'send_message',
      config: {
        channel: '#pedidos',
        message: `Novo pedido: #{{order.id}} - R$ {{order.total_amount}}`
      }
    }
  ]
}
```

### 2. Workflow Floui - Sincronização de Estoque

```typescript
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
        body: `
          Produto: {{product.name}}
          Estoque Atual: {{product.current_stock}}
          Estoque Mínimo: {{product.min_stock}}
          Loja: {{product.store_name}}
        `
      }
    }
  ]
}
```

### 3. Cenário Make - Gestão de Usuários

```typescript
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
```

---

## 🔧 Troubleshooting

### Problemas Comuns

#### 1. Webhook não recebendo dados

```bash
# Verificar se o webhook está ativo
curl -X GET http://localhost:3001/api/automation/webhooks/status

# Testar webhook manualmente
curl -X POST http://localhost:3001/api/webhooks/zapier \
  -H "Content-Type: application/json" \
  -d '{"event": "test", "data": {"test": true}}'
```

#### 2. Erro de autenticação

```bash
# Verificar credenciais
echo $ZAPIER_API_KEY
echo $FLOUI_API_KEY
echo $MAKE_API_KEY

# Testar conexão
curl -X GET https://api.zapier.com/v1/me \
  -H "Authorization: Bearer $ZAPIER_API_KEY"
```

#### 3. Workflow não executando

```bash
# Verificar logs de automação
tail -f /var/log/yoobe/automation.log

# Verificar status dos workflows
curl -X GET http://localhost:3001/api/automation/workflows/status
```

### Logs do Sistema

```bash
# Logs de automação
pm2 logs yoobe-automation

# Logs de webhooks
pm2 logs yoobe-webhooks

# Logs de workflows
pm2 logs yoobe-workflows
```

### Monitoramento

```bash
# Status das integrações
curl -X GET http://localhost:3001/api/automation/status

# Métricas de automação
curl -X GET http://localhost:3001/api/automation/metrics

# Workflows ativos
curl -X GET http://localhost:3001/api/automation/workflows
```

---

## 📊 Métricas e Relatórios

### Dashboard de Automação

```typescript
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
```

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
**Status**: ✅ Produção
