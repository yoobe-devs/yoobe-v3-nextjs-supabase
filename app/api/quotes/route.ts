import { NextRequest, NextResponse } from 'next/server'
import { requireUser } from '@/lib/auth'
import { requireRole } from '@/lib/rbac'
import { CreateQuoteDTO } from '@/lib/validation'
import { audit } from '@/lib/audit'
import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321'
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
const service = createClient(url, key)

export async function POST(req: NextRequest) {
  try {
    const { userId, companyId } = await requireUser()
    
    if (!companyId) {
      return NextResponse.json({
        success: false,
        error: 'Empresa não identificada'
      }, { status: 400 })
    }
    
    // Check if user can create quotes
    const canCreate = await requireRole(userId, companyId, 'gestor')
    if (!canCreate) {
      return NextResponse.json({
        success: false,
        error: 'Permissão insuficiente para criar orçamentos'
      }, { status: 403 })
    }
    
    const body = await req.json()
    const dto = CreateQuoteDTO.parse(body)
    
    // Validate company ID matches user's company
    if (dto.companyId !== companyId) {
      return NextResponse.json({
        success: false,
        error: 'ID da empresa inválido'
      }, { status: 400 })
    }
    
    // Create quote using RPC function
    const { data: quoteId, error: rpcError } = await service.rpc('create_quote_with_items', {
      p_company: dto.companyId,
      p_requested_by: userId,
      p_items: dto.items,
      p_notes: dto.notes
    })
    
    if (rpcError) {
      throw new Error(`Erro ao criar orçamento: ${rpcError.message}`)
    }
    
    // Get created quote details
    const { data: quote, error: fetchError } = await service
      .from('quotes')
      .select(`
        *,
        quote_items (
          *,
          products (*)
        )
      `)
      .eq('id', quoteId)
      .single()
    
    if (fetchError) {
      throw new Error(`Erro ao buscar orçamento criado: ${fetchError.message}`)
    }
    
    // Log audit
    await audit('quote_created', 'quotes', userId, quoteId, {
      companyId: dto.companyId,
      requestedBy: userId,
      itemCount: dto.items.length,
      total: quote.total
    })
    
    return NextResponse.json({
      success: true,
      data: quote
    }, { status: 201 })
    
  } catch (error: any) {
    const status = error?.status || 500
    const message = error?.message || 'Erro interno do servidor'
    
    // Log error
    try {
      await audit('quote_creation_error', 'quotes', 'system', undefined, {
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
    
    if (!companyId) {
      return NextResponse.json({
        success: false,
        error: 'Empresa não identificada'
      }, { status: 400 })
    }
    
    // Get quotes for user's company
    const { data: quotes, error } = await service
      .from('quotes')
      .select(`
        *,
        requested_by_user:users!quotes_requested_by_fkey (
          id,
          name,
          email
        ),
        approved_by_user:users!quotes_approved_by_fkey (
          id,
          name,
          email
        ),
        quote_items (
          *,
          products (
            id,
            name,
            sku,
            points,
            price
          )
        )
      `)
      .eq('company_id', companyId)
      .order('created_at', { ascending: false })
    
    if (error) {
      throw new Error(`Erro ao buscar orçamentos: ${error.message}`)
    }
    
    return NextResponse.json({
      success: true,
      data: quotes || []
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
