# 🚀 **INSTRUÇÕES PARA APLICAÇÃO EM PRODUÇÃO**

## 📋 **Pré-requisitos**

### **1. Configuração de Ambiente**

```bash
# Configurar variáveis de ambiente de produção
export NEXT_PUBLIC_SUPABASE_URL="https://seu-projeto.supabase.co"
export SUPABASE_SERVICE_ROLE_KEY="sua-chave-de-servico"
export NODE_ENV="production"
```

### **2. Verificar Acesso**

- ✅ Acesso ao Supabase de produção
- ✅ Chave de serviço válida
- ✅ Permissões para alterar schema

## 🔧 **Execução da Migration**

### **Opção 1: Script Automático (Recomendado)**

```bash
# 1. Configurar ambiente
export NEXT_PUBLIC_SUPABASE_URL="https://seu-projeto.supabase.co"
export SUPABASE_SERVICE_ROLE_KEY="sua-chave-de-servico"

# 2. Executar script
node apply-production-migration.js
```

### **Opção 2: Manual via Supabase Studio**

1. Acessar [Supabase Dashboard](https://supabase.com/dashboard)
2. Selecionar seu projeto
3. Ir para **SQL Editor**
4. Copiar e executar o conteúdo de `migrations/add-advanced-product-fields.sql`

### **Opção 3: Via CLI do Supabase**

```bash
# 1. Instalar Supabase CLI
npm install -g supabase

# 2. Fazer login
supabase login

# 3. Aplicar migration
supabase db push --db-url "postgresql://..."
```

## 📊 **Verificação da Migration**

### **1. Verificar Campos Criados**

```sql
-- Executar no SQL Editor do Supabase
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'client_products'
AND column_name IN (
  'tags', 'images', 'advanced_description', 'is_active',
  'custom_sku', 'metadata', 'activated_at', 'deactivated_at', 'deactivation_reason'
)
ORDER BY column_name;
```

### **2. Verificar Índices**

```sql
-- Verificar índices criados
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'client_products'
AND indexname LIKE 'idx_client_products%';
```

### **3. Verificar Constraints**

```sql
-- Verificar constraints
SELECT conname, contype, pg_get_constraintdef(oid)
FROM pg_constraint
WHERE conrelid = 'client_products'::regclass;
```

## 🧪 **Testes em Produção**

### **1. Testar APIs**

```bash
# Testar geração de EAN-13
curl -X POST https://sua-app.vercel.app/api/products/generate-ean13 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN" \
  -d '{"sku": "TEST-001"}'

# Testar busca de produto
curl -X GET https://sua-app.vercel.app/api/products/PRODUTO_ID \
  -H "Authorization: Bearer SEU_TOKEN"
```

### **2. Testar Frontend**

- ✅ Acessar página de produtos do gestor
- ✅ Verificar se produtos aparecem corretamente
- ✅ Testar modal de edição
- ✅ Validar geração de EAN-13
- ✅ Testar ativação/inativação

### **3. Verificar Performance**

```sql
-- Verificar performance das consultas
EXPLAIN ANALYZE
SELECT * FROM client_products
WHERE client_id = 'uuid' AND is_active = true;
```

## 🚨 **Rollback (Se Necessário)**

### **1. Reverter Migration**

```sql
-- Remover campos adicionados
ALTER TABLE client_products DROP COLUMN IF EXISTS tags;
ALTER TABLE client_products DROP COLUMN IF EXISTS images;
ALTER TABLE client_products DROP COLUMN IF EXISTS advanced_description;
ALTER TABLE client_products DROP COLUMN IF EXISTS is_active;
ALTER TABLE client_products DROP COLUMN IF EXISTS custom_sku;
ALTER TABLE client_products DROP COLUMN IF EXISTS metadata;
ALTER TABLE client_products DROP COLUMN IF EXISTS activated_at;
ALTER TABLE client_products DROP COLUMN IF EXISTS deactivated_at;
ALTER TABLE client_products DROP COLUMN IF EXISTS deactivation_reason;

-- Remover índices
DROP INDEX IF EXISTS idx_client_products_is_active;
DROP INDEX IF EXISTS idx_client_products_client_id_active;
DROP INDEX IF EXISTS idx_client_products_ean_13;
DROP INDEX IF EXISTS idx_client_products_custom_sku;
DROP INDEX IF EXISTS idx_client_products_tags;
DROP INDEX IF EXISTS idx_client_products_images;
```

## 📝 **Checklist de Deploy**

### **Antes da Migration:**

- [ ] Backup do banco de produção
- [ ] Teste em ambiente de staging
- [ ] Validação da migration localmente
- [ ] Notificação da equipe

### **Durante a Migration:**

- [ ] Executar em horário de baixo tráfego
- [ ] Monitorar logs do Supabase
- [ ] Verificar performance das consultas

### **Após a Migration:**

- [ ] Validar campos criados
- [ ] Testar todas as APIs
- [ ] Verificar frontend
- [ ] Monitorar métricas de performance
- [ ] Documentar mudanças

## 🔍 **Monitoramento**

### **1. Logs do Supabase**

- Monitorar logs de queries
- Verificar erros de constraint
- Acompanhar performance

### **2. Métricas da Aplicação**

- Tempo de resposta das APIs
- Taxa de erro
- Uso de memória/CPU

### **3. Alertas**

- Configurar alertas para erros
- Monitorar performance degradada
- Acompanhar uso de recursos

## 📞 **Suporte**

### **Em caso de problemas:**

1. **Verificar logs** do Supabase e da aplicação
2. **Consultar documentação** da migration
3. **Executar rollback** se necessário
4. **Contatar equipe** de desenvolvimento

### **Contatos:**

- **Desenvolvedor:** Equipe YOOBE
- **Documentação:** Este arquivo e `RESUMO_IMPLEMENTACAO_REPLICACAO_AVANCADA.md`
- **Issues:** [GitHub Issues](https://github.com/yoobe-devs/yoobe-v3-nextjs-supabase/issues)

---

**🎯 Objetivo:** Implementar módulo de replicação avançada em produção  
**📅 Data:** 03/09/2025  
**🔧 Status:** ✅ **PRONTO PARA PRODUÇÃO**
