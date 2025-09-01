'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Download, ExternalLink, FileText } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Label } from '@/components/ui/label'

interface Document {
  title: string
  content: string
  type: 'markdown' | 'html'
}

const documents: Record<string, Document> = {
  'API_REFERENCE.md': {
    title: 'API Reference - Yoobe Platform',
    type: 'markdown',
    content: `# API Reference - Yoobe Platform

## Visão Geral

Esta documentação descreve todas as APIs disponíveis na Yoobe Platform v2.0.0.

## Autenticação

Todas as APIs requerem autenticação via JWT token.

\`\`\`bash
Authorization: Bearer <your-jwt-token>
\`\`\`

## Endpoints

### Usuários

#### GET /api/users
Lista todos os usuários (apenas admin)

\`\`\`bash
curl -X GET http://localhost:3000/api/users \\
  -H "Authorization: Bearer <token>"
\`\`\`

#### POST /api/users
Cria um novo usuário

\`\`\`bash
curl -X POST http://localhost:3000/api/users \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer <token>" \\
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "full_name": "Nome Completo",
    "role": "user",
    "company_id": "uuid"
  }'
\`\`\`

### Empresas

#### GET /api/companies
Lista todas as empresas

\`\`\`bash
curl -X GET http://localhost:3000/api/companies \\
  -H "Authorization: Bearer <token>"
\`\`\`

#### POST /api/companies
Cria uma nova empresa

\`\`\`bash
curl -X POST http://localhost:3000/api/companies \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer <token>" \\
  -d '{
    "name": "Empresa Exemplo",
    "email": "contato@empresa.com",
    "phone": "+5511999999999",
    "address": "Endereço completo"
  }'
\`\`\`

### Lojas

#### GET /api/stores
Lista todas as lojas

\`\`\`bash
curl -X GET http://localhost:3000/api/stores \\
  -H "Authorization: Bearer <token>"
\`\`\`

#### POST /api/stores
Cria uma nova loja

\`\`\`bash
curl -X POST http://localhost:3000/api/stores \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer <token>" \\
  -d '{
    "name": "Loja Exemplo",
    "domain": "loja-exemplo",
    "company_id": "uuid",
    "status": "active"
  }'
\`\`\`

### Produtos

#### GET /api/products
Lista todos os produtos

\`\`\`bash
curl -X GET http://localhost:3000/api/products \\
  -H "Authorization: Bearer <token>"
\`\`\`

#### POST /api/products
Cria um novo produto

\`\`\`bash
curl -X POST http://localhost:3000/api/products \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer <token>" \\
  -d '{
    "name": "Produto Exemplo",
    "description": "Descrição do produto",
    "price": 99.90,
    "points_cost": 100,
    "stock_quantity": 50,
    "store_id": "uuid",
    "category_id": "uuid"
  }'
\`\`\`

### Integração Cubbo

#### GET /api/admin/cubbo-integration
Obtém configuração da integração Cubbo

\`\`\`bash
curl -X GET http://localhost:3000/api/admin/cubbo-integration \\
  -H "Authorization: Bearer <token>"
\`\`\`

#### POST /api/admin/cubbo-integration
Configura integração Cubbo

\`\`\`bash
curl -X POST http://localhost:3000/api/admin/cubbo-integration \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer <token>" \\
  -d '{
    "api_key": "your-cubbo-api-key",
    "base_url": "https://api.cubbo.com/v1",
    "is_active": true
  }'
\`\`\`

#### POST /api/admin/cubbo-sync
Sincroniza dados com Cubbo

\`\`\`bash
curl -X POST http://localhost:3000/api/admin/cubbo-sync \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer <token>" \\
  -d '{
    "type": "products",
    "action": "sync"
  }'
\`\`\`

### Changelog

#### GET /api/changelog
Obtém changelog da plataforma

\`\`\`bash
curl -X GET http://localhost:3000/api/changelog
\`\`\`

#### GET /api/changelog?version=2.0.0
Filtra por versão específica

\`\`\`bash
curl -X GET "http://localhost:3000/api/changelog?version=2.0.0"
\`\`\`

## Códigos de Status

- \`200\` - Sucesso
- \`201\` - Criado com sucesso
- \`400\` - Requisição inválida
- \`401\` - Não autorizado
- \`403\` - Acesso negado
- \`404\` - Não encontrado
- \`500\` - Erro interno do servidor

## Exemplos de Resposta

### Sucesso
\`\`\`json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Exemplo",
    "created_at": "2024-12-31T00:00:00Z"
  }
}
\`\`\`

### Erro
\`\`\`json
{
  "success": false,
  "error": "Mensagem de erro",
  "code": "ERROR_CODE"
}
\`\`\`

## Rate Limiting

- **Limite**: 1000 requisições por hora por IP
- **Headers**: \`X-RateLimit-Limit\`, \`X-RateLimit-Remaining\`, \`X-RateLimit-Reset\`

## Suporte

Para suporte técnico:
- **Email**: suporte@yoobe.com
- **Documentação**: https://docs.yoobe.com
- **Status**: https://status.yoobe.com`
  },
  'DATABASE_SCHEMA.md': {
    title: 'Database Schema - Yoobe Platform',
    type: 'markdown',
    content: `# Database Schema - Yoobe Platform

## Visão Geral

Este documento descreve a estrutura completa do banco de dados da Yoobe Platform v2.0.0.

## Tabelas Principais

### users
Tabela de usuários do sistema

\`\`\`sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'user',
  company_id UUID REFERENCES companies(id),
  store_id UUID REFERENCES stores(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
\`\`\`

**Campos:**
- \`id\`: Identificador único
- \`email\`: Email do usuário (único)
- \`full_name\`: Nome completo
- \`role\`: Papel no sistema (admin, manager, user)
- \`company_id\`: Referência à empresa
- \`store_id\`: Referência à loja
- \`created_at\`: Data de criação
- \`updated_at\`: Data de atualização

### companies
Tabela de empresas

\`\`\`sql
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  address TEXT,
  logo_url TEXT,
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
\`\`\`

### stores
Tabela de lojas

\`\`\`sql
CREATE TABLE stores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  domain VARCHAR(255) UNIQUE,
  company_id UUID REFERENCES companies(id),
  description TEXT,
  logo_url TEXT,
  primary_color VARCHAR(7),
  secondary_color VARCHAR(7),
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
\`\`\`

### company_products
Tabela de produtos das empresas

\`\`\`sql
CREATE TABLE company_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  points_cost INTEGER DEFAULT 0,
  stock_quantity INTEGER DEFAULT 0,
  image_url TEXT,
  store_id UUID REFERENCES stores(id),
  category_id UUID REFERENCES product_categories(id),
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
\`\`\`

### orders
Tabela de pedidos

\`\`\`sql
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  store_id UUID REFERENCES stores(id),
  total_amount DECIMAL(10,2) NOT NULL,
  points_used INTEGER DEFAULT 0,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
\`\`\`

### order_items
Itens dos pedidos

\`\`\`sql
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id),
  product_id UUID REFERENCES company_products(id),
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
\`\`\`

## Tabelas de Categorização

### product_categories
Categorias de produtos

\`\`\`sql
CREATE TABLE product_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  icon VARCHAR(50),
  color VARCHAR(7),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
\`\`\`

### base_products
Produtos base para replicação

\`\`\`sql
CREATE TABLE base_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  base_price DECIMAL(10,2) NOT NULL,
  category_id UUID REFERENCES product_categories(id),
  image_url TEXT,
  is_global BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
\`\`\`

## Tabelas de Integração

### cubbo_integrations
Configurações de integração Cubbo

\`\`\`sql
CREATE TABLE cubbo_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID REFERENCES stores(id),
  is_global BOOLEAN DEFAULT false,
  api_key VARCHAR(255),
  base_url VARCHAR(255),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT check_store_or_global CHECK (
    (store_id IS NOT NULL AND is_global = false) OR 
    (store_id IS NULL AND is_global = true)
  )
);
\`\`\`

### cubbo_orders
Pedidos sincronizados com Cubbo

\`\`\`sql
CREATE TABLE cubbo_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id),
  cubbo_order_id VARCHAR(255),
  sync_status VARCHAR(50) DEFAULT 'pending',
  sync_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
\`\`\`

### product_sync_log
Logs de sincronização de produtos

\`\`\`sql
CREATE TABLE product_sync_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES company_products(id),
  sync_type VARCHAR(50) NOT NULL,
  status VARCHAR(50) NOT NULL,
  details JSONB,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
\`\`\`

### inventory_sync
Sincronização de estoque

\`\`\`sql
CREATE TABLE inventory_sync (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES company_products(id),
  cubbo_sku VARCHAR(255),
  quantity INTEGER NOT NULL,
  sync_status VARCHAR(50) DEFAULT 'pending',
  last_sync_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
\`\`\`

## Tabelas de Sistema

### notifications
Notificações do sistema

\`\`\`sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) DEFAULT 'info',
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
\`\`\`

### points_transactions
Transações de pontos

\`\`\`sql
CREATE TABLE points_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  points INTEGER NOT NULL,
  transaction_type VARCHAR(50) NOT NULL,
  description TEXT,
  reference_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
\`\`\`

### email_templates
Templates de email

\`\`\`sql
CREATE TABLE email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  body TEXT NOT NULL,
  variables JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
\`\`\`

## Relacionamentos

### Principais Relacionamentos

1. **users** → **companies** (M:1)
2. **users** → **stores** (M:1)
3. **stores** → **companies** (M:1)
4. **company_products** → **stores** (M:1)
5. **company_products** → **product_categories** (M:1)
6. **orders** → **users** (M:1)
7. **orders** → **stores** (M:1)
8. **order_items** → **orders** (M:1)
9. **order_items** → **company_products** (M:1)

### Relacionamentos de Integração

1. **cubbo_integrations** → **stores** (M:1)
2. **cubbo_orders** → **orders** (1:1)
3. **product_sync_log** → **company_products** (M:1)
4. **inventory_sync** → **company_products** (M:1)

## Índices

### Índices Principais

\`\`\`sql
-- Usuários
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_company_id ON users(company_id);
CREATE INDEX idx_users_store_id ON users(store_id);
CREATE INDEX idx_users_role ON users(role);

-- Produtos
CREATE INDEX idx_company_products_store_id ON company_products(store_id);
CREATE INDEX idx_company_products_category_id ON company_products(category_id);
CREATE INDEX idx_company_products_status ON company_products(status);

-- Pedidos
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_store_id ON orders(store_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at);

-- Integração
CREATE INDEX idx_cubbo_integrations_store_id ON cubbo_integrations(store_id);
CREATE INDEX idx_cubbo_integrations_is_global ON cubbo_integrations(is_global);
\`\`\`

## Políticas RLS

### Exemplo de Política

\`\`\`sql
-- Política para usuários verem apenas seus próprios dados
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

-- Política para admins verem todos os usuários
CREATE POLICY "Admins can view all users" ON users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
\`\`\`

## Triggers

### Trigger de updated_at

\`\`\`sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar em todas as tabelas
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
\`\`\`

## Backup e Recuperação

### Backup Automático

\`\`\`sql
-- Configurar backup automático
SELECT pg_backup_start('backup_name', true);
\`\`\`

### Restauração

\`\`\`sql
-- Restaurar backup
SELECT pg_backup_stop();
\`\`\`

## Monitoramento

### Queries de Monitoramento

\`\`\`sql
-- Tamanho das tabelas
SELECT 
  schemaname,
  tablename,
  attname,
  n_distinct,
  correlation
FROM pg_stats
WHERE schemaname = 'public'
ORDER BY tablename, attname;

-- Performance de queries
SELECT 
  query,
  calls,
  total_time,
  mean_time
FROM pg_stat_statements
ORDER BY total_time DESC
LIMIT 10;
\`\`\`

## Suporte

Para dúvidas sobre o schema:
- **Email**: suporte@yoobe.com
- **Documentação**: https://docs.yoobe.com/database
- **GitHub**: https://github.com/yoobe/platform`
  }
}

