# Estrutura da Plataforma Yoobe v3 - Documentação Completa

## 📋 Visão Geral

A Yoobe v3 é uma plataforma multitenant para gestão de produtos promocionais e kits corporativos, desenvolvida com Next.js 14 e Supabase. A plataforma suporta três ambientes distintos: Admin Global, Gestor da Loja e Funcionário.

## 🏗️ Arquitetura do Sistema

### **Tecnologias Utilizadas**
- **Frontend:** Next.js 14 (App Router)
- **Backend:** Supabase (PostgreSQL + APIs)
- **Autenticação:** Supabase Auth
- **Storage:** Supabase Storage
- **Styling:** Tailwind CSS + shadcn/ui
- **Linguagem:** TypeScript
- **UI Components:** Lucide React

### **Estrutura de Ambientes**

```
┌─────────────────────────────────────────────────────────────┐
│                    YOOBE V3 PLATFORM                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │   ADMIN GLOBAL  │  │  GESTOR DA LOJA │  │  FUNCIONÁRIO │ │
│  │                 │  │                 │  │              │ │
│  │ • Dashboard     │  │ • Dashboard     │  │ • Loja       │ │
│  │ • Empresas      │  │ • Funcionários  │  │ • Catálogo   │ │
│  │ • Lojas         │  │ • Produtos      │  │ • Carrinho   │ │
│  │ • Usuários      │  │ • Pedidos       │  │ • Pedidos    │ │
│  │ • Produtos      │  │ • Configurações │  │ • Perfil     │ │
│  │ • Pedidos       │  │                 │  │              │ │
│  │ • Relatórios    │  │                 │  │              │ │
│  │ • Configurações │  │                 │  │              │ │
│  └─────────────────┘  └─────────────────┘  └──────────────┘ │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## 🗄️ Estrutura do Banco de Dados

### **Tabelas Principais**

#### **1. Autenticação e Usuários**
```sql
-- Extensão do Supabase Auth
auth.users (gerenciado pelo Supabase)

-- Perfis de usuários
profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role user_role DEFAULT 'user',
  avatar_url TEXT,
  company_id UUID REFERENCES companies(id),
  store_id UUID REFERENCES stores(id),
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
)
```

#### **2. Sistema Multitenant**
```sql
-- Empresas (Tenants)
companies (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  corporate_name TEXT,
  cnpj TEXT UNIQUE,
  email TEXT,
  phone TEXT,
  address JSONB,
  logo_url TEXT,
  website TEXT,
  industry TEXT,
  employee_count INTEGER,
  is_active BOOLEAN DEFAULT true
)

-- Lojas das empresas
stores (
  id UUID PRIMARY KEY,
  company_id UUID REFERENCES companies(id),
  name TEXT NOT NULL,
  slug TEXT UNIQUE,
  domain TEXT,
  description TEXT,
  theme JSONB,
  settings JSONB,
  is_active BOOLEAN DEFAULT true,
  is_public BOOLEAN DEFAULT false
)
```

#### **3. Sistema de Produtos**
```sql
-- Categorias globais
categories (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  store_id UUID REFERENCES stores(id),
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
)

-- Produtos das lojas
products (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  category_id UUID REFERENCES categories(id),
  store_id UUID REFERENCES stores(id),
  image_url TEXT,
  status TEXT DEFAULT 'active',
  sku TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
)

-- Produtos globais (catálogo.yoobe.co)
global_products (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  subcategory TEXT,
  brand TEXT,
  sku TEXT UNIQUE,
  base_price DECIMAL(10,2),
  cost_price DECIMAL(10,2),
  weight DECIMAL(5,2),
  dimensions JSONB,
  colors TEXT[],
  sizes TEXT[],
  materials TEXT[],
  tags TEXT[],
  image_urls TEXT[],
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  created_by UUID REFERENCES internal_admins(id)
)

