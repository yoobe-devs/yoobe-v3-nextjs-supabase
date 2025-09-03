const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'http://localhost:54321'
const supabaseServiceKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function setupPointsSystem() {
  try {
    console.log('🚀 Configurando Sistema de Resgate por Pontos...')

    // 1. Carteira por usuário/tenant
    console.log('💰 Criando tabela wallet_accounts...')
    const { error: walletAccountsError } = await supabase.rpc('exec_sql', {
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

    if (walletAccountsError) {
      console.log(
        '❌ Erro ao criar wallet_accounts:',
        walletAccountsError.message
      )
    } else {
      console.log('✅ Tabela wallet_accounts criada/verificada')
    }

    // 2. Ledger append-only (crédito/débito)
    console.log('📊 Criando tabela wallet_entries...')
    const { error: walletEntriesError } = await supabase.rpc('exec_sql', {
      sql: `
        create table if not exists wallet_entries (
          id uuid primary key default gen_random_uuid(),
          wallet_id uuid not null references wallet_accounts(id) on delete cascade,
          direction text check (direction in ('credit','debit')) not null,
          amount_points bigint not null check (amount_points > 0),
          reason text not null,
          ref_type text,
          ref_id uuid,
          idempotency_key text unique,
          meta jsonb default '{}'::jsonb,
          created_by uuid,
          created_at timestamptz default now()
        );
      `,
    })

    if (walletEntriesError) {
      console.log(
        '❌ Erro ao criar wallet_entries:',
        walletEntriesError.message
      )
    } else {
      console.log('✅ Tabela wallet_entries criada/verificada')
    }

    // 3. Provedores de pontos (gamificação externa)
    console.log('🎮 Criando tabela point_providers...')
    const { error: pointProvidersError } = await supabase.rpc('exec_sql', {
      sql: `
        create table if not exists point_providers (
          id uuid primary key default gen_random_uuid(),
          tenant_id uuid not null,
          name text not null,
          hmac_secret text not null,
          is_active boolean default true,
          created_at timestamptz default now()
        );
      `,
    })

    if (pointProvidersError) {
      console.log(
        '❌ Erro ao criar point_providers:',
        pointProvidersError.message
      )
    } else {
      console.log('✅ Tabela point_providers criada/verificada')
    }

    // 4. Inbox de webhooks (para auditoria e reprocessamento)
    console.log('📨 Criando tabela webhook_inbox...')
    const { error: webhookInboxError } = await supabase.rpc('exec_sql', {
      sql: `
        create table if not exists webhook_inbox (
          id uuid primary key default gen_random_uuid(),
          tenant_id uuid not null,
          provider_id uuid references point_providers(id),
          event_type text not null,
          signature text,
          payload jsonb not null,
          status text check (status in ('received','processed','error','ignored')) default 'received',
          error text,
          idempotency_key text,
          processed_at timestamptz,
          created_at timestamptz default now(),
          unique (tenant_id, idempotency_key)
        );
      `,
    })

    if (webhookInboxError) {
      console.log('❌ Erro ao criar webhook_inbox:', webhookInboxError.message)
    } else {
      console.log('✅ Tabela webhook_inbox criada/verificada')
    }

    // 5. Regras de conversão de pontos (tenant-level, versionadas)
    console.log('🔄 Criando tabela points_conversion_rules...')
    const { error: conversionRulesError } = await supabase.rpc('exec_sql', {
      sql: `
        create table if not exists points_conversion_rules (
          id uuid primary key default gen_random_uuid(),
          tenant_id uuid not null,
          status text check (status in ('active','scheduled','inactive')) default 'active',
          base_currency text not null default 'BRL',
          points_per_currency numeric(18,6) not null check (points_per_currency > 0),
          rounding_mode text check (rounding_mode in ('ceil','floor','round')) default 'ceil',
          min_points bigint default 0,
          max_points bigint,
          effective_from timestamptz default now(),
          effective_to timestamptz,
          created_by uuid,
          created_at timestamptz default now()
        );
      `,
    })

    if (conversionRulesError) {
      console.log(
        '❌ Erro ao criar points_conversion_rules:',
        conversionRulesError.message
      )
    } else {
      console.log('✅ Tabela points_conversion_rules criada/verificada')
    }

    // 6. Adicionar colunas de pontos na tabela de produtos da loja
    console.log('🛍️ Adicionando colunas de pontos em product_store...')
    const { error: productStoreError } = await supabase.rpc('exec_sql', {
      sql: `
        DO $$ 
        BEGIN 
          IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'product_store' AND column_name = 'allow_points'
          ) THEN
            ALTER TABLE product_store ADD COLUMN allow_points boolean default false;
          END IF;
          
          IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'product_store' AND column_name = 'points_price'
          ) THEN
            ALTER TABLE product_store ADD COLUMN points_price bigint check (points_price >= 0);
          END IF;
          
          IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'product_store' AND column_name = 'points_override'
          ) THEN
            ALTER TABLE product_store ADD COLUMN points_override boolean default false;
          END IF;
          
          IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'product_store' AND column_name = 'points_override_value'
          ) THEN
            ALTER TABLE product_store ADD COLUMN points_override_value bigint check (points_override_value >= 0);
          END IF;
        END $$;
      `,
    })

    if (productStoreError) {
      console.log(
        '❌ Erro ao adicionar colunas em product_store:',
        productStoreError.message
      )
    } else {
      console.log('✅ Colunas de pontos adicionadas em product_store')
    }

    // 7. Resgates (checkout por pontos)
    console.log('🎁 Criando tabela redemptions...')
    const { error: redemptionsError } = await supabase.rpc('exec_sql', {
      sql: `
        create table if not exists redemptions (
          id uuid primary key default gen_random_uuid(),
          tenant_id uuid not null,
          user_id uuid not null,
          store_product_id uuid not null references product_store(id),
          qty int not null check (qty > 0),
          payment_method text check (payment_method in ('points')) not null default 'points',
          total_points bigint not null check (total_points >= 0),
          status text check (status in ('requested','approved','fulfilled','shipped','delivered','failed','cancelled')) default 'requested',
          address_id uuid,
          track_code text,
          meta jsonb default '{}'::jsonb,
          idempotency_key text unique,
          conversion_snapshot jsonb,
          created_at timestamptz default now(),
          created_by uuid
        );
      `,
    })

    if (redemptionsError) {
      console.log('❌ Erro ao criar redemptions:', redemptionsError.message)
    } else {
      console.log('✅ Tabela redemptions criada/verificada')
    }

    // 8. Catálogo de erros para aprendizado e prevenção
    console.log('📚 Criando tabela errors_catalog...')
    const { error: errorsCatalogError } = await supabase.rpc('exec_sql', {
      sql: `
        create table if not exists errors_catalog (
          id uuid primary key default gen_random_uuid(),
          tenant_id uuid,
          error_type text not null,
          route text not null,
          stack_trace_hash text not null,
          context jsonb default '{}'::jsonb,
          occurrence_count int default 1,
          first_occurrence timestamptz default now(),
          last_occurrence timestamptz default now(),
          resolution_notes text,
          is_resolved boolean default false,
          created_at timestamptz default now()
        );
      `,
    })

    if (errorsCatalogError) {
      console.log(
        '❌ Erro ao criar errors_catalog:',
        errorsCatalogError.message
      )
    } else {
      console.log('✅ Tabela errors_catalog criada/verificada')
    }

    // 9. Índices para performance
    console.log('⚡ Criando índices...')
    const { error: indexesError } = await supabase.rpc('exec_sql', {
      sql: `
        create index if not exists idx_wallet_accounts_tenant_user on wallet_accounts(tenant_id, user_id);
        create index if not exists idx_wallet_entries_wallet_id on wallet_entries(wallet_id);
        create index if not exists idx_wallet_entries_idempotency on wallet_entries(idempotency_key);
        create index if not exists idx_points_conversion_rules_tenant_status on points_conversion_rules(tenant_id, status);
        create index if not exists idx_redemptions_tenant_user on redemptions(tenant_id, user_id);
        create index if not exists idx_redemptions_idempotency on redemptions(idempotency_key);
        create index if not exists idx_webhook_inbox_tenant_idempotency on webhook_inbox(tenant_id, idempotency_key);
        create index if not exists idx_errors_catalog_fingerprint on errors_catalog(error_type, stack_trace_hash);
      `,
    })

    if (indexesError) {
      console.log('❌ Erro ao criar índices:', indexesError.message)
    } else {
      console.log('✅ Índices criados/verificados')
    }

    // 10. Habilitar RLS
    console.log('🔒 Habilitando Row Level Security...')
    const { error: rlsError } = await supabase.rpc('exec_sql', {
      sql: `
        alter table wallet_accounts enable row level security;
        alter table wallet_entries enable row level security;
        alter table point_providers enable row level security;
        alter table webhook_inbox enable row level security;
        alter table points_conversion_rules enable row level security;
        alter table redemptions enable row level security;
        alter table errors_catalog enable row level security;
      `,
    })

    if (rlsError) {
      console.log('❌ Erro ao habilitar RLS:', rlsError.message)
    } else {
      console.log('✅ RLS habilitado')
    }

    // 11. Criar políticas RLS
    console.log('🛡️ Criando políticas RLS...')
    const { error: policiesError } = await supabase.rpc('exec_sql', {
      sql: `
        -- Wallet Accounts RLS
        drop policy if exists "Users can view own wallet" on wallet_accounts;
        create policy "Users can view own wallet" on wallet_accounts
          for select using (auth.uid() = user_id and auth.tenant_id() = tenant_id);

        drop policy if exists "Gestors can view all wallets in tenant" on wallet_accounts;
        create policy "Gestors can view all wallets in tenant" on wallet_accounts
          for select using (auth.role() = 'gestor' and auth.tenant_id() = tenant_id);

        drop policy if exists "Admin can view all wallets" on wallet_accounts;
        create policy "Admin can view all wallets" on wallet_accounts
          for select using (auth.role() = 'admin_global');

        drop policy if exists "System can create wallets" on wallet_accounts;
        create policy "System can create wallets" on wallet_accounts
          for insert with check (true);

        -- Wallet Entries RLS
        drop policy if exists "Users can view own wallet entries" on wallet_entries;
        create policy "Users can view own wallet entries" on wallet_entries
          for select using (
            wallet_id in (
              select id from wallet_accounts 
              where user_id = auth.uid() and tenant_id = auth.tenant_id()
            )
          );

        drop policy if exists "Gestors can view all entries in tenant" on wallet_entries;
        create policy "Gestors can view all entries in tenant" on wallet_entries
          for select using (auth.role() = 'gestor' and auth.tenant_id() = tenant_id);

        drop policy if exists "Admin can view all entries" on wallet_entries;
        create policy "Admin can view all entries" on wallet_entries
          for select using (auth.role() = 'admin_global');

        drop policy if exists "System can create entries" on wallet_entries;
        create policy "System can create entries" on wallet_entries
          for insert with check (true);

        -- Points Conversion Rules RLS
        drop policy if exists "Gestors can manage conversion rules in tenant" on points_conversion_rules;
        create policy "Gestors can manage conversion rules in tenant" on points_conversion_rules
          for all using (auth.role() = 'gestor' and auth.tenant_id() = tenant_id);

        drop policy if exists "Users can view active rules in tenant" on points_conversion_rules;
        create policy "Users can view active rules in tenant" on points_conversion_rules
          for select using (auth.tenant_id() = tenant_id and status = 'active');

        drop policy if exists "Admin can manage all rules" on points_conversion_rules;
        create policy "Admin can manage all rules" on points_conversion_rules
          for all using (auth.role() = 'admin_global');

        -- Redemptions RLS
        drop policy if exists "Users can manage own redemptions" on redemptions;
        create policy "Users can manage own redemptions" on redemptions
          for all using (auth.uid() = user_id and auth.tenant_id() = tenant_id);

        drop policy if exists "Gestors can view all redemptions in tenant" on redemptions;
        create policy "Gestors can view all redemptions in tenant" on redemptions
          for select using (auth.role() = 'gestor' and auth.tenant_id() = tenant_id);

        drop policy if exists "Admin can manage all redemptions" on redemptions;
        create policy "Admin can manage all redemptions" on redemptions
          for all using (auth.role() = 'admin_global');

        -- Point Providers RLS
        drop policy if exists "Gestors can manage providers in tenant" on point_providers;
        create policy "Gestors can manage providers in tenant" on point_providers
          for all using (auth.role() = 'gestor' and auth.tenant_id() = tenant_id);

        drop policy if exists "Admin can manage all providers" on point_providers;
        create policy "Admin can manage all providers" on point_providers
          for all using (auth.role() = 'admin_global');

        -- Webhook Inbox RLS
        drop policy if exists "System can manage webhooks" on webhook_inbox;
        create policy "System can manage webhooks" on webhook_inbox
          for all using (true);

        -- Errors Catalog RLS
        drop policy if exists "Gestors can view errors in tenant" on errors_catalog;
        create policy "Gestors can view errors in tenant" on errors_catalog
          for select using (auth.role() = 'gestor' and (tenant_id = auth.tenant_id() or tenant_id is null));

        drop policy if exists "Admin can manage all errors" on errors_catalog;
        create policy "Admin can manage all errors" on errors_catalog
          for all using (auth.role() = 'admin_global');
      `,
    })

    if (policiesError) {
      console.log('❌ Erro ao criar políticas RLS:', policiesError.message)
    } else {
      console.log('✅ Políticas RLS criadas')
    }

    // 12. Funções auxiliares
    console.log('🔧 Criando funções auxiliares...')
    const { error: functionsError } = await supabase.rpc('exec_sql', {
      sql: `
        create or replace function get_wallet_balance(p_user_id uuid, p_tenant_id uuid)
        returns bigint as $$
        declare
          v_balance bigint := 0;
        begin
          select coalesce(sum(
            case 
              when direction = 'credit' then amount_points
              when direction = 'debit' then -amount_points
            end
          ), 0) into v_balance
          from wallet_entries we
          join wallet_accounts wa on we.wallet_id = wa.id
          where wa.user_id = p_user_id and wa.tenant_id = p_tenant_id;
          
          return v_balance;
        end;
        $$ language plpgsql security definer;

        create or replace function calculate_points_price(
          p_price_brl numeric,
          p_tenant_id uuid,
          p_rounding_mode text default 'ceil'
        )
        returns bigint as $$
        declare
          v_points_per_currency numeric;
          v_points bigint;
        begin
          select points_per_currency into v_points_per_currency
          from points_conversion_rules
          where tenant_id = p_tenant_id 
            and status = 'active'
            and (effective_to is null or effective_to > now())
          order by effective_from desc
          limit 1;
          
          if v_points_per_currency is null then
            return null;
          end if;
          
          v_points := p_price_brl * v_points_per_currency;
          
          case p_rounding_mode
            when 'ceil' then
              return ceil(v_points);
            when 'floor' then
              return floor(v_points);
            when 'round' then
              return round(v_points);
            else
              return ceil(v_points);
          end case;
        end;
        $$ language plpgsql security definer;
      `,
    })

    if (functionsError) {
      console.log('❌ Erro ao criar funções:', functionsError.message)
    } else {
      console.log('✅ Funções auxiliares criadas')
    }

    // 13. Dados iniciais (exemplo)
    console.log('🌱 Criando dados iniciais...')
    const { error: initialDataError } = await supabase.rpc('exec_sql', {
      sql: `
        insert into points_conversion_rules (tenant_id, points_per_currency, rounding_mode, created_by)
        select 
          t.id,
          10, -- 10 pontos por R$1
          'ceil',
          u.id
        from tenants t
        cross join users u
        where u.role = 'admin_global'
        limit 1
        on conflict do nothing;
      `,
    })

    if (initialDataError) {
      console.log('⚠️ Aviso ao criar dados iniciais:', initialDataError.message)
    } else {
      console.log('✅ Dados iniciais criados')
    }

    console.log('🎉 Sistema de Resgate por Pontos configurado com sucesso!')
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

setupPointsSystem()
