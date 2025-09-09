const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'http://127.0.0.1:54321',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU',
  { auth: { persistSession: false } }
)

async function testMinimalInsert() {
  try {
    // Test minimal budget_items insert
    const { data, error } = await supabase.from('budget_items').insert({
      budget_id: 'c96e3287-b5df-4f9f-8379-0ca69c6cc978',
      base_product_id: '10c98b8f-b394-4b06-82c0-35457a3b8f4b',
      quantity: 10,
    })

    if (error) {
      console.error('Minimal insert error:', error)
    } else {
      console.log('Minimal insert successful:', data)
    }
  } catch (err) {
    console.error('Exception:', err)
  }
}

testMinimalInsert()






