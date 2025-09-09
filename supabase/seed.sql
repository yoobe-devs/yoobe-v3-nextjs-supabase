-- Seed data para o sistema Yoobe
-- Dados reais baseados nos mockados para experiência completa

-- Insert admin user in auth.users
INSERT INTO auth.users (
  id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, invited_at,
  confirmation_token, confirmation_sent_at, recovery_token, recovery_sent_at,
  email_change_token_new, email_change, email_change_sent_at, last_sign_in_at,
  raw_app_meta_data, raw_user_meta_data, is_super_admin, created_at, updated_at,
  phone, phone_confirmed_at, phone_change, phone_change_token, phone_change_sent_at,
  email_change_token_current, email_change_confirm_status, banned_until,
  reauthentication_token, reauthentication_sent_at
) VALUES (
  '550e8400-e29b-41d4-a716-446655440000', '00000000-0000-0000-0000-000000000000',
  'authenticated', 'authenticated', 'admin@yoobe.co', crypt('admin123', gen_salt('bf')),
  now(), now(), '', now(), '', now(), '', '', now(), now(),
  '{"provider": "email", "providers": ["email"]}', '{"name": "Administrador", "avatar_url": null}',
  true, now(), now(), null, null, '', '', null, '', 0, null, '', null
) ON CONFLICT (id) DO NOTHING;

-- Insert admin user in users table
INSERT INTO users (id, email, full_name, name, role, status) 
VALUES (
    '550e8400-e29b-41d4-a716-446655440000',
    'admin@yoobe.co',
    'Administrador',
    'Administrador',
    'admin',
    'active'
) ON CONFLICT (email) DO NOTHING;

-- Insert default company
INSERT INTO companies (id, name, email, phone, address, city, state, zip_code, status)
VALUES (
    '550e8400-e29b-41d4-a716-446655440001',
    'Yoobe',
    'admin@yoobe.co',
    '(41) 98760-7512',
    'Dês. Otavio Do Amaral, 1091, 203',
    'Curitiba',
    'PR',
    '80020-000',
    'active'
) ON CONFLICT (email) DO NOTHING;

-- Insert additional companies
INSERT INTO companies (id, name, email, phone, address, city, state, zip_code, status)
VALUES 
    ('550e8400-e29b-41d4-a716-446655440002', 'Join Tecnologia', 'contato@jointecnologia.com.br', '(11) 3000-0000', 'Av. Paulista, 1000', 'São Paulo', 'SP', '01310-100', 'active'),
    ('550e8400-e29b-41d4-a716-446655440003', 'TechCorp Solutions', 'contato@techcorp.com.br', '(11) 5000-0000', 'Rua Augusta, 500', 'São Paulo', 'SP', '01212-000', 'active'),
    ('550e8400-e29b-41d4-a716-446655440004', 'Inovação Digital', 'contato@inovacao.com.br', '(11) 6000-0000', 'Av. Brigadeiro Faria Lima, 2000', 'São Paulo', 'SP', '01452-002', 'active')
ON CONFLICT (email) DO NOTHING;

