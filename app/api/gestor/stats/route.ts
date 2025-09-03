import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const companyId = searchParams.get('company_id')

    if (!companyId) {
      return NextResponse.json({ error: 'Company ID é obrigatório' }, { status: 400 })
    }

    // Funcionários
    const { count: totalEmployees } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', companyId)

    // Funcionários ativos
    const { count: activeEmployees } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', companyId)
      .eq('status', 'active')

    // Produtos (catálogo da empresa)
    const { count: totalProducts } = await supabase
      .from('company_products')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', companyId)

    // Pedidos
    const { count: totalOrders } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', companyId)

    // Pedidos pendentes
    const { count: pendingOrders } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', companyId)
      .eq('status', 'pending')

    // Receita total (entregues)
    const { data: revenueData } = await supabase
      .from('orders')
      .select('total_amount')
      .eq('company_id', companyId)
      .eq('status', 'delivered')

    const totalRevenue = revenueData?.reduce((sum, order) => sum + order.total_amount, 0) || 0

    // Pontos distribuídos (saldo somado)
    const { data: pointsData } = await supabase
      .from('users')
      .select('points_balance')
      .eq('company_id', companyId)

    const totalPointsDistributed = pointsData?.reduce((sum, employee) => sum + employee.points_balance, 0) || 0

    // Ticket médio
    const averageOrderValue = totalOrders && totalOrders > 0 ? totalRevenue / totalOrders : 0

    // Orçamentos (tabela: orcamentos)
    const { count: totalBudgets } = await supabase
      .from('orcamentos')
      .select('*', { count: 'exact', head: true })
      .eq('client_id', companyId)

    const { count: pendingBudgets } = await supabase
      .from('orcamentos')
      .select('*', { count: 'exact', head: true })
      .eq('client_id', companyId)
      .in('status', ['novo', 'em_analise'])

    const { count: approvedBudgets } = await supabase
      .from('orcamentos')
      .select('*', { count: 'exact', head: true })
      .eq('client_id', companyId)
      .eq('status', 'aprovado')

    const { count: convertedBudgets } = await supabase
      .from('orcamentos')
      .select('*', { count: 'exact', head: true })
      .eq('client_id', companyId)
      .eq('status', 'convertido')

    // Estoque (client_products, se existir) — baixos e zerados
    let lowStockProducts = 0
    let outOfStockProducts = 0
    let inventoryValue = 0
    try {
      const { data: inv } = await supabase
        .from('client_products')
        .select('stock_quantity, price')
        .eq('client_id', companyId)
      if (inv?.length) {
        lowStockProducts = inv.filter(p => (p as any).stock_quantity <= 10 && (p as any).stock_quantity > 0).length
        outOfStockProducts = inv.filter(p => (p as any).stock_quantity === 0).length
        inventoryValue = inv.reduce((sum, p) => sum + (((p as any).price || 0) * ((p as any).stock_quantity || 0)), 0)
      }
    } catch {}

    // Receita últimos 30 dias
    const since = new Date()
    since.setDate(since.getDate() - 30)
    const { data: recentRevenue } = await supabase
      .from('orders')
      .select('total_amount, created_at')
      .eq('company_id', companyId)
      .gte('created_at', since.toISOString())
      .eq('status', 'delivered')
    const last30dRevenue = recentRevenue?.reduce((s, o) => s + (o.total_amount || 0), 0) || 0

    // Produtos aguardando ativação
    let awaitingActivationCount = 0
    try {
      const { count: inactives } = await supabase
        .from('client_products')
        .select('*', { count: 'exact', head: true })
        .eq('client_id', companyId)
        .eq('is_active', false)
      awaitingActivationCount = inactives || 0
    } catch {}

    // Orçamentos recentes
    let budgetsRecent: Array<{ id: string, title: string, status: string, created_at: string, total_amount: number }> = []
    try {
      const { data: b } = await supabase
        .from('budgets')
        .select('id, title, status, created_at, total_amount')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false })
        .limit(5)
      budgetsRecent = (b || []) as any
    } catch {}

    const stats = {
      totalEmployees: totalEmployees || 0,
      totalProducts: totalProducts || 0,
      totalOrders: totalOrders || 0,
      totalRevenue,
      activeEmployees: activeEmployees || 0,
      pendingOrders: pendingOrders || 0,
      totalPointsDistributed,
      averageOrderValue,
      budgets: {
        total: totalBudgets || 0,
        pending: pendingBudgets || 0,
        approved: approvedBudgets || 0,
        converted: convertedBudgets || 0
      },
      inventory: {
        lowStock: lowStockProducts,
        outOfStock: outOfStockProducts,
        totalValue: inventoryValue
      },
      last30dRevenue,
      awaitingActivationCount,
      budgetsRecent
    }

    return NextResponse.json({ stats })

  } catch (error) {
    console.error('Erro na API de estatísticas do gestor:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
