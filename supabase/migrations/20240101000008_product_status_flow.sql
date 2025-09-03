-- Adicionar coluna de status de fluxo aos produtos base
ALTER TABLE base_products 
ADD COLUMN IF NOT EXISTS status_fluxo VARCHAR(50) DEFAULT 'disponivel' CHECK (status_fluxo IN ('orcamento_aprovado', 'em_producao', 'enviado_logistica', 'disponivel'));

-- Adicionar coluna de status de fluxo aos produtos da empresa
ALTER TABLE company_products 
ADD COLUMN IF NOT EXISTS status_fluxo VARCHAR(50) DEFAULT 'disponivel' CHECK (status_fluxo IN ('orcamento_aprovado', 'em_producao', 'enviado_logistica', 'disponivel'));

-- Adicionar colunas à tabela notifications se não existirem
DO $$ 
BEGIN
    -- Adicionar company_id se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'company_id') THEN
        ALTER TABLE notifications ADD COLUMN company_id UUID REFERENCES companies(id) ON DELETE CASCADE;
    END IF;
    
    -- Adicionar data se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'data') THEN
        ALTER TABLE notifications ADD COLUMN data JSONB DEFAULT '{}';
    END IF;
    
    -- Adicionar type se não existir (sem constraint inicialmente)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'type') THEN
        ALTER TABLE notifications ADD COLUMN type VARCHAR(50);
    END IF;
    
    -- Adicionar title se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'title') THEN
        ALTER TABLE notifications ADD COLUMN title VARCHAR(255);
    END IF;
    
    -- Adicionar message se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'message') THEN
        ALTER TABLE notifications ADD COLUMN message TEXT;
    END IF;
    
    -- Adicionar is_read se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'is_read') THEN
        ALTER TABLE notifications ADD COLUMN is_read BOOLEAN DEFAULT FALSE;
    END IF;
    
    -- Adicionar updated_at se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'updated_at') THEN
        ALTER TABLE notifications ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- Adicionar constraint check para type se não existir
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.check_constraints 
        WHERE constraint_name = 'notifications_type_check'
    ) THEN
        ALTER TABLE notifications ADD CONSTRAINT notifications_type_check 
        CHECK (type IN ('orcamento', 'pedido', 'resgate', 'estoque'));
    END IF;
END $$;

-- Criar índices para performance (apenas se não existirem)
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_company_id ON notifications(company_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);

-- Criar RLS policies para notificações
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Policy para usuários verem apenas suas notificações
DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;
CREATE POLICY "Users can view their own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

-- Policy para usuários marcarem suas notificações como lidas
DROP POLICY IF EXISTS "Users can update their own notifications" ON notifications;
CREATE POLICY "Users can update their own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- Policy para sistema criar notificações (service role)
DROP POLICY IF EXISTS "Service can create notifications" ON notifications;
CREATE POLICY "Service can create notifications" ON notifications
  FOR INSERT WITH CHECK (true);

-- Função para criar notificações automaticamente
CREATE OR REPLACE FUNCTION create_notification(
  p_user_id UUID,
  p_company_id UUID,
  p_type VARCHAR(50),
  p_title VARCHAR(255),
  p_message TEXT,
  p_data JSONB DEFAULT '{}'
) RETURNS UUID AS $$
DECLARE
  notification_id UUID;
BEGIN
  INSERT INTO notifications (user_id, company_id, type, title, message, data)
  VALUES (p_user_id, p_company_id, p_type, p_title, p_message, p_data)
  RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_notifications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_notifications_updated_at ON notifications;
CREATE TRIGGER trigger_update_notifications_updated_at
  BEFORE UPDATE ON notifications
  FOR EACH ROW
  EXECUTE FUNCTION update_notifications_updated_at();

-- Atualizar produtos existentes para ter status_fluxo
UPDATE base_products SET status_fluxo = 'disponivel' WHERE status_fluxo IS NULL;
UPDATE company_products SET status_fluxo = 'disponivel' WHERE status_fluxo IS NULL;
