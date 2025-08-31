import nodemailer from 'nodemailer'

// Configuração do transporter (para desenvolvimento)
const transporter = nodemailer.createTransporter({
  host: 'localhost',
  port: 1025,
  secure: false,
  auth: {
    user: 'test',
    pass: 'test'
  }
})

// Templates de email
export const emailTemplates = {
  // Convite para funcionário
  employeeInvite: (data: {
    employeeName: string
    companyName: string
    email: string
    password: string
    loginUrl: string
  }) => ({
    subject: `Convite para ${data.companyName} - Yoobe`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 28px;">🎉 Bem-vindo à ${data.companyName}!</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px;">Você foi convidado para participar da plataforma Yoobe</p>
        </div>
        
        <div style="padding: 30px; background: #f9f9f9;">
          <h2 style="color: #333; margin-bottom: 20px;">Olá, ${data.employeeName}!</h2>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            Você foi convidado para participar da plataforma Yoobe da empresa <strong>${data.companyName}</strong>.
            Com essa conta, você poderá:
          </p>
          
          <ul style="color: #666; line-height: 1.6; margin-bottom: 30px;">
            <li>🎁 Resgatar produtos e brindes</li>
            <li>⭐ Acumular pontos por suas atividades</li>
            <li>📱 Acessar a plataforma de qualquer dispositivo</li>
            <li>📊 Acompanhar seu histórico de resgates</li>
          </ul>
          
          <div style="background: white; padding: 25px; border-radius: 10px; margin-bottom: 30px; border-left: 4px solid #667eea;">
            <h3 style="color: #333; margin-top: 0;">🔑 Suas Credenciais de Acesso</h3>
            <p style="margin: 10px 0;"><strong>Email:</strong> ${data.email}</p>
            <p style="margin: 10px 0;"><strong>Senha:</strong> ${data.password}</p>
            <p style="color: #888; font-size: 14px; margin-top: 15px;">
              ⚠️ Por segurança, recomendamos que você altere sua senha no primeiro acesso.
            </p>
          </div>
          
          <div style="text-align: center;">
            <a href="${data.loginUrl}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; display: inline-block; font-weight: bold;">
              🚀 Acessar Plataforma
            </a>
          </div>
          
          <p style="color: #888; font-size: 14px; text-align: center; margin-top: 30px;">
            Se você tiver alguma dúvida, entre em contato com o gestor da sua empresa.
          </p>
        </div>
        
        <div style="background: #333; color: white; padding: 20px; text-align: center; font-size: 14px;">
          <p style="margin: 0;">© 2024 Yoobe. Todos os direitos reservados.</p>
        </div>
      </div>
    `
  }),

  // Convite para gestor
  managerInvite: (data: {
    managerName: string
    companyName: string
    email: string
    password: string
    loginUrl: string
  }) => ({
    subject: `Convite para Gestor - ${data.companyName} - Yoobe`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 28px;">👨‍💼 Gestor da ${data.companyName}</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px;">Você foi designado como gestor na plataforma Yoobe</p>
        </div>
        
        <div style="padding: 30px; background: #f9f9f9;">
          <h2 style="color: #333; margin-bottom: 20px;">Olá, ${data.managerName}!</h2>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            Parabéns! Você foi designado como <strong>gestor</strong> da empresa <strong>${data.companyName}</strong> na plataforma Yoobe.
            Como gestor, você terá acesso a:
          </p>
          
          <ul style="color: #666; line-height: 1.6; margin-bottom: 30px;">
            <li>👥 Gerenciar funcionários da empresa</li>
            <li>📦 Cadastrar e gerenciar produtos</li>
            <li>📊 Visualizar relatórios e estatísticas</li>
            <li>⚙️ Configurar políticas de pontos</li>
            <li>📋 Aprovar resgates de funcionários</li>
          </ul>
          
          <div style="background: white; padding: 25px; border-radius: 10px; margin-bottom: 30px; border-left: 4px solid #667eea;">
            <h3 style="color: #333; margin-top: 0;">🔑 Suas Credenciais de Acesso</h3>
            <p style="margin: 10px 0;"><strong>Email:</strong> ${data.email}</p>
            <p style="margin: 10px 0;"><strong>Senha:</strong> ${data.password}</p>
            <p style="color: #888; font-size: 14px; margin-top: 15px;">
              ⚠️ Por segurança, recomendamos que você altere sua senha no primeiro acesso.
            </p>
          </div>
          
          <div style="text-align: center;">
            <a href="${data.loginUrl}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; display: inline-block; font-weight: bold;">
              🚀 Acessar Painel de Gestão
            </a>
          </div>
          
          <p style="color: #888; font-size: 14px; text-align: center; margin-top: 30px;">
            Se você tiver alguma dúvida, entre em contato com o suporte da Yoobe.
          </p>
        </div>
        
        <div style="background: #333; color: white; padding: 20px; text-align: center; font-size: 14px;">
          <p style="margin: 0;">© 2024 Yoobe. Todos os direitos reservados.</p>
        </div>
      </div>
    `
  }),

  // Notificação de novo pedido
  newOrderNotification: (data: {
    managerName: string
    companyName: string
    orderNumber: string
    employeeName: string
    totalAmount: number
    itemsCount: number
    dashboardUrl: string
  }) => ({
    subject: `Novo Pedido - ${data.orderNumber} - ${data.companyName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); padding: 30px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 28px;">🛒 Novo Pedido Recebido</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px;">${data.companyName}</p>
        </div>
        
        <div style="padding: 30px; background: #f9f9f9;">
          <h2 style="color: #333; margin-bottom: 20px;">Olá, ${data.managerName}!</h2>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            Um novo pedido foi realizado na plataforma Yoobe da sua empresa.
          </p>
          
          <div style="background: white; padding: 25px; border-radius: 10px; margin-bottom: 30px; border-left: 4px solid #28a745;">
            <h3 style="color: #333; margin-top: 0;">📋 Detalhes do Pedido</h3>
            <p style="margin: 10px 0;"><strong>Número do Pedido:</strong> ${data.orderNumber}</p>
            <p style="margin: 10px 0;"><strong>Funcionário:</strong> ${data.employeeName}</p>
            <p style="margin: 10px 0;"><strong>Valor Total:</strong> R$ ${data.totalAmount.toFixed(2)}</p>
            <p style="margin: 10px 0;"><strong>Quantidade de Itens:</strong> ${data.itemsCount}</p>
            <p style="color: #888; font-size: 14px; margin-top: 15px;">
              ⏰ O pedido está aguardando sua aprovação.
            </p>
          </div>
          
          <div style="text-align: center;">
            <a href="${data.dashboardUrl}" style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; display: inline-block; font-weight: bold;">
              📊 Ver Pedido no Dashboard
            </a>
          </div>
          
          <p style="color: #888; font-size: 14px; text-align: center; margin-top: 30px;">
            Acesse o painel de gestão para aprovar ou rejeitar o pedido.
          </p>
        </div>
        
        <div style="background: #333; color: white; padding: 20px; text-align: center; font-size: 14px;">
          <p style="margin: 0;">© 2024 Yoobe. Todos os direitos reservados.</p>
        </div>
      </div>
    `
  }),

  // Notificação de pedido aprovado
  orderApproved: (data: {
    employeeName: string
    companyName: string
    orderNumber: string
    totalAmount: number
    itemsCount: number
    platformUrl: string
  }) => ({
    subject: `Pedido Aprovado - ${data.orderNumber} - ${data.companyName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); padding: 30px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 28px;">✅ Pedido Aprovado!</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px;">${data.companyName}</p>
        </div>
        
        <div style="padding: 30px; background: #f9f9f9;">
          <h2 style="color: #333; margin-bottom: 20px;">Parabéns, ${data.employeeName}!</h2>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            Seu pedido foi aprovado e está sendo processado. Em breve você receberá seus produtos!
          </p>
          
          <div style="background: white; padding: 25px; border-radius: 10px; margin-bottom: 30px; border-left: 4px solid #28a745;">
            <h3 style="color: #333; margin-top: 0;">📋 Detalhes do Pedido</h3>
            <p style="margin: 10px 0;"><strong>Número do Pedido:</strong> ${data.orderNumber}</p>
            <p style="margin: 10px 0;"><strong>Valor Total:</strong> R$ ${data.totalAmount.toFixed(2)}</p>
            <p style="margin: 10px 0;"><strong>Quantidade de Itens:</strong> ${data.itemsCount}</p>
            <p style="color: #28a745; font-weight: bold; margin-top: 15px;">
              🎉 Status: APROVADO
            </p>
          </div>
          
          <div style="text-align: center;">
            <a href="${data.platformUrl}" style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; display: inline-block; font-weight: bold;">
              📱 Acompanhar Pedido
            </a>
          </div>
          
          <p style="color: #888; font-size: 14px; text-align: center; margin-top: 30px;">
            Você receberá atualizações sobre o status do seu pedido.
          </p>
        </div>
        
        <div style="background: #333; color: white; padding: 20px; text-align: center; font-size: 14px;">
          <p style="margin: 0;">© 2024 Yoobe. Todos os direitos reservados.</p>
        </div>
      </div>
    `
  })
}

