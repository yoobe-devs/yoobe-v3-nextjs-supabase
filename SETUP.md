# Setup Yoobe Platform v2.0.0

## 🚀 Configuração Rápida

### Pré-requisitos
- Node.js 18+
- npm ou yarn
- Supabase CLI

### Passos

1. **Clone o repositório**
   ```bash
   git clone <repository-url>
   cd yoobe-v3
   ```

2. **Execute o setup automático**
   ```bash
   node setup-v2.0.0.js
   ```

3. **Configure as variáveis de ambiente**
   - Copie `.env.local` e configure suas credenciais
   - Configure Cubbo API Key para produção

4. **Inicie o servidor de desenvolvimento**
   ```bash
   npm run dev
   ```

5. **Acesse a plataforma**
   - Admin: http://localhost:3002/test-login-simple
   - Gestor: http://localhost:3002/gestor/dashboard
   - Loja: http://localhost:3002/store/join-tecnologia

## 🔧 Configurações

### Integrações Disponíveis
- **Cubbo**: Fulfillment global (configurar em /admin/integracoes)
- **Gamificação**: Workvivo, Applause, Human
- **Automação**: Zapier, Floui, Make
- **ERP/CRM**: SAP, Salesforce, Oracle

### Usuários de Teste
- **Admin**: admin@yoobe.com / admin123
- **Gestor**: gestor@join.com / gestor123
- **Funcionário**: funcionario@join.com / func123

## 📚 Documentação
- Visão Geral: /docs/PLATFORM_OVERVIEW.md
- Changelog: /CHANGELOG.md
- APIs: Documentação nas rotas /api/*

## 🆘 Suporte
Para dúvidas ou problemas, consulte a documentação ou entre em contato.
