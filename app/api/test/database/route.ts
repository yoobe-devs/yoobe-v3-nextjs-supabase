import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // Testar se as tabelas existem
    const { data: pointTransactions, error: ptError } = await supabase
      .from('point_transactions')
      .select('count')
      .limit(1)

    const { data: payments, error: pError } = await supabase
      .from('payments')
      .select('count')
      .limit(1)

    const { data: inventory, error: iError } = await supabase
      .from('inventory')
      .select('committed')
      .limit(1)

    if (ptError || pError || iError) {
      return NextResponse.json({ 
        status: 'error', 
        message: 'Tabelas não encontradas',
        errors: { ptError, pError, iError }
      }, { status: 500 })
    }

    return NextResponse.json({ 
      status: 'ok', 
      message: 'Banco de dados funcionando',
      tables: {
        point_transactions: 'ok',
        payments: 'ok',
        inventory: 'ok'
      }
    })

  } catch (error) {
    return NextResponse.json({ 
      status: 'error', 
      message: 'Erro ao conectar com banco',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
