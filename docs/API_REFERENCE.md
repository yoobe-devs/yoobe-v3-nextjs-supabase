# 🔌 **API Reference - YOOBE v3**

> **Documentação completa de todos os endpoints da API**

## 📋 **Índice**

1. [Autenticação](#autenticação)
2. [RBAC e Permissões](#rbac-e-permissões)
3. [Usuários e Empresas](#usuários-e-empresas)
4. [Orçamentos](#orçamentos)
5. [Replicação](#replicação)
6. [Checkout e Resgates](#checkout-e-resgates)
7. [Convites](#convites)
7. [Endereços](#endereços)
8. [Pagamentos](#pagamentos)
9. [Webhooks](#webhooks)
10. [Auditoria](#auditoria)

---

## 🔐 **Autenticação**

### **Base URL**
```
https://seu-dominio.com/api
```

### **Headers Obrigatórios**
```http
Authorization: Bearer <access_token>
Content-Type: application/json
```

### **Autenticação via Supabase**
```typescript
// Exemplo de obtenção do token
const { data: { session } } = await supabase.auth.getSession()
const accessToken = session?.access_token
```

---

## 🛡️ **RBAC e Permissões**

### **GET /api/rbac/permissions**

Retorna o mapa de permissões do usuário autenticado.

#### **Resposta**
```json
{
  "success": true,
  "data": {
    "user_id": "uuid",
    "company_id": "uuid",
    "role": "gestor",
    "permissions": {
      "can_create_quotes": true,
      "can_manage_users": true,
      "can_view_orders": true,
      "can_edit_products": true
    }
  }
}
```

#### **Códigos de Status**
- `200` - Sucesso
- `401` - Não autenticado
- `403` - Acesso negado

---

## 👥 **Usuários e Empresas**

### **POST /api/users**

Cria um novo usuário (apenas gestores).

#### **Request Body**
```json
{
  "name": "João Silva",
  "email": "joao@empresa.com",
  "phone": "+5511999999999",
  "tax_id": "123.456.789-00",
  "fiscal_regime": "simples",
  "role": "funcionario"
}
```

#### **Resposta**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "joao@empresa.com",
    "role": "funcionario",
    "created_at": "2025-01-15T10:00:00Z"
  }
}
```

#### **Validações**
- Email deve ser único
- Role deve ser válido
- CPF/CNPJ deve ser válido

### **GET /api/users**

Lista usuários da empresa (apenas gestores).

#### **Query Parameters**
- `role` - Filtrar por role
- `status` - Filtrar por status
- `search` - Buscar por nome/email

#### **Resposta**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "João Silva",
      "email": "joao@empresa.com",
      "role": "funcionario",
      "status": "active",
      "created_at": "2025-01-15T10:00:00Z"
    }
  ],
  "pagination": {
    "total": 25,
    "page": 1,
    "per_page": 10
  }
}
```

---

## 📋 **Orçamentos**

### **POST /api/quotes**

Cria um novo orçamento.

#### **Request Body**
```json
{
  "notes": "Orçamento para produtos promocionais",
  "items": [
    {
      "product_id": "uuid",
      "quantity": 100,
      "unit_price": 25.50
    }
  ]
}
```

#### **Resposta**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "draft",
    "subtotal": 2550.00,
    "total": 2550.00,
    "created_at": "2025-01-15T10:00:00Z"
  }
}
```

### **GET /api/quotes**

Lista orçamentos da empresa.

#### **Query Parameters**
- `status` - Filtrar por status
- `search` - Buscar por notas
- `page` - Número da página
- `per_page` - Itens por página

#### **Resposta**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "status": "sent",
      "subtotal": 2550.00,
      "total": 2550.00,
      "requested_by": "João Silva",
      "created_at": "2025-01-15T10:00:00Z"
    }
  ]
}
```

### **POST /api/quotes/:id/send**

Envia orçamento para aprovação.

#### **Resposta**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "sent",
    "sent_at": "2025-01-15T10:00:00Z"
  }
}
```

### **POST /api/quotes/:id/approve**

Aprova orçamento (apenas Admin Global).

#### **Request Body**
```json
{
  "notes": "Aprovado para produção"
}
```

#### **Resposta**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "approved",
    "approved_by": "uuid",
    "approved_at": "2025-01-15T10:00:00Z"
  }
}
```

### **POST /api/quotes/:id/reject**

Rejeita orçamento (apenas Admin Global).

#### **Request Body**
```json
{
  "notes": "Valores acima do orçado"
}
```

---

## 🔄 **Replicação**

### **POST /api/replications/run**

Executa replicações pendentes.

#### **Resposta**
```json
{
  "success": true,
  "data": {
    "processed": 5,
    "successful": 4,
    "failed": 1,
    "errors": [
      "Produto ID123 não encontrado"
    ]
  }
}
```

### **GET /api/replications/stats**

Retorna estatísticas de replicação.

#### **Resposta**
```json
{
  "success": true,
  "data": {
    "total": 25,
    "queued": 3,
    "processing": 2,
    "completed": 18,
    "failed": 2
  }
}
```

---

## 🛒 **Checkout e Resgates**

### **POST /api/redemptions**

Cria um novo resgate/pedido.

#### **Request Body**
```json
{
  "product_id": "uuid",
  "quantity": 2,
  "payment_method": "points",
  "address_id": "uuid"
}
```

#### **Resposta**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "pending",
    "total_points": 500,
    "wallet_balance": 1500,
    "created_at": "2025-01-15T10:00:00Z"
  }
}
```

### **GET /api/redemptions**

Lista resgates do usuário.

#### **Query Parameters**
- `status` - Filtrar por status
- `payment_method` - Filtrar por método de pagamento

#### **Resposta**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "product_name": "Produto Promocional",
      "status": "approved",
      "payment_method": "points",
      "total_points": 500,
      "created_at": "2025-01-15T10:00:00Z"
    }
  ]
}
```

---

## 📧 **Convites**

### **POST /api/invitations**

Cria um novo convite.

#### **Request Body**
```json
{
  "email": "novo@empresa.com",
  "role": "funcionario",
  "message": "Bem-vindo à nossa equipe!"
}
```

#### **Resposta**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "novo@empresa.com",
    "token": "invite_token_123",
    "expires_at": "2025-01-22T10:00:00Z"
  }
}
```

### **GET /api/invitations**

Lista convites da empresa.

#### **Query Parameters**
- `status` - Filtrar por status

#### **Resposta**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "email": "novo@empresa.com",
      "status": "pending",
      "role": "funcionario",
      "created_at": "2025-01-15T10:00:00Z"
    }
  ]
}
```

### **POST /api/invitations/accept**

Aceita um convite.

#### **Request Body**
```json
{
  "token": "invite_token_123",
  "name": "João Silva",
  "password": "senha123"
}
```

#### **Resposta**
```json
{
  "success": true,
  "data": {
    "user_id": "uuid",
    "company_id": "uuid",
    "role": "funcionario"
  }
}
```

---

## 📍 **Endereços**

### **POST /api/addresses**

Cria um novo endereço.

#### **Request Body**
```json
{
  "street": "Rua das Flores",
  "number": "123",
  "neighborhood": "Centro",
  "city": "São Paulo",
  "state": "SP",
  "country": "Brasil",
  "zip_code": "01234-567",
  "is_default": true
}
```

#### **Resposta**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "is_default": true,
    "created_at": "2025-01-15T10:00:00Z"
  }
}
```

### **GET /api/addresses**

Lista endereços do usuário.

#### **Query Parameters**
- `user_id` - Filtrar por usuário (apenas gestores)

#### **Resposta**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "street": "Rua das Flores",
      "number": "123",
      "city": "São Paulo",
      "state": "SP",
      "is_default": true
    }
  ]
}
```