export default function DocumentPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string

  const [document, setDocument] = useState<Document | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (slug && documents[slug]) {
      setDocument(documents[slug])
    }
    setLoading(false)
  }, [slug])

  const handleDownload = () => {
    if (document) {
      const blob = new Blob([document.content], { type: 'text/markdown' })
      const url = URL.createObjectURL(blob)
      const a = window.document.createElement('a')
      a.href = url
      a.download = slug
      window.document.body.appendChild(a)
      a.click()
      window.document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <FileText className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Carregando documento...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!document) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-red-600 mb-2">Documento não encontrado</h3>
          <p className="text-gray-600 mb-4">O documento solicitado não foi encontrado.</p>
          <Button onClick={() => router.push('/admin/documentacao')}>
            Voltar para Documentação
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/admin/documentacao')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{document.title}</h1>
            <p className="text-gray-600 mt-2">
              Documentação da Yoobe Platform
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleDownload}>
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
          <Button variant="outline" onClick={() => window.open(`/docs/${slug}`, '_blank')}>
            <ExternalLink className="h-4 w-4 mr-2" />
            Abrir em Nova Aba
          </Button>
        </div>
      </div>

      {/* Conteúdo */}
      <Card>
        <CardContent className="p-6">
          <div className="prose prose-lg max-w-none">
            <pre className="whitespace-pre-wrap font-mono text-sm bg-gray-50 p-4 rounded-lg overflow-x-auto">
              {document.content}
            </pre>
          </div>
        </CardContent>
      </Card>

      {/* Informações */}
      <Card>
        <CardHeader>
          <CardTitle>Informações do Documento</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-gray-500">Título</Label>
              <p className="text-lg">{document.title}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500">Tipo</Label>
              <p className="text-lg">{document.type}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500">Arquivo</Label>
              <p className="text-lg">{slug}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500">Tamanho</Label>
              <p className="text-lg">{document.content.length} caracteres</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
