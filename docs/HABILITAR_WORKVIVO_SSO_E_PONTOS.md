# Guia Rápido — Habilitar Workvivo (SSO e Pontos)

Este guia explica como habilitar o SSO via Workvivo e a integração de Pontos na aplicação. Por padrão, ambos ficam DESLIGADOS e podem ser ativados via flags de ambiente.

## Visão Geral

- SSO (login) via OIDC Workvivo
- Créditos/Estornos de pontos Workvivo atrelados a pagamentos (Yoobe checkout/Stripe)
- Webhook para atualizações de saldo (HMAC)
- Cache local de saldo + histórico de eventos

## Pré‑requisitos

- Supabase local/ambiente configurado e acessível
- Variáveis de ambiente do projeto (.env/.env.local)
- (SSO) Credenciais OIDC da Workvivo (Issuer, Client ID/Secret, Redirect URI)
- (Pontos) Credenciais OAuth2 client‑credentials da Workvivo (Token URL, Client ID/Secret, Scopes)

## Feature Flags (padrão = OFF)

- `WORKVIVO_SSO_ENABLED=0` (server)
- `NEXT_PUBLIC_WORKVIVO_SSO_ENABLED=0` (client UI)
- `WORKVIVO_ENABLED=0` (crédito/estorno automático)

Altere para `1` quando quiser habilitar.

## Variáveis de Ambiente Principais

SSO (OIDC):
- `WORKVIVO_OIDC_ISSUER`
- `WORKVIVO_OIDC_CLIENT_ID`
- `WORKVIVO_OIDC_CLIENT_SECRET`
- `WORKVIVO_OIDC_REDIRECT_URI`
- `WORKVIVO_SSO_ENABLED` (1 para ligar)
- `NEXT_PUBLIC_WORKVIVO_SSO_ENABLED` (1 para mostrar botão na UI)

Pontos (APIs):
- `WORKVIVO_API_BASE` (ex.: `https://api.workvivo.com`)
- `WORKVIVO_TOKEN_URL` (ex.: `https://auth.workvivo.com/oauth2/token`)
- `WORKVIVO_CLIENT_ID` / `WORKVIVO_CLIENT_SECRET`
- `WORKVIVO_SCOPES` (ex.: `points.read points.write users.read`)
- `WORKVIVO_WEBHOOK_SECRET` (HMAC do webhook)
- `INTERNAL_API_SECRET` (proteger endpoints internos)
- `WORKVIVO_ENABLED` (1 para ligar créditos/estornos)
- `WORKVIVO_MOCK` (opcional: `1` para simular respostas em dev)

Outras:
- `NEXT_PUBLIC_SITE_URL` (ex.: `http://localhost:3001` ou URL pública)
- `DEFAULT_COMPANY_ID` (opcional; empresa padrão ao criar usuário via SSO)

Veja também `CONFIGURACAO_AMBIENTE.md` para a lista completa.

## Habilitar SSO Workvivo (quando desejar)

1) Instalar dependência (se ainda não foi instalada):
   - `npm install`
   - `npm i openid-client`

2) Configurar envs OIDC:
   - `WORKVIVO_OIDC_ISSUER=.../.well-known/openid-configuration`
   - `WORKVIVO_OIDC_CLIENT_ID=...`
   - `WORKVIVO_OIDC_CLIENT_SECRET=...`
   - `WORKVIVO_OIDC_REDIRECT_URI=https://SEU_SITE/api/auth/workvivo/callback`
   - `WORKVIVO_SSO_ENABLED=1`
   - `NEXT_PUBLIC_WORKVIVO_SSO_ENABLED=1`

3) Registrar o Redirect URI no app Workvivo.

4) Testar:
   - Acesse `/auth/login` e use “Entrar com Workvivo”.
   - Em caso de sucesso, será gerada sessão via magic link e redirecionado para `/choose-environment`.

## Habilitar Pontos Workvivo (quando desejar)

1) Aplicar migrations Workvivo:
   - Criar função RPC (se ainda não existir): execute o SQL em `migrations/2025-09-04_create_exec_sql_function.sql` no Supabase Studio.
   - Rodar script: `npm run db:workvivo`
   - Alternativa: executar manualmente os arquivos SQL em `migrations/2025-09-04_add_workvivo_point_ops.sql` e `migrations/2025-09-04_workvivo_balance_cache.sql`.

2) Configurar envs de API Workvivo:
   - `WORKVIVO_API_BASE`, `WORKVIVO_TOKEN_URL`, `WORKVIVO_CLIENT_ID`, `WORKVIVO_CLIENT_SECRET`, `WORKVIVO_SCOPES`
   - `WORKVIVO_WEBHOOK_SECRET` (para assinar o webhook)
   - `INTERNAL_API_SECRET` (para proteger endpoints internos)
   - Defina `WORKVIVO_ENABLED=1` quando quiser ativar crédito/estorno automático

3) Webhook (opcional, recomendado):
   - Endpoint: `POST /api/integrations/workvivo/webhook`
   - Header: `x-workvivo-signature` com `sha256=HEX` (HMAC do corpo usando `WORKVIVO_WEBHOOK_SECRET`)
   - Atualiza `workvivo_balance_cache` e salva `workvivo_events`

4) Sync por polling (opcional):
   - `POST /api/integrations/workvivo/sync-balance` com header `x-internal-secret`
   - Sugestão: agendar um CRON no provedor para chamar periodicamente

5) Como funciona o crédito/estorno automático (quando ligado):
   - Checkout Yoobe pago: `app/api/checkout/pay/route.ts` calcula pontos e chama `award-points`
   - Stripe webhook:
     - `payment_intent.succeeded` → award por `orders.total_amount`
     - `charge.refunded` → reverse por valor reembolsado
   - Idempotência local: tabela `workvivo_point_ops`

## Endpoints Internos (server-to-server)

- `GET  /api/integrations/workvivo/balance?identifier=...&type=email|sub|employeeId`
- `POST /api/integrations/workvivo/award-points` (header: `x-internal-secret`)
- `POST /api/integrations/workvivo/reverse-points` (header: `x-internal-secret`)
- `POST /api/integrations/workvivo/webhook` (header: `x-workvivo-signature`)
- `POST /api/integrations/workvivo/sync-balance` (header: `x-internal-secret`)

## Testes Rápidos (dev)

- SSO: habilitar flags e tentar login. Ver logs no server.
- Award (mock): `WORKVIVO_MOCK=1`, pagar um checkout, verificar `workvivo_point_ops`.
- Webhook: enviar POST com payload e assinatura HMAC, checar `workvivo_events` e `workvivo_balance_cache`.

## Resolução de Problemas

- `openid-client` faltando: instale com `npm i openid-client`.
- Migrations não aplicam via script: crie `public.exec_sql` (arquivo `2025-09-04_create_exec_sql_function.sql`) e rode `npm run db:workvivo`; ou aplique os SQLs manualmente.
- Assinatura do webhook inválida: confira `WORKVIVO_WEBHOOK_SECRET` e o formato `sha256=HEX` computado sobre o corpo cru da requisição.

