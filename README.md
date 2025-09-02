# 🚀 **YOOBE v3 - Plataforma Completa de Gestão Corporativa**

> **Sistema completo de orçamentos, replicação de produtos, RBAC e checkout com multi-tenancy**

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green?style=for-the-badge&logo=supabase)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.0-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)

## 🎯 **Visão Geral**

**YOOBE v3** é uma plataforma corporativa completa que implementa um **fluxo de orçamento/aprovação com liberação e replicação de produtos após pagamento**, sistema RBAC robusto, multi-tenancy e funcionalidades avançadas de checkout/redemption.

### ✨ **Funcionalidades Principais**

- 🔐 **Sistema RBAC Completo** (Super Admin, Admin Gestor, Gestor, Funcionário)
- 🏢 **Multi-tenancy** com empresas independentes
- 📋 **Fluxo de Orçamentos** com aprovação e pagamento
- 🔄 **Replicação Automática** de produtos após pagamento
- 🛒 **Checkout Avançado** com múltiplos métodos de pagamento
- 💳 **Sistema de Carteira** com pontos e transações
- 📍 **Gestão de Endereços** com validação e padrão único
- 👥 **Sistema de Convites** para novos usuários
- 📊 **Dashboards** com métricas em tempo real
- 🔍 **Auditoria Completa** de todas as ações
- 📱 **UI Responsiva** com Tailwind CSS + shadcn/ui

## 🏗️ **Arquitetura**

### **Frontend**
- **Next.js 14** (App Router)
- **TypeScript** com tipagem completa
- **Tailwind CSS** para estilização
- **shadcn/ui** para componentes
- **Lucide React** para ícones
- **i18n** preparado (pt-BR padrão)

### **Backend**
- **Route Handlers** em `/app/api/*`
- **Server Actions** para operações complexas
- **Zod** para validação de dados
- **Supabase Auth** para autenticação
- **RLS** (Row Level Security) ativo

### **Banco de Dados**
- **PostgreSQL** via Supabase
- **Migrations** estruturadas
- **Triggers** para regras de negócio
- **RPC Functions** para lógica complexa
- **Índices** para performance

## 🚀 **Quick Start**

### **1. Clone e Instale**
```bash
git clone https://github.com/seu-usuario/yoobe-v3.git
cd yoobe-v3
npm install
```

### **2. Configure Variáveis de Ambiente**
```bash
cp .env.example .env.local
```

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=sua_url_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima
SUPABASE_SERVICE_ROLE_KEY=sua_chave_service_role

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### **3. Execute as Migrações**
```bash
# Aplicar estrutura do banco
npm run db:migrate

# Criar dados iniciais
npm run db:seed
```

### **4. Inicie o Desenvolvimento**
```bash
npm run dev
```

