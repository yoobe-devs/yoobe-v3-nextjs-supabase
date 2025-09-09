import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabaseService } from '@/lib/supabaseService'
import { authenticateAndAuthorize } from '@/lib/auth'

const querySchema = z.object({
  user_id: z.string().optional(),
  company_id: z.string().optional(),
  type: z.enum(['budget', 'order', 'production', 'system', 'alert']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  read: z.enum(['true', 'false']).optional(),
  limit: z.string().transform(Number).optional(),
  offset: z.string().transform(Number).optional(),
})

const createNotificationSchema = z.object({
  type: z.enum(['budget', 'order', 'production', 'system', 'alert']),
  title: z.string().min(1).max(255),
  message: z.string().min(1).max(1000),
  data: z.record(z.any()).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  user_id: z.string().optional(),
  company_id: z.string().optional(),
  budget_id: z.string().optional(),
  order_id: z.string().optional(),
})

export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url)
    const query = querySchema.parse({
      user_id: searchParams.get('user_id'),
      company_id: searchParams.get('company_id'),
      type: searchParams.get('type'),
      priority: searchParams.get('priority'),
      read: searchParams.get('read'),
      limit: searchParams.get('limit'),
      offset: searchParams.get('offset'),
    })

    let notificationsQuery = supabaseService
      .from('notifications')
      .select(
        `
        id,
        type,
        title,
        message,
        data,
        priority,
        read,
        created_at,
        user_id,
        company_id,
        budget_id,
        order_id,
        users (
          id,
          name,
          email
        ),
        companies (
          id,
          name
        )
      `
      )
      .order('created_at', { ascending: false })

    // Filtros baseados no usuário autenticado
    if (
      authResult.user.role === 'manager' ||
      authResult.user.role === 'gestor'
    ) {
      // Managers só veem notificações da sua empresa
      notificationsQuery = notificationsQuery.eq(
        'company_id',
        authResult.user.company_id
      )
    } else if (authResult.user.role === 'admin') {
      // Admins veem notificações da sua empresa
      notificationsQuery = notificationsQuery.eq(
        'company_id',
        authResult.user.company_id
      )
    }
    // superadmin e admin_global veem todas

    // Aplicar filtros adicionais
    if (query.user_id) {
      notificationsQuery = notificationsQuery.eq('user_id', query.user_id)
    }
    if (query.company_id) {
      notificationsQuery = notificationsQuery.eq('company_id', query.company_id)
    }
    if (query.type) {
      notificationsQuery = notificationsQuery.eq('type', query.type)
    }
    if (query.priority) {
      notificationsQuery = notificationsQuery.eq('priority', query.priority)
    }
    if (query.read !== undefined) {
      notificationsQuery = notificationsQuery.eq('read', query.read === 'true')
    }

    // Paginação
    const limit = query.limit || 50
    const offset = query.offset || 0
    notificationsQuery = notificationsQuery.range(offset, offset + limit - 1)

    const { data: notifications, error: notificationsError } =
      await notificationsQuery

    if (notificationsError) {
      console.error('Erro ao buscar notificações:', notificationsError)
      return NextResponse.json(
        { success: false, error: { message: 'Erro interno do servidor' } },
        { status: 500 }
      )
    }

    // Contar notificações não lidas
    const unreadCountQuery = supabaseService
      .from('notifications')
      .select('id', { count: 'exact' })
      .eq('read', false)

    if (
      authResult.user.role === 'manager' ||
      authResult.user.role === 'gestor'
    ) {
      unreadCountQuery.eq('company_id', authResult.user.company_id)
    } else if (authResult.user.role === 'admin') {
      unreadCountQuery.eq('company_id', authResult.user.company_id)
    }

    if (query.user_id) {
      unreadCountQuery.eq('user_id', query.user_id)
    }
    if (query.company_id) {
      unreadCountQuery.eq('company_id', query.company_id)
    }

    const { count: unreadCount, error: countError } = await unreadCountQuery

    if (countError) {
      console.error('Erro ao contar notificações não lidas:', countError)
    }

    return NextResponse.json({
      success: true,
      data: {
        notifications: notifications || [],
        unread_count: unreadCount || 0,
        pagination: {
          limit,
          offset,
          has_more: (notifications?.length || 0) === limit,
        },
      },
    })
  } catch (error) {
    console.error('Erro na API de notificações:', error)
    return NextResponse.json(
      { success: false, error: { message: 'Erro interno do servidor' } },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await authenticateAndAuthorize(request, [
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

    const body = await request.json()
    const notificationData = createNotificationSchema.parse(body)

    // Se não especificado, usar dados do usuário autenticado
    const finalData = {
      ...notificationData,
      user_id: notificationData.user_id || authResult.user.id,
      company_id: notificationData.company_id || authResult.user.company_id,
    }

    const { data: notification, error } = await supabaseService
      .from('notifications')
      .insert([finalData])
      .select(
        `
        id,
        type,
        title,
        message,
        data,
        priority,
        read,
        created_at,
        user_id,
        company_id,
        budget_id,
        order_id
      `
      )
      .single()

    if (error) {
      console.error('Erro ao criar notificação:', error)
      return NextResponse.json(
        { success: false, error: { message: 'Erro ao criar notificação' } },
        { status: 500 }
      )
    }

    // Log de auditoria
    await supabaseService.from('audit_logs').insert([
      {
        action: 'create',
        table_name: 'notifications',
        record_id: notification.id,
        user_id: authResult.user.id,
        changes: finalData,
        ip_address: request.headers.get('x-forwarded-for') || 'unknown',
        user_agent: request.headers.get('user-agent') || 'unknown',
      },
    ])

    return NextResponse.json({
      success: true,
      data: { notification },
    })
  } catch (error) {
    console.error('Erro na API de notificações:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: { message: 'Dados inválidos', details: error.errors },
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: { message: 'Erro interno do servidor' } },
      { status: 500 }
    )
  }
}
