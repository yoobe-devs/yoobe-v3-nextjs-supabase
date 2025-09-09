import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { assignTagsToProduct } from '@/lib/tag-gate'

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const role = (user.user_metadata as any)?.role
    if (!['admin', 'admin_global', 'superadmin', 'manager'].includes($1)) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const body = await request.json()
    const { product_ids, tag_ids } = body

    if (
      !product_ids ||
      !Array.isArray(product_ids) ||
      !tag_ids ||
      !Array.isArray(tag_ids)
    ) {
      return NextResponse.json(
        { error: 'product_ids e tag_ids devem ser arrays' },
        { status: 400 }
      )
    }

    const results = {
      success: [],
      failed: [],
    }

    // Processar cada produto
    for (const productId of product_ids) {
      try {
        const success = await assignTagsToProduct(productId, tag_ids)

        if (success) {
          results.success.push({
            product_id: productId,
            tag_ids,
          })
        } else {
          results.failed.push({
            product_id: productId,
            error: 'Erro ao atribuir tags',
          })
        }
      } catch (error) {
        results.failed.push({
          product_id: productId,
          error: 'Erro interno',
        })
      }
    }

    return NextResponse.json({
      message: 'Atribuição em lote concluída',
      results,
      summary: {
        total: product_ids.length,
        success: results.success.length,
        failed: results.failed.length,
      },
    })
  } catch (error) {
    console.error('Erro no bulk-assign:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

