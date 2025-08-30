import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // Testar se a tabela company_config existe
    const { data, error } = await supabase
      .from('company_config')
      .select('count')
      .limit(1)

    if (error) {
      return NextResponse.json({ 
        status: 'error', 
        message: 'Tabela company_config não encontrada',
        error: error.message
      }, { status: 500 })
    }

    return NextResponse.json({ 
      status: 'ok', 
      message: 'Sistema de configurações funcionando',
      data: {
        config: data?.length || 0
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
