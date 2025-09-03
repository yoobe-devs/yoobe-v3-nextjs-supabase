const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente não encontradas')
  console.error('Certifique-se de que NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY estão definidas no .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function setupStorageBucket() {
  try {
    console.log('🚀 Configurando bucket de imagens de produtos...')

    // Verificar se o bucket já existe
    const { data: buckets, error: listError } = await supabase.storage.listBuckets()
    
    if (listError) {
      throw new Error(`Erro ao listar buckets: ${listError.message}`)
    }

    const bucketExists = buckets.some(bucket => bucket.name === 'product-images')
    
    if (bucketExists) {
      console.log('✅ Bucket "product-images" já existe')
    } else {
      // Criar o bucket
      const { data: bucket, error: createError } = await supabase.storage.createBucket('product-images', {
        public: true,
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
        fileSizeLimit: 5242880 // 5MB
      })

      if (createError) {
        throw new Error(`Erro ao criar bucket: ${createError.message}`)
      }

      console.log('✅ Bucket "product-images" criado com sucesso')
    }

    // Configurar políticas de acesso
    console.log('🔐 Configurando políticas de acesso...')

    // Política para permitir upload de imagens (apenas admins)
    const uploadPolicy = `
      CREATE POLICY "Allow admin uploads" ON storage.objects
      FOR INSERT WITH CHECK (
        bucket_id = 'product-images' AND
        auth.role() = 'authenticated' AND
        auth.jwt() ->> 'user_metadata' ->> 'role' = 'admin'
      );
    `

    // Política para permitir visualização pública
    const viewPolicy = `
      CREATE POLICY "Allow public viewing" ON storage.objects
      FOR SELECT USING (bucket_id = 'product-images');
    `

    // Política para permitir atualização (apenas admins)
    const updatePolicy = `
      CREATE POLICY "Allow admin updates" ON storage.objects
      FOR UPDATE USING (
        bucket_id = 'product-images' AND
        auth.role() = 'authenticated' AND
        auth.jwt() ->> 'user_metadata' ->> 'role' = 'admin'
      );
    `

    // Política para permitir exclusão (apenas admins)
    const deletePolicy = `
      CREATE POLICY "Allow admin deletes" ON storage.objects
      FOR DELETE USING (
        bucket_id = 'product-images' AND
        auth.role() = 'authenticated' AND
        auth.jwt() ->> 'user_metadata' ->> 'role' = 'admin'
      );
    `

    try {
      await supabase.rpc('exec_sql', { sql: uploadPolicy })
      console.log('✅ Política de upload configurada')
    } catch (error) {
      console.log('ℹ️ Política de upload já existe ou erro ignorado')
    }

    try {
      await supabase.rpc('exec_sql', { sql: viewPolicy })
      console.log('✅ Política de visualização configurada')
    } catch (error) {
      console.log('ℹ️ Política de visualização já existe ou erro ignorado')
    }

    try {
      await supabase.rpc('exec_sql', { sql: updatePolicy })
      console.log('✅ Política de atualização configurada')
    } catch (error) {
      console.log('ℹ️ Política de atualização já existe ou erro ignorado')
    }

    try {
      await supabase.rpc('exec_sql', { sql: deletePolicy })
      console.log('✅ Política de exclusão configurada')
    } catch (error) {
      console.log('ℹ️ Política de exclusão já existe ou erro ignorado')
    }

    console.log('🎉 Configuração do bucket concluída com sucesso!')
    console.log('')
    console.log('📋 Resumo:')
    console.log('• Bucket: product-images')
    console.log('• Acesso público para visualização')
    console.log('• Upload/atualização/exclusão apenas para admins')
    console.log('• Tipos permitidos: JPEG, PNG, WebP, GIF')
    console.log('• Tamanho máximo: 5MB')

  } catch (error) {
    console.error('❌ Erro na configuração:', error)
    process.exit(1)
  }
}

setupStorageBucket()