---

## 💳 **Pagamentos**

### **POST /api/payments**

Cria um novo pagamento.

#### **Request Body**
```json
{
  "quote_id": "uuid",
  "method": "credit_card",
  "amount": 2550.00,
  "provider": "stripe"
}
```

#### **Resposta**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "pending",
    "external_id": "pi_1234567890",
    "created_at": "2025-01-15T10:00:00Z"
  }
}
```

---

## 🔗 **Webhooks**

### **POST /api/webhooks/payment**

Recebe webhooks de provedores de pagamento.

#### **Request Body**
```json
{
  "provider": "stripe",
  "event_type": "payment_intent.succeeded",
  "external_id": "pi_1234567890",
  "metadata": {
    "quote_id": "uuid"
  }
}
```

#### **Resposta**
```json
{
  "success": true,
  "data": {
    "processed": true,
    "quote_status": "paid",
    "replication_queued": true
  }
}
```

---

## 📊 **Auditoria**

### **GET /api/audit/logs**

Lista logs de auditoria (apenas Admin Global).

#### **Query Parameters**
- `entity` - Filtrar por entidade
- `action` - Filtrar por ação
- `user_id` - Filtrar por usuário
- `start_date` - Data inicial
- `end_date` - Data final

#### **Resposta**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "action": "quote_created",
      "entity": "quotes",
      "entity_id": "uuid",
      "actor_user_id": "uuid",
      "metadata": {
        "total": 2550.00
      },
      "created_at": "2025-01-15T10:00:00Z"
    }
  ]
}
```

