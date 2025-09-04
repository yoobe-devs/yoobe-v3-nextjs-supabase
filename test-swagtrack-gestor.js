#!/usr/bin/env node

/**
 * Script para testar as páginas do SwagTrack no módulo do gestor
 * Uso: node test-swagtrack-gestor.js
 */

const http = require('http')

async function testSwagTrackGestor() {
  console.log('🧪 Testando páginas do SwagTrack no Gestor...')
  console.log('')

  const pages = [
    { path: '/gestor/swag-track', name: 'Página Principal do SwagTrack' },
    { path: '/gestor/swag-track/orders/test-order-id', name: 'Página de Detalhes do Pedido' }
  ]

  for (const page of pages) {
    console.log(`📄 Testando: ${page.name}`)
    console.log(`   URL: http://localhost:3001${page.path}`)
    
    try {
      const response = await makeRequest(`http://localhost:3001${page.path}`)
      
      if (response.statusCode === 200) {
        console.log(`   ✅ Status: ${response.statusCode} - Página carregada com sucesso`)
        
        // Verificar se é uma página do gestor
        if (response.body.includes('Swag Track') || 
            response.body.includes('gestor') ||
            response.body.includes('Rastreamento')) {
          console.log(`   ✅ Conteúdo: Página do SwagTrack no gestor detectada`)
        } else {
          console.log(`   ⚠️ Conteúdo: Página carregada mas conteúdo não reconhecido`)
        }
      } else {
        console.log(`   ❌ Status: ${response.statusCode} - Erro ao carregar página`)
      }
    } catch (error) {
      console.log(`   ❌ Erro: ${error.message}`)
    }
    
    console.log('')
  }

  // Testar APIs
  console.log('🔌 Testando APIs do SwagTrack...')
  
  const apis = [
    { path: '/api/orders/search?order_number=test', name: 'API de Busca de Pedidos' },
    { path: '/api/tracking/test-order-id', name: 'API de Tracking' },
    { path: '/api/deliveries', name: 'API de Entregas' }
  ]

  for (const api of apis) {
    console.log(`📡 Testando: ${api.name}`)
    console.log(`   URL: http://localhost:3001${api.path}`)
    
    try {
      const response = await makeRequest(`http://localhost:3001${api.path}`)
      
      if (response.statusCode === 200 || response.statusCode === 404 || response.statusCode === 401) {
        console.log(`   ✅ Status: ${response.statusCode} - API acessível`)
        
        // Verificar se retorna JSON
        try {
          JSON.parse(response.body)
          console.log(`   ✅ Resposta: JSON válido`)
        } catch (jsonError) {
          console.log(`   ⚠️ Resposta: Não é JSON válido`)
        }
      } else {
        console.log(`   ❌ Status: ${response.statusCode} - Erro na API`)
      }
    } catch (error) {
      console.log(`   ❌ Erro: ${error.message}`)
    }
    
    console.log('')
  }

  console.log('🎯 Resumo dos Testes:')
  console.log('')
  console.log('📋 Próximos passos:')
  console.log('   1. Acesse a página principal: http://localhost:3001/gestor/swag-track')
  console.log('   2. Teste a busca rápida de pedidos')
  console.log('   3. Teste os botões de visualização e edição')
  console.log('   4. Verifique se os modais funcionam corretamente')
  console.log('')
  console.log('💡 URLs importantes:')
  console.log('   - Página principal: http://localhost:3001/gestor/swag-track')
  console.log('   - Detalhes do pedido: http://localhost:3001/gestor/swag-track/orders/[orderId]')
  console.log('   - APIs: /api/tracking/[orderId], /api/orders/search, /api/deliveries')
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
testSwagTrackGestor()
