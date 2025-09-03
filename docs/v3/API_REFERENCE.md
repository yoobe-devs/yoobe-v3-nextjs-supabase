# 🔌 Yoobe v3 - Referência da API

> **Documentação automática das rotas da API**

## 📋 **Visão Geral**

Esta documentação foi gerada automaticamente baseada na análise do código fonte.
**Total de endpoints**: 203

## 🚀 **Endpoints por Categoria**

### **ADDRESSES**

#### **POST** `/addresses`

POST endpoint

**Parâmetros:**
- Nenhum

**Respostas:**
- `application/json`
- `201 Created`
- `403 Forbidden`

#### **GET** `/addresses`

Log audit

**Parâmetros:**
- Nenhum

**Respostas:**
- `application/json`
- `201 Created`
- `403 Forbidden`


### **ADMIN**

#### **GET** `/admin/audit-logs`

GET endpoint

**Parâmetros:**
- `request: NextRequest`

**Respostas:**
- `application/json`
- `403 Forbidden`
- `500 Internal Server Error`

#### **POST** `/admin/budgets`

POST /api/admin/budgets

**Parâmetros:**
- `request: NextRequest`

**Respostas:**
- `application/json`
- `201 Created`
- `400 Bad Request`
- `401 Unauthorized`
- `403 Forbidden`
- `404 Not Found`
- `500 Internal Server Error`

#### **GET** `/admin/budgets`

GET /api/admin/budgets

**Parâmetros:**
- `request: NextRequest`

**Respostas:**
- `application/json`
- `201 Created`
- `400 Bad Request`
- `401 Unauthorized`
- `403 Forbidden`
- `404 Not Found`
- `500 Internal Server Error`

#### **GET** `/admin/changelog/markdown`

GET endpoint

**Parâmetros:**
- Nenhum

**Respostas:**
- `application/json`
- `404 Not Found`

#### **GET** `/admin/cubbo-integration`

GET - Buscar configuração de integração Cubbo global

**Parâmetros:**
- `request: NextRequest`

**Respostas:**
- `application/json`
- `400 Bad Request`
- `401 Unauthorized`
- `403 Forbidden`
- `500 Internal Server Error`

#### **POST** `/admin/cubbo-integration`

POST - Criar/atualizar configuração de integração Cubbo global

**Parâmetros:**
- `request: NextRequest`

**Respostas:**
- `application/json`
- `400 Bad Request`
- `401 Unauthorized`
- `403 Forbidden`
- `500 Internal Server Error`

#### **POST** `/admin/cubbo-sync`

POST endpoint

**Parâmetros:**
- `request: NextRequest`

**Respostas:**
- `application/json`
- `401 Unauthorized`
- `403 Forbidden`
- `500 Internal Server Error`

#### **GET** `/admin/cubbo-sync`

Registrar log de sincronização

**Parâmetros:**
- `request: NextRequest`

**Respostas:**
- `application/json`
- `401 Unauthorized`
- `403 Forbidden`
- `500 Internal Server Error`

#### **GET** `/admin/documentation`

GET endpoint

**Parâmetros:**
- Nenhum

**Respostas:**
- `application/json`
- `400 Bad Request`
- `500 Internal Server Error`

#### **POST** `/admin/documentation`

Retornar status da documentação

**Parâmetros:**
- `request: NextRequest`

**Respostas:**
- `application/json`
- `400 Bad Request`
- `500 Internal Server Error`

#### **GET** `/admin/gestores/[id]`

GET - Buscar gestor específico

**Parâmetros:**
- `request: NextRequest`

**Respostas:**
- `application/json`
- `400 Bad Request`
- `404 Not Found`
- `500 Internal Server Error`

#### **PUT** `/admin/gestores/[id]`

PUT - Atualizar gestor

**Parâmetros:**
- `request: NextRequest`

**Respostas:**
- `application/json`
- `400 Bad Request`
- `404 Not Found`
- `500 Internal Server Error`

#### **DELETE** `/admin/gestores/[id]`

DELETE - Deletar gestor

**Parâmetros:**
- `request: NextRequest`

**Respostas:**
- `application/json`
- `400 Bad Request`
- `404 Not Found`
- `500 Internal Server Error`

#### **GET** `/admin/gestores`

GET - Listar gestores

**Parâmetros:**
- `request: NextRequest`

**Respostas:**
- `application/json`
- `400 Bad Request`
- `500 Internal Server Error`

#### **POST** `/admin/gestores`

POST - Criar gestor

**Parâmetros:**
- `request: NextRequest`

**Respostas:**
- `application/json`
- `400 Bad Request`
- `500 Internal Server Error`

#### **GET** `/admin/invites`

GET - Listar convites

**Parâmetros:**
- `request: NextRequest`

**Respostas:**
- `application/json`
- `201 Created`
- `400 Bad Request`
- `401 Unauthorized`
- `403 Forbidden`
- `422 Unprocessable Entity`
- `500 Internal Server Error`

#### **POST** `/admin/invites`

POST - Criar novo convite

**Parâmetros:**
- `request: NextRequest`

**Respostas:**
- `application/json`
- `201 Created`
- `400 Bad Request`
- `401 Unauthorized`
- `403 Forbidden`
- `422 Unprocessable Entity`
- `500 Internal Server Error`

#### **POST** `/admin/orcamentos/[id]/approve`

POST - Aprovar ou rejeitar orçamento (Admin Global)

**Parâmetros:**
- `request: NextRequest`

**Respostas:**
- `application/json`
- `400 Bad Request`
- `401 Unauthorized`
- `403 Forbidden`
- `404 Not Found`
- `500 Internal Server Error`

#### **POST** `/admin/orcamentos/[id]/review`

POST - Revisar orçamento (Admin Global)

**Parâmetros:**
- `request: NextRequest`

**Respostas:**
- `application/json`
- `200 OK`
- `400 Bad Request`
- `401 Unauthorized`
- `403 Forbidden`
- `404 Not Found`
- `422 Unprocessable Entity`
- `500 Internal Server Error`

#### **GET** `/admin/orcamentos`

GET - Listar todos os orçamentos (Admin Global)

**Parâmetros:**
- `request: NextRequest`

**Respostas:**
- `application/json`
- `401 Unauthorized`
- `403 Forbidden`
- `500 Internal Server Error`

#### **PATCH** `/admin/products/[id]/status-flow`

PATCH - Atualizar status de fluxo do produto

**Parâmetros:**
- `request: NextRequest`

**Respostas:**
- `application/json`
- `400 Bad Request`
- `401 Unauthorized`
- `403 Forbidden`
- `404 Not Found`
- `500 Internal Server Error`

#### **GET** `/admin/products-base/[id]`

GET /api/admin/products-base/[id]

**Parâmetros:**
- `request: NextRequest`

