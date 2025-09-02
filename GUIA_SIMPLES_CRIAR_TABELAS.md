# 🗄️ Guia Simples - Criar Tabelas de Orçamentos

## 🎯 Você não precisa do Supabase Dashboard!

Como você está rodando o Supabase localmente, pode usar o **Supabase Studio** que já está rodando na sua máquina.

---

## 📋 Passo a Passo Simples

### 1. Abrir o Supabase Studio Local
1. Abra seu navegador
2. Acesse: **http://127.0.0.1:54323**
3. Você verá o Supabase Studio local

### 2. Abrir o SQL Editor
1. No menu lateral esquerdo, clique em **"SQL Editor"**
2. Clique no botão **"New query"** ou **"Nova consulta"**

### 3. Executar o SQL
1. Cole o seguinte código SQL no editor:

```sql
-- =====================================================
-- SISTEMA DE ORÇAMENTOS - CRIAÇÃO COMPLETA DE TABELAS
-- =====================================================

-- 1. Criar tabela budgets
CREATE TABLE IF NOT EXISTS budgets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL,
  manager_id UUID NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  total_amount DECIMAL(10,2) DEFAULT 0,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_notes TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Criar tabela budget_items
CREATE TABLE IF NOT EXISTS budget_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  budget_id UUID NOT NULL REFERENCES budgets(id) ON DELETE CASCADE,
  base_product_id UUID NOT NULL REFERENCES base_products(id),
  quantity INTEGER NOT NULL DEFAULT 1,
  custom_price DECIMAL(10,2),
  custom_points_cost INTEGER,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Atualizar tabela company_products
ALTER TABLE company_products 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS budget_id UUID REFERENCES budgets(id),
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS approved_by UUID;

-- 4. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_budgets_company_id ON budgets(company_id);
CREATE INDEX IF NOT EXISTS idx_budgets_status ON budgets(status);
CREATE INDEX IF NOT EXISTS idx_budgets_manager_id ON budgets(manager_id);
CREATE INDEX IF NOT EXISTS idx_budgets_created_at ON budgets(created_at);

CREATE INDEX IF NOT EXISTS idx_budget_items_budget_id ON budget_items(budget_id);
CREATE INDEX IF NOT EXISTS idx_budget_items_base_product_id ON budget_items(base_product_id);

CREATE INDEX IF NOT EXISTS idx_company_products_budget_id ON company_products(budget_id);
CREATE INDEX IF NOT EXISTS idx_company_products_is_active ON company_products(is_active);

-- 5. Criar função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 6. Criar triggers para updated_at
DROP TRIGGER IF EXISTS update_budgets_updated_at ON budgets;
CREATE TRIGGER update_budgets_updated_at 
    BEFORE UPDATE ON budgets 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_budget_items_updated_at ON budget_items;
CREATE TRIGGER update_budget_items_updated_at 
    BEFORE UPDATE ON budget_items 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 7. Criar funções auxiliares
CREATE OR REPLACE FUNCTION is_budget_approved(budget_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM budgets 
        WHERE id = budget_uuid AND status = 'approved'
    );
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION can_replicate_product(company_uuid UUID, base_product_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM budgets b
        WHERE b.company_id = company_uuid 
        AND b.status = 'approved'
        AND EXISTS (
            SELECT 1 FROM budget_items bi
            WHERE bi.budget_id = b.id 
            AND bi.base_product_id = base_product_uuid
        )
    );
END;
$$ LANGUAGE plpgsql;

-- 8. Habilitar RLS (Row Level Security)
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_items ENABLE ROW LEVEL SECURITY;

-- 9. Criar políticas RLS para budgets
CREATE POLICY "Gestores podem ver seus próprios orçamentos" ON budgets
  FOR SELECT USING (auth.jwt() ->> 'company_id' = company_id::text);

CREATE POLICY "Gestores podem criar orçamentos" ON budgets
  FOR INSERT WITH CHECK (auth.jwt() ->> 'company_id' = company_id::text);

CREATE POLICY "Admins podem ver todos os orçamentos" ON budgets
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admins podem atualizar orçamentos" ON budgets
  FOR UPDATE USING (auth.jwt() ->> 'role' = 'admin');

-- 10. Criar políticas RLS para budget_items
CREATE POLICY "Gestores podem ver itens de seus orçamentos" ON budget_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM budgets b 
      WHERE b.id = budget_id 
      AND b.company_id::text = auth.jwt() ->> 'company_id'
    )
  );

CREATE POLICY "Gestores podem criar itens" ON budget_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM budgets b 
      WHERE b.id = budget_id 
      AND b.company_id::text = auth.jwt() ->> 'company_id'
    )
  );

CREATE POLICY "Admins podem gerenciar todos os itens" ON budget_items
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- 11. Inserir dados de exemplo (opcional)
INSERT INTO budgets (company_id, manager_id, title, description, total_amount, status, admin_notes, submitted_at, reviewed_at, reviewed_by) VALUES
('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Orçamento Exemplo', 'Orçamento criado automaticamente para demonstração do sistema', 1000.00, 'approved', 'Aprovado para demonstração do sistema', NOW(), NOW(), '00000000-0000-0000-0000-000000000001')
ON CONFLICT DO NOTHING;

-- 12. Verificar se existem produtos base para criar itens de exemplo
DO $$
DECLARE
    budget_id UUID;
    base_product_id UUID;
BEGIN
    -- Pegar o ID do orçamento de exemplo
    SELECT id INTO budget_id FROM budgets WHERE title = 'Orçamento Exemplo' LIMIT 1;
    
    -- Pegar o primeiro produto base disponível
    SELECT id INTO base_product_id FROM base_products WHERE status = 'active' LIMIT 1;
    
    -- Se ambos existirem, criar item de exemplo
    IF budget_id IS NOT NULL AND base_product_id IS NOT NULL THEN
        INSERT INTO budget_items (budget_id, base_product_id, quantity, custom_price, custom_points_cost, notes)
        VALUES (budget_id, base_product_id, 10, 100.00, 100, 'Item de exemplo para demonstração')
        ON CONFLICT DO NOTHING;
    END IF;
END $$;

-- 13. Verificar criação das tabelas
SELECT 
    'budgets' as table_name,
    COUNT(*) as record_count
FROM budgets
UNION ALL
SELECT 
    'budget_items' as table_name,
    COUNT(*) as record_count
FROM budget_items
UNION ALL
SELECT 
    'company_products' as table_name,
    COUNT(*) as record_count
FROM company_products;
```

