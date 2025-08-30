# Yoobe v3 - Plataforma de E-commerce/Marketplace

Plataforma brasileira para gestão de produtos promocionais e kits corporativos, desenvolvida com Next.js 14 e Supabase.

## 🚀 URLs de Acesso

### Ambiente de Desenvolvimento Local

#### **Aplicação Next.js:**
- **URL:** [http://localhost:3000](http://localhost:3000)
- **Status:** ✅ Funcionando

#### **Supabase Local (PostgreSQL):**
- **Studio URL:** [http://127.0.0.1:54323](http://127.0.0.1:54323)
- **API URL:** http://127.0.0.1:54321
- **Database URL:** postgresql://postgres:postgres@127.0.0.1:54322/postgres
- **Status:** ✅ Funcionando

#### **Outras URLs Supabase:**
- **GraphQL:** http://127.0.0.1:54321/graphql/v1
- **Storage S3:** http://127.0.0.1:54321/storage/v1/s3
- **Inbucket (Email testing):** http://127.0.0.1:54324

## 🏗️ Tecnologias Utilizadas

- **Frontend:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS + shadcn/ui
- **Backend:** Supabase (PostgreSQL + APIs)
- **Autenticação:** Supabase Auth
- **Storage:** Supabase Storage
- **Linguagem:** TypeScript
- **UI Components:** Lucide React (ícones)
- **Validação:** Zod
- **Data/Hora:** date-fns

## 📊 Funcionalidades Implementadas

### ✅ Concluídas
- [x] **Sistema de Autenticação Completo**
  - Login com email/senha
  - OTP e Magic Link
  - Redirecionamento inteligente
  - Logout funcional
  - Proteção de rotas

- [x] **Três Ambientes Funcionais**
  - **Admin Global** (`/admin/dashboard`) - Gerenciamento de todas as empresas
  - **Gestor da Loja** (`/gestor/dashboard`) - Gerenciamento da empresa específica
  - **Funcionário** (`/store/dashboard`) - Loja corporativa para resgates

- [x] **Admin Global - Funcionalidades Completas**
  - **Dashboard** - Visão geral com métricas e estatísticas
  - **Empresas** - Gerenciamento de empresas clientes
  - **Lojas** - Gerenciamento de lojas corporativas
  - **Usuários** - Gerenciamento de usuários do sistema
  - **Produtos** - Gerenciamento de produtos globais
  - **Pedidos** - Gerenciamento de todos os pedidos
  - **Relatórios** - Análise detalhada de performance
  - **Configurações** - Configurações globais do sistema

- [x] **Gestor da Loja - Funcionalidades Completas**
  - **Dashboard** - Visão geral da empresa com métricas específicas
  - **Funcionários** - CRUD completo de funcionários com sistema de pontos
  - **Produtos** - Gerenciamento de produtos da empresa com imagens placeholder
  - **Pedidos** - Acompanhamento e atualização de status dos pedidos
  - **Configurações** - Configurações da empresa, sistema de pontos e notificações

- [x] **Sistema de Navegação Completo**
  - Menu lateral responsivo
  - Breadcrumbs
  - Navegação entre ambientes
  - Logout integrado

- [x] **Interface Moderna e Responsiva**
  - Design system consistente
  - Componentes reutilizáveis
  - Layouts adaptativos
  - Ícones e badges informativos

- [x] **Banco de Dados PostgreSQL**
  - Schema completo implementado
  - Tabelas para multitenancy
  - Relacionamentos configurados
  - Migrações organizadas

### 🔄 Em Desenvolvimento
- [ ] **Integrações Externas**
  - Cubbo Logistics
  - Workvivo
  - Olist ERP
  - Gateways de pagamento

- [ ] **Funcionalidades Avançadas**
  - Upload de imagens
  - Sistema de pagamentos
  - Notificações em tempo real
  - Relatórios avançados

- [ ] **Gestor da Loja**
  - Funcionalidades específicas do gestor
  - Gerenciamento de funcionários
  - Campanhas e promoções

- [ ] **Loja Corporativa**
  - Carrinho de compras
  - Checkout completo
  - Rastreamento de pedidos

## 🗃️ Schema do Banco de Dados

### Principais Tabelas:
- **profiles** - Perfis de usuários
- **companies** - Empresas clientes
- **stores** - Lojas corporativas
- **categories** - Categorias de produtos
- **products** - Produtos do marketplace
- **inventory** - Controle de estoque
- **orders** - Pedidos dos clientes
- **order_items** - Itens dos pedidos
- **gift_shops** - Lojas de brindes
- **gift_products** - Produtos das lojas
- **gift_orders** - Pedidos de brindes

## 🎯 Funcionalidades do Admin Global

### 📊 Dashboard
- Métricas em tempo real
- Estatísticas de vendas
- Gráficos de performance
- Atividades recentes
- Visão geral do sistema

### 🏢 Gerenciamento de Empresas
- Lista de empresas clientes
- Filtros por status e nome
- Estatísticas por empresa
- Ações de edição/exclusão
- Status de ativação

### 🏪 Gerenciamento de Lojas
- Lojas corporativas por empresa
- Domínios personalizados
- Métricas de performance
- Status de operação
- Configurações de loja

### 👥 Gerenciamento de Usuários
- Usuários por empresa
- Filtros por role e status
- Pontos e pedidos
- Ações de gerenciamento
- Perfis detalhados

### 📦 Gerenciamento de Produtos
- Produtos globais
- Categorização
- Controle de estoque
- Avaliações e vendas
- Status de disponibilidade

### 🛒 Gerenciamento de Pedidos
- Todos os pedidos do sistema
- Filtros por status e empresa
- Detalhes de clientes
- Rastreamento de entrega
- Exportação de dados

### 📈 Relatórios
- Análise de receita
- Performance por período
- Top empresas e produtos
- Métricas de crescimento
- Gráficos interativos

### ⚙️ Configurações
- Configurações gerais
- Segurança e privacidade
- Notificações
- Backup e retenção
- Informações do sistema

## 🔐 Autenticação e Segurança

### Sistema de Login
- **Email/Senha:** Login tradicional
- **OTP:** One-Time Password
- **Magic Link:** Link mágico por email
- **Google OAuth:** Integração com Google (preparado)

### Controle de Acesso
- **Middleware:** Proteção de rotas
- **Roles:** Admin, Gestor, Funcionário
- **Redirecionamento:** Baseado em email/role
- **Sessões:** Persistentes e seguras

### Ambientes Separados
- **Admin Global:** `admin@yoobe.co`
- **Gestor da Loja:** `gestor@jointecnologia.com`
- **Funcionário:** `user@jointecnologia.com`

## 🎨 Interface e UX

### Design System
- **Cores:** Paleta azul (yoobe.co)
- **Componentes:** shadcn/ui
- **Ícones:** Lucide React
- **Tipografia:** Sistema consistente

### Responsividade
- **Mobile:** Otimizado para dispositivos móveis
- **Tablet:** Layout adaptativo
- **Desktop:** Interface completa
- **Navegação:** Menu lateral colapsável

### Feedback Visual
- **Loading States:** Indicadores de carregamento
- **Error Handling:** Tratamento de erros
- **Success Messages:** Confirmações de ações
- **Badges:** Status e indicadores

## 🚀 Como Executar

### Pré-requisitos
- Node.js 18+
- Docker
- Git

### Instalação
```bash
# Clone o repositório
git clone <repository-url>
cd yoobe-v3

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env.local

# Inicie o Supabase local
npx supabase start

# Execute as migrações
npx supabase db reset

# Inicie o servidor de desenvolvimento
npm run dev
```

### Acesso
- **Aplicação:** http://localhost:3000
- **Supabase Studio:** http://127.0.0.1:54323
- **Login Admin:** admin@yoobe.co / admin123

## 📝 Próximos Passos

### ✅ Concluído
1. **Conectar com banco real: Substituir dados mock por Supabase** ✅
2. **Implementar CRUD completo: Criar, editar, excluir funcionalidades** ✅
3. **Criar funcionalidades do Gestor: Ambiente específico para gestores** ✅

### 🚧 Em Desenvolvimento
4. **Adicionar upload de imagens: Integração com Supabase Storage**
5. **Implementar notificações: Sistema de alertas em tempo real**
6. **Completar loja corporativa: Carrinho, checkout, rastreamento**
4. **Completar loja corporativa**
5. **Implementar sistema de pagamentos**
6. **Adicionar testes automatizados**
7. **Otimizar performance**
8. **Deploy em produção**

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

