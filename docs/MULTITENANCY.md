# 🏢 Multi-tenancy (v3)

> Resumo para o viewer. Para a versão interativa com diagramas, acesse: /docs/MULTITENANCY

## Visão Geral
Isolamento por empresa (tenant), com lojas e catálogos próprios, políticas RLS e replicação controlada.

## Tabelas
- companies(id, name, ...)
- stores(id, company_id, domain, ...)
- company_products/client_products (catálogos por empresa)
- users(company_id, ...)

## RLS
- Regra por `company_id` no Supabase para leitura/escrita
- Service role apenas nas rotas internas que exigem privilégios elevados

## Replicação
- lib/replication.ts e `/api/replications/run` processam jobs de replicação de produtos por empresa

---

Última atualização: v3.0.0
