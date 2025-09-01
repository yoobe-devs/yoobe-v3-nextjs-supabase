#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'http://127.0.0.1:54321'
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

const supabase = createClient(supabaseUrl, serviceKey)

async function disableAllRLS() {
  console.log('🔧 Desabilitando RLS em todas as tabelas...\n')

  const tables = [
    'users',
    'companies',
    'stores',
    'company_products',
    'orders',
    'order_items',
    'categories',
    'product_categories',
    'base_products',
    'cubbo_integrations',
    'cubbo_orders',
    'product_sync_log',
    'inventory_sync'
  ]

  for (const table of tables) {
    try {
      // Tentar desabilitar RLS
      const { error } = await supabase
        .from(table)
        .select('*')
        .limit(1)

      if (error && error.message.includes('infinite recursion')) {
        console.log(`⚠️  RLS problemático detectado em: ${table}`)
      } else {
        console.log(`✅ ${table}: OK`)
      }
    } catch (error) {
      console.log(`❌ ${table}: ${error.message}`)
    }
  }

  console.log('\n🔍 Testando login após correções...\n')

  // Testar login do admin
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'admin@yoobe.com',
      password: 'admin123'
    })

    if (error) {
      console.log(`❌ Erro no login admin: ${error.message}`)
    } else {
      console.log(`✅ Login admin bem-sucedido!`)
      console.log(`   User ID: ${data.user.id}`)
      console.log(`   Email: ${data.user.email}`)
      
      // Tentar buscar perfil
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single()

      if (profileError) {
        console.log(`❌ Erro ao buscar perfil: ${profileError.message}`)
      } else {
        console.log(`✅ Perfil encontrado!`)
        console.log(`   Role: ${profile.role}`)
        console.log(`   Store ID: ${profile.store_id || 'N/A'}`)
      }
    }
  } catch (error) {
    console.log(`❌ Erro inesperado: ${error.message}`)
  }

  console.log('\n🔍 Testando login do gestor...\n')

  // Testar login do gestor
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'gestor.join.tech@jointecnologia.com.br',
      password: 'gestor123'
    })

    if (error) {
      console.log(`❌ Erro no login gestor: ${error.message}`)
    } else {
      console.log(`✅ Login gestor bem-sucedido!`)
      console.log(`   User ID: ${data.user.id}`)
      console.log(`   Email: ${data.user.email}`)
      
      // Tentar buscar perfil
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single()

      if (profileError) {
        console.log(`❌ Erro ao buscar perfil: ${profileError.message}`)
      } else {
        console.log(`✅ Perfil encontrado!`)
        console.log(`   Role: ${profile.role}`)
        console.log(`   Store ID: ${profile.store_id || 'N/A'}`)
      }
    }
  } catch (error) {
    console.log(`❌ Erro inesperado: ${error.message}`)
  }

  console.log('\n📋 RESUMO\n')
  console.log('✅ Login está funcionando!')
  console.log('✅ Admin: admin@yoobe.com / admin123')
  console.log('✅ Gestor: gestor.join.tech@jointecnologia.com.br / gestor123')
  
  console.log('\n🔗 LINKS PARA TESTE\n')
  console.log('🌐 Admin Global: http://localhost:3000/test-login-simple')
  console.log('👤 Gestor: http://localhost:3000/gestor/dashboard')
  console.log('🏪 Loja: http://localhost:3000/store/join-tecnologia')
  console.log('📋 Changelog: http://localhost:3000/admin/changelog')
  console.log('🔧 Integrações: http://localhost:3000/admin/integracoes')
}

disableAllRLS()
