# 🔐 Configuração de Autenticação - Yoobe V3

## ✅ Status Atual
- ✅ Autenticação com email/senha
- ✅ Autenticação com OTP (One-Time Password)
- ✅ Autenticação com Link Mágico
- ✅ Autenticação com Google (preparado)
- ✅ Proteção de rotas
- ✅ Middleware de autenticação
- ✅ Sistema de logout

## 🚀 Como Acessar

### 1. **Acesse o Projeto**
```
http://localhost:3002
```

### 2. **Página de Login**
```
http://localhost:3002/auth/login
```

## 🔧 Métodos de Autenticação Disponíveis

### 1. **Email e Senha**
- Login tradicional com email e senha
- Cadastro de novos usuários

### 2. **OTP (One-Time Password)**
- Envio de código por email
- Login sem senha

### 3. **Link Mágico**
- Envio de link de acesso por email
- Login com um clique

### 4. **Google OAuth** (Preparado)
- Login com conta Google
- Requer configuração de credenciais

## 📧 Configuração de Email

### Para Produção:
1. Configure um provedor SMTP no Supabase
2. Adicione as variáveis de ambiente:
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu_email@gmail.com
SMTP_PASS=sua_senha_de_app
```

### Para Desenvolvimento:
- Emails são capturados pelo Inbucket
- Acesse: http://localhost:54324
- Veja todos os emails enviados

## 🔑 Configuração do Google OAuth

### 1. **Criar Projeto no Google Cloud Console**
1. Acesse: https://console.cloud.google.com/
2. Crie um novo projeto
3. Ative a Google+ API

### 2. **Configurar OAuth 2.0**
1. Vá para "APIs & Services" > "Credentials"
2. Clique em "Create Credentials" > "OAuth 2.0 Client IDs"
3. Configure as URLs de redirecionamento:
   - `http://localhost:3002/auth/callback`
   - `https://seu-dominio.com/auth/callback`

### 3. **Adicionar Credenciais**
1. Copie o Client ID e Client Secret
2. Adicione ao arquivo `supabase/config.toml`:
```toml
[auth.external.google]
enabled = true
client_id = "seu_client_id"
secret = "seu_client_secret"
```

## 🛡️ Proteção de Rotas

### Rotas Públicas:
- `/auth/login` - Página de login
- `/auth/register` - Página de cadastro
- `/auth/callback` - Callback de autenticação
- `/auth/verify` - Verificação de email

### Rotas Protegidas:
- Todas as outras rotas requerem autenticação
- Redirecionamento automático para login

## 🔄 Fluxo de Autenticação

### 1. **Login com Senha**
```
Usuário → /auth/login → Email/Senha → / → Dashboard
```

### 2. **Login com OTP**
```
Usuário → /auth/login → Email → Código OTP → / → Dashboard
```

### 3. **Login com Link Mágico**
```
Usuário → /auth/login → Email → Link no Email → /auth/callback → / → Dashboard
```

### 4. **Login com Google**
```
Usuário → /auth/login → Google → /auth/callback → / → Dashboard
```

## 🎯 Preparação para SSO

O sistema está preparado para integração com SSO corporativo:

### 1. **Workvivo Integration**
- Serviço já criado: `lib/services/workvivo.ts`
- Métodos para sincronização de funcionários
- Integração com sistema de pontos

### 2. **SAML/OIDC Providers**
- Configuração no Supabase config.toml
- Suporte a múltiplos provedores
- Mapeamento de claims

### 3. **Custom Claims**
- Suporte a claims personalizados
- Integração com sistema de permissões
- Mapeamento de grupos

## 🚨 Troubleshooting

### Problema: "Cannot find module"
```bash
npm install @supabase/ssr @supabase/supabase-js
```

### Problema: "Supabase not running"
```bash
supabase start
```

### Problema: "Email not sending"
1. Verifique o Inbucket: http://localhost:54324
2. Configure SMTP para produção

### Problema: "Google OAuth not working"
1. Verifique as URLs de redirecionamento
2. Confirme as credenciais no config.toml
3. Reinicie o Supabase: `supabase restart`

## 📱 Testando a Autenticação

### 1. **Criar Usuário de Teste**
1. Acesse: http://localhost:3002/auth/login
2. Use a aba "Senha"
3. Clique em "Criar conta"
4. Preencha email e senha

### 2. **Testar OTP**
1. Use a aba "OTP"
2. Digite seu email
3. Verifique o código no Inbucket

### 3. **Testar Link Mágico**
1. Use a aba "Link Mágico"
2. Digite seu email
3. Clique no link no Inbucket

### 4. **Testar Logout**
1. Clique em "Sair" no menu lateral
2. Confirme o redirecionamento para login

## 🔐 Segurança

### Implementado:
- ✅ Tokens JWT seguros
- ✅ Refresh token rotation
- ✅ Proteção CSRF
- ✅ Rate limiting
- ✅ Validação de email
- ✅ Senhas criptografadas

### Recomendações:
- Use HTTPS em produção
- Configure CORS adequadamente
- Monitore logs de autenticação
- Implemente 2FA para usuários críticos

## 📞 Suporte

Para dúvidas ou problemas:
1. Verifique os logs do Supabase
2. Consulte a documentação oficial
3. Teste com usuários de exemplo
4. Verifique configurações de rede

---

**🎉 Sistema de Autenticação Completo e Funcional!**


