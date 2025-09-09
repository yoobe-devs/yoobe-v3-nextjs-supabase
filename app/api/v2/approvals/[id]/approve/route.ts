import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { approveStep, rejectStep } from '@/lib/approval-workflow'

// POST - Aprovar step de aprovação
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { stepNo, comment } = body

    if (!stepNo) {
      return NextResponse.json(
        { error: 'stepNo é obrigatório' },
        { status: 400 }
      )
    }

    const approvalId = params.id
    const approverUserId = user.id

    const result = await approveStep(
      approvalId,
      stepNo,
      approverUserId,
      comment
    )

    return NextResponse.json({
      success: true,
      data: result,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DELETE - Rejeitar step de aprovação
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { stepNo, comment } = body

    if (!stepNo || !comment) {
      return NextResponse.json(
        {
          error: 'stepNo e comment são obrigatórios',
        },
        { status: 400 }
      )
    }

    const approvalId = params.id
    const approverUserId = user.id

    const result = await rejectStep(approvalId, stepNo, approverUserId, comment)

    return NextResponse.json({
      success: true,
      data: result,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
