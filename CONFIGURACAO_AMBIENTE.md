# Configuração do Ambiente - Yoobe v3

## Variáveis de Ambiente Necessárias

Adicione as seguintes variáveis ao seu arquivo `.env.local`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Stripe (Brasil)
STRIPE_SECRET_BR=sk_test_xxx
STRIPE_WEBHOOK_SECRET_BR=whsec_xxx

# Stripe (Estados Unidos)
STRIPE_SECRET_US=sk_test_yyy
STRIPE_WEBHOOK_SECRET_US=whsec_yyy

# Site URL
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## Configuração do Stripe

1. **Criar contas Stripe:**
   - Conta BR para pagamentos em Real
   - Conta US para pagamentos em Dólar

2. **Configurar Webhooks:**
   - URL: `https://seu-dominio.com/api/stripe/webhook`
   - Eventos: `checkout.session.completed`, `payment_intent.succeeded`, `checkout.session.expired`, `payment_intent.payment_failed`

## Testando o Sistema

1. **Pontos:**
   - Acesse `/store/cart` para ver o sistema de pontos
   - Use o slider para selecionar pontos a usar

2. **Checkout:**
   - Teste checkout 100% com pontos
   - Teste checkout misto (pontos + dinheiro)
   - Teste checkout 100% dinheiro

3. **Estoque:**
   - Verifique se o estoque está sendo reservado corretamente
   - Teste liberação de reservas em caso de falha
