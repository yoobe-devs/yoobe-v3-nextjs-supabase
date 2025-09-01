import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Usar service role key para contornar autenticação
const supabaseUrl = 'http://localhost:54321'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { data: store, error } = await supabase
      .from('stores')
      .select(`
        id,
        name,
        company_id,
        status,
        created_at
      `)
      .eq('id', params.id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Loja não encontrada' }, { status: 404 })
      }
      console.error('Erro ao buscar loja:', error)
      return NextResponse.json({ error: 'Erro ao buscar loja' }, { status: 500 })
    }

    // Adicionar campos calculados para compatibilidade
    const storeWithCalculatedFields = {
      ...store,
      domain: `${store.name.toLowerCase().replace(/\s+/g, '-')}.com`,
      logo_url: null,
      users_count: 0,
      products_count: 0,
      orders_count: 0,
      revenue: 0
    }

    return NextResponse.json({ store: storeWithCalculatedFields })

  } catch (error) {
    console.error('Erro na API de lojas:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { name, company_id, status } = body

    // Validação
    if (!name || !company_id) {
      return NextResponse.json({ 
        error: 'Nome e empresa são obrigatórios' 
      }, { status: 400 })
    }

    // Verificar se a empresa existe (companies table doesn't exist, skipping validation)
    // const { data: company } = await supabase
    //   .from('companies')
    //   .select('id')
    //   .eq('id', company_id)
    //   .single()

    // if (!company) {
    //   return NextResponse.json({ 
    //     error: 'Empresa não encontrada' 
    //   }, { status: 400 })
    // }

    // Atualizar loja
    const { data: store, error } = await supabase
      .from('stores')
      .update({
        name: name.trim(),
        company_id,
        status: status || 'active'
      })
      .eq('id', params.id)
      .select(`
        id,
        name,
        company_id,
        status,
        created_at
      `)
      .single()

    if (error) {
      console.error('Erro ao atualizar loja:', error)
      return NextResponse.json({ error: 'Erro ao atualizar loja' }, { status: 500 })
    }

    // Adicionar campos calculados
    const storeWithCalculatedFields = {
      ...store,
      domain: `${store.name.toLowerCase().replace(/\s+/g, '-')}.com`,
      logo_url: null,
      users_count: 0,
      products_count: 0,
      orders_count: 0,
      revenue: 0
    }

    return NextResponse.json({
      store: storeWithCalculatedFields,
      message: 'Loja atualizada com sucesso'
    })

  } catch (error) {
    console.error('Erro na API de lojas:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar se a loja existe
    const { data: existingStore } = await supabase
      .from('stores')
      .select('id')
      .eq('id', params.id)
      .single()

    if (!existingStore) {
      return NextResponse.json({ error: 'Loja não encontrada' }, { status: 404 })
    }

    // Deletar loja
    const { error } = await supabase
      .from('stores')
      .delete()
      .eq('id', params.id)

    if (error) {
      console.error('Erro ao deletar loja:', error)
      return NextResponse.json({ error: 'Erro ao deletar loja' }, { status: 500 })
    }

    return NextResponse.json({
      message: 'Loja deletada com sucesso'
    })

  } catch (error) {
    console.error('Erro na API de lojas:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

