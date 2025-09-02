import { NextRequest, NextResponse } from 'next/server'
import { AcceptInvitationDTO } from '@/lib/validation'
import { audit } from '@/lib/audit'
import { createClient } from '@supabase/supabase-js'

const service = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { token, name, surname, phone, tax_id, fiscal_regime, password } = AcceptInvitationDTO.parse(body)

    // Buscar convite pelo token
    const { data: invitation, error: inviteError } = await service
      .from('user_invitations')
      .select('*')
      .eq('token', token)
      .eq('status', 'pending')
      .single()

    if (inviteError || !invitation) {
      await audit('invitation_accept_failed', 'invitations', 'system', undefined, { reason: 'invalid_or_expired_token', token })
      return NextResponse.json(
        { success: false, error: 'Convite inválido ou expirado' },
        { status: 400 }
      )
    }

    // Verificar se convite não expirou (7 dias)
    const inviteDate = new Date(invitation.created_at)
    const now = new Date()
    const daysDiff = (now.getTime() - inviteDate.getTime()) / (1000 * 3600 * 24)
    
    if (daysDiff > 7) {
      // Marcar convite como expirado
      await service
        .from('user_invitations')
        .update({ status: 'expired' })
        .eq('id', invitation.id)

      await audit('invitation_expired', 'invitations', 'system', invitation.id, { reason: 'expired_after_7_days' })
      return NextResponse.json(
        { success: false, error: 'Convite expirado' },
        { status: 400 }
      )
    }

    // Verificar se email já existe na tabela users
    const { data: existingUser, error: userCheckError } = await service
      .from('users')
      .select('id')
      .eq('email', invitation.email)
      .single()

    if (existingUser) {
      await audit('invitation_accept_failed', 'invitations', 'system', invitation.id, { reason: 'user_already_exists', email: invitation.email })
      return NextResponse.json(
        { success: false, error: 'Usuário já existe com este email' },
        { status: 409 }
      )
    }

    // Criar usuário no Supabase Auth
    const { data: authUser, error: createAuthError } = await service.auth.admin.createUser({
      email: invitation.email,
      password: password,
      email_confirm: true,
      user_metadata: {
        name,
        surname,
        phone,
        tax_id,
        fiscal_regime
      }
    })

    if (createAuthError) {
      await audit('invitation_accept_failed', 'invitations', 'system', invitation.id, { error: createAuthError.message })
      return NextResponse.json(
        { success: false, error: 'Erro ao criar usuário no sistema de autenticação' },
        { status: 500 }
      )
    }

    // Criar usuário na tabela users
    const { data: user, error: userError } = await service
      .from('users')
      .insert({
        id: authUser.user.id,
        email: invitation.email,
        name,
        surname,
        phone,
        tax_id,
        fiscal_regime,
        role: 'funcionario', // Role padrão para usuários convidados
        status: 'active'
      })
      .select()
      .single()

    if (userError) {
      // Rollback: deletar usuário do Auth
      await service.auth.admin.deleteUser(authUser.user.id)
      await audit('invitation_accept_failed', 'invitations', 'system', invitation.id, { error: userError.message })
      return NextResponse.json(
        { success: false, error: 'Erro ao criar usuário' },
        { status: 500 }
      )
    }

    // Criar role na empresa
    const { error: roleError } = await service
      .from('user_company_roles')
      .insert({
        user_id: user.id,
        company_id: invitation.company_id,
        role: 'funcionario'
      })

    if (roleError) {
      // Rollback: deletar usuário
      await service.auth.admin.deleteUser(authUser.user.id)
      await service.from('users').delete().eq('id', user.id)
      await audit('invitation_accept_failed', 'invitations', 'system', invitation.id, { error: 'role_creation_failed' })
      return NextResponse.json(
        { success: false, error: 'Erro ao associar usuário à empresa' },
        { status: 500 }
      )
    }

    // Marcar convite como aceito
    const { error: updateError } = await service
      .from('user_invitations')
      .update({ 
        status: 'accepted',
        updated_at: new Date().toISOString()
      })
      .eq('id', invitation.id)

    if (updateError) {
      console.warn('Warning: Could not update invitation status:', updateError)
    }

    await audit('invitation_accepted', 'invitations', user.id, invitation.id, { 
      companyId: invitation.company_id,
      email: invitation.email 
    })

    return NextResponse.json({ 
      success: true, 
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          surname: user.surname
        },
        message: 'Convite aceito com sucesso! Você pode fazer login agora.'
      }
    })
  } catch (error: any) {
    console.error('Error accepting invitation:', error)
    await audit('invitation_accept_error', 'invitations', 'system', undefined, { error: error.message })
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
