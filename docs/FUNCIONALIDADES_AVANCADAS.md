# 🚀 **Funcionalidades Avançadas - YOOBE v3.0.0**

Este documento descreve as funcionalidades avançadas implementadas no sistema YOOBE v3.0.0, incluindo cupons de desconto, múltiplas moedas e gateways de pagamento.

## 📋 **Índice**

1. [Sistema de Cupons de Desconto](#sistema-de-cupons-de-desconto)
2. [Sistema de Múltiplas Moedas](#sistema-de-múltiplas-moedas)
3. [Gateways de Pagamento](#gateways-de-pagamento)
4. [APIs Disponíveis](#apis-disponíveis)
5. [Hooks React](#hooks-react)
6. [Exemplos de Uso](#exemplos-de-uso)
7. [Configuração](#configuração)

---

## 🎫 **Sistema de Cupons de Desconto**

### **Características**

- **Tipos de Desconto**: Percentual, valor fixo, frete grátis
- **Validações**: Data de validade, limite de uso, valor mínimo
- **Restrições**: Produtos/categorias específicas, exclusões
- **Rastreamento**: Histórico de uso por usuário e geral

### **Estrutura do Banco**

```sql
-- Tabela principal de cupons
discount_coupons (
  id, tenant_id, code, name, description,
  discount_type, discount_value, min_order_value,
  max_discount, usage_limit, usage_count,
  user_usage_limit, valid_from, valid_until,
  is_active, applicable_products, applicable_categories,
  excluded_products, metadata
)

-- Rastreamento de uso
coupon_usage (
  id, coupon_id, user_id, checkout_session_id,
  discount_amount, order_total, used_at, metadata
)
```

### **Funcionalidades**

- ✅ Validação de cupons
- ✅ Aplicação automática
- ✅ Cálculo de desconto
- ✅ Controle de uso
- ✅ Auditoria completa

---

## 💱 **Sistema de Múltiplas Moedas**

### **Características**

- **Suporte ISO 4217**: BRL, USD, EUR, GBP, JPY, etc.
- **Taxas de Câmbio**: Atualização automática e manual
- **Conversão em Tempo Real**: Cálculo automático de valores
- **Histórico**: Rastreamento de mudanças nas taxas

### **Estrutura do Banco**

```sql
-- Moedas suportadas
currencies (
  id, tenant_id, code, name, symbol,
  exchange_rate, is_base_currency, is_active,
  decimal_places, rounding_mode, metadata
)

-- Histórico de taxas
exchange_rate_history (
  id, currency_id, exchange_rate, source,
  valid_from, valid_until, metadata
)
```

### **Funcionalidades**

- ✅ Conversão automática
- ✅ Atualização de taxas via API
- ✅ Formatação localizada
- ✅ Arredondamento configurável
- ✅ Estatísticas de uso

---

## 💳 **Gateways de Pagamento**

### **Gateways Suportados**

| Gateway         | Status   | Métodos             | Moedas        |
| --------------- | -------- | ------------------- | ------------- |
| **Stripe**      | ✅ Ativo | Cartão, PIX         | BRL, USD, EUR |
| **MercadoPago** | ✅ Ativo | Cartão, PIX, Boleto | BRL, ARS, CLP |
| **PayPal**      | ✅ Ativo | Cartão, PayPal      | Múltiplas     |
| **PIX**         | ✅ Ativo | PIX                 | BRL           |
| **Boleto**      | ✅ Ativo | Boleto              | BRL           |

### **Estrutura do Banco**

```sql
-- Gateways configurados
payment_gateways (
  id, tenant_id, name, provider, is_active,
  is_test, supported_currencies, supported_payment_methods,
  config, webhook_url, webhook_secret, fees_config
)

-- Transações de pagamento
payment_transactions (
  id, checkout_session_id, gateway_id,
  external_transaction_id, amount, currency_code,
  payment_method, status, gateway_response
)

-- Webhooks recebidos
payment_webhooks (
  id, gateway_id, external_webhook_id,
  event_type, payload, processed, retry_count
)
```

### **Funcionalidades**

- ✅ Processamento de pagamentos
- ✅ Webhooks automáticos
- ✅ Sistema de reembolsos
- ✅ Estatísticas de performance
- ✅ Configuração de taxas

---

## 🔌 **APIs Disponíveis**

### **Cupons de Desconto**

#### **Validar Cupom**

```http
POST /api/coupons/validate
Content-Type: application/json

{
  "code": "DESCONTO20",
  "order_total": 150.00,
  "user_id": "user-uuid",
  "products": ["prod-1", "prod-2"],
  "categories": ["cat-1"]
}
```

#### **Aplicar Cupom**

```http
POST /api/coupons/apply
Content-Type: application/json

{
  "coupon_code": "DESCONTO20",
  "checkout_session_id": "session-uuid",
  "tenant_id": "tenant-uuid"
}
```

### **Conversão de Moedas**

#### **Converter Valor**

```http
POST /api/currency/convert
Content-Type: application/json

{
  "amount": 100.00,
  "from_currency": "BRL",
  "to_currency": "USD",
  "tenant_id": "tenant-uuid"
}
```

### **Pagamentos**

#### **Processar Pagamento**

```http
POST /api/payment/process
Content-Type: application/json

{
  "checkout_session_id": "session-uuid",
  "gateway_id": "gateway-uuid",
  "payment_method": "credit_card",
  "payment_data": {
    "amount": 150.00,
    "card_number": "4111111111111111",
    "expiry": "12/25",
    "cvv": "123"
  },
  "currency_code": "BRL",
  "metadata": {
    "customer_note": "Entrega rápida"
  }
}
```

---

## 🎣 **Hooks React**

### **useCoupons**

Hook para gerenciar cupons de desconto:

```typescript
import { useCoupons } from '@/hooks/useCoupons'

function CheckoutComponent() {
  const {
    appliedCoupon,
    validationResult,
    isLoading,
    error,
    validateCoupon,
    applyCoupon,
    removeCoupon
  } = useCoupons({ tenantId: 'tenant-uuid' })

  const handleCouponValidation = async (code: string) => {
    const result = await validateCoupon({
      code,
      order_total: 150.00,
      user_id: 'user-uuid'
    })

    if (result.valid) {
      await applyCoupon({
        coupon_code: code,
        checkout_session_id: 'session-uuid',
        tenant_id: 'tenant-uuid'
      })
    }
  }

  return (
    <div>
      {appliedCoupon && (
        <div className="coupon-applied">
          Cupom aplicado: {appliedCoupon.name}
          Desconto: {validationResult?.calculated_discount}
        </div>
      )}

      {error && <div className="error">{error}</div>}

      <button
        onClick={() => handleCouponValidation('DESCONTO20')}
        disabled={isLoading}
      >
        {isLoading ? 'Validando...' : 'Aplicar Cupom'}
      </button>
    </div>
  )
}
```

---

## 💡 **Exemplos de Uso**

### **1. Aplicar Cupom no Checkout**

```typescript
// 1. Validar cupom
const validation = await couponService.validateCoupon(
  {
    code: 'SUMMER2024',
    order_total: 200.0,
    user_id: user.id,
  },
  tenantId
)

if (validation.valid) {
  // 2. Aplicar cupom
  const result = await couponService.applyCoupon({
    coupon_code: 'SUMMER2024',
    checkout_session_id: checkoutSession.id,
    tenant_id: tenantId,
  })

  if (result.success) {
    console.log('Desconto aplicado:', result.data.discount_amount)
    console.log('Total final:', result.data.final_total)
  }
}
```

### **2. Converter Moeda**

```typescript
// Converter R$ 100 para USD
const conversion = await currencyService.convertCurrency({
  amount: 100.0,
  from_currency: 'BRL',
  to_currency: 'USD',
  tenant_id: tenantId,
})

console.log('Valor original:', conversion.original_amount, 'BRL')
console.log('Valor convertido:', conversion.converted_amount, 'USD')
console.log('Taxa de câmbio:', conversion.exchange_rate)
```

### **3. Processar Pagamento**

```typescript
// Processar pagamento via Stripe
const payment = await paymentGatewayService.processPayment({
  checkout_session_id: checkoutSession.id,
  gateway_id: stripeGateway.id,
  payment_method: 'credit_card',
  payment_data: {
    amount: 150.0,
    card_number: '4111111111111111',
    expiry: '12/25',
    cvv: '123',
  },
  currency_code: 'BRL',
})

if (payment.success) {
  console.log('Pagamento processado:', payment.data.transaction.id)
  console.log('Status:', payment.data.transaction.status)
}
```

---

## ⚙️ **Configuração**

### **1. Configurar Moedas**

```typescript
// Criar moeda base (BRL)
await currencyService.createCurrency({
  tenant_id: tenantId,
  code: 'BRL',
  name: 'Real Brasileiro',
  symbol: 'R$',
  exchange_rate: 1.0,
  is_base_currency: true,
  is_active: true,
})

// Adicionar outras moedas
await currencyService.createCurrency({
  tenant_id: tenantId,
  code: 'USD',
  name: 'Dólar Americano',
  symbol: '$',
  exchange_rate: 0.21, // 1 BRL = 0.21 USD
  is_active: true,
})
```

### **2. Configurar Gateway de Pagamento**

```typescript
// Configurar Stripe
await paymentGatewayService.createGateway({
  tenant_id: tenantId,
  name: 'Stripe Production',
  provider: 'stripe',
  is_active: true,
  is_test: false,
  supported_currencies: ['BRL', 'USD', 'EUR'],
  supported_payment_methods: ['credit_card', 'debit_card'],
  config: {
    api_key: 'sk_live_...',
    secret_key: 'sk_live_...',
    publishable_key: 'pk_live_...',
  },
  webhook_url: 'https://api.yoobe.com/webhooks/stripe',
  webhook_secret: 'whsec_...',
})
```

### **3. Criar Cupom de Desconto**

```typescript
// Cupom de 20% de desconto
await couponService.createCoupon({
  tenant_id: tenantId,
  code: 'SUMMER2024',
  name: 'Desconto de Verão',
  description: '20% de desconto em todos os produtos',
  discount_type: 'percentage',
  discount_value: 20,
  min_order_value: 50.0,
  max_discount: 100.0,
  usage_limit: 1000,
  user_usage_limit: 1,
  valid_from: new Date().toISOString(),
  valid_until: new Date('2024-12-31').toISOString(),
  is_active: true,
})
```

---

## 📊 **Monitoramento e Estatísticas**

### **Estatísticas de Cupons**

```typescript
const couponStats = await couponService.getCouponStatistics(tenantId)

console.log('Total de cupons:', couponStats.total_coupons)
console.log('Cupons ativos:', couponStats.active_coupons)
console.log('Total de uso:', couponStats.total_usage)
console.log('Desconto total:', couponStats.total_discount)
console.log('Taxa de conversão:', couponStats.conversion_rate)
```

### **Estatísticas de Pagamentos**

```typescript
const paymentStats = await paymentGatewayService.getPaymentStatistics(tenantId)

console.log('Total de transações:', paymentStats.total_transactions)
console.log('Transações bem-sucedidas:', paymentStats.successful_transactions)
console.log(
  'Taxa de sucesso:',
  (paymentStats.successful_transactions / paymentStats.total_transactions) * 100
)
console.log('Valor total:', paymentStats.total_amount)
```

---

## 🔒 **Segurança e Auditoria**

### **Políticas RLS**

Todas as tabelas implementam Row Level Security (RLS):

- **Cupons**: Apenas tenants podem acessar seus próprios cupons
- **Moedas**: Controle de acesso por tenant
- **Pagamentos**: Usuários só veem suas próprias transações
- **Webhooks**: Validação de assinatura e origem

### **Auditoria Automática**

Todas as operações são registradas automaticamente:

- ✅ Criação de cupons
- ✅ Aplicação de cupons
- ✅ Conversões de moeda
- ✅ Processamento de pagamentos
- ✅ Webhooks recebidos

---

## 🚀 **Próximos Passos**

### **Funcionalidades Planejadas**

1. **Sistema de Assinaturas**
   - Pagamentos recorrentes
   - Planos e preços
   - Gestão de ciclo de vida

2. **Integração com APIs Externas**
   - Taxas de câmbio em tempo real
   - Validação de cartões
   - Antifraude

3. **Analytics Avançados**
   - Dashboard de conversões
   - Relatórios de performance
   - Previsões de vendas

### **Melhorias Técnicas**

1. **Cache Redis**
   - Taxas de câmbio
   - Validação de cupons
   - Sessões de checkout

2. **Filas de Processamento**
   - Webhooks assíncronos
   - Atualização de taxas
   - Notificações

3. **Testes Automatizados**
   - Testes unitários
   - Testes de integração
   - Testes de carga

---

## 📞 **Suporte**

Para dúvidas ou suporte técnico:

- **Documentação**: `/docs/`
- **Issues**: GitHub Issues
- **Email**: suporte@yoobe.com
- **Chat**: Discord/Slack

---

## 📝 **Changelog**

### **v3.0.0** - 2024-01-XX

- ✅ Sistema de cupons de desconto
- ✅ Múltiplas moedas e conversão
- ✅ Gateways de pagamento
- ✅ Sistema de auditoria
- ✅ APIs REST completas
- ✅ Hooks React
- ✅ Documentação completa

---

**YOOBE v3.0.0** - Sistema completo de e-commerce com funcionalidades avançadas de pagamento e promoções.