-- Insert real users based on mock data
INSERT INTO users (id, email, full_name, name, role, company_id, department, position, points_balance, status, avatar_url)
VALUES 
    ('550e8400-e29b-41d4-a716-446655440010', 'joao.silva@jointecnologia.com.br', 'João Silva', 'João Silva', 'user', '550e8400-e29b-41d4-a716-446655440002', 'TI', 'Desenvolvedor', 1250, 'active', 'https://ui-avatars.com/api/?name=João+Silva&background=1e40af&color=ffffff&size=128'),
    ('550e8400-e29b-41d4-a716-446655440011', 'maria.santos@jointecnologia.com.br', 'Maria Santos', 'Maria Santos', 'manager', '550e8400-e29b-41d4-a716-446655440002', 'Marketing', 'Analista', 2100, 'active', 'https://ui-avatars.com/api/?name=Maria+Santos&background=3b82f6&color=ffffff&size=128'),
    ('550e8400-e29b-41d4-a716-446655440012', 'pedro.costa@techcorp.com.br', 'Pedro Costa', 'Pedro Costa', 'user', '550e8400-e29b-41d4-a716-446655440003', 'Vendas', 'Vendedor', 800, 'active', 'https://ui-avatars.com/api/?name=Pedro+Costa&background=60a5fa&color=ffffff&size=128'),
    ('550e8400-e29b-41d4-a716-446655440013', 'ana.oliveira@inovacao.com.br', 'Ana Oliveira', 'Ana Oliveira', 'user', '550e8400-e29b-41d4-a716-446655440004', 'RH', 'Assistente', 0, 'inactive', 'https://ui-avatars.com/api/?name=Ana+Oliveira&background=1e40af&color=ffffff&size=128'),
    ('550e8400-e29b-41d4-a716-446655440014', 'carlos.ferreira@jointecnologia.com.br', 'Carlos Ferreira', 'Carlos Ferreira', 'manager', '550e8400-e29b-41d4-a716-446655440002', 'Administrativo', 'Gerente', 3000, 'active', 'https://ui-avatars.com/api/?name=Carlos+Ferreira&background=3b82f6&color=ffffff&size=128'),
    ('550e8400-e29b-41d4-a716-446655440015', 'julia.martins@techcorp.com.br', 'Júlia Martins', 'Júlia Martins', 'user', '550e8400-e29b-41d4-a716-446655440003', 'TI', 'Desenvolvedora', 1500, 'active', 'https://ui-avatars.com/api/?name=Júlia+Martins&background=7c3aed&color=ffffff&size=128'),
    ('550e8400-e29b-41d4-a716-446655440016', 'roberto.almeida@inovacao.com.br', 'Roberto Almeida', 'Roberto Almeida', 'admin', '550e8400-e29b-41d4-a716-446655440004', 'Diretoria', 'Diretor', 5000, 'active', 'https://ui-avatars.com/api/?name=Roberto+Almeida&background=059669&color=ffffff&size=128')
ON CONFLICT (email) DO NOTHING;

-- Categorias serão criadas pela migração de categorias

-- Insert company products (sem category_id por enquanto)
INSERT INTO company_products (id, name, description, price, points_cost, stock_quantity, image_url, company_id, status)
VALUES 
    ('550e8400-e29b-41d4-a716-446655440030', 'Camiseta Join Tecnologia', 'Camiseta oficial da Join Tecnologia com logo bordado', 49.90, 499, 50, 'https://via.placeholder.com/300x300/1e40af/ffffff?text=Camiseta+Join', '550e8400-e29b-41d4-a716-446655440002', 'active'),
    ('550e8400-e29b-41d4-a716-446655440031', 'Mochila Corporativa Join', 'Mochila para laptop com logo da empresa', 129.90, 1299, 25, 'https://via.placeholder.com/300x300/3b82f6/ffffff?text=Mochila+Join', '550e8400-e29b-41d4-a716-446655440002', 'active'),
    ('550e8400-e29b-41d4-a716-446655440032', 'Caneca Personalizada Join', 'Caneca de cerâmica com logo da Join', 29.90, 299, 100, 'https://via.placeholder.com/300x300/60a5fa/ffffff?text=Caneca+Join', '550e8400-e29b-41d4-a716-446655440002', 'active'),
    ('550e8400-e29b-41d4-a716-446655440033', 'Boné Join', 'Boné ajustável com logo bordado', 39.90, 399, 75, 'https://via.placeholder.com/300x300/1e40af/ffffff?text=Boné+Join', '550e8400-e29b-41d4-a716-446655440002', 'active'),
    ('550e8400-e29b-41d4-a716-446655440034', 'Garrafa Térmica Join', 'Garrafa de água térmica 500ml', 59.90, 599, 40, 'https://via.placeholder.com/300x300/3b82f6/ffffff?text=Garrafa+Join', '550e8400-e29b-41d4-a716-446655440002', 'active'),
    ('550e8400-e29b-41d4-a716-446655440035', 'Notebook Join', 'Caderno personalizado com capa dura', 19.90, 199, 200, 'https://via.placeholder.com/300x300/60a5fa/ffffff?text=Notebook+Join', '550e8400-e29b-41d4-a716-446655440002', 'active'),
    ('550e8400-e29b-41d4-a716-446655440036', 'Camiseta TechCorp', 'Camiseta oficial da TechCorp com logo bordado', 49.90, 499, 30, 'https://via.placeholder.com/300x300/7c3aed/ffffff?text=Camiseta+TechCorp', '550e8400-e29b-41d4-a716-446655440003', 'active'),
    ('550e8400-e29b-41d4-a716-446655440037', 'Boné TechCorp', 'Boné ajustável com logo bordado', 39.90, 399, 50, 'https://via.placeholder.com/300x300/8b5cf6/ffffff?text=Boné+TechCorp', '550e8400-e29b-41d4-a716-446655440003', 'active'),
    ('550e8400-e29b-41d4-a716-446655440038', 'Caneca TechCorp', 'Caneca de cerâmica com logo da TechCorp', 29.90, 299, 80, 'https://via.placeholder.com/300x300/a78bfa/ffffff?text=Caneca+TechCorp', '550e8400-e29b-41d4-a716-446655440003', 'active'),
    ('550e8400-e29b-41d4-a716-446655440039', 'Camiseta Inovação', 'Camiseta oficial da Inovação Digital', 49.90, 499, 20, 'https://via.placeholder.com/300x300/059669/ffffff?text=Camiseta+Inovação', '550e8400-e29b-41d4-a716-446655440004', 'active')