Acesse: [http://localhost:3000](http://localhost:3000)

## 🗂️ **Estrutura do Projeto**

```
yoobe-v3/
├── app/                          # Next.js App Router
│   ├── (admin-global)/          # Área do Super Admin
│   │   ├── page.tsx            # Dashboard
│   │   ├── quotes/             # Gerenciar orçamentos
│   │   ├── replications/       # Monitorar replicações
│   │   ├── orders/             # Ver todos os pedidos
│   │   └── users/              # Gerenciar usuários
│   ├── (gestor)/               # Área do Gestor
│   │   ├── page.tsx            # Dashboard da empresa
│   │   ├── users/              # Gerenciar funcionários
│   │   ├── products/           # Produtos replicados
│   │   ├── quotes/             # Criar orçamentos
│   │   └── orders/             # Acompanhar pedidos
│   ├── (store)/                # Área do Funcionário
│   │   ├── page.tsx            # Loja de produtos
│   │   ├── checkout/           # Checkout completo
│   │   └── profile/            # Perfil e endereços
│   └── api/                    # API Routes
│       ├── rbac/               # Controle de acesso
│       ├── quotes/             # Orçamentos
│       ├── replications/       # Replicação
│       ├── users/              # Usuários
│       ├── invitations/        # Convites
│       ├── redemptions/        # Pedidos/Resgates
│       └── webhooks/           # Webhooks externos
├── components/                  # Componentes React
│   ├── ui/                     # shadcn/ui components
│   └── layout/                 # Componentes de layout
├── lib/                        # Utilitários e lógica
│   ├── auth.ts                 # Autenticação
│   ├── rbac.ts                 # Controle de acesso
│   ├── validation.ts           # Schemas Zod
│   ├── replication.ts          # Lógica de replicação
│   ├── payments.ts             # Processamento de pagamentos
│   ├── audit.ts                # Sistema de auditoria
│   └── events.ts               # Eventos e analytics
├── supabase/                   # Banco de dados
│   ├── migrations/             # Migrações SQL
│   └── functions/              # Funções RPC
└── types/                      # Tipos TypeScript
```

## 🔐 **Sistema RBAC**

### **Roles e Permissões**

| Role | Descrição | Permissões |
|------|-----------|------------|
| **Super Admin** | Administrador da plataforma | Acesso total a todas as empresas |
| **Admin Gestor** | Administrador de empresa | Gerencia gestores e configurações |
| **Gestor** | Gerente de equipe | Cria orçamentos, gerencia funcionários |
| **Funcionário** | Usuário final | Resgata produtos, gerencia perfil |

### **Fluxo de Acesso**
```
Super Admin → Admin Gestor → Gestor → Funcionário
     ↓              ↓           ↓         ↓
  Plataforma    Empresa    Equipe    Produtos
```

## 📋 **Fluxo de Orçamentos**

### **1. Criação**
- **Gestor** cria orçamento com produtos e quantidades
- Sistema calcula subtotal, desconto e total
- Status inicial: `draft`

### **2. Envio**
- **Gestor** envia para **Admin Global**
- Status muda para `sent`
- Notificação enviada para aprovação

### **3. Aprovação/Rejeição**
- **Admin Global** analisa e aprova/rejeita
- Status: `approved` ou `rejected`
- Se aprovado, aguarda pagamento

### **4. Pagamento**
- Sistema processa pagamento
- Status muda para `paid`
- **Replicação automática** é enfileirada

### **5. Replicação**
- Produtos são replicados para catálogo da empresa
- **Gestor** pode editar preços, pontos e imagens
- Funcionários podem resgatar produtos

## 🛒 **Sistema de Checkout**

### **Métodos de Pagamento**
- 💰 **Pontos** (debitando carteira)
- 💳 **Cartão de Crédito**
- 📱 **PIX**
- 🏦 **Cartão de Débito**
- 📄 **Boleto**
- ❤️ **Doação**

### **Fluxo de Checkout**
```
Carrinho → Endereço → Pagamento → Confirmação
    ↓         ↓          ↓           ↓
  Itens   Entrega    Método     Sucesso
```

## 🏢 **Multi-tenancy**

### **Estrutura**
- Cada empresa tem seu próprio **tenant**
- Usuários podem pertencer a múltiplas empresas
- Dados isolados por empresa via RLS
- Produtos replicados são específicos da empresa

### **Segurança**
- **RLS** ativo em todas as tabelas
- Políticas baseadas em `company_id`
- Acesso controlado por `user_company_roles`

## 📊 **Dashboards e Métricas**

### **Admin Global**
- Total de usuários e empresas
- Orçamentos pendentes e aprovados
- Replicações em andamento
- Receita da plataforma

### **Gestor**
- Funcionários da empresa
- Produtos disponíveis
- Orçamentos criados
- Pedidos dos funcionários

### **Funcionário**
- Saldo da carteira
- Histórico de resgates
- Endereços cadastrados
- Status dos pedidos

## 🔧 **Desenvolvimento**

### **Scripts Disponíveis**
```bash
# Desenvolvimento
npm run dev              # Inicia servidor de desenvolvimento
npm run build            # Build de produção
npm run start            # Inicia servidor de produção
npm run lint             # Executa ESLint
npm run type-check       # Verifica tipos TypeScript

# Banco de dados
npm run db:migrate       # Aplica migrações
npm run db:seed          # Cria dados iniciais
npm run db:reset         # Reseta banco de dados

# Testes
npm run test             # Executa testes unitários
npm run test:e2e         # Executa testes E2E
npm run test:coverage    # Gera relatório de cobertura
```

### **Estrutura de Commits**
```bash
# Exemplos de commits convencionais
feat: implementa sistema de orçamentos
fix: corrige validação de endereços
docs: atualiza documentação da API
refactor: reorganiza estrutura de componentes
test: adiciona testes para RBAC
```

## 🚀 **Deploy**

### **Vercel (Recomendado)**
```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### **Docker**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### **Variáveis de Produção**
```env
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://seu-dominio.com
SUPABASE_SERVICE_ROLE_KEY=sua_chave_producao
```

## 📈 **Monitoramento e Analytics**

### **Logs Estruturados**
- Todas as ações são logadas em `audit_logs`
- Rastreamento de eventos de negócio
- Métricas de performance e uso

### **Webhooks**
- Notificações para sistemas externos
- Integração com ERPs e CRMs
- Webhooks de pagamento e entrega

## 🔒 **Segurança**

### **Implementado**
- ✅ **RLS** em todas as tabelas
- ✅ **Validação Zod** em todas as APIs
- ✅ **RBAC** com verificação de permissões
- ✅ **Auditoria** de todas as ações
- ✅ **Sanitização** de inputs
- ✅ **Rate limiting** nas APIs

### **Recomendações**
- 🔐 Use HTTPS em produção
- 🔑 Rotacione chaves de API regularmente
- 📊 Monitore logs de auditoria
- 🧪 Execute testes de segurança

## 🤝 **Contribuição**

### **Como Contribuir**
1. Fork o projeto
2. Crie uma branch para sua feature
3. Implemente seguindo os padrões
4. Adicione testes
5. Abra um Pull Request

### **Padrões de Código**
- **TypeScript** com tipagem estrita
- **ESLint** + **Prettier** para formatação
- **Conventional Commits** para mensagens
- **Testes** para novas funcionalidades

## 📄 **Licença**

Este projeto está sob a licença **MIT**. Veja o arquivo [LICENSE](LICENSE) para detalhes.

## 🆘 **Suporte**

### **Documentação**
- [Guia de Usuário](docs/USER_GUIDE.md)
- [API Reference](docs/API_REFERENCE.md)
- [Deploy Guide](docs/DEPLOY_GUIDE.md)

### **Contato**
- **Issues:** [GitHub Issues](https://github.com/seu-usuario/yoobe-v3/issues)
- **Discord:** [Servidor da Comunidade](https://discord.gg/yoobe)
- **Email:** suporte@yoobe.com

---

## 🎉 **Status do Projeto**

**YOOBE v3 está em desenvolvimento ativo!**

- ✅ **Backend:** 100% Implementado
- ✅ **Frontend:** 100% Implementado
- ✅ **Banco de Dados:** 100% Implementado
- ✅ **Documentação:** 100% Atualizada
- 🚀 **Pronto para Deploy!**

**Versão atual:** `3.0.0`  
**Última atualização:** Janeiro 2025  
**Próxima versão:** `3.1.0` (Integrações avançadas)

