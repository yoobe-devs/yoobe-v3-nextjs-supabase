# Sistema de Resgate de Brindes - Yoobe v3.2.0

## 📋 Visão Geral

O **Sistema de Resgate de Brindes** permite que funcionários resgatem brindes usando pontos, com controle de elegibilidade baseado em tags. O sistema integra com o **checkout v2** existente para processar pagamentos com pontos.

## 🎯 Funcionalidades Principais

### ✅ **Para Funcionários:**

- **Catálogo de brindes** com elegibilidade baseada em tags
- **Carrinho inteligente** que valida elegibilidade em tempo real
- **Checkout v2** integrado para pagamento com pontos
- **Histórico de resgates** e transações
- **Interface responsiva** e intuitiva

### ✅ **Para Gestores:**

- **Gerenciamento de tags** para funcionários
- **Configuração de políticas** de elegibilidade para produtos
- **Relatórios de resgates** e uso de pontos
- **Controle de estoque** de brindes

## 🏗️ Arquitetura do Sistema

### **1. Frontend (Next.js)**

```
app/funcionario/
├── brindes/page.tsx              # Página principal de resgate
├── carrinho/page.tsx             # Carrinho com validação
└── checkout/[sessionId]/page.tsx # Checkout v2 integrado
```

### **2. Backend (APIs)**

```
app/api/
├── checkout/
│   ├── start/route.ts            # Iniciar checkout
│   ├── session/[sessionId]/route.ts # Buscar sessão
│   └── process/route.ts          # Processar pagamento
├── cart/add/route.ts             # Adicionar ao carrinho (com validação)
├── me/tags/route.ts              # Tags do usuário
└── funcionario/catalog/route.ts  # Catálogo com elegibilidade
```

### **3. Banco de Dados**

```sql
-- Tabelas do sistema de tags (já existentes)
employee_tags_system
user_employee_tags
product_base_employee_tags
product_tag_policies

-- Tabelas do checkout v2 (já existentes)
checkout_sessions
carts
cart_items
orders

-- Nova tabela para transações de pontos
points_transactions
```

## 🔄 Fluxo de Resgate

### **1. Navegação**

```
Funcionário → /funcionario/brindes
```

### **2. Seleção de Brindes**

- Catálogo filtrado por elegibilidade
- Badges visuais (✅ Elegível / ⛔ Bloqueado)
- Tooltips com explicações

### **3. Carrinho**

- Validação automática de elegibilidade
- Separação de itens elegíveis/não elegíveis
- Cálculo de pontos necessários

### **4. Checkout**

- Integração com checkout v2
- Pagamento com pontos
- Endereço de entrega
- Confirmação de resgate

### **5. Processamento**

- Debitar pontos do usuário
- Criar pedido
- Registrar transação
- Atualizar status

## 🛠️ Implementação Técnica

### **Validação de Elegibilidade**

```typescript
// No carrinho, antes de adicionar
const { data: eligibilityResult } = await supabase.rpc(
  'fn_is_product_allowed_for_employee',
  {
    p_tenant_id: companyId,
    p_user_id: user.id,
    p_product_id: product_id,
  }
)

if (!eligibilityResult[0].is_allowed) {
  return NextResponse.json(
    {
      success: false,
      error: 'Produto não elegível',
      reason: eligibilityResult[0].reason,
    },
    { status: 403 }
  )
}
```

### **Processamento de Pagamento**

```typescript
// Processar pagamento com pontos
const { data: paymentResult } = await supabase.rpc('process_points_payment', {
  p_user_id: user.id,
  p_tenant_id: companyId,
  p_amount: session.amount_total,
  p_session_id: session_id,
  p_description: 'Resgate de brindes',
})
```

### **Interface de Elegibilidade**

```tsx
<EligibilityBadge
  isAllowed={item.is_allowed}
  reason={item.reason}
  variant="compact"
/>
```

## 📊 Políticas de Elegibilidade

### **Tipos de Política:**

- **ALLOW_IF_ANY**: Permitir se tiver qualquer tag do produto
- **ALLOW_IF_ALL**: Permitir se tiver todas as tags do produto
- **DENY_IF_ANY**: Negar se tiver qualquer tag do produto
- **DENY_IF_ALL**: Negar se tiver todas as tags do produto

### **Exemplos:**

