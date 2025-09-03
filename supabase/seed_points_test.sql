-- Dados de teste para o sistema de pontos

-- Inserir algumas transações de pontos de teste
INSERT INTO point_transactions (company_id, user_id, type, points, source, note) VALUES
('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440100', 'earn', 500, 'platform', 'Pontos iniciais'),
('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440100', 'earn', 200, 'gamification_api', 'Conquista: Primeira compra'),
('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440100', 'earn', 100, 'platform', 'Bônus semanal');

-- Atualizar estoque com dados de teste
UPDATE inventory SET committed = 0 WHERE committed IS NULL;
