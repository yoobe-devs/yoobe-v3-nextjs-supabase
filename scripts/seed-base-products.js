#!/usr/bin/env node

// Seed rápido para base_products e product_categories no Supabase (dev)

const { createClient } = require('@supabase/supabase-js')

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321'
const key = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!key) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY não definido. Configure o .env.local')
  process.exit(1)
}
const supabase = createClient(url, key)

async function ensureCategory(name, color = '#888888', icon = 'tag') {
  const { data: existing } = await supabase.from('product_categories').select('id').ilike('name', name).limit(1)
  if (existing && existing.length) return existing[0].id
  const { data, error } = await supabase.from('product_categories').insert({ name, color, icon }).select('id').single()
  if (error) throw error
  return data.id
}

async function run() {
  try {
    console.log('🌱 Iniciando seed de categorias e base_products...')

    const catVestuario = await ensureCategory('Vestuário', '#16a34a', 'shirt')
    const catAcessorios = await ensureCategory('Acessórios', '#2563eb', 'gift')
    const catTecnologia = await ensureCategory('Tecnologia', '#9333ea', 'cpu')
    const catPapelaria = await ensureCategory('Papelaria', '#f59e0b', 'book')

    const products = [
      { name: 'Camiseta Yoobe Clássica', description: 'Camiseta 100% algodão com estampa Yoobe.', base_price: 79.9, base_points_cost: 400, image_url: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?q=80&w=640&fit=crop', category_id: catVestuario },
      { name: 'Moletom Yoobe', description: 'Moletom felpado unissex com capuz.', base_price: 199.0, base_points_cost: 1000, image_url: 'https://images.unsplash.com/photo-1548883354-7622d03aca27?q=80&w=640&fit=crop', category_id: catVestuario },
      { name: 'Boné Bordado', description: 'Boné com logo bordado e ajuste.', base_price: 59.9, base_points_cost: 300, image_url: 'https://images.unsplash.com/photo-1588856122867-3835b6b8b83c?q=80&w=640&fit=crop', category_id: catAcessorios },
      { name: 'Caneca Personalizada', description: 'Caneca cerâmica 300ml.', base_price: 34.9, base_points_cost: 170, image_url: 'https://images.unsplash.com/photo-1523475496153-3d6cc0b2f2f4?q=80&w=640&fit=crop', category_id: catAcessorios },
      { name: 'Garrafa Térmica', description: 'Inox, 500ml, mantém a temperatura por horas.', base_price: 89.9, base_points_cost: 450, image_url: 'https://images.unsplash.com/photo-1548865163-4856eaf24fb5?q=80&w=640&fit=crop', category_id: catAcessorios },
      { name: 'Mochila Corporativa', description: 'Compartimento para notebook 15”.', base_price: 259.0, base_points_cost: 1300, image_url: 'https://images.unsplash.com/photo-1520975922215-230f324b7d5f?q=80&w=640&fit=crop', category_id: catAcessorios },
      { name: 'Mouse Pad XL', description: 'Superfície speed, base emborrachada.', base_price: 49.9, base_points_cost: 250, image_url: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?q=80&w=640&fit=crop', category_id: catTecnologia },
      { name: 'Teclado Mecânico', description: 'Switches azuis, ABNT2, RGB.', base_price: 349.0, base_points_cost: 1750, image_url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=640&fit=crop', category_id: catTecnologia },
      { name: 'Caderno A5', description: '96 folhas, capa dura.', base_price: 24.9, base_points_cost: 120, image_url: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0ea?q=80&w=640&fit=crop', category_id: catPapelaria },
      { name: 'Kit Papelaria', description: 'Canetas, post-its e marcadores.', base_price: 59.0, base_points_cost: 300, image_url: 'https://images.unsplash.com/photo-1500051638674-ff996a0ec29e?q=80&w=640&fit=crop', category_id: catPapelaria },
      { name: 'Smartwatch Básico', description: 'Monitoramento de passos e notificações.', base_price: 399.0, base_points_cost: 2000, image_url: 'https://images.unsplash.com/photo-1511735111819-9a3f7709049c?q=80&w=640&fit=crop', category_id: catTecnologia },
      { name: 'Fone Bluetooth', description: 'Cancelamento de ruído passivo.', base_price: 129.0, base_points_cost: 650, image_url: 'https://images.unsplash.com/photo-1518442663936-6f6f7f1e5569?q=80&w=640&fit=crop', category_id: catTecnologia }
    ]

    // Inserir apenas se estiver vazio
    const { count } = await supabase.from('base_products').select('*', { count: 'exact', head: true })
    if ((count || 0) > 0) {
      console.log('ℹ️  base_products já possui registros. Nada a fazer.')
      return
    }

    const { error } = await supabase.from('base_products').insert(
      products.map(p => ({ ...p, status: 'active' }))
    )
    if (error) throw error
    console.log('✅ Seed concluído! Foram inseridos', products.length, 'produtos.')
  } catch (e) {
    console.error('❌ Erro no seed:', e)
    process.exit(1)
  }
}

run()

