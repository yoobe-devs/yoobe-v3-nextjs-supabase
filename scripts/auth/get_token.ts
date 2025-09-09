import { createClient } from '@supabase/supabase-js'

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321'
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'anon'
  const email = process.env.SMOKE_EMAIL || 'admin@yoobe.com'
  const password = process.env.SMOKE_PASSWORD || 'ChangeMe123!'

  const supabase = createClient(url, anon, { auth: { persistSession: false } })
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  if (error || !data.session) {
    console.error('Login failed:', error?.message)
    process.exit(1)
  }
  console.log(data.session.access_token)
}

main().catch(e => {
  console.error(e)
  process.exit(1)
})






