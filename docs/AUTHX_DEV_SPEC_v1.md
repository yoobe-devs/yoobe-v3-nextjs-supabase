# AuthX v1 — Login Unificado, Acesso por Tags e Aprovação Granular

Este documento especifica o módulo AuthX (isolado, com feature flag) para autenticação/autorizações avançadas sem quebrar o core atual.

## 0) Premissas & Rollout

- Stack: Next.js 14 (App Router), Supabase Auth + Postgres, Tailwind + shadcn/ui.
- Flag global/tenant: `AUTHX_ENABLED=true|false`. Com flag OFF, nada do v2 aparece nem interfere.
- Segurança: cookies httpOnly + Secure, rotação de JWT, RLS no Postgres, logs de auditoria.
- Versões/rotas isoladas: `/v2/authx/*`, `/v2/policies/*`, `/v2/approvals/*`.

## 1) Autenticação (Login Unificado, Sessões & Logout)

- Login: reaproveitar provedores existentes (OTP/Magic Link, OAuth corporativo), tabela `users` atual.
- Sessões: access token curto (15m), refresh rotativo (7d), registrar em `authx_sessions` (auditoria), permitir 1–N sessões por usuário (parâmetro).
- Logout automático: idle timeout (env `AUTHX_IDLE_MINUTES`, p.ex. 30) + absolute timeout (env `AUTHX_ABSOLUTE_HOURS`, p.ex. 12). Front com idle-tracker; back invalida refresh e sessão.
- Middleware `withAuthX(guard)`: valida tenant, papel, tags do usuário antes de executar handlers e Server Actions.

## 2) Migrations (Isoladas)

```
-- Departamentos
create table if not exists departments (
  id bigserial primary key,
  tenant_id bigint not null,
  name text not null,
  unique (tenant_id, name)
);

create table if not exists user_departments (
  user_id bigint not null,
  department_id bigint not null,
  primary key (user_id, department_id)
);

-- Tags / vínculos
create table if not exists tags (
  id bigserial primary key,
  tenant_id bigint not null,
  key text not null,
  value text not null,
  unique(tenant_id, key, value)
);

create table if not exists user_tags (
  user_id bigint not null,
  tag_id bigint not null references tags(id) on delete cascade,
  primary key (user_id, tag_id)
);

create table if not exists product_tags (
  store_product_id bigint not null,
  tag_id bigint not null references tags(id) on delete cascade,
  primary key (store_product_id, tag_id)
);

-- Janelas de acesso
create table if not exists access_time_windows (
  id bigserial primary key,
  tenant_id bigint not null,
  name text not null,
  dow int[] not null default '{1,2,3,4,5}',
  start_time time not null default '09:00',
  end_time   time not null default '18:00',
  tz text not null default 'America/Sao_Paulo'
);

-- Políticas de acesso ABAC (tags + dept + janelas)
create table if not exists access_policies (
  id bigserial primary key,
  tenant_id bigint not null,
  name text not null,
  rule jsonb not null,
  is_active bool not null default true
);

-- Limites de resgate
create table if not exists redemption_limits (
  id bigserial primary key,
  tenant_id bigint not null,
  scope text not null check (scope in ('user','department','category')),
  ref_id bigint,
  period text not null check (period in ('daily','weekly','monthly','quarterly','yearly')),
  max_qty int,
  max_points numeric(12,2),
  max_amount numeric(12,2),
  is_active bool not null default true
);

-- Workflow de aprovação
create table if not exists approval_policies (
  id bigserial primary key,
  tenant_id bigint not null,
  name text not null,
  spec jsonb not null
);

create table if not exists approvals (
  id bigserial primary key,
  tenant_id bigint not null,
  request_type text not null check (request_type in ('rescue','order')),
  request_id bigint not null,
  status text not null check (status in ('pending','approved','rejected','escalated')),
  policy_id bigint references approval_policies(id),
  current_step int not null default 1,
  meta jsonb default '{}',
  requested_by bigint not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists approval_steps (
  id bigserial primary key,
  approval_id bigint not null references approvals(id) on delete cascade,
  step_no int not null,
  approver_user_id bigint,
  approver_role text,
  status text not null check (status in ('pending','approved','rejected')),
  comment text,
  acted_at timestamptz
);

-- Auditoria de sessão
create table if not exists authx_sessions (
  id bigserial primary key,
  user_id bigint not null,
  tenant_id bigint not null,
  created_at timestamptz default now(),
  last_seen_at timestamptz default now(),
  revoked_at timestamptz
);
```

## 3) JSON Schemas (Políticas)

### 3.1 Access Policy `rule` (ABAC)

