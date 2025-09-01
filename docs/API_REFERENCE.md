# API Reference - Yoobe Platform

## Visão Geral

Esta documentação descreve todas as APIs disponíveis na Yoobe Platform v2.0.0.

## Autenticação

Todas as APIs requerem autenticação via JWT token.

```bash
Authorization: Bearer <your-jwt-token>
```

## Endpoints

### Usuários

#### GET /api/users
Lista todos os usuários (apenas admin)

```bash
curl -X GET http://localhost:3000/api/users \
  -H "Authorization: Bearer <token>"
```

#### POST /api/users
Cria um novo usuário

```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "full_name": "Nome Completo",
    "role": "user",
    "company_id": "uuid"
  }'
```

### Empresas

#### GET /api/companies
Lista todas as empresas

```bash
curl -X GET http://localhost:3000/api/companies \
  -H "Authorization: Bearer <token>"
```

#### POST /api/companies
Cria uma nova empresa

```bash
curl -X POST http://localhost:3000/api/companies \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "name": "Empresa Exemplo",
    "email": "contato@empresa.com",
    "phone": "+5511999999999",
    "address": "Endereço completo"
  }'
```

### Lojas

#### GET /api/stores
Lista todas as lojas

```bash
curl -X GET http://localhost:3000/api/stores \
  -H "Authorization: Bearer <token>"
```

#### POST /api/stores
Cria uma nova loja

```bash
curl -X POST http://localhost:3000/api/stores \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "name": "Loja Exemplo",
    "domain": "loja-exemplo",
    "company_id": "uuid",
    "status": "active"
  }'
```

### Produtos

#### GET /api/products
Lista todos os produtos

```bash
curl -X GET http://localhost:3000/api/products \
  -H "Authorization: Bearer <token>"
```

#### POST /api/products
Cria um novo produto

```bash
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "name": "Produto Exemplo",
    "description": "Descrição do produto",
    "price": 99.90,
    "points_cost": 100,
    "stock_quantity": 50,
    "store_id": "uuid",
    "category_id": "uuid"
  }'
```

### Integração Cubbo

#### GET /api/admin/cubbo-integration
Obtém configuração da integração Cubbo

```bash
curl -X GET http://localhost:3000/api/admin/cubbo-integration \
  -H "Authorization: Bearer <token>"
```

### Catálogo Base (Base Products)

#### GET /api/base-products
Lista produtos-base

#### POST /api/base-products
Cria produto-base (admin)

#### GET /api/base-products/{id}
Detalhe do produto-base

#### PUT /api/base-products/{id}
Atualiza produto-base

#### DELETE /api/base-products/{id}
Remove produto-base

#### Bulk Pricing Tiers
- GET /api/base-products/{id}/tiers
- POST /api/base-products/{id}/tiers
  - body: { min_qty: number, unit_price?: number, discount_pct?: number }
- DELETE /api/base-products/{id}/tiers?tierId={tierId}

### Produtos do Cliente (Client Products)

- GET /api/clients/{clientId}/products
- POST /api/clients/{clientId}/products
- GET /api/clients/{clientId}/products/{id}/price?qty={Q}
- POST /api/clients/{clientId}/replicate-product/{baseProductId}
  - body: { margin_pct?: number, rounding_rule?: 'none' | 'ceil-0.50' | 'ceil-1.00', copy_images?: boolean }

### EAN
- POST /api/ean/issue → { ean_13 }
- POST /api/ean/assign → { client_product_id, ean_13 }

### Orçamentos

- POST /api/clients/{clientId}/orcamentos
  - { title, description?, gestor_notes?, items: [{ client_product_id, quantity, unit_price }], attachments?: [{ file_name, file_url, file_size?, mime_type? }] }
- GET /api/admin/orcamentos
- POST /api/admin/orcamentos/{id}/approve

### Importação / Scraping
- POST /api/scraping/import-catalog { page?, limit?, category?, importAllCategories? }

### Stripe
- POST /api/stripe/create-payment-intent (guarded quando env ausentes)
- POST /api/stripe/webhook (guarded quando env ausentes)

#### POST /api/admin/cubbo-integration
Configura integração Cubbo

```bash
curl -X POST http://localhost:3000/api/admin/cubbo-integration \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "api_key": "your-cubbo-api-key",
    "base_url": "https://api.cubbo.com/v1",
    "is_active": true
  }'
```

#### POST /api/admin/cubbo-sync
Sincroniza dados com Cubbo

```bash
curl -X POST http://localhost:3000/api/admin/cubbo-sync \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "type": "products",
    "action": "sync"
  }'
```

### Changelog

#### GET /api/changelog
Obtém changelog da plataforma

```bash
curl -X GET http://localhost:3000/api/changelog
```

#### GET /api/changelog?version=2.0.0
Filtra por versão específica

```bash
curl -X GET "http://localhost:3000/api/changelog?version=2.0.0"
```

## Códigos de Status

- `200` - Sucesso
- `201` - Criado com sucesso
- `400` - Requisição inválida
- `401` - Não autorizado
- `403` - Acesso negado
- `404` - Não encontrado
- `500` - Erro interno do servidor

## Exemplos de Resposta

### Sucesso
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Exemplo",
    "created_at": "2024-12-31T00:00:00Z"
  }
}
```

### Erro
```json
{
  "success": false,
  "error": "Mensagem de erro",
  "code": "ERROR_CODE"
}
```

## Rate Limiting

- **Limite**: 1000 requisições por hora por IP
- **Headers**: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`

## Suporte

Para suporte técnico:
- **Email**: suporte@yoobe.com
- **Documentação**: https://docs.yoobe.com
- **Status**: https://status.yoobe.com
