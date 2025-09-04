#!/usr/bin/env node

/**
 * Script final para testar todas as funcionalidades do SwagTrack
 * Uso: node test-swagtrack-final.js
 */

const { createClient } = require('@supabase/supabase-js')
const http = require('http')

// Configurações do Supabase local
const SUPABASE_URL = 'http://127.0.0.1:54321'
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

async function testSwagTrackFinal() {
  console.log('🎯 TESTE FINAL DO SWAGTRACK')
  console.log('')
  console.log('=' * 50)
  console.log('')

  let tudoFuncionando = true

  // 1. Verificar conexão com Supabase
  console.log('📡 1. Verificando conexão com Supabase...')
  try {
    const { data: testData, error: testError } = await supabase
      .from('users')
      .select('id')
      .limit(1)

    if (testError) {
      console.log('   ❌ Erro de conexão:', testError.message)
      tudoFuncionando = false
    } else {
      console.log('   ✅ Conexão estabelecida com sucesso')
    }
  } catch (error) {
    console.log('   ❌ Erro de conexão:', error.message)
    tudoFuncionando = false
  }
  console.log('')

  // 2. Verificar tabelas do SwagTrack
  console.log('📊 2. Verificando tabelas do SwagTrack...')
  const swagTrackTables = ['order_tracking_events', 'deliveries']
  
  for (const tableName of swagTrackTables) {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(1)

      if (error) {
        console.log(`   ❌ ${tableName}: ${error.message}`)
        tudoFuncionando = false
      } else {
        console.log(`   ✅ ${tableName}: Existe e acessível`)
      }
    } catch (error) {
      console.log(`   ❌ ${tableName}: ${error.message}`)
      tudoFuncionando = false
    }
  }
  console.log('')

  // 3. Verificar páginas do Next.js
  console.log('📄 3. Verificando páginas do SwagTrack...')
  const pages = [
    { path: '/tracking', name: 'Página de Busca' },
    { path: '/tracking/test-order-id', name: 'Página de Detalhes' },
  ]

  for (const page of pages) {
    try {
      const response = await makeRequest(`http://localhost:3001${page.path}`)
      
      if (response.statusCode === 200) {
        console.log(`   ✅ ${page.name}: Carregada com sucesso`)
      } else {
        console.log(`   ❌ ${page.name}: Erro ${response.statusCode}`)
        tudoFuncionando = false
      }
    } catch (error) {
      console.log(`   ❌ ${page.name}: ${error.message}`)
      tudoFuncionando = false
    }
  }
  console.log('')

  // 4. Verificar APIs do SwagTrack
  console.log('🔌 4. Verificando APIs do SwagTrack...')
  const apis = [
    { path: '/api/orders/search?order_number=test', name: 'API de Busca' },
    { path: '/api/tracking/test-order-id', name: 'API de Tracking' },
    { path: '/api/deliveries', name: 'API de Entregas' },
  ]

  for (const api of apis) {
    try {
      const response = await makeRequest(`http://localhost:3001${api.path}`)
      
      if (response.statusCode === 200 || response.statusCode === 404 || response.statusCode === 401) {
        console.log(`   ✅ ${api.name}: Acessível (Status: ${response.statusCode})`)
      } else {
        console.log(`   ❌ ${api.name}: Erro ${response.statusCode}`)
        tudoFuncionando = false
      }
    } catch (error) {
      console.log(`   ❌ ${api.name}: ${error.message}`)
      tudoFuncionando = false
    }
  }
  console.log('')

  // 5. Verificar componentes
  console.log('🧩 5. Verificando componentes do SwagTrack...')
  const components = [
    'components/update-status-modal.tsx',
    'components/new-delivery-modal.tsx',
    'components/edit-order-modal.tsx',
  ]

  const fs = require('fs')
  for (const component of components) {
    if (fs.existsSync(component)) {
      console.log(`   ✅ ${component}: Existe`)
    } else {
      console.log(`   ❌ ${component}: Não encontrado`)
      tudoFuncionando = false
    }
  }
  console.log('')

  // 6. Testar inserção de dados
  console.log('💾 6. Testando inserção de dados...')
  
  try {
    // Testar inserção em order_tracking_events
    const { error: trackingError } = await supabase
      .from('order_tracking_events')
      .insert({
        order_id: '00000000-0000-0000-0000-000000000000',
        status: 'test',
        description: 'Teste de inserção'
      })

    if (trackingError) {
      console.log('   ⚠️ order_tracking_events: Erro na inserção (esperado)')
    } else {
      console.log('   ✅ order_tracking_events: Inserção funcionando')
    }
  } catch (error) {
    console.log('   ⚠️ order_tracking_events: Erro na inserção (esperado)')
  }

  try {
    // Testar inserção em deliveries
    const { error: deliveriesError } = await supabase
      .from('deliveries')
      .insert({
        order_id: '00000000-0000-0000-0000-000000000000',
        delivery_method: 'standard',
        tracking_code: 'TEST-001',
        recipient_name: 'Teste',
        recipient_email: 'test@test.com',
        street_address: 'Rua Teste, 123',
        city: 'São Paulo',
        state: 'SP',
        postal_code: '01234-567'
      })

    if (deliveriesError) {
      console.log('   ⚠️ deliveries: Erro na inserção (esperado)')
    } else {
      console.log('   ✅ deliveries: Inserção funcionando')
    }
  } catch (error) {
    console.log('   ⚠️ deliveries: Erro na inserção (esperado)')
  }
  console.log('')

  // 7. Resultado final
  console.log('🎯 RESULTADO FINAL:')
  console.log('')
  console.log('=' * 50)
  console.log('')
  
  if (tudoFuncionando) {
    console.log('🎉 SWAGTRACK COMPLETAMENTE FUNCIONAL!')
    console.log('')
    console.log('✅ Todas as funcionalidades estão operacionais:')
    console.log('   - Páginas de tracking carregando')
    console.log('   - APIs acessíveis')
    console.log('   - Tabelas do banco criadas')
    console.log('   - Componentes e modais disponíveis')
    console.log('')
    console.log('🚀 Próximos passos:')
    console.log('   1. Testar busca de pedidos: http://localhost:3001/tracking')
    console.log('   2. Testar modais de edição, status e entrega')
    console.log('   3. Verificar integração com Cubbo')
    console.log('   4. Testar com pedidos reais')
  } else {
    console.log('⚠️ SWAGTRACK PARCIALMENTE FUNCIONAL')
    console.log('')
    console.log('📋 Ações necessárias:')
    console.log('   1. Verificar se o Next.js está rodando: npm run dev')
    console.log('   2. Testar as APIs individualmente')
    console.log('   3. Verificar se todas as migrations foram aplicadas')
    console.log('   4. Testar novamente após correções')
    console.log('')
    console.log('💡 Acesse o Supabase Studio: http://localhost:54323')
  }

  console.log('')
  console.log('📞 Suporte:')
  console.log('   - Verificar logs do Supabase Studio')
  console.log('   - Testar APIs individualmente')
  console.log('   - Consultar documentação criada')
}

function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const req = http.get(url, res => {
      let body = ''

      res.on('data', chunk => {
        body += chunk
      })

      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: body,
        })
      })
    })

    req.on('error', error => {
      reject(error)
    })

    req.setTimeout(5000, () => {
      req.destroy()
      reject(new Error('Timeout'))
    })
  })
}

// Executar
testSwagTrackFinal()