```jsonc
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "properties": {
    "allowed_departments": { "type": "array", "items": { "type": "string" } },
    "required_user_tags": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "key": { "type": "string" },
          "values": { "type": "array", "items": { "type": "string" } }
        },
        "required": ["key", "values"]
      }
    },
    "product_tag_logic": { "type": "string", "enum": ["ANY", "ALL"] },
    "time_window_ids": { "type": "array", "items": { "type": "integer" } },
    "default_allow_unless_tagged": { "type": "boolean" }
  },
  "additionalProperties": false
}
```

### 3.2 Approval Policy `spec`

```jsonc
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "properties": {
    "thresholds": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "category_id": { "type": ["integer", "string"] },
          "max_points": { "type": ["integer", "number"] },
          "max_amount": { "type": ["integer", "number"] },
          "requires_approval_above": { "type": "boolean" }
        },
        "additionalProperties": false
      }
    },
    "steps": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "step": { "type": "integer" },
          "approver": {
            "type": "object",
            "properties": {
              "type": { "type": "string", "enum": ["manager_of_department", "role", "user"] },
              "value": { "type": ["string", "null"] },
              "id": { "type": ["integer", "null"] }
            },
            "required": ["type"],
            "additionalProperties": false
          }
        },
        "required": ["step", "approver"],
        "additionalProperties": false
      }
    },
    "sla_hours": { "type": "integer" },
    "escalation": {
      "type": "object",
      "properties": {
        "after_hours": { "type": "integer" },
        "to_role": { "type": "string" }
      },
      "additionalProperties": false
    }
  },
  "required": ["steps"],
  "additionalProperties": false
}
```

## 4) RLS (Exemplo Baseado em Tags)

Exemplo (conceitual) para filtrar `store_products` por `user_tags` do chamador. Requer popular o JWT com claims `tenant_id` e `tag_ids` (array de IDs de tags do usuário) ou fazer join com `user_tags` pela `auth.uid()`.

```sql
alter table store_products enable row level security;

create policy sp_view_by_tags on store_products
for select using (
  exists (
    select 1 from product_tags pt
    where pt.store_product_id = store_products.id
      and (
        pt.tag_id = any (string_to_array(current_setting('request.jwt.claims', true)::json ->> 'tag_ids', ',')::int[])
      )
  )
  or not exists (select 1 from product_tags pt2 where pt2.store_product_id = store_products.id)
);
```

Notas:
- Ajustar para UUID/int de tags; usar helpers do Supabase conforme necessário.
- Para lógica por departamentos e janelas, compor views que verifiquem timezone e pertenças do usuário.

## 5) Guards (Server-Side)

```ts
type UserCtx = { id: string; tenantId: string; role: string; tags: Array<{ key: string; value: string }>; departments: string[] }

export function canViewProduct(user: UserCtx, product: { tags?: string[] }, policy?: any): boolean {
  const defaultAllow = policy?.default_allow_unless_tagged ?? true
  const productHasTags = (product.tags?.length || 0) > 0
  const tagOk = !productHasTags || (user.tags || []).some(t => (product.tags || []).includes(t.value))
  const deptOk = !policy?.allowed_departments?.length || policy.allowed_departments!.some((d: string) => user.departments.includes(d))
  const twOk = true // TODO: checar janelas ativas
  return (defaultAllow && !productHasTags) || (tagOk && deptOk && twOk)
}
```

## 6) Endpoints v2

- `POST /v2/authx/login` | `/logout` | `/refresh`
- `GET /v2/policies/access` | `POST /v2/policies/access`
- `GET/POST /v2/policies/limits`
- `GET/POST /v2/policies/time-windows`
- `GET/POST /v2/tags`
- `POST /v2/approvals/create` | `POST /v2/approvals/{id}/approve|reject` | `GET /v2/approvals`

## 7) UI (Resumo)

- Admin Console: CRUD departamentos/tags/janelas/políticas/limites e policies de aprovação (com validadores JSON schema).
- Gestor: atribuição de tags; limites e aprovações; relatórios.
- Funcionário: catálogo filtrado; banners de aprovação quando necessário.

## 8) Observabilidade

- Logs: `AUTH_LOGIN`, `AUTH_LOGOUT`, `SESSION_RENEW`, `ACCESS_DENIED`, `LIMIT_HIT`, `APPROVAL_REQUESTED`, `APPROVAL_DECISION`.
- Métricas: taxa de aprovação, SLA, bloqueios por tag/dept/janela/limite.

## 9) Feature Flag

- Env global `AUTHX_ENABLED` e, opcionalmente, por tenant (`tenant_flags`).
- Ocultar menus/features v2 quando OFF.

## 10) Plano de Entrega (Incremental)

1) Migrations + seeds mínimos de tags/depts.
2) Guards + RLS (read-only) e toggle por flag.
3) Endpoints `/v2/authx/*` (login/logout/refresh) e sessões.
4) Policies de acesso + UI (Admin Console) com JSON schema validator.
5) Limites e approvals com engine básica + UI de aprovação.
6) Integração no fluxo de resgate/pedido.
7) Telemetria + docs.

