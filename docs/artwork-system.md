# Sistema de Artes e Customização - Yoobe v3

## Visão Geral

O sistema de artes e customização da Yoobe v3 permite o upload, gestão e vinculação de artes a orçamentos, com funcionalidades completas de customização de produtos, timeline de acompanhamento e ordens de produção.

## Arquitetura

### Tabelas do Banco de Dados

#### 1. `artworks`

Armazena as artes enviadas pelos usuários.

```sql
CREATE TABLE artworks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES companies(id),
  uploader_id uuid NOT NULL,
  name text NOT NULL,
  file_url text NOT NULL,
  mime_type text NOT NULL,
  size_bytes bigint NOT NULL,
  hash_sha256 text,
  preview_url text,
  notes text,
  created_at timestamptz DEFAULT now()
);
```

#### 2. `budget_item_artworks`

Vincula artes a orçamentos e itens específicos.

```sql
CREATE TABLE budget_item_artworks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  budget_id uuid NOT NULL REFERENCES budgets(id) ON DELETE CASCADE,
  budget_item_id uuid REFERENCES budget_items(id) ON DELETE CASCADE,
  artwork_id uuid NOT NULL REFERENCES artworks(id) ON DELETE CASCADE,
  scope text NOT NULL DEFAULT 'item',
  placement text,
  color_refs text[],
  notes text,
  created_at timestamptz DEFAULT now()
);
```

#### 3. `budget_item_customizations`

Especificações de customização por item.

```sql
CREATE TABLE budget_item_customizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  budget_id uuid NOT NULL REFERENCES budgets(id) ON DELETE CASCADE,
  budget_item_id uuid NOT NULL REFERENCES budget_items(id) ON DELETE CASCADE,
  method text,
  placements text[],
  colors text[],
  size_mm jsonb,
  notes text,
  files jsonb DEFAULT '[]',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

#### 4. `budget_tracking_events`

Timeline de acompanhamento do orçamento.

```sql
CREATE TABLE budget_tracking_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  budget_id uuid NOT NULL REFERENCES budgets(id) ON DELETE CASCADE,
  status text NOT NULL,
  title text NOT NULL,
  description text,
  actor_id uuid NOT NULL,
  meta jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);
```

#### 5. `production_orders`

Ordens de produção pós-aprovação.

```sql
CREATE TABLE production_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  budget_id uuid NOT NULL REFERENCES budgets(id) ON DELETE CASCADE,
  company_id uuid NOT NULL REFERENCES companies(id),
  po_number text,
  status text DEFAULT 'planned',
  est_start_at timestamptz,
  est_finish_at timestamptz,
  logistics jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

### Storage

#### Bucket `artworks`

- **Configuração**: Privado, 50MB por arquivo
- **Formatos aceitos**: JPEG, PNG, SVG, PDF, AI, EPS, ZIP
- **Estrutura**: `artworks/{company_id}/{timestamp}_{filename}`

## APIs

### 1. Gestão de Artes

#### `GET /api/artworks`

Lista artes da empresa do usuário.

**Parâmetros de Query:**

- `company_id` (opcional): ID da empresa
- `q` (opcional): Termo de busca
- `page` (opcional): Página (padrão: 1)
- `limit` (opcional): Limite por página (padrão: 20, máx: 100)

**Resposta:**

```json
{
  "success": true,
  "data": {
    "artworks": [
      {
        "id": "uuid",
        "name": "arte.pdf",
        "file_url": "artworks/company/123_arte.pdf",
        "mime_type": "application/pdf",
        "size_bytes": 1024000,
        "preview_url": "https://...",
        "notes": "Arte para produto X",
        "created_at": "2024-01-01T00:00:00Z",
        "companies": {
          "id": "uuid",
          "name": "Empresa"
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 1,
      "totalPages": 1
    }
  }
}
```

#### `POST /api/artworks`

Cria registro de upload e retorna signed URL.

**Body:**

```json
{
  "company_id": "uuid",
  "budget_id": "uuid (opcional)",
  "budget_item_id": "uuid (opcional)",
  "filename": "arte.pdf",
  "mime_type": "application/pdf",
  "size_bytes": 1024000
}
```

**Resposta:**

```json
{
  "success": true,
  "data": {
    "artwork_id": "uuid",
    "signed_url": "https://...",
    "path": "artworks/company/123_arte.pdf",
    "expires_at": "2024-01-01T01:00:00Z"
  }
}
```

