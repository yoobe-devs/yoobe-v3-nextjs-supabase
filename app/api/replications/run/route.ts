import { NextRequest, NextResponse } from 'next/server'
import { requireUser } from '@/lib/auth'
import { requireRole } from '@/lib/rbac'
import { processAllQueuedReplications, getReplicationStats } from '@/lib/replication'
import { audit } from '@/lib/audit'

export async function POST(req: NextRequest) {
  try {
    const { userId, companyId } = await requireUser()
    
    // Check if user can run replications (admin_gestor or superadmin)
    if (companyId) {
      const canRun = await requireRole(userId, companyId, 'admin_gestor')
      if (!canRun) {
        return NextResponse.json({
          success: false,
          error: 'Permissão insuficiente para executar replicações'
        }, { status: 403 })
      }
    }
    
    // Get current stats before processing
    const statsBefore = await getReplicationStats()
    
    // Process all queued replications
    const result = await processAllQueuedReplications()
    
    // Get stats after processing
    const statsAfter = await getReplicationStats()
    
    // Log audit
    await audit('replication_job_executed', 'system', userId, {
      companyId,
      processed: result.processed,
      successful: result.successful,
      failed: result.failed,
      statsBefore,
      statsAfter
    })
    
    return NextResponse.json({
      success: true,
      data: {
        ...result,
        stats: {
          before: statsBefore,
          after: statsAfter
        }
      }
    })
    
  } catch (error: any) {
    const status = error?.status || 500
    const message = error?.message || 'Erro interno do servidor'
    
    // Log error
    try {
      await audit('replication_job_error', 'system', undefined, {
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

export async function GET(req: NextRequest) {
  try {
    const { userId, companyId } = await requireUser()
    
    // Check if user can view replication stats
    if (companyId) {
      const canView = await requireRole(userId, companyId, 'gestor')
      if (!canView) {
        return NextResponse.json({
          success: false,
          error: 'Permissão insuficiente para visualizar estatísticas de replicação'
        }, { status: 403 })
      }
    }
    
    // Get replication statistics
    const stats = await getReplicationStats()
    
    return NextResponse.json({
      success: true,
      data: stats
    })
    
  } catch (error: any) {
    const status = error?.status || 500
    const message = error?.message || 'Erro interno do servidor'
    
    return NextResponse.json({
      success: false,
      error: message
    }, { status })
  }
}
