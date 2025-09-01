import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { v4 as uuidv4 } from 'uuid'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    
    // Extrair dados do formulário
    const companyName = formData.get('companyName') as string
    const companyEmail = formData.get('companyEmail') as string
    const companyPhone = formData.get('companyPhone') as string
    const companyWebsite = formData.get('companyWebsite') as string
    const employeeCount = formData.get('employeeCount') as string
    const contactName = formData.get('contactName') as string
    const contactEmail = formData.get('contactEmail') as string
    const contactPhone = formData.get('contactPhone') as string
    const password = formData.get('password') as string
    const plan = formData.get('plan') as string
    const acceptTerms = formData.get('acceptTerms') as string
    const acceptMarketing = formData.get('acceptMarketing') as string
    const logo = formData.get('logo') as File | null

    // Validações básicas
    if (!companyName || !companyEmail || !contactName || !contactEmail || !password) {
      return NextResponse.json(
        { error: 'Campos obrigatórios não preenchidos' },
        { status: 400 }
      )
    }

    // Gerar IDs únicos
    const accountId = uuidv4()
    const storeId = uuidv4()
    const userId = uuidv4()
    
    // Gerar URL da loja baseada no nome da empresa
    const storeUrl = `${companyName.toLowerCase().replace(/[^a-z0-9]/g, '')}.yoobe.com`

    // Upload do logo se fornecido
    let logoUrl = null
    if (logo) {
      const logoFileName = `${accountId}-${Date.now()}-${logo.name}`
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('company-logos')
        .upload(logoFileName, logo, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) {
        console.error('Erro no upload do logo:', uploadError)
      } else {
        const { data: { publicUrl } } = supabase.storage
          .from('company-logos')
          .getPublicUrl(logoFileName)
        logoUrl = publicUrl
      }
    }

    // Criar empresa
    const { data: companyData, error: companyError } = await supabase
      .from('companies')
      .insert({
        id: accountId,
        name: companyName,
        email: companyEmail,
        phone: companyPhone,
        website: companyWebsite,
        employee_count: parseInt(employeeCount) || 0,
        logo_url: logoUrl,
        plan: plan,
        status: 'active',
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (companyError) {
      console.error('Erro ao criar empresa:', companyError)
      return NextResponse.json(
        { error: 'Erro ao criar empresa' },
        { status: 500 }
      )
    }

    // Criar loja
    const { data: storeData, error: storeError } = await supabase
      .from('stores')
      .insert({
        id: storeId,
        company_id: accountId,
        name: `${companyName} Store`,
        domain: storeUrl,
        status: 'active',
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (storeError) {
      console.error('Erro ao criar loja:', storeError)
      return NextResponse.json(
        { error: 'Erro ao criar loja' },
        { status: 500 }
      )
    }

    // Criar usuário gestor
    const { data: userData, error: userError } = await supabase.auth.admin.createUser({
      email: contactEmail,
      password: password,
      email_confirm: true,
      user_metadata: {
        name: contactName,
        phone: contactPhone,
        role: 'gestor',
        company_id: accountId,
        store_id: storeId
      }
    })

    if (userError) {
      console.error('Erro ao criar usuário:', userError)
      return NextResponse.json(
        { error: 'Erro ao criar usuário' },
        { status: 500 }
      )
    }

    // Inserir dados do usuário na tabela users
    const { error: userProfileError } = await supabase
      .from('users')
      .insert({
        id: userData.user.id,
        email: contactEmail,
        name: contactName,
        phone: contactPhone,
        role: 'gestor',
        company_id: accountId,
        store_id: storeId,
        status: 'active',
        created_at: new Date().toISOString()
      })

    if (userProfileError) {
      console.error('Erro ao criar perfil do usuário:', userProfileError)
      return NextResponse.json(
        { error: 'Erro ao criar perfil do usuário' },
        { status: 500 }
      )
    }

    // Configurações padrão da loja
    const { error: configError } = await supabase
      .from('store_configurations')
      .insert({
        store_id: storeId,
        primary_color: '#1e40af',
        secondary_color: '#7c3aed',
        logo_url: logoUrl,
        store_name: `${companyName} Store`,
        welcome_message: `Bem-vindo à loja de brindes da ${companyName}!`,
        created_at: new Date().toISOString()
      })

    if (configError) {
      console.error('Erro ao criar configurações da loja:', configError)
    }

    // Retornar dados da conta criada
    return NextResponse.json({
      success: true,
      accountId: accountId,
      storeId: storeId,
      userId: userData.user.id,
      storeUrl: storeUrl,
      message: 'Conta criada com sucesso!'
    })

  } catch (error) {
    console.error('Erro no registro:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
