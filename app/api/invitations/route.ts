import { NextRequest, NextResponse } from 'next/server'
import { requireUser } from '@/lib/auth'
import { requireRole } from '@/lib/rbac'
import { CreateInvitationDTO } from '@/lib/validation'
import { audit } from '@/lib/audit'
import { createClient } from '@supabase/supabase-js'
import { randomBytes } from 'crypto'

const service = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const { userId, companyId } = await requireUser()
    
    // Verificar se usuário tem permissão para criar convites
    const canCreate = await requireRole(userId, companyId, 'gestor')
    if (!canCreate) {
      await audit('invitation_creation_denied', 'invitations', userId, undefined, { companyId, reason: 'insufficient_permissions' })
      return NextResponse.json(
        { success: false, error: 'Permissão insuficiente para criar convites' },
        { status: 403 }
      )
    }

    const body = await req.json()
    const invitationData = CreateInvitationDTO.parse(body)

    // Verificar se email já foi convidado
    const { data: existingInvitation, error: checkError } = await service
      .from('user_invitations')
      .select('id, status')
      .eq('email', invitationData.email)
      .eq('company_id', companyId)
      .single()

    if (existingInvitation) {
      if (existingInvitation.status === 'pending') {
        await audit('invitation_creation_failed', 'invitations', userId, undefined, { companyId, reason: 'email_already_invited', email: invitationData.email })
        return NextResponse.json(
          { success: false, error: 'Este email já foi convidado e está pendente' },
          { status: 409 }
        )
      }
    }

    // Gerar token único
    const token = randomBytes(32).toString('hex')
    
    // Criar convite
    const { data: invitation, error } = await service
      .from('user_invitations')
      .insert({
        email: invitationData.email,
        company_id: companyId,
        invited_by: userId,
        token,
        status: 'pending'
      })
      .select()
      .single()

    if (error) {
      await audit('invitation_creation_failed', 'invitations', userId, undefined, { companyId, error: error.message })
      return NextResponse.json(
        { success: false, error: 'Erro ao criar convite' },
        { status: 500 }
      )
    }

    // TODO: Enviar email com link de convite
    // const inviteLink = `${process.env.NEXT_PUBLIC_APP_URL}/invite?token=${token}`
    // await sendInvitationEmail(invitationData.email, inviteLink)

    await audit('invitation_created', 'invitations', userId, invitation.id, { companyId, email: invitationData.email })
    
    return NextResponse.json({ 
      success: true, 
      data: invitation,
      message: 'Convite enviado com sucesso'
    }, { status: 201 })
  } catch (error: any) {
    console.error('Error creating invitation:', error)
    await audit('invitation_creation_error', 'invitations', 'system', undefined, { error: error.message })
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    const { userId, companyId } = await requireUser()
    
    // Verificar se usuário tem permissão para listar convites
    const canRead = await requireRole(userId, companyId, 'gestor')
    if (!canRead) {
      await audit('invitations_list_denied', 'invitations', userId, undefined, { companyId, reason: 'insufficient_permissions' })
      return NextResponse.json(
        { success: false, error: 'Permissão insuficiente para listar convites' },
        { status: 403 }
      )
    }

    const searchParams = req.nextUrl.searchParams
    const status = searchParams.get('status')
    const search = searchParams.get('search')

    let query = service
      .from('user_invitations')
      .select(`
        *,
        invited_by_user:users!user_invitations_invited_by_fkey(id, name, email)
      `)
      .eq('company_id', companyId)

    if (status) {
      query = query.eq('status', status)
    }
    if (search) {
      query = query.ilike('email', `%${search}%`)
    }

    const { data: invitations, error } = await query.order('created_at', { ascending: false })

    if (error) {
      await audit('invitations_list_error', 'invitations', userId, undefined, { companyId, error: error.message })
      return NextResponse.json(
        { success: false, error: 'Erro ao buscar convites' },
        { status: 500 }
      )
    }

    await audit('invitations_listed', 'invitations', userId, undefined, { companyId, count: invitations?.length || 0 })
    
    return NextResponse.json({ success: true, data: invitations || [] })
  } catch (error: any) {
    console.error('Error listing invitations:', error)
    await audit('invitations_list_error', 'invitations', 'system', undefined, { error: error.message })
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
