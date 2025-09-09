import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabaseService } from '@/lib/supabaseService'
import { authenticateAndAuthorize } from '@/lib/auth'

const updateUploadSchema = z.object({
  status: z.enum(['pending', 'processing', 'completed', 'failed', 'deleted']).optional(),
  metadata: z.record(z.any()).optional(),
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

    const uploadId = params.id

    let uploadQuery = supabaseService
      .from('file_uploads')
      .select(`
        id,
        filename,
        original_filename,
        file_path,
        file_size,
        mime_type,
        file_type,
        status,
        budget_id,
        budget_item_id,
        metadata,
        created_at,
        updated_at,
        uploaded_by,
        company_id,
        users (
          id,
          name,
          email
        ),
        companies (
          id,
          name
        ),
        budgets (
          id,
          title,
          status
        ),
        budget_items (
          id,
          quantity,
          unit_price
        )
      `)
      .eq('id', uploadId)
      .single()

    // Aplicar filtros de acesso baseados no role
    if (authResult.user.role === 'manager' || authResult.user.role === 'gestor') {
      uploadQuery = uploadQuery.eq('company_id', authResult.user.company_id)
    } else if (authResult.user.role === 'admin') {
      uploadQuery = uploadQuery.eq('company_id', authResult.user.company_id)
    }

    const { data: upload, error } = await uploadQuery

    if (error || !upload) {
      return NextResponse.json(
        { success: false, error: { message: 'Upload não encontrado' } },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: { upload },
    })
  } catch (error) {
    console.error('Erro na API de upload individual:', error)
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

    const uploadId = params.id
    const body = await request.json()
    const updateData = updateUploadSchema.parse(body)

    // Verificar se o upload existe e se o usuário tem acesso
    let uploadQuery = supabaseService
      .from('file_uploads')
      .select('id, company_id, uploaded_by, status')
      .eq('id', uploadId)
      .single()

    if (authResult.user.role === 'manager' || authResult.user.role === 'gestor') {
      uploadQuery = uploadQuery.eq('company_id', authResult.user.company_id)
    } else if (authResult.user.role === 'admin') {
      uploadQuery = uploadQuery.eq('company_id', authResult.user.company_id)
    }

    const { data: existingUpload, error: fetchError } = await uploadQuery

    if (fetchError || !existingUpload) {
      return NextResponse.json(
        { success: false, error: { message: 'Upload não encontrado' } },
        { status: 404 }
      )
    }

    // Verificar permissões para alteração de status
    if (updateData.status && updateData.status !== existingUpload.status) {
      // Apenas admins podem alterar status para 'completed' ou 'failed'
      if ((updateData.status === 'completed' || updateData.status === 'failed') && 
          !['admin', 'admin_global', 'superadmin'].includes(authResult.user.role)) {
        return NextResponse.json(
          { success: false, error: { message: 'Sem permissão para alterar status' } },
          { status: 403 }
        )
      }
    }

    // Atualizar upload
    const { data: updatedUpload, error: updateError } = await supabaseService
      .from('file_uploads')
      .update(updateData)
      .eq('id', uploadId)
      .select(`
        id,
        filename,
        original_filename,
        file_path,
        file_size,
        mime_type,
        file_type,
        status,
        budget_id,
        budget_item_id,
        metadata,
        created_at,
        updated_at
      `)
      .single()

    if (updateError) {
      console.error('Erro ao atualizar upload:', updateError)
      return NextResponse.json(
        { success: false, error: { message: 'Erro ao atualizar upload' } },
        { status: 500 }
      )
    }

    // Log de auditoria
    await supabaseService.from('audit_logs').insert([
      {
        action: 'update',
        table_name: 'file_uploads',
        record_id: uploadId,
        user_id: authResult.user.id,
        changes: updateData,
        ip_address: request.headers.get('x-forwarded-for') || 'unknown',
        user_agent: request.headers.get('user-agent') || 'unknown',
      },
    ])

    return NextResponse.json({
      success: true,
      data: { upload: updatedUpload },
    })
  } catch (error) {
    console.error('Erro na API de upload individual:', error)
    
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

    const uploadId = params.id

    // Verificar se o upload existe e se o usuário tem acesso
    let uploadQuery = supabaseService
      .from('file_uploads')
      .select('id, company_id, uploaded_by, file_path')
      .eq('id', uploadId)
      .single()

    if (authResult.user.role === 'manager' || authResult.user.role === 'gestor') {
      uploadQuery = uploadQuery.eq('company_id', authResult.user.company_id)
    } else if (authResult.user.role === 'admin') {
      uploadQuery = uploadQuery.eq('company_id', authResult.user.company_id)
    }

    const { data: upload, error: fetchError } = await uploadQuery

    if (fetchError || !upload) {
      return NextResponse.json(
        { success: false, error: { message: 'Upload não encontrado' } },
        { status: 404 }
      )
    }

    // Verificar se o usuário pode deletar (apenas o próprio usuário ou admin)
    if (upload.uploaded_by !== authResult.user.id && 
        !['admin', 'admin_global', 'superadmin'].includes(authResult.user.role)) {
      return NextResponse.json(
        { success: false, error: { message: 'Sem permissão para deletar este upload' } },
        { status: 403 }
      )
    }

    // Deletar arquivo do storage se existir
    try {
      const fileName = upload.file_path.split('/').pop()
      if (fileName) {
        await supabaseService.storage
          .from('artworks')
          .remove([fileName])
      }
    } catch (storageError) {
      console.error('Erro ao deletar arquivo do storage:', storageError)
      // Continuar com a deleção do registro mesmo se o arquivo não for encontrado
    }

    // Deletar registro do banco
    const { error: deleteError } = await supabaseService
      .from('file_uploads')
      .delete()
      .eq('id', uploadId)

    if (deleteError) {
      console.error('Erro ao deletar upload:', deleteError)
      return NextResponse.json(
        { success: false, error: { message: 'Erro ao deletar upload' } },
        { status: 500 }
      )
    }

    // Log de auditoria
    await supabaseService.from('audit_logs').insert([
      {
        action: 'delete',
        table_name: 'file_uploads',
        record_id: uploadId,
        user_id: authResult.user.id,
        changes: { deleted_file_path: upload.file_path },
        ip_address: request.headers.get('x-forwarded-for') || 'unknown',
        user_agent: request.headers.get('user-agent') || 'unknown',
      },
    ])

    return NextResponse.json({
      success: true,
      message: 'Upload deletado com sucesso',
    })
  } catch (error) {
    console.error('Erro na API de upload individual:', error)
    return NextResponse.json(
      { success: false, error: { message: 'Erro interno do servidor' } },
      { status: 500 }
    )
  }
}

