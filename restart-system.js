const { exec } = require('child_process')
const { promisify } = require('util')

const execAsync = promisify(exec)

async function restartSystem() {
  console.log('🔄 Reiniciando sistema...')
  
  try {
    // 1. Parar servidor Next.js
    console.log('⏹️ Parando servidor Next.js...')
    await execAsync('pkill -f "next dev"')
    
    // 2. Parar Supabase
    console.log('⏹️ Parando Supabase...')
    await execAsync('npx supabase stop')
    
    // 3. Aguardar um pouco
    console.log('⏳ Aguardando...')
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // 4. Iniciar Supabase
    console.log('🚀 Iniciando Supabase...')
    await execAsync('npx supabase start')
    
    // 5. Aguardar Supabase inicializar
    console.log('⏳ Aguardando Supabase inicializar...')
    await new Promise(resolve => setTimeout(resolve, 5000))
    
    // 6. Criar dados de teste
    console.log('📋 Criando dados de teste...')
    await execAsync('node create-test-data.js')
    
    // 7. Iniciar servidor Next.js
    console.log('🚀 Iniciando servidor Next.js...')
    execAsync('npm run dev')
    
    console.log('\n✅ Sistema reiniciado!')
    console.log('🌐 Acesse: http://localhost:3000/auth/login')
    console.log('👤 Use: admin@yoobe.com / admin123')
    
  } catch (error) {
    console.error('❌ Erro:', error.message)
  }
}

restartSystem()