**Respostas:**
- `application/json`
- `400 Bad Request`
- `401 Unauthorized`
- `403 Forbidden`
- `404 Not Found`
- `500 Internal Server Error`

#### **PUT** `/admin/products-base/[id]`

PUT /api/admin/products-base/[id]

**Parâmetros:**
- `request: NextRequest`

**Respostas:**
- `application/json`
- `400 Bad Request`
- `401 Unauthorized`
- `403 Forbidden`
- `404 Not Found`
- `500 Internal Server Error`

#### **DELETE** `/admin/products-base/[id]`

DELETE /api/admin/products-base/[id]

**Parâmetros:**
- `request: NextRequest`

**Respostas:**
- `application/json`
- `400 Bad Request`
- `401 Unauthorized`
- `403 Forbidden`
- `404 Not Found`
- `500 Internal Server Error`

#### **GET** `/admin/products-base`

GET /api/admin/products-base

**Parâmetros:**
- `request: NextRequest`

**Respostas:**
- `application/json`
- `201 Created`
- `400 Bad Request`
- `401 Unauthorized`
- `403 Forbidden`
- `500 Internal Server Error`

#### **POST** `/admin/products-base`

POST /api/admin/products-base

**Parâmetros:**
- `request: NextRequest`

**Respostas:**
- `application/json`
- `201 Created`
- `400 Bad Request`
- `401 Unauthorized`
- `403 Forbidden`
- `500 Internal Server Error`

#### **POST** `/admin/produtos/import-sheet`

POST endpoint

**Parâmetros:**
- Nenhum

**Respostas:**
- `application/json`
- `400 Bad Request`
- `401 Unauthorized`
- `500 Internal Server Error`

#### **GET** `/admin/produtos/import-sheet/template`

GET endpoint

**Parâmetros:**
- Nenhum

**Respostas:**
- `200 OK`

#### **POST** `/admin/produtos/importar`

Criar nova categoria

**Parâmetros:**
- `request: NextRequest`

**Respostas:**
- `application/json`
- `400 Bad Request`
- `401 Unauthorized`
- `403 Forbidden`
- `500 Internal Server Error`

#### **POST** `/admin/promote-self`

POST endpoint

**Parâmetros:**
- Nenhum

**Respostas:**
- `application/json`
- `401 Unauthorized`
- `403 Forbidden`
- `500 Internal Server Error`

#### **POST** `/admin/superadmin/seed`

POST endpoint

**Parâmetros:**
- Nenhum

**Respostas:**
- `application/json`
- `403 Forbidden`
- `500 Internal Server Error`

#### **DELETE** `/admin/users/[id]`

DELETE - Remover usuário (admin)

**Parâmetros:**
- `request: NextRequest`

**Respostas:**
- `application/json`
- `400 Bad Request`
- `403 Forbidden`
- `500 Internal Server Error`

#### **POST** `/admin/users/invite`

POST endpoint

**Parâmetros:**
- `request: NextRequest`

**Respostas:**
- `application/json`
- `201 Created`
- `400 Bad Request`
- `403 Forbidden`
- `500 Internal Server Error`

#### **POST** `/admin/users`

POST - Criar usuário (admin)

**Parâmetros:**
- `request: NextRequest`

**Respostas:**
- `application/json`
- `201 Created`
- `400 Bad Request`
- `403 Forbidden`
- `500 Internal Server Error`


### **AUDIT**

#### **GET** `/audit/logs`

=====================================================

**Parâmetros:**
- `request: NextRequest`

**Respostas:**
- `application/json`
- `400 Bad Request`
- `401 Unauthorized`
- `403 Forbidden`
- `500 Internal Server Error`

#### **POST** `/audit/logs`

Registrar acesso aos logs (auditoria da auditoria)

**Parâmetros:**
- `request: NextRequest`

**Respostas:**
- `application/json`
- `400 Bad Request`
- `401 Unauthorized`
- `403 Forbidden`
- `500 Internal Server Error`


### **AUTH**

#### **GET** `/auth/callback`

GET endpoint

**Parâmetros:**
- `request: NextRequest`

**Respostas:**
- `200 OK`

#### **GET** `/auth/login`

GET endpoint

**Parâmetros:**
- Nenhum

**Respostas:**
- `application/json`
- `500 Internal Server Error`

#### **POST** `/auth/logout`

POST endpoint

**Parâmetros:**
- Nenhum

**Respostas:**
- `application/json`

#### **POST** `/auth/register`

POST endpoint

**Parâmetros:**
- `request: NextRequest`

**Respostas:**
- `application/json`
- `400 Bad Request`
- `500 Internal Server Error`


### **BASE-PRODUCTS**

#### **GET** `/base-products/[id]`

GET endpoint

**Parâmetros:**
- `request: NextRequest`

**Respostas:**
- `application/json`
- `400 Bad Request`
- `404 Not Found`
- `500 Internal Server Error`

#### **PUT** `/base-products/[id]`

,

**Parâmetros:**
- `request: NextRequest`

**Respostas:**
- `application/json`
- `400 Bad Request`
- `404 Not Found`
- `500 Internal Server Error`

#### **DELETE** `/base-products/[id]`

,

**Parâmetros:**
- `request: NextRequest`

**Respostas:**
- `application/json`
- `400 Bad Request`
- `404 Not Found`
- `500 Internal Server Error`

#### **GET** `/base-products/[id]/tiers`

GET endpoint

**Parâmetros:**
- `request: NextRequest`

**Respostas:**
- `application/json`
- `201 Created`
- `400 Bad Request`
- `403 Forbidden`
- `500 Internal Server Error`

#### **POST** `/base-products/[id]/tiers`

POST endpoint

**Parâmetros:**
- `request: NextRequest`

**Respostas:**
- `application/json`
- `201 Created`
- `400 Bad Request`
- `403 Forbidden`
- `500 Internal Server Error`

#### **DELETE** `/base-products/[id]/tiers`

DELETE endpoint

**Parâmetros:**
- `request: NextRequest`

**Respostas:**
- `application/json`
- `201 Created`
- `400 Bad Request`
- `403 Forbidden`
- `500 Internal Server Error`

#### **GET** `/base-products`

GET endpoint

**Parâmetros:**
- Nenhum

**Respostas:**
- `application/json`
- `201 Created`
- `400 Bad Request`
- `500 Internal Server Error`

#### **POST** `/base-products`

Compute check digit

**Parâmetros:**
- `request: NextRequest`

**Respostas:**
- `application/json`
- `201 Created`
- `400 Bad Request`
- `500 Internal Server Error`


### **CART**

#### **POST** `/cart/add`

=====================================================

**Parâmetros:**
- `request: NextRequest`

**Respostas:**
- `application/json`
- `200 OK`
- `400 Bad Request`
- `401 Unauthorized`
- `500 Internal Server Error`

