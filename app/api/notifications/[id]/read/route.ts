import { NextRequest, NextResponse } from 'next/server'
import { supabaseService } from '@/lib/supabaseService'
import { authenticateAndAuthorize } from '@/lib/auth'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await authenticateAndAuthorize(request, [
      'manager',
      'gestor',
      'admin',
      'admin_global',
      'superadmin',
    ])

    if (!authResult.success) {
      return NextResponse.json(
        { success: false, error: authResult.error },
        { status: authResult.status }
      )
    }

    const notificationId = params.id

    // Verificar se a notificação existe e se o usuário tem acesso
    let notificationQuery = supabaseService
      .from('notifications')
      .select('id, user_id, company_id, read')
      .eq('id', notificationId)
      .single()

    // Aplicar filtros de acesso baseados no role
    if (
      authResult.user.role === 'manager' ||
      authResult.user.role === 'gestor'
    ) {
      notificationQuery = notificationQuery.eq(
        'company_id',
        authResult.user.company_id
      )
    } else if (authResult.user.role === 'admin') {
      notificationQuery = notificationQuery.eq(
        'company_id',
        authResult.user.company_id
      )
    }

    const { data: notification, error: fetchError } = await notificationQuery

    if (fetchError || !notification) {
      return NextResponse.json(
        { success: false, error: { message: 'Notificação não encontrada' } },
        { status: 404 }
      )
    }

    // Se já está marcada como lida, não fazer nada
    if (notification.read) {
      return NextResponse.json({
        success: true,
        data: { notification },
        message: 'Notificação já estava marcada como lida',
      })
    }

    // Marcar como lida
    const { data: updatedNotification, error: updateError } =
      await supabaseService
        .from('notifications')
        .update({
          read: true,
          read_at: new Date().toISOString(),
        })
        .eq('id', notificationId)
        .select(
          `
        id,
        type,
        title,
        message,
        data,
        priority,
        read,
        read_at,
        created_at,
        user_id,
        company_id,
        budget_id,
        order_id
      `
        )
        .single()

    if (updateError) {
      console.error('Erro ao marcar notificação como lida:', updateError)
      return NextResponse.json(
        { success: false, error: { message: 'Erro ao atualizar notificação' } },
        { status: 500 }
      )
    }

    // Log de auditoria
    await supabaseService.from('audit_logs').insert([
      {
        action: 'update',
        table_name: 'notifications',
        record_id: notificationId,
        user_id: authResult.user.id,
        changes: { read: true, read_at: new Date().toISOString() },
        ip_address: request.headers.get('x-forwarded-for') || 'unknown',
        user_agent: request.headers.get('user-agent') || 'unknown',
      },
    ])

    return NextResponse.json({
      success: true,
      data: { notification: updatedNotification },
    })
  } catch (error) {
    console.error('Erro na API de marcar notificação como lida:', error)
    return NextResponse.json(
      { success: false, error: { message: 'Erro interno do servidor' } },
      { status: 500 }
    )
  }
}

