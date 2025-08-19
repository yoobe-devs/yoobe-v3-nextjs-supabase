import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

if (!supabaseUrl || !supabaseAnonKey) {
  // Warn during development but avoid crashing the entire frontend so that pages not using
  // Supabase can still render. Replace console.warn by your own logger if preferred.
  console.warn("[Supabase] Variáveis de ambiente NEXT_PUBLIC_SUPABASE_URL ou NEXT_PUBLIC_SUPABASE_ANON_KEY não definidas. Conexão ao banco estará indisponível.")
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