#### **GET** `/cart/add`

Buscar carrinho completo com itens

**Parâmetros:**
- Nenhum

**Respostas:**
- `application/json`
- `200 OK`
- `400 Bad Request`
- `401 Unauthorized`
- `500 Internal Server Error`

#### **POST** `/cart/clear`

POST endpoint

**Parâmetros:**
- Nenhum

**Respostas:**
- `application/json`

#### **GET** `/cart/get`

GET endpoint

**Parâmetros:**
- Nenhum

**Respostas:**
- `application/json`


### **CATEGORIES**

#### **GET** `/categories/[id]`

GET - Buscar categoria específica

**Parâmetros:**
- `request: NextRequest`

**Respostas:**
- `application/json`
- `400 Bad Request`
- `401 Unauthorized`
- `404 Not Found`
- `500 Internal Server Error`

#### **PUT** `/categories/[id]`

PUT - Atualizar categoria

**Parâmetros:**
- `request: NextRequest`

**Respostas:**
- `application/json`
- `400 Bad Request`
- `401 Unauthorized`
- `404 Not Found`
- `500 Internal Server Error`

#### **DELETE** `/categories/[id]`

DELETE - Excluir categoria

**Parâmetros:**
- `request: NextRequest`

**Respostas:**
- `application/json`
- `400 Bad Request`
- `401 Unauthorized`
- `404 Not Found`
- `500 Internal Server Error`

#### **GET** `/categories`

GET endpoint

**Parâmetros:**
- Nenhum

**Respostas:**
- `application/json`
- `201 Created`
- `400 Bad Request`
- `500 Internal Server Error`

#### **POST** `/categories`

POST endpoint

**Parâmetros:**
- `request: NextRequest`

**Respostas:**
- `application/json`
- `201 Created`
- `400 Bad Request`
- `500 Internal Server Error`


### **CHANGELOG**

#### **GET** `/changelog`

GET endpoint

**Parâmetros:**
- `request: NextRequest`

**Respostas:**
- `application/json`
- `500 Internal Server Error`


### **CHECKOUT**

#### **POST** `/checkout/event`

POST endpoint

**Parâmetros:**
- Nenhum

**Respostas:**
- `application/json`

#### **POST** `/checkout/pay`

POST endpoint

**Parâmetros:**
- Nenhum

**Respostas:**
- `application/json`
- `400 Bad Request`

#### **POST** `/checkout/points`

POST endpoint

**Parâmetros:**
- `request: NextRequest`

**Respostas:**
- `application/json`
- `201 Created`
- `400 Bad Request`
- `401 Unauthorized`
- `404 Not Found`
- `422 Unprocessable Entity`
- `500 Internal Server Error`

#### **POST** `/checkout`

POST endpoint

**Parâmetros:**
- `request: NextRequest`

**Respostas:**
- `application/json`
- `400 Bad Request`
- `401 Unauthorized`
- `500 Internal Server Error`

#### **POST** `/checkout/start`

=====================================================

**Parâmetros:**
- `request: NextRequest`

**Respostas:**
- `application/json`
- `200 OK`
- `400 Bad Request`
- `401 Unauthorized`
- `422 Unprocessable Entity`
- `500 Internal Server Error`

#### **GET** `/checkout/start`

Buscar sessão completa com detalhes

**Parâmetros:**
- Nenhum

**Respostas:**
- `application/json`
- `200 OK`
- `400 Bad Request`
- `401 Unauthorized`
- `422 Unprocessable Entity`
- `500 Internal Server Error`


### **CLIENTS**

#### **GET** `/clients/[clientId]/orcamentos`

GET endpoint

**Parâmetros:**
- `request: NextRequest`

**Respostas:**
- `application/json`
- `201 Created`
- `400 Bad Request`
- `401 Unauthorized`
- `403 Forbidden`
- `500 Internal Server Error`

#### **POST** `/clients/[clientId]/orcamentos`

POST endpoint

**Parâmetros:**
- `request: NextRequest`

**Respostas:**
- `application/json`
- `201 Created`
- `400 Bad Request`
- `401 Unauthorized`
- `403 Forbidden`
- `500 Internal Server Error`

#### **GET** `/clients/[clientId]/products/[id]/price`

GET endpoint

**Parâmetros:**
- `request: NextRequest`

**Respostas:**
- `application/json`
- `401 Unauthorized`
- `403 Forbidden`
- `500 Internal Server Error`

#### **PATCH** `/clients/[clientId]/products/[id]/status`

PATCH - Ativar/inativar produto replicado

**Parâmetros:**
- `request: NextRequest`

**Respostas:**
- `application/json`
- `400 Bad Request`
- `401 Unauthorized`
- `403 Forbidden`
- `404 Not Found`
- `500 Internal Server Error`

#### **GET** `/clients/[clientId]/products`

GET endpoint

**Parâmetros:**
- `request: NextRequest`

**Respostas:**
- `application/json`
- `201 Created`
- `400 Bad Request`
- `401 Unauthorized`
- `403 Forbidden`
- `500 Internal Server Error`

#### **POST** `/clients/[clientId]/products`

POST endpoint

**Parâmetros:**
- `request: NextRequest`

**Respostas:**
- `application/json`
- `201 Created`
- `400 Bad Request`
- `401 Unauthorized`
- `403 Forbidden`
- `500 Internal Server Error`

#### **POST** `/clients/[clientId]/replicate-product/[baseProductId]`

POST endpoint

**Parâmetros:**
- `request: NextRequest`

**Respostas:**
- `application/json`
- `201 Created`
- `401 Unauthorized`
- `403 Forbidden`
- `404 Not Found`
- `500 Internal Server Error`

#### **POST** `/clients/[clientId]/replicate-products`

POST endpoint

**Parâmetros:**
- `request: NextRequest`

**Respostas:**
- `application/json`
- `400 Bad Request`
- `401 Unauthorized`
- `403 Forbidden`
- `500 Internal Server Error`


### **COMPANIES**

#### **GET** `/companies/[id]`

Usar service role key para contornar autenticação

**Parâmetros:**
- `request: NextRequest`

**Respostas:**
- `application/json`
- `400 Bad Request`
- `404 Not Found`
- `500 Internal Server Error`

#### **PUT** `/companies/[id]`

Usar service role key para contornar autenticação

**Parâmetros:**
- `request: NextRequest`

**Respostas:**
- `application/json`
- `400 Bad Request`
- `404 Not Found`
- `500 Internal Server Error`

#### **DELETE** `/companies/[id]`

Atualizar empresa

**Parâmetros:**
- `request: NextRequest`

**Respostas:**
- `application/json`
- `400 Bad Request`
- `404 Not Found`
- `500 Internal Server Error`

#### **GET** `/companies`

GET - Listar empresas

