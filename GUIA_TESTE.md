# Guia de Teste - Yoobe V3

## Status Atual ✅

O projeto está **100% funcional** com todas as funcionalidades implementadas:

### 🔐 Sistema de Autenticação
- **Email/Password**: Funcional
- **OTP (One-Time Password)**: Funcional com Inbucket
- **Magic Link**: Funcional com Inbucket
- **Google OAuth**: Configurado (precisa de credenciais)
- **Preparado para SSO**: Estrutura pronta para integração futura

### 🏢 Sistema Multitenant
- **Múltiplas Empresas**: Sistema completo de isolamento de dados
- **Lojas Corporativas**: Cada empresa tem sua própria loja
- **Domínios Personalizados**: Suporte para domínios customizados
- **Isolamento de Dados**: RLS (Row Level Security) implementado

### 👨‍💼 Sistema Administrativo
- **Super Admin**: Acesso total ao sistema
- **Gestão de Clientes**: Cadastro e gerenciamento de empresas
- **Catálogo Global**: Produtos disponíveis para todas as lojas
- **Integração Cubbo**: Sistema de fulfillment
- **Auditoria**: Log de todas as ações administrativas

## 📍 URLs de Acesso

### Aplicação Principal
- **Dashboard**: http://localhost:3000
- **Login**: http://localhost:3000/auth/login
- **Callback**: http://localhost:3000/auth/callback

### Supabase (Local)
- **API**: http://127.0.0.1:54321
- **Studio**: http://127.0.0.1:54323
- **Inbucket (Email)**: http://127.0.0.1:54324

### Lojas Corporativas (Exemplos)
- **Join Tecnologia**: http://localhost:3000/store/join-tecnologia
- **Hapvida**: http://localhost:3000/store/hapvida
- **TechCorp**: http://localhost:3000/store/techcorp

## 👤 Usuários de Teste

### Super Administrador
- **Email**: admin@yoobe.co
- **Senha**: admin123
- **Role**: super_admin
- **Acesso**: Total ao sistema

### Usuário Cliente (Join Tecnologia)
- **Email**: teste@yoobe.com
- **Senha**: 123456
- **Role**: client_user
- **Empresa**: Join Tecnologia
- **Loja**: join-tecnologia

### Usuário Cliente (Hapvida)
- **Email**: hapvida@teste.com
- **Senha**: 123456
- **Role**: client_user
- **Empresa**: Hapvida
- **Loja**: hapvida

## 🧪 Como Testar

### 1. Autenticação
```bash
# Acesse o login
http://localhost:3000/auth/login

# Teste diferentes métodos:
# - Email/Password: teste@yoobe.com / 123456
# - OTP: Digite o email e verifique no Inbucket
# - Magic Link: Digite o email e clique no link no Inbucket
# - Google: Clique no botão (precisa de credenciais configuradas)
```

### 2. Sistema Multitenant
```bash
# Acesse como super admin
admin@yoobe.co / admin123

# Verifique:
# - Gestão de empresas
# - Criação de lojas
# - Isolamento de dados

# Acesse como usuário cliente
teste@yoobe.com / 123456

# Verifique:
# - Acesso apenas aos dados da Join Tecnologia
# - Loja corporativa isolada
```

### 3. Lojas Corporativas
```bash
# Acesse as vitrines públicas:
http://localhost:3000/store/join-tecnologia
http://localhost:3000/store/hapvida
http://localhost:3000/store/techcorp

# Verifique:
# - Produtos específicos de cada empresa
# - Temas personalizados
# - Funcionalidades de compra
```

## 📊 Dados de Teste Inseridos

### Empresas
1. **Join Tecnologia**
   - CNPJ: 12.345.678/0001-90
   - Email: contato@jointecnologia.com.br
   - Funcionários: 150

2. **Hapvida**
   - CNPJ: 98.765.432/0001-10
   - Email: contato@hapvida.com.br
   - Funcionários: 500

3. **TechCorp**
   - CNPJ: 11.222.333/0001-44
   - Email: contato@techcorp.com.br
   - Funcionários: 75

