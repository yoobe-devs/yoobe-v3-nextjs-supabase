const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'http://127.0.0.1:54321'
const serviceKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

const supabase = createClient(supabaseUrl, serviceKey)

// APIs para testar CRUD completo
const crudAPIs = [
  // Replicação de Produtos
  {
    category: 'replication',
    name: 'Produtos Base',
    apis: [
      { path: '/api/gestor/base-products', method: 'GET', operation: 'READ' },
      {
        path: '/api/gestor/base-products',
        method: 'POST',
        operation: 'CREATE',
        body: {
          base_product_id: 'd587416a-cdce-40e8-a737-b04e712187dd',
          custom_price: 45,
        },
      },
    ],
  },
  {
    category: 'replication',
    name: 'Produtos da Empresa',
    apis: [
      { path: '/api/gestor/produtos', method: 'GET', operation: 'READ' },
      {
        path: '/api/gestor/produtos',
        method: 'POST',
        operation: 'CREATE',
        body: {
          name: 'Produto Teste',
          price: 50,
          category_id: 'dba76330-f836-4982-8f60-579fc0f30b65',
        },
      },
    ],
  },

  // Orçamentos
  {
    category: 'budgets',
    name: 'Orçamentos',
    apis: [
      { path: '/api/gestor/orcamentos', method: 'GET', operation: 'READ' },
      {
        path: '/api/gestor/orcamentos',
        method: 'POST',
        operation: 'CREATE',
        body: {
          title: 'Orçamento Teste CRUD',
          description: 'Teste de criação via CRUD',
          items: [
            {
              base_product_id: 'd8aeb4f8-6761-42bf-8c31-4bf7fc5a4ace',
              quantity: 2,
              custom_price: 25,
            },
          ],
        },
      },
    ],
  },
  {
    category: 'budgets',
    name: 'Budgets',
    apis: [
      { path: '/api/gestor/budgets', method: 'GET', operation: 'READ' },
      {
        path: '/api/gestor/budgets',
        method: 'POST',
        operation: 'CREATE',
        body: {
          title: 'Budget Teste CRUD',
          description: 'Teste de criação via CRUD',
          items: [
            {
              base_product_id: 'd8aeb4f8-6761-42bf-8c31-4bf7fc5a4ace',
              quantity: 1,
            },
          ],
        },
      },
    ],
  },

  // Funcionários/Usuários
  {
    category: 'employees',
    name: 'Funcionários',
    apis: [
      { path: '/api/gestor/employees', method: 'GET', operation: 'READ' },
      {
        path: '/api/gestor/employees',
        method: 'POST',
        operation: 'CREATE',
        body: {
          email: `teste-crud-${Date.now()}@exemplo.com`,
          full_name: 'Funcionário Teste CRUD',
          role: 'user',
          department: 'TI',
          position: 'Desenvolvedor',
        },
      },
    ],
  },
  {
    category: 'users',
    name: 'Usuários',
    apis: [
      { path: '/api/gestor/usuarios', method: 'GET', operation: 'READ' },
      {
        path: '/api/gestor/usuarios',
        method: 'POST',
        operation: 'CREATE',
        body: {
          email: `usuario-crud-${Date.now()}@exemplo.com`,
          full_name: 'Usuário Teste CRUD',
          role: 'user',
          department: 'TI',
        },
      },
    ],
  },

  // Pedidos
  {
    category: 'orders',
    name: 'Pedidos Gestor',
    apis: [{ path: '/api/gestor/orders', method: 'GET', operation: 'READ' }],
  },
  {
    category: 'orders',
    name: 'Pedidos Gerais',
    apis: [{ path: '/api/orders', method: 'GET', operation: 'READ' }],
  },

  // Loja
  {
    category: 'store',
    name: 'Configurações da Loja',
    apis: [
      { path: '/api/gestor/store-config', method: 'GET', operation: 'READ' },
    ],
  },
  {
    category: 'store',
    name: 'Lojas',
    apis: [{ path: '/api/stores', method: 'GET', operation: 'READ' }],
  },

  // Estoque
  {
    category: 'inventory',
    name: 'Estoque Gestor',
    apis: [
      { path: '/api/v2/gestor/inventory', method: 'GET', operation: 'READ' },
      {
        path: '/api/v2/gestor/inventory/summary',
        method: 'GET',
        operation: 'READ',
      },
    ],
  },
  {
    category: 'inventory',
    name: 'Estoque Geral',
    apis: [{ path: '/api/inventory', method: 'GET', operation: 'READ' }],
  },
]

