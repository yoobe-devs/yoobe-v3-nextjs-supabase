# Guia de Execução das Migrações SQL - Sistema de Pontos

## 🚨 ATENÇÃO: Ação Crítica Necessária

**O sistema de pontos está 100% implementado, mas as tabelas do banco de dados ainda não foram criadas.** Este guia mostra como executar as migrações SQL para ativar o sistema.

## 📋 Pré-requisitos

### ✅ Verificados

- [x] Supabase rodando localmente
- [x] Banco `yoobe_v3` acessível
- [x] Usuário com permissões de administrador
- [x] Scripts SQL preparados

### 🔍 Verificar

- [ ] Acesso ao Supabase Studio
- [ ] Permissões para criar tabelas
- [ ] Espaço disponível no banco

## 🎯 Opções de Execução

### Opção 1: Supabase Studio (Recomendado) ⭐

#### Passo 1: Acessar Supabase Studio

```bash
# Abrir no navegador
http://localhost:54323
```

#### Passo 2: Fazer Login

- Usuário: `postgres`
- Senha: `postgres` (padrão local)

#### Passo 3: Navegar para SQL Editor

1. Menu lateral esquerdo
2. Clicar em "SQL Editor"
3. Clicar em "New query"

#### Passo 4: Executar Migrações

1. **Copiar** o conteúdo do arquivo `create-points-system.sql`
2. **Colar** no editor SQL
3. **Clicar** em "Run" (▶️)

#### Passo 5: Verificar Execução

- Aguardar mensagem "Success. No rows returned"
- Verificar se não há erros no console

### Opção 2: Cliente PostgreSQL (psql)

#### Passo 1: Verificar se psql está disponível

```bash
which psql
psql --version
```

#### Passo 2: Executar Migrações

```bash
# Conectar e executar
psql -h localhost -U postgres -d yoobe_v3 -f create-points-system.sql

# Ou conectar primeiro e depois executar
psql -h localhost -U postgres -d yoobe_v3
\i create-points-system.sql
\q
```

### Opção 3: Script Node.js (Se exec_sql funcionar)

#### Passo 1: Verificar função exec_sql

```bash
node check-exec-sql.js
```

#### Passo 2: Executar Setup

```bash
# Se exec_sql existir
node setup-points-system.js

# Se não existir, usar abordagem direta
node setup-points-system-direct.js
```

## 🔍 Verificação da Execução

### Passo 1: Executar Script de Teste

```bash
node test-points-system.js
```

### Passo 2: Verificar Tabelas Criadas

```sql
-- Executar no SQL Editor
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN (
  'wallet_accounts',
  'wallet_entries',
  'points_conversion_rules',
  'redemptions',
  'point_providers',
  'webhook_inbox',
  'errors_catalog'
);
```

### Passo 3: Verificar Colunas Adicionadas

```sql
-- Verificar se product_store tem as colunas de pontos
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'product_store'
AND column_name IN (
  'allow_points',
  'points_price',
  'points_override',
  'points_override_value'
);
```

### Passo 4: Verificar Políticas RLS

```sql
-- Verificar se as políticas RLS foram criadas
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename IN (
  'wallet_accounts',
  'wallet_entries',
  'points_conversion_rules',
  'redemptions',
  'point_providers',
  'webhook_inbox',
  'errors_catalog'
);
```

## 🚨 Solução de Problemas

### Erro: "Permission denied"

```sql
-- Conceder permissões necessárias
GRANT ALL PRIVILEGES ON DATABASE yoobe_v3 TO postgres;
GRANT ALL PRIVILEGES ON SCHEMA public TO postgres;
```

### Erro: "Table already exists"

```sql
-- Remover tabelas existentes (CUIDADO!)
DROP TABLE IF EXISTS errors_catalog CASCADE;
DROP TABLE IF EXISTS webhook_inbox CASCADE;
DROP TABLE IF EXISTS redemptions CASCADE;
DROP TABLE IF EXISTS point_providers CASCADE;
DROP TABLE IF EXISTS points_conversion_rules CASCADE;
DROP TABLE IF EXISTS wallet_entries CASCADE;
DROP TABLE IF EXISTS wallet_accounts CASCADE;
```

