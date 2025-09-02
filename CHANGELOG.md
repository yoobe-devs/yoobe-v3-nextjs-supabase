# Changelog - Yoobe V3

## [2.2.0] - 2025-09-01

### ✅ Compatibilidade API/DB/Frontend
- Ajuste de códigos de status e payloads nas rotas do Gestor:
  - `POST /api/gestor/orcamentos` retorna 201 com `{ budget, message }`
  - `POST /api/gestor/base-products` retorna 201 com `{ company_product }`
  - `PATCH /api/gestor/produtos/{id}` retorna `{ company_product }`
  - `PATCH /api/gestor/produtos/{id}/status` retorna `{ company_product }`
- Suporte a Authorization header nas rotas do Gestor (cookies ou Bearer token)
- Migrações ajustadas para evitar erros de IF NOT EXISTS em policies

### 🧪 Testes
- Todos os testes do fluxo de orçamentos e replicação passando (17/17)
- Execução validada em ambiente local (Next 14 + Supabase local)

### 📚 Documentação
- `docs/API_REFERENCE.md` atualizado para refletir rotas, corpos e respostas reais
- Notas de autenticação para endpoints protegidos

### 📝 Auditoria (preparação)
- Planejada tabela `user_audit_logs` e triggers para cadastro/convite/remoção (vide seção Segurança)

---

## [2.1.0] - 2024-01-XX

### 🚀 Sistema de Orçamentos e Replicação

#### Novas Funcionalidades
- **Fluxo completo:** Orçamento → Aprovação → Replicação
- **Gestores:** Criam orçamentos, replicam produtos após aprovação
- **Admin Global:** Aprova/rejeita orçamentos, controla replicação
- **Controle de acesso:** Roles específicos para cada funcionalidade

#### Novas APIs
- `POST /api/gestor/orcamentos` - Criar orçamento
- `GET /api/gestor/orcamentos` - Listar orçamentos do gestor
- `POST /api/gestor/base-products` - Replicar produto (requer aprovação)
- `GET /api/gestor/produtos` - Listar produtos replicados
- `PATCH /api/gestor/produtos/{id}/status` - Ativar/inativar produto
- `GET /api/admin/orcamentos` - Listar todos os orçamentos
- `POST /api/admin/orcamentos/{id}/approve` - Aprovar/rejeitar orçamento

#### Novas Tabelas
- `budgets` - Orçamentos dos gestores
- `budget_items` - Itens dos orçamentos
- Campos adicionais em `company_products`: `is_active`, `budget_id`, `approved_at`, `approved_by`

#### Interfaces
- **Gestor:** Páginas de orçamentos, catálogo com bloqueio, gestão de produtos
- **Admin:** Página de gestão de orçamentos com aprovação/rejeição

#### Testes
- Cobertura completa com Jest + Supertest
- Testes de fluxo, permissões e casos de erro
- Cobertura mínima de 80%

#### Documentação
- Especificação OpenAPI 3.0 completa
- README atualizado com instruções

### 🔧 Correções
- Página de edição de produtos (Admin) - Endpoint corrigido
- Página de produtos do gestor - API criada
- Lógica de replicação - Bloqueio por orçamento implementado

### 🔒 Segurança
- Validação de orçamento aprovado para replicação
- Controle de acesso por roles
- Auditoria de aprovações/rejeições

---

## [2.0.0] - 2024-01-XX
- Sistema base implementado
- Autenticação com Supabase
- Painéis de Admin e Gestor
- Importação de produtos
