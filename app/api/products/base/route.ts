import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321'
const serviceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

const supabaseService = createClient(supabaseUrl, serviceKey)

// GET - Listar produtos base
export async function GET(request: NextRequest) {
  try {
    const { data: products, error } = await supabaseService
      .from('base_products')
      .select('*')
      .order('name')

    if (error) {
      console.error('Erro ao buscar produtos base:', error)
      return NextResponse.json(
        { error: 'Erro ao buscar produtos base' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: products || [],
    })
  } catch (error) {
    console.error('Erro na API de produtos base:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
