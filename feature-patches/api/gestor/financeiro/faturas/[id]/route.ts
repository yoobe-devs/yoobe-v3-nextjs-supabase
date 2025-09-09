import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321'
const serviceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

const supabaseService = createClient(supabaseUrl, serviceKey)

// GET - Buscar detalhes da fatura
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const faturaId = params.id

    // IDs reais da empresa YOOBE
    const yoobeCompanyId = '550e8400-e29b-41d4-a716-446655440001'
    const yoobeManagerId = '264b2045-aacf-4283-a19b-1d3cf5ef96c8'

    const { data: fatura, error } = await supabaseService
      .from('faturas')
      .select(
        `
        *,
        orcamentos (
          id,
          title,
          description,
          status,
          created_at,
          manager_id,
          companies (
            id,
            name
          ),
          stores (
            id,
            name,
            slug
          ),
          users (
            id,
            name,
            email
          )
        ),
        propostas (
          id,
          version,
          status,
          snapshot,
          created_at,
          accepted_at
        ),
        pagamentos (
          id,
          amount,
          status,
          paid_at,
          provider,
          provider_ref,
          raw
        )
      `
      )
      .eq('id', faturaId)
      .eq('orcamentos.company_id', yoobeCompanyId)
      .eq('orcamentos.manager_id', yoobeManagerId)
      .single()

    if (error) {
      console.error('Erro ao buscar fatura:', error)
      return NextResponse.json(
        { error: 'Fatura não encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: fatura,
    })
  } catch (error) {
    console.error('Erro na API de detalhes da fatura:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
