#!/usr/bin/env node

/**
 * Script para testar se as páginas do SwagTrack estão funcionando
 * Uso: node test-swagtrack-pages.js
 */

const http = require('http')

async function testSwagTrackPages() {
  console.log('🧪 Testando páginas do SwagTrack...')
  console.log('')

  const pages = [
    { path: '/tracking', name: 'Página de Busca de Tracking' },
    { path: '/tracking/test-order-id', name: 'Página de Detalhes de Tracking' }
  ]

  for (const page of pages) {
    console.log(`📄 Testando: ${page.name}`)
    console.log(`   URL: http://localhost:3001${page.path}`)
    
    try {
      const response = await makeRequest(`http://localhost:3001${page.path}`)
      
      if (response.statusCode === 200) {
        console.log(`   ✅ Status: ${response.statusCode} - Página carregada com sucesso`)
        
        // Verificar se é uma página React (contém elementos específicos)
        if (response.body.includes('Rastreamento de Pedidos') || 
            response.body.includes('Buscar Pedido') ||
            response.body.includes('tracking')) {
          console.log(`   ✅ Conteúdo: Página do SwagTrack detectada`)
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
      
      if (response.statusCode === 200 || response.statusCode === 404) {
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
  console.log('   1. Se as páginas não carregarem: npm run dev')
  console.log('   2. Se as APIs falharem: Aplicar migrations manualmente')
  console.log('   3. Se tudo funcionar: Testar modais e funcionalidades')
  console.log('')
  console.log('💡 Para aplicar migrations:')
  console.log('   - Acesse: http://localhost:54323')
  console.log('   - Execute SQLs do arquivo: APLICAR_SWAGTRACK_MANUAL_FINAL.md')
}

function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const req = http.get(url, (res) => {
      let body = ''
      
      res.on('data', (chunk) => {
        body += chunk
      })
      
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: body
        })
      })
    })
    
    req.on('error', (error) => {
      reject(error)
    })
    
    req.setTimeout(5000, () => {
      req.destroy()
      reject(new Error('Timeout'))
    })
  })
}

// Executar
testSwagTrackPages()