async function comprehensiveCrudAudit() {
  console.log('🔍 Auditoria Completa de CRUDs - Sistema de Replicação e Gestão')
  console.log('='.repeat(80))

  const results = {
    working: [],
    errors: [],
    authIssues: [],
    fieldIssues: [],
    missingAPIs: [],
    crudStatus: {},
  }

  try {
    // 1. Fazer login como gestor
    console.log('\n1. 🔐 Fazendo login como gestor...')
    const { data: gestorLogin, error: gestorError } =
      await supabase.auth.signInWithPassword({
        email: 'gestor@yoobe.co',
        password: 'gestor123',
      })

    if (gestorError) {
      console.error('❌ Erro ao fazer login como gestor:', gestorError)
      return
    }

    console.log('✅ Login como gestor realizado com sucesso')

    // 2. Testar todas as APIs por categoria
    console.log('\n2. 🧪 Testando CRUDs por categoria...')

    for (const categoryGroup of crudAPIs) {
      console.log(
        `\n📂 ${categoryGroup.name.toUpperCase()} (${categoryGroup.category})`
      )

      results.crudStatus[categoryGroup.category] = {
        name: categoryGroup.name,
        operations: {
          CREATE: { working: 0, errors: 0, total: 0 },
          READ: { working: 0, errors: 0, total: 0 },
          UPDATE: { working: 0, errors: 0, total: 0 },
          DELETE: { working: 0, errors: 0, total: 0 },
        },
      }

      for (const api of categoryGroup.apis) {
        console.log(
          `\n   📡 Testando ${api.method} ${api.path} (${api.operation})...`
        )

        try {
          const response = await fetch(`http://127.0.0.1:3000${api.path}`, {
            method: api.method,
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${gestorLogin.session.access_token}`,
            },
            body: api.body ? JSON.stringify(api.body) : undefined,
          })

          const result = await response.json()

          const apiResult = {
            path: api.path,
            method: api.method,
            operation: api.operation,
            category: categoryGroup.category,
            status: response.status,
            data: result,
          }

          if (response.ok) {
            results.working.push(apiResult)
            results.crudStatus[categoryGroup.category].operations[api.operation]
              .working++
            console.log(`   ✅ OK (status: ${response.status})`)
          } else if (response.status === 401) {
            results.authIssues.push(apiResult)
            results.crudStatus[categoryGroup.category].operations[api.operation]
              .errors++
            console.log(
              `   🔒 Problema de autenticação (status: ${response.status})`
            )
          } else if (response.status === 500) {
            results.fieldIssues.push(apiResult)
            results.crudStatus[categoryGroup.category].operations[api.operation]
              .errors++
            console.log(
              `   ❌ Erro interno - possível problema de campos (status: ${response.status})`
            )
          } else {
            results.errors.push(apiResult)
            results.crudStatus[categoryGroup.category].operations[api.operation]
              .errors++
            console.log(`   ⚠️  Erro (status: ${response.status})`)
          }

          results.crudStatus[categoryGroup.category].operations[api.operation]
            .total++
        } catch (error) {
          results.missingAPIs.push({
            path: api.path,
            method: api.method,
            operation: api.operation,
            category: categoryGroup.category,
            error: error.message,
          })
          results.crudStatus[categoryGroup.category].operations[api.operation]
            .errors++
          results.crudStatus[categoryGroup.category].operations[api.operation]
            .total++
          console.log(`   ❌ API não encontrada ou erro de conexão`)
        }
      }
    }

    // 3. Verificar integridade das tabelas
    console.log('\n3. 🔍 Verificando integridade das tabelas...')

    const tableChecks = [
      { table: 'users', description: 'Usuários' },
      { table: 'companies', description: 'Empresas' },
      { table: 'stores', description: 'Lojas' },
      { table: 'base_products', description: 'Produtos Base' },
      { table: 'company_products', description: 'Produtos da Empresa' },
      { table: 'budgets', description: 'Orçamentos' },
      { table: 'budget_items', description: 'Itens de Orçamento' },
      { table: 'orders', description: 'Pedidos' },
      { table: 'order_items', description: 'Itens de Pedido' },
    ]

    for (const check of tableChecks) {
      try {
        const { data, error, count } = await supabase
          .from(check.table)
          .select('*', { count: 'exact', head: true })

        if (error) {
          console.log(`   ❌ ${check.description}: Erro - ${error.message}`)
        } else {
          console.log(`   ✅ ${check.description}: ${count} registros`)
        }
      } catch (error) {
        console.log(`   ❌ ${check.description}: Erro de conexão`)
      }
    }

    // 4. Gerar relatório final
    console.log('\n' + '='.repeat(80))
    console.log('📊 RELATÓRIO COMPLETO DE CRUDs')
    console.log('='.repeat(80))

    console.log(`\n✅ APIs Funcionando: ${results.working.length}`)
    results.working.forEach(api => {
      console.log(
        `   - ${api.operation} ${api.method} ${api.path} (${api.category}) - Status: ${api.status}`
      )
    })

    console.log(`\n🔒 Problemas de Autenticação: ${results.authIssues.length}`)
    results.authIssues.forEach(api => {
      console.log(
        `   - ${api.operation} ${api.method} ${api.path} (${api.category}) - Status: ${api.status}`
      )
    })

    console.log(`\n❌ Problemas de Campos/RLS: ${results.fieldIssues.length}`)
    results.fieldIssues.forEach(api => {
      console.log(
        `   - ${api.operation} ${api.method} ${api.path} (${api.category}) - Status: ${api.status}`
      )
    })

    console.log(`\n⚠️  Outros Erros: ${results.errors.length}`)
    results.errors.forEach(api => {
      console.log(
        `   - ${api.operation} ${api.method} ${api.path} (${api.category}) - Status: ${api.status}`
      )
    })

    console.log(`\n❌ APIs Não Encontradas: ${results.missingAPIs.length}`)
    results.missingAPIs.forEach(api => {
      console.log(
        `   - ${api.operation} ${api.method} ${api.path} (${api.category})`
      )
    })

    // 5. Resumo por categoria e operação
    console.log('\n📂 RESUMO POR CATEGORIA E OPERAÇÃO:')

    for (const [category, status] of Object.entries(results.crudStatus)) {
      console.log(`\n   ${status.name.toUpperCase()} (${category}):`)

      for (const [operation, stats] of Object.entries(status.operations)) {
        if (stats.total > 0) {
          const percentage = Math.round((stats.working / stats.total) * 100)
          console.log(
            `     ${operation}: ${stats.working}/${stats.total} (${percentage}%)`
          )
        }
      }
    }

    // 6. Estatísticas gerais
    const totalAPIs =
      results.working.length +
      results.errors.length +
      results.authIssues.length +
      results.fieldIssues.length +
      results.missingAPIs.length
    const workingAPIs = results.working.length
    const overallPercentage =
      totalAPIs > 0 ? Math.round((workingAPIs / totalAPIs) * 100) : 0

    console.log(
      `\n🎯 RESULTADO GERAL: ${workingAPIs}/${totalAPIs} APIs funcionando (${overallPercentage}%)`
    )

    if (overallPercentage >= 90) {
      console.log('🎉 EXCELENTE! Quase todas as APIs estão funcionando!')
    } else if (overallPercentage >= 75) {
      console.log('👍 MUITO BOM! A maioria das APIs está funcionando!')
    } else if (overallPercentage >= 50) {
      console.log('⚠️  BOM! Mais da metade das APIs está funcionando!')
    } else {
      console.log('❌ Ainda há muito trabalho a ser feito nas APIs.')
    }

    console.log('\n' + '='.repeat(80))
    console.log('🎉 Auditoria completa de CRUDs concluída!')
  } catch (error) {
    console.error('❌ Erro geral na auditoria:', error)
  }
}

comprehensiveCrudAudit()
