#!/usr/bin/env node

const { execSync } = require('child_process')
const fs = require('fs')

console.log('🧪 Testando Yoobe Platform v2.0.0...\n')

// Função para verificar se arquivo existe
function fileExists(filePath) {
  return fs.existsSync(filePath)
}

// Função para verificar se diretório existe
function dirExists(dirPath) {
  return fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory()
}

// Função para executar comando
function runCommand(command, description) {
  console.log(`📋 ${description}...`)
  try {
    const result = execSync(command, { encoding: 'utf8' })
    console.log(`✅ ${description} - OK`)
    return result
  } catch (error) {
    console.error(`❌ Erro em: ${description}`)
    console.error(error.message)
    return null
  }
}

async function testV2() {
  console.log('🔍 Verificando estrutura de arquivos...\n')

  // 1. Verificar arquivos principais
  const requiredFiles = [
    'app/admin/integracoes/page.tsx',
    'app/gestor/integracoes/page.tsx',
    'app/api/changelog/route.ts',
    'app/api/admin/cubbo-integration/route.ts',
    'app/api/admin/cubbo-sync/route.ts',
    'supabase/migrations/20250901_000001_cubbo_olist_integration.sql',
    'docs/PLATFORM_OVERVIEW.md',
    'CHANGELOG.md',
    'VERSION_2.0.0_SUMMARY.md',
    'setup-v2.0.0.js'
  ]

  let allFilesExist = true
  requiredFiles.forEach(file => {
    if (fileExists(file)) {
      console.log(`✅ ${file}`)
    } else {
      console.log(`❌ ${file} - FALTANDO`)
      allFilesExist = false
    }
  })

  console.log('\n🔍 Verificando diretórios...\n')

  // 2. Verificar diretórios
  const requiredDirs = [
    'app/admin',
    'app/gestor',
    'app/api',
    'components/ui',
    'docs',
    'supabase/migrations'
  ]

  requiredDirs.forEach(dir => {
    if (dirExists(dir)) {
      console.log(`✅ ${dir}/`)
    } else {
      console.log(`❌ ${dir}/ - FALTANDO`)
      allFilesExist = false
    }
  })

  console.log('\n🔍 Verificando conflitos de rotas...\n')

  // 3. Verificar se não há conflitos de rotas
  if (dirExists('app/store/[slug]')) {
    console.log(`❌ app/store/[slug]/ - CONFLITO DE ROTAS DETECTADO`)
    allFilesExist = false
  } else {
    console.log(`✅ Sem conflitos de rotas`)
  }

  console.log('\n🔍 Verificando banco de dados...\n')

  // 4. Verificar se o Supabase está rodando
  try {
    execSync('curl -s http://localhost:54321/health', { stdio: 'pipe' })
    console.log('✅ Supabase está rodando')
  } catch (error) {
    console.log('❌ Supabase não está rodando')
    console.log('💡 Execute: npx supabase start')
  }

  console.log('\n🔍 Verificando servidor de desenvolvimento...\n')

  // 5. Verificar se o servidor está rodando
  const ports = [3000, 3001, 3002, 3003, 3004]
  let serverRunning = false
  let serverPort = null

  for (const port of ports) {
    try {
      execSync(`curl -s http://localhost:${port}`, { stdio: 'pipe', timeout: 2000 })
      console.log(`✅ Servidor rodando na porta ${port}`)
      serverRunning = true
      serverPort = port
      break
    } catch (error) {
      // Porta não está em uso
    }
  }

  if (!serverRunning) {
    console.log('❌ Servidor não está rodando')
    console.log('💡 Execute: npm run dev')
  }

  console.log('\n🔍 Verificando Git...\n')

  // 6. Verificar tags do Git
  try {
    const tags = execSync('git tag --list "v2.0.0*"', { encoding: 'utf8' })
    console.log('✅ Tags encontradas:')
    console.log(tags.trim().split('\n').map(tag => `  - ${tag}`).join('\n'))
  } catch (error) {
    console.log('❌ Erro ao verificar tags do Git')
  }

  console.log('\n📊 RESUMO DOS TESTES\n')

  if (allFilesExist) {
    console.log('✅ Estrutura de arquivos: OK')
  } else {
    console.log('❌ Estrutura de arquivos: PROBLEMAS DETECTADOS')
  }

  if (serverRunning) {
    console.log(`✅ Servidor: OK (porta ${serverPort})`)
  } else {
    console.log('❌ Servidor: NÃO ESTÁ RODANDO')
  }

  console.log('\n🔗 LINKS PARA TESTE\n')

  if (serverPort) {
    console.log(`🌐 Admin Global: http://localhost:${serverPort}/test-login-simple`)
    console.log(`👤 Gestor: http://localhost:${serverPort}/gestor/dashboard`)
    console.log(`🏪 Loja: http://localhost:${serverPort}/store/join-tecnologia`)
    console.log(`📋 Changelog: http://localhost:${serverPort}/admin/changelog`)
    console.log(`🔧 Integrações: http://localhost:${serverPort}/admin/integracoes`)
  }

  console.log('\n📋 CREDENCIAIS DE TESTE\n')
  console.log('Admin: admin@yoobe.com / admin123')
  console.log('Gestor: gestor.join.tech@jointecnologia.com.br / gestor123')
  console.log('Funcionário: maria.santos@jointecnologia.com.br / maria123')

  console.log('\n🎯 PRÓXIMOS PASSOS\n')
  console.log('1. Acesse os links acima para testar as funcionalidades')
  console.log('2. Configure integrações no admin global')
  console.log('3. Teste o CRUD de produtos e funcionários')
  console.log('4. Verifique a integração com Cubbo')
  console.log('5. Teste a loja pública')

  if (allFilesExist && serverRunning) {
    console.log('\n🎉 Yoobe Platform v2.0.0 está funcionando corretamente!')
  } else {
    console.log('\n⚠️  Alguns problemas foram detectados. Verifique os itens acima.')
  }
}

// Executar testes
testV2()
