# 🚀 Guia de Deploy - Yoobe Platform

## 📋 Índice
- [Visão Geral](#visão-geral)
- [Requisitos](#requisitos)
- [Deploy Local](#deploy-local)
- [Deploy em Produção](#deploy-em-produção)
- [Docker](#docker)
- [CI/CD](#cicd)
- [Monitoramento](#monitoramento)
- [Troubleshooting](#troubleshooting)

---

## 🎯 Visão Geral

Este guia fornece instruções completas para fazer o deploy da Yoobe Platform em diferentes ambientes, desde desenvolvimento local até produção.

### 🎯 Ambientes Suportados

| Ambiente | Descrição | URL |
|----------|-----------|-----|
| **Local** | Desenvolvimento | http://localhost:3001 |
| **Staging** | Testes | https://staging.yoobe.com |
| **Produção** | Live | https://yoobe.com |

---

## ⚙️ Requisitos

### 📋 Requisitos Mínimos

```bash
# Node.js
node >= 18.0.0
npm >= 8.0.0

# Banco de Dados
PostgreSQL >= 14.0
Supabase CLI >= 1.0.0

# Sistema
RAM: 4GB mínimo
CPU: 2 cores mínimo
Storage: 10GB mínimo
```

### 🔧 Dependências

```json
{
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=8.0.0"
  },
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.0.0",
    "typescript": "^5.0.0",
    "@supabase/supabase-js": "^2.0.0"
  }
}
```

---

## 🏠 Deploy Local

### 1. Configuração Inicial

```bash
# Clonar o repositório
git clone https://github.com/yoobe/platform.git
cd platform

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env.local
```

### 2. Configuração do Supabase

```bash
# Instalar Supabase CLI
npm install -g supabase

# Iniciar Supabase local
supabase start

# Aplicar migrações
supabase db reset

# Criar dados de teste
node create-test-data.js
```

### 3. Configuração das Variáveis

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Cubbo Integration (opcional para desenvolvimento)
CUBBO_API_KEY=your_cubbo_api_key_here
CUBBO_BASE_URL=https://api.cubbo.com/v1

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# JWT Secret
JWT_SECRET=your_jwt_secret_here

# Environment
NODE_ENV=development
```

### 4. Executar a Aplicação

```bash
# Desenvolvimento
npm run dev

# Build para produção local
npm run build
npm start
```

### 5. Verificar Deploy

```bash
# Testar endpoints
curl http://localhost:3001/api/health

# Verificar banco
supabase db diff

# Testar autenticação
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@yoobe.com", "password": "admin123"}'
```

---

## 🌐 Deploy em Produção

### 1. Preparação do Servidor

```bash
# Atualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Instalar PM2
sudo npm install -g pm2

# Instalar Nginx
sudo apt install nginx -y

# Instalar Certbot (SSL)
sudo apt install certbot python3-certbot-nginx -y
```

### 2. Configuração do Nginx

```nginx
# /etc/nginx/sites-available/yoobe
server {
    listen 80;
    server_name yoobe.com www.yoobe.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Configuração para uploads
    client_max_body_size 10M;
}
```

### 3. Configuração SSL

```bash
# Ativar site
sudo ln -s /etc/nginx/sites-available/yoobe /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Obter certificado SSL
sudo certbot --nginx -d yoobe.com -d www.yoobe.com
```

### 4. Deploy da Aplicação

```bash
# Criar usuário para a aplicação
sudo useradd -r -s /bin/false yoobe

# Criar diretório da aplicação
sudo mkdir -p /var/www/yoobe
sudo chown yoobe:yoobe /var/www/yoobe

# Clonar repositório
cd /var/www/yoobe
sudo -u yoobe git clone https://github.com/yoobe/platform.git .

# Instalar dependências
sudo -u yoobe npm install

# Configurar variáveis de ambiente
sudo -u yoobe cp .env.example .env.local
sudo nano .env.local
```

### 5. Configuração PM2

```bash
# Criar arquivo de configuração PM2
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'yoobe-platform',
    script: 'npm',
    args: 'start',
    cwd: '/var/www/yoobe',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    error_file: '/var/log/yoobe/err.log',
    out_file: '/var/log/yoobe/out.log',
    log_file: '/var/log/yoobe/combined.log',
    time: true
  }]
}
EOF

# Criar diretório de logs
sudo mkdir -p /var/log/yoobe
sudo chown yoobe:yoobe /var/log/yoobe

# Iniciar aplicação
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 6. Configuração do Supabase

```bash
# Configurar Supabase em produção
supabase link --project-ref your-project-ref

# Aplicar migrações
supabase db push

# Configurar RLS
supabase db reset
```

---

## 🐳 Docker

### 1. Dockerfile

```dockerfile
# Dockerfile
FROM node:18-alpine AS base

# Instalar dependências
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copiar arquivos de dependências
COPY package.json package-lock.json* ./
RUN npm ci --only=production

# Build da aplicação
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build
RUN npm run build

# Produção
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

# Criar usuário não-root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copiar arquivos
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3001

ENV PORT 3001
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

### 2. Docker Compose

```yaml
# docker-compose.yml
version: '3.8'

services:
  yoobe-platform:
    build: .
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}
      - NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY}
      - SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY}
    volumes:
      - ./uploads:/app/uploads
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - yoobe-platform
    restart: unless-stopped
```

### 3. Deploy com Docker

```bash
# Build da imagem
docker build -t yoobe-platform .

# Executar container
docker run -d \
  --name yoobe-platform \
  -p 3001:3001 \
  --env-file .env.local \
  yoobe-platform

# Com Docker Compose
docker-compose up -d
```

---

## 🔄 CI/CD

### 1. GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run tests
      run: npm test
    
    - name: Build application
      run: npm run build
      env:
        NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
        NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY }}
    
    - name: Deploy to server
      uses: appleboy/ssh-action@v0.1.5
      with:
        host: ${{ secrets.HOST }}
        username: ${{ secrets.USERNAME }}
        key: ${{ secrets.KEY }}
        script: |
          cd /var/www/yoobe
          git pull origin main
          npm install
          npm run build
          pm2 restart yoobe-platform
```

### 2. Vercel (Alternativa)

```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Configurar variáveis de ambiente
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
```

---

## 📊 Monitoramento

### 1. PM2 Monitoring

```bash
# Monitorar aplicação
pm2 monit

# Logs em tempo real
pm2 logs yoobe-platform

# Status da aplicação
pm2 status

# Métricas
pm2 show yoobe-platform
```

### 2. Nginx Monitoring

```bash
# Status do Nginx
sudo systemctl status nginx

# Logs de acesso
sudo tail -f /var/log/nginx/access.log

# Logs de erro
sudo tail -f /var/log/nginx/error.log

# Configuração de teste
sudo nginx -t
```

### 3. Health Checks

```bash
# Endpoint de saúde
curl http://localhost:3001/api/health

# Verificar banco de dados
curl http://localhost:3001/api/health/db

# Verificar integrações
curl http://localhost:3001/api/health/integrations
```

### 4. Alertas

```bash
# Script de monitoramento
#!/bin/bash
# /usr/local/bin/yoobe-monitor.sh

HEALTH_URL="http://localhost:3001/api/health"
ADMIN_EMAIL="admin@yoobe.com"

# Verificar saúde da aplicação
if ! curl -f -s $HEALTH_URL > /dev/null; then
    echo "Yoobe Platform está fora do ar!" | mail -s "Alerta: Yoobe Platform Down" $ADMIN_EMAIL
    pm2 restart yoobe-platform
fi

# Verificar uso de memória
MEMORY_USAGE=$(pm2 show yoobe-platform | grep "memory" | awk '{print $4}' | sed 's/MB//')
if [ $MEMORY_USAGE -gt 1000 ]; then
    echo "Uso de memória alto: ${MEMORY_USAGE}MB" | mail -s "Alerta: Alto uso de memória" $ADMIN_EMAIL
fi
```

---

## 🔧 Troubleshooting

### Problemas Comuns

#### 1. Aplicação não inicia

```bash
# Verificar logs
pm2 logs yoobe-platform

# Verificar portas
sudo netstat -tlnp | grep :3001

# Verificar variáveis de ambiente
pm2 env yoobe-platform

# Reiniciar aplicação
pm2 restart yoobe-platform
```

#### 2. Erro de banco de dados

```bash
# Verificar conexão Supabase
supabase status

# Verificar migrações
supabase db diff

# Reset do banco (cuidado!)
supabase db reset
```

#### 3. Problemas de SSL

```bash
# Renovar certificado
sudo certbot renew

# Verificar certificado
sudo certbot certificates

# Testar configuração Nginx
sudo nginx -t
```

#### 4. Problemas de performance

```bash
# Verificar uso de recursos
htop

# Verificar logs de erro
pm2 logs yoobe-platform --err

# Otimizar Node.js
export NODE_OPTIONS="--max-old-space-size=4096"
```

### Logs Importantes

```bash
# Logs da aplicação
tail -f /var/log/yoobe/combined.log

# Logs do Nginx
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log

# Logs do sistema
journalctl -u nginx -f
journalctl -u pm2-yoobe -f
```

---

## 📞 Suporte

### Contatos

- **Email**: suporte@yoobe.com
- **Documentação**: https://docs.yoobe.com/deploy
- **Status**: https://status.yoobe.com

### Recursos Adicionais

- [Platform Overview](./PLATFORM_OVERVIEW.md)
- [API Reference](./API_REFERENCE.md)
- [Database Schema](./DATABASE_SCHEMA.md)

---

## 🎉 Conclusão

Este guia fornece todas as informações necessárias para fazer o deploy da Yoobe Platform em diferentes ambientes. Para dúvidas específicas, consulte nossa documentação ou entre em contato com o suporte.

**Versão atual**: v2.0.0  
**Última atualização**: Janeiro 2024  
**Status**: ✅ Produção
