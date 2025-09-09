export type UserCtx = {
  id: string
  tenantId: string
  role?: string
  tags?: Array<{ key: string; value: string }>
  departments?: string[]
}

export function canViewProduct(
  user: UserCtx,
  product: { tags?: string[] },
  policy?: any
): boolean {
  const defaultAllow = policy?.default_allow_unless_tagged ?? true
  const productHasTags = (product.tags?.length || 0) > 0
  const tagOk =
    !productHasTags || (user.tags || []).some(t => (product.tags || []).includes(t.value))
  const deptOk =
    !policy?.allowed_departments?.length ||
    (policy.allowed_departments || []).some((d: string) =>
      (user.departments || []).includes(d)
    )
  const twOk = true // TODO: checar janelas ativas
  return (defaultAllow && !productHasTags) || (tagOk && deptOk && twOk)
}

export function canRedeem(
  user: UserCtx,
  product: any,
  qty: number,
  points: number,
  limits?: any[]
): { allowed: boolean; needsApproval?: boolean } {
  // TODO: checar limites por período e thresholds da approval policy
  return { allowed: true }
}

