const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'http://127.0.0.1:54321';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createTestNotifications() {
  console.log('🔔 Criando notificações de teste...');

  try {
    // Buscar gestor
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .eq('role', 'manager')
      .limit(1);

    if (usersError || !users.length) {
      console.error('❌ Erro ao buscar gestor:', usersError);
      return;
    }

    const gestor = users[0];
    const companyId = gestor.company_id;

    // Criar notificações de teste
    const notifications = [
      {
        user_id: gestor.id,
        company_id: companyId,
        type: 'orcamento',
        title: 'Orçamento Aprovado',
        message: 'Seu orçamento "Produtos para Equipe" foi aprovado! Os produtos estão disponíveis para ativação.',
        data: {
          budget_id: '550e8400-e29b-41d4-a716-446655440002',
          action: 'approved'
        },
        is_read: false
      },
      {
        user_id: gestor.id,
        company_id: companyId,
        type: 'pedido',
        title: 'Novo Pedido Recebido',
        message: 'Novo pedido #12345 recebido - Camiseta Corporativa (2x)',
        data: {
          order_id: '12345',
          items: ['Camiseta Corporativa']
        },
        is_read: false
      },
      {
        user_id: gestor.id,
        company_id: companyId,
        type: 'estoque',
        title: 'Produto Disponível',
        message: 'O produto "Caneca Personalizada" está agora disponível para ativação na loja.',
        data: {
          product_id: 'test-product-id',
          base_product_name: 'Caneca Personalizada',
          status: 'disponivel'
        },
        is_read: true
      },
      {
        user_id: gestor.id,
        company_id: companyId,
        type: 'resgate',
        title: 'Resgate de Pontos',
        message: 'Funcionário João Silva resgatou 500 pontos por uma caneca personalizada.',
        data: {
          employee_name: 'João Silva',
          points_redeemed: 500,
          product_name: 'Caneca Personalizada'
        },
        is_read: false
      }
    ];

    // Inserir notificações
    const { data, error } = await supabase
      .from('notifications')
      .insert(notifications)
      .select();

    if (error) {
      console.error('❌ Erro ao criar notificações:', error);
      return;
    }

    console.log('✅ Notificações de teste criadas com sucesso!');
    console.log(`📊 Total de notificações criadas: ${data.length}`);

  } catch (error) {
    console.error('❌ Erro ao criar notificações:', error);
  }
}

createTestNotifications();