-- Mapeamento entre produtos globais e produtos das lojas
product_mappings (
  id UUID PRIMARY KEY,
  global_product_id UUID REFERENCES global_products(id),
  store_product_id UUID REFERENCES products(id),
  store_id UUID REFERENCES stores(id),
  custom_price DECIMAL(10,2),
  custom_name TEXT,
  custom_description TEXT,
  is_active BOOLEAN DEFAULT true
)
```

#### **4. Sistema de Estoque**
```sql
-- Inventário
inventory (
  id UUID PRIMARY KEY,
  product_id UUID REFERENCES products(id),
  quantity INTEGER DEFAULT 0,
  min_quantity INTEGER DEFAULT 0,
  max_quantity INTEGER,
  location TEXT,
  updated_at TIMESTAMP WITH TIME ZONE
)
```

#### **5. Sistema de Pedidos**
```sql
-- Pedidos
orders (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  store_id UUID REFERENCES stores(id),
  order_number TEXT UNIQUE,
  status order_status DEFAULT 'pending',
  total_amount DECIMAL(10,2) DEFAULT 0,
  shipping_address JSONB,
  billing_address JSONB,
  payment_method payment_method,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
)

-- Itens dos pedidos
order_items (
  id UUID PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE
)
```

#### **6. Sistema do Gestor (Específico por Empresa)**
```sql
-- Funcionários da empresa
employees (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL,
  department TEXT NOT NULL,
  status user_role DEFAULT 'user',
  points_balance INTEGER DEFAULT 0,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE,
  last_login TIMESTAMP WITH TIME ZONE
)

-- Produtos específicos da empresa
company_products (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  points_cost INTEGER DEFAULT 0,
  category TEXT NOT NULL,
  status TEXT DEFAULT 'active',
  stock INTEGER DEFAULT 0,
  image_url TEXT,
  company_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
)

-- Pedidos dos funcionários
company_orders (
  id UUID PRIMARY KEY,
  order_number TEXT UNIQUE NOT NULL,
  employee_id UUID REFERENCES employees(id),
  employee_name TEXT NOT NULL,
  employee_email TEXT NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  points_used INTEGER DEFAULT 0,
  status order_status DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
)

-- Itens dos pedidos da empresa
company_order_items (
  id UUID PRIMARY KEY,
  order_id UUID REFERENCES company_orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES company_products(id),
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE
)

-- Configurações da empresa
company_config (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  logo_url TEXT,
  primary_color TEXT DEFAULT '#1e40af',
  points_system_enabled BOOLEAN DEFAULT true,
  max_points_per_month INTEGER DEFAULT 1000,
  auto_approve_orders BOOLEAN DEFAULT false,
  notification_email TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
)
```

#### **7. Sistema de Promoções e Cupons**
```sql
-- Promoções
promotions (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  discount_type TEXT NOT NULL,
  discount_value DECIMAL(10,2),
  min_order_value DECIMAL(10,2),
  max_discount DECIMAL(10,2),
  start_date DATE,
  end_date DATE,
  is_active BOOLEAN DEFAULT true,
  usage_limit INTEGER,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
)

-- Cupons
coupons (
  id UUID PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  promotion_id UUID REFERENCES promotions(id),
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE
)
```

#### **8. Sistema de Configurações**
```sql
-- Configurações das lojas
store_configs_new (
  id UUID PRIMARY KEY,
  store_id UUID REFERENCES stores(id),
  config_key TEXT NOT NULL,
  config_value JSONB,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
)

-- Configurações da plataforma
platform_configs (
  id UUID PRIMARY KEY,
  config_key TEXT UNIQUE NOT NULL,
  config_value JSONB,
  description TEXT,
  is_public BOOLEAN DEFAULT false
)
```

#### **9. Sistema de Integrações**
```sql
-- Integração Cubbo
cubbo_integrations (
  id UUID PRIMARY KEY,
  store_id UUID REFERENCES stores(id),
  cubbo_api_key TEXT,
  cubbo_warehouse_id TEXT,
  cubbo_company_id TEXT,
  is_active BOOLEAN DEFAULT true,
  sync_frequency TEXT DEFAULT 'daily'
)

