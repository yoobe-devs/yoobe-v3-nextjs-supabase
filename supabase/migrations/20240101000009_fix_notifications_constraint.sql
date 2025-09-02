-- Remover constraint problemática
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_type_check;

-- Recriar constraint corretamente
ALTER TABLE notifications ADD CONSTRAINT notifications_type_check 
CHECK (type IN ('orcamento', 'pedido', 'resgate', 'estoque'));

-- Verificar se há dados existentes que violam a constraint
UPDATE notifications SET type = 'orcamento' WHERE type NOT IN ('orcamento', 'pedido', 'resgate', 'estoque');
