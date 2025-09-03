import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    // Autenticação
    const supabase = createRouteHandlerClient({ cookies })
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const role = (user.user_metadata as any)?.role
    if (!['admin', 'admin_global', 'superadmin', 'manager'].includes(role)) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const body = await request.json()
    const { sku, productId } = body

    if (!sku) {
      return NextResponse.json({ error: 'SKU é obrigatório' }, { status: 400 })
    }

    // Gerar EAN-13 baseado no SKU
    const ean13 = generateEAN13(sku)

    // Se productId foi fornecido, atualizar o produto
    if (productId) {
      const { error: updateError } = await supabase
        .from('client_products')
        .update({ ean_13: ean13 })
        .eq('id', productId)

      if (updateError) {
        return NextResponse.json(
          {
            error: 'Erro ao atualizar produto',
            details: updateError.message,
          },
          { status: 500 }
        )
      }
    }

    return NextResponse.json({
      success: true,
      ean13: ean13,
      message: 'EAN-13 gerado com sucesso',
    })
  } catch (error) {
    console.error('Erro ao gerar EAN-13:', error)
    return NextResponse.json(
      {
        error: 'Erro interno do servidor',
      },
      { status: 500 }
    )
  }
}

// Função para gerar EAN-13 válido
function generateEAN13(sku: string): string {
  // Converter SKU para números (remover caracteres não numéricos)
  const numericSku = sku.replace(/\D/g, '')

  // Pegar os primeiros 12 dígitos
  let base = numericSku.padEnd(12, '0').substring(0, 12)

  // Calcular dígito verificador
  let sum = 0
  for (let i = 0; i < 12; i++) {
    const digit = parseInt(base[i])
    sum += digit * (i % 2 === 0 ? 1 : 3)
  }

  const checkDigit = (10 - (sum % 10)) % 10

  return base + checkDigit
}

// Função para validar EAN-13
export function validateEAN13(ean13: string): boolean {
  if (!ean13 || ean13.length !== 13 || !/^\d{13}$/.test(ean13)) {
    return false
  }

  let sum = 0
  for (let i = 0; i < 12; i++) {
    const digit = parseInt(ean13[i])
    sum += digit * (i % 2 === 0 ? 1 : 3)
  }

  const checkDigit = (10 - (sum % 10)) % 10
  return checkDigit === parseInt(ean13[12])
}