```sql
-- Produto para RH: permitir se tiver tag "departamento=RH"
INSERT INTO product_tag_policies (tenant_id, product_id, mode)
VALUES (company_id, product_id, 'ALLOW_IF_ANY');

-- Produto premium: negar se tiver tag "nível=Junior"
INSERT INTO product_tag_policies (tenant_id, product_id, mode)
VALUES (company_id, product_id, 'DENY_IF_ANY');
```

## 🔧 Configuração

### **1. Aplicar Migrações**

```bash
# Acesse o painel do Supabase local
http://localhost:54323

# Execute as migrações SQL:
# - 20250101000007_employee_tag_system.sql
# - 20250101000008_eligibility_function.sql
# - 20250101000009_points_payment_function.sql
```

### **2. Configurar Tags**

```bash
# Acesse como gestor
http://localhost:3000/gestor/funcionarios/tags

# Configure tags para funcionários
# Configure políticas para produtos
```

### **3. Testar Sistema**

```bash
# Teste o fluxo completo
http://localhost:3000/funcionario/brindes
```

## 📱 Interface do Usuário

### **Página de Resgate de Brindes**

- **Header**: Pontos disponíveis, carrinho
- **Informações do usuário**: Tags e pontos
- **Catálogo**: Produtos com elegibilidade
- **Filtros**: Apenas elegíveis, busca, categoria

### **Carrinho**

- **Itens elegíveis**: ✅ Pode finalizar
- **Itens não elegíveis**: ⛔ Removidos do checkout
- **Resumo**: Total de pontos, botão finalizar

### **Checkout**

- **Endereço**: Formulário de entrega
- **Resumo**: Itens e pontos
- **Pagamento**: Processamento com pontos
- **Confirmação**: Sucesso do resgate

## 🔒 Segurança

### **Row Level Security (RLS)**

- Todas as tabelas com RLS habilitado
- Filtros por `tenant_id` e `user_id`
- Políticas baseadas em roles

### **Validação de Elegibilidade**

- Validação no backend antes de adicionar ao carrinho
- Validação no checkout antes de processar
- Função SQL segura para verificação

### **Auditoria**

- Log de todas as transações
- Rastreamento de mudanças
- Histórico de resgates

## 📈 Monitoramento

### **Métricas Disponíveis**

- Total de resgates por funcionário
- Produtos mais resgatados
- Uso de pontos por departamento
- Taxa de conversão (visualização → resgate)

### **Relatórios**

- Resgates por período
- Top funcionários
- Produtos em falta
- Análise de elegibilidade

## 🚀 Próximas Funcionalidades

### **v3.3.0 (Planejado)**

- [ ] **Notificações** de resgate
- [ ] **Cupons** e promoções
- [ ] **Programa de fidelidade**
- [ ] **Integração** com sistemas de RH
- [ ] **Mobile app** nativo

### **v3.4.0 (Futuro)**

- [ ] **IA** para recomendação de brindes
- [ ] **Gamificação** com conquistas
- [ ] **Social features** (compartilhar resgates)
- [ ] **Analytics** avançados

## 🐛 Troubleshooting

### **Problemas Comuns**

#### **1. Produto não aparece como elegível**

```sql
-- Verificar se o produto tem tags
SELECT * FROM product_base_employee_tags
WHERE product_id = 'product_id';

-- Verificar se o usuário tem as tags necessárias
SELECT * FROM user_employee_tags
WHERE user_id = 'user_id';
```

#### **2. Erro de pontos insuficientes**

```sql
-- Verificar saldo do usuário
SELECT points FROM users WHERE id = 'user_id';

-- Verificar transações
SELECT * FROM points_transactions
WHERE user_id = 'user_id'
ORDER BY created_at DESC;
```

#### **3. Checkout não funciona**

```sql
-- Verificar sessão de checkout
SELECT * FROM checkout_sessions
WHERE id = 'session_id';

-- Verificar status do carrinho
SELECT * FROM carts WHERE id = 'cart_id';
```

## 📞 Suporte

### **Documentação Relacionada**

- [Sistema de Tags](SISTEMA_TAGS_ELEGIBILIDADE.md)
- [Checkout v2](CHECKOUT_SYSTEM.md)
- [APIs](API_DOCUMENTATION.md)

### **Contato**

- **Email**: suporte@yoobe.com.br
- **Slack**: #yoobe-support
- **GitHub**: [Issues](https://github.com/yoobe/yoobe-v3/issues)

---

**Versão**: 3.2.0  
**Data**: 15 de Janeiro de 2025  
**Status**: ✅ Implementado e Testado
