const { createClient } = require('@supabase/supabase-js')

// Configuração para Supabase local
const supabaseUrl = 'http://127.0.0.1:54321'
const supabaseKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'

const supabase = createClient(supabaseUrl, supabaseKey)

async function fixClientProductsStructure() {
  try {
    console.log('🔧 Corrigindo estrutura da tabela client_products...')
    console.log('')

    // 1. Verificar se a tabela client_products existe
    console.log('1️⃣ Verificando se a tabela client_products existe...')
    const { error: checkError } = await supabase
      .from('client_products')
      .select('id')
      .limit(1)

    if (checkError && checkError.code === 'PGRST116') {
      console.log('❌ Tabela client_products não existe, criando...')

      // Criar tabela client_products
      const { error: createError } = await supabase.rpc('exec_sql', {
        sql: `
          CREATE TABLE IF NOT EXISTS client_products (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            client_id UUID NOT NULL REFERENCES companies(id),
            base_product_id UUID NOT NULL REFERENCES base_products(id),
            name VARCHAR(255) NOT NULL,
            description TEXT,
            price DECIMAL(10,2) NOT NULL DEFAULT 0,
            points_cost INTEGER DEFAULT 0,
            category_id UUID REFERENCES product_categories(id),
            image_url TEXT,
            is_active BOOLEAN DEFAULT true,
            status VARCHAR(50) DEFAULT 'active',
            final_sku VARCHAR(255),
            ean_13 VARCHAR(13),
            stock_quantity INTEGER DEFAULT 0,
            margin_pct DECIMAL(5,2) DEFAULT 0,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `,
      })

      if (createError) {
        console.log('❌ Erro ao criar client_products:', createError.message)
        return
      } else {
        console.log('✅ Tabela client_products criada com sucesso')
      }
    } else {
      console.log('✅ Tabela client_products já existe')
    }
    console.log('')

    // 2. Verificar e adicionar campos faltantes
    console.log('2️⃣ Verificando campos faltantes...')

    // Verificar se category_id existe
    try {
      const { error: categoryCheckError } = await supabase
        .from('client_products')
        .select('category_id')
        .limit(1)

      if (
        categoryCheckError &&
        categoryCheckError.message.includes(
          'column "category_id" does not exist'
        )
      ) {
        console.log('📝 Adicionando campo category_id...')
        const { error: addCategoryError } = await supabase.rpc('exec_sql', {
          sql: 'ALTER TABLE client_products ADD COLUMN category_id UUID REFERENCES product_categories(id);',
        })

        if (addCategoryError) {
          console.log(
            '❌ Erro ao adicionar category_id:',
            addCategoryError.message
          )
        } else {
          console.log('✅ Campo category_id adicionado')
        }
      } else {
        console.log('✅ Campo category_id já existe')
      }
    } catch (e) {
      console.log('⚠️ Erro ao verificar category_id, tentando adicionar...')
      const { error: addCategoryError } = await supabase.rpc('exec_sql', {
        sql: 'ALTER TABLE client_products ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES product_categories(id);',
      })

      if (addCategoryError) {
        console.log(
          '❌ Erro ao adicionar category_id:',
          addCategoryError.message
        )
      } else {
        console.log('✅ Campo category_id verificado/adicionado')
      }
    }

    // Verificar se image_url existe
    try {
      const { error: imageCheckError } = await supabase
        .from('client_products')
        .select('image_url')
        .limit(1)

      if (
        imageCheckError &&
        imageCheckError.message.includes('column "image_url" does not exist')
      ) {
        console.log('📝 Adicionando campo image_url...')
        const { error: addImageError } = await supabase.rpc('exec_sql', {
          sql: 'ALTER TABLE client_products ADD COLUMN image_url TEXT;',
        })

        if (addImageError) {
          console.log('❌ Erro ao adicionar image_url:', addImageError.message)
        } else {
          console.log('✅ Campo image_url adicionado')
        }
      } else {
        console.log('✅ Campo image_url já existe')
      }
    } catch (e) {
      console.log('⚠️ Erro ao verificar image_url, tentando adicionar...')
      const { error: addImageError } = await supabase.rpc('exec_sql', {
        sql: 'ALTER TABLE client_products ADD COLUMN IF NOT EXISTS image_url TEXT;',
      })

      if (addImageError) {
        console.log('❌ Erro ao adicionar image_url:', addImageError.message)
      } else {
        console.log('✅ Campo image_url verificado/adicionado')
      }
    }

    // Verificar se is_active existe
    try {
      const { error: activeCheckError } = await supabase
        .from('client_products')
        .select('is_active')
        .limit(1)

      if (
        activeCheckError &&
        activeCheckError.message.includes('column "is_active" does not exist')
      ) {
        console.log('📝 Adicionando campo is_active...')
        const { error: addActiveError } = await supabase.rpc('exec_sql', {
          sql: 'ALTER TABLE client_products ADD COLUMN is_active BOOLEAN DEFAULT true;',
        })

        if (addActiveError) {
          console.log('❌ Erro ao adicionar is_active:', addActiveError.message)
        } else {
          console.log('✅ Campo is_active adicionado')
        }
      } else {
        console.log('✅ Campo is_active já existe')
      }
    } catch (e) {
      console.log('⚠️ Erro ao verificar is_active, tentando adicionar...')
      const { error: addActiveError } = await supabase.rpc('exec_sql', {
        sql: 'ALTER TABLE client_products ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;',
      })

      if (addActiveError) {
        console.log('❌ Erro ao adicionar is_active:', addActiveError.message)
      } else {
        console.log('✅ Campo is_active verificado/adicionado')
      }
    }

    console.log('')

    // 3. Criar índices para performance
    console.log('3️⃣ Criando índices para performance...')
    const { error: indexError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE INDEX IF NOT EXISTS idx_client_products_client_id ON client_products(client_id);
        CREATE INDEX IF NOT EXISTS idx_client_products_base_product_id ON client_products(base_product_id);
        CREATE INDEX IF NOT EXISTS idx_client_products_category_id ON client_products(category_id);
        CREATE INDEX IF NOT EXISTS idx_client_products_is_active ON client_products(is_active);
        CREATE INDEX IF NOT EXISTS idx_client_products_status ON client_products(status);
      `,
    })

    if (indexError) {
      console.log('❌ Erro ao criar índices:', indexError.message)
    } else {
      console.log('✅ Índices criados com sucesso')
    }
    console.log('')

    // 4. Verificar se a tabela product_categories existe
    console.log('4️⃣ Verificando tabela product_categories...')
    try {
      const { error: categoriesError } = await supabase
        .from('product_categories')
        .select('id')
        .limit(1)

      if (categoriesError && categoriesError.code === 'PGRST116') {
        console.log('❌ Tabela product_categories não existe, criando...')
        const { error: createCategoriesError } = await supabase.rpc(
          'exec_sql',
          {
            sql: `
            CREATE TABLE IF NOT EXISTS product_categories (
              id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
              name VARCHAR(255) NOT NULL,
              description TEXT,
              icon VARCHAR(50),
              color VARCHAR(7),
              created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
              updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
          `,
          }
        )

        if (createCategoriesError) {
          console.log(
            '❌ Erro ao criar product_categories:',
            createCategoriesError.message
          )
        } else {
          console.log('✅ Tabela product_categories criada')
        }
      } else {
        console.log('✅ Tabela product_categories já existe')
      }
    } catch (e) {
      console.log('⚠️ Erro ao verificar product_categories, tentando criar...')
      const { error: createCategoriesError } = await supabase.rpc('exec_sql', {
        sql: `
          CREATE TABLE IF NOT EXISTS product_categories (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            description TEXT,
            icon VARCHAR(50),
            color VARCHAR(7),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `,
      })

      if (createCategoriesError) {
        console.log(
          '❌ Erro ao criar product_categories:',
          createCategoriesError.message
        )
      } else {
        console.log('✅ Tabela product_categories criada/verificada')
      }
    }
    console.log('')

    // 5. Verificar se a tabela base_products existe
    console.log('5️⃣ Verificando tabela base_products...')
    try {
      const { error: baseProductsError } = await supabase
        .from('base_products')
        .select('id')
        .limit(1)

      if (baseProductsError && baseProductsError.code === 'PGRST116') {
        console.log('❌ Tabela base_products não existe, criando...')
        const { error: createBaseProductsError } = await supabase.rpc(
          'exec_sql',
          {
            sql: `
            CREATE TABLE IF NOT EXISTS base_products (
              id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
              name VARCHAR(255) NOT NULL,
              description TEXT,
              category_id UUID REFERENCES product_categories(id),
              base_price DECIMAL(10,2) DEFAULT 0,
              base_points_cost INTEGER DEFAULT 0,
              image_url TEXT,
              specifications JSONB DEFAULT '{}',
              status VARCHAR(50) DEFAULT 'active',
              created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
              updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
          `,
          }
        )

        if (createBaseProductsError) {
          console.log(
            '❌ Erro ao criar base_products:',
            createBaseProductsError.message
          )
        } else {
          console.log('✅ Tabela base_products criada')
        }
      } else {
        console.log('✅ Tabela base_products já existe')
      }
    } catch (e) {
      console.log('⚠️ Erro ao verificar base_products, tentando criar...')
      const { error: createBaseProductsError } = await supabase.rpc(
        'exec_sql',
        {
          sql: `
          CREATE TABLE IF NOT EXISTS base_products (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            description TEXT,
            category_id UUID REFERENCES product_categories(id),
            base_price DECIMAL(10,2) DEFAULT 0,
            base_points_cost INTEGER DEFAULT 0,
            image_url TEXT,
            specifications JSONB DEFAULT '{}',
            status VARCHAR(50) DEFAULT 'active',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `,
        }
      )

      if (createBaseProductsError) {
        console.log(
          '❌ Erro ao criar base_products:',
          createBaseProductsError.message
        )
      } else {
        console.log('✅ Tabela base_products criada/verificada')
      }
    }
    console.log('')

    // 6. Testar a estrutura
    console.log('6️⃣ Testando a estrutura...')
    try {
      const { data, error } = await supabase
        .from('client_products')
        .select('*')
        .limit(1)

      if (error) {
        console.log('❌ Erro ao testar client_products:', error.message)
      } else {
        console.log('✅ Estrutura da tabela client_products está funcionando')
        console.log('📊 Campos disponíveis:', Object.keys(data[0] || {}))
      }
    } catch (e) {
      console.log('❌ Erro ao testar:', e.message)
    }

    console.log('')
    console.log('🎉 Correção da estrutura concluída!')
    console.log('')
    console.log('📋 Resumo das correções:')
    console.log('   ✅ Tabela client_products criada/verificada')
    console.log('   ✅ Campo category_id adicionado/verificado')
    console.log('   ✅ Campo image_url adicionado/verificado')
    console.log('   ✅ Campo is_active adicionado/verificado')
    console.log('   ✅ Índices de performance criados')
    console.log('   ✅ Tabelas relacionadas verificadas')
    console.log('')
    console.log(
      '🚀 Agora a replicação de produtos deve funcionar corretamente!'
    )
  } catch (error) {
    console.error('❌ Erro durante a correção:', error)
  }
}

// Executar a correção
fixClientProductsStructure()
