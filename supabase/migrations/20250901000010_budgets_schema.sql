-- Budgets schema
CREATE TABLE IF NOT EXISTS public.budgets (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id uuid NOT NULL,
  manager_id uuid NOT NULL,
  title text NOT NULL,
  description text,
  total_amount numeric(12,2) DEFAULT 0,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.budget_items (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  budget_id uuid REFERENCES public.budgets(id) ON DELETE CASCADE,
  base_product_id uuid REFERENCES public.base_products(id),
  quantity integer DEFAULT 1,
  custom_price numeric(12,2),
  custom_points_cost integer,
  notes text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_budgets_company ON public.budgets(company_id);
CREATE INDEX IF NOT EXISTS idx_budget_items_budget ON public.budget_items(budget_id);


