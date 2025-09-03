-- Quotes, Replication, RBAC, Invitations System
-- safe to re-run: use IF NOT EXISTS and DO blocks

-- 0) helpers ---------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'set_updated_at') THEN
    CREATE OR REPLACE FUNCTION public.set_updated_at() RETURNS trigger AS $$
    BEGIN NEW.updated_at = now(); RETURN NEW; END; $$ LANGUAGE plpgsql;
  END IF;
END $$;

-- 1) Types/Enums ----------------------------------------------------------
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE user_role AS ENUM ('superadmin','admin_gestor','gestor','funcionario');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'record_status') THEN
    CREATE TYPE record_status AS ENUM ('active','inactive');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'invitation_status') THEN
    CREATE TYPE invitation_status AS ENUM ('pending','accepted','expired');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_method') THEN
    CREATE TYPE payment_method AS ENUM ('points','credit_card','pix','debit','boleto','donation');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'order_status') THEN
    CREATE TYPE order_status AS ENUM ('pending','approved','shipped','delivered','cancelled');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'quote_status') THEN
    CREATE TYPE quote_status AS ENUM ('draft','sent','approved','rejected','expired','paid');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'replication_status') THEN
    CREATE TYPE replication_status AS ENUM ('queued','processing','completed','failed');
  END IF;
END $$;

-- 2) Tables ---------------------------------------------------------------
-- Companies (tenant)
CREATE TABLE IF NOT EXISTS public.companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  tax_id text,
  created_at timestamptz DEFAULT now()
);

-- Users (extend existing profiles if needed)
CREATE TABLE IF NOT EXISTS public.users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  name text,
  surname text,
  phone text,
  tax_id text,
  fiscal_regime text,
  role user_role NOT NULL DEFAULT 'funcionario',
  status record_status NOT NULL DEFAULT 'active',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- User <-> Company (multi-empresa)
CREATE TABLE IF NOT EXISTS public.user_company_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  role user_role NOT NULL,
  UNIQUE (user_id, company_id, role)
);

-- Addresses
CREATE TABLE IF NOT EXISTS public.addresses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  street text, 
  number text, 
  neighborhood text,
  city text, 
  state text, 
  country text, 
  zip_code text,
  is_default boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Invitations
CREATE TABLE IF NOT EXISTS public.user_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  company_id uuid REFERENCES public.companies(id) ON DELETE SET NULL,
  status invitation_status NOT NULL DEFAULT 'pending',
  invited_by uuid REFERENCES public.users(id) ON DELETE SET NULL,
  token text UNIQUE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Products (catálogo base - referência)
CREATE TABLE IF NOT EXISTS public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sku text UNIQUE NOT NULL,
  name text NOT NULL,
  description text,
  points int DEFAULT 0,
  price numeric(12,2) DEFAULT 0,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Wallet and transactions
CREATE TABLE IF NOT EXISTS public.wallets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  balance int NOT NULL DEFAULT 0,
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.wallet_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id uuid NOT NULL REFERENCES public.wallets(id) ON DELETE CASCADE,
  delta int NOT NULL, -- positivo crédito / negativo débito
  reason text,
  related_order_id uuid,
  created_at timestamptz DEFAULT now()
);

-- Quotes and items
CREATE TABLE IF NOT EXISTS public.quotes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  requested_by uuid NOT NULL REFERENCES public.users(id),
  status quote_status NOT NULL DEFAULT 'draft',
  subtotal numeric(12,2) DEFAULT 0,
  discount numeric(12,2) DEFAULT 0,
  total numeric(12,2) DEFAULT 0,
  notes text,
  approved_by uuid REFERENCES public.users(id),
  approved_at timestamptz,
  paid_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.quote_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id uuid NOT NULL REFERENCES public.quotes(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.products(id),
  quantity int NOT NULL CHECK (quantity > 0),
  unit_price numeric(12,2) NOT NULL DEFAULT 0,
  total numeric(12,2) NOT NULL DEFAULT 0
);

-- Redemptions (pedidos/resgates)
CREATE TABLE IF NOT EXISTS public.redemptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id),
  product_id uuid NOT NULL REFERENCES public.products(id),
  payment_method payment_method NOT NULL,
  amount numeric(12,2) NOT NULL DEFAULT 0,
  address_id uuid REFERENCES public.addresses(id),
  status order_status NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

