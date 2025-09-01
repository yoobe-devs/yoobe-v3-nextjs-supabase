-- Script para criar dados de teste no Supabase

-- Inserir usuário de teste
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '550e8400-e29b-41d4-a716-446655440000',
  'teste@yoobe.com',
  crypt('123456', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider": "email", "providers": ["email"]}',
  '{"name": "Usuário Teste", "avatar_url": null}',
  false,
  '',
  '',
  '',
  ''
);

-- Inserir perfil do usuário
INSERT INTO public.profiles (
  id,
  email,
  full_name,
  avatar_url,
  role,
  created_at,
  updated_at
) VALUES (
  '550e8400-e29b-41d4-a716-446655440000',
  'teste@yoobe.com',
  'Usuário Teste',
  null,
  'admin',
  now(),
  now()
);

-- Inserir mais produtos de teste
INSERT INTO products (id, name, description, price, image_url, category_id, claim_methods, status, sku) VALUES
('550e8400-e29b-41d4-a716-446655440102', 'Camiseta Polo Azul', 'Camiseta polo azul com logo bordado', 89.90, '/placeholder.svg?height=200&width=200', '550e8400-e29b-41d4-a716-446655440001', ARRAY['points'::claim_method, 'credit_card'::claim_method], 'active', 'CAM-002'),
('550e8400-e29b-41d4-a716-446655440103', 'Mochila Executiva', 'Mochila executiva com compartimento para laptop', 199.90, '/placeholder.svg?height=200&width=200', '550e8400-e29b-41d4-a716-446655440004', ARRAY['points'::claim_method, 'credit_card'::claim_method, 'pix'::claim_method], 'active', 'MOC-001'),
('550e8400-e29b-41d4-a716-446655440104', 'Garrafa Térmica', 'Garrafa térmica de 500ml com logo personalizado', 79.90, '/placeholder.svg?height=200&width=200', '550e8400-e29b-41d4-a716-446655440003', ARRAY['points'::claim_method, 'pix'::claim_method], 'active', 'GAR-001'),
('550e8400-e29b-41d4-a716-446655440105', 'Mouse Sem Fio', 'Mouse sem fio ergonômico com logo', 129.90, '/placeholder.svg?height=200&width=200', '550e8400-e29b-41d4-a716-446655440004', ARRAY['points'::claim_method, 'credit_card'::claim_method], 'active', 'MOU-001');

-- Inserir mais categorias
INSERT INTO categories (id, name, description) VALUES
('550e8400-e29b-41d4-a716-446655440005', 'Tecnologia', 'Produtos tecnológicos e eletrônicos'),
('550e8400-e29b-41d4-a716-446655440006', 'Escritório', 'Produtos para escritório e trabalho'),
('550e8400-e29b-41d4-a716-446655440007', 'Esporte', 'Produtos esportivos e fitness');

-- Inserir estoque para os novos produtos
INSERT INTO inventory (product_id, quantity, min_quantity, max_quantity)
SELECT id, 150, 20, 1000 FROM products WHERE id IN (
  '550e8400-e29b-41d4-a716-446655440102',
  '550e8400-e29b-41d4-a716-446655440103',
  '550e8400-e29b-41d4-a716-446655440104',
  '550e8400-e29b-41d4-a716-446655440105'
);

-- Inserir pedidos de teste
INSERT INTO orders (id, user_id, status, total_amount, shipping_address, created_at, updated_at) VALUES
('550e8400-e29b-41d4-a716-446655440201', '550e8400-e29b-41d4-a716-446655440000', 'completed', 179.80, 'Rua das Flores, 123 - São Paulo, SP', now() - interval '5 days', now() - interval '5 days'),
('550e8400-e29b-41d4-a716-446655440202', '550e8400-e29b-41d4-a716-446655440000', 'processing', 329.80, 'Av. Paulista, 1000 - São Paulo, SP', now() - interval '2 days', now() - interval '2 days'),
('550e8400-e29b-41d4-a716-446655440203', '550e8400-e29b-41d4-a716-446655440000', 'pending', 89.90, 'Rua Augusta, 500 - São Paulo, SP', now() - interval '1 day', now() - interval '1 day');

