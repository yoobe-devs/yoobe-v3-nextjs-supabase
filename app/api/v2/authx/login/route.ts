import { NextRequest, NextResponse } from 'next/server'
import { withAuthX } from '@/lib/authx/withAuthX'

export const POST = withAuthX(async (req: NextRequest) => {
  // Placeholder: delegar a Supabase providers
  return NextResponse.json({ success: true, message: 'login stub' })
})

