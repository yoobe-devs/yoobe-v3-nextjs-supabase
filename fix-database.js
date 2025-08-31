const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'http://localhost:54321'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function fixDatabase() {
  try {
    console.log('🔧 Corrigindo banco de dados...')

    // 1. Criar tabela email_templates se não existir
    console.log('📧 Criando tabela email_templates...')
    const { error: emailTemplatesError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS email_templates (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          type VARCHAR(100) NOT NULL,
          subject VARCHAR(255) NOT NULL,
          content TEXT NOT NULL,
          variables JSONB DEFAULT '[]',
          status VARCHAR(50) DEFAULT 'active',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    })

    if (emailTemplatesError) {
      console.log('❌ Erro ao criar email_templates:', emailTemplatesError.message)
    } else {
      console.log('✅ Tabela email_templates criada/verificada')
    }

    // 2. Criar tabela product_categories se não existir
    console.log('📂 Criando tabela product_categories...')
    const { error: categoriesError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS product_categories (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          description TEXT,
          icon VARCHAR(100),
          color VARCHAR(7),
          status VARCHAR(50) DEFAULT 'active',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    })

    if (categoriesError) {
      console.log('❌ Erro ao criar product_categories:', categoriesError.message)
    } else {
      console.log('✅ Tabela product_categories criada/verificada')
    }

    // 3. Criar tabela base_products se não existir
    console.log('📦 Criando tabela base_products...')
    const { error: baseProductsError } = await supabase.rpc('exec_sql', {
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
      `
    })

    if (baseProductsError) {
      console.log('❌ Erro ao criar base_products:', baseProductsError.message)
    } else {
      console.log('✅ Tabela base_products criada/verificada')
    }

    // 4. Adicionar campo category_id à tabela company_products se não existir
    console.log('🔗 Adicionando category_id à company_products...')
    const { error: addCategoryError } = await supabase.rpc('exec_sql', {
      sql: `
        DO $$ 
        BEGIN 
          IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'company_products' AND column_name = 'category_id'
          ) THEN
            ALTER TABLE company_products ADD COLUMN category_id UUID REFERENCES product_categories(id);
          END IF;
        END $$;
      `
    })

    if (addCategoryError) {
      console.log('❌ Erro ao adicionar category_id:', addCategoryError.message)
    } else {
      console.log('✅ Campo category_id adicionado/verificado')
    }

    // 5. Adicionar campo base_product_id à tabela company_products se não existir
    console.log('🔗 Adicionando base_product_id à company_products...')
    const { error: addBaseProductError } = await supabase.rpc('exec_sql', {
      sql: `
        DO $$ 
        BEGIN 
          IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'company_products' AND column_name = 'base_product_id'
          ) THEN
            ALTER TABLE company_products ADD COLUMN base_product_id UUID REFERENCES base_products(id);
          END IF;
        END $$;
      `
    })

    if (addBaseProductError) {
      console.log('❌ Erro ao adicionar base_product_id:', addBaseProductError.message)
    } else {
      console.log('✅ Campo base_product_id adicionado/verificado')
    }

    // 6. Popular categorias padrão
    console.log('📝 Populando categorias padrão...')
    const defaultCategories = [
      { name: 'Vestuário', description: 'Roupas e acessórios corporativos', icon: 'shirt', color: '#3B82F6' },
      { name: 'Tecnologia', description: 'Produtos tecnológicos e gadgets', icon: 'smartphone', color: '#10B981' },
      { name: 'Escritório', description: 'Material de escritório e papelaria', icon: 'briefcase', color: '#F59E0B' },
      { name: 'Bem-estar', description: 'Produtos para saúde e bem-estar', icon: 'heart', color: '#EF4444' },
      { name: 'Casa e Decoração', description: 'Produtos para casa e decoração', icon: 'home', color: '#8B5CF6' },
      { name: 'Esportes', description: 'Produtos esportivos e fitness', icon: 'dumbbell', color: '#06B6D4' },
      { name: 'Alimentação', description: 'Produtos alimentícios e bebidas', icon: 'coffee', color: '#84CC16' },
      { name: 'Viagem', description: 'Produtos para viagem e turismo', icon: 'map-pin', color: '#F97316' }
    ]

    for (const category of defaultCategories) {
      const { error: insertError } = await supabase
        .from('product_categories')
        .upsert(category, { onConflict: 'name' })

      if (insertError) {
        console.log(`❌ Erro ao inserir categoria ${category.name}:`, insertError.message)
      } else {
        console.log(`✅ Categoria ${category.name} inserida/atualizada`)
      }
    }

    // 7. Popular produtos-base padrão
    console.log('📦 Populando produtos-base padrão...')
    
    // Buscar categorias para referência
    const { data: categories } = await supabase
      .from('product_categories')
      .select('id, name')

    const categoryMap = categories?.reduce((acc, cat) => {
      acc[cat.name] = cat.id
      return acc
    }, {}) || {}

    const defaultBaseProducts = [
      {
        name: 'Camiseta Corporativa',
        description: 'Camiseta 100% algodão com logo personalizável',
        category_id: categoryMap['Vestuário'],
        base_price: 25.00,
        base_points_cost: 250,
        specifications: {
          material: '100% Algodão',
          tamanhos: ['P', 'M', 'G', 'GG'],
          cores: ['Branco', 'Preto', 'Azul', 'Cinza']
        }
      },
      {
        name: 'Caneca Personalizada',
        description: 'Caneca de cerâmica com logo personalizável',
        category_id: categoryMap['Escritório'],
        base_price: 15.00,
        base_points_cost: 150,
        specifications: {
          material: 'Cerâmica',
          capacidade: '350ml',
          cores: ['Branco', 'Preto', 'Azul']
        }
      },
      {
        name: 'Power Bank',
        description: 'Carregador portátil de 10000mAh',
        category_id: categoryMap['Tecnologia'],
        base_price: 45.00,
        base_points_cost: 450,
        specifications: {
          capacidade: '10000mAh',
          entrada: 'USB-C, Micro USB',
          saída: 'USB-A, USB-C',
          cores: ['Preto', 'Branco', 'Azul']
        }
      },
      {
        name: 'Garrafa Térmica',
        description: 'Garrafa térmica de aço inox 500ml',
        category_id: categoryMap['Bem-estar'],
        base_price: 35.00,
        base_points_cost: 350,
        specifications: {
          material: 'Aço Inox',
          capacidade: '500ml',
          isolamento: '24h',
          cores: ['Prata', 'Preto', 'Azul']
        }
      },
      {
        name: 'Mochila Executiva',
        description: 'Mochila executiva com compartimento para notebook',
        category_id: categoryMap['Escritório'],
        base_price: 80.00,
        base_points_cost: 800,
        specifications: {
          material: 'Nylon',
          compartimentos: '15" laptop',
          cores: ['Preto', 'Cinza', 'Azul']
        }
      }
    ]

    for (const product of defaultBaseProducts) {
      const { error: insertError } = await supabase
        .from('base_products')
        .upsert(product, { onConflict: 'name' })

      if (insertError) {
        console.log(`❌ Erro ao inserir produto-base ${product.name}:`, insertError.message)
      } else {
        console.log(`✅ Produto-base ${product.name} inserido/atualizado`)
      }
    }

    // 8. Atualizar produtos existentes com categorias
    console.log('🔄 Atualizando produtos existentes...')
    const { data: existingProducts } = await supabase
      .from('company_products')
      .select('id, name')

    if (existingProducts && existingProducts.length > 0) {
      for (const product of existingProducts) {
        // Atribuir categoria baseada no nome do produto
        let categoryId = categoryMap['Escritório'] // padrão
        
        if (product.name.toLowerCase().includes('camiseta') || product.name.toLowerCase().includes('roupa')) {
          categoryId = categoryMap['Vestuário']
        } else if (product.name.toLowerCase().includes('caneca') || product.name.toLowerCase().includes('copo')) {
          categoryId = categoryMap['Escritório']
        } else if (product.name.toLowerCase().includes('power') || product.name.toLowerCase().includes('carregador')) {
          categoryId = categoryMap['Tecnologia']
        }

        const { error: updateError } = await supabase
          .from('company_products')
          .update({ category_id: categoryId })
          .eq('id', product.id)

        if (updateError) {
          console.log(`❌ Erro ao atualizar produto ${product.name}:`, updateError.message)
        } else {
          console.log(`✅ Produto ${product.name} atualizado com categoria`)
        }
      }
    }

    console.log('🎉 Banco de dados corrigido com sucesso!')

  } catch (error) {
    console.error('❌ Erro geral:', error)
  }
}

fixDatabase()
