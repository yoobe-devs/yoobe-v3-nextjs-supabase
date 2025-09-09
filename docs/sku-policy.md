# Política de SKU - Sistema Yoobe v3

## Visão Geral

O sistema de SKU do Yoobe v3 implementa um padrão rigoroso para identificação única de produtos replicados por empresa, garantindo unicidade, rastreabilidade e conformidade com padrões de mercado.

## Formato do SKU

### Estrutura

```
<BASECODE>-<SEQ_PAD>-<CLIENT>
```

### Componentes

#### BASECODE

- **Origem**: Campo `base_code` da tabela `base_products`
- **Fallback**: Nome do produto sanitizado (máximo 10 caracteres)
- **Fallback final**: "ITEM"
- **Sanitização**: Remove acentos, caracteres especiais, converte para maiúsculo
- **Exemplos**:
  - `TSHIRT` (de "Camiseta Corporativa")
  - `MUG` (de "Caneca Personalizada")
  - `POWERBANK` (de "Power Bank")

#### SEQ_PAD

- **Tipo**: Sequência incremental por empresa
- **Formato**: 4 dígitos com padding zero (0001, 0002, 0003...)
- **Escopo**: Único por `company_id`
- **Controle**: Tabela `sku_counters` com operações atômicas
- **Exemplos**: `0001`, `0002`, `0010`, `0100`

#### CLIENT

- **Origem**: Campo `client_code` da tabela `companies`
- **Fallback**: Nome da empresa sanitizado (máximo 6 caracteres)
- **Fallback final**: "CLIENT"
- **Exemplos**:
  - `YOOBE` (empresa Yoobe)
  - `TECNO` (empresa de tecnologia)
  - `PRIO` (empresa Prioridade)

### Exemplos Completos

```
TSHIRT-0001-YOOBE
MUG-0002-TECNO
POWERBANK-0010-PRIO
BAG-0001-HAPV
```

## Regras de Negócio

### Unicidade

- **Constraint**: `UNIQUE (company_id, final_sku)`
- **Escopo**: Cada empresa tem seu próprio namespace de SKUs
- **Validação**: Verificação automática em todas as operações de criação/atualização

### Geração Automática

- **Trigger**: Sempre que `final_sku` não for fornecido
- **Processo**:
  1. Determinar `basecode` (produto base ou nome)
  2. Determinar `clientcode` (empresa)
  3. Obter próxima sequência
  4. Montar SKU final
  5. Validar unicidade

### Edição Manual

- **Permitida**: Sim, com validação de unicidade
- **Restrições**: Deve manter formato válido
- **Validação**: Verificação de conflitos antes da atualização

## Funções SQL

### sanitize_code(input_text)

```sql
SELECT sanitize_code('Camiseta Corporativa');
-- Resultado: 'CAMISETACO'
```

**Funcionalidade**:

- Remove acentos e caracteres especiais
- Converte para maiúsculo
- Remove caracteres não alfanuméricos
- Limita a 10 caracteres
- Retorna "ITEM" se resultado vazio

### next_company_seq(\_company_id)

```sql
SELECT next_company_seq('550e8400-e29b-41d4-a716-446655440001');
-- Resultado: 5 (próximo número da sequência)
```

**Funcionalidade**:

- Operação atômica com `FOR UPDATE`
- Incrementa contador da empresa
- Thread-safe para alta concorrência
- Cria contador se não existir

### make_final_sku(\_company_id, \_basecode, \_clientcode)

```sql
SELECT make_final_sku(
  '550e8400-e29b-41d4-a716-446655440001',
  'TSHIRT',
  'YOOBE'
);
-- Resultado: 'TSHIRT-0001-YOOBE'
```

**Funcionalidade**:

- Sanitiza códigos de entrada
- Obtém próxima sequência
- Monta SKU no formato padrão
- Garante unicidade

### gen_ean13(code12)

```sql
SELECT gen_ean13('123456789012');
-- Resultado: '1234567890120'
```

**Funcionalidade**:

- Calcula dígito verificador EAN-13
- Valida entrada (12 dígitos numéricos)
- Retorna EAN-13 completo
- Retorna NULL para entradas inválidas

## Tabelas do Sistema

### sku_counters