-- Inserir itens dos pedidos
INSERT INTO order_items (order_id, product_id, quantity, unit_price, total_price) VALUES
('550e8400-e29b-41d4-a716-446655440201', '550e8400-e29b-41d4-a716-446655440101', 2, 89.90, 179.80),
('550e8400-e29b-41d4-a716-446655440202', '550e8400-e29b-41d4-a716-446655440103', 1, 199.90, 199.90),
('550e8400-e29b-41d4-a716-446655440202', '550e8400-e29b-41d4-a716-446655440104', 1, 79.90, 79.90),
('550e8400-e29b-41d4-a716-446655440202', '550e8400-e29b-41d4-a716-446655440105', 1, 129.90, 129.90),
('550e8400-e29b-41d4-a716-446655440203', '550e8400-e29b-41d4-a716-446655440102', 1, 89.90, 89.90);

-- Inserir campanhas de teste
INSERT INTO campaigns (id, name, description, start_date, end_date, status, budget, created_at, updated_at) VALUES
('550e8400-e29b-41d4-a716-446655440301', 'Campanha de Verão', 'Promoção de produtos para o verão', now(), now() + interval '30 days', 'active', 5000.00, now(), now()),
('550e8400-e29b-41d4-a716-446655440302', 'Campanha Corporativa', 'Produtos para empresas', now() - interval '15 days', now() + interval '45 days', 'active', 10000.00, now(), now());

-- Inserir kits de teste
INSERT INTO kits (id, name, description, total_value, created_at, updated_at) VALUES
('550e8400-e29b-41d4-a716-446655440401', 'Kit Executivo', 'Kit completo para executivos', 399.70, now(), now()),
('550e8400-e29b-41d4-a716-446655440402', 'Kit Tecnologia', 'Produtos tecnológicos', 259.80, now(), now());

-- Inserir pontos do usuário
INSERT INTO user_points (user_id, points_balance, total_earned, total_spent, created_at, updated_at) VALUES
('550e8400-e29b-41d4-a716-446655440000', 2500, 5000, 2500, now(), now());

-- Inserir transações de pontos
INSERT INTO point_transactions (user_id, transaction_type, points_amount, description, reference_id, created_at) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'earned', 1000, 'Bônus de boas-vindas', null, now() - interval '30 days'),
('550e8400-e29b-41d4-a716-446655440000', 'earned', 1500, 'Compra de produtos', '550e8400-e29b-41d4-a716-446655440201', now() - interval '5 days'),
('550e8400-e29b-41d4-a716-446655440000', 'spent', -500, 'Resgate de produto', '550e8400-e29b-41d4-a716-446655440202', now() - interval '2 days'),
('550e8400-e29b-41d4-a716-446655440000', 'earned', 500, 'Atividade diária', null, now() - interval '1 day');

-- Inserir configurações da loja
INSERT INTO store_configs (id, store_name, store_description, logo_url, primary_color, secondary_color, currency, language, timezone, created_at, updated_at) VALUES
('550e8400-e29b-41d4-a716-446655440501', 'Yoobe Store', 'Loja oficial da Yoobe', '/logo.png', '#2563eb', '#1e40af', 'BRL', 'pt-BR', 'America/Sao_Paulo', now(), now());

-- Inserir promoções
INSERT INTO promotions (id, name, description, discount_type, discount_value, min_purchase, max_discount, start_date, end_date, is_active, created_at, updated_at) VALUES
('550e8400-e29b-41d4-a716-446655440601', 'Desconto de 10%', 'Desconto de 10% em compras acima de R$ 100', 'percentage', 10.00, 100.00, 50.00, now(), now() + interval '30 days', true, now(), now()),
('550e8400-e29b-41d4-a716-446655440602', 'Frete Grátis', 'Frete grátis para compras acima de R$ 200', 'shipping', 0.00, 200.00, 0.00, now(), now() + interval '60 days', true, now(), now());

-- Inserir cupons
INSERT INTO coupons (id, code, description, discount_type, discount_value, min_purchase, max_uses, current_uses, start_date, end_date, is_active, created_at, updated_at) VALUES
('550e8400-e29b-41d4-a716-446655440701', 'WELCOME10', 'Cupom de boas-vindas - 10% de desconto', 'percentage', 10.00, 50.00, 100, 25, now(), now() + interval '90 days', true, now(), now()),
('550e8400-e29b-41d4-a716-446655440702', 'FREEGIFT', 'Cupom para presente grátis', 'fixed', 50.00, 100.00, 50, 10, now(), now() + interval '45 days', true, now(), now());


