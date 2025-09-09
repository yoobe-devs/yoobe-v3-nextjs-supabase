import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { validateCpf } from '@/lib/cpf-utils'

const supabaseUrl = 'http://localhost:54321'
const serviceKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

const supabaseService = createClient(supabaseUrl, serviceKey)

// POST - Validar CPF do usuário para resgate de produtos
export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Verificar autenticação
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { cpf } = body

    // Validar se CPF foi fornecido
    if (!cpf || cpf.trim() === '') {
      return NextResponse.json(
        {
          error: 'CPF é obrigatório para resgate de produtos',
          code: 'CPF_REQUIRED',
        },
        { status: 400 }
      )
    }

    // Validar formato do CPF
    const cpfValidation = validateCpf(cpf)
    if (!cpfValidation.isValid) {
      return NextResponse.json(
        {
          error: cpfValidation.error || 'CPF inválido',
          code: 'CPF_INVALID',
        },
        { status: 400 }
      )
    }

    // Buscar dados do usuário
    const { data: userData, error: userError } = await supabaseService
      .from('users')
      .select('id, cpf, full_name, email')
      .eq('id', user.id)
      .single()

    if (userError || !userData) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      )
    }

    // Verificar se o CPF fornecido corresponde ao CPF cadastrado
    if (userData.cpf && userData.cpf !== cpf) {
      return NextResponse.json(
        {
          error: 'CPF fornecido não corresponde ao CPF cadastrado',
          code: 'CPF_MISMATCH',
        },
        { status: 400 }
      )
    }

    // Se o usuário não tem CPF cadastrado, atualizar com o CPF fornecido
    if (!userData.cpf) {
      const { error: updateError } = await supabaseService
        .from('users')
        .update({ cpf })
        .eq('id', user.id)

      if (updateError) {
        console.error('Erro ao atualizar CPF do usuário:', updateError)
        return NextResponse.json(
          { error: 'Erro ao salvar CPF' },
          { status: 500 }
        )
      }
    }

    return NextResponse.json({
      success: true,
      message: 'CPF validado com sucesso',
      user: {
        id: userData.id,
        full_name: userData.full_name,
        email: userData.email,
        cpf: cpf,
      },
    })
  } catch (error) {
    console.error('Erro na validação de CPF:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// GET - Verificar se usuário tem CPF cadastrado
export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Verificar autenticação
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Buscar dados do usuário
    const { data: userData, error: userError } = await supabaseService
      .from('users')
      .select('id, cpf, full_name, email')
      .eq('id', user.id)
      .single()

    if (userError || !userData) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      hasCpf: !!userData.cpf,
      cpf: userData.cpf,
      user: {
        id: userData.id,
        full_name: userData.full_name,
        email: userData.email,
      },
    })
  } catch (error) {
    console.error('Erro ao verificar CPF do usuário:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
