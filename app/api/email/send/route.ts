import { NextRequest, NextResponse } from 'next/server'
import { sendEmail, sendEmployeeInvite, sendManagerInvite, sendNewOrderNotification, sendOrderApprovedNotification } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, data } = body

    if (!type || !data) {
      return NextResponse.json({
        error: 'Tipo e dados são obrigatórios'
      }, { status: 400 })
    }

    let result

    switch (type) {
      case 'employee_invite':
        result = await sendEmployeeInvite(data)
        break
      case 'manager_invite':
        result = await sendManagerInvite(data)
        break
      case 'new_order_notification':
        result = await sendNewOrderNotification(data)
        break
      case 'order_approved':
        result = await sendOrderApprovedNotification(data)
        break
      default:
        return NextResponse.json({
          error: 'Tipo de email não suportado'
        }, { status: 400 })
    }

    if (result.success) {
      return NextResponse.json({
        message: 'Email enviado com sucesso',
        messageId: result.messageId
      })
    } else {
      return NextResponse.json({
        error: 'Erro ao enviar email',
        details: result.error
      }, { status: 500 })
    }

  } catch (error) {
    console.error('Erro na API de email:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