#### `GET /api/artworks/{id}`

Busca arte específica com URL de download.

#### `PUT /api/artworks/{id}`

Atualiza metadados da arte.

#### `DELETE /api/artworks/{id}`

Remove arte e arquivo do storage.

#### `POST /api/artworks/{id}/finalize`

Finaliza upload e gera preview.

### 2. Vinculação de Artes

#### `GET /api/budgets/{id}/artworks`

Lista artes vinculadas ao orçamento.

#### `POST /api/budgets/{id}/artworks`

Vincula arte ao orçamento.

**Body:**

```json
{
  "artwork_id": "uuid",
  "placement": "front_center",
  "color_refs": ["PMS 186C", "Preto"],
  "notes": "Arte para frente central"
}
```

#### `GET /api/budgets/{id}/items/{itemId}/artworks`

Lista artes vinculadas ao item.

#### `POST /api/budgets/{id}/items/{itemId}/artworks`

Vincula arte ao item específico.

### 3. Customização

#### `GET /api/budgets/{id}/items/{itemId}/customization`

Busca customização do item.

#### `POST /api/budgets/{id}/items/{itemId}/customization`

Cria customização do item.

**Body:**

```json
{
  "method": "silkscreen",
  "placements": ["front_center", "back_center"],
  "colors": ["PMS 186C", "Preto"],
  "size_mm": {
    "width": 50,
    "height": 30
  },
  "notes": "Serigrafia com sangria de 3mm",
  "files": [
    {
      "file_url": "artworks/company/123_arte.pdf",
      "mime_type": "application/pdf"
    }
  ]
}
```

#### `PATCH /api/budgets/{id}/items/{itemId}/customization`

Atualiza customização do item.

### 4. Tracking

#### `GET /api/budgets/{id}/tracking`

Lista eventos de tracking do orçamento.

#### `POST /api/budgets/{id}/tracking`

Cria evento de tracking (apenas admins).

**Body:**

```json
{
  "status": "design_review",
  "title": "Artes em Revisão",
  "description": "Artes enviadas estão sendo analisadas",
  "meta": {
    "reviewer": "admin@yoobe.co",
    "estimated_time": "2 dias úteis"
  }
}
```

### 5. Produção

#### `GET /api/budgets/{id}/production-order`

Busca ordem de produção do orçamento.

#### `POST /api/budgets/{id}/production-order`

Cria ordem de produção (apenas admins).

**Body:**

```json
{
  "po_number": "PO-2024-001",
  "est_start_at": "2024-01-15T09:00:00Z",
  "est_finish_at": "2024-01-22T17:00:00Z",
  "logistics": {
    "carrier": "Correios",
    "tracking_code": "BR123456789",
    "notes": "Entrega prevista para 5 dias úteis"
  }
}
```

#### `GET /api/production-orders/{id}`

Busca ordem de produção específica.

#### `PATCH /api/production-orders/{id}`

Atualiza ordem de produção (apenas admins).

## Componentes UI

### 1. `ArtworkUploader`

Componente para upload de artes com drag & drop.

**Props:**

- `companyId`: ID da empresa
- `budgetId` (opcional): ID do orçamento
- `budgetItemId` (opcional): ID do item
- `onUploadComplete`: Callback quando upload é concluído
- `onUploadError`: Callback em caso de erro
- `maxFiles`: Máximo de arquivos (padrão: 10)

**Funcionalidades:**

- Drag & drop de arquivos
- Validação de formato e tamanho
- Preview de imagens
- Progress bar durante upload
- Geração de signed URLs
- Finalização automática

### 2. `CustomizationForm`

Formulário para especificar customização de itens.

**Props:**

- `budgetId`: ID do orçamento
- `itemId`: ID do item
- `initialData` (opcional): Dados iniciais
- `onSave`: Callback ao salvar
- `onCancel`: Callback ao cancelar
- `readOnly` (opcional): Modo somente leitura

**Funcionalidades:**

- Seleção de método (serigrafia, bordado, UV, laser, etc.)
- Posicionamento múltiplo
- Seleção de cores (comuns + personalizadas)
- Dimensões em mm
- Observações
- Validação de dados

### 3. `BudgetTimeline`

Timeline de acompanhamento do orçamento.

**Props:**

- `budgetId`: ID do orçamento

**Funcionalidades:**

- Lista cronológica de eventos
- Status com ícones e cores
- Informações do usuário que criou o evento
- Metadados (PO, tracking, etc.)
- Atualização em tempo real

