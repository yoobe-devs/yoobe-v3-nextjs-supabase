# Sistema de Tags para Elegibilidade de Produtos por Funcionário

## 📋 Visão Geral

O Sistema de Tags para Elegibilidade de Produtos permite controlar quais funcionários podem resgatar quais produtos baseado em tags atribuídas tanto aos funcionários quanto aos produtos, com políticas de elegibilidade configuráveis.

## 🎯 Objetivos

- **Controle Granular**: Associar tags aos funcionários e produtos
- **Políticas Flexíveis**: Definir regras de elegibilidade (permitir/bloquear/condicionar)
- **UX Intuitiva**: Exibir catálogo filtrado com explicações claras
- **Segurança**: Validação server-side com RLS (Row-Level Security)

---

## 🗄️ Estrutura do Banco de Dados

### Tabelas Principais

#### 1. `employee_tags_system`
Sistema de tags normalizado por tenant:
```sql
CREATE TABLE employee_tags_system (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  key TEXT NOT NULL,        -- ex: "departamento", "nível", "região"
  value TEXT NOT NULL,      -- ex: "RH", "Pleno", "Sul"
  description TEXT,
  color VARCHAR(7) DEFAULT '#3B82F6',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(tenant_id, key, value)
);
```

#### 2. `user_employee_tags`
Associação de tags aos usuários (N:N):
```sql
CREATE TABLE user_employee_tags (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES employee_tags_system(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL,
  assigned_by UUID REFERENCES users(id) ON DELETE SET NULL,
  assigned_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (user_id, tag_id)
);
```

#### 3. `product_base_employee_tags`
Associação de tags aos produtos base (N:N):
```sql
CREATE TABLE product_base_employee_tags (
  product_id UUID NOT NULL REFERENCES products_base(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES employee_tags_system(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (product_id, tag_id)
);
```

#### 4. `product_tag_policies`
Políticas de elegibilidade por produto:
```sql
CREATE TABLE product_tag_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  product_id UUID NOT NULL REFERENCES products_base(id) ON DELETE CASCADE,
  mode TEXT NOT NULL CHECK (mode IN ('ALLOW_IF_ANY','ALLOW_IF_ALL','DENY_IF_ANY','DENY_IF_ALL')),
  description TEXT,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(tenant_id, product_id)
);
```

### Modos de Política

| Modo | Descrição | Exemplo |
|------|-----------|---------|
| `ALLOW_IF_ANY` | Permite se funcionário tiver **qualquer** tag do produto | Produto com tags [RH, TI] → Funcionário com tag RH = ✅ |
| `ALLOW_IF_ALL` | Permite se funcionário tiver **todas** as tags do produto | Produto com tags [RH, Pleno] → Funcionário com RH + Pleno = ✅ |
| `DENY_IF_ANY` | Bloqueia se funcionário tiver **qualquer** tag do produto | Produto com tags [Diretoria] → Funcionário com Diretoria = ❌ |
| `DENY_IF_ALL` | Bloqueia se funcionário tiver **todas** as tags do produto | Produto com tags [RH, Senior] → Funcionário com RH + Senior = ❌ |

---

## 🔧 Funções SQL

### `fn_is_product_allowed_for_employee`
Função principal para verificar elegibilidade:
```sql
SELECT * FROM fn_is_product_allowed_for_employee(
  p_tenant_id := 'company-uuid',
  p_user_id := 'user-uuid', 
  p_product_id := 'product-uuid'
);
```

**Retorna:**
- `is_allowed`: boolean
- `reason`: texto explicativo

### Funções Auxiliares
- `fn_get_user_tags()`: Retorna tags do usuário
- `fn_get_product_tags()`: Retorna tags do produto
- `fn_get_product_policy()`: Retorna política do produto
- `fn_get_products_with_eligibility()`: Lista produtos com elegibilidade

---

## 🚀 APIs