-- Payments (genérico + mock)
CREATE TABLE IF NOT EXISTS public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id uuid REFERENCES public.quotes(id) ON DELETE CASCADE,
  redemption_id uuid REFERENCES public.redemptions(id) ON DELETE CASCADE,
  method payment_method NOT NULL,
  provider text, -- ex: stripe, pagarme, pix
  external_id text,
  status text NOT NULL DEFAULT 'pending', -- pending|paid|failed
  amount numeric(12,2) NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Product replications (após pagamento do orçamento)
CREATE TABLE IF NOT EXISTS public.product_replications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id uuid NOT NULL REFERENCES public.quotes(id) ON DELETE CASCADE,
  company_id uuid NOT NULL REFERENCES public.companies(id),
  status replication_status NOT NULL DEFAULT 'queued',
  error text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 3) Triggers -------------------------------------------------------------
-- Ensure single default address per user
CREATE OR REPLACE FUNCTION ensure_single_default_address()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.is_default THEN
    UPDATE addresses SET is_default = false WHERE user_id = NEW.user_id AND id <> NEW.id;
  END IF;
  RETURN NEW;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_single_default_address') THEN
    CREATE TRIGGER trg_single_default_address
    BEFORE INSERT OR UPDATE ON public.addresses
    FOR EACH ROW EXECUTE FUNCTION ensure_single_default_address();
  END IF;
END $$;

-- Update timestamps
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'tg_users_updated_at') THEN
    CREATE TRIGGER tg_users_updated_at BEFORE UPDATE ON public.users
      FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'tg_quotes_updated_at') THEN
    CREATE TRIGGER tg_quotes_updated_at BEFORE UPDATE ON public.quotes
      FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'tg_payments_updated_at') THEN
    CREATE TRIGGER tg_payments_updated_at BEFORE UPDATE ON public.payments
      FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'tg_replications_updated_at') THEN
    CREATE TRIGGER tg_replications_updated_at BEFORE UPDATE ON public.product_replications
      FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'tg_invitations_updated_at') THEN
    CREATE TRIGGER tg_invitations_updated_at BEFORE UPDATE ON public.user_invitations
      FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  END IF;
END $$;

-- 4) Indexes --------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_addresses_user ON public.addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_user_company ON public.user_company_roles(user_id, company_id);
CREATE INDEX IF NOT EXISTS idx_quotes_company ON public.quotes(company_id);
CREATE INDEX IF NOT EXISTS idx_quote_items_quote ON public.quote_items(quote_id);
CREATE INDEX IF NOT EXISTS idx_redemptions_user ON public.redemptions(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_quote ON public.payments(quote_id);
CREATE INDEX IF NOT EXISTS idx_replications_quote ON public.product_replications(quote_id);
CREATE INDEX IF NOT EXISTS idx_wallets_user ON public.wallets(user_id);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_wallet ON public.wallet_transactions(wallet_id);

-- 5) RLS ------------------------------------------------------------------
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_company_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quote_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.redemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_replications ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies (will be enhanced with RBAC helpers)
-- Users: own data + company admins can see company users
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='users_own_data') THEN
    CREATE POLICY users_own_data ON public.users FOR SELECT USING (auth.uid() = id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='users_company_admins') THEN
    CREATE POLICY users_company_admins ON public.users FOR SELECT USING (
      EXISTS (
        SELECT 1 FROM public.user_company_roles ucr 
        WHERE ucr.user_id = auth.uid() 
        AND ucr.company_id = users.company 
        AND ucr.role IN ('admin_gestor', 'gestor')
      )
    );
  END IF;
END $$;

-- Addresses: own addresses
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='addresses_own') THEN
    CREATE POLICY addresses_own ON public.addresses FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- Quotes: company scoped + RBAC
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='quotes_company_scoped') THEN
    CREATE POLICY quotes_company_scoped ON public.quotes FOR ALL USING (
      EXISTS (
        SELECT 1 FROM public.user_company_roles ucr 
        WHERE ucr.user_id = auth.uid() 
        AND ucr.company_id = quotes.company_id
      )
    ) WITH CHECK (
      EXISTS (
        SELECT 1 FROM public.user_company_roles ucr 
        WHERE ucr.user_id = auth.uid() 
        AND ucr.company_id = quotes.company_id
        AND ucr.role IN ('admin_gestor', 'gestor')
      )
    );
  END IF;
END $$;

-- 6) RPCs ----------------------------------------------------------------
-- Get user role in company
CREATE OR REPLACE FUNCTION public.get_user_role(p_user uuid, p_company uuid)
RETURNS user_role
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE _role user_role;
BEGIN
  SELECT role INTO _role FROM public.user_company_roles 
  WHERE user_id = p_user AND company_id = p_company LIMIT 1;
  RETURN COALESCE(_role, 'funcionario'::user_role);
END $$;

