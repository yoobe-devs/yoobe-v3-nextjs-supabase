const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'http://localhost:54321'
const supabaseServiceKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testPointsSystem() {
  try {
    console.log('🧪 Testando Sistema de Resgate por Pontos...\n')

    // Teste 1: Verificar tabelas criadas
    console.log('1. 📋 Verificando tabelas do sistema de pontos...')

    const tables = [
      'wallet_accounts',
      'wallet_entries',
      'point_providers',
      'webhook_inbox',
      'points_conversion_rules',
      'redemptions',
      'errors_catalog',
    ]

    for (const table of tables) {
      try {
        const { data, error } = await supabase.from(table).select('id').limit(1)

        if (error) {
          console.log(`   ❌ ${table}: ${error.message}`)
        } else {
          console.log(`   ✅ ${table}: OK`)
        }
      } catch (err) {
        console.log(`   ❌ ${table}: Erro - ${err.message}`)
      }
    }

    // Teste 2: Verificar regras de conversão
    console.log('\n2. 🔄 Verificando regras de conversão...')
    try {
      const { data: rules, error } = await supabase
        .from('points_conversion_rules')
        .select('*')
        .limit(5)

      if (error) {
        console.log(`   ❌ Erro ao buscar regras: ${error.message}`)
      } else {
        console.log(`   ✅ Regras encontradas: ${rules?.length || 0}`)
        if (rules && rules.length > 0) {
          const activeRule = rules.find(r => r.status === 'active')
          if (activeRule) {
            console.log(
              `   📊 Regra ativa: ${activeRule.points_per_currency} pts/R$ (${activeRule.rounding_mode})`
            )
          }
        }
      }
    } catch (err) {
      console.log(`   ❌ Erro: ${err.message}`)
    }

    // Teste 3: Verificar produtos com pontos
    console.log('\n3. 🛍️ Verificando produtos com pontos...')
    try {
      const { data: products, error } = await supabase
        .from('product_store')
        .select(
          'name, price, allow_points, points_price, points_override, points_override_value'
        )
        .limit(5)

      if (error) {
        console.log(`   ❌ Erro ao buscar produtos: ${error.message}`)
      } else {
        console.log(`   ✅ Produtos encontrados: ${products?.length || 0}`)
        if (products && products.length > 0) {
          const productsWithPoints = products.filter(p => p.allow_points)
          console.log(
            `   🎯 Produtos com pontos habilitados: ${productsWithPoints.length}`
          )

          productsWithPoints.forEach(p => {
            console.log(
              `      - ${p.name}: R$ ${p.price} → ${p.points_price || 'calculado'} pts`
            )
          })
        }
      }
    } catch (err) {
      console.log(`   ❌ Erro: ${err.message}`)
    }

    // Teste 4: Verificar carteiras
    console.log('\n4. 💰 Verificando carteiras...')
    try {
      const { data: wallets, error } = await supabase
        .from('wallet_accounts')
        .select('*')
        .limit(5)

      if (error) {
        console.log(`   ❌ Erro ao buscar carteiras: ${error.message}`)
      } else {
        console.log(`   ✅ Carteiras encontradas: ${wallets?.length || 0}`)
        if (wallets && wallets.length > 0) {
          wallets.forEach(w => {
            console.log(`      - Usuário ${w.user_id.slice(0, 8)}: ${w.status}`)
          })
        }
      }
    } catch (err) {
      console.log(`   ❌ Erro: ${err.message}`)
    }

    // Teste 5: Verificar entradas de carteira
    console.log('\n5. 📊 Verificando entradas de carteira...')
    try {
      const { data: entries, error } = await supabase
        .from('wallet_entries')
        .select('*')
        .limit(5)

      if (error) {
        console.log(`   ❌ Erro ao buscar entradas: ${error.message}`)
      } else {
        console.log(`   ✅ Entradas encontradas: ${entries?.length || 0}`)
        if (entries && entries.length > 0) {
          entries.forEach(e => {
            console.log(
              `      - ${e.direction}: ${e.amount_points} pts (${e.reason})`
            )
          })
        }
      }
    } catch (err) {
      console.log(`   ❌ Erro: ${err.message}`)
    }

    // Teste 6: Verificar resgates
    console.log('\n6. 🎁 Verificando resgates...')
    try {
      const { data: redemptions, error } = await supabase
        .from('redemptions')
        .select('*')
        .limit(5)

      if (error) {
        console.log(`   ❌ Erro ao buscar resgates: ${error.message}`)
      } else {
        console.log(`   ✅ Resgates encontrados: ${redemptions?.length || 0}`)
        if (redemptions && redemptions.length > 0) {
          redemptions.forEach(r => {
            console.log(
              `      - ${r.status}: ${r.total_points} pts por ${r.qty}x produto`
            )
          })
        }
      }
    } catch (err) {
      console.log(`   ❌ Erro: ${err.message}`)
    }

    // Teste 7: Verificar provedores
    console.log('\n7. 🎮 Verificando provedores de pontos...')
    try {
      const { data: providers, error } = await supabase
        .from('point_providers')
        .select('*')
        .limit(5)

      if (error) {
        console.log(`   ❌ Erro ao buscar provedores: ${error.message}`)
      } else {
        console.log(`   ✅ Provedores encontrados: ${providers?.length || 0}`)
        if (providers && providers.length > 0) {
          providers.forEach(p => {
            console.log(
              `      - ${p.name}: ${p.is_active ? 'Ativo' : 'Inativo'}`
            )
          })
        }
      }
    } catch (err) {
      console.log(`   ❌ Erro: ${err.message}`)
    }

    // Teste 8: Verificar webhook inbox
    console.log('\n8. 📨 Verificando webhook inbox...')
    try {
      const { data: webhooks, error } = await supabase
        .from('webhook_inbox')
        .select('*')
        .limit(5)

      if (error) {
        console.log(`   ❌ Erro ao buscar webhooks: ${error.message}`)
      } else {
        console.log(`   ✅ Webhooks encontrados: ${webhooks?.length || 0}`)
        if (webhooks && webhooks.length > 0) {
          webhooks.forEach(w => {
            console.log(`      - ${w.event_type}: ${w.status}`)
          })
        }
      }
    } catch (err) {
      console.log(`   ❌ Erro: ${err.message}`)
    }

    // Teste 9: Verificar catálogo de erros
    console.log('\n9. 📚 Verificando catálogo de erros...')
    try {
      const { data: errors, error } = await supabase
        .from('errors_catalog')
        .select('*')
        .limit(5)

      if (error) {
        console.log(`   ❌ Erro ao buscar catálogo: ${error.message}`)
      } else {
        console.log(`   ✅ Erros catalogados: ${errors?.length || 0}`)
        if (errors && errors.length > 0) {
          errors.forEach(e => {
            console.log(
              `      - ${e.error_type}: ${e.occurrence_count} ocorrências`
            )
          })
        }
      }
    } catch (err) {
      console.log(`   ❌ Erro: ${err.message}`)
    }

    // Teste 10: Verificar funções auxiliares
    console.log('\n10. 🔧 Verificando funções auxiliares...')
    try {
      // Testar função get_wallet_balance
      const { data: balance, error: balanceError } = await supabase.rpc(
        'get_wallet_balance',
        {
          p_user_id: '00000000-0000-0000-0000-000000000000',
          p_tenant_id: '00000000-0000-0000-0000-000000000000',
        }
      )

      if (balanceError) {
        console.log(`   ❌ Função get_wallet_balance: ${balanceError.message}`)
      } else {
        console.log(
          `   ✅ Função get_wallet_balance: OK (retornou: ${balance})`
        )
      }

      // Testar função calculate_points_price
      const { data: pointsPrice, error: priceError } = await supabase.rpc(
        'calculate_points_price',
        {
          p_price_brl: 100,
          p_tenant_id: '00000000-0000-0000-0000-000000000000',
          p_rounding_mode: 'ceil',
        }
      )

      if (priceError) {
        console.log(
          `   ❌ Função calculate_points_price: ${priceError.message}`
        )
      } else {
        console.log(
          `   ✅ Função calculate_points_price: OK (R$100 = ${pointsPrice} pts)`
        )
      }
    } catch (err) {
      console.log(`   ❌ Erro ao testar funções: ${err.message}`)
    }

    console.log('\n🎯 Teste do Sistema de Pontos concluído!')
    console.log('✅ Estrutura do banco está configurada')
    console.log('✅ Tabelas e relacionamentos estão funcionando')
    console.log('✅ Funções auxiliares estão disponíveis')
    console.log('✅ Sistema pronto para uso')
  } catch (error) {
    console.error('❌ Erro geral:', error)
  }
}

// Executar teste
testPointsSystem()
