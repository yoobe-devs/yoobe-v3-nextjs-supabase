import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export interface ApprovalPolicy {
  id: string
  tenantId: string
  name: string
  description?: string
  spec: {
    thresholds: Array<{
      categoryId?: string
      maxPoints?: number
      maxAmount?: number
      requiresApprovalAbove: boolean
    }>
    steps: Array<{
      step: number
      approver: {
        type: 'manager_of_department' | 'role' | 'user'
        value?: string
        id?: string
      }
    }>
    slaHours: number
    escalation?: {
      afterHours: number
      toRole: string
    }
  }
  isActive: boolean
}

export interface Approval {
  id: string
  tenantId: string
  requestType: 'rescue' | 'order'
  requestId: string
  status: 'pending' | 'approved' | 'rejected' | 'escalated'
  policyId?: string
  currentStep: number
  meta: any
  requestedBy: string
  createdAt: string
  updatedAt: string
}

export interface ApprovalStep {
  id: string
  approvalId: string
  stepNo: number
  approverUserId?: string
  approverRole?: string
  status: 'pending' | 'approved' | 'rejected'
  comment?: string
  actedAt?: string
  createdAt: string
}

/**
 * Verifica se uma solicitação requer aprovação
 */
export async function checkApprovalRequired(
  userId: string,
  productId: string,
  quantity: number,
  points: number,
  amount: number,
  tenantId: string
): Promise<{
  requiresApproval: boolean
  policyId?: string
  reason?: string
}> {
  try {
    // Buscar políticas de aprovação ativas
    const { data: policies, error } = await supabase
      .from('approval_policies')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('is_active', true)

    if (error) {
      throw new Error(`Erro ao buscar políticas de aprovação: ${error.message}`)
    }

    if (!policies || policies.length === 0) {
      return { requiresApproval: false }
    }

    // Verificar cada política
    for (const policy of policies) {
      const spec = policy.spec

      // Verificar thresholds
      for (const threshold of spec.thresholds) {
        if (threshold.requiresApprovalAbove) {
          // Verificar se excede o limite de pontos
          if (threshold.maxPoints && points > threshold.maxPoints) {
            return {
              requiresApproval: true,
              policyId: policy.id.toString(),
              reason: `Valor em pontos (${points}) excede o limite de ${threshold.maxPoints}`,
            }
          }

          // Verificar se excede o limite de valor
          if (threshold.maxAmount && amount > threshold.maxAmount) {
            return {
              requiresApproval: true,
              policyId: policy.id.toString(),
              reason: `Valor em reais (R$ ${amount.toFixed(2)}) excede o limite de R$ ${threshold.maxAmount.toFixed(2)}`,
            }
          }
        }
      }
    }

    return { requiresApproval: false }
  } catch (error) {
    console.error('Erro ao verificar aprovação:', error)
    return { requiresApproval: false, reason: 'Erro ao verificar aprovação' }
  }
}

/**
 * Cria uma solicitação de aprovação
 */
export async function createApproval(
  tenantId: string,
  requestType: 'rescue' | 'order',
  requestId: string,
  policyId: string,
  requestedBy: string,
  meta: any = {}
): Promise<Approval> {
  try {
    // Criar aprovação
    const { data: approval, error: approvalError } = await supabase
      .from('approvals')
      .insert({
        tenant_id: tenantId,
        request_type: requestType,
        request_id: requestId,
        policy_id: policyId,
        status: 'pending',
        current_step: 1,
        meta,
        requested_by: requestedBy,
      })
      .select()
      .single()

    if (approvalError) {
      throw new Error(`Erro ao criar aprovação: ${approvalError.message}`)
    }

    // Buscar política para criar steps
    const { data: policy, error: policyError } = await supabase
      .from('approval_policies')
      .select('*')
      .eq('id', policyId)
      .single()

    if (policyError) {
      throw new Error(`Erro ao buscar política: ${policyError.message}`)
    }

    // Criar steps de aprovação
    const steps = policy.spec.steps
    for (const step of steps) {
      await createApprovalStep(approval.id, step.step, step.approver)
    }

    return {
      id: approval.id.toString(),
      tenantId: approval.tenant_id.toString(),
      requestType: approval.request_type,
      requestId: approval.request_id.toString(),
      status: approval.status,
      policyId: approval.policy_id?.toString(),
      currentStep: approval.current_step,
      meta: approval.meta,
      requestedBy: approval.requested_by.toString(),
      createdAt: approval.created_at,
      updatedAt: approval.updated_at,
    }
  } catch (error) {
    console.error('Erro ao criar aprovação:', error)
    throw error
  }
}

/**
 * Cria um step de aprovação
 */
async function createApprovalStep(
  approvalId: string,
  stepNo: number,
  approver: any
): Promise<void> {
  try {
    const { error } = await supabase.from('approval_steps').insert({
      approval_id: approvalId,
      step_no: stepNo,
      approver_user_id: approver.id,
      approver_role: approver.type === 'role' ? approver.value : undefined,
      status: 'pending',
    })

    if (error) {
      throw new Error(`Erro ao criar step de aprovação: ${error.message}`)
    }
  } catch (error) {
    console.error('Erro ao criar step de aprovação:', error)
    throw error
  }
}