**Parâmetros:**
- `request: NextRequest`

**Respostas:**
- `application/json`
- `400 Bad Request`
- `500 Internal Server Error`

#### **POST** `/companies`

POST - Criar empresa

**Parâmetros:**
- `request: NextRequest`

**Respostas:**
- `application/json`
- `400 Bad Request`
- `500 Internal Server Error`


### **COUPONS**

#### **POST** `/coupons/apply`

=====================================================

**Parâmetros:**
- `request: NextRequest`

**Respostas:**
- `application/json`
- `200 OK`
- `400 Bad Request`
- `401 Unauthorized`
- `500 Internal Server Error`

#### **POST** `/coupons/validate`

=====================================================

**Parâmetros:**
- `request: NextRequest`

**Respostas:**
- `application/json`
- `200 OK`
- `400 Bad Request`
- `401 Unauthorized`
- `500 Internal Server Error`


### **CUBBO**

#### **GET** `/cubbo/integration`

GET - Buscar configuração de integração

**Parâmetros:**
- `request: NextRequest`

**Respostas:**
- `application/json`
- `400 Bad Request`
- `401 Unauthorized`
- `403 Forbidden`
- `404 Not Found`
- `500 Internal Server Error`

#### **POST** `/cubbo/integration`

POST - Criar/atualizar configuração de integração

**Parâmetros:**
- `request: NextRequest`

**Respostas:**
- `application/json`
- `400 Bad Request`
- `401 Unauthorized`
- `403 Forbidden`
- `404 Not Found`
- `500 Internal Server Error`

#### **DELETE** `/cubbo/integration`

DELETE - Desativar integração

**Parâmetros:**
- `request: NextRequest`

**Respostas:**
- `application/json`
- `400 Bad Request`
- `401 Unauthorized`
- `403 Forbidden`
- `404 Not Found`
- `500 Internal Server Error`

#### **POST** `/cubbo/sync`

POST - Sincronizar produtos com Cubbo (simulado em desenvolvimento)

**Parâmetros:**
- `request: NextRequest`

**Respostas:**
- `application/json`
- `400 Bad Request`
- `401 Unauthorized`
- `403 Forbidden`
- `404 Not Found`
- `500 Internal Server Error`

#### **GET** `/cubbo/sync`

GET - Status da sincronização

**Parâmetros:**
- `request: NextRequest`

**Respostas:**
- `application/json`
- `400 Bad Request`
- `401 Unauthorized`
- `403 Forbidden`
- `404 Not Found`
- `500 Internal Server Error`


### **CURRENCY**

#### **POST** `/currency/convert`

=====================================================

**Parâmetros:**
- `request: NextRequest`

**Respostas:**
- `application/json`
- `200 OK`
- `400 Bad Request`
- `401 Unauthorized`
- `500 Internal Server Error`


### **DOCS**

#### **POST** `/docs/run`

POST endpoint

**Parâmetros:**
- `request: NextRequest`

**Respostas:**
- `application/json`
- `400 Bad Request`

#### **GET** `/docs/v3/[...slug]`

GET endpoint

**Parâmetros:**
- Nenhum

**Respostas:**
- `application/json`
- `404 Not Found`


### **EAN**

#### **POST** `/ean/assign`

POST endpoint

**Parâmetros:**
- `request: NextRequest`

**Respostas:**
- `application/json`
- `400 Bad Request`
- `401 Unauthorized`
- `403 Forbidden`
- `500 Internal Server Error`

#### **POST** `/ean/issue`

POST endpoint

**Parâmetros:**
- `request: NextRequest`

**Respostas:**
- `application/json`
- `401 Unauthorized`
- `403 Forbidden`
- `500 Internal Server Error`


### **EMAIL**

#### **POST** `/email/send`

POST endpoint

**Parâmetros:**
- `request: NextRequest`

**Respostas:**
- `application/json`
- `400 Bad Request`
- `500 Internal Server Error`


### **GESTOR**

#### **GET** `/gestor/base-products`

GET - Listar produtos base disponíveis para o gestor

**Parâmetros:**
- `request: NextRequest`

**Respostas:**
- `application/json`
- `201 Created`
- `400 Bad Request`
- `401 Unauthorized`
- `403 Forbidden`
- `404 Not Found`
- `500 Internal Server Error`

#### **POST** `/gestor/base-products`

POST - Replicar produto base para a empresa do gestor

**Parâmetros:**
- `request: NextRequest`

**Respostas:**
- `application/json`
- `201 Created`
- `400 Bad Request`
- `401 Unauthorized`
- `403 Forbidden`
- `404 Not Found`
- `500 Internal Server Error`

#### **PUT** `/gestor/employees/[id]`

PUT - Atualizar funcionário

**Parâmetros:**
- `request: NextRequest`

**Respostas:**
- `application/json`
- `400 Bad Request`
- `401 Unauthorized`
- `403 Forbidden`
- `404 Not Found`
- `500 Internal Server Error`

#### **DELETE** `/gestor/employees/[id]`

DELETE - Excluir funcionário

**Parâmetros:**
- `request: NextRequest`

**Respostas:**
- `application/json`
- `400 Bad Request`
- `401 Unauthorized`
- `403 Forbidden`
- `404 Not Found`
- `500 Internal Server Error`

#### **GET** `/gestor/employees`

GET - Buscar funcionários da empresa do gestor

**Parâmetros:**
- Nenhum

**Respostas:**
- `application/json`
- `401 Unauthorized`
- `403 Forbidden`
- `404 Not Found`
- `500 Internal Server Error`

#### **POST** `/gestor/employees`

POST - Criar novo funcionário

**Parâmetros:**
- `request: NextRequest`

**Respostas:**
- `application/json`
- `401 Unauthorized`
- `403 Forbidden`
- `404 Not Found`
- `500 Internal Server Error`

#### **POST** `/gestor/orcamentos/[id]/approve`

POST - Aprovar ou rejeitar orçamento

**Parâmetros:**
- `request: NextRequest`

**Respostas:**
- `application/json`
- `200 OK`
- `400 Bad Request`
- `401 Unauthorized`
- `403 Forbidden`
- `404 Not Found`
- `422 Unprocessable Entity`
- `500 Internal Server Error`

#### **GET** `/gestor/orcamentos`

GET - Listar orçamentos do gestor com filtros avançados

**Parâmetros:**
- `request: NextRequest`

**Respostas:**
- `application/json`
- `201 Created`
- `400 Bad Request`
- `401 Unauthorized`
- `403 Forbidden`
- `422 Unprocessable Entity`
- `500 Internal Server Error`

#### **POST** `/gestor/orcamentos`

POST - Criar novo orçamento com estrutura v3 completa

**Parâmetros:**
- `request: NextRequest`

