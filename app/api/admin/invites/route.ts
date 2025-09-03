import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { randomBytes } from 'crypto'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321'
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

const supabaseService = createClient(supabaseUrl, serviceKey)

// Tipos de convite
const INVITE_TYPES = {
  GESTOR: 'gestor',
  FUNCIONARIO: 'funcionario'
} as const

type InviteType = typeof INVITE_TYPES[keyof typeof INVITE_TYPES]

// Estados do convite
const INVITE_STATUSES = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  EXPIRED: 'expired',
  CANCELLED: 'cancelled'
} as const

type InviteStatus = typeof INVITE_STATUSES[keyof typeof INVITE_STATUSES]

function isValidUuid(value: unknown): value is string {
  return typeof value === 'string' && /^[0-9a-fA-F-]{36}$/.test(value)
}

// Função para verificar autenticação via header ou cookies
async function authenticateUser(request: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies })
  
  // Primeiro, tentar autenticação via cookies (padrão)
  let { data: { user }, error: authError } = await supabase.auth.getUser()
  
  // Se não funcionar, tentar via header Authorization (conforme especificação v3)
  if (authError || !user) {
    const authHeader = request.headers.get('authorization')
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7)
      
      try {
        const { data: { user: tokenUser }, error: tokenError } = await supabaseService.auth.getUser(token)
        
        if (!tokenError && tokenUser) {
          user = tokenUser
          authError = null
        }
      } catch (error) {
        console.error('Erro ao verificar token:', error)
      }
    }
  }
  
  return { user, error: authError }
}

// Função para validar payload de convite
function validateInvitePayload(body: any) {
  const errors: string[] = []
  
  if (!body.email || typeof body.email !== 'string' || !body.email.includes('@')) {
    errors.push('Email é obrigatório e deve ser válido')
  }
  
  if (!body.invite_type || !Object.values(INVITE_TYPES).includes(body.invite_type)) {
    errors.push('Tipo de convite deve ser "gestor" ou "funcionario"')
  }
  
  if (!body.company_id || !isValidUuid(body.company_id)) {
    errors.push('Company ID é obrigatório e deve ser um UUID válido')
  }
  
  if (body.invite_type === INVITE_TYPES.GESTOR) {
    if (!body.company_name || typeof body.company_name !== 'string') {
      errors.push('Nome da empresa é obrigatório para convites de gestor')
    }
  }
  
  if (body.expires_in_days && (!Number.isInteger(body.expires_in_days) || body.expires_in_days < 1)) {
    errors.push('Dias para expiração deve ser um inteiro positivo')
  }
  
  if (body.notes && typeof body.notes !== 'string') {
    errors.push('Notas devem ser uma string')
  }
  
  return errors
}

// Função para gerar token único de convite
function generateInviteToken(): string {
  return randomBytes(32).toString('hex')
}

// Função para criar tabelas de convites se não existirem
async function ensureInvitesSchema() {
  const createSql = `
    CREATE TABLE IF NOT EXISTS invites (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      tenant_id UUID NOT NULL,
      company_id UUID NOT NULL,
      email TEXT NOT NULL,
      invite_type TEXT NOT NULL CHECK (invite_type IN ('gestor', 'funcionario')),
      token TEXT UNIQUE NOT NULL,
      status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired', 'cancelled')),
      company_name TEXT,
      notes TEXT,
      expires_at TIMESTAMPTZ NOT NULL,
      accepted_at TIMESTAMPTZ,
      accepted_by UUID,
      created_by UUID NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
    
    CREATE INDEX IF NOT EXISTS idx_invites_tenant ON invites(tenant_id);
    CREATE INDEX IF NOT EXISTS idx_invites_company ON invites(company_id);
    CREATE INDEX IF NOT EXISTS idx_invites_email ON invites(email);
    CREATE INDEX IF NOT EXISTS idx_invites_token ON invites(token);
    CREATE INDEX IF NOT EXISTS idx_invites_status ON invites(status);
    CREATE INDEX IF NOT EXISTS idx_invites_expires_at ON invites(expires_at);
  `
  try {
    await supabaseService.rpc('exec_sql', { sql: createSql })
  } catch (e: any) {
    console.warn('ensureInvitesSchema: não foi possível executar exec_sql (pode não existir).', e?.message)
  }
}

