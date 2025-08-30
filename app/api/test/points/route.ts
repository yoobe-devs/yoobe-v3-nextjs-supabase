import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // Testar view de saldo
    const { data: balances, error: balanceError } = await supabase
      .from('user_point_balances')
      .select('*')
      .limit(5)

    // Testar transações
    const { data: transactions, error: txError } = await supabase
      .from('point_transactions')
      .select('*')
      .limit(5)

    if (balanceError || txError) {
      return NextResponse.json({ 
        status: 'error', 
        message: 'Sistema de pontos com erro',
        errors: { balanceError, txError }
      }, { status: 500 })
    }

    return NextResponse.json({ 
      status: 'ok', 
      message: 'Sistema de pontos funcionando',
      data: {
        balances: balances?.length || 0,
        transactions: transactions?.length || 0
      }
    })

  } catch (error) {
    return NextResponse.json({ 
      status: 'error', 
      message: 'Erro no sistema de pontos',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
