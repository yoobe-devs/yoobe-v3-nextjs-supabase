import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabaseService } from '@/lib/supabaseService'
import { authenticateAndAuthorize } from '@/lib/auth'

const updateReplicationSchema = z.object({
  status: z.enum(['pending', 'processing', 'completed', 'failed']).optional(),
  customizations: z.record(z.any()).optional(),
  artwork_files: z.array(z.any()).optional(),
})

export async function GET(
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

    const replicationId = params.id

    let replicationQuery = supabaseService
      .from('product_replications')
      .select(`
        id,
        budget_id,
        base_product_id,
        replicated_product_id,
        replication_type,
        status,
        customizations,
        artwork_files,
        quantity,
        unit_price,
        total_price,
        created_at,
        updated_at,
        created_by,
        budgets (
          id,
          title,
          status,
          company_id
        ),
        base_products (
          id,
          name,
          description,
          base_price,
          images,
          specifications
        ),
        products (
          id,
          name,
          price,
          status,
          stock_quantity
        ),
        users (
          id,
          name,
          email
        )
      `)
      .eq('id', replicationId)
      .single()

    // Aplicar filtros de acesso baseados no role
    if (authResult.user.role === 'manager' || authResult.user.role === 'gestor') {
      replicationQuery = replicationQuery.eq('budgets.company_id', authResult.user.company_id)
    } else if (authResult.user.role === 'admin') {
      replicationQuery = replicationQuery.eq('budgets.company_id', authResult.user.company_id)
    }

    const { data: replication, error } = await replicationQuery

    if (error || !replication) {
      return NextResponse.json(
        { success: false, error: { message: 'Replicação não encontrada' } },
        { status: 404 }
      )
    }

    // Buscar histórico da replicação
    const { data: history, error: historyError } = await supabaseService
      .from('replication_history')
      .select(`
        id,
        action,
        status_before,
        status_after,
        details,
        created_at,
        performed_by,
        users (
          id,
          name,
          email
        )
      `)
      .eq('replication_id', replicationId)
      .order('created_at', { ascending: false })

    if (historyError) {
      console.error('Erro ao buscar histórico:', historyError)
    }

    return NextResponse.json({
      success: true,
      data: { 
        replication,
        history: history || [],
      },
    })
  } catch (error) {
    console.error('Erro na API de replicação individual:', error)
    return NextResponse.json(
      { success: false, error: { message: 'Erro interno do servidor' } },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const replicationId = params.id
    const body = await request.json()
    const updateData = updateReplicationSchema.parse(body)

    // Verificar se a replicação existe e se o usuário tem acesso
    let replicationQuery = supabaseService
      .from('product_replications')
      .select('id, status, budgets!inner(company_id)')
      .eq('id', replicationId)
      .single()

    if (authResult.user.role === 'admin') {
      replicationQuery = replicationQuery.eq('budgets.company_id', authResult.user.company_id)
    }

    const { data: existingReplication, error: fetchError } = await replicationQuery

    if (fetchError || !existingReplication) {
      return NextResponse.json(
        { success: false, error: { message: 'Replicação não encontrada' } },
        { status: 404 }
      )
    }

    // Registrar status anterior para histórico
    const statusBefore = existingReplication.status

    // Atualizar replicação
    const { data: updatedReplication, error: updateError } = await supabaseService
      .from('product_replications')
      .update(updateData)
      .eq('id', replicationId)
      .select(`
        id,
        budget_id,
        base_product_id,
        replicated_product_id,
        replication_type,
        status,
        customizations,
        artwork_files,
        quantity,
        unit_price,
        total_price,
        created_at,
        updated_at
      `)
      .single()

    if (updateError) {
      console.error('Erro ao atualizar replicação:', updateError)
      return NextResponse.json(
        { success: false, error: { message: 'Erro ao atualizar replicação' } },
        { status: 500 }
      )
    }

    // Registrar no histórico se o status mudou
    if (updateData.status && updateData.status !== statusBefore) {
      await supabaseService.from('replication_history').insert([
        {
          replication_id: replicationId,
          action: 'status_change',
          status_before: statusBefore,
          status_after: updateData.status,
          details: {
            updated_by: authResult.user.name,
            reason: 'Status atualizado manualmente',
          },
          performed_by: authResult.user.id,
        },
      ])

      // Se o status mudou para 'completed', atualizar o produto replicado
      if (updateData.status === 'completed') {
        const { data: replication, error: replicationError } = await supabaseService
          .from('product_replications')
          .select('replicated_product_id, customizations, artwork_files')
          .eq('id', replicationId)
          .single()

        if (!replicationError && replication?.replicated_product_id) {
          await supabaseService
            .from('products')
            .update({
              status: 'active',
              customizations: replication.customizations,
              updated_at: new Date().toISOString(),
            })
            .eq('id', replication.replicated_product_id)
        }
      }
    }

    // Log de auditoria
    await supabaseService.from('audit_logs').insert([
      {
        action: 'update',
        table_name: 'product_replications',
        record_id: replicationId,
        user_id: authResult.user.id,
        changes: updateData,
        ip_address: request.headers.get('x-forwarded-for') || 'unknown',
        user_agent: request.headers.get('user-agent') || 'unknown',
      },
    ])

    return NextResponse.json({
      success: true,
      data: { replication: updatedReplication },
    })
  } catch (error) {
    console.error('Erro na API de replicação individual:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: { message: 'Dados inválidos', details: error.errors } },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: { message: 'Erro interno do servidor' } },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await authenticateAndAuthorize(request, [
      'admin_global',
      'superadmin',
    ])

    if (!authResult.success) {
      return NextResponse.json(
        { success: false, error: authResult.error },
        { status: authResult.status }
      )
    }

    const replicationId = params.id

    // Verificar se a replicação existe
    const { data: replication, error: fetchError } = await supabaseService
      .from('product_replications')
      .select('id, replicated_product_id, status')
      .eq('id', replicationId)
      .single()

    if (fetchError || !replication) {
      return NextResponse.json(
        { success: false, error: { message: 'Replicação não encontrada' } },
        { status: 404 }
      )
    }

    // Verificar se pode ser deletada (apenas se não estiver em produção)
    if (replication.status === 'processing') {
      return NextResponse.json(
        { success: false, error: { message: 'Não é possível deletar replicação em processamento' } },
        { status: 400 }
      )
    }

    // Deletar produto replicado se existir
    if (replication.replicated_product_id) {
      const { error: productDeleteError } = await supabaseService
        .from('products')
        .delete()
        .eq('id', replication.replicated_product_id)

      if (productDeleteError) {
        console.error('Erro ao deletar produto replicado:', productDeleteError)
      }
    }

    // Deletar histórico
    await supabaseService
      .from('replication_history')
      .delete()
      .eq('replication_id', replicationId)

    // Deletar replicação
    const { error: deleteError } = await supabaseService
      .from('product_replications')
      .delete()
      .eq('id', replicationId)

    if (deleteError) {
      console.error('Erro ao deletar replicação:', deleteError)
      return NextResponse.json(
        { success: false, error: { message: 'Erro ao deletar replicação' } },
        { status: 500 }
      )
    }

    // Log de auditoria
    await supabaseService.from('audit_logs').insert([
      {
        action: 'delete',
        table_name: 'product_replications',
        record_id: replicationId,
        user_id: authResult.user.id,
        changes: { deleted_replication_id: replicationId },
        ip_address: request.headers.get('x-forwarded-for') || 'unknown',
        user_agent: request.headers.get('user-agent') || 'unknown',
      },
    ])

    return NextResponse.json({
      success: true,
      message: 'Replicação deletada com sucesso',
    })
  } catch (error) {
    console.error('Erro na API de replicação individual:', error)
    return NextResponse.json(
      { success: false, error: { message: 'Erro interno do servidor' } },
      { status: 500 }
    )
  }
}