-- Check if user has minimum role
CREATE OR REPLACE FUNCTION public.require_role(p_user uuid, p_company uuid, p_min_role user_role)
RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE _role user_role;
BEGIN
  _role := public.get_user_role(p_user, p_company);
  
  CASE p_min_role
    WHEN 'superadmin' THEN RETURN _role = 'superadmin';
    WHEN 'admin_gestor' THEN RETURN _role IN ('superadmin', 'admin_gestor');
    WHEN 'gestor' THEN RETURN _role IN ('superadmin', 'admin_gestor', 'gestor');
    ELSE RETURN true;
  END CASE;
END $$;

-- Create quote with items
CREATE OR REPLACE FUNCTION public.create_quote_with_items(
  p_company uuid,
  p_requested_by uuid,
  p_items jsonb,
  p_notes text DEFAULT NULL
) RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE _quote_id uuid; _item record; _subtotal numeric(12,2) := 0;
BEGIN
  -- Create quote
  INSERT INTO public.quotes(company_id, requested_by, notes, status)
  VALUES (p_company, p_requested_by, p_notes, 'draft')
  RETURNING id INTO _quote_id;
  
  -- Add items
  FOR _item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    INSERT INTO public.quote_items(quote_id, product_id, quantity, unit_price, total)
    VALUES (
      _quote_id, 
      (_item->>'product_id')::uuid,
      (_item->>'quantity')::int,
      (_item->>'unit_price')::numeric,
      (_item->>'quantity')::int * (_item->>'unit_price')::numeric
    );
    _subtotal := _subtotal + ((_item->>'quantity')::int * (_item->>'unit_price')::numeric);
  END LOOP;
  
  -- Update quote totals
  UPDATE public.quotes SET subtotal = _subtotal, total = _subtotal WHERE id = _quote_id;
  
  RETURN _quote_id;
END $$;

-- Process payment and queue replication
CREATE OR REPLACE FUNCTION public.process_quote_payment(
  p_quote_id uuid,
  p_payment_method payment_method,
  p_provider text,
  p_external_id text
) RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE _payment_id uuid; _company_id uuid;
BEGIN
  -- Get company from quote
  SELECT company_id INTO _company_id FROM public.quotes WHERE id = p_quote_id;
  
  -- Create payment record
  INSERT INTO public.payments(quote_id, method, provider, external_id, amount, status)
  SELECT p_quote_id, p_payment_method, p_provider, p_external_id, total, 'paid'
  FROM public.quotes WHERE id = p_quote_id
  RETURNING id INTO _payment_id;
  
  -- Update quote status
  UPDATE public.quotes SET status = 'paid', paid_at = now() WHERE id = p_quote_id;
  
  -- Queue replication
  INSERT INTO public.product_replications(quote_id, company_id, status)
  VALUES (p_quote_id, _company_id, 'queued');
  
  RETURN _payment_id;
END $$;

-- 7) Views ----------------------------------------------------------------
CREATE OR REPLACE VIEW public.v_quote_summary AS
SELECT 
  q.id,
  q.company_id,
  c.name as company_name,
  q.status,
  q.subtotal,
  q.discount,
  q.total,
  q.created_at,
  COUNT(qi.id) as item_count
FROM public.quotes q
JOIN public.companies c ON c.id = q.company_id
LEFT JOIN public.quote_items qi ON qi.quote_id = q.id
GROUP BY q.id, q.company_id, c.name, q.status, q.subtotal, q.discount, q.total, q.created_at;

-- 8) Seed data -----------------------------------------------------------
-- Insert default company if none exists
INSERT INTO public.companies (id, name, tax_id) 
SELECT 
  '00000000-0000-0000-0000-000000000001'::uuid,
  'Yoobe Admin',
  '00.000.000/0001-00'
WHERE NOT EXISTS (SELECT 1 FROM public.companies LIMIT 1);

-- Insert default superadmin if none exists
INSERT INTO public.users (id, email, name, role, status)
SELECT 
  '00000000-0000-0000-0000-000000000001'::uuid,
  'admin@yoobe.com',
  'Super Admin',
  'superadmin',
  'active'
WHERE NOT EXISTS (SELECT 1 FROM public.users WHERE role = 'superadmin' LIMIT 1);

-- Link superadmin to default company
INSERT INTO public.user_company_roles (user_id, company_id, role)
SELECT 
  '00000000-0000-0000-0000-000000000001'::uuid,
  '00000000-0000-0000-0000-000000000001'::uuid,
  'superadmin'
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_company_roles 
  WHERE user_id = '00000000-0000-0000-0000-000000000001'::uuid
);
