-- Sistema de pontos simplificado

-- 1. Tabela de transações de pontos
create table if not exists point_transactions (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null,
  user_id uuid not null,
  type text not null check (type in ('earn','spend','reversal')),
  points integer not null,
  source text not null,
  order_id uuid null,
  note text,
  created_at timestamptz not null default now()
);

-- 2. Índices (serão criados após a tabela existir)

-- 3. View de saldo de pontos (será criada após a tabela existir)

-- 4. Tabela de pagamentos
create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null,
  order_id uuid not null,
  provider text not null default 'stripe',
  amount numeric(10,2) not null,
  currency text not null,
  stripe_session_id text,
  stripe_payment_intent_id text,
  stripe_account_region text check (stripe_account_region in ('BR','US')),
  status text not null check (status in ('pending','completed','failed','canceled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 5. Índices para payments
create index if not exists idx_payments_company_order on payments(company_id, order_id);

-- 6. Adicionar campos nas tabelas existentes
alter table orders add column if not exists currency text default 'BRL';
alter table orders add column if not exists points_used integer default 0;
alter table orders add column if not exists discount_points_money numeric(10,2) default 0;
alter table orders add column if not exists amount_due_money numeric(10,2) default 0;
alter table orders add column if not exists payment_kind text default 'money' check (payment_kind in ('points','money','mixed'));
alter table orders add column if not exists idempotency_key text;

-- 7. Índice para idempotency
create unique index if not exists idx_orders_idempotency on orders(idempotency_key) where idempotency_key is not null;

-- 8. Adicionar campo committed no inventory
alter table inventory add column if not exists committed integer not null default 0;