/**
 * Aprova um step de aprovação
 */
export async function approveStep(
  approvalId: string,
  stepNo: number,
  approverUserId: string,
  comment?: string
): Promise<{
  success: boolean
  isComplete: boolean
  nextStep?: number
}> {
  try {
    // Atualizar status do step
    const { error: stepError } = await supabase
      .from('approval_steps')
      .update({
        status: 'approved',
        comment,
        acted_at: new Date().toISOString(),
      })
      .eq('approval_id', approvalId)
      .eq('step_no', stepNo)
      .eq('approver_user_id', approverUserId)

    if (stepError) {
      throw new Error(`Erro ao aprovar step: ${stepError.message}`)
    }

    // Verificar se há próximo step
    const { data: nextStep, error: nextStepError } = await supabase
      .from('approval_steps')
      .select('step_no')
      .eq('approval_id', approvalId)
      .eq('step_no', stepNo + 1)
      .eq('status', 'pending')
      .single()

    if (nextStepError && nextStepError.code !== 'PGRST116') {
      throw new Error(
        `Erro ao verificar próximo step: ${nextStepError.message}`
      )
    }

    if (nextStep) {
      // Atualizar current_step da aprovação
      const { error: approvalError } = await supabase
        .from('approvals')
        .update({ current_step: stepNo + 1 })
        .eq('id', approvalId)

      if (approvalError) {
        throw new Error(`Erro ao atualizar aprovação: ${approvalError.message}`)
      }

      return {
        success: true,
        isComplete: false,
        nextStep: stepNo + 1,
      }
    } else {
      // Aprovação completa
      const { error: approvalError } = await supabase
        .from('approvals')
        .update({
          status: 'approved',
          current_step: stepNo,
        })
        .eq('id', approvalId)

      if (approvalError) {
        throw new Error(`Erro ao finalizar aprovação: ${approvalError.message}`)
      }

      return {
        success: true,
        isComplete: true,
      }
    }
  } catch (error) {
    console.error('Erro ao aprovar step:', error)
    throw error
  }
}

/**
 * Rejeita um step de aprovação
 */
export async function rejectStep(
  approvalId: string,
  stepNo: number,
  approverUserId: string,
  comment: string
): Promise<{
  success: boolean
}> {
  try {
    // Atualizar status do step
    const { error: stepError } = await supabase
      .from('approval_steps')
      .update({
        status: 'rejected',
        comment,
        acted_at: new Date().toISOString(),
      })
      .eq('approval_id', approvalId)
      .eq('step_no', stepNo)
      .eq('approver_user_id', approverUserId)

    if (stepError) {
      throw new Error(`Erro ao rejeitar step: ${stepError.message}`)
    }

    // Atualizar status da aprovação para rejeitada
    const { error: approvalError } = await supabase
      .from('approvals')
      .update({ status: 'rejected' })
      .eq('id', approvalId)

    if (approvalError) {
      throw new Error(`Erro ao rejeitar aprovação: ${approvalError.message}`)
    }

    return { success: true }
  } catch (error) {
    console.error('Erro ao rejeitar step:', error)
    throw error
  }
}

/**
 * Busca aprovações pendentes para um usuário
 */
export async function getPendingApprovals(
  userId: string,
  tenantId: string
): Promise<Approval[]> {
  try {
    const { data: approvals, error } = await supabase
      .from('approvals')
      .select(
        `
        *,
        approval_steps!inner(
          step_no,
          approver_user_id,
          status
        )
      `
      )
      .eq('tenant_id', tenantId)
      .eq('status', 'pending')
      .eq('approval_steps.approver_user_id', userId)
      .eq('approval_steps.status', 'pending')
      .eq('approval_steps.step_no', 'current_step')

    if (error) {
      throw new Error(`Erro ao buscar aprovações pendentes: ${error.message}`)
    }

    return (
      approvals?.map(approval => ({
        id: approval.id.toString(),
        tenantId: approval.tenant_id.toString(),
        requestType: approval.request_type,
        requestId: approval.request_id.toString(),
        status: approval.status,
        policyId: approval.policy_id?.toString(),
        currentStep: approval.current_step,
        meta: approval.meta,
        requestedBy: approval.requested_by.toString(),
        createdAt: approval.created_at,
        updatedAt: approval.updated_at,
      })) || []
    )
  } catch (error) {
    console.error('Erro ao buscar aprovações pendentes:', error)
    return []
  }
}

/**
 * Cria uma política de aprovação
 */
export async function createApprovalPolicy(
  tenantId: string,
  name: string,
  description: string,
  spec: ApprovalPolicy['spec']
): Promise<ApprovalPolicy> {
  try {
    const { data: policy, error } = await supabase
      .from('approval_policies')
      .insert({
        tenant_id: tenantId,
        name,
        description,
        spec,
        is_active: true,
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Erro ao criar política de aprovação: ${error.message}`)
    }

    return {
      id: policy.id.toString(),
      tenantId: policy.tenant_id.toString(),
      name: policy.name,
      description: policy.description,
      spec: policy.spec,
      isActive: policy.is_active,
    }
  } catch (error) {
    console.error('Erro ao criar política de aprovação:', error)
    throw error
  }
}
