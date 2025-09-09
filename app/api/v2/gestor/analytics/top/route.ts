import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321'
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
const service = createClient(supabaseUrl, serviceKey)

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const storeId = searchParams.get('store_id') || ''
  const type = searchParams.get('type') || 'employees' // employees ou products
  const limit = parseInt(searchParams.get('limit') || '10')

  if (!storeId)
    return NextResponse.json({ error: 'store_id required' }, { status: 400 })

  try {
    if (type === 'employees') {
      // Top funcionários por engagement score
      const { data: topEmployees, error } = await service
        .from('analytics_top_employees')
        .select(
          `
          employee_user_id,
          engagement_score,
          total_events,
          active_days
        `
        )
        .eq('store_id', storeId)
        .order('engagement_score', { ascending: false })
        .limit(limit)

      if (error) throw error

      const employeesData =
        topEmployees?.map(emp => ({
          id: emp.employee_user_id,
          name: `Usuário ${emp.employee_user_id.slice(0, 8)}`,
          email: `user${emp.employee_user_id.slice(0, 8)}@example.com`,
          engagementScore: emp.engagement_score || 0,
          totalEvents: emp.total_events || 0,
          activeDays: emp.active_days || 0,
          avgEventsPerDay:
            emp.active_days > 0
              ? Math.round(emp.total_events / emp.active_days)
              : 0,
        })) || []

      return NextResponse.json({
        success: true,
        data: {
          type: 'employees',
          items: employeesData,
          period: '30d',
        },
      })
    } else if (type === 'products') {
      // Top produtos por visualizações
      const { data: topProducts, error } = await service
        .from('analytics_top_products')
        .select(
          `
          product_id,
          views,
          add_to_cart,
          redeems,
          unique_users
        `
        )
        .eq('store_id', storeId)
        .order('views', { ascending: false })
        .limit(limit)

      if (error) throw error

      const productsData =
        topProducts?.map(prod => ({
          id: prod.product_id,
          name: `Produto ${prod.product_id.slice(0, 8)}`,
          description: 'Descrição do produto',
          imageUrl: null,
          views: prod.views || 0,
          addToCart: prod.add_to_cart || 0,
          redeems: prod.redeems || 0,
          uniqueUsers: prod.unique_users || 0,
          conversionRate:
            prod.views > 0 ? Math.round((prod.redeems / prod.views) * 100) : 0,
        })) || []

      return NextResponse.json({
        success: true,
        data: {
          type: 'products',
          items: productsData,
          period: '30d',
        },
      })
    } else {
      return NextResponse.json(
        { error: 'Invalid type. Use employees or products' },
        { status: 400 }
      )
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
