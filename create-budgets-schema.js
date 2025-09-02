const { createClient } = require('@supabase/supabase-js')

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321'
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

const supabase = createClient(url, serviceKey)

async function run() {
  const sql = `
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
  `

  try {
    const { error } = await supabase.rpc('exec_sql', { sql })
    if (error) {
      console.error('❌ Erro ao aplicar schema de budgets:', error)
      process.exit(1)
    }
    console.log('✅ Budgets schema garantido')
  } catch (e) {
    console.error('❌ Falha ao executar RPC exec_sql:', e?.message)
    process.exit(1)
  }
}

run()
