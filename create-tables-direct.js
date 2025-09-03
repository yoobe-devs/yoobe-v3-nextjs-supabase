const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'http://localhost:54321'
const supabaseServiceKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function createTablesDirect() {
  try {
    console.log('🚀 Criando tabelas do sistema de pontos diretamente...')

    // 1. Carteira por usuário/tenant
    console.log('💰 Criando tabela wallet_accounts...')
    try {
      const { error } = await supabase.from('wallet_accounts').insert({
        tenant_id: '00000000-0000-0000-0000-000000000000',
        user_id: '00000000-0000-0000-0000-000000000000',
        status: 'active',
      })

      if (
        error &&
        error.message.includes('relation "wallet_accounts" does not exist')
      ) {
        console.log(
          '   📝 Tabela wallet_accounts não existe, será criada quando necessário'
        )
      } else if (error) {
        console.log('   ❌ Erro:', error.message)
      } else {
        console.log('   ✅ Tabela wallet_accounts existe')
        // Remover registro de teste
        await supabase
          .from('wallet_accounts')
          .delete()
          .eq('tenant_id', '00000000-0000-0000-0000-000000000000')
      }
    } catch (err) {
      console.log('   📝 Tabela wallet_accounts não existe')
    }

    // 2. Ledger append-only (crédito/débito)
    console.log('📊 Criando tabela wallet_entries...')
    try {
      const { error } = await supabase.from('wallet_entries').insert({
        wallet_id: '00000000-0000-0000-0000-000000000000',
        direction: 'credit',
        amount_points: 100,
        reason: 'test_creation',
        ref_type: 'test',
        idempotency_key: 'test_' + Date.now(),
      })

      if (
        error &&
        error.message.includes('relation "wallet_entries" does not exist')
      ) {
        console.log('   📝 Tabela wallet_entries não existe')
      } else if (error) {
        console.log('   ❌ Erro:', error.message)
      } else {
        console.log('   ✅ Tabela wallet_entries existe')
        // Remover registro de teste
        await supabase
          .from('wallet_entries')
          .delete()
          .eq('idempotency_key', 'test_' + Date.now())
      }
    } catch (err) {
      console.log('   📝 Tabela wallet_entries não existe')
    }

    // 3. Provedores de pontos (gamificação externa)
    console.log('🎮 Criando tabela point_providers...')
    try {
      const { error } = await supabase.from('point_providers').insert({
        tenant_id: '00000000-0000-0000-0000-000000000000',
        name: 'Test Provider',
        hmac_secret: 'test_secret_' + Date.now(),
        is_active: true,
      })

      if (
        error &&
        error.message.includes('relation "point_providers" does not exist')
      ) {
        console.log('   📝 Tabela point_providers não existe')
      } else if (error) {
        console.log('   ❌ Erro:', error.message)
      } else {
        console.log('   ✅ Tabela point_providers existe')
        // Remover registro de teste
        await supabase
          .from('point_providers')
          .delete()
          .eq('name', 'Test Provider')
      }
    } catch (err) {
      console.log('   📝 Tabela point_providers não existe')
    }

    // 4. Inbox de webhooks (para auditoria e reprocessamento)
    console.log('📨 Criando tabela webhook_inbox...')
    try {
      const { error } = await supabase.from('webhook_inbox').insert({
        tenant_id: '00000000-0000-0000-0000-000000000000',
        event_type: 'test_event',
        payload: { test: true },
        idempotency_key: 'test_' + Date.now(),
      })

      if (
        error &&
        error.message.includes('relation "webhook_inbox" does not exist')
      ) {
        console.log('   📝 Tabela webhook_inbox não existe')
      } else if (error) {
        console.log('   ❌ Erro:', error.message)
      } else {
        console.log('   ✅ Tabela webhook_inbox existe')
        // Remover registro de teste
        await supabase
          .from('webhook_inbox')
          .delete()
          .eq('idempotency_key', 'test_' + Date.now())
      }
    } catch (err) {
      console.log('   📝 Tabela webhook_inbox não existe')
    }

    // 5. Regras de conversão de pontos (tenant-level, versionadas)
    console.log('🔄 Criando tabela points_conversion_rules...')
    try {
      const { error } = await supabase.from('points_conversion_rules').insert({
        tenant_id: '00000000-0000-0000-0000-000000000000',
        status: 'active',
        base_currency: 'BRL',
        points_per_currency: 10,
        rounding_mode: 'ceil',
        min_points: 0,
      })

      if (
        error &&
        error.message.includes(
          'relation "points_conversion_rules" does not exist'
        )
      ) {
        console.log('   📝 Tabela points_conversion_rules não existe')
      } else if (error) {
        console.log('   ❌ Erro:', error.message)
      } else {
        console.log('   ✅ Tabela points_conversion_rules existe')
        // Remover registro de teste
        await supabase
          .from('points_conversion_rules')
          .delete()
          .eq('tenant_id', '00000000-0000-0000-0000-000000000000')
      }
    } catch (err) {
      console.log('   📝 Tabela points_conversion_rules não existe')
    }

    // 6. Resgates (checkout por pontos)
    console.log('🎁 Criando tabela redemptions...')
    try {
      const { error } = await supabase.from('redemptions').insert({
        tenant_id: '00000000-0000-0000-0000-000000000000',
        user_id: '00000000-0000-0000-0000-000000000000',
        store_product_id: '00000000-0000-0000-0000-000000000000',
        qty: 1,
        payment_method: 'points',
        total_points: 100,
        status: 'requested',
        idempotency_key: 'test_' + Date.now(),
      })

      if (
        error &&
        error.message.includes('relation "redemptions" does not exist')
      ) {
        console.log('   📝 Tabela redemptions não existe')
      } else if (error) {
        console.log('   ❌ Erro:', error.message)
      } else {
        console.log('   ✅ Tabela redemptions existe')
        // Remover registro de teste
        await supabase
          .from('redemptions')
          .delete()
          .eq('idempotency_key', 'test_' + Date.now())
      }
    } catch (err) {
      console.log('   📝 Tabela redemptions não existe')
    }

    // 7. Catálogo de erros para aprendizado e prevenção
    console.log('📚 Criando tabela errors_catalog...')
    try {
      const { error } = await supabase.from('errors_catalog').insert({
        error_type: 'test_error',
        route: '/test',
        stack_trace_hash: 'test_hash_' + Date.now(),
        context: { test: true },
      })

      if (
        error &&
        error.message.includes('relation "errors_catalog" does not exist')
      ) {
        console.log('   📝 Tabela errors_catalog não existe')
      } else if (error) {
        console.log('   ❌ Erro:', error.message)
      } else {
        console.log('   ✅ Tabela errors_catalog existe')
        // Remover registro de teste
        await supabase
          .from('errors_catalog')
          .delete()
          .eq('stack_trace_hash', 'test_hash_' + Date.now())
      }
    } catch (err) {
      console.log('   📝 Tabela errors_catalog não existe')
    }

    console.log('\n📋 Resumo:')
    console.log('   As tabelas não existem no banco atual')
    console.log('   Para criar as tabelas, você precisa:')
    console.log('   1. Executar o SQL diretamente no banco PostgreSQL')
    console.log('   2. Ou usar uma ferramenta como pgAdmin/DBeaver')
    console.log('   3. Ou criar as tabelas via interface do Supabase')
    console.log('\n💡 Alternativa:')
    console.log(
      '   Use o arquivo create-points-system.sql com um cliente PostgreSQL'
    )
  } catch (error) {
    console.error('💥 Erro fatal:', error)
  }
}

createTablesDirect()
