import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { companyId, userId, points, reason } = body as { 
      companyId: string; 
      userId: string; 
      points: number; 
      reason?: string 
    };

    // TODO: validar HMAC/assinatura do provedor de gamificação
    // TODO: implementar rate limiting
    // TODO: validar se o usuário pertence à empresa

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!, 
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Validar se a empresa existe
    const { data: company } = await supabase
      .from('companies')
      .select('id')
      .eq('id', companyId)
      .single();

    if (!company) {
      return NextResponse.json({ error: 'Empresa não encontrada' }, { status: 404 });
    }

    // Validar se o usuário existe e pertence à empresa
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, company_id')
      .eq('id', userId)
      .eq('company_id', companyId)
      .single();

    if (!profile) {
      return NextResponse.json({ error: 'Usuário não encontrado ou não pertence à empresa' }, { status: 404 });
    }

    // Inserir transação de pontos
    const { error } = await supabase.from('point_transactions').insert({
      company_id: companyId,
      user_id: userId,
      type: 'earn',
      points,
      source: 'gamification_api',
      note: reason ?? null,
    });

    if (error) {
      console.error('Erro ao inserir transação de pontos:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Buscar saldo atualizado
    const { data: balance } = await supabase
      .from('user_point_balances')
      .select('balance')
      .eq('company_id', companyId)
      .eq('user_id', userId)
      .single();

    return NextResponse.json({ 
      ok: true, 
      balance: balance?.balance || 0,
      transaction: {
        points,
        type: 'earn',
        reason
      }
    });

  } catch (error) {
    console.error('Erro na API de pontos:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
