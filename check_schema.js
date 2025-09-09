const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'http://127.0.0.1:54321',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU',
  { auth: { persistSession: false } }
)

async function checkSchema() {
  try {
    // Check budget_items schema
    const { data, error } = await supabase.rpc('exec_sql', {
      query: `
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_name = 'budget_items' AND table_schema = 'public'
        ORDER BY ordinal_position
      `,
    })

    if (error) {
      console.error('Error checking schema:', error)
    } else {
      console.log('budget_items schema:')
      console.log(JSON.stringify(data, null, 2))
    }
  } catch (err) {
    console.error('Exception:', err)
  }
}

checkSchema()