**Respostas:**
- `application/json`
- `201 Created`
- `400 Bad Request`
- `401 Unauthorized`
- `403 Forbidden`
- `422 Unprocessable Entity`
- `500 Internal Server Error`

#### **PUT** `/gestor/orders/[id]`

PUT - Atualizar status do pedido

**Parâmetros:**
- `request: NextRequest`

**Respostas:**
- `application/json`
- `400 Bad Request`
- `401 Unauthorized`
- `403 Forbidden`
- `404 Not Found`
- `500 Internal Server Error`

#### **GET** `/gestor/orders`

GET - Buscar pedidos da empresa do gestor

**Parâmetros:**
- Nenhum

**Respostas:**
- `application/json`
- `401 Unauthorized`
- `403 Forbidden`
- `404 Not Found`
- `500 Internal Server Error`

#### **PUT** `/gestor/points-conversion/[id]/activate`

PUT endpoint

**Parâmetros:**
- `request: NextRequest`

**Respostas:**
- `application/json`
- `400 Bad Request`
- `401 Unauthorized`
- `403 Forbidden`
- `404 Not Found`
- `500 Internal Server Error`

#### **GET** `/gestor/points-conversion`

GET endpoint

**Parâmetros:**
- `request: NextRequest`

**Respostas:**
- `application/json`
- `201 Created`
- `400 Bad Request`
- `401 Unauthorized`
- `403 Forbidden`
- `404 Not Found`
- `500 Internal Server Error`

#### **POST** `/gestor/points-conversion`

Calcular preview para valores comuns

**Parâmetros:**
- `request: NextRequest`

**Respostas:**
- `application/json`
- `201 Created`
- `400 Bad Request`
- `401 Unauthorized`
- `403 Forbidden`
- `404 Not Found`
- `500 Internal Server Error`

#### **DELETE** `/gestor/products/[id]/images/[imageId]`

DELETE endpoint

**Parâmetros:**
- `request: NextRequest`

**Respostas:**
- `application/json`
- `401 Unauthorized`
- `403 Forbidden`
- `404 Not Found`
- `500 Internal Server Error`

#### **PATCH** `/gestor/products/[id]/images/reorder`

PATCH endpoint

**Parâmetros:**
- `request: NextRequest`

**Respostas:**
- `application/json`
- `400 Bad Request`
- `401 Unauthorized`
- `403 Forbidden`
- `500 Internal Server Error`

#### **POST** `/gestor/products/[id]/images`

POST endpoint

**Parâmetros:**
- `request: NextRequest`

**Respostas:**
- `application/json`
- `400 Bad Request`
- `401 Unauthorized`
- `403 Forbidden`
- `500 Internal Server Error`

#### **PATCH** `/gestor/products/[id]/points`

PATCH endpoint

**Parâmetros:**
- `request: NextRequest`

**Respostas:**
- `application/json`
- `401 Unauthorized`
- `403 Forbidden`
- `500 Internal Server Error`

#### **PUT** `/gestor/products/[id]/points-settings`

PUT endpoint

**Parâmetros:**
- `request: NextRequest`

**Respostas:**
- `application/json`
- `400 Bad Request`
- `401 Unauthorized`
- `403 Forbidden`
- `404 Not Found`
- `500 Internal Server Error`

#### **PUT** `/gestor/products/[id]`

PUT - Atualizar produto

**Parâmetros:**
- `request: NextRequest`

**Respostas:**
- `application/json`
- `401 Unauthorized`
- `403 Forbidden`
- `404 Not Found`
- `500 Internal Server Error`

#### **DELETE** `/gestor/products/[id]`

DELETE - Excluir produto

**Parâmetros:**
- `request: NextRequest`

**Respostas:**
- `application/json`
- `401 Unauthorized`
- `403 Forbidden`
- `404 Not Found`
- `500 Internal Server Error`

#### **PATCH** `/gestor/products/[id]/status`

PATCH endpoint

**Parâmetros:**
- `request: NextRequest`

**Respostas:**
- `application/json`
- `400 Bad Request`
- `401 Unauthorized`
- `403 Forbidden`
- `500 Internal Server Error`

#### **GET** `/gestor/products/dupes`

GET endpoint

**Parâmetros:**
- `request: NextRequest`

**Respostas:**
- `application/json`
- `401 Unauthorized`
- `500 Internal Server Error`

#### **GET** `/gestor/products`

GET - Buscar produtos da empresa do gestor

**Parâmetros:**
- `request: NextRequest`

**Respostas:**
- `application/json`
- `401 Unauthorized`
- `403 Forbidden`
- `500 Internal Server Error`

#### **POST** `/gestor/products`

POST - Criar novo produto

**Parâmetros:**
- `request: NextRequest`

**Respostas:**
- `application/json`
- `401 Unauthorized`
- `403 Forbidden`
- `500 Internal Server Error`

#### **PUT** `/gestor/produtos/[id]/activate`

@apiDescription Ativa ou desativa um produto replicado na loja do gestor

**Parâmetros:**
- `request: NextRequest`

**Respostas:**
- `application/json`
- `400 Bad Request`
- `401 Unauthorized`
- `403 Forbidden`
- `404 Not Found`
- `500 Internal Server Error`

#### **PATCH** `/gestor/produtos/[id]`

PATCH - Atualizar produto do gestor

**Parâmetros:**
- `request: NextRequest`

**Respostas:**
- `application/json`
- `400 Bad Request`
- `401 Unauthorized`
- `403 Forbidden`
- `404 Not Found`
- `500 Internal Server Error`

#### **PATCH** `/gestor/produtos/[id]/status`

PATCH - Ativar/inativar produto do gestor

**Parâmetros:**
- `request: NextRequest`

**Respostas:**
- `application/json`
- `400 Bad Request`
- `401 Unauthorized`
- `403 Forbidden`
- `404 Not Found`
- `500 Internal Server Error`

#### **GET** `/gestor/produtos`

@apiDescription Lista todos os produtos replicados para a loja do gestor

**Parâmetros:**
- `request: NextRequest`

**Respostas:**
- `application/json`
- `201 Created`
- `400 Bad Request`
- `401 Unauthorized`
- `403 Forbidden`
- `500 Internal Server Error`

#### **POST** `/gestor/produtos`

@apiDescription Cria um novo produto replicado na loja do gestor

**Parâmetros:**
- `request: NextRequest`

**Respostas:**
- `application/json`
- `201 Created`
- `400 Bad Request`
- `401 Unauthorized`
- `403 Forbidden`
- `500 Internal Server Error`

#### **GET** `/gestor/stats`

GET endpoint

**Parâmetros:**
- `request: NextRequest`

**Respostas:**
- `application/json`
- `400 Bad Request`
- `500 Internal Server Error`

#### **GET** `/gestor/store-config`

@apiDescription Obtém as configurações atuais da loja do gestor

