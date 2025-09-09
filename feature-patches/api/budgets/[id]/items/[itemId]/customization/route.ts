import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabaseService } from '@/lib/supabaseService'
import { authenticateAndAuthorize } from '@/lib/auth'

// Schema para customização
const customizationSchema = z.object({
  method: z.enum([
    'silkscreen',
    'bordado',
    'UV',
    'laser',
    'sublimacao',
    'transfer',
    'outro',
  ]),
  placements: z.array(z.string()).min(1),
  colors: z.array(z.string()).optional(),
  size_mm: z
    .object({
      width: z.number().positive(),
      height: z.number().positive(),
    })
    .optional(),
  notes: z.string().optional(),
  files: z
    .array(
      z.object({
        file_url: z.string(),
        mime_type: z.string(),
      })
    )
    .optional(),
})

// GET - Buscar customização do item
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; itemId: string } }
) {
  try {
    const { user, error: authError } = await authenticateAndAuthorize(request, {
      roles: ['gestor', 'admin', 'admin_global', 'superadmin'],
    })

    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Verificar se o orçamento e item existem
    const { data: budgetItem, error: itemError } = await supabaseService
      .from('budget_items')
      .select(
        `
        id,
        budget_id,
        budgets!inner(id, company_id)
      `
      )
      .eq('id', params.itemId)
      .eq('budget_id', params.id)
      .single()

    if (itemError || !budgetItem) {
      return NextResponse.json(
        { error: 'Item não encontrado' },
        { status: 404 }
      )
    }

    // Verificar acesso à empresa
    if (user.role === 'gestor') {
      const { data: userData } = await supabaseService
        .from('users')
        .select('company_id')
        .eq('id', user.id)
        .single()

      if (userData?.company_id !== budgetItem.budgets.company_id) {
        return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
      }
    }

    // Buscar customização do item
    const { data: customization, error } = await supabaseService
      .from('budget_item_customizations')
      .select('*')
      .eq('budget_id', params.id)
      .eq('budget_item_id', params.itemId)
      .single()

    if (error && error.code !== 'PGRST116') {
      // PGRST116 = no rows returned
      console.error('Erro ao buscar customização:', error)
      return NextResponse.json(
        { error: 'Erro interno do servidor' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        budget_id: params.id,
        item_id: params.itemId,
        customization: customization || null,
      },
    })
  } catch (error) {
    console.error('Erro na API de customização:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// POST - Criar customização do item
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string; itemId: string } }
) {
  try {
    const { user, error: authError } = await authenticateAndAuthorize(request, {
      roles: ['gestor', 'admin', 'admin_global', 'superadmin'],
    })

    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = customizationSchema.parse(body)

    // Verificar se o orçamento e item existem
    const { data: budgetItem, error: itemError } = await supabaseService
      .from('budget_items')
      .select(
        `
        id,
        budget_id,
        budgets!inner(id, company_id, status)
      `
      )
      .eq('id', params.itemId)
      .eq('budget_id', params.id)
      .single()

    if (itemError || !budgetItem) {
      return NextResponse.json(
        { error: 'Item não encontrado' },
        { status: 404 }
      )
    }

    // Verificar acesso à empresa
    if (user.role === 'gestor') {
      const { data: userData } = await supabaseService
        .from('users')
        .select('company_id')
        .eq('id', user.id)
        .single()

      if (userData?.company_id !== budgetItem.budgets.company_id) {
        return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
      }
    }

    // Verificar se já existe customização
    const { data: existingCustomization, error: existingError } =
      await supabaseService
        .from('budget_item_customizations')
        .select('id')
        .eq('budget_id', params.id)
        .eq('budget_item_id', params.itemId)
        .single()

    if (existingCustomization) {
      return NextResponse.json(
        { error: 'Customização já existe para este item' },
        { status: 400 }
      )
    }

    // Criar customização
    const { data: customization, error: createError } = await supabaseService
      .from('budget_item_customizations')
      .insert({
        budget_id: params.id,
        budget_item_id: params.itemId,
        method: validatedData.method,
        placements: validatedData.placements,
        colors: validatedData.colors,
        size_mm: validatedData.size_mm,
        notes: validatedData.notes,
        files: validatedData.files,
      })
      .select()
      .single()

    if (createError) {
      console.error('Erro ao criar customização:', createError)
      return NextResponse.json(
        { error: 'Erro ao criar customização' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: customization,
      message: 'Customização criada com sucesso',
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Dados inválidos',
          details: error.errors
            .map(e => `${e.path.join('.')}: ${e.message}`)
            .join(', '),
        },
        { status: 400 }
      )
    }

    console.error('Erro na API de criação de customização:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// PATCH - Atualizar customização do item
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string; itemId: string } }
) {
  try {
    const { user, error: authError } = await authenticateAndAuthorize(request, {
      roles: ['gestor', 'admin', 'admin_global', 'superadmin'],
    })

    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = customizationSchema.partial().parse(body)

    // Verificar se o orçamento e item existem
    const { data: budgetItem, error: itemError } = await supabaseService
      .from('budget_items')
      .select(
        `
        id,
        budget_id,
        budgets!inner(id, company_id, status)
      `
      )
      .eq('id', params.itemId)
      .eq('budget_id', params.id)
      .single()

    if (itemError || !budgetItem) {
      return NextResponse.json(
        { error: 'Item não encontrado' },
        { status: 404 }
      )
    }

    // Verificar acesso à empresa
    if (user.role === 'gestor') {
      const { data: userData } = await supabaseService
        .from('users')
        .select('company_id')
        .eq('id', user.id)
        .single()

      if (userData?.company_id !== budgetItem.budgets.company_id) {
        return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
      }
    }

    // Verificar se a customização existe
    const { data: existingCustomization, error: existingError } =
      await supabaseService
        .from('budget_item_customizations')
        .select('id')
        .eq('budget_id', params.id)
        .eq('budget_item_id', params.itemId)
        .single()

    if (!existingCustomization) {
      return NextResponse.json(
        { error: 'Customização não encontrada' },
        { status: 404 }
      )
    }

    // Atualizar customização
    const { data: customization, error: updateError } = await supabaseService
      .from('budget_item_customizations')
      .update({
        ...validatedData,
        updated_at: new Date().toISOString(),
      })
      .eq('budget_id', params.id)
      .eq('budget_item_id', params.itemId)
      .select()
      .single()

    if (updateError) {
      console.error('Erro ao atualizar customização:', updateError)
      return NextResponse.json(
        { error: 'Erro ao atualizar customização' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: customization,
      message: 'Customização atualizada com sucesso',
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Dados inválidos',
          details: error.errors
            .map(e => `${e.path.join('.')}: ${e.message}`)
            .join(', '),
        },
        { status: 400 }
      )
    }

    console.error('Erro na API de atualização de customização:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
