import { NextRequest, NextResponse } from 'next/server'
import { supabaseService } from '@/lib/supabaseService'
import { authenticateAndAuthorize } from '@/lib/auth'

export async function PATCH(request: NextRequest) {
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

    // Construir query baseada no role do usuário
    let updateQuery = supabaseService
      .from('notifications')
      .update({
        read: true,
        read_at: new Date().toISOString(),
      })
      .eq('read', false)

    // Aplicar filtros de acesso baseados no role
    if (
      authResult.user.role === 'manager' ||
      authResult.user.role === 'gestor'
    ) {
      updateQuery = updateQuery.eq('company_id', authResult.user.company_id)
    } else if (authResult.user.role === 'admin') {
      updateQuery = updateQuery.eq('company_id', authResult.user.company_id)
    }

    // Executar atualização
    const { data: updatedNotifications, error: updateError } =
      await updateQuery.select('id')

    if (updateError) {
      console.error(
        'Erro ao marcar todas as notificações como lidas:',
        updateError
      )
      return NextResponse.json(
        {
          success: false,
          error: { message: 'Erro ao atualizar notificações' },
        },
        { status: 500 }
      )
    }

    const updatedCount = updatedNotifications?.length || 0

    // Log de auditoria
    if (updatedCount > 0) {
      await supabaseService.from('audit_logs').insert([
        {
          action: 'bulk_update',
          table_name: 'notifications',
          record_id: null,
          user_id: authResult.user.id,
          changes: {
            read: true,
            read_at: new Date().toISOString(),
            updated_count: updatedCount,
          },
          ip_address: request.headers.get('x-forwarded-for') || 'unknown',
          user_agent: request.headers.get('user-agent') || 'unknown',
        },
      ])
    }

    return NextResponse.json({
      success: true,
      data: {
        updated_count: updatedCount,
        message: `${updatedCount} notificações marcadas como lidas`,
      },
    })
  } catch (error) {
    console.error(
      'Erro na API de marcar todas as notificações como lidas:',
      error
    )
    return NextResponse.json(
      { success: false, error: { message: 'Erro interno do servidor' } },
      { status: 500 }
    )
  }
}

