# 🧾 Sistema de Orçamentos (v3)

> Resumo para o viewer. Para a documentação interativa com fluxos detalhados, acesse: /docs/QUOTES_SYSTEM

## Visão Geral
Permite criação, revisão e aprovação de orçamentos, com conversão em pedido de compra e replicação/ativação de produtos na loja do cliente.

## Tabelas (exemplo)
- orcamentos(id, client_id, gestor_id, title, status, total_amount, ...)
- orcamento_items(id, orcamento_id, client_product_id, quantity, unit_price, ...)
- orcamento_attachments(...)
- budgets/budget_items (variante admin global)

## APIs e Serviços
- Gestor: `GET/POST /api/clients/[clientId]/orcamentos` (listar/criar)
- Admin: `GET /api/admin/orcamentos` (listar)
- Aprovação: `POST /api/admin/orcamentos/[id]/approve` (approve/reject + notificação)
- Conversão: util `convertToPurchaseOrder` em `lib/queries/orcamentos.ts`

### Exemplo: criar orçamento (Gestor)
```json
POST /api/clients/CLIENT_ID/orcamentos
{
  "title": "Kits Onboarding Q4",
  "description": "Kits de boas-vindas",
  "gestor_notes": "Prioridade média",
  "items": [
    { "client_product_id": "uuid1", "quantity": 100, "unit_price": 49.9 },
    { "client_product_id": "uuid2", "quantity": 100, "unit_price": 19.9 }
  ]
}
```

### Exemplo: aprovação (Admin)
```json
POST /api/admin/orcamentos/ORC_ID/approve
{ "action": "approve", "admin_notes": "OK para replicação" }
```

## Fluxo
1) Gestor cria orçamento → 2) Admin revisa e aprova/rejeita → 3) Cria produtos da empresa pendentes de ativação → 4) Replicação/ativação na loja do cliente.

## Notificações
Ao aprovar/rejeitar, cria entradas em `notifications` endereçadas ao gestor.

## Referências de código
- `app/api/clients/[clientId]/orcamentos/route.ts`
- `app/api/admin/orcamentos/route.ts`
- `app/api/admin/orcamentos/[id]/approve/route.ts`
- `lib/queries/orcamentos.ts`

---

Última atualização: v3.0.0
