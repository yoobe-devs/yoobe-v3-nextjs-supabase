const request = require('supertest')
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

// Configuração do Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321'
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

const supabase = createClient(supabaseUrl, serviceKey)

// Configuração do servidor de teste
const baseURL = 'http://localhost:3000'

describe('Sistema de Orçamentos e Replicação', () => {
  let adminToken, gestorToken, adminId, gestorId, companyId, budgetId, baseProductId, replicatedProductId

  beforeAll(async () => {
    // Limpar dados de teste anteriores
    await supabase.from('company_products').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    await supabase.from('budget_items').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    await supabase.from('budgets').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    
    // Criar usuários de teste
    const { data: adminUser } = await supabase.auth.admin.createUser({
      email: 'admin-test@test.com',
      password: 'admin123',
      email_confirm: true,
      user_metadata: { role: 'admin' }
    })
    adminId = adminUser.user.id

    const { data: gestorUser } = await supabase.auth.admin.createUser({
      email: 'gestor-test@test.com',
      password: 'gestor123',
      email_confirm: true,
      user_metadata: { 
        role: 'manager',
        company_id: '550e8400-e29b-41d4-a716-446655440000'
      }
    })
    gestorId = gestorUser.user.id
    companyId = '550e8400-e29b-41d4-a716-446655440000'

    // Criar empresa de teste
    await supabase.from('companies').upsert({
      id: companyId,
      name: 'Empresa Teste',
      status: 'active'
    })

    // Buscar um produto base para teste
    const { data: baseProducts } = await supabase
      .from('base_products')
      .select('id')
      .limit(1)
    
    if (baseProducts && baseProducts.length > 0) {
      baseProductId = baseProducts[0].id
    }

    // Fazer login para obter tokens
    const adminLogin = await supabase.auth.signInWithPassword({
      email: 'admin-test@test.com',
      password: 'admin123'
    })
    adminToken = adminLogin.data.session?.access_token

    const gestorLogin = await supabase.auth.signInWithPassword({
      email: 'gestor-test@test.com',
      password: 'gestor123'
    })
    gestorToken = gestorLogin.data.session?.access_token
  })

  afterAll(async () => {
    // Limpar dados de teste
    await supabase.from('company_products').delete().eq('company_id', companyId)
    await supabase.from('budget_items').delete().eq('budget_id', budgetId)
    await supabase.from('budgets').delete().eq('id', budgetId)
    await supabase.auth.admin.deleteUser(adminId)
    await supabase.auth.admin.deleteUser(gestorId)
    await supabase.from('companies').delete().eq('id', companyId)
  })

  describe('1. Gestor cria orçamento', () => {
    test('Deve criar orçamento com status pending', async () => {
      const budgetData = {
        title: 'Orçamento Teste',
        description: 'Orçamento para teste automatizado',
        items: [
          {
            base_product_id: baseProductId,
            quantity: 10,
            custom_price: 25.50,
            notes: 'Produto para teste'
          }
        ]
      }

      const response = await request(baseURL)
        .post('/api/gestor/orcamentos')
        .set('Authorization', `Bearer ${gestorToken}`)
        .send(budgetData)

      expect(response.status).toBe(201)
      expect(response.body.budget).toBeDefined()
      expect(response.body.budget.status).toBe('pending')
      expect(response.body.budget.title).toBe('Orçamento Teste')
      
      budgetId = response.body.budget.id
    })

    test('Deve retornar 403 para usuário sem role manager', async () => {
      const budgetData = {
        title: 'Orçamento Inválido',
        description: 'Teste de permissão',
        items: []
      }

      const response = await request(baseURL)
        .post('/api/gestor/orcamentos')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(budgetData)

      expect(response.status).toBe(403)
    })
  })

  describe('2. Gestor tenta replicar produto sem aprovação', () => {
    test('Deve retornar 403 ao tentar replicar sem orçamento aprovado', async () => {
      const replicateData = {
        base_product_id: baseProductId,
        custom_price: 30.00,
        custom_points_cost: 100,
        custom_stock_quantity: 50
      }

      const response = await request(baseURL)
        .post('/api/gestor/base-products')
        .set('Authorization', `Bearer ${gestorToken}`)
        .send(replicateData)

      expect(response.status).toBe(403)
      expect(response.body.error).toContain('orçamento aprovado')
    })
  })

  describe('3. Admin aprova orçamento', () => {
    test('Deve aprovar orçamento e atualizar status', async () => {
      const approveData = {
        action: 'approve',
        admin_notes: 'Orçamento aprovado para teste'
      }

      const response = await request(baseURL)
        .post(`/api/admin/orcamentos/${budgetId}/approve`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(approveData)

      expect(response.status).toBe(200)
      expect(response.body.budget.status).toBe('approved')
      expect(response.body.budget.reviewed_by).toBe(adminId)
    })

    test('Deve retornar 403 para gestor tentando aprovar', async () => {
      const approveData = {
        action: 'approve',
        admin_notes: 'Tentativa inválida'
      }

      const response = await request(baseURL)
        .post(`/api/admin/orcamentos/${budgetId}/approve`)
        .set('Authorization', `Bearer ${gestorToken}`)
        .send(approveData)

      expect(response.status).toBe(403)
    })

    test('Deve retornar 404 para orçamento inexistente', async () => {
      const approveData = {
        action: 'approve',
        admin_notes: 'Orçamento inexistente'
      }

      const response = await request(baseURL)
        .post('/api/admin/orcamentos/00000000-0000-0000-0000-000000000000/approve')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(approveData)

      expect(response.status).toBe(404)
    })
  })

  describe('4. Gestor replica produto após aprovação', () => {
    test('Deve replicar produto com sucesso após aprovação', async () => {
      const replicateData = {
        base_product_id: baseProductId,
        custom_price: 30.00,
        custom_points_cost: 100,
        custom_stock_quantity: 50
      }

      const response = await request(baseURL)
        .post('/api/gestor/base-products')
        .set('Authorization', `Bearer ${gestorToken}`)
        .send(replicateData)

      expect(response.status).toBe(201)
      expect(response.body.company_product).toBeDefined()
      expect(response.body.company_product.is_active).toBe(true)
      expect(response.body.company_product.budget_id).toBe(budgetId)
      
      replicatedProductId = response.body.company_product.id
    })
  })

  describe('5. Gestor ativa/inativa produto', () => {
    test('Deve inativar produto replicado', async () => {
      const response = await request(baseURL)
        .patch(`/api/gestor/produtos/${replicatedProductId}/status`)
        .set('Authorization', `Bearer ${gestorToken}`)
        .send({ is_active: false })

      expect(response.status).toBe(200)
      expect(response.body.company_product.is_active).toBe(false)
    })

    test('Deve ativar produto replicado', async () => {
      const response = await request(baseURL)
        .patch(`/api/gestor/produtos/${replicatedProductId}/status`)
        .set('Authorization', `Bearer ${gestorToken}`)
        .send({ is_active: true })

      expect(response.status).toBe(200)
      expect(response.body.company_product.is_active).toBe(true)
    })

    test('Deve retornar 403 para admin tentando ativar produto', async () => {
      const response = await request(baseURL)
        .patch(`/api/gestor/produtos/${replicatedProductId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ is_active: false })

      expect(response.status).toBe(403)
    })
  })

  describe('6. Gestor tenta acessar rota de admin', () => {
    test('Deve retornar 403 ao tentar aprovar orçamento', async () => {
      const response = await request(baseURL)
        .get('/api/admin/orcamentos')
        .set('Authorization', `Bearer ${gestorToken}`)

      expect(response.status).toBe(403)
    })
  })

  describe('7. Admin gerencia orçamentos', () => {
    test('Deve listar orçamentos recebidos', async () => {
      const response = await request(baseURL)
        .get('/api/admin/orcamentos')
        .set('Authorization', `Bearer ${adminToken}`)

      expect(response.status).toBe(200)
      expect(response.body.budgets).toBeDefined()
      expect(Array.isArray(response.body.budgets)).toBe(true)
      expect(response.body.budgets.length).toBeGreaterThan(0)
    })

    test('Deve rejeitar orçamento', async () => {
      // Criar novo orçamento para rejeitar
      const budgetData = {
        title: 'Orçamento para Rejeitar',
        description: 'Será rejeitado',
        items: [
          {
            base_product_id: baseProductId,
            quantity: 5,
            custom_price: 20.00,
            notes: 'Produto para rejeitar'
          }
        ]
      }

      const createResponse = await request(baseURL)
        .post('/api/gestor/orcamentos')
        .set('Authorization', `Bearer ${gestorToken}`)
        .send(budgetData)

      const newBudgetId = createResponse.body.budget.id

      const rejectData = {
        action: 'reject',
        admin_notes: 'Orçamento rejeitado por teste'
      }

      const response = await request(baseURL)
        .post(`/api/admin/orcamentos/${newBudgetId}/approve`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(rejectData)

      expect(response.status).toBe(200)
      expect(response.body.budget.status).toBe('rejected')
    })
  })

  describe('8. Gestor gerencia produtos replicados', () => {
    test('Deve listar produtos replicados', async () => {
      const response = await request(baseURL)
        .get('/api/gestor/produtos')
        .set('Authorization', `Bearer ${gestorToken}`)

      expect(response.status).toBe(200)
      expect(response.body.products).toBeDefined()
      expect(Array.isArray(response.body.products)).toBe(true)
      expect(response.body.products.length).toBeGreaterThan(0)
    })

    test('Deve atualizar informações do produto', async () => {
      const updateData = {
        price: 35.00,
        points_cost: 150,
        stock_quantity: 75,
        description: 'Descrição atualizada'
      }

      const response = await request(baseURL)
        .patch(`/api/gestor/produtos/${replicatedProductId}`)
        .set('Authorization', `Bearer ${gestorToken}`)
        .send(updateData)

      expect(response.status).toBe(200)
      expect(response.body.company_product.price).toBe(35.00)
      expect(response.body.company_product.points_cost).toBe(150)
      expect(response.body.company_product.stock_quantity).toBe(75)
    })
  })

  describe('9. Validações de integridade', () => {
    test('Deve validar dados obrigatórios ao criar orçamento', async () => {
      const invalidBudget = {
        title: '',
        description: '',
        items: []
      }

      const response = await request(baseURL)
        .post('/api/gestor/orcamentos')
        .set('Authorization', `Bearer ${gestorToken}`)
        .send(invalidBudget)

      expect(response.status).toBe(400)
    })

    test('Deve validar action ao aprovar/rejeitar orçamento', async () => {
      const invalidData = {
        action: 'invalid_action',
        admin_notes: 'Ação inválida'
      }

      const response = await request(baseURL)
        .post(`/api/admin/orcamentos/${budgetId}/approve`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidData)

      expect(response.status).toBe(400)
    })
  })
})
