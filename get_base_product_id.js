const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'http://127.0.0.1:54321',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU',
  { auth: { persistSession: false } }
)

async function getBaseProductId() {
  try {
    const { data, error } = await supabase
      .from('base_products')
      .select('id')
      .limit(1)
    if (error) {
      console.error('Error:', error)
    } else {
      console.log('Base Product ID:', data?.[0]?.id || 'No products found')
    }
  } catch (err) {
    console.error('Exception:', err)
  }
}

getBaseProductId()






