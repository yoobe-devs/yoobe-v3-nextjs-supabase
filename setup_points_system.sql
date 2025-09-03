-- Setup do sistema de pontos

-- View de saldo de pontos
create or replace view user_point_balances as
select company_id, user_id, coalesce(sum(points),0)::int as balance
from point_transactions
group by company_id, user_id;

-- Índices para point_transactions
create index if not exists idx_point_tx_company_user on point_transactions(company_id, user_id, created_at desc);

-- Função para reservar estoque
create or replace function fn_reserve_inventory(_product_id uuid, _qty int)
returns boolean language plpgsql as $$
begin
  update inventory
  set committed = committed + _qty
  where product_id = _product_id
    and (quantity - committed) >= _qty;

  return found;
end$$;

-- Liberar reserva
create or replace function fn_release_inventory(_product_id uuid, _qty int)
returns void language plpgsql as $$
begin
  update inventory
  set committed = greatest(committed - _qty, 0)
  where product_id = _product_id;
end$$;

-- Baixar estoque
create or replace function fn_ship_inventory(_product_id uuid, _qty int)
returns void language plpgsql as $$
begin
  update inventory
  set quantity = quantity - _qty,
      committed = greatest(committed - _qty, 0)
  where product_id = _product_id;
end$$;

-- Inserir dados de teste
INSERT INTO point_transactions (company_id, user_id, type, points, source, note) VALUES
('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440100', 'earn', 500, 'platform', 'Pontos iniciais'),
('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440100', 'earn', 200, 'gamification_api', 'Conquista: Primeira compra'),
('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440100', 'earn', 100, 'platform', 'Bônus semanal');

-- Atualizar estoque com dados de teste
UPDATE inventory SET committed = 0 WHERE committed IS NULL;