// GET - Listar convites
export async function GET(request: NextRequest) {
  try {
    await ensureInvitesSchema()
    
    const { user, error: authError } = await authenticateUser(request)
    if (authError || !user) {
      return NextResponse.json({ 
        success: false,
        error: { 
          code: 'UNAUTHORIZED',
          message: 'Não autorizado',
          details: 'Token inválido ou expirado'
        }
      }, { status: 401 })
    }

    // Verificar role do usuário (apenas admin_global e gestor)
    const userRole = user.user_metadata?.role
    if (!['admin_global', 'manager'].includes(userRole)) {
      return NextResponse.json({ 
        success: false,
        error: { 
          code: 'FORBIDDEN',
          message: 'Acesso negado',
          details: 'Apenas administradores globais e gestores podem listar convites'
        }
      }, { status: 403 })
    }

    const companyIdRaw = user.user_metadata?.company_id
    if (!companyIdRaw) {
      return NextResponse.json({ 
        success: false,
        error: { 
          code: 'VALIDATION_ERROR',
          message: 'Company ID não encontrado',
          details: 'Usuário deve estar associado a uma empresa'
        }
      }, { status: 400 })
    }
    const companyId = isValidUuid(companyIdRaw) ? companyIdRaw : '00000000-0000-0000-0000-000000000001'

    // Parâmetros de busca
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || ''
    const invite_type = searchParams.get('invite_type') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || ''

    // Query base para convites
    let query = supabaseService
      .from('invites')
      .select('*', { count: 'exact' })
      .eq('company_id', companyId)

    // Aplicar filtros
    if (status && Object.values(INVITE_STATUSES).includes(status as InviteStatus)) {
      query = query.eq('status', status)
    }
    
    if (invite_type && Object.values(INVITE_TYPES).includes(invite_type as InviteType)) {
      query = query.eq('invite_type', invite_type)
    }
    
    if (search) {
      query = query.or(`email.ilike.%${search}%,company_name.ilike.%${search}%`)
    }

    // Paginação
    const from = (page - 1) * limit
    const to = from + limit - 1

    const { data: invites, error: invitesError, count } = await query
      .range(from, to)
      .order('created_at', { ascending: false })

    if (invitesError) {
      console.error('Erro ao buscar convites:', invitesError)
      return NextResponse.json({ 
        success: false,
        error: { 
          code: 'INTERNAL_ERROR',
          message: 'Erro ao buscar convites',
          details: 'Falha na consulta ao banco de dados'
        }
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: {
        invites: invites || [],
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit)
        }
      },
      meta: {
        statuses: Object.values(INVITE_STATUSES),
        types: Object.values(INVITE_TYPES),
        totalInvites: count || 0
      }
    })

  } catch (error) {
    console.error('Erro na API de listagem de convites:', error)
    return NextResponse.json({ 
      success: false,
      error: { 
        code: 'INTERNAL_ERROR',
        message: 'Erro interno do servidor',
        details: 'Falha inesperada no processamento da requisição'
      }
    }, { status: 500 })
  }
}