---

## 🔧 **Utilitários**

### **GET /api/health**

Verifica status da API.

#### **Resposta**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2025-01-15T10:00:00Z",
    "version": "3.0.0"
  }
}
```

---

## 📝 **Schemas de Validação**

### **Endereço**
```typescript
interface Address {
  street: string
  number: string
  neighborhood: string
  city: string
  state: string
  country: string
  zip_code: string
  is_default: boolean
}
```

### **Orçamento**
```typescript
interface Quote {
  id: string
  company_id: string
  requested_by: string
  status: 'draft' | 'sent' | 'approved' | 'rejected' | 'paid' | 'expired'
  subtotal: number
  discount: number
  total: number
  notes?: string
  created_at: string
  updated_at: string
}
```

### **Usuário**
```typescript
interface User {
  id: string
  email: string
  name: string
  surname?: string
  phone?: string
  tax_id?: string
  role: 'superadmin' | 'admin_gestor' | 'gestor' | 'funcionario'
  status: 'active' | 'inactive'
  created_at: string
  updated_at: string
}
```

---

## 🚨 **Códigos de Erro**

### **HTTP Status Codes**
- `200` - Sucesso
- `201` - Criado
- `400` - Bad Request (validação falhou)
- `401` - Não autenticado
- `403` - Acesso negado
- `404` - Não encontrado
- `422` - Entidade não processável
- `500` - Erro interno do servidor

### **Estrutura de Erro**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Dados inválidos",
    "details": [
      "Email deve ser válido",
      "CPF deve ter 11 dígitos"
    ]
  }
}
```

### **Códigos de Erro Comuns**
- `VALIDATION_ERROR` - Validação falhou
- `UNAUTHORIZED` - Não autenticado
- `FORBIDDEN` - Acesso negado
- `NOT_FOUND` - Recurso não encontrado
- `INSUFFICIENT_BALANCE` - Saldo insuficiente
- `QUOTE_NOT_APPROVED` - Orçamento não aprovado
- `INVALID_TOKEN` - Token inválido ou expirado

---

## 📚 **Exemplos de Uso**

### **Criar Orçamento Completo**
```typescript
// 1. Criar orçamento
const quote = await fetch('/api/quotes', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    notes: 'Produtos promocionais Q1',
    items: [
      { product_id: 'prod_1', quantity: 100, unit_price: 25.50 },
      { product_id: 'prod_2', quantity: 50, unit_price: 15.00 }
    ]
  })
})

// 2. Enviar para aprovação
await fetch(`/api/quotes/${quote.id}/send`, {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` }
})
```

### **Processar Resgate com Pontos**
```typescript
// 1. Verificar saldo
const wallet = await fetch('/api/wallet', {
  headers: { 'Authorization': `Bearer ${token}` }
})

// 2. Criar resgate
const redemption = await fetch('/api/redemptions', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    product_id: 'prod_123',
    quantity: 2,
    payment_method: 'points',
    address_id: 'addr_456'
  })
})
```

---

## 🔒 **Segurança**

### **Rate Limiting**
- **Padrão:** 100 requests por minuto por IP
- **Autenticado:** 1000 requests por minuto por usuário
- **Admin:** 5000 requests por minuto

### **Validação de Input**
- Todos os inputs são validados com **Zod**
- Sanitização automática de dados
- Prevenção de SQL Injection
- Validação de tipos e formatos

### **Autenticação**
- **JWT tokens** via Supabase
- **Refresh tokens** automáticos
- **Sessões** seguras
- **Logout** em todos os dispositivos

---

## 📈 **Monitoramento**

### **Métricas Disponíveis**
- **Requests por minuto**
- **Tempo de resposta**
- **Taxa de erro**
- **Uso de recursos**

### **Logs Estruturados**
- **Request ID** único por requisição
- **User ID** para rastreamento
- **Timestamp** preciso
- **Metadata** contextual

---

## 🆘 **Suporte**

### **Documentação**
- **Swagger/OpenAPI:** `/api/docs`
- **Postman Collection:** Disponível para download
- **Exemplos:** Este documento

### **Contato**
- **Email:** api@yoobe.com
- **Slack:** #api-support
- **Documentação:** docs.yoobe.com/api

---

**Última atualização:** Janeiro 2025  
**Versão da API:** 3.0.0  
**Status:** Estável em Produção