### Erro: "Function already exists"

```sql
-- Remover funções existentes
DROP FUNCTION IF EXISTS get_wallet_balance(uuid);
DROP FUNCTION IF EXISTS calculate_points_price(uuid, uuid);
```

### Erro: "Policy already exists"

```sql
-- Remover políticas existentes
DROP POLICY IF EXISTS "Users can view own wallet" ON wallet_accounts;
DROP POLICY IF EXISTS "Users can view own entries" ON wallet_entries;
-- ... continuar para outras políticas
```

## ✅ Checklist de Verificação

### Tabelas Criadas

- [ ] `wallet_accounts`
- [ ] `wallet_entries`
- [ ] `points_conversion_rules`
- [ ] `redemptions`
- [ ] `point_providers`
- [ ] `webhook_inbox`
- [ ] `errors_catalog`

### Colunas Adicionadas

- [ ] `product_store.allow_points`
- [ ] `product_store.points_price`
- [ ] `product_store.points_override`
- [ ] `product_store.points_override_value`

### Funções SQL

- [ ] `get_wallet_balance(uuid)`
- [ ] `calculate_points_price(uuid, uuid)`

### Políticas RLS

- [ ] Políticas para `wallet_accounts`
- [ ] Políticas para `wallet_entries`
- [ ] Políticas para `points_conversion_rules`
- [ ] Políticas para `redemptions`
- [ ] Políticas para `point_providers`
- [ ] Políticas para `webhook_inbox`
- [ ] Políticas para `errors_catalog`

### Índices

- [ ] Índices para `wallet_entries`
- [ ] Índices para `redemptions`
- [ ] Índices para `webhook_inbox`

### Dados Iniciais

- [ ] Regra de conversão padrão criada
- [ ] Provedor de pontos padrão criado

## 🧪 Teste Pós-Migração

### Passo 1: Testar APIs

```bash
# Testar saldo da carteira
curl -H "Authorization: Bearer <token>" \
  http://localhost:3000/api/wallet/balance
```

### Passo 2: Testar Componentes

- Acessar página de produtos
- Verificar se exibe preços em pontos
- Testar componente de carteira

### Passo 3: Testar Funcionalidades

- Criar regra de conversão como gestor
- Configurar produto para pontos
- Fazer checkout por pontos

## 📊 Monitoramento

### Logs do Supabase

```bash
# Ver logs do Supabase
supabase logs
```

### Verificar Tabelas

```sql
-- Contar registros nas tabelas
SELECT
  'wallet_accounts' as table_name, count(*) as count
FROM wallet_accounts
UNION ALL
SELECT 'wallet_entries', count(*) FROM wallet_entries
UNION ALL
SELECT 'points_conversion_rules', count(*) FROM points_conversion_rules
UNION ALL
SELECT 'redemptions', count(*) FROM redemptions;
```

## 🎉 Pós-Execução

### Configuração Inicial

1. **Criar regra de conversão padrão**
2. **Configurar produtos para pontos**
3. **Testar fluxo completo**

### Documentação

1. **Atualizar changelog**
2. **Documentar configurações**
3. **Criar guias de uso**

### Treinamento

1. **Treinar gestores** na configuração
2. **Treinar funcionários** no uso
3. **Documentar processos**

## 🆘 Suporte

### Se as Migrações Falharem

1. **Verificar logs** do Supabase
2. **Verificar permissões** do usuário
3. **Verificar espaço** disponível no banco
4. **Consultar documentação** do Supabase

### Contatos de Emergência

- **Documentação**: Arquivos criados no projeto
- **Scripts**: `test-points-system.js` para diagnóstico
- **Logs**: Supabase Studio > Logs

---

**⚠️ IMPORTANTE**: Execute as migrações em ambiente de desenvolvimento/teste antes de aplicar em produção.

**✅ SUCESSO**: Após executar as migrações, o sistema estará 100% funcional e pronto para uso.