**Parâmetros:**
- `request: NextRequest`

**Respostas:**
- `application/json`
- `400 Bad Request`
- `401 Unauthorized`
- `403 Forbidden`
- `404 Not Found`
- `500 Internal Server Error`

#### **PUT** `/gestor/store-config`

@apiDescription Atualiza as configurações da loja do gestor

**Parâmetros:**
- `request: NextRequest`

**Respostas:**
- `application/json`
- `400 Bad Request`
- `401 Unauthorized`
- `403 Forbidden`
- `404 Not Found`
- `500 Internal Server Error`

#### **DELETE** `/gestor/store-config`

@apiDescription Deleta as configurações da loja do gestor

**Parâmetros:**
- `request: NextRequest`

**Respostas:**
- `application/json`
- `400 Bad Request`
- `401 Unauthorized`
- `403 Forbidden`
- `404 Not Found`
- `500 Internal Server Error`

#### **GET** `/gestor/usuarios`

@apiDescription Lista todos os usuários da empresa (gestores e funcionários)

**Parâmetros:**
- `request: NextRequest`

**Respostas:**
- `application/json`
- `201 Created`
- `400 Bad Request`
- `401 Unauthorized`
- `403 Forbidden`
- `500 Internal Server Error`

#### **POST** `/gestor/usuarios`

@apiDescription Cria um novo usuário na empresa

**Parâmetros:**
- `request: NextRequest`

**Respostas:**
- `application/json`
- `201 Created`
- `400 Bad Request`
- `401 Unauthorized`
- `403 Forbidden`
- `500 Internal Server Error`


### **INVENTORY**

#### **GET** `/inventory`

GET - Listar estoque

**Parâmetros:**
- `request: NextRequest`

**Respostas:**
- `application/json`
- `400 Bad Request`
- `401 Unauthorized`
- `404 Not Found`
- `500 Internal Server Error`

#### **POST** `/inventory`

POST - Atualizar estoque

**Parâmetros:**
- `request: NextRequest`

**Respostas:**
- `application/json`
- `400 Bad Request`
- `401 Unauthorized`
- `404 Not Found`
- `500 Internal Server Error`


### **INVITATIONS**

#### **POST** `/invitations/accept`

POST endpoint

**Parâmetros:**
- Nenhum

**Respostas:**
- `application/json`
- `400 Bad Request`
- `500 Internal Server Error`

#### **POST** `/invitations`

POST endpoint

**Parâmetros:**
- Nenhum

**Respostas:**
- `application/json`
- `201 Created`
- `400 Bad Request`
- `403 Forbidden`
- `500 Internal Server Error`

#### **GET** `/invitations`

await sendInvitationEmail(invitationData.email, inviteLink)

**Parâmetros:**
- Nenhum

**Respostas:**
- `application/json`
- `201 Created`
- `400 Bad Request`
- `403 Forbidden`
- `500 Internal Server Error`


### **LOJA**

#### **GET** `/loja/products`

GET endpoint

**Parâmetros:**
- `request: NextRequest`

**Respostas:**
- `application/json`
- `500 Internal Server Error`

#### **POST** `/loja/resgates`

POST endpoint

**Parâmetros:**
- `request: NextRequest`

**Respostas:**
- `application/json`
- `400 Bad Request`
- `401 Unauthorized`
- `403 Forbidden`
- `404 Not Found`
- `422 Unprocessable Entity`
- `500 Internal Server Error`


### **NOTIFICATIONS**

#### **GET** `/notifications`

GET - Listar notificações do usuário

**Parâmetros:**
- `request: NextRequest`

**Respostas:**
- `application/json`
- `400 Bad Request`
- `401 Unauthorized`
- `404 Not Found`
- `500 Internal Server Error`

#### **PATCH** `/notifications`

PATCH - Marcar notificação como lida

**Parâmetros:**
- `request: NextRequest`

**Respostas:**
- `application/json`
- `400 Bad Request`
- `401 Unauthorized`
- `404 Not Found`
- `500 Internal Server Error`


### **ORDERS**

#### **GET** `/orders/[id]`

GET - Buscar pedido específico

**Parâmetros:**
- `request: NextRequest`

**Respostas:**
- `application/json`
- `400 Bad Request`
- `401 Unauthorized`
- `404 Not Found`
- `500 Internal Server Error`

#### **PUT** `/orders/[id]`

PUT - Atualizar pedido

**Parâmetros:**
- `request: NextRequest`

**Respostas:**
- `application/json`
- `400 Bad Request`
- `401 Unauthorized`
- `404 Not Found`
- `500 Internal Server Error`

#### **DELETE** `/orders/[id]`

DELETE - Excluir pedido

**Parâmetros:**
- `request: NextRequest`

**Respostas:**
- `application/json`
- `400 Bad Request`
- `401 Unauthorized`
- `404 Not Found`
- `500 Internal Server Error`

#### **GET** `/orders`

GET - Listar pedidos

**Parâmetros:**
- `request: NextRequest`

**Respostas:**
- `application/json`
- `400 Bad Request`
- `401 Unauthorized`
- `500 Internal Server Error`

#### **POST** `/orders`

POST - Criar pedido

**Parâmetros:**
- `request: NextRequest`

**Respostas:**
- `application/json`
- `400 Bad Request`
- `401 Unauthorized`
- `500 Internal Server Error`


### **PAYMENT**

#### **POST** `/payment/process`

Validação do payload de processamento de pagamento

**Parâmetros:**
- `request: NextRequest`

**Respostas:**
- `application/json`
- `200 OK`
- `400 Bad Request`
- `401 Unauthorized`
- `403 Forbidden`
- `404 Not Found`
- `422 Unprocessable Entity`
- `500 Internal Server Error`

#### **GET** `/payment/process`

Registrar auditoria de pagamento

**Parâmetros:**
- Nenhum

**Respostas:**
- `application/json`
- `200 OK`
- `400 Bad Request`
- `401 Unauthorized`
- `403 Forbidden`
- `404 Not Found`
- `422 Unprocessable Entity`
- `500 Internal Server Error`


### **POINTS**

#### **POST** `/points/earn`

POST endpoint

**Parâmetros:**
- Nenhum

**Respostas:**
- `application/json`
- `400 Bad Request`
- `404 Not Found`
- `500 Internal Server Error`


### **PRICING**

#### **GET** `/pricing/points`

GET endpoint

**Parâmetros:**
- `request: NextRequest`

**Respostas:**
- `application/json`
- `400 Bad Request`
- `401 Unauthorized`
- `404 Not Found`
- `500 Internal Server Error`


### **PRODUCTS**

#### **GET** `/products/[id]`

GET - Buscar produto específico

**Parâmetros:**
- `request: NextRequest`

