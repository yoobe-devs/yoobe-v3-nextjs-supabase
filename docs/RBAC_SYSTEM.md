# 🔐 Sistema RBAC (v3)

> Documentação resumo para o viewer. Para a versão interativa com exemplos e UI, acesse: /docs/RBAC_SYSTEM

## Visão Geral
Controle de acesso baseado em papéis (roles) e permissões para isolar recursos por empresa (multi-tenant) e por tipo de usuário.

## Conceitos
- Usuário: identidade autenticada (Supabase Auth).
- Role: conjunto de permissões (ex.: admin, gestor, colaborador).
- Permissão: ação específica (ex.: manage_users, view_reports).
- Escopo: por empresa (tenant) e, quando aplicável, por loja.

## Tabelas (exemplo)
- roles(id, name, description)
- permissions(id, name, description)
- role_permissions(role_id, permission_id)
- user_roles(user_id, company_id, role_id)

### Exemplo: checagem de permissão (pseudocódigo)
```ts
const can = await requireRole(userId, companyId, 'admin_gestor')
if (!can) return 403
```

## APIs Relacionadas
- GET/POST roles e permissions (rotas administrativas)
- RBAC middleware/helpers: validação de role por company_id

## RLS (Supabase) — Diretriz
- Policies por tabela garantindo `company_id = auth.jwt().company_id` quando aplicável.
- Tabelas de sistema com acesso restrito a service role nas rotas internas.

## Fluxos
- Convite → aceitar → vincular user a company com role default
- Elevação de privilégios via admin global

## Referências de código
- `app/api/gestor/*` (ex.: uso de requireRole)
- `lib/rbac.ts` (se disponível)

---

Última atualização: v3.0.0
