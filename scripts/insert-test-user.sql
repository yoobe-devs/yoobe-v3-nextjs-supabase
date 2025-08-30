-- Script para inserir usuário de teste no Supabase
-- Este script deve ser executado no Supabase Studio ou via CLI

-- Inserir usuário de teste na tabela auth.users
INSERT INTO auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  invited_at,
  confirmation_token,
  confirmation_sent_at,
  recovery_token,
  recovery_sent_at,
  email_change_token_new,
  email_change,
  email_change_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  created_at,
  updated_at,
  phone,
  phone_confirmed_at,
  phone_change,
  phone_change_token,
  phone_change_sent_at,
  email_change_token_current,
  email_change_confirm_status,
  banned_until,
  reauthentication_token,
  reauthentication_sent_at
) VALUES (
  '550e8400-e29b-41d4-a716-446655440000',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'teste@yoobe.com',
  crypt('123456', gen_salt('bf')),
  now(),
  now(),
  '',
  now(),
  '',
  now(),
  '',
  '',
  now(),
  now(),
  '{"provider": "email", "providers": ["email"]}',
  '{"name": "Usuário Teste", "avatar_url": null}',
  false,
  now(),
  now(),
  null,
  null,
  '',
  '',
  null,
  '',
  0,
  null,
  '',
  null
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
  'user',
  now(),
  now()
);

-- Inserir dados de teste para produtos
INSERT INTO public.products (
  id,
  name,
  description,
  price,
  category_id,
  image_url,
  stock_quantity,
  is_active,
  created_at,
  updated_at
) VALUES 
  ('550e8400-e29b-41d4-a716-446655440001', 'Camiseta Yoobe', 'Camiseta personalizada da empresa', 50.00, 'clothing', 'https://via.placeholder.com/300x200', 100, true, now(), now()),
  ('550e8400-e29b-41d4-a716-446655440002', 'Caneca Personalizada', 'Caneca com logo da empresa', 25.00, 'accessories', 'https://via.placeholder.com/300x200', 50, true, now(), now()),
  ('550e8400-e29b-41d4-a716-446655440003', 'Mochila Corporativa', 'Mochila para laptop com logo', 120.00, 'bags', 'https://via.placeholder.com/300x200', 30, true, now(), now()),
  ('550e8400-e29b-41d4-a716-446655440004', 'Garrafa Térmica', 'Garrafa de água térmica', 35.00, 'accessories', 'https://via.placeholder.com/300x200', 75, true, now(), now()),
  ('550e8400-e29b-41d4-a716-446655440005', 'Notebook Personalizado', 'Caderno com capa personalizada', 15.00, 'stationery', 'https://via.placeholder.com/300x200', 200, true, now(), now());

-- Inserir categorias
INSERT INTO public.categories (
  id,
  name,
  description,
  created_at,
  updated_at
) VALUES 
  ('clothing', 'Vestuário', 'Roupas e acessórios de vestuário', now(), now()),
  ('accessories', 'Acessórios', 'Acessórios diversos', now(), now()),
  ('bags', 'Bolsas e Mochilas', 'Bolsas, mochilas e estojos', now(), now()),
  ('stationery', 'Papelaria', 'Produtos de papelaria', now(), now()),
  ('tech', 'Tecnologia', 'Produtos tecnológicos', now(), now());

-- Inserir pedidos de teste
INSERT INTO public.orders (
  id,
  user_id,
  status,
  total_amount,
  shipping_address,
  created_at,
  updated_at
) VALUES 
  ('550e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440000', 'pending', 75.00, 'Rua Teste, 123 - São Paulo, SP', now(), now()),
  ('550e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440000', 'completed', 120.00, 'Av. Principal, 456 - Rio de Janeiro, RJ', now(), now());

-- Inserir itens dos pedidos
INSERT INTO public.order_items (
  id,
  order_id,
  product_id,
  quantity,
  unit_price,
  created_at
) VALUES 
  ('550e8400-e29b-41d4-a716-446655440020', '550e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440001', 1, 50.00, now()),
  ('550e8400-e29b-41d4-a716-446655440021', '550e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440002', 1, 25.00, now()),
  ('550e8400-e29b-41d4-a716-446655440022', '550e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440003', 1, 120.00, now());


