#!/usr/bin/env node

/**
 * Script para criar pedido via API
 */

const http = require('http')

async function createOrderViaAPI() {
  console.log('🔧 Criando pedido via API...')
  console.log('')

  try {
    // Primeiro, vamos verificar se já existe um pedido
    console.log('🔍 Verificando pedidos existentes...')
    
    const response = await makeRequest('http://localhost:3001/api/orders/search-simple?order_number=ORD-001')
    
    if (response.statusCode === 200) {
      const result = JSON.parse(response.body)
      console.log('📊 Pedidos encontrados:', result.count)
      console.log('🔍 Debug:', result.debug)
      
      if (result.count > 0) {
        console.log('✅ Pedido ORD-001 já existe!')
        return
      }
    }

    // Criar pedido via API
    console.log('🔧 Criando pedido ORD-001...')
    
    const orderData = {
      order_number: 'ORD-001',
      customer_name: 'João Silva',
      customer_email: 'joao.silva@email.com',
      customer_phone: '(11) 99999-9999',
      total_amount: 219.80,
      status: 'processing',
      shipping_address: {
        street: 'Rua das Flores, 123',
        city: 'São Paulo',
        state: 'SP',
        postal_code: '01234-567',
        country: 'Brasil'
      },
      notes: 'Pedido de teste para SwagTrack'
    }

    const createResponse = await makeRequest('http://localhost:3001/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(orderData)
    })

    if (createResponse.statusCode === 200 || createResponse.statusCode === 201) {
      console.log('✅ Pedido criado com sucesso!')
      
      // Verificar se foi criado
      const verifyResponse = await makeRequest('http://localhost:3001/api/orders/search-simple?order_number=ORD-001')
      if (verifyResponse.statusCode === 200) {
        const verifyResult = JSON.parse(verifyResponse.body)
        console.log('📊 Pedidos após criação:', verifyResult.count)
      }
    } else {
      console.log('❌ Erro ao criar pedido:', createResponse.statusCode)
      console.log('Resposta:', createResponse.body)
    }

  } catch (error) {
    console.log('❌ Erro:', error.message)
  }
}

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url)
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: options.headers || {}
    }

    const req = http.request(requestOptions, res => {
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

    if (options.body) {
      req.write(options.body)
    }

    req.end()
  })
}

// Executar
createOrderViaAPI()