ON CONFLICT (id) DO NOTHING;

-- Insert stores
INSERT INTO stores (id, name, company_id, address, city, state, status)
VALUES 
    ('550e8400-e29b-41d4-a716-446655440040', 'Join Store', '550e8400-e29b-41d4-a716-446655440002', 'Av. Paulista, 1000', 'São Paulo', 'SP', 'active'),
    ('550e8400-e29b-41d4-a716-446655440041', 'TechCorp Store', '550e8400-e29b-41d4-a716-446655440003', 'Rua Augusta, 500', 'São Paulo', 'SP', 'active'),
    ('550e8400-e29b-41d4-a716-446655440042', 'Inovação Store', '550e8400-e29b-41d4-a716-446655440004', 'Av. Brigadeiro Faria Lima, 2000', 'São Paulo', 'SP', 'active')
ON CONFLICT (id) DO NOTHING;

-- Insert sample orders
INSERT INTO orders (id, user_id, company_id, total_amount, points_used, payment_method, status, shipping_address, tracking_code, order_number)
VALUES 
    ('550e8400-e29b-41d4-a716-446655440050', '550e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440002', 79.80, 798, 'mixed', 'delivered', 'Rua das Flores, 123 - São Paulo/SP', 'TRACK123456789', 'ORD-2024-001'),
    ('550e8400-e29b-41d4-a716-446655440051', '550e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440002', 129.90, 1299, 'points', 'shipped', 'Av. Paulista, 500 - São Paulo/SP', 'TRACK987654321', 'ORD-2024-002'),
    ('550e8400-e29b-41d4-a716-446655440052', '550e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440003', 39.90, 399, 'mixed', 'pending', 'Rua Augusta, 200 - São Paulo/SP', NULL, 'ORD-2024-003'),
    ('550e8400-e29b-41d4-a716-446655440053', '550e8400-e29b-41d4-a716-446655440014', '550e8400-e29b-41d4-a716-446655440002', 59.90, 599, 'points', 'confirmed', 'Av. Brigadeiro Faria Lima, 1500 - São Paulo/SP', NULL, 'ORD-2024-004'),
    ('550e8400-e29b-41d4-a716-446655440054', '550e8400-e29b-41d4-a716-446655440015', '550e8400-e29b-41d4-a716-446655440003', 29.90, 299, 'mixed', 'delivered', 'Rua Oscar Freire, 100 - São Paulo/SP', 'TRACK456789123', 'ORD-2024-005')
ON CONFLICT (id) DO NOTHING;

