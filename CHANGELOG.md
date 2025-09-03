# Changelog - Yoobe V3

## [3.1.0] - 2025-09-03

### 🚀 Módulo de Replicação Avançada

#### Novas Funcionalidades

- **Edição Avançada:** Modal completo para edição de produtos replicados
- **Gestão de Tags:** Sistema de tags com adição/remoção dinâmica
- **Gestão de Imagens:** Upload, preview e controle de imagem principal
- **Ativação/Inativação:** Toggle para controle de status ativo/inativo
- **Geração EAN-13:** Código automático baseado no SKU personalizado
- **Preview do Produto:** Visualização completa do estado atual

#### Novas APIs

- `POST /api/products/generate-ean13` - Geração automática de EAN-13
- `GET /api/products/[productId]` - Buscar produto completo
- `PATCH /api/products/[productId]` - Atualizar produto com validações
- `DELETE /api/products/[productId]` - Soft delete (inativação)

#### Novos Campos na Tabela `client_products`

- `tags` (JSONB), `images` (JSONB), `advanced_description` (TEXT)
- `is_active` (BOOLEAN), `custom_sku` (VARCHAR), `ean_13` (VARCHAR)
- `metadata` (JSONB), `activated_at`, `deactivated_at`, `deactivation_reason`

#### Novos Componentes

- **ProductEditModal:** Modal completo de edição com todas as funcionalidades
- **Validações:** Campos obrigatórios, feedback visual, toasts
- **Interface:** Responsiva, intuitiva e otimizada

#### Scripts de Automação

- `apply-advanced-fields.js` - Migration local
- `apply-production-migration.js` - Migration para produção
- `check-client-products-schema.js` - Verificação de schema

#### Documentação

- Resumos técnicos completos
- Instruções para deploy em produção
- Guias de uso e troubleshooting

### 🔧 Correções

- Página do gestor agora exibe produtos replicados corretamente
- Consulta SQL otimizada, removendo JOIN problemático
- Validações de campos obrigatórios implementadas

### 🔒 Segurança

- Autenticação em todas as novas APIs
- Validação de roles e company_id
- RLS aplicado para separação de dados

---

## [3.1.0] - 2025-09-02

### 🚀 Sistema Completo de Orçamentos e Replicação

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

## [2.2.0] - 2025-09-02

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
