-- Fix RLS policies to allow admin imports using auth.jwt() metadata
-- Safe to run multiple times

-- Ensure RLS enabled
ALTER TABLE IF EXISTS product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS base_products ENABLE ROW LEVEL SECURITY;

-- Helper: drop policy if exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'product_categories' AND policyname = 'product_categories_insert_admin_jwt'
  ) THEN
    EXECUTE 'DROP POLICY "product_categories_insert_admin_jwt" ON public.product_categories';
  END IF;
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'product_categories' AND policyname = 'product_categories_update_admin_jwt'
  ) THEN
    EXECUTE 'DROP POLICY "product_categories_update_admin_jwt" ON public.product_categories';
  END IF;
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'product_categories' AND policyname = 'product_categories_delete_admin_jwt'
  ) THEN
    EXECUTE 'DROP POLICY "product_categories_delete_admin_jwt" ON public.product_categories';
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'base_products' AND policyname = 'base_products_insert_admin_jwt'
  ) THEN
    EXECUTE 'DROP POLICY "base_products_insert_admin_jwt" ON public.base_products';
  END IF;
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'base_products' AND policyname = 'base_products_update_admin_jwt'
  ) THEN
    EXECUTE 'DROP POLICY "base_products_update_admin_jwt" ON public.base_products';
  END IF;
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'base_products' AND policyname = 'base_products_delete_admin_jwt'
  ) THEN
    EXECUTE 'DROP POLICY "base_products_delete_admin_jwt" ON public.base_products';
  END IF;
END $$;

-- Read policies (public) remain open
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'product_categories' AND policyname = 'product_categories_select_public'
  ) THEN
    EXECUTE 'CREATE POLICY "product_categories_select_public" ON public.product_categories FOR SELECT USING (true)';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'base_products' AND policyname = 'base_products_select_public'
  ) THEN
    EXECUTE 'CREATE POLICY "base_products_select_public" ON public.base_products FOR SELECT USING (true)';
  END IF;
END $$;

-- Admin write via JWT metadata (preferred over joining auth.users)
CREATE POLICY "product_categories_insert_admin_jwt" ON public.product_categories
  FOR INSERT
  TO authenticated
  WITH CHECK ((current_setting('request.jwt.claims', true)::jsonb -> 'user_metadata' ->> 'role') = 'admin');

CREATE POLICY "product_categories_update_admin_jwt" ON public.product_categories
  FOR UPDATE
  TO authenticated
  USING ((current_setting('request.jwt.claims', true)::jsonb -> 'user_metadata' ->> 'role') = 'admin')
  WITH CHECK ((current_setting('request.jwt.claims', true)::jsonb -> 'user_metadata' ->> 'role') = 'admin');

CREATE POLICY "product_categories_delete_admin_jwt" ON public.product_categories
  FOR DELETE
  TO authenticated
  USING ((current_setting('request.jwt.claims', true)::jsonb -> 'user_metadata' ->> 'role') = 'admin');

CREATE POLICY "base_products_insert_admin_jwt" ON public.base_products
  FOR INSERT
  TO authenticated
  WITH CHECK ((current_setting('request.jwt.claims', true)::jsonb -> 'user_metadata' ->> 'role') = 'admin');

CREATE POLICY "base_products_update_admin_jwt" ON public.base_products
  FOR UPDATE
  TO authenticated
  USING ((current_setting('request.jwt.claims', true)::jsonb -> 'user_metadata' ->> 'role') = 'admin')
  WITH CHECK ((current_setting('request.jwt.claims', true)::jsonb -> 'user_metadata' ->> 'role') = 'admin');

CREATE POLICY "base_products_delete_admin_jwt" ON public.base_products
  FOR DELETE
  TO authenticated
  USING ((current_setting('request.jwt.claims', true)::jsonb -> 'user_metadata' ->> 'role') = 'admin');