-- Pedidos Cubbo
cubbo_orders (
  id UUID PRIMARY KEY,
  order_id UUID REFERENCES orders(id),
  cubbo_order_id TEXT,
  cubbo_tracking_code TEXT,
  cubbo_status TEXT,
  cubbo_status_details JSONB
)
```

#### **10. Sistema de Administração**
```sql
-- Administradores internos
internal_admins (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL,
  permissions JSONB,
  is_active BOOLEAN DEFAULT true
)
```

## 🔐 Sistema de Autenticação e Autorização

### **Tipos de Usuário (user_role)**
```sql
CREATE TYPE user_role AS ENUM (
  'super_admin',    -- Administrador global da plataforma
  'client_admin',   -- Gestor da empresa (admin da loja)
  'client_user'     -- Funcionário da empresa
);
```

### **Fluxo de Autenticação**
1. **Login:** Email/senha, OTP ou Magic Link
2. **Redirecionamento:** Baseado no email do usuário
3. **Middleware:** Proteção de rotas por ambiente
4. **Sessão:** Gerenciada pelo Supabase Auth

### **Mapeamento de Emails para Ambientes**
- `admin@yoobe.co` → Admin Global
- `gestor@jointecnologia.com` → Gestor da Loja
- `user@jointecnologia.com` → Funcionário

## 📁 Estrutura de Arquivos

### **Frontend (Next.js App Router)**
```
app/
├── (protected)/           # Rotas protegidas
├── admin/                 # Admin Global
│   ├── dashboard/
│   ├── empresas/
│   ├── lojas/
│   ├── usuarios/
│   ├── produtos/
│   ├── pedidos/
│   ├── relatorios/
│   └── configuracoes/
├── gestor/                # Gestor da Loja
│   ├── dashboard/
│   ├── funcionarios/
│   ├── produtos/
│   ├── pedidos/
│   └── configuracoes/
├── store/                 # Funcionário
│   ├── dashboard/
│   ├── catalog/
│   ├── cart/
│   ├── profile/
│   └── orders/
├── auth/                  # Autenticação
│   ├── login/
│   ├── register/
│   ├── callback/
│   └── verify/
└── choose-environment/    # Seleção de ambiente

components/
├── ui/                    # Componentes base
├── layout/                # Layouts
├── auth/                  # Componentes de auth
└── admin/                 # Componentes específicos

lib/
├── supabase.ts           # Cliente Supabase
├── auth.ts               # Utilitários de auth
├── utils.ts              # Utilitários gerais
├── queries/              # Queries do banco
│   ├── admin.ts
│   ├── gestor.ts
│   ├── products.ts
│   ├── orders.ts
│   └── inventory.ts
└── services/             # Serviços externos
    ├── cubbo.ts
    ├── payment-gateway.ts
    └── workvivo.ts

hooks/
├── useAuth.ts
├── useProducts.ts
├── useOrders.ts
├── useInventory.ts
└── useGiftProducts.ts
```

### **Backend (Supabase)**
```
supabase/
├── config.toml           # Configuração do Supabase
├── migrations/           # Migrações do banco
│   ├── 20241201000001_initial_schema.sql
│   ├── 20250401000000_loja_brindes_sso.sql
│   ├── 20250401010000_storage_public_bucket.sql
│   ├── 20250401020000_resgate_system.sql
│   ├── 20250401030000_multitenant_system.sql
│   ├── 20250401040000_admin_system.sql
│   ├── 20250401050000_admin_policies.sql
│   └── 20250401060000_gestor_tables.sql
└── seed.sql              # Dados de exemplo
```

## 🔄 Fluxos de Dados

### **1. Admin Global**
```
Usuário → Login → Admin Dashboard → Gerenciar Empresas/Lojas/Produtos
```

### **2. Gestor da Loja**
```
Usuário → Login → Gestor Dashboard → Gerenciar Funcionários/Produtos/Pedidos
```

### **3. Funcionário**
```
Usuário → Login → Store Dashboard → Navegar Catálogo → Fazer Pedidos
```

## 🎯 Funcionalidades Implementadas

### **✅ Admin Global**
- [x] Dashboard com métricas globais
- [x] Gerenciamento de empresas
- [x] Gerenciamento de lojas
- [x] Gerenciamento de usuários
- [x] Gerenciamento de produtos globais
- [x] Gerenciamento de pedidos
- [x] Relatórios e análises
- [x] Configurações da plataforma

### **✅ Gestor da Loja**
- [x] Dashboard específico da empresa
- [x] Gerenciamento de funcionários
- [x] Gerenciamento de produtos da empresa
- [x] Acompanhamento de pedidos
- [x] Configurações da empresa
- [x] Sistema de pontos

### **✅ Funcionário**
- [x] Dashboard pessoal
- [x] Catálogo de produtos
- [x] Carrinho de compras
- [x] Histórico de pedidos
- [x] Perfil do usuário

## 🚧 Funcionalidades Pendentes

### **🔄 Em Desenvolvimento**
- [ ] Upload de imagens com Supabase Storage
- [ ] Sistema de notificações em tempo real
- [ ] Integração completa com Cubbo
- [ ] Sistema de pagamentos
- [ ] Relatórios avançados

### **📋 Planejadas**
- [ ] Integração com Workvivo
- [ ] Sistema de campanhas
- [ ] API pública para integrações
- [ ] Mobile app
- [ ] Analytics avançado

## 🔧 Configurações e Variáveis de Ambiente

### **Arquivo .env.local**
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# URLs
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_ADMIN_URL=http://localhost:3000/admin
NEXT_PUBLIC_STORE_URL=http://localhost:3000/store

# Integrações
CUBBO_API_KEY=your_cubbo_key
WORKVIVO_API_KEY=your_workvivo_key
```

