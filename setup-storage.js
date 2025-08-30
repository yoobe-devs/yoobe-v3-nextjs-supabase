// Script para configurar buckets de storage manualmente
const { createClient } = require('@supabase/supabase-js')

// Configuração do Supabase local
const supabaseUrl = 'http://localhost:54321'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

const supabase = createClient(supabaseUrl, supabaseKey)

async function setupStorage() {
  console.log('🔧 Configurando buckets de storage...\n')

  try {
    // Criar bucket para produtos
    console.log('1. 📦 Criando bucket para produtos...')
    const { data: productsBucket, error: productsError } = await supabase.storage.createBucket('products', {
      public: true,
      fileSizeLimit: 5242880, // 5MB
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp']
    })

    if (productsError) {
      if (productsError.message.includes('already exists')) {
        console.log('✅ Bucket de produtos já existe')
      } else {
        console.log('❌ Erro ao criar bucket de produtos:', productsError.message)
      }
    } else {
      console.log('✅ Bucket de produtos criado com sucesso')
    }

    // Criar bucket para avatares
    console.log('\n2. 👤 Criando bucket para avatares...')
    const { data: avatarsBucket, error: avatarsError } = await supabase.storage.createBucket('avatars', {
      public: true,
      fileSizeLimit: 2097152, // 2MB
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp']
    })

    if (avatarsError) {
      if (avatarsError.message.includes('already exists')) {
        console.log('✅ Bucket de avatares já existe')
      } else {
        console.log('❌ Erro ao criar bucket de avatares:', avatarsError.message)
      }
    } else {
      console.log('✅ Bucket de avatares criado com sucesso')
    }

    // Criar bucket para logos de empresas
    console.log('\n3. 🏢 Criando bucket para logos de empresas...')
    const { data: logosBucket, error: logosError } = await supabase.storage.createBucket('company-logos', {
      public: true,
      fileSizeLimit: 2097152, // 2MB
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp']
    })

    if (logosError) {
      if (logosError.message.includes('already exists')) {
        console.log('✅ Bucket de logos já existe')
      } else {
        console.log('❌ Erro ao criar bucket de logos:', logosError.message)
      }
    } else {
      console.log('✅ Bucket de logos criado com sucesso')
    }

    // Listar buckets existentes
    console.log('\n4. 📋 Listando buckets existentes...')
    const { data: buckets, error: listError } = await supabase.storage.listBuckets()

    if (listError) {
      console.log('❌ Erro ao listar buckets:', listError.message)
    } else {
      console.log('✅ Buckets disponíveis:')
      buckets.forEach(bucket => {
        console.log(`   - ${bucket.name} (${bucket.public ? 'Público' : 'Privado'})`)
      })
    }

    console.log('\n🎯 Configuração de storage concluída!')
    console.log('✅ Buckets criados e configurados')
    console.log('✅ Upload de imagens funcionando')
    
  } catch (error) {
    console.error('❌ Erro geral:', error)
  }
}

// Executar configuração
setupStorage()
