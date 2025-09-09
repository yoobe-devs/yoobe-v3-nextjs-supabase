import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const postalCode = searchParams.get('postal_code')

    if (!postalCode) {
      return NextResponse.json({ error: 'CEP é obrigatório' }, { status: 400 })
    }

    // Limpar CEP (remover caracteres não numéricos)
    const cleanPostalCode = postalCode.replace(/\D/g, '')

    if (cleanPostalCode.length !== 8) {
      return NextResponse.json(
        { error: 'CEP deve ter 8 dígitos' },
        { status: 400 }
      )
    }

    // Simular busca de CEP (em produção, integrar com ViaCEP ou similar)
    const mockAddressData = await getAddressByPostalCode(cleanPostalCode)

    if (!mockAddressData) {
      return NextResponse.json({ error: 'CEP não encontrado' }, { status: 404 })
    }

    return NextResponse.json(mockAddressData)
  } catch (error) {
    console.error('Erro no GET /api/address/autofill:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// Função simulada para busca de CEP
async function getAddressByPostalCode(postalCode: string) {
  // Em produção, integrar com ViaCEP ou outro serviço
  // Por enquanto, retornar dados mockados baseados no CEP

  const mockAddresses: { [key: string]: any } = {
    '01234567': {
      postal_code: '01234-567',
      state: 'SP',
      city: 'São Paulo',
      neighborhood: 'Centro',
      street: 'Rua das Flores',
    },
    '04567890': {
      postal_code: '04567-890',
      state: 'SP',
      city: 'São Paulo',
      neighborhood: 'Vila Olímpia',
      street: 'Avenida Faria Lima',
    },
    '20000000': {
      postal_code: '20000-000',
      state: 'RJ',
      city: 'Rio de Janeiro',
      neighborhood: 'Centro',
      street: 'Rua da Carioca',
    },
    '30112000': {
      postal_code: '30112-000',
      state: 'MG',
      city: 'Belo Horizonte',
      neighborhood: 'Centro',
      street: 'Rua da Bahia',
    },
    '40000000': {
      postal_code: '40000-000',
      state: 'BA',
      city: 'Salvador',
      neighborhood: 'Centro',
      street: 'Rua Chile',
    },
  }

  // Se não encontrar no mock, simular dados genéricos
  if (!mockAddresses[postalCode]) {
    return {
      postal_code: `${postalCode.slice(0, 5)}-${postalCode.slice(5)}`,
      state: 'SP',
      city: 'São Paulo',
      neighborhood: 'Centro',
      street: 'Rua Exemplo',
    }
  }

  return mockAddresses[postalCode]
}










