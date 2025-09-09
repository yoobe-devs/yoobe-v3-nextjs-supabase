const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'http://127.0.0.1:54321',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU',
  { auth: { persistSession: false } }
)

async function testFinal() {
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

    // 2. Test different field combinations
    const testCases = [
      { quantity: 10, custom_price: 12.34 },
      { quantity: 10, custom_price: 12.34, custom_points_cost: 0 },
      {
        quantity: 10,
        custom_price: 12.34,
        custom_points_cost: 0,
        notes: 'test',
      },
    ]

    for (let i = 0; i < testCases.length; i++) {
      const testCase = testCases[i]
      console.log(`\nTesting case ${i + 1}:`, testCase)

      const { data, error } = await supabase.from('budget_items').insert({
        budget_id: budget.id,
        base_product_id: '10c98b8f-b394-4b06-82c0-35457a3b8f4b',
        ...testCase,
      })

      if (error) {
        console.error(`Case ${i + 1} error:`, error.message)
      } else {
        console.log(`Case ${i + 1} successful!`)
        break
      }
    }
  } catch (err) {
    console.error('Exception:', err)
  }
}

testFinal()






