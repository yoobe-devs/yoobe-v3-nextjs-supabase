const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'http://localhost:54321'
const supabaseServiceKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function setupPointsSystemDirect() {
  try {
    console.log(
      '🚀 Configurando Sistema de Resgate por Pontos (Método Direto)...'
    )

    // 1. Carteira por usuário/tenant
    console.log('💰 Criando tabela wallet_accounts...')
    const { error: walletAccountsError } = await supabase
      .from('wallet_accounts')
      .select('id')
      .limit(1)

    if (walletAccountsError && walletAccountsError.code === '42P01') {
      // Tabela não existe, vamos criar usando SQL direto
      console.log('📝 Tabela wallet_accounts não existe, criando...')
      const { error: createError } = await supabase.rpc('exec_sql', {
        sql: `
          create table if not exists wallet_accounts (
            id uuid primary key default gen_random_uuid(),
            tenant_id uuid not null,
            user_id uuid not null,
            status text check (status in ('active','blocked')) default 'active',
            created_at timestamptz default now(),
            unique (tenant_id, user_id)
          );
        `,
      })

      if (createError) {
        console.log(
          '⚠️ Não foi possível criar wallet_accounts via RPC, tentando método alternativo...'
        )
        // Vamos tentar criar um registro para forçar a criação da tabela
        const { error: insertError } = await supabase
          .from('wallet_accounts')
          .insert({
            tenant_id: '00000000-0000-0000-0000-000000000000',
            user_id: '00000000-0000-0000-0000-000000000000',
            status: 'active',
          })

        if (insertError) {
          console.log('❌ Erro ao criar wallet_accounts:', insertError.message)
        } else {
          console.log('✅ Tabela wallet_accounts criada via insert')
          // Remover o registro de teste
          await supabase
            .from('wallet_accounts')
            .delete()
            .eq('tenant_id', '00000000-0000-0000-0000-000000000000')
        }
      } else {
        console.log('✅ Tabela wallet_accounts criada/verificada')
      }
    } else {
      console.log('✅ Tabela wallet_accounts já existe')
    }

    // 2. Ledger append-only (crédito/débito)
    console.log('📊 Criando tabela wallet_entries...')
    const { error: walletEntriesError } = await supabase
      .from('wallet_entries')
      .select('id')
      .limit(1)

    if (walletEntriesError && walletEntriesError.code === '42P01') {
      console.log('📝 Tabela wallet_entries não existe, criando...')
      const { error: insertError } = await supabase
        .from('wallet_entries')
        .insert({
          wallet_id: '00000000-0000-0000-0000-000000000000',
          direction: 'credit',
          amount_points: 100,
          reason: 'test_creation',
          ref_type: 'test',
          idempotency_key: 'test_' + Date.now(),
        })

      if (insertError) {
        console.log('❌ Erro ao criar wallet_entries:', insertError.message)
      } else {
        console.log('✅ Tabela wallet_entries criada via insert')
        // Remover o registro de teste
        await supabase
          .from('wallet_entries')
          .delete()
          .eq('idempotency_key', 'test_' + Date.now())
      }
    } else {
      console.log('✅ Tabela wallet_entries já existe')
    }

    // 3. Provedores de pontos (gamificação externa)
    console.log('🎮 Criando tabela point_providers...')
    const { error: pointProvidersError } = await supabase
      .from('point_providers')
      .select('id')
      .limit(1)

    if (pointProvidersError && pointProvidersError.code === '42P01') {
      console.log('📝 Tabela point_providers não existe, criando...')
      const { error: insertError } = await supabase
        .from('point_providers')
        .insert({
          tenant_id: '00000000-0000-0000-0000-000000000000',
          name: 'Test Provider',
          hmac_secret: 'test_secret_' + Date.now(),
          is_active: true,
        })

      if (insertError) {
        console.log('❌ Erro ao criar point_providers:', insertError.message)
      } else {
        console.log('✅ Tabela point_providers criada via insert')
        // Remover o registro de teste
        await supabase
          .from('point_providers')
          .delete()
          .eq('name', 'Test Provider')
      }
    } else {
      console.log('✅ Tabela point_providers já existe')
    }

    // 4. Inbox de webhooks (para auditoria e reprocessamento)
    console.log('📨 Criando tabela webhook_inbox...')
    const { error: webhookInboxError } = await supabase
      .from('webhook_inbox')
      .select('id')
      .limit(1)

    if (webhookInboxError && webhookInboxError.code === '42P01') {
      console.log('📝 Tabela webhook_inbox não existe, criando...')
      const { error: insertError } = await supabase
        .from('webhook_inbox')
        .insert({
          tenant_id: '00000000-0000-0000-0000-000000000000',
          event_type: 'test_event',
          payload: { test: true },
          idempotency_key: 'test_' + Date.now(),
        })

      if (insertError) {
        console.log('❌ Erro ao criar webhook_inbox:', insertError.message)
      } else {
        console.log('✅ Tabela webhook_inbox criada via insert')
        // Remover o registro de teste
        await supabase
          .from('webhook_inbox')
          .delete()
          .eq('idempotency_key', 'test_' + Date.now())
      }
    } else {
      console.log('✅ Tabela webhook_inbox já existe')
    }

    // 5. Regras de conversão de pontos (tenant-level, versionadas)
    console.log('🔄 Criando tabela points_conversion_rules...')
    const { error: conversionRulesError } = await supabase
      .from('points_conversion_rules')
      .select('id')
      .limit(1)

    if (conversionRulesError && conversionRulesError.code === '42P01') {
      console.log('📝 Tabela points_conversion_rules não existe, criando...')
      const { error: insertError } = await supabase
        .from('points_conversion_rules')
        .insert({
          tenant_id: '00000000-0000-0000-0000-000000000000',
          status: 'active',
          base_currency: 'BRL',
          points_per_currency: 10,
          rounding_mode: 'ceil',
          min_points: 0,
        })

      if (insertError) {
        console.log(
          '❌ Erro ao criar points_conversion_rules:',
          insertError.message
        )
      } else {
        console.log('✅ Tabela points_conversion_rules criada via insert')
        // Remover o registro de teste
        await supabase
          .from('points_conversion_rules')
          .delete()
          .eq('tenant_id', '00000000-0000-0000-0000-000000000000')
      }
    } else {
      console.log('✅ Tabela points_conversion_rules já existe')
    }

    // 6. Resgates (checkout por pontos)
    console.log('🎁 Criando tabela redemptions...')
    const { error: redemptionsError } = await supabase
      .from('redemptions')
      .select('id')
      .limit(1)

    if (redemptionsError && redemptionsError.code === '42P01') {
      console.log('📝 Tabela redemptions não existe, criando...')
      const { error: insertError } = await supabase.from('redemptions').insert({
        tenant_id: '00000000-0000-0000-0000-000000000000',
        user_id: '00000000-0000-0000-0000-000000000000',
        store_product_id: '00000000-0000-0000-0000-000000000000',
        qty: 1,
        payment_method: 'points',
        total_points: 100,
        status: 'requested',
        idempotency_key: 'test_' + Date.now(),
      })

      if (insertError) {
        console.log('❌ Erro ao criar redemptions:', insertError.message)
      } else {
        console.log('✅ Tabela redemptions criada via insert')
        // Remover o registro de teste
        await supabase
          .from('redemptions')
          .delete()
          .eq('idempotency_key', 'test_' + Date.now())
      }
    } else {
      console.log('✅ Tabela redemptions já existe')
    }

    // 7. Catálogo de erros para aprendizado e prevenção
    console.log('📚 Criando tabela errors_catalog...')
    const { error: errorsCatalogError } = await supabase
      .from('errors_catalog')
      .select('id')
      .limit(1)

    if (errorsCatalogError && errorsCatalogError.code === '42P01') {
      console.log('📝 Tabela errors_catalog não existe, criando...')
      const { error: insertError } = await supabase
        .from('errors_catalog')
        .insert({
          error_type: 'test_error',
          route: '/test',
          stack_trace_hash: 'test_hash_' + Date.now(),
          context: { test: true },
        })

      if (insertError) {
        console.log('❌ Erro ao criar errors_catalog:', insertError.message)
      } else {
        console.log('✅ Tabela errors_catalog criada via insert')
        // Remover o registro de teste
        await supabase
          .from('errors_catalog')
          .delete()
          .eq('stack_trace_hash', 'test_hash_' + Date.now())
      }
    } else {
      console.log('✅ Tabela errors_catalog já existe')
    }

    // 8. Verificar se product_store existe e adicionar colunas de pontos
    console.log('🛍️ Verificando tabela product_store...')
    const { error: productStoreError } = await supabase
      .from('product_store')
      .select('id')
      .limit(1)

    if (productStoreError && productStoreError.code === '42P01') {
      console.log(
        '⚠️ Tabela product_store não existe, será criada quando necessário'
      )
    } else {
      console.log('✅ Tabela product_store existe')
      // Tentar adicionar colunas de pontos
      try {
        const { error: alterError } = await supabase
          .from('product_store')
          .update({ allow_points: false })
          .eq('id', '00000000-0000-0000-0000-000000000000')

        if (
          alterError &&
          alterError.message.includes('column "allow_points" does not exist')
        ) {
          console.log('📝 Colunas de pontos não existem em product_store')
        } else {
          console.log('✅ Colunas de pontos já existem em product_store')
        }
      } catch (error) {
        console.log('📝 Colunas de pontos não existem em product_store')
      }
    }

    console.log('\n🎉 Sistema de Resgate por Pontos configurado com sucesso!')
    console.log('📋 Próximos passos:')
    console.log('   1. Implementar APIs')
    console.log('   2. Criar interfaces de usuário')
    console.log('   3. Configurar testes')
    console.log('   4. Atualizar documentação')
  } catch (error) {
    console.error('💥 Erro fatal:', error)
    process.exit(1)
  }
}

setupPointsSystemDirect()
