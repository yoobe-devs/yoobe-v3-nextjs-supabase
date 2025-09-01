-- Dados de teste para o sistema do Gestor

-- Inserir funcionários de teste
INSERT INTO employees (id, name, email, role, department, status, points_balance, avatar_url, created_at, last_login) VALUES
('emp-001', 'João Silva', 'joao.silva@empresa.com', 'manager', 'TI', 'active', 1500, 'https://via.placeholder.com/150/1e40af/ffffff?text=JS', NOW(), NOW()),
('emp-002', 'Maria Santos', 'maria.santos@empresa.com', 'user', 'RH', 'active', 800, 'https://via.placeholder.com/150/3b82f6/ffffff?text=MS', NOW(), NOW()),
('emp-003', 'Pedro Costa', 'pedro.costa@empresa.com', 'user', 'Vendas', 'active', 1200, 'https://via.placeholder.com/150/60a5fa/ffffff?text=PC', NOW(), NOW()),
('emp-004', 'Ana Oliveira', 'ana.oliveira@empresa.com', 'user', 'Marketing', 'inactive', 0, 'https://via.placeholder.com/150/93c5fd/ffffff?text=AO', NOW(), NOW());

-- Inserir produtos da empresa
INSERT INTO company_products (id, name, description, price, points_cost, category, status, stock, image_url, company_id, created_at) VALUES
('prod-001', 'Camiseta Corporativa', 'Camiseta 100% algodão com logo da empresa', 89.90, 150, 'Vestuário', 'active', 50, 'https://via.placeholder.com/300/1e40af/ffffff?text=Camiseta', '550e8400-e29b-41d4-a716-446655440001', NOW()),
('prod-002', 'Caneca Personalizada', 'Caneca de cerâmica com design exclusivo', 45.00, 75, 'Acessórios', 'active', 100, 'https://via.placeholder.com/300/3b82f6/ffffff?text=Caneca', '550e8400-e29b-41d4-a716-446655440001', NOW()),
('prod-003', 'Mochila Corporativa', 'Mochila resistente com compartimentos organizados', 199.90, 300, 'Acessórios', 'active', 25, 'https://via.placeholder.com/300/60a5fa/ffffff?text=Mochila', '550e8400-e29b-41d4-a716-446655440001', NOW()),
('prod-004', 'Garrafa Térmica', 'Garrafa térmica de 500ml com logo', 79.90, 120, 'Acessórios', 'out_of_stock', 0, 'https://via.placeholder.com/300/93c5fd/ffffff?text=Garrafa', '550e8400-e29b-41d4-a716-446655440001', NOW());

-- Inserir pedidos da empresa
INSERT INTO company_orders (id, order_number, employee_id, employee_name, employee_email, total_amount, points_used, status, created_at, updated_at) VALUES
('order-001', 'EMP-2024-001', 'emp-001', 'João Silva', 'joao.silva@empresa.com', 134.90, 225, 'delivered', NOW() - INTERVAL '5 days', NOW() - INTERVAL '3 days'),
('order-002', 'EMP-2024-002', 'emp-002', 'Maria Santos', 'maria.santos@empresa.com', 45.00, 75, 'shipped', NOW() - INTERVAL '3 days', NOW() - INTERVAL '1 day'),
('order-003', 'EMP-2024-003', 'emp-003', 'Pedro Costa', 'pedro.costa@empresa.com', 199.90, 300, 'processing', NOW() - INTERVAL '1 day', NOW()),
('order-004', 'EMP-2024-004', 'emp-001', 'João Silva', 'joao.silva@empresa.com', 89.90, 150, 'pending', NOW(), NOW());

-- Inserir itens dos pedidos
INSERT INTO company_order_items (id, order_id, product_id, product_name, quantity, unit_price, total_price) VALUES
('item-001', 'order-001', 'prod-001', 'Camiseta Corporativa', 1, 89.90, 89.90),
('item-002', 'order-001', 'prod-002', 'Caneca Personalizada', 1, 45.00, 45.00),
('item-003', 'order-002', 'prod-002', 'Caneca Personalizada', 1, 45.00, 45.00),
('item-004', 'order-003', 'prod-003', 'Mochila Corporativa', 1, 199.90, 199.90),
('item-005', 'order-004', 'prod-001', 'Camiseta Corporativa', 1, 89.90, 89.90);

-- Inserir configuração da empresa
INSERT INTO company_config (id, name, logo_url, primary_color, points_system_enabled, max_points_per_month, auto_approve_orders, notification_email, created_at, updated_at) VALUES
('config-001', 'Minha Empresa', 'https://via.placeholder.com/200/1e40af/ffffff?text=LOGO', '#1e40af', true, 1000, false, 'admin@empresa.com', NOW(), NOW());

-- Inserir transações de pontos
INSERT INTO point_transactions (company_id, user_id, type, points, source, note) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'emp-001', 'earn', 500, 'platform', 'Pontos iniciais'),
('550e8400-e29b-41d4-a716-446655440001', 'emp-001', 'earn', 200, 'gamification_api', 'Conquista: Primeira compra'),
('550e8400-e29b-41d4-a716-446655440001', 'emp-001', 'earn', 100, 'platform', 'Bônus semanal'),
('550e8400-e29b-41d4-a716-446655440001', 'emp-001', 'spend', -225, 'order', 'Compra: Camiseta + Caneca'),
('550e8400-e29b-41d4-a716-446655440001', 'emp-001', 'spend', -150, 'order', 'Compra: Camiseta'),
('550e8400-e29b-41d4-a716-446655440001', 'emp-002', 'earn', 300, 'platform', 'Pontos iniciais'),
('550e8400-e29b-41d4-a716-446655440001', 'emp-002', 'earn', 150, 'gamification_api', 'Conquista: Login diário'),
('550e8400-e29b-41d4-a716-446655440001', 'emp-002', 'spend', -75, 'order', 'Compra: Caneca'),
('550e8400-e29b-41d4-a716-446655440001', 'emp-003', 'earn', 400, 'platform', 'Pontos iniciais'),
('550e8400-e29b-41d4-a716-446655440001', 'emp-003', 'earn', 300, 'gamification_api', 'Conquista: Primeira semana'),
('550e8400-e29b-41d4-a716-446655440001', 'emp-003', 'spend', -300, 'order', 'Compra: Mochila');
