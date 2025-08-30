# Google OAuth Setup Guide

## 1. Configurar Google Cloud Console

### 1.1 Acessar Google Cloud Console
1. Vá para [Google Cloud Console](https://console.cloud.google.com/)
2. Faça login com sua conta Google
3. Crie um novo projeto ou selecione um existente

### 1.2 Habilitar Google+ API
1. No menu lateral, vá para "APIs & Services" > "Library"
2. Procure por "Google+ API" ou "Google Identity"
3. Clique em "Enable"

### 1.3 Criar Credenciais OAuth 2.0
1. Vá para "APIs & Services" > "Credentials"
2. Clique em "Create Credentials" > "OAuth client ID"
3. Selecione "Web application"
4. Configure:
   - **Name**: Yoobe OAuth Client
   - **Authorized JavaScript origins**:
     ```
     http://localhost:3000
     http://127.0.0.1:3000
     ```
   - **Authorized redirect URIs**:
     ```
     http://localhost:3000/auth/callback
     http://127.0.0.1:3000/auth/callback
     ```

### 1.4 Obter Credenciais
Após criar, você receberá:
- **Client ID**: `123456789-abcdefghijklmnop.apps.googleusercontent.com`
- **Client Secret**: `GOCSPX-abcdefghijklmnopqrstuvwxyz`

## 2. Configurar Supabase

### 2.1 Acessar Supabase Dashboard
1. Vá para [Supabase Dashboard](https://supabase.com/dashboard)
2. Selecione seu projeto
3. Vá para "Authentication" > "Providers"

### 2.2 Configurar Google Provider
1. Encontre "Google" na lista de providers
2. Clique em "Enable"
3. Configure:
   - **Client ID**: Cole o Client ID do Google
   - **Client Secret**: Cole o Client Secret do Google
   - **Redirect URL**: `http://localhost:3000/auth/callback`

### 2.3 Configurar URLs Permitidas
Em "Authentication" > "URL Configuration":
- **Site URL**: `http://localhost:3000`
- **Redirect URLs**:
  ```
  http://localhost:3000/auth/callback
  http://localhost:3000/choose-environment
  http://localhost:3000/admin/dashboard
  http://localhost:3000/gestor/dashboard
  http://localhost:3000/store/dashboard
  ```

## 3. Configurar Variáveis de Ambiente

### 3.1 Atualizar .env.local
```bash
# Google OAuth
NEXT_PUBLIC_GOOGLE_CLIENT_ID=123456789-abcdefghijklmnop.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abcdefghijklmnopqrstuvwxyz

# Supabase (já configurado)
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 3.2 Reiniciar Servidor
```bash
npm run dev
```

## 4. Testar Configuração

### 4.1 Acessar Página de Teste
```
http://localhost:3000/test-login
```

### 4.2 Testar Google OAuth
1. Clique em "Sign in with Google"
2. Você será redirecionado para o Google
3. Faça login com sua conta Google
4. Autorize o acesso
5. Você será redirecionado de volta

### 4.3 Verificar Logs
Abra o console do navegador (F12) para ver logs detalhados.

## 5. Solução de Problemas

### 5.1 Erro "redirect_uri_mismatch"
- Verifique se as URLs no Google Cloud Console estão corretas
- Certifique-se de que não há espaços extras

### 5.2 Erro "invalid_client"
- Verifique se o Client ID e Secret estão corretos
- Certifique-se de que as credenciais estão no .env.local

### 5.3 Erro "access_denied"
- Verifique se a API está habilitada no Google Cloud Console
- Certifique-se de que o projeto está ativo

### 5.4 Erro "popup_closed_by_user"
- Isso é normal se o usuário fechar a janela de popup
- Tente novamente

## 6. Produção

Para produção, adicione suas URLs de produção:
- **Authorized JavaScript origins**:
  ```
  https://seu-dominio.com
  ```
- **Authorized redirect URIs**:
  ```
  https://seu-dominio.com/auth/callback
  ```

## 7. Comandos Úteis

### 7.1 Verificar Configuração
```bash
# Verificar se o Supabase está rodando
npx supabase status

# Verificar variáveis de ambiente
cat .env.local | grep GOOGLE
```

### 7.2 Reiniciar Serviços
```bash
# Reiniciar Supabase
npx supabase stop
npx supabase start

# Reiniciar Next.js
npm run dev
```

## 8. URLs Importantes

- **Google Cloud Console**: https://console.cloud.google.com/
- **Supabase Dashboard**: https://supabase.com/dashboard
- **Página de Teste**: http://localhost:3000/test-login
- **Inbucket (emails)**: http://localhost:54324


