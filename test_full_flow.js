const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'http://127.0.0.1:54321',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU',
  { auth: { persistSession: false } }
)

async function testFullFlow() {
  try {
    // 1. Create budget
    const { data: budget, error: budgetError } = await supabase
      .from('budgets')
      .insert({
        company_id: '550e8400-e29b-41d4-a716-446655440002',
        manager_id: '550e8400-e29b-41d4-a716-446655440000',
        title: 'Test Budget',
        total_amount: 123.4,
        status: 'pending',
      })
      .select('id')
      .single()

    if (budgetError) {
      console.error('Budget creation error:', budgetError)
      return
    }

    console.log('Budget created:', budget.id)

    // 2. Create budget items
    const { data: items, error: itemsError } = await supabase
      .from('budget_items')
      .insert({
        budget_id: budget.id,
        base_product_id: '10c98b8f-b394-4b06-82c0-35457a3b8f4b',
        quantity: 10,
        custom_price: 12.34,
        custom_points_cost: 0,
      })
      .select('id')

    if (itemsError) {
      console.error('Items creation error:', itemsError)
      // Rollback
      await supabase.from('budgets').delete().eq('id', budget.id)
      return
    }

    console.log('Items created:', items)
    console.log('Full flow successful!')
  } catch (err) {
    console.error('Exception:', err)
  }
}

testFullFlow()






