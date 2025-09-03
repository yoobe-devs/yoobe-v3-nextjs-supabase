-- Cart, Checkout, Audit, Shipment, NFe structures with RLS and RPCs
-- safe to re-run: use IF NOT EXISTS and DO blocks

-- 0) helpers ---------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'set_updated_at') THEN
    CREATE OR REPLACE FUNCTION public.set_updated_at() RETURNS trigger AS $$
    BEGIN NEW.updated_at = now(); RETURN NEW; END; $$ LANGUAGE plpgsql;
  END IF;
END $$;

-- 1) tables ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.carts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  company_id uuid REFERENCES public.companies(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','abandoned','converted')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS ux_carts_active_per_user
  ON public.carts(user_id) WHERE (status = 'active');

CREATE TABLE IF NOT EXISTS public.cart_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cart_id uuid NOT NULL REFERENCES public.carts(id) ON DELETE CASCADE,
  product_id uuid NOT NULL,
  quantity integer NOT NULL CHECK (quantity > 0),
  unit_price numeric(10,2) NOT NULL DEFAULT 0,
  points integer NOT NULL DEFAULT 0,
  metadata jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (cart_id, product_id)
);
CREATE INDEX IF NOT EXISTS idx_cart_items_cart_id ON public.cart_items(cart_id);

CREATE TABLE IF NOT EXISTS public.customer_meta (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  data jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS ux_customer_meta_user ON public.customer_meta(user_id);

CREATE TABLE IF NOT EXISTS public.checkout_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  company_id uuid REFERENCES public.companies(id) ON DELETE SET NULL,
  cart_snapshot jsonb NOT NULL,
  payment_method text NOT NULL CHECK (payment_method IN ('points','credit_card','pix','debit','boleto','donation')),
  amount numeric(10,2) NOT NULL DEFAULT 0,
  points integer NOT NULL DEFAULT 0,
  shipping_address jsonb,
  billing_address jsonb,
  meta jsonb NOT NULL DEFAULT '{}',
  status text NOT NULL DEFAULT 'pending_payment' CHECK (status IN ('draft','pending_payment','paid','failed','abandoned')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_checkout_sessions_user ON public.checkout_sessions(user_id);

CREATE TABLE IF NOT EXISTS public.checkout_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES public.checkout_sessions(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  event text NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_checkout_events_session ON public.checkout_events(session_id);

CREATE TABLE IF NOT EXISTS public.shipment_intents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES public.checkout_sessions(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  address jsonb NOT NULL,
  items jsonb NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','queued','exported','error')),
  error text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.nfe_exports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES public.checkout_sessions(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  request_payload jsonb NOT NULL DEFAULT '{}',
  response_payload jsonb NOT NULL DEFAULT '{}',
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','exported','error')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  action text NOT NULL,
  entity text NOT NULL,
  entity_id uuid,
  actor_user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  metadata jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- triggers
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'tg_carts_updated_at') THEN
    CREATE TRIGGER tg_carts_updated_at BEFORE UPDATE ON public.carts
      FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'tg_cart_items_updated_at') THEN
    CREATE TRIGGER tg_cart_items_updated_at BEFORE UPDATE ON public.cart_items
      FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'tg_customer_meta_updated_at') THEN
    CREATE TRIGGER tg_customer_meta_updated_at BEFORE UPDATE ON public.customer_meta
      FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'tg_checkout_sessions_updated_at') THEN
    CREATE TRIGGER tg_checkout_sessions_updated_at BEFORE UPDATE ON public.checkout_sessions
      FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'tg_shipment_intents_updated_at') THEN
    CREATE TRIGGER tg_shipment_intents_updated_at BEFORE UPDATE ON public.shipment_intents
      FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'tg_nfe_exports_updated_at') THEN
    CREATE TRIGGER tg_nfe_exports_updated_at BEFORE UPDATE ON public.nfe_exports
      FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  END IF;
END $$;

-- 2) RLS -------------------------------------------------------------------
ALTER TABLE public.carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_meta ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checkout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checkout_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipment_intents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nfe_exports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- carts: owner only
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='carts_owner_select') THEN
    CREATE POLICY carts_owner_select ON public.carts FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='carts_owner_write') THEN
    CREATE POLICY carts_owner_write ON public.carts FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- cart_items: via parent cart
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='cart_items_owner_select') THEN
    CREATE POLICY cart_items_owner_select ON public.cart_items FOR SELECT USING (
      EXISTS (SELECT 1 FROM public.carts c WHERE c.id = cart_items.cart_id AND c.user_id = auth.uid())
    );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='cart_items_owner_write') THEN
    CREATE POLICY cart_items_owner_write ON public.cart_items FOR ALL USING (
      EXISTS (SELECT 1 FROM public.carts c WHERE c.id = cart_items.cart_id AND c.user_id = auth.uid())
    ) WITH CHECK (
      EXISTS (SELECT 1 FROM public.carts c WHERE c.id = cart_items.cart_id AND c.user_id = auth.uid())
    );
  END IF;
END $$;