## 📊 Métricas e Monitoramento

### **Métricas Disponíveis**
- Total de empresas
- Total de lojas
- Total de usuários
- Total de produtos
- Total de pedidos
- Receita total
- Performance por período

### **Logs e Debugging**
- Middleware logs para autenticação
- Console logs para desenvolvimento
- Error tracking (preparado)

## 🎨 Design System

### **Cores**
- **Primária:** #1e40af (Azul Yoobe)
- **Secundária:** #3b82f6
- **Acento:** #60a5fa
- **Sucesso:** #10b981
- **Aviso:** #f59e0b
- **Erro:** #ef4444

### **Componentes**
- shadcn/ui como base
- Lucide React para ícones
- Tailwind CSS para estilização
- Componentes customizados para casos específicos

## 🔒 Segurança

### **Row Level Security (RLS)**
- Políticas implementadas para todas as tabelas
- Isolamento de dados por empresa
- Controle de acesso baseado em roles

### **Autenticação**
- Supabase Auth
- Sessões seguras
- Middleware de proteção de rotas

### **Validação**
- TypeScript para type safety
- Validação de dados no frontend e backend
- Sanitização de inputs

## 📈 Escalabilidade

### **Arquitetura Preparada Para**
- Múltiplas empresas (multitenant)
- Múltiplas lojas por empresa
- Sistema de pontos por empresa
- Integrações externas
- API pública
- Mobile apps

### **Performance**
- Lazy loading de componentes
- Otimização de imagens
- Caching de dados
- Índices no banco de dados

## 🚀 Deploy e Infraestrutura

### **Desenvolvimento Local**
```bash
# Instalação
npm install

# Supabase local
npx supabase start

# Migrações
npx supabase db reset

# Desenvolvimento
npm run dev
```

### **Produção**
- Vercel para frontend
- Supabase Cloud para backend
- CDN para assets
- Monitoramento com Vercel Analytics

---

## 📝 Notas para Planejamento

### **Considerações para Multitenant**
1. **Isolamento de Dados:** Cada empresa tem seus próprios dados
2. **Configurações Personalizadas:** Cada empresa pode ter configurações específicas
3. **Branding:** Cada loja pode ter seu próprio tema e branding
4. **Funcionalidades:** Diferentes empresas podem ter diferentes funcionalidades habilitadas

### **Próximos Passos Recomendados**
1. Implementar upload de imagens
2. Completar sistema de notificações
3. Implementar integrações externas
4. Criar API pública
5. Desenvolver mobile app

### **Pontos de Atenção**
1. **Performance:** Monitorar performance com múltiplas empresas
2. **Segurança:** Reforçar isolamento de dados
3. **Backup:** Implementar backup automático
4. **Monitoramento:** Implementar logs e alertas
5. **Documentação:** Manter documentação atualizada
