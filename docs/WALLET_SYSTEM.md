# 💳 Sistema de Carteira e Pontos (v3)

> Resumo para o viewer. Para detalhes com UI e exemplos, acesse: /docs/WALLET_SYSTEM

## Visão Geral
Gerencia saldos de pontos/créditos por usuário/empresa, com lançamentos de débito/crédito, conversões e resgates.

## Tabelas (exemplo)
- wallets/wallet_transactions (ou points_balance em users + ledger)
- redemptions/resgates

## APIs
- Rotas em `app/api/wallet` e `app/api/points` (quando aplicável)
- Resgates: `app/api/loja/resgates/route.ts`

## Integrações
- Checkout por pontos: `app/api/checkout/points`
- Notificações em eventos de crédito/débito relevantes

---

Última atualização: v3.1.0
