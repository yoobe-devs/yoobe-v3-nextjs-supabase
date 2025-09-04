# 🚀 **APLICAR MIGRATIONS DO SWAGTRACK - MÉTODO MANUAL FINAL**

## 📋 **Situação Atual**

- ✅ Supabase rodando em http://localhost:54323
- ✅ Arquivos de migration criados
- ❌ Migration antiga com erro (tabela "tenants" não existe)
- 🔧 **Solução:** Aplicar apenas as migrations do SwagTrack manualmente

## 🎯 **PASSO A PASSO DEFINITIVO**

### **1. Abrir Supabase Studio**

```bash
# Acesse no navegador:
http://localhost:54323
```

### **2. Navegar para SQL Editor**

1. Menu lateral → **"SQL Editor"**
2. Clique em **"New query"**

### **3. Executar Migration 1: Order Tracking Events**

Copie e cole o seguinte SQL:

```sql
-- Criar tabela de eventos de tracking de pedidos
CREATE TABLE IF NOT EXISTS order_tracking_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  status VARCHAR(50) NOT NULL,
  location VARCHAR(255),
  description TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_order_tracking_events_order_id ON order_tracking_events(order_id);
CREATE INDEX IF NOT EXISTS idx_order_tracking_events_timestamp ON order_tracking_events(timestamp);
CREATE INDEX IF NOT EXISTS idx_order_tracking_events_status ON order_tracking_events(status);

-- RLS (Row Level Security)
ALTER TABLE order_tracking_events ENABLE ROW LEVEL SECURITY;

-- Política para permitir leitura de eventos de tracking para usuários autenticados
CREATE POLICY "Users can view tracking events for their orders" ON order_tracking_events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_tracking_events.order_id
      AND (
        orders.user_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM users
          WHERE users.id = auth.uid()
          AND users.role IN ('admin', 'admin_global', 'superadmin', 'manager')
        )
      )
    )
  );

-- Política para permitir inserção de eventos de tracking para admins
CREATE POLICY "Admins can insert tracking events" ON order_tracking_events
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'admin_global', 'superadmin', 'manager')
    )
  );

-- Política para permitir atualização de eventos de tracking para admins
CREATE POLICY "Admins can update tracking events" ON order_tracking_events
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'admin_global', 'superadmin', 'manager')
    )
  );

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_order_tracking_events_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_order_tracking_events_updated_at
  BEFORE UPDATE ON order_tracking_events
  FOR EACH ROW
  EXECUTE FUNCTION update_order_tracking_events_updated_at();
```

4. Clique em **"Run"** para executar

### **4. Executar Migration 2: Deliveries**

Crie uma nova query e cole o seguinte SQL:

```sql
-- Criar tabela de entregas
CREATE TABLE IF NOT EXISTS deliveries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  delivery_method VARCHAR(50) NOT NULL,
  tracking_code VARCHAR(50) UNIQUE,
  recipient_name VARCHAR(255) NOT NULL,
  recipient_email VARCHAR(255) NOT NULL,
  recipient_phone VARCHAR(50),
  street_address VARCHAR(255) NOT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(50) NOT NULL,
  postal_code VARCHAR(20) NOT NULL,
  country VARCHAR(100) DEFAULT 'Brasil',
  notes TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  estimated_delivery TIMESTAMP WITH TIME ZONE,
  actual_delivery TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_deliveries_order_id ON deliveries(order_id);
CREATE INDEX IF NOT EXISTS idx_deliveries_tracking_code ON deliveries(tracking_code);
CREATE INDEX IF NOT EXISTS idx_deliveries_status ON deliveries(status);
CREATE INDEX IF NOT EXISTS idx_deliveries_created_at ON deliveries(created_at);

-- RLS (Row Level Security)
ALTER TABLE deliveries ENABLE ROW LEVEL SECURITY;

-- Política para permitir leitura de entregas para usuários autenticados
CREATE POLICY "Users can view deliveries for their orders" ON deliveries
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = deliveries.order_id
      AND (
        orders.user_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM users
          WHERE users.id = auth.uid()
          AND users.role IN ('admin', 'admin_global', 'superadmin', 'manager')
        )
      )
    )
  );

-- Política para permitir inserção de entregas para admins
CREATE POLICY "Admins can insert deliveries" ON deliveries
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'admin_global', 'superadmin', 'manager')
    )
  );

-- Política para permitir atualização de entregas para admins
CREATE POLICY "Admins can update deliveries" ON deliveries
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'admin_global', 'superadmin', 'manager')
    )
  );

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_deliveries_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_deliveries_updated_at
  BEFORE UPDATE ON deliveries
  FOR EACH ROW
  EXECUTE FUNCTION update_deliveries_updated_at();
```

5. Clique em **"Run"** para executar

### **5. Verificar Criação das Tabelas**

1. Menu lateral → **"Table Editor"**
2. Verificar se as tabelas foram criadas:
   - ✅ `order_tracking_events`
   - ✅ `deliveries`

### **6. Testar Funcionalidades**

Após aplicar as migrations, teste:

1. **Página de Tracking:**

   ```
   http://localhost:3001/tracking
   ```

2. **Verificar Status:**

   ```bash
   node check-migrations-status.js
   ```

3. **Testar Modais:**
   - Botão **"Editar"** - Modal de edição
   - Botão **"Atualizar Status"** - Modal de status
   - Botão **"Nova Entrega"** - Modal de entrega

## 🎯 **RESULTADO ESPERADO**

Após aplicar as migrations manualmente:

### **✅ Tabelas Criadas**

- `order_tracking_events` - Para eventos de tracking
- `deliveries` - Para gestão de entregas

### **✅ Funcionalidades Ativas**

- Página de busca de pedidos
- Página de detalhes com timeline
- Modais funcionais para edição, status e entrega
- APIs de tracking e entregas

### **✅ Segurança**

- RLS habilitado em ambas as tabelas
- Políticas de acesso configuradas
- Controle de permissões por role

## 🚨 **Troubleshooting**

### **Se as tabelas não forem criadas:**

1. Verifique se há erros no SQL Editor
2. Execute os comandos um por vez
3. Verifique se a tabela `orders` existe

### **Se os modais não funcionarem:**

1. Verifique o console do navegador
2. Teste as APIs diretamente
3. Verifique se as migrations foram aplicadas

### **Se houver erros de permissão:**

1. Verifique as políticas RLS
2. Teste com usuário admin/manager
3. Verifique se o usuário está autenticado

## 📞 **Suporte**

Se encontrar problemas:

1. Verifique os logs do Supabase Studio
2. Teste as APIs individualmente
3. Verifique se todas as migrations foram aplicadas
4. Consulte a documentação do Supabase

---

**🎉 Após aplicar as migrations manualmente, o SwagTrack estará completamente funcional!**
