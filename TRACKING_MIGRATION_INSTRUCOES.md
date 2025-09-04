# 🚀 **INSTRUÇÕES PARA APLICAÇÃO DA MIGRATION DE TRACKING**

## 📋 **Pré-requisitos**
- Supabase local rodando
- Acesso ao Supabase Studio (http://localhost:54323)

## 🔧 **Aplicação Manual da Migration**

### **1. Acessar Supabase Studio**
```bash
# Abrir no navegador
open http://localhost:54323
```

### **2. Executar SQL no Editor SQL**

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

### **3. Verificar Criação da Tabela**

Após executar o SQL, verifique se a tabela foi criada:

1. Vá para **Table Editor**
2. Procure por `order_tracking_events`
3. Verifique se a tabela existe com as colunas corretas

### **4. Testar a Funcionalidade**

#### **Teste 1: Página de Busca**
```bash
# Acessar no navegador
http://localhost:3001/tracking
```

#### **Teste 2: API de Tracking**
```bash
# Testar API diretamente
curl http://localhost:3001/api/tracking/test-order-id
```

#### **Teste 3: Busca de Pedidos**
```bash
# Testar busca por número
curl "http://localhost:3001/api/orders/search?order_number=ORD-123"
```

## 🎯 **Funcionalidades Implementadas**

### **✅ Páginas Criadas**
- `/tracking` - Página de busca de pedidos
- `/tracking/[orderId]` - Página de detalhes do tracking

### **✅ APIs Criadas**
- `GET /api/tracking/[orderId]` - Buscar detalhes do pedido
- `POST /api/tracking/[orderId]` - Atualizar status (webhook)
- `GET /api/orders/search` - Buscar pedidos por número/email

### **✅ Integração Cubbo**
- Busca automática de tracking na Cubbo
- Sincronização de eventos de rastreamento
- Link direto para tracking no site da Cubbo

### **✅ Recursos da Página de Tracking**
- Timeline visual dos eventos
- Status atual do pedido
- Informações do cliente e endereço
- Lista de produtos
- Integração com Cubbo
- Atualização em tempo real

## 🔄 **Fluxo de Tracking**

1. **Cliente acessa** `/tracking`
2. **Digite o número** do pedido
3. **Sistema busca** o pedido no banco
4. **Redireciona** para `/tracking/[orderId]`
5. **Exibe timeline** com eventos
6. **Integra com Cubbo** se disponível
7. **Atualiza em tempo real**

## 🚀 **Próximos Passos**

1. ✅ Aplicar migration manualmente
2. ✅ Testar páginas de tracking
3. ✅ Verificar integração com Cubbo
4. ✅ Testar com pedidos reais
5. ✅ Implementar webhooks da Cubbo

## 📞 **Suporte**

Se encontrar problemas:
1. Verificar logs do Supabase
2. Verificar logs do Next.js
3. Testar APIs individualmente
4. Verificar permissões RLS
