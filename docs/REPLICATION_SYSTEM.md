# 🔁 Sistema de Replicação de Produtos (v3)

> Resumo para o viewer. Para detalhes com fluxos e exemplos, acesse: /docs/REPLICATION_SYSTEM

## Visão Geral
Replica produtos de orçamentos aprovados para o catálogo da empresa/loja, aplicando regras (margem, arredondamento, cópia de imagens) e ativação controlada.

## Componentes
- `lib/replication.ts`: processamento de jobs (`product_replications`)
- `/api/replications/run`: executa lote e expõe estatísticas
- Admin Base: UI de replicação unitária e em lote (`/admin/produtos/catalogo-base`)

## Fluxo Típico
1) Aprovação de orçamento → cria base para company_products
2) Job de replicação (fila → processing → completed/failed)
3) Produtos replicados ficam prontos para ativação na loja

### Disparo manual (API)
```http
POST /api/replications/run
```
Resposta:
```json
{
  "success": true,
  "data": { "processed": 10, "successful": 9, "failed": 1, "stats": { "before": {}, "after": {} } }
}
```

## Métricas
- Estatísticas via `getReplicationStats()` e auditoria de eventos

## Referências de código
- `lib/replication.ts`
- `app/api/replications/run/route.ts`

---

Última atualização: v3.1.0