-- customer_meta: owner
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='customer_meta_owner_select') THEN
    CREATE POLICY customer_meta_owner_select ON public.customer_meta FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='customer_meta_owner_write') THEN
    CREATE POLICY customer_meta_owner_write ON public.customer_meta FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- checkout_sessions / events / shipments / nfe: owner
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='checkout_sessions_owner_select') THEN
    CREATE POLICY checkout_sessions_owner_select ON public.checkout_sessions FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='checkout_sessions_owner_write') THEN
    CREATE POLICY checkout_sessions_owner_write ON public.checkout_sessions FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='checkout_events_owner') THEN
    CREATE POLICY checkout_events_owner ON public.checkout_events FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='shipment_intents_owner') THEN
    CREATE POLICY shipment_intents_owner ON public.shipment_intents FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='nfe_exports_owner') THEN
    CREATE POLICY nfe_exports_owner ON public.nfe_exports FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- audit_logs: actor scoped
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='audit_logs_actor') THEN
    CREATE POLICY audit_logs_actor ON public.audit_logs FOR ALL USING (auth.uid() = actor_user_id) WITH CHECK (auth.uid() = actor_user_id);
  END IF;
END $$;

-- 3) RPCs ------------------------------------------------------------------
-- SECURITY DEFINER to bypass RLS for internal joins but still scoped by args

CREATE OR REPLACE FUNCTION public.get_or_create_cart(p_user uuid, p_company uuid)
RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE _id uuid;
BEGIN
  SELECT id INTO _id FROM public.carts WHERE user_id = p_user AND status = 'active' LIMIT 1;
  IF _id IS NULL THEN
    INSERT INTO public.carts(user_id, company_id, status) VALUES (p_user, p_company, 'active') RETURNING id INTO _id;
  END IF;
  RETURN _id;
END $$;

CREATE OR REPLACE FUNCTION public.add_to_cart(p_user uuid, p_product uuid, p_qty int, p_unit numeric, p_points int, p_meta jsonb)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE _cart uuid;
BEGIN
  _cart := public.get_or_create_cart(p_user, NULL);
  INSERT INTO public.cart_items(cart_id, product_id, quantity, unit_price, points, metadata)
  VALUES (_cart, p_product, p_qty, p_unit, p_points, COALESCE(p_meta,'{}'))
  ON CONFLICT (cart_id, product_id) DO UPDATE
    SET quantity = public.cart_items.quantity + EXCLUDED.quantity,
        unit_price = EXCLUDED.unit_price,
        points = EXCLUDED.points,
        metadata = EXCLUDED.metadata,
        updated_at = now();
END $$;

CREATE OR REPLACE FUNCTION public.clear_cart(p_user uuid)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE _cart uuid;
BEGIN
  SELECT id INTO _cart FROM public.carts WHERE user_id = p_user AND status = 'active' LIMIT 1;
  IF _cart IS NOT NULL THEN
    DELETE FROM public.cart_items WHERE cart_id = _cart;
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.log_checkout_event(p_session uuid, p_user uuid, p_event text, p_payload jsonb)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.checkout_events(session_id, user_id, event, payload)
  VALUES (p_session, p_user, p_event, COALESCE(p_payload,'{}'));
END $$;

CREATE OR REPLACE FUNCTION public.create_checkout_from_cart(
  p_user uuid,
  p_company uuid,
  p_method text,
  p_shipping jsonb,
  p_billing jsonb,
  p_meta jsonb
) RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE _cart uuid; _items jsonb; _amount numeric(10,2); _points int; _sid uuid;
BEGIN
  _cart := public.get_or_create_cart(p_user, p_company);
  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'productId', product_id,
    'quantity', quantity,
    'unitPrice', unit_price,
    'points', points,
    'metadata', metadata
  )), '[]'::jsonb),
  COALESCE(sum(quantity*unit_price),0),
  COALESCE(sum(quantity*points),0)
  INTO _items, _amount, _points
  FROM public.cart_items WHERE cart_id = _cart;

  INSERT INTO public.checkout_sessions(
    user_id, company_id, cart_snapshot, payment_method, amount, points,
    shipping_address, billing_address, meta, status
  ) VALUES (
    p_user, p_company,
    jsonb_build_object('items', _items, 'amount', _amount, 'points', _points),
    p_method, _amount, _points,
    COALESCE(p_shipping,'{}'), COALESCE(p_billing,'{}'), COALESCE(p_meta,'{}'), 'pending_payment'
  ) RETURNING id INTO _sid;

  PERFORM public.log_checkout_event(_sid, p_user, 'checkout_created', jsonb_build_object('amount',_amount,'points',_points));
  UPDATE public.carts SET status = 'converted' WHERE id = _cart;

  -- create shipment intent (pending)
  INSERT INTO public.shipment_intents(session_id, user_id, address, items, status)
  VALUES (_sid, p_user, COALESCE(p_shipping,'{}'), _items, 'pending');

  RETURN _sid;
END $$;

-- 4) view ------------------------------------------------------------------
CREATE OR REPLACE VIEW public.v_client_dashboard AS
SELECT
  cs.user_id,
  COUNT(*) FILTER (WHERE cs.status = 'paid') AS paid_checkouts,
  COALESCE(SUM(cs.amount) FILTER (WHERE cs.status = 'paid'),0) AS paid_amount,
  COUNT(si.*) FILTER (WHERE si.status = 'queued') AS shipments_queued,
  COUNT(si.*) FILTER (WHERE si.status = 'exported') AS shipments_exported
FROM public.checkout_sessions cs
LEFT JOIN public.shipment_intents si ON si.session_id = cs.id
GROUP BY cs.user_id;