### 4. `ProductionOrderCard`

Card para gestão de ordens de produção.

**Props:**

- `budgetId`: ID do orçamento

**Funcionalidades:**

- Visualização de dados da ordem
- Edição inline de status e datas
- Informações de logística
- Histórico de alterações
- Integração com timeline

### 5. `ArtworkList`

Lista de artes com filtros e ações.

**Props:**

- `budgetId` (opcional): ID do orçamento
- `itemId` (opcional): ID do item
- `onSelect`: Callback ao selecionar arte
- `onDelete`: Callback ao deletar
- `showActions`: Mostrar ações (padrão: true)

**Funcionalidades:**

- Lista paginada de artes
- Busca por nome/notas
- Preview de imagens
- Download de arquivos
- Seleção múltipla
- Informações de vinculação

## Fluxo de Trabalho

### 1. Upload de Artes

1. Usuário seleciona arquivos no `ArtworkUploader`
2. Sistema valida formato e tamanho
3. Cria registro na tabela `artworks`
4. Gera signed URL para upload
5. Usuário faz upload para Supabase Storage
6. Sistema finaliza upload e gera preview

### 2. Vinculação a Orçamento

1. Usuário seleciona arte na lista
2. Especifica posicionamento e cores
3. Sistema cria vínculo em `budget_item_artworks`
4. Arte fica disponível no orçamento

### 3. Customização de Item

1. Usuário acessa item do orçamento
2. Preenche formulário de customização
3. Sistema salva em `budget_item_customizations`
4. Especificações ficam disponíveis para produção

### 4. Acompanhamento

1. Admin cria eventos de tracking
2. Sistema registra em `budget_tracking_events`
3. Timeline é atualizada automaticamente
4. Cliente acompanha progresso

### 5. Produção

1. Orçamento é aprovado
2. Admin cria ordem de produção
3. Sistema registra em `production_orders`
4. Timeline é atualizada com evento de produção
5. Admin atualiza status conforme progresso

## Segurança

### RLS Policies

Todas as tabelas têm políticas RLS configuradas:

- **`artworks`**: Usuários só acessam artes da própria empresa
- **`budget_item_artworks`**: Acesso baseado no orçamento
- **`budget_item_customizations`**: Acesso baseado no orçamento
- **`budget_tracking_events`**: Acesso baseado no orçamento
- **`production_orders`**: Acesso baseado no orçamento

### Storage Policies

Bucket `artworks` tem políticas que:

- Permitem upload apenas para usuários autenticados
- Restringem acesso por empresa
- Validam tipos MIME permitidos

### Autorização

- **Gestores**: Podem gerenciar artes da própria empresa
- **Admins**: Podem criar eventos de tracking e ordens de produção
- **Superadmins**: Acesso total ao sistema

## Validações

### Upload de Arquivos

- Tamanho máximo: 50MB
- Formatos aceitos: JPEG, PNG, SVG, PDF, AI, EPS, ZIP
- Validação de MIME type
- Verificação de duplicatas (opcional)

### Customização

- Método obrigatório
- Pelo menos um posicionamento
- Dimensões positivas
- Cores válidas

### Tracking

- Status válido
- Título obrigatório
- Apenas admins podem criar eventos

## Monitoramento

### Logs de Auditoria

Todos os eventos importantes são registrados em `audit_logs`:

- Criação de artes
- Vinculação a orçamentos
- Customizações
- Eventos de tracking
- Ordens de produção

### Métricas

- Número de artes por empresa
- Tempo médio de processamento
- Taxa de aprovação de artes
- Status de ordens de produção

## Troubleshooting

### Problemas Comuns

1. **Upload falha**: Verificar tamanho e formato do arquivo
2. **RLS bloqueia acesso**: Verificar se usuário tem acesso à empresa
3. **Preview não gera**: Verificar se arquivo foi finalizado
4. **Tracking não aparece**: Verificar se usuário é admin

### Logs

- Console do navegador para erros de frontend
- Logs do servidor para erros de API
- Tabela `audit_logs` para auditoria

## Roadmap

### Próximas Funcionalidades

- [ ] Compressão automática de imagens
- [ ] Geração de previews em múltiplos tamanhos
- [ ] Integração com serviços de impressão
- [ ] Notificações em tempo real
- [ ] API de webhooks para integrações
- [ ] Dashboard de métricas avançadas