-- Insert order items
INSERT INTO order_items (id, order_id, product_id, quantity, unit_price, points_cost)
VALUES 
    ('550e8400-e29b-41d4-a716-446655440060', '550e8400-e29b-41d4-a716-446655440050', '550e8400-e29b-41d4-a716-446655440030', 1, 49.90, 499),
    ('550e8400-e29b-41d4-a716-446655440061', '550e8400-e29b-41d4-a716-446655440050', '550e8400-e29b-41d4-a716-446655440032', 1, 29.90, 299),
    ('550e8400-e29b-41d4-a716-446655440062', '550e8400-e29b-41d4-a716-446655440051', '550e8400-e29b-41d4-a716-446655440031', 1, 129.90, 1299),
    ('550e8400-e29b-41d4-a716-446655440063', '550e8400-e29b-41d4-a716-446655440052', '550e8400-e29b-41d4-a716-446655440037', 1, 39.90, 399),
    ('550e8400-e29b-41d4-a716-446655440064', '550e8400-e29b-41d4-a716-446655440053', '550e8400-e29b-41d4-a716-446655440034', 1, 59.90, 599),
    ('550e8400-e29b-41d4-a716-446655440065', '550e8400-e29b-41d4-a716-446655440054', '550e8400-e29b-41d4-a716-446655440038', 1, 29.90, 299)
ON CONFLICT (id) DO NOTHING;

-- Insert notifications
INSERT INTO notifications (id, user_id, company_id, type, title, message, data, is_read)
VALUES 
    ('550e8400-e29b-41d4-a716-446655440070', '550e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440002', 'pedido', 'Pedido Entregue', 'Seu pedido #ORD-001 foi entregue com sucesso!', '{"order_id": "550e8400-e29b-41d4-a716-446655440050"}', false),
    ('550e8400-e29b-41d4-a716-446655440071', '550e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440002', 'estoque', 'Novo Produto', 'Nova mochila corporativa disponível na loja!', '{"product_id": "550e8400-e29b-41d4-a716-446655440031"}', false),
    ('550e8400-e29b-41d4-a716-446655440072', '550e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440003', 'resgate', 'Pontos Expiram', 'Seus pontos expiram em 30 dias. Aproveite!', '{"points_balance": 800}', true),
    ('550e8400-e29b-41d4-a716-446655440073', '550e8400-e29b-41d4-a716-446655440014', '550e8400-e29b-41d4-a716-446655440002', 'pedido', 'Pedido Confirmado', 'Seu pedido #ORD-004 foi confirmado e está sendo preparado.', '{"order_id": "550e8400-e29b-41d4-a716-446655440053"}', false)
ON CONFLICT (id) DO NOTHING;

-- Insert points transactions
INSERT INTO points_transactions (id, user_id, company_id, type, amount, description, order_id)
VALUES 
    ('550e8400-e29b-41d4-a716-446655440080', '550e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440002', 'spent', 798, 'Compra de produtos', '550e8400-e29b-41d4-a716-446655440050'),
    ('550e8400-e29b-41d4-a716-446655440081', '550e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440002', 'spent', 1299, 'Compra de mochila', '550e8400-e29b-41d4-a716-446655440051'),
    ('550e8400-e29b-41d4-a716-446655440082', '550e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440003', 'spent', 399, 'Compra de boné', '550e8400-e29b-41d4-a716-446655440052'),
    ('550e8400-e29b-41d4-a716-446655440083', '550e8400-e29b-41d4-a716-446655440014', '550e8400-e29b-41d4-a716-446655440002', 'spent', 599, 'Compra de garrafa', '550e8400-e29b-41d4-a716-446655440053'),
    ('550e8400-e29b-41d4-a716-446655440084', '550e8400-e29b-41d4-a716-446655440015', '550e8400-e29b-41d4-a716-446655440003', 'spent', 299, 'Compra de caneca', '550e8400-e29b-41d4-a716-446655440054'),
    ('550e8400-e29b-41d4-a716-446655440085', '550e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440002', 'earned', 1000, 'Bônus mensal', NULL),
    ('550e8400-e29b-41d4-a716-446655440086', '550e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440002', 'earned', 1500, 'Bônus por performance', NULL),
    ('550e8400-e29b-41d4-a716-446655440087', '550e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440003', 'earned', 800, 'Bônus mensal', NULL)
ON CONFLICT (id) DO NOTHING;

-- Update admin user to belong to the company
UPDATE users 
SET company_id = '550e8400-e29b-41d4-a716-446655440001'
WHERE email = 'admin@yoobe.co';
