import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'http://localhost:54321'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const companyId = searchParams.get('company_id')

    if (!companyId) {
      return NextResponse.json({ error: 'Company ID é obrigatório' }, { status: 400 })
    }

    // Get total employees (usuários da empresa)
    const { count: totalEmployees } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', companyId)

    // Get active employees
    const { count: activeEmployees } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', companyId)
      .eq('status', 'active')

    // Get total products
    const { count: totalProducts } = await supabase
      .from('company_products')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', companyId)

    // Get total orders
    const { count: totalOrders } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', companyId)

    // Get pending orders
    const { count: pendingOrders } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', companyId)
      .eq('status', 'pending')

    // Get total revenue
    const { data: revenueData } = await supabase
      .from('orders')
      .select('total_amount')
      .eq('company_id', companyId)
      .eq('status', 'delivered')

    const totalRevenue = revenueData?.reduce((sum, order) => sum + order.total_amount, 0) || 0

    // Get total points distributed
    const { data: pointsData } = await supabase
      .from('users')
      .select('points_balance')
      .eq('company_id', companyId)

    const totalPointsDistributed = pointsData?.reduce((sum, employee) => sum + employee.points_balance, 0) || 0

    // Calculate average order value
    const averageOrderValue = totalOrders && totalOrders > 0 ? totalRevenue / totalOrders : 0

    const stats = {
      totalEmployees: totalEmployees || 0,
      totalProducts: totalProducts || 0,
      totalOrders: totalOrders || 0,
      totalRevenue,
      activeEmployees: activeEmployees || 0,
      pendingOrders: pendingOrders || 0,
      totalPointsDistributed,
      averageOrderValue
    }

    return NextResponse.json({ stats })

  } catch (error) {
    console.error('Erro na API de estatísticas do gestor:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