// Função para enviar email
export async function sendEmail(to: string, template: keyof typeof emailTemplates, data: any) {
  try {
    const emailContent = emailTemplates[template](data)
    
    const mailOptions = {
      from: '"Yoobe" <noreply@yoobe.com>',
      to: to,
      subject: emailContent.subject,
      html: emailContent.html
    }

    const info = await transporter.sendMail(mailOptions)
    console.log('Email enviado:', info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error('Erro ao enviar email:', error)
    return { success: false, error }
  }
}

// Funções específicas para cada tipo de email
export async function sendEmployeeInvite(employeeData: {
  name: string
  email: string
  password: string
  companyName: string
}) {
  return sendEmail(employeeData.email, 'employeeInvite', {
    ...employeeData,
    loginUrl: 'http://localhost:3001/auth/login'
  })
}

export async function sendManagerInvite(managerData: {
  name: string
  email: string
  password: string
  companyName: string
}) {
  return sendEmail(managerData.email, 'managerInvite', {
    ...managerData,
    loginUrl: 'http://localhost:3001/gestor/dashboard'
  })
}

export async function sendNewOrderNotification(managerData: {
  name: string
  email: string
  companyName: string
  orderNumber: string
  employeeName: string
  totalAmount: number
  itemsCount: number
}) {
  return sendEmail(managerData.email, 'newOrderNotification', {
    ...managerData,
    dashboardUrl: 'http://localhost:3001/gestor/pedidos'
  })
}

export async function sendOrderApprovedNotification(employeeData: {
  name: string
  email: string
  companyName: string
  orderNumber: string
  totalAmount: number
  itemsCount: number
}) {
  return sendEmail(employeeData.email, 'orderApproved', {
    ...employeeData,
    platformUrl: 'http://localhost:3001/pedidos'
  })
}