2. Clique no botão **"Run"** ou **"Executar"** (ícone de play ▶️)

### 4. Verificar a Criação
1. No menu lateral, clique em **"Table Editor"**
2. Verifique se as tabelas foram criadas:
   - `budgets`
   - `budget_items`
3. Verifique se a tabela `company_products` foi atualizada

### 5. Testar o Sistema
1. Execute o script de teste:
   ```bash
   node test-budget-apis.js
   ```

---

## 🎯 URLs Importantes

- **Supabase Studio Local**: http://127.0.0.1:54323
- **API Local**: http://127.0.0.1:54321
- **Sua aplicação**: http://localhost:3000

---

## ✅ O que foi criado:

### Tabelas:
- **`budgets`** - Armazena os orçamentos
- **`budget_items`** - Armazena os itens de cada orçamento
- **`company_products`** - Atualizada com colunas de orçamento

### Funcionalidades:
- **Índices** para performance
- **Triggers** para atualizar timestamps
- **Funções auxiliares** para validação
- **Políticas RLS** para segurança
- **Dados de exemplo** para teste

---

## 🧪 Como testar:

```bash
# Verificar se as tabelas foram criadas
node simple-check.js

# Testar o sistema completo
node test-budget-apis.js
```

---

## 🚀 Próximos Passos:

1. **Criar as tabelas** seguindo o guia acima
2. **Testar o sistema** com os scripts
3. **Implementar interfaces** no frontend
4. **Usar as APIs** no seu projeto

---

**Status**: ✅ Sistema pronto, ⚠️ Tabelas precisam ser criadas  
**Versão**: v2.2.0  
**Data**: Janeiro 2025