### 1. `GET /api/me/tags`
Obter tags do usuário logado:
```json
{
  "success": true,
  "data": {
    "tags": [
      { "key": "departamento", "value": "RH", "description": "...", "color": "#10B981" }
    ],
    "tagsByKey": {
      "departamento": [{"value": "RH", "description": "...", "color": "#10B981"}]
    },
    "total": 1
  }
}
```

### 2. `GET /api/funcionario/catalog`
Catálogo filtrado por elegibilidade:
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "product-uuid",
        "title": "Mochila Premium",
        "price_cash": 150.00,
        "price_points": 1500,
        "is_allowed": true,
        "reason": "Elegível",
        "product_tags": [...],
        "policy_mode": "ALLOW_IF_ANY"
      }
    ],
    "pagination": {...},
    "filters": {
      "availableTags": [...],
      "availableCategories": [...]
    }
  }
}
```

**Query Parameters:**
- `q`: Busca por texto
- `category`: Filtro por categoria
- `tagKey`/`tagValue`: Filtro por tag específica
- `onlyEligible`: Mostrar apenas elegíveis
- `page`/`pageSize`: Paginação

### 3. `POST /api/me/tags` (Gestores)
Atualizar tags de funcionário:
```json
{
  "targetUserId": "user-uuid",
  "tagIds": ["tag-uuid-1", "tag-uuid-2"]
}
```

### 4. Validação em `/api/cart/add`
Validação automática de elegibilidade ao adicionar ao carrinho:
```json
// Resposta de erro para produto não elegível
{
  "success": false,
  "error": "Produto não elegível",
  "details": {
    "reason": "Requer TODAS as tags do produto",
    "product_id": "product-uuid",
    "code": "PRODUCT_NOT_ELIGIBLE"
  }
}
```

---

## 🎨 Interface do Usuário

### Componentes Principais

#### 1. `EligibilityBadge`
Badge visual para status de elegibilidade:
```tsx
<EligibilityBadge
  isAllowed={true}
  reason="Elegível"
  variant="compact" // ou "detailed"
  showIcon={true}
/>
```

#### 2. `UserTagsDisplay`
Exibição das tags do usuário:
```tsx
<UserTagsDisplay
  variant="modal" // ou "inline", "card"
  showDescription={true}
/>
```

#### 3. `EmployeeCatalog`
Catálogo completo com filtros:
```tsx
<EmployeeCatalog
  showUserTags={true}
  showFilters={true}
  itemsPerPage={20}
/>
```

### Páginas

#### 1. `/funcionario/catalogo`
Catálogo de produtos para funcionários com:
- ✅ Badges de elegibilidade
- 🔍 Filtros por tags e categoria
- 📱 Design responsivo
- 🛒 Adição ao carrinho com validação

#### 2. `/gestor/funcionarios/tags`
Gerenciamento de tags para gestores:
- 👥 Lista de funcionários
- 🏷️ Atribuição/remoção de tags
- 🔍 Busca por funcionário
- 💾 Salvamento em lote

---

## 🔒 Segurança

### RLS (Row-Level Security)
Todas as tabelas possuem políticas RLS:

```sql
-- Exemplo: user_employee_tags
CREATE POLICY "user_employee_tags_own_access" ON user_employee_tags
  FOR SELECT USING (
    tenant_id = (auth.jwt() ->> 'company_id')::uuid
    AND (
      user_id = auth.uid()::uuid
      OR auth.jwt() ->> 'role' IN ('admin', 'manager', 'gestor')
    )
  );
