import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

const supabaseUrl = 'http://localhost:54321'
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'
const supabaseService = createClient(supabaseUrl, serviceKey)

// POST - Sincronizar produtos com Cubbo (simulado em desenvolvimento)
export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { data: userData, error: userError } = await supabaseService
      .from('users')
      .select('company_id, role, store_id')
      .eq('id', user.id)
      .single()

    if (userError || !userData || userData.role !== 'manager') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const body = await request.json()
    const { sync_type = 'products' } = body

    // Em desenvolvimento, simular sincronização
    const isDevelopment = process.env.NODE_ENV === 'development'

    if (isDevelopment) {
      // Simular sincronização com delay
      await new Promise(resolve => setTimeout(resolve, 1000))

      if (sync_type === 'products') {
        // Buscar produtos da loja
        const { data: products, error: productsError } = await supabaseService
          .from('company_products')
          .select('*')
          .eq('store_id', userData.store_id)
          .eq('status', 'active')

        if (productsError) {
          console.error('Erro ao buscar produtos:', productsError)
          return NextResponse.json({ error: 'Erro ao buscar produtos' }, { status: 500 })
        }

        // Simular sincronização de cada produto
        const syncResults = []
        for (const product of products || []) {
          // Gerar ID simulado do Cubbo
          const cubboProductId = `cubbo_${product.id}_${Date.now()}`
          
          // Registrar log de sincronização
          const { error: logError } = await supabaseService
            .from('product_sync_log')
            .insert({
              product_id: product.id,
              store_id: userData.store_id,
              sync_type: 'cubbo',
              sync_status: 'success',
              cubbo_product_id: cubboProductId,
              sync_data: {
                product_name: product.name,
                product_price: product.price,
                product_stock: product.stock_quantity,
                sync_timestamp: new Date().toISOString()
              },
              last_sync_attempt: new Date().toISOString()
            })

          if (!logError) {
            syncResults.push({
              product_id: product.id,
              product_name: product.name,
              cubbo_product_id: cubboProductId,
              status: 'success'
            })
          }
        }

        // Atualizar estoque sincronizado
        for (const product of products || []) {
          await supabaseService
            .from('inventory_sync')
            .upsert({
              product_id: product.id,
              store_id: userData.store_id,
              local_quantity: product.stock_quantity,
              cubbo_quantity: product.stock_quantity, // Em desenvolvimento, usar mesmo valor
              last_sync_at: new Date().toISOString(),
              sync_status: 'synced'
            }, {
              onConflict: 'product_id,store_id'
            })
        }

        return NextResponse.json({
          message: 'Produtos sincronizados com sucesso (ambiente de desenvolvimento)',
          sync_type: 'products',
          total_products: products?.length || 0,
          sync_results: syncResults,
          environment: 'development'
        })
      }

      if (sync_type === 'inventory') {
        // Buscar produtos para sincronizar estoque
        const { data: products, error: productsError } = await supabaseService
          .from('company_products')
          .select('*')
          .eq('store_id', userData.store_id)
          .eq('status', 'active')

        if (productsError) {
          console.error('Erro ao buscar produtos:', productsError)
          return NextResponse.json({ error: 'Erro ao buscar produtos' }, { status: 500 })
        }

        // Sincronizar estoque
        const inventoryResults = []
        for (const product of products || []) {
          await supabaseService
            .from('inventory_sync')
            .upsert({
              product_id: product.id,
              store_id: userData.store_id,
              local_quantity: product.stock_quantity,
              cubbo_quantity: product.stock_quantity,
              last_sync_at: new Date().toISOString(),
              sync_status: 'synced'
            }, {
              onConflict: 'product_id,store_id'
            })

          inventoryResults.push({
            product_id: product.id,
            product_name: product.name,
            local_quantity: product.stock_quantity,
            cubbo_quantity: product.stock_quantity,
            status: 'synced'
          })
        }

        return NextResponse.json({
          message: 'Estoque sincronizado com sucesso (ambiente de desenvolvimento)',
          sync_type: 'inventory',
          total_products: products?.length || 0,
          inventory_results: inventoryResults,
          environment: 'development'
        })
      }

      if (sync_type === 'orders') {
        // Buscar pedidos recentes
        const { data: orders, error: ordersError } = await supabaseService
          .from('orders')
          .select('*')
          .eq('store_id', userData.store_id)
          .order('created_at', { ascending: false })
          .limit(10)

        if (ordersError) {
          console.error('Erro ao buscar pedidos:', ordersError)
          return NextResponse.json({ error: 'Erro ao buscar pedidos' }, { status: 500 })
        }

        // Simular sincronização de pedidos
        const orderResults = []
        for (const order of orders || []) {
          const cubboOrderId = `cubbo_order_${order.id}_${Date.now()}`
          
          await supabaseService
            .from('cubbo_orders')
            .upsert({
              order_id: order.id,
              cubbo_order_id: cubboOrderId,
              cubbo_status: 'pending',
              created_at: new Date().toISOString()
            }, {
              onConflict: 'order_id'
            })

          orderResults.push({
            order_id: order.id,
            cubbo_order_id: cubboOrderId,
            status: 'synced'
          })
        }

        return NextResponse.json({
          message: 'Pedidos sincronizados com sucesso (ambiente de desenvolvimento)',
          sync_type: 'orders',
          total_orders: orders?.length || 0,
          order_results: orderResults,
          environment: 'development'
        })
      }

    } else {
      // Em produção, usar integração real com Cubbo
      // TODO: Implementar integração real quando necessário
      return NextResponse.json({
        message: 'Integração real com Cubbo será implementada em produção',
        environment: 'production'
      })
    }

    return NextResponse.json({ error: 'Tipo de sincronização não suportado' }, { status: 400 })

  } catch (error) {
    console.error('Erro na API de sincronização Cubbo:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

// GET - Status da sincronização
export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { data: userData, error: userError } = await supabaseService
      .from('users')
      .select('company_id, role, store_id')
      .eq('id', user.id)
      .single()

    if (userError || !userData) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }

    // Buscar status da integração
    const { data: integration, error: integrationError } = await supabaseService
      .from('cubbo_integrations')
      .select('*')
      .eq('store_id', userData.store_id)
      .eq('is_active', true)
      .single()

    // Buscar logs de sincronização recentes
    const { data: syncLogs, error: logsError } = await supabaseService
      .from('product_sync_log')
      .select('*')
      .eq('store_id', userData.store_id)
      .order('created_at', { ascending: false })
      .limit(10)

    // Buscar status do estoque sincronizado
    const { data: inventoryStatus, error: inventoryError } = await supabaseService
      .from('inventory_sync')
      .select('*')
      .eq('store_id', userData.store_id)

    return NextResponse.json({
      integration: integration || null,
      hasIntegration: !!integration,
      sync_logs: syncLogs || [],
      inventory_status: inventoryStatus || [],
      environment: process.env.NODE_ENV || 'development'
    })

  } catch (error) {
    console.error('Erro na API de status Cubbo:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
