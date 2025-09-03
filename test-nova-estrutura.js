#!/usr/bin/env node

const https = require('https');
const http = require('http');

const BASE_URL = 'http://localhost:3000';

// Função para fazer requisições HTTP
function makeRequest(url, method = 'GET') {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    
    const req = client.request(url, { method }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data }));
    });
    
    req.on('error', reject);
    req.setTimeout(5000, () => req.destroy());
    req.end();
  });
}

// Testes
async function runTests() {
  console.log('🚀 Testando Nova Estrutura da Yoobe\n');
  
  const tests = [
    {
      name: 'Landing Page Principal',
      url: '/',
      checks: [
        'Yoobe',
        'Transforme seu programa',
        'Criar Loja Gratuitamente',
        'Plataformas de Gamificação'
      ]
    },
    {
      name: 'Página de Cadastro',
      url: '/auth/register',
      checks: [
        'Criar Conta Empresarial',
        'Informações da Empresa',
        'Dados do Contato',
        'Escolha seu Plano'
      ]
    },
    {
      name: 'Página de Onboarding',
      url: '/onboarding',
      checks: [
        'Configurar sua Loja',
        'Configuração Básica',
        'Personalização',
        'Integrações'
      ]
    }
  ];

  let passedTests = 0;
  let totalTests = tests.length;

  for (const test of tests) {
    try {
      console.log(`📋 Testando: ${test.name}`);
      console.log(`   URL: ${BASE_URL}${test.url}`);
      
      const response = await makeRequest(`${BASE_URL}${test.url}`);
      
      if (response.status === 200) {
        let checksPassed = 0;
        const totalChecks = test.checks.length;
        
        for (const check of test.checks) {
          if (response.data.includes(check)) {
            checksPassed++;
            console.log(`   ✅ "${check}" encontrado`);
          } else {
            console.log(`   ❌ "${check}" não encontrado`);
          }
        }
        
        if (checksPassed === totalChecks) {
          console.log(`   🎉 ${test.name}: PASSOU (${checksPassed}/${totalChecks})`);
          passedTests++;
        } else {
          console.log(`   ⚠️  ${test.name}: PARCIAL (${checksPassed}/${totalChecks})`);
        }
      } else {
        console.log(`   ❌ ${test.name}: FALHOU (Status: ${response.status})`);
      }
      
    } catch (error) {
      console.log(`   ❌ ${test.name}: ERRO - ${error.message}`);
    }
    
    console.log('');
  }

  // Resultado final
  console.log('📊 RESULTADO DOS TESTES');
  console.log('='.repeat(50));
  console.log(`✅ Testes passaram: ${passedTests}/${totalTests}`);
  console.log(`❌ Testes falharam: ${totalTests - passedTests}/${totalTests}`);
  
  if (passedTests === totalTests) {
    console.log('\n🎉 TODOS OS TESTES PASSARAM! A nova estrutura está funcionando perfeitamente.');
  } else {
    console.log('\n⚠️  Alguns testes falharam. Verifique se o servidor está rodando.');
  }

  // URLs para teste manual
  console.log('\n🔗 URLs para teste manual:');
  console.log(`   🌐 Landing Page: ${BASE_URL}/`);
  console.log(`   👤 Cadastro: ${BASE_URL}/auth/register`);
  console.log(`   ⚙️  Onboarding: ${BASE_URL}/onboarding`);
  
  console.log('\n📱 Teste também em diferentes dispositivos:');
  console.log('   - Desktop (1920x1080)');
  console.log('   - Tablet (768x1024)');
  console.log('   - Mobile (375x667)');
}

// Executar testes
runTests().catch(console.error);