```sql
CREATE TABLE sku_counters (
  company_id uuid PRIMARY KEY REFERENCES companies(id),
  last_number int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

**Propósito**: Controle de sequência incremental por empresa

### company_products

```sql
CREATE TABLE company_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES companies(id),
  base_product_id uuid REFERENCES base_products(id),
  final_sku varchar(50) NOT NULL,
  ean_13 varchar(13),
  -- ... outros campos
  UNIQUE(company_id, final_sku)
);
```

**Propósito**: Produtos replicados com SKU único

## APIs

### GET /api/sku/preview

**Parâmetros**:

- `company_id`: UUID da empresa
- `base_product_id`: UUID do produto base (opcional)
- `count`: Número de exemplos (padrão: 1)

**Resposta**:

```json
{
  "success": true,
  "data": {
    "samples": ["TSHIRT-0001-YOOBE"],
    "company": {
      "id": "uuid",
      "name": "Empresa",
      "client_code": "YOOBE"
    },
    "base_code": "TSHIRT",
    "next_sequence": 2
  }
}
```

### POST /api/budgets/:id/replicate

**Funcionalidade**: Replica produtos de orçamento aprovado

**Processo**:

1. Valida orçamento aprovado
2. Para cada item do orçamento:
   - Determina `basecode`
   - Determina `clientcode`
   - Gera SKU único
   - Cria `company_products`
   - Gera EAN-13 se necessário
3. Registra replicação
4. Cria notificações

### POST /api/company-products

**Funcionalidade**: Cria produto com SKU automático

**Comportamento**:

- Se `final_sku` não fornecido: gera automaticamente
- Se `final_sku` fornecido: valida unicidade
- Gera EAN-13 se não fornecido

## Permissões

### RLS (Row Level Security)

#### sku_counters

- **SELECT**: superadmin, admin da empresa, gestor da empresa
- **UPDATE/INSERT**: Apenas via funções SQL (server-side)

#### company_products

- **SELECT**: superadmin, admin da empresa, gestor da empresa
- **INSERT**: superadmin, admin da empresa, gestor da empresa
- **UPDATE**: superadmin, admin da empresa, gestor da empresa
- **DELETE**: Apenas admin_global, superadmin

## Casos de Uso

### 1. Replicação Automática

```
Orçamento Aprovado → Replicação → Produtos com SKU
```

### 2. Criação Manual

```
Gestor cria produto → SKU gerado automaticamente → Validação
```

### 3. Edição de SKU

```
Gestor edita SKU → Validação de unicidade → Atualização
```

## Fallbacks e Tratamento de Erros

### Fallbacks de Código

1. **Base Code**: `base_products.base_code` → `base_products.name` → "ITEM"
2. **Client Code**: `companies.client_code` → `companies.name` → "CLIENT"

### Tratamento de Erros

- **SKU duplicado**: Retorna erro 400 com mensagem específica
- **Empresa não encontrada**: Retorna erro 404
- **Produto base não encontrado**: Usa fallback "ITEM"
- **Função SQL falha**: Log de erro e retry automático

## Monitoramento

### Métricas Importantes

- Contadores de SKU por empresa
- Taxa de geração de SKUs
- Erros de unicidade
- Performance das funções SQL

### Logs

- Todas as operações de SKU são logadas em `audit_logs`
- Erros de validação são logados com contexto completo

## Migração e Compatibilidade

### Migração de Dados Existentes

1. Adicionar colunas `client_code` e `base_code`
2. Popular com dados derivados
3. Criar contadores iniciais
4. Validar SKUs existentes

### Compatibilidade

- Sistema é backward compatible
- SKUs antigos continuam funcionando
- Novos produtos seguem padrão rigoroso

## Exemplos Práticos

### Empresa: Yoobe (client_code: YOOBE)

```
TSHIRT-0001-YOOBE  (Camiseta Corporativa)
MUG-0002-YOOBE     (Caneca Personalizada)
BAG-0003-YOOBE     (Mochila Executiva)
```

### Empresa: Tecnologia (client_code: TECNO)

```
TSHIRT-0001-TECNO  (Camiseta Corporativa)
POWERBANK-0002-TECNO (Power Bank)
MOUSEPAD-0003-TECNO  (Mousepad)
```

### Empresa: Prioridade (client_code: PRIO)

```
TSHIRT-0001-PRIO   (Camiseta Corporativa)
GARRAFATRM-0002-PRIO (Garrafa Térmica)
NOTEBOOK-0003-PRIO   (Notebook)
```

## Conclusão

O sistema de SKU do Yoobe v3 garante:

- ✅ Unicidade por empresa
- ✅ Rastreabilidade completa
- ✅ Conformidade com padrões
- ✅ Performance otimizada
- ✅ Facilidade de uso
- ✅ Escalabilidade
- ✅ Manutenibilidade

