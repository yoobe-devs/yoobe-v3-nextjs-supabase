import { NextRequest, NextResponse } from 'next/server'
import { requireUser } from '@/lib/auth'
import { AddressSchema } from '@/lib/validation'
import { audit } from '@/lib/audit'
import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321'
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
const service = createClient(url, key)

export async function POST(req: NextRequest) {
  try {
    const { userId, companyId } = await requireUser()
    const body = await req.json()
    const addressData = AddressSchema.parse(body)
    
    // Create address
    const { data: address, error } = await service
      .from('addresses')
      .insert({
        user_id: userId,
        street: addressData.street,
        number: addressData.number,
        neighborhood: addressData.neighborhood,
        city: addressData.city,
        state: addressData.state,
        country: addressData.country,
        zip_code: addressData.zip_code,
        is_default: addressData.is_default
      })
      .select()
      .single()
    
    if (error) {
      throw new Error(`Erro ao criar endereço: ${error.message}`)
    }
    
    // Log audit
    await audit('address_created', 'addresses', address.id, {
      userId,
      companyId,
      isDefault: addressData.is_default,
      city: addressData.city,
      state: addressData.state
    })
    
    return NextResponse.json({
      success: true,
      data: address
    }, { status: 201 })
    
  } catch (error: any) {
    const status = error?.status || 500
    const message = error?.message || 'Erro interno do servidor'
    
    return NextResponse.json({
      success: false,
      error: message
    }, { status })
  }
}

export async function GET(req: NextRequest) {
  try {
    const { userId, companyId } = await requireUser()
    const searchParams = req.nextUrl.searchParams
    const targetUserId = searchParams.get('userId') || userId
    
    // Users can only see their own addresses
    if (targetUserId !== userId) {
      return NextResponse.json({
        success: false,
        error: 'Não autorizado para visualizar endereços de outros usuários'
      }, { status: 403 })
    }
    
    const { data: addresses, error } = await service
      .from('addresses')
      .select('*')
      .eq('user_id', targetUserId)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: false })
    
    if (error) {
      throw new Error(`Erro ao buscar endereços: ${error.message}`)
    }
    
    return NextResponse.json({
      success: true,
      data: addresses || []
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