// POST - Criar novo convite
export async function POST(request: NextRequest) {
  try {
    await ensureInvitesSchema()
    
    const { user, error: authError } = await authenticateUser(request)
    if (authError || !user) {
      return NextResponse.json({ 
        success: false,
        error: { 
          code: 'UNAUTHORIZED',
          message: 'Não autorizado',
          details: 'Token inválido ou expirado'
        }
      }, { status: 401 })
    }

    // Verificar role do usuário (apenas admin_global e gestor)
    const userRole = user.user_metadata?.role
    if (!['admin_global', 'manager'].includes(userRole)) {
      return NextResponse.json({ 
        success: false,
        error: { 
          code: 'FORBIDDEN',
          message: 'Acesso negado',
          details: 'Apenas administradores globais e gestores podem criar convites'
        }
      }, { status: 403 })
    }

    const companyIdRaw = user.user_metadata?.company_id
    if (!companyIdRaw) {
      return NextResponse.json({ 
        success: false,
        error: { 
          code: 'VALIDATION_ERROR',
          message: 'Company ID não encontrado',
          details: 'Usuário deve estar associado a uma empresa'
        }
      }, { status: 400 })
    }
    const companyId = isValidUuid(companyIdRaw) ? companyIdRaw : '00000000-0000-0000-0000-000000000001'

    const body = await request.json()
    
    // Validação do payload
    const validationErrors = validateInvitePayload(body)
    if (validationErrors.length > 0) {
      return NextResponse.json({ 
        success: false,
        error: { 
          code: 'VALIDATION_ERROR',
          message: 'Dados inválidos',
          details: validationErrors.join('; ')
        }
      }, { status: 422 })
    }

    const { 
      email, 
      invite_type, 
      company_id: targetCompanyId, 
      company_name, 
      expires_in_days = 7,
      notes 
    } = body

    // Verificar se o usuário tem permissão para convidar para esta empresa
    if (userRole === 'manager' && targetCompanyId !== companyId) {
      return NextResponse.json({ 
        success: false,
        error: { 
          code: 'FORBIDDEN',
          message: 'Acesso negado',
          details: 'Gestores só podem convidar para sua própria empresa'
        }
      }, { status: 403 })
    }

    // Verificar se já existe um convite pendente para este email
    const { data: existingInvite, error: checkError } = await supabaseService
      .from('invites')
      .select('id, status')
      .eq('email', email.toLowerCase())
      .eq('company_id', targetCompanyId)
      .eq('status', INVITE_STATUSES.PENDING)
      .single()

    if (existingInvite) {
      return NextResponse.json({ 
        success: false,
        error: { 
          code: 'CONFLICT',
          message: 'Convite já existe',
          details: 'Já existe um convite pendente para este email nesta empresa'
        }
      }, { status: 409 })
    }

    // Gerar token único
    const token = generateInviteToken()
    
    // Calcular data de expiração
    const expiresAt = new Date(Date.now() + expires_in_days * 24 * 60 * 60 * 1000)

    // Criar convite
    const inviteData = {
      tenant_id: targetCompanyId,
      company_id: targetCompanyId,
      email: email.toLowerCase(),
      invite_type,
      token,
      status: INVITE_STATUSES.PENDING,
      company_name: invite_type === INVITE_TYPES.GESTOR ? company_name : null,
      notes: notes?.trim() || null,
      expires_at: expiresAt.toISOString(),
      created_by: user.id
    }

    const { data: invite, error: createError } = await supabaseService
      .from('invites')
      .insert(inviteData)
      .select()
      .single()

    if (createError) {
      console.error('Erro ao criar convite:', createError)
      return NextResponse.json({ 
        success: false,
        error: { 
          code: 'INTERNAL_ERROR',
          message: 'Erro ao criar convite',
          details: 'Falha na inserção no banco de dados'
        }
      }, { status: 500 })
    }

    // Enviar email de convite (implementação básica)
    try {
      const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/invites/accept?token=${token}`
      
      // Aqui você pode integrar com seu serviço de email (SendGrid, AWS SES, etc.)
      console.log(`📧 Convite enviado para ${email}: ${inviteUrl}`)
      
      // Por enquanto, apenas log. Em produção, enviar email real
      if (process.env.NODE_ENV === 'development') {
        console.log('🔗 Link do convite (DEV):', inviteUrl)
      }
      
    } catch (emailError) {
      console.warn('Erro ao enviar email (não crítico):', emailError)
    }

    // Registrar na auditoria
    try {
      await supabaseService
        .from('audit_log')
        .insert({
          event_type: 'invite_created',
          actor_id: user.id,
          role: userRole,
          tenant_id: targetCompanyId,
          target: 'invites',
          target_id: invite.id,
          payload: {
            action: 'create',
            email: email.toLowerCase(),
            invite_type,
            company_id: targetCompanyId,
            expires_in_days
          },
          ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
          ua: request.headers.get('user-agent') || 'unknown'
        })
    } catch (auditError) {
      console.warn('Erro ao registrar auditoria (não crítico):', auditError)
    }

    return NextResponse.json({
      success: true,
      data: {
        message: 'Convite criado com sucesso',
        invite: {
          ...invite,
          invite_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/invites/accept?token=${token}`
        }
      },
      meta: {
        invite_type,
        expires_at: expiresAt.toISOString(),
        created_by: user.id
      }
    }, { status: 201 })

  } catch (error) {
    console.error('Erro na API de criação de convites:', error)
    return NextResponse.json({ 
      success: false,
      error: { 
        code: 'INTERNAL_ERROR',
        message: 'Erro interno do servidor',
        details: 'Falha inesperada no processamento da requisição'
      }
    }, { status: 500 })
  }
}
