import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { createTimeWindow } from '@/lib/time-windows'

// GET - Listar janelas de acesso
export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const userRole = (user.user_metadata as any)?.role
    if (!['admin', 'admin_global', 'superadmin', 'manager'].includes($1)) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const url = new URL(request.url)
    const tenantId = url.searchParams.get('tenantId')

    if (!tenantId) {
      return NextResponse.json(
        { error: 'tenantId é obrigatório' },
        { status: 400 }
      )
    }

    const { data: windows, error: windowsError } = await supabase
      .from('access_time_windows')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false })

    if (windowsError) {
      return NextResponse.json({ error: windowsError.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: windows,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST - Criar janela de acesso
export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const userRole = (user.user_metadata as any)?.role
    if (!['admin', 'admin_global', 'superadmin', 'manager'].includes($1)) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const body = await request.json()
    const {
      tenantId,
      name,
      description,
      dow,
      startTime,
      endTime,
      timezone = 'America/Sao_Paulo',
    } = body

    if (!tenantId || !name || !dow || !startTime || !endTime) {
      return NextResponse.json(
        {
          error: 'tenantId, name, dow, startTime e endTime são obrigatórios',
        },
        { status: 400 }
      )
    }

    // Validar dow (dias da semana)
    if (!Array.isArray(dow) || dow.some(day => day < 1 || day > 7)) {
      return NextResponse.json(
        {
          error:
            'dow deve ser um array de números de 1 a 7 (1=Segunda, 7=Domingo)',
        },
        { status: 400 }
      )
    }

    // Validar formato de tempo
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/
    if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
      return NextResponse.json(
        {
          error: 'startTime e endTime devem estar no formato HH:MM',
        },
        { status: 400 }
      )
    }

    const window = await createTimeWindow(
      tenantId,
      name,
      description || '',
      dow,
      startTime,
      endTime,
      timezone
    )

    return NextResponse.json({
      success: true,
      data: window,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// PUT - Atualizar janela de acesso
export async function PUT(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const userRole = (user.user_metadata as any)?.role
    if (!['admin', 'admin_global', 'superadmin', 'manager'].includes($1)) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const body = await request.json()
    const {
      id,
      name,
      description,
      dow,
      startTime,
      endTime,
      timezone,
      isActive,
    } = body

    if (!id) {
      return NextResponse.json({ error: 'id é obrigatório' }, { status: 400 })
    }

    // Validar dow se fornecido
    if (dow && (!Array.isArray(dow) || dow.some(day => day < 1 || day > 7))) {
      return NextResponse.json(
        {
          error:
            'dow deve ser um array de números de 1 a 7 (1=Segunda, 7=Domingo)',
        },
        { status: 400 }
      )
    }

    // Validar formato de tempo se fornecido
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/
    if (startTime && !timeRegex.test(startTime)) {
      return NextResponse.json(
        {
          error: 'startTime deve estar no formato HH:MM',
        },
        { status: 400 }
      )
    }
    if (endTime && !timeRegex.test(endTime)) {
      return NextResponse.json(
        {
          error: 'endTime deve estar no formato HH:MM',
        },
        { status: 400 }
      )
    }

    const updateData: any = {}
    if (name !== undefined) updateData.name = name
    if (description !== undefined) updateData.description = description
    if (dow !== undefined) updateData.dow = dow
    if (startTime !== undefined) updateData.start_time = startTime
    if (endTime !== undefined) updateData.end_time = endTime
    if (timezone !== undefined) updateData.tz = timezone
    if (isActive !== undefined) updateData.is_active = isActive

    const { data: window, error: windowError } = await supabase
      .from('access_time_windows')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (windowError) {
      return NextResponse.json({ error: windowError.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: window,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DELETE - Deletar janela de acesso
export async function DELETE(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const userRole = (user.user_metadata as any)?.role
    if (!['admin', 'admin_global', 'superadmin', 'manager'].includes($1)) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const url = new URL(request.url)
    const id = url.searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'id é obrigatório' }, { status: 400 })
    }

    const { error: deleteError } = await supabase
      .from('access_time_windows')
      .delete()
      .eq('id', id)

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Janela de acesso deletada com sucesso',
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
