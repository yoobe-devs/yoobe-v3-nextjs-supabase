# 🏢 Integração ERP/CRM - Yoobe Platform

## 📋 Índice
- [Visão Geral](#visão-geral)
- [Plataformas Suportadas](#plataformas-suportadas)
- [Configuração](#configuração)
- [APIs](#apis)
- [Exemplos](#exemplos)
- [Troubleshooting](#troubleshooting)

---

## 🎯 Visão Geral

O sistema de integração ERP/CRM da Yoobe Platform permite que gestores sincronizem dados entre suas lojas e sistemas empresariais como SAP, Salesforce e Oracle. Isso possibilita a gestão centralizada de clientes, produtos e pedidos.

### 🚀 Benefícios

- **Sincronização Automática**: Dados sincronizados em tempo real
- **Gestão Centralizada**: Controle unificado de informações
- **Redução de Erros**: Eliminação de entrada manual de dados
- **Eficiência Operacional**: Processos automatizados

---

## 🎪 Plataformas Suportadas

### ✅ SAP
**Foco**: ERP empresarial

```typescript
interface SAPConfig {
  apiKey: string
  baseUrl: string
  clientId: string
  features: {
    customers: boolean
    products: boolean
    orders: boolean
    inventory: boolean
  }
}
```

**Funcionalidades**:
- ✅ Sincronização de clientes
- ✅ Gestão de produtos
- ✅ Processamento de pedidos
- ✅ Controle de estoque

### ✅ Salesforce
**Foco**: CRM e vendas

```typescript
interface SalesforceConfig {
  apiKey: string
  baseUrl: string
  orgId: string
  features: {
    leads: boolean
    contacts: boolean
    opportunities: boolean
    accounts: boolean
  }
}
```

**Funcionalidades**:
- ✅ Gestão de leads
- ✅ Contatos e contas
- ✅ Oportunidades de venda
- ✅ Relatórios de vendas

### ✅ Oracle
**Foco**: ERP e CRM unificado

```typescript
interface OracleConfig {
  apiKey: string
  baseUrl: string
  instanceId: string
  features: {
    erp: boolean
    crm: boolean
    hcm: boolean
    scm: boolean
  }
}
```

**Funcionalidades**:
- ✅ ERP completo
- ✅ CRM integrado
- ✅ Gestão de recursos humanos
- ✅ Cadeia de suprimentos

---

## ⚙️ Configuração

### 1. Configuração no Gestor

```bash
# Acesse as configurações de ERP/CRM
http://localhost:3001/gestor/integracoes
```

### 2. Configuração por Plataforma

#### SAP

```typescript
// Configuração SAP
const sapConfig = {
  apiKey: process.env.SAP_API_KEY,
  baseUrl: 'https://api.sap.com/v1',
  clientId: 'your_sap_client_id',
  webhookUrl: 'https://api.yoobe.com/webhooks/sap',
  syncInterval: 300000, // 5 minutos
  features: {
    customers: true,
    products: true,
    orders: true,
    inventory: true
  },
  mappings: {
    customerFields: {
      'sap.customer_id': 'yoobe.user_id',
      'sap.company_name': 'yoobe.company_name',
      'sap.email': 'yoobe.email'
    },
    productFields: {
      'sap.product_id': 'yoobe.product_id',
      'sap.name': 'yoobe.name',
      'sap.price': 'yoobe.price'
    }
  }
}
```

#### Salesforce

```typescript
// Configuração Salesforce
const salesforceConfig = {
  apiKey: process.env.SALESFORCE_API_KEY,
  baseUrl: 'https://api.salesforce.com/v1',
  orgId: 'your_salesforce_org_id',
  webhookUrl: 'https://api.yoobe.com/webhooks/salesforce',
  syncInterval: 600000, // 10 minutos
  features: {
    leads: true,
    contacts: true,
    opportunities: true,
    accounts: true
  },
  mappings: {
    leadFields: {
      'sf.lead_id': 'yoobe.user_id',
      'sf.company': 'yoobe.company_name',
      'sf.email': 'yoobe.email'
    },
    contactFields: {
      'sf.contact_id': 'yoobe.user_id',
      'sf.first_name': 'yoobe.first_name',
      'sf.last_name': 'yoobe.last_name'
    }
  }
}
```

#### Oracle

```typescript
// Configuração Oracle
const oracleConfig = {
  apiKey: process.env.ORACLE_API_KEY,
  baseUrl: 'https://api.oracle.com/v1',
  instanceId: 'your_oracle_instance_id',
  webhookUrl: 'https://api.yoobe.com/webhooks/oracle',
  syncInterval: 900000, // 15 minutos
  features: {
    erp: true,
    crm: true,
    hcm: true,
    scm: true
  },
  mappings: {
    customerFields: {
      'oracle.customer_id': 'yoobe.user_id',
      'oracle.customer_name': 'yoobe.full_name',
      'oracle.customer_email': 'yoobe.email'
    },
    orderFields: {
      'oracle.order_id': 'yoobe.order_id',
      'oracle.order_total': 'yoobe.total_amount',
      'oracle.order_status': 'yoobe.status'
    }
  }
}
```

### 3. Mapeamento de Dados

```typescript
// Configuração de mapeamento
const dataMappings = {
  // Clientes
  customers: {
    sap: {
      'customer_id': 'sap_customer_id',
      'name': 'customer_name',
      'email': 'email_address',
      'phone': 'phone_number',
      'address': 'billing_address'
    },
    salesforce: {
      'contact_id': 'sf_contact_id',
      'first_name': 'first_name',
      'last_name': 'last_name',
      'email': 'email',
      'phone': 'phone'
    },
    oracle: {
      'customer_id': 'oracle_customer_id',
      'name': 'customer_name',
      'email': 'email_address',
      'phone': 'phone_number'
    }
  },
  
  // Produtos
  products: {
    sap: {
      'product_id': 'sap_product_id',
      'name': 'product_name',
      'price': 'unit_price',
      'stock': 'available_quantity'
    },
    salesforce: {
      'product_id': 'sf_product_id',
      'name': 'product_name',
      'price': 'unit_price',
      'description': 'product_description'
    },
    oracle: {
      'product_id': 'oracle_product_id',
      'name': 'product_name',
      'price': 'unit_price',
      'stock': 'inventory_quantity'
    }
  },
  
  // Pedidos
  orders: {
    sap: {
      'order_id': 'sap_order_id',
      'customer_id': 'customer_id',
      'total': 'order_total',
      'status': 'order_status'
    },
    salesforce: {
      'opportunity_id': 'sf_opportunity_id',
      'contact_id': 'contact_id',
      'amount': 'opportunity_amount',
      'stage': 'opportunity_stage'
    },
    oracle: {
      'order_id': 'oracle_order_id',
      'customer_id': 'customer_id',
      'total': 'order_total',
      'status': 'order_status'
    }
  }
}
```

---

## 🔌 APIs

### Sincronização de Dados

#### POST /api/erp-crm/sync
```typescript
// Sincronizar dados com ERP/CRM
POST /api/erp-crm/sync
{
  "platform": "sap", // sap, salesforce, oracle
  "entity": "customers", // customers, products, orders
  "action": "sync", // sync, create, update, delete
  "data": {
    "customer_id": "12345",
    "name": "João Silva",
    "email": "joao@empresa.com"
  }
}

// Resposta
{
  "success": true,
  "data": {
    "syncedRecords": 1,
    "platform": "sap",
    "entity": "customers",
    "timestamp": "2024-01-17T10:30:00Z"
  }
}
```

#### GET /api/erp-crm/status
```typescript
// Verificar status das integrações
GET /api/erp-crm/status

// Resposta
{
  "success": true,
  "data": {
    "integrations": [
      {
        "platform": "sap",
        "status": "connected",
        "lastSync": "2024-01-17T10:30:00Z",
        "syncedRecords": 1250
      },
      {
        "platform": "salesforce",
        "status": "connected",
        "lastSync": "2024-01-17T10:25:00Z",
        "syncedRecords": 890
      },
      {
        "platform": "oracle",
        "status": "disconnected",
        "lastSync": null,
        "syncedRecords": 0
      }
    ]
  }
}
```

### Webhooks

#### POST /api/webhooks/sap
```typescript
// Webhook SAP
POST /api/webhooks/sap
{
  "event": "customer.created",
  "data": {
    "customer_id": "SAP_CUST_123",
    "name": "Maria Santos",
    "email": "maria@empresa.com",
    "company": "Empresa ABC"
  }
}
```

#### POST /api/webhooks/salesforce
```typescript
// Webhook Salesforce
POST /api/webhooks/salesforce
{
  "event": "lead.converted",
  "data": {
    "lead_id": "SF_LEAD_456",
    "contact_id": "SF_CONTACT_789",
    "email": "pedro@empresa.com",
    "company": "Empresa XYZ"
  }
}
```

#### POST /api/webhooks/oracle
```typescript
// Webhook Oracle
POST /api/webhooks/oracle
{
  "event": "order.created",
  "data": {
    "order_id": "ORACLE_ORDER_101",
    "customer_id": "ORACLE_CUST_202",
    "total_amount": 299.90,
    "items": [
      {
        "product_id": "ORACLE_PROD_303",
        "quantity": 2,
        "price": 149.95
      }
    ]
  }
}
```

---

## 💡 Exemplos

### 1. Integração SAP - Sincronização de Clientes

```typescript
// Serviço SAP
class SAPService {
  private config: SAPConfig

  constructor(config: SAPConfig) {
    this.config = config
  }

  async syncCustomers(): Promise<number> {
    try {
      // Buscar clientes do SAP
      const sapCustomers = await this.fetchSAPCustomers()
      
      // Mapear dados
      const mappedCustomers = sapCustomers.map(customer => ({
        yoobe_user_id: customer.sap_customer_id,
        full_name: customer.customer_name,
        email: customer.email_address,
        company_name: customer.company_name,
        phone: customer.phone_number
      }))
      
      // Sincronizar com Yoobe
      const syncedCount = await this.syncWithYoobe(mappedCustomers)
      
      return syncedCount
    } catch (error) {
      console.error('Erro ao sincronizar clientes SAP:', error)
      throw error
    }
  }

  private async fetchSAPCustomers() {
    const response = await fetch(
      `${this.config.baseUrl}/customers`,
      {
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    )
    
    return response.json()
  }

  private async syncWithYoobe(customers: any[]) {
    const response = await fetch('/api/erp-crm/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        platform: 'sap',
        entity: 'customers',
        action: 'sync',
        data: customers
      })
    })
    
    const result = await response.json()
    return result.data.syncedRecords
  }
}
```

### 2. Integração Salesforce - Gestão de Leads

```typescript
// Serviço Salesforce
class SalesforceService {
  private config: SalesforceConfig

  constructor(config: SalesforceConfig) {
    this.config = config
  }

  async syncLeads(): Promise<number> {
    try {
      // Buscar leads do Salesforce
      const sfLeads = await this.fetchSalesforceLeads()
      
      // Converter leads em usuários Yoobe
      const yoobeUsers = sfLeads.map(lead => ({
        email: lead.email,
        full_name: `${lead.first_name} ${lead.last_name}`,
        company_name: lead.company,
        role: 'user',
        source: 'salesforce_lead'
      }))
      
      // Criar usuários na Yoobe
      const createdUsers = await this.createYoobeUsers(yoobeUsers)
      
      return createdUsers.length
    } catch (error) {
      console.error('Erro ao sincronizar leads Salesforce:', error)
      throw error
    }
  }

  async convertLeadToContact(leadId: string, contactData: any) {
    try {
      // Converter lead em contato no Salesforce
      const response = await fetch(
        `${this.config.baseUrl}/leads/${leadId}/convert`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.config.apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(contactData)
        }
      )
      
      const result = await response.json()
      
      // Sincronizar com Yoobe
      await this.syncContactWithYoobe(result.contact_id, contactData)
      
      return result
    } catch (error) {
      console.error('Erro ao converter lead:', error)
      throw error
    }
  }
}
```

### 3. Integração Oracle - Processamento de Pedidos

```typescript
// Serviço Oracle
class OracleService {
  private config: OracleConfig

  constructor(config: OracleConfig) {
    this.config = config
  }

  async syncOrders(): Promise<number> {
    try {
      // Buscar pedidos do Oracle
      const oracleOrders = await this.fetchOracleOrders()
      
      // Processar pedidos
      const processedOrders = await Promise.all(
        oracleOrders.map(order => this.processOrder(order))
      )
      
      return processedOrders.length
    } catch (error) {
      console.error('Erro ao sincronizar pedidos Oracle:', error)
      throw error
    }
  }

  private async processOrder(order: any) {
    try {
      // Verificar se o cliente existe
      const customer = await this.findOrCreateCustomer(order.customer_id)
      
      // Criar pedido na Yoobe
      const yoobeOrder = await this.createYoobeOrder({
        customer_id: customer.id,
        total_amount: order.total_amount,
        items: order.items.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity,
          price: item.price
        })),
        source: 'oracle'
      })
      
      // Atualizar status no Oracle
      await this.updateOracleOrderStatus(order.order_id, 'processed')
      
      return yoobeOrder
    } catch (error) {
      console.error('Erro ao processar pedido:', error)
      throw error
    }
  }
}
```

---

## 🔧 Troubleshooting

### Problemas Comuns

#### 1. Sincronização falhando

```bash
# Verificar logs de sincronização
tail -f /var/log/yoobe/erp-crm-sync.log

# Forçar sincronização manual
curl -X POST http://localhost:3001/api/erp-crm/sync \
  -H "Content-Type: application/json" \
  -d '{"platform": "sap", "entity": "customers", "action": "sync"}'
```

#### 2. Erro de autenticação

```bash
# Verificar credenciais
echo $SAP_API_KEY
echo $SALESFORCE_API_KEY
echo $ORACLE_API_KEY

# Testar conexão
curl -X GET https://api.sap.com/v1/health \
  -H "Authorization: Bearer $SAP_API_KEY"
```

#### 3. Mapeamento de dados incorreto

```bash
# Verificar mapeamentos
curl -X GET http://localhost:3001/api/erp-crm/mappings

# Testar mapeamento específico
curl -X POST http://localhost:3001/api/erp-crm/test-mapping \
  -H "Content-Type: application/json" \
  -d '{"platform": "sap", "entity": "customers", "data": {...}}'
```

### Logs do Sistema

```bash
# Logs de ERP/CRM
pm2 logs yoobe-erp-crm

# Logs de webhooks
pm2 logs yoobe-webhooks

# Logs de sincronização
pm2 logs yoobe-sync
```

### Monitoramento

```bash
# Status das integrações
curl -X GET http://localhost:3001/api/erp-crm/status

# Métricas de sincronização
curl -X GET http://localhost:3001/api/erp-crm/metrics

# Registros sincronizados
curl -X GET http://localhost:3001/api/erp-crm/synced-records
```

---

## 📊 Métricas e Relatórios

### Dashboard de ERP/CRM

```typescript
// Métricas principais
interface ERPCRMMetrics {
  totalIntegrations: number
  activeIntegrations: number
  totalSyncedRecords: number
  syncSuccessRate: number
  averageSyncTime: number
  lastSyncTime: string
  nextSyncTime: string
}

// Relatórios disponíveis
const reports = {
  syncByPlatform: 'Sincronização por plataforma',
  syncByEntity: 'Sincronização por entidade',
  syncByTime: 'Sincronização por período',
  errorRates: 'Taxa de erros',
  syncTimes: 'Tempos de sincronização',
  dataQuality: 'Qualidade dos dados'
}
```

---

## 🚀 Próximas Funcionalidades

### v2.1.0 (Próxima)
- ✅ Sincronização bidirecional
- ✅ Mapeamento visual de campos
- ✅ Validação de dados
- ✅ Relatórios avançados

### v2.2.0 (Futuro)
- 🤖 IA para mapeamento automático
- 📱 Mobile app
- 🔄 Sincronização em tempo real
- 🎯 Integração com mais ERPs

---

## 📞 Suporte

### Contatos

- **Email**: suporte@yoobe.com
- **Documentação**: https://docs.yoobe.com/erp-crm
- **Status**: https://status.yoobe.com

### Recursos Adicionais

- [API Reference](../API_REFERENCE.md)
- [Automation Integration](./AUTOMATION_INTEGRATION.md)
- [Platform Overview](./PLATFORM_OVERVIEW.md)

---

## 🎉 Conclusão

O sistema de integração ERP/CRM da Yoobe Platform oferece uma solução completa para sincronização com sistemas empresariais populares. Com APIs robustas e mapeamento flexível, sua empresa pode integrar dados de forma eficiente e confiável.

**Versão atual**: v2.0.0  
**Última atualização**: Janeiro 2024  
**Status**: ✅ Produção
