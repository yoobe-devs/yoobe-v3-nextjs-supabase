import { NextRequest, NextResponse } from 'next/server'
import { requireUser } from '@/lib/auth'
import { audit } from '@/lib/audit'
import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321'
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
const service = createClient(url, key)

export async function GET(req: NextRequest) {
  try {
    const { userId, companyId } = await requireUser()
    
    // Get or create wallet for user
    let { data: wallet, error: walletError } = await service
      .from('wallets')
      .select('*')
      .eq('user_id', userId)
      .single()
    
    if (walletError && walletError.code === 'PGRST116') {
      // Wallet doesn't exist, create one
      const { data: newWallet, error: createError } = await service
        .from('wallets')
        .insert({
          user_id: userId,
          balance: 0
        })
        .select()
        .single()
      
      if (createError) {
        throw new Error(`Erro ao criar carteira: ${createError.message}`)
      }
      
      wallet = newWallet
    } else if (walletError) {
      throw new Error(`Erro ao buscar carteira: ${walletError.message}`)
    }
    
    // Get recent transactions
    const { data: transactions, error: transError } = await service
      .from('wallet_transactions')
      .select('*')
      .eq('wallet_id', wallet.id)
      .order('created_at', { ascending: false })
      .limit(10)
    
    if (transError) {
      console.warn('Erro ao buscar transações:', transError)
    }
    
    return NextResponse.json({
      success: true,
      data: {
        wallet: {
          id: wallet.id,
          balance: wallet.balance,
          updatedAt: wallet.updated_at
        },
        recentTransactions: transactions || []
      }
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
