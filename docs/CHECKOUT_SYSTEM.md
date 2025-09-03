# 🛒 Sistema de Checkout (v3)

> Resumo para o viewer. Para conteúdo completo e exemplos, acesse: /docs/CHECKOUT_SYSTEM

## Visão Geral
Fluxo de finalização de compra com validação de estoque, meios de pagamento e integração com carteira/pontos quando aplicável.

## APIs
- Pontos: `app/api/checkout/points/route.ts` (valida estoque, debita pontos, atualiza ledger)
- Stripe/PayPal: webhooks em `app/api/stripe/webhook/route.ts` (notificações de pagamento)

## Estoque
- Verificação e debito: validação de `stock_quantity` antes de concluir

### Exemplo: checkout com pontos
```json
POST /api/checkout/points
{
  "items": [{ "product_id": "uuid", "quantity": 1 }],
  "company_id": "uuid"
}
```
Resposta (sucesso):
```json
{ "success": true, "order_id": "uuid" }
```

## Notificações
- Confirmação de pagamento → cria `notifications` para o usuário

## Referências de código
- `app/api/checkout/points/route.ts`
- `app/api/stripe/webhook/route.ts`

---

Última atualização: v3.1.0
