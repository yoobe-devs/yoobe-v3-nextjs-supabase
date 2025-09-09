import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabaseService } from '@/lib/supabaseService'
import { authenticateAndAuthorize } from '@/lib/auth'

const querySchema = z.object({
  company_id: z.string().uuid(),
  base_product_id: z.string().uuid().optional(),
  count: z.string().transform(Number).default(1),
})

export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url)
    const query = querySchema.parse({
      company_id: searchParams.get('company_id'),
      base_product_id: searchParams.get('base_product_id'),
      count: searchParams.get('count'),
    })

    // Verificar se o usuário tem acesso à empresa
    if (
      authResult.user.role === 'manager' ||
      authResult.user.role === 'gestor'
    ) {
      if (query.company_id !== authResult.user.company_id) {
        return NextResponse.json(
          { success: false, error: { message: 'Acesso negado à empresa' } },
          { status: 403 }
        )
      }
    } else if (authResult.user.role === 'admin') {
      if (query.company_id !== authResult.user.company_id) {
        return NextResponse.json(
          { success: false, error: { message: 'Acesso negado à empresa' } },
          { status: 403 }
        )
      }
    }

    // Buscar dados da empresa
    const { data: company, error: companyError } = await supabaseService
      .from('companies')
      .select('id, name, client_code')
      .eq('id', query.company_id)
      .single()

    if (companyError || !company) {
      return NextResponse.json(
        { success: false, error: { message: 'Empresa não encontrada' } },
        { status: 404 }
      )
    }

    // Determinar base_code
    let baseCode = 'ITEM' // fallback padrão

    if (query.base_product_id) {
      const { data: baseProduct, error: baseProductError } =
        await supabaseService
          .from('base_products')
          .select('id, name, base_code')
          .eq('id', query.base_product_id)
          .single()

      if (!baseProductError && baseProduct) {
        baseCode = baseProduct.base_code || baseProduct.name || 'ITEM'
      }
    }

    // Determinar client_code
    const clientCode = company.client_code || company.name || 'CLIENT'

    // Buscar último número sequencial (sem incrementar)
    const { data: counter, error: counterError } = await supabaseService
      .from('sku_counters')
      .select('last_number')
      .eq('company_id', query.company_id)
      .single()

    const lastNumber = counter?.last_number || 0

    // Gerar previews
    const samples: string[] = []
    for (let i = 1; i <= query.count; i++) {
      const seqNumber = lastNumber + i
      const finalSku = `${baseCode}-${seqNumber
        .toString()
        .padStart(4, '0')}-${clientCode}`
      samples.push(finalSku)
    }

    return NextResponse.json({
      success: true,
      data: {
        samples,
        company: {
          id: company.id,
          name: company.name,
          client_code: company.client_code,
        },
        base_code: baseCode,
        next_sequence: lastNumber + 1,
      },
    })
  } catch (error) {
    console.error('Erro na API de preview de SKU:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: { message: 'Parâmetros inválidos', details: error.errors },
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: { message: 'Erro interno do servidor' } },
      { status: 500 }
    )
  }
}
