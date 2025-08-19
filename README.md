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
- [x] Dashboard com métricas de vendas
- [x] Sistema de navegação completo
- [x] Gestão de Produtos (CRUD básico)
- [x] Gestão de Pedidos (visualização)
- [x] Gestão de Estoque
- [x] Gestão de Usuários
- [x] Sistema de componentes UI (shadcn/ui)
- [x] Banco de dados PostgreSQL com schema completo
- [x] Configuração do ambiente de desenvolvimento

### 🔄 Em Desenvolvimento
- [ ] Autenticação e autorização
- [ ] Upload de imagens para produtos
- [ ] Sistema de pagamentos
- [ ] Relatórios avançados
- [ ] Sistema de campanhas
- [ ] Criação de kits
- [ ] Integração com APIs de frete

## 🗃️ Schema do Banco de Dados

### Principais Tabelas:
- **profiles** - Perfis de usuários
- **categories** - Categorias de produtos
- **products** - Produtos do marketplace
- **inventory** - Controle de estoque
- **orders** - Pedidos realizados
- **order_items** - Itens dos pedidos
- **campaigns** - Campanhas promocionais
- **kits** - Kits de produtos

### Produtos Exemplo (Pré-populados):
- Bonés Hapvida (Azul, Laranja, Preto) - R$ 448,00
- Camisetas (Branca, Preta) - R$ 49,90 - R$ 59,90
- Caneca Personalizada - R$ 29,90

## ⚙️ Como Executar Localmente

### Pré-requisitos
- Node.js 18+ (instalado via Homebrew)
- Docker Desktop (instalado via Homebrew)
- Homebrew (gerenciador de pacotes macOS)

### 1. Iniciar o Supabase
```bash
# Navegar para o diretório do projeto
cd /Users/genautech/Downloads/v3-main/yoobe-v3

# Adicionar Homebrew ao PATH
export PATH="/opt/homebrew/bin:$PATH"

# Iniciar Supabase local
supabase start
```

### 2. Iniciar a Aplicação Next.js
```bash
# Instalar dependências (se necessário)
npm install

# Iniciar servidor de desenvolvimento
npm run dev
```

### 3. Acessar as URLs
- **Aplicação:** http://localhost:3000
- **Supabase Studio:** http://127.0.0.1:54323

## 🔧 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev          # Iniciar servidor de desenvolvimento

# Build
npm run build        # Build para produção
npm run start        # Iniciar servidor de produção

# Banco de dados
npm run db:reset     # Resetar banco local
npm run db:generate  # Gerar tipos TypeScript
npm run db:migrate   # Aplicar migrações

# Supabase
npm run supabase:start  # Iniciar Supabase local
npm run supabase:stop   # Parar Supabase local
```

## 🔐 Variáveis de Ambiente

O arquivo `.env.local` foi criado automaticamente com as configurações locais:

```env
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:54322/postgres
```

## 📱 Próximos Passos

1. **Implementar Autenticação**
   - Sistema de login/cadastro
   - Proteção de rotas
   - Gerenciamento de sessões

2. **Conectar Dados Reais**
   - Substituir dados mock por queries Supabase
   - Implementar CRUD completo para todas as entidades

3. **Sistema de Upload**
   - Upload de imagens para produtos
   - Integração com Supabase Storage

4. **Pagamentos**
   - Integração com gateways de pagamento brasileiros
   - Sistema de carrinho de compras

5. **Deploy**
   - Configurar Supabase em produção
   - Deploy na Vercel ou similar

## 🆘 Suporte

Para iniciar rapidamente:

1. Certifique-se que o Docker está rodando
2. Execute `supabase start` para iniciar o banco
3. Execute `npm run dev` para iniciar a aplicação
4. Acesse http://localhost:3000

**Status Atual:** ✅ Ambiente completamente funcional para desenvolvimento!

