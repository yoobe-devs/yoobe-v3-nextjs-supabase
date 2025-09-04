# 🚀 **INSTRUÇÕES PARA APLICAÇÃO DAS MIGRATIONS DO SWAGTRACK**

## 📋 **Pré-requisitos**
- Supabase local rodando
- Acesso ao Supabase Studio (http://localhost:54323)

## 🔧 **Aplicação Manual das Migrations**

### **1. Acessar Supabase Studio**
```bash
# Abrir no navegador
open http://localhost:54323
```

### **2. Executar SQL no Editor SQL - Migration 1: Tracking Events**

Copie e cole o seguinte SQL no editor SQL do Supabase Studio:

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

### **3. Executar SQL no Editor SQL - Migration 2: Deliveries**

Copie e cole o seguinte SQL no editor SQL do Supabase Studio:

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

### **4. Verificar Criação das Tabelas**

Após executar os SQLs, verifique se as tabelas foram criadas:

1. Vá para **Table Editor**
2. Procure por `order_tracking_events` e `deliveries`
3. Verifique se as tabelas existem com as colunas corretas

## 🎯 **Funcionalidades Implementadas**

### **✅ Modais Criados**
- **UpdateStatusModal** - Atualizar status do pedido
- **NewDeliveryModal** - Criar nova entrega
- **EditOrderModal** - Editar informações do pedido

### **✅ APIs Criadas**
- `POST /api/deliveries` - Criar nova entrega
- `GET /api/deliveries` - Listar entregas
- `POST /api/tracking/[orderId]` - Atualizar status (webhook)

### **✅ Botões Funcionais**
- **Editar** - Abre modal para editar pedido
- **Atualizar Status** - Abre modal para atualizar status
- **Nova Entrega** - Abre modal para criar nova entrega

### **✅ Recursos dos Modais**
- **Validação de campos** obrigatórios
- **Feedback visual** com toasts
- **Loading states** durante operações
- **Formulários responsivos** e intuitivos
- **Integração com APIs** existentes

## 🔄 **Fluxo de Uso dos Modais**

### **1. Modal de Edição**
- Edita informações do cliente
- Atualiza endereço de entrega
- Modifica valores e pontos
- Adiciona observações

### **2. Modal de Atualização de Status**
- Seleciona novo status
- Adiciona localização
- Inclui código de rastreamento
- Adiciona descrição do evento

### **3. Modal de Nova Entrega**
- Configura método de entrega
- Define destinatário
- Configura endereço
- Adiciona observações

## 🚀 **Próximos Passos**

1. ✅ Aplicar migrations manualmente
2. ✅ Testar modais de edição
3. ✅ Testar modal de atualização de status
4. ✅ Testar modal de nova entrega
5. ✅ Verificar integração com Cubbo
6. ✅ Testar com pedidos reais

## 📞 **Suporte**

Se encontrar problemas:
1. Verificar logs do Supabase
2. Verificar logs do Next.js
3. Testar APIs individualmente
4. Verificar permissões RLS
5. Verificar se as tabelas foram criadas corretamente