**Respostas:**
- `application/json`
- `400 Bad Request`
- `401 Unauthorized`
- `404 Not Found`
- `500 Internal Server Error`

#### **PUT** `/products/[id]`

PUT - Atualizar produto

**Parâmetros:**
- `request: NextRequest`

**Respostas:**
- `application/json`
- `400 Bad Request`
- `401 Unauthorized`
- `404 Not Found`
- `500 Internal Server Error`

#### **DELETE** `/products/[id]`

DELETE - Excluir produto

**Parâmetros:**
- `request: NextRequest`

**Respostas:**
- `application/json`
- `400 Bad Request`
- `401 Unauthorized`
- `404 Not Found`
- `500 Internal Server Error`

#### **POST** `/products/[id]/tags`

POST endpoint

**Parâmetros:**
- `request: NextRequest`

**Respostas:**
- `application/json`
- `401 Unauthorized`
- `403 Forbidden`
- `500 Internal Server Error`

#### **GET** `/products`

GET - Listar produtos (otimizado)

**Parâmetros:**
- `request: NextRequest`

**Respostas:**
- `application/json`
- `400 Bad Request`
- `401 Unauthorized`
- `500 Internal Server Error`

#### **POST** `/products`

POST - Criar produto (otimizado)

**Parâmetros:**
- `request: NextRequest`

**Respostas:**
- `application/json`
- `400 Bad Request`
- `401 Unauthorized`
- `500 Internal Server Error`


### **QUOTES**

#### **POST** `/quotes`

POST endpoint

**Parâmetros:**
- Nenhum

**Respostas:**
- `application/json`
- `201 Created`
- `400 Bad Request`
- `403 Forbidden`

#### **GET** `/quotes`

Log error

**Parâmetros:**
- Nenhum

**Respostas:**
- `application/json`
- `201 Created`
- `400 Bad Request`
- `403 Forbidden`


### **RBAC**

#### **GET** `/rbac/permissions`

GET endpoint

**Parâmetros:**
- Nenhum

**Respostas:**
- `application/json`


### **REDEMPTIONS**

#### **POST** `/redemptions`

POST endpoint

**Parâmetros:**
- Nenhum

**Respostas:**
- `application/json`
- `201 Created`
- `400 Bad Request`
- `403 Forbidden`
- `404 Not Found`
- `500 Internal Server Error`

#### **GET** `/redemptions`

Registrar transação na carteira

**Parâmetros:**
- Nenhum

**Respostas:**
- `application/json`
- `201 Created`
- `400 Bad Request`
- `403 Forbidden`
- `404 Not Found`
- `500 Internal Server Error`


### **REPLICATIONS**

#### **POST** `/replications/run`

POST endpoint

**Parâmetros:**
- Nenhum

**Respostas:**
- `application/json`
- `403 Forbidden`

#### **GET** `/replications/run`

Log error

**Parâmetros:**
- Nenhum

**Respostas:**
- `application/json`
- `403 Forbidden`


### **SCRAPING**

#### **POST** `/scraping/import-catalog`

POST endpoint

**Parâmetros:**
- `request: NextRequest`

**Respostas:**
- `application/json`
- `401 Unauthorized`
- `403 Forbidden`
- `500 Internal Server Error`

#### **POST** `/scraping/import-selected`

POST endpoint

**Parâmetros:**
- Nenhum

**Respostas:**
- `application/json`
- `400 Bad Request`
- `500 Internal Server Error`

#### **GET** `/scraping/preview`

GET endpoint

**Parâmetros:**
- Nenhum

**Respostas:**
- `application/json`
- `500 Internal Server Error`


### **SHIPMENTS**

#### **POST** `/shipments/queue`

POST endpoint

**Parâmetros:**
- Nenhum

**Respostas:**
- `application/json`


### **STORE**

#### **GET** `/store/[domain]/products`

GET - Buscar produtos da loja pública

**Parâmetros:**
- `request: NextRequest`

**Respostas:**
- `application/json`
- `404 Not Found`
- `500 Internal Server Error`

#### **GET** `/store/[domain]`

GET - Buscar dados da loja pública

**Parâmetros:**
- `request: NextRequest`

**Respostas:**
- `application/json`
- `404 Not Found`
- `500 Internal Server Error`

#### **POST** `/store/checkout`

POST - Processar checkout da loja pública

**Parâmetros:**
- `request: NextRequest`

**Respostas:**
- `application/json`
- `400 Bad Request`
- `404 Not Found`
- `500 Internal Server Error`

#### **GET** `/store/product/[id]`

GET endpoint

**Parâmetros:**
- `request: NextRequest`

**Respostas:**
- `application/json`
- `404 Not Found`
- `500 Internal Server Error`


### **STORES**

#### **GET** `/stores/[id]`

Usar service role key para contornar autenticação

**Parâmetros:**
- `request: NextRequest`

**Respostas:**
- `application/json`
- `400 Bad Request`
- `404 Not Found`
- `500 Internal Server Error`

#### **PUT** `/stores/[id]`

Adicionar campos calculados para compatibilidade

**Parâmetros:**
- `request: NextRequest`

**Respostas:**
- `application/json`
- `400 Bad Request`
- `404 Not Found`
- `500 Internal Server Error`

#### **DELETE** `/stores/[id]`

Adicionar campos calculados

**Parâmetros:**
- `request: NextRequest`

**Respostas:**
- `application/json`
- `400 Bad Request`
- `404 Not Found`
- `500 Internal Server Error`

#### **GET** `/stores`

GET - Listar lojas

**Parâmetros:**
- `request: NextRequest`

**Respostas:**
- `application/json`
- `400 Bad Request`
- `401 Unauthorized`
- `500 Internal Server Error`

#### **POST** `/stores`

POST - Criar loja

**Parâmetros:**
- `request: NextRequest`

**Respostas:**
- `application/json`
- `400 Bad Request`
- `401 Unauthorized`
- `500 Internal Server Error`


### **STRIPE**

#### **POST** `/stripe/create-payment-intent`

POST endpoint

**Parâmetros:**
- `request: NextRequest`

**Respostas:**
- `application/json`
- `200 OK`
- `400 Bad Request`
- `401 Unauthorized`
- `404 Not Found`
- `500 Internal Server Error`

#### **POST** `/stripe/webhook`

POST endpoint

**Parâmetros:**
- `request: NextRequest`

**Respostas:**
- `application/json`
- `400 Bad Request`
- `500 Internal Server Error`


### **TAGS**

#### **POST** `/tags`

POST endpoint

**Parâmetros:**
- `request: NextRequest`

**Respostas:**
- `application/json`
- `400 Bad Request`
- `401 Unauthorized`
- `403 Forbidden`
- `500 Internal Server Error`

#### **GET** `/tags`

GET endpoint

**Parâmetros:**
- Nenhum