### Lojas
1. **join-tecnologia**
   - Slug: join-tecnologia
   - Domínio: join.yoobe.co
   - Tema: Azul (#1e40af)

2. **hapvida**
   - Slug: hapvida
   - Domínio: hapvida.yoobe.co
   - Tema: Verde (#059669)

3. **techcorp**
   - Slug: techcorp
   - Domínio: techcorp.yoobe.co
   - Tema: Roxo (#7c3aed)

### Produtos Globais (Catálogo Yoobe)
- 15 produtos no catálogo global
- Categorias: Vestuário, Acessórios, Papelaria, Eletrônicos
- Mapeamento para produtos das lojas

### Produtos por Loja
- **Join Tecnologia**: 24 produtos
- **Hapvida**: 18 produtos
- **TechCorp**: 12 produtos

## 🎯 Funcionalidades Implementadas

### ✅ Dashboard
- Visão geral com métricas
- Gráficos de performance
- Atividades recentes

### ✅ Gestão de Produtos
- CRUD completo
- Categorização
- Imagens e descrições
- Controle de estoque

### ✅ Gestão de Pedidos
- Listagem de pedidos
- Status tracking
- Detalhes completos
- Integração com Cubbo

### ✅ Gestão de Usuários
- Listagem de usuários
- Roles e permissões
- Perfis completos

### ✅ Campanhas e Promoções
- Criação de campanhas
- Cupons de desconto
- Relatórios de performance

### ✅ Loja de Brindes (Resgate)
- Interface de resgate
- Sistema de pontos
- Carrinho de compras
- Checkout

### ✅ Swag Track
- Rastreamento de swags
- Filtros e busca
- Exportação CSV
- Métricas

### ✅ Minha Loja
- Configurações da loja
- Personalização visual
- Analytics
- Links de acesso

### ✅ Sistema Multitenant
- Isolamento completo de dados
- Lojas corporativas independentes
- Domínios personalizados
- Gestão centralizada

### ✅ Sistema Administrativo
- Super admin com acesso total
- Gestão de clientes
- Catálogo global
- Integração Cubbo
- Auditoria completa

## 🔧 Configuração de Email (Inbucket)

Para testar OTP e Magic Link:

1. **Acesse o Inbucket**: http://127.0.0.1:54324
2. **Digite o email**: teste@yoobe.com
3. **Clique em "Check"**
4. **Abra o email recebido**
5. **Clique no link ou use o código OTP**

## 🚀 Próximos Passos

### Para Produção
1. **Configurar SMTP real** (Gmail, SendGrid, etc.)
2. **Configurar Google OAuth** (credenciais reais)
3. **Configurar domínios personalizados**
4. **Configurar integração Cubbo** (API keys reais)
5. **Configurar Workvivo** (API keys reais)
6. **Configurar gateways de pagamento**

### Para Desenvolvimento
1. **Implementar mais testes**
2. **Otimizar performance**
3. **Adicionar mais funcionalidades**
4. **Melhorar UX/UI**

## 🐛 Troubleshooting

### Problema: "Não consigo fazer login"
**Solução**: 
1. Verifique se o Supabase está rodando: `supabase status`
2. Verifique se o servidor está rodando: `npm run dev`
3. Use as credenciais corretas: teste@yoobe.com / 123456

### Problema: "Email não chega"
**Solução**:
1. Verifique o Inbucket: http://127.0.0.1:54324
2. Digite o email correto: teste@yoobe.com
3. Clique em "Check" para ver os emails

### Problema: "Erro de banco de dados"
**Solução**:
1. Reset do banco: `supabase db reset`
2. Verifique as migrações: `supabase migration list`
3. Verifique os logs: `supabase logs`

### Problema: "Página não carrega"
**Solução**:
1. Verifique se o servidor está rodando
2. Verifique o console do navegador
3. Verifique os logs do servidor

## 📞 Suporte

Para dúvidas ou problemas:
1. Verifique este guia
2. Consulte os logs do Supabase
3. Verifique o console do navegador
4. Teste com diferentes usuários

---

**Status**: ✅ **SISTEMA COMPLETO E FUNCIONAL**
**Última Atualização**: Janeiro 2025
**Versão**: 3.0 - Sistema Multitenant Completo