```

### Validações
- ✅ **Server-side**: Todas as validações no backend
- ✅ **JWT Claims**: Verificação de `company_id` e `role`
- ✅ **RLS**: Isolamento automático por tenant
- ✅ **Auditoria**: Log de todas as operações

---

## 📊 Performance

### Índices Otimizados
```sql
-- Índices para performance
CREATE INDEX idx_user_employee_tags_lookup ON user_employee_tags(tenant_id, user_id);
CREATE INDEX idx_product_base_employee_tags_lookup ON product_base_employee_tags(tenant_id, product_id);
CREATE INDEX idx_employee_tags_system_lookup ON employee_tags_system(tenant_id, key, value) WHERE is_active = true;
```

### Consultas Eficientes
- **JOIN LATERAL**: Para evitar N+1 queries
- **Funções SQL**: Lógica complexa no banco
- **Cache**: Tags do usuário (60s TTL)
- **Paginação**: Limite de itens por página

---

## 🧪 Testes de Aceitação

### Cenários de Teste

1. **Funcionário sem tags**
   - ✅ Vê produtos sem política como elegíveis
   - ❌ Produtos com política exigente aparecem bloqueados

2. **Adicionar tag `departamento=RH`**
   - ✅ Produtos com `ALLOW_IF_ANY` + tag RH tornam-se elegíveis

3. **Produto com `ALLOW_IF_ALL` (RH + Sul)**
   - ❌ Funcionário com apenas RH ainda bloqueado
   - ✅ Ao adicionar `região=Sul`, fica elegível

4. **Produto com `DENY_IF_ANY` (Diretoria)**
   - ❌ Funcionário com tag "Diretoria" fica bloqueado

5. **API de carrinho**
   - ❌ Impede adicionar item bloqueado (403 + reason)

6. **Filtros de catálogo**
   - ✅ Filtro "apenas elegíveis" funciona corretamente

---

## 🚀 Implementação

### 1. Executar Migrações
```bash
# Aplicar migrações do banco
supabase db push
```

### 2. Configurar Tags Padrão
As migrações já incluem tags padrão:
- `departamento`: RH, TI
- `nivel`: Junior, Pleno, Senior

### 3. Atribuir Tags aos Funcionários
Via interface do gestor em `/gestor/funcionarios/tags`

### 4. Configurar Políticas de Produtos
Via interface de gestão de produtos (próxima versão)

### 5. Testar Funcionalidades
- Acessar `/funcionario/catalogo`
- Verificar badges de elegibilidade
- Testar filtros e adição ao carrinho

---

## 📈 Próximos Passos

### Funcionalidades Futuras
- [ ] Interface para configurar políticas de produtos
- [ ] Relatórios de elegibilidade
- [ ] Notificações de mudanças de tags
- [ ] Importação em lote de tags
- [ ] API para integração com sistemas externos

### Melhorias de Performance
- [ ] Cache Redis para consultas frequentes
- [ ] Otimização de queries complexas
- [ ] Compressão de respostas da API

---

## 🐛 Troubleshooting

### Problemas Comuns

1. **"Produto não elegível" inesperado**
   - Verificar se o usuário tem as tags corretas
   - Verificar política do produto
   - Verificar se as tags estão ativas

2. **Tags não aparecem**
   - Verificar RLS policies
   - Verificar se `tenant_id` está correto
   - Verificar se tags estão ativas

3. **Performance lenta**
   - Verificar índices do banco
   - Verificar cache de tags
   - Otimizar queries com EXPLAIN

### Logs Úteis
```sql
-- Verificar tags de um usuário
SELECT * FROM fn_get_user_tags('tenant-uuid', 'user-uuid');

-- Verificar elegibilidade de um produto
SELECT * FROM fn_is_product_allowed_for_employee('tenant-uuid', 'user-uuid', 'product-uuid');
```

---

## 📚 Referências

- [Documentação RLS do Supabase](https://supabase.com/docs/guides/auth/row-level-security)
- [Sistema de Tags - Migração](supabase/migrations/20250101000007_employee_tag_system.sql)
- [Funções de Elegibilidade](supabase/migrations/20250101000008_eligibility_function.sql)
- [APIs de Tags](app/api/me/tags/route.ts)
- [Catálogo de Funcionários](app/api/funcionario/catalog/route.ts)