**Respostas:**
- `application/json`
- `400 Bad Request`
- `401 Unauthorized`
- `403 Forbidden`
- `500 Internal Server Error`


### **TEMPLATES**

#### **GET** `/templates/[id]`

GET - Buscar template específico

**Parâmetros:**
- `request: NextRequest`

**Respostas:**
- `application/json`
- `400 Bad Request`
- `401 Unauthorized`
- `404 Not Found`
- `500 Internal Server Error`

#### **PUT** `/templates/[id]`

PUT - Atualizar template

**Parâmetros:**
- `request: NextRequest`

**Respostas:**
- `application/json`
- `400 Bad Request`
- `401 Unauthorized`
- `404 Not Found`
- `500 Internal Server Error`

#### **DELETE** `/templates/[id]`

DELETE - Excluir template

**Parâmetros:**
- `request: NextRequest`

**Respostas:**
- `application/json`
- `400 Bad Request`
- `401 Unauthorized`
- `404 Not Found`
- `500 Internal Server Error`

#### **GET** `/templates`

GET - Listar templates

**Parâmetros:**
- `request: NextRequest`

**Respostas:**
- `application/json`
- `400 Bad Request`
- `401 Unauthorized`
- `500 Internal Server Error`

#### **POST** `/templates`

POST - Criar template

**Parâmetros:**
- `request: NextRequest`

**Respostas:**
- `application/json`
- `400 Bad Request`
- `401 Unauthorized`
- `500 Internal Server Error`


### **TEST**

#### **GET** `/test/config`

GET endpoint

**Parâmetros:**
- Nenhum

**Respostas:**
- `application/json`
- `500 Internal Server Error`

#### **GET** `/test/database`

GET endpoint

**Parâmetros:**
- Nenhum

**Respostas:**
- `application/json`
- `500 Internal Server Error`

#### **GET** `/test/employees`

GET endpoint

**Parâmetros:**
- Nenhum

**Respostas:**
- `application/json`
- `500 Internal Server Error`

#### **GET** `/test/orders`

GET endpoint

**Parâmetros:**
- Nenhum

**Respostas:**
- `application/json`
- `500 Internal Server Error`

#### **GET** `/test/points`

GET endpoint

**Parâmetros:**
- Nenhum

**Respostas:**
- `application/json`
- `500 Internal Server Error`

#### **GET** `/test/products`

GET endpoint

**Parâmetros:**
- Nenhum

**Respostas:**
- `application/json`
- `500 Internal Server Error`


### **TEST-AUTH**

#### **GET** `/test-auth`

GET endpoint

**Parâmetros:**
- `request: NextRequest`

**Respostas:**
- `application/json`
- `401 Unauthorized`
- `500 Internal Server Error`


### **TEST-NOTIFICATION**

#### **POST** `/test-notification`

POST endpoint

**Parâmetros:**
- `request: NextRequest`

**Respostas:**
- `application/json`
- `401 Unauthorized`
- `500 Internal Server Error`


### **TINY**

#### **POST** `/tiny/nfe/export`

POST endpoint

**Parâmetros:**
- Nenhum

**Respostas:**
- `application/json`


### **UPLOAD**

#### **POST** `/upload`

Usar service role key para contornar RLS

**Parâmetros:**
- `request: NextRequest`

**Respostas:**
- `application/json`
- `400 Bad Request`
- `500 Internal Server Error`


### **USERS**

#### **GET** `/users/[id]`

GET - Buscar usuário específico

**Parâmetros:**
- `request: NextRequest`

**Respostas:**
- `application/json`
- `400 Bad Request`
- `401 Unauthorized`
- `404 Not Found`
- `500 Internal Server Error`

#### **PUT** `/users/[id]`

PUT - Atualizar usuário

**Parâmetros:**
- `request: NextRequest`

**Respostas:**
- `application/json`
- `400 Bad Request`
- `401 Unauthorized`
- `404 Not Found`
- `500 Internal Server Error`

#### **DELETE** `/users/[id]`

DELETE - Excluir usuário

**Parâmetros:**
- `request: NextRequest`

**Respostas:**
- `application/json`
- `400 Bad Request`
- `401 Unauthorized`
- `404 Not Found`
- `500 Internal Server Error`

#### **POST** `/users/[id]/tags`

POST endpoint

**Parâmetros:**
- `request: NextRequest`

**Respostas:**
- `application/json`
- `401 Unauthorized`
- `403 Forbidden`
- `500 Internal Server Error`

#### **POST** `/users`

POST endpoint

**Parâmetros:**
- Nenhum

**Respostas:**
- `application/json`
- `201 Created`
- `400 Bad Request`
- `403 Forbidden`
- `500 Internal Server Error`

#### **GET** `/users`

Rollback: deletar usuário criado

**Parâmetros:**
- Nenhum

**Respostas:**
- `application/json`
- `201 Created`
- `400 Bad Request`
- `403 Forbidden`
- `500 Internal Server Error`


### **WALLET**

#### **GET** `/wallet/balance`

GET endpoint

**Parâmetros:**
- `request: NextRequest`

**Respostas:**
- `application/json`
- `401 Unauthorized`
- `404 Not Found`
- `500 Internal Server Error`

#### **POST** `/wallet/credit`

POST endpoint

**Parâmetros:**
- `request: NextRequest`

**Respostas:**
- `application/json`
- `201 Created`
- `400 Bad Request`
- `401 Unauthorized`
- `403 Forbidden`
- `404 Not Found`
- `500 Internal Server Error`

#### **GET** `/wallet`

GET endpoint

**Parâmetros:**
- Nenhum

**Respostas:**
- `application/json`


### **WEBHOOKS**

#### **POST** `/webhooks/gamification/[providerKey]`

POST endpoint

**Parâmetros:**
- `request: NextRequest`

**Respostas:**
- `application/json`
- `200 OK`
- `400 Bad Request`
- `401 Unauthorized`
- `404 Not Found`
- `500 Internal Server Error`

#### **POST** `/webhooks/payment`

POST endpoint

**Parâmetros:**
- Nenhum

**Respostas:**
- `application/json`
- `400 Bad Request`

#### **GET** `/webhooks/payment`

Handle GET requests (for webhook verification)

**Parâmetros:**
- Nenhum

**Respostas:**
- `application/json`
- `400 Bad Request`


## 📊 **Estatísticas**

- **Total de rotas**: 137
- **Total de endpoints**: 203
- **Métodos HTTP**: DELETE, GET, PATCH, POST, PUT
- **Última atualização**: 2025-09-03T15:07:19.437Z

## 🔄 **Auto-Atualização**

Esta documentação é atualizada automaticamente a cada:
- Commit no repositório
- Execução de `npm run docs:gen`
- Deploy para produção

---

*Documentação gerada automaticamente pelo sistema Yoobe v3*