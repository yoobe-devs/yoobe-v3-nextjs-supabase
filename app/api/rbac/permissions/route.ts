import { NextRequest, NextResponse } from 'next/server'
import { requireUser } from '@/lib/auth'
import { getUserPermissions } from '@/lib/rbac'
import { audit } from '@/lib/audit'

export async function GET(req: NextRequest) {
  try {
    const { userId, companyId } = await requireUser()
    
    // Get user permissions
    const permissions = await getUserPermissions(userId, companyId)
    
    // Log audit
    await audit('permissions_accessed', 'rbac', userId, undefined, {
      companyId,
      permissions: Object.keys(permissions).filter(key => permissions[key] === true)
    })
    
    return NextResponse.json({
      success: true,
      data: permissions
    })
    
  } catch (error: any) {
    const status = error?.status || 500
    const message = error?.message || 'Erro interno do servidor'
    
    // Log error
    try {
      await audit('permissions_error', 'rbac', 'system', undefined, {
        error: message,
        stack: error?.stack
      })
    } catch (auditError) {
      console.error('Erro ao registrar auditoria:', auditError)
    }
    
    return NextResponse.json({
      success: false,
      error: message
    }, { status })
  }
}
