# 🚀 **Guia de Deploy - YOOBE v3**

> **Manual completo para deploy em diferentes ambientes**

## 📋 **Índice**

1. [Pré-requisitos](#pré-requisitos)
2. [Deploy Local](#deploy-local)
3. [Deploy Vercel](#deploy-vercel)
4. [Deploy Docker](#deploy-docker)
5. [Deploy AWS](#deploy-aws)
6. [Configuração de Produção](#configuração-de-produção)
7. [Monitoramento](#monitoramento)
8. [Troubleshooting](#troubleshooting)

---

## ✅ **Pré-requisitos**

### **Sistema**
- **Node.js:** 18.17.0 ou superior
- **npm:** 9.0.0 ou superior
- **Git:** 2.30.0 ou superior
- **Docker:** 20.10.0 ou superior (opcional)

### **Contas e Serviços**
- **GitHub:** Repositório do projeto
- **Supabase:** Projeto configurado
- **Vercel:** Conta para deploy (recomendado)
- **AWS:** Conta para infraestrutura (opcional)

### **Variáveis de Ambiente**
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=sua_url_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima
SUPABASE_SERVICE_ROLE_KEY=sua_chave_service_role

# App
NEXT_PUBLIC_APP_URL=https://seu-dominio.com
NODE_ENV=production

# Segurança
NEXTAUTH_SECRET=seu_secret_muito_seguro
NEXTAUTH_URL=https://seu-dominio.com
```

---

## 🏠 **Deploy Local**

### **1. Clone e Instalação**
```bash
# Clone o repositório
git clone https://github.com/seu-usuario/yoobe-v3.git
cd yoobe-v3

# Instale dependências
npm install

# Configure variáveis de ambiente
cp .env.example .env.local
```

### **2. Configuração do Banco**
```bash
# Inicie Supabase local
npx supabase start

# Aplique migrações
npm run db:migrate

# Crie dados iniciais
npm run db:seed
```

### **3. Execução**
```bash
# Desenvolvimento
npm run dev

# Build de produção
npm run build
npm start

# Testes
npm run test
npm run test:e2e
```

### **4. Acesso**
- **App:** http://localhost:3000
- **Supabase Studio:** http://127.0.0.1:54323
- **API:** http://localhost:3000/api

---

## ⚡ **Deploy Vercel (Recomendado)**

### **1. Instalação do Vercel CLI**
```bash
# Instale globalmente
npm i -g vercel

# Login na sua conta
vercel login
```

### **2. Configuração do Projeto**
```bash
# Na pasta do projeto
vercel

# Siga as instruções:
# - Link para projeto existente ou novo
# - Escolha o scope (conta/organização)
# - Confirme as configurações
```

### **3. Configuração de Variáveis**
```bash
# Configure variáveis de ambiente
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add NEXT_PUBLIC_APP_URL
vercel env add NEXTAUTH_SECRET
vercel env add NEXTAUTH_URL
```

### **4. Deploy Automático**
```bash
# Deploy manual
vercel --prod

# Deploy automático via GitHub
# Configure GitHub Actions ou use Vercel Git Integration
```

### **5. Configuração de Domínio**
```bash
# Adicione domínio customizado
vercel domains add seu-dominio.com

# Configure DNS
# Aponte para os nameservers do Vercel
```

### **6. Configuração de Build**
```vercel.json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "installCommand": "npm install",
  "devCommand": "npm run dev"
}
```

---

## 🐳 **Deploy Docker**

### **1. Dockerfile**
```dockerfile
# Dockerfile
FROM node:18-alpine AS base

# Instale dependências necessárias
RUN apk add --no-cache libc6-compat

# Configure diretório de trabalho
WORKDIR /app

# Copie arquivos de dependências
COPY package*.json ./
COPY yarn.lock* ./

# Instale dependências
RUN npm ci --only=production

# Copie código fonte
COPY . .

# Build da aplicação
RUN npm run build

# Exponha porta
EXPOSE 3000

# Comando de inicialização
CMD ["npm", "start"]
```

### **2. Docker Compose**
```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}
      - NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY}
      - SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY}
    depends_on:
      - postgres
    restart: unless-stopped

  postgres:
    image: postgres:15
    environment:
      - POSTGRES_DB=yoobe
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=postgres
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

volumes:
  postgres_data:
```

### **3. Execução**
```bash
# Build e execução
docker-compose up --build

# Execução em background
docker-compose up -d

# Parar serviços
docker-compose down

# Ver logs
docker-compose logs -f app
```

### **4. Deploy em Produção**
```bash
# Build da imagem
docker build -t yoobe-v3:latest .

# Tag para registry
docker tag yoobe-v3:latest seu-registry/yoobe-v3:latest

# Push para registry
docker push seu-registry/yoobe-v3:latest

# Deploy em servidor
docker pull seu-registry/yoobe-v3:latest
docker run -d -p 3000:3000 --name yoobe-app seu-registry/yoobe-v3:latest
```

---

## ☁️ **Deploy AWS**

### **1. ECS (Elastic Container Service)**

#### **Task Definition**
```json
{
  "family": "yoobe-v3",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "512",
  "memory": "1024",
  "executionRoleArn": "arn:aws:iam::account:role/ecsTaskExecutionRole",
  "containerDefinitions": [
    {
      "name": "yoobe-app",
      "image": "seu-registry/yoobe-v3:latest",
      "portMappings": [
        {
          "containerPort": 3000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/yoobe-v3",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
```

#### **Service Definition**
```json
{
  "serviceName": "yoobe-v3-service",
  "cluster": "yoobe-cluster",
  "taskDefinition": "yoobe-v3",
  "desiredCount": 2,
  "launchType": "FARGATE",
  "networkConfiguration": {
    "awsvpcConfiguration": {
      "subnets": ["subnet-12345", "subnet-67890"],
      "securityGroups": ["sg-12345"],
      "assignPublicIp": "ENABLED"
    }
  }
}
```

### **2. Lambda + API Gateway**

#### **Serverless Framework**
```yaml
# serverless.yml
service: yoobe-v3

provider:
  name: aws
  runtime: nodejs18.x
  region: us-east-1
  environment:
    NODE_ENV: production
    SUPABASE_URL: ${ssm:/yoobe/supabase-url}
    SUPABASE_KEY: ${ssm:/yoobe/supabase-key}

functions:
  api:
    handler: handler.api
    events:
      - http:
          path: /{proxy+}
          method: ANY
    memorySize: 1024
    timeout: 30

plugins:
  - serverless-offline
  - serverless-dotenv-plugin
```

### **3. S3 + CloudFront**

#### **Configuração S3**
```bash
# Crie bucket para assets
aws s3 mb s3://yoobe-v3-assets

# Configure CORS
aws s3api put-bucket-cors --bucket yoobe-v3-assets --cors-configuration file://cors.json

# Configure política de bucket
aws s3api put-bucket-policy --bucket yoobe-v3-assets --policy file://bucket-policy.json
```

#### **Configuração CloudFront**
```bash
# Crie distribuição CloudFront
aws cloudfront create-distribution \
  --distribution-config file://cloudfront-config.json
```

---

## ⚙️ **Configuração de Produção**

### **1. Variáveis de Ambiente**
```env
# Produção
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://seu-dominio.com
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima_producao
SUPABASE_SERVICE_ROLE_KEY=sua_chave_service_role_producao

# Segurança
NEXTAUTH_SECRET=seu_secret_muito_seguro_producao
NEXTAUTH_URL=https://seu-dominio.com

# Performance
NEXT_TELEMETRY_DISABLED=1
NODE_OPTIONS=--max-old-space-size=4096

# Monitoramento
SENTRY_DSN=sua_dsn_sentry
LOG_LEVEL=info
```

### **2. Configuração Next.js**
```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Otimizações de produção
  compress: true,
  poweredByHeader: false,
  
  // Headers de segurança
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          }
        ]
      }
    ]
  },

  // Configuração de imagens
  images: {
    domains: ['seu-projeto.supabase.co'],
    formats: ['image/webp', 'image/avif']
  },

  // Bundle analyzer
  ...(process.env.ANALYZE === 'true' && {
    webpack: (config) => {
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'static',
          openAnalyzer: false
        })
      )
      return config
    }
  })
}

module.exports = nextConfig
```

### **3. Configuração de Banco**
```sql
-- Aplique migrações de produção
\i supabase/migrations/20250901000020_cart_checkout.sql
\i supabase/migrations/20250901000030_quotes_replication_system.sql

-- Configure RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
-- ... outras tabelas

-- Configure políticas RLS
CREATE POLICY "users_company_policy" ON users
  FOR ALL USING (company_id = current_setting('app.company_id')::uuid);
```

### **4. Configuração de Storage**
```bash
# Configure bucket de produção
npx supabase storage create-bucket yoobe-assets-prod

# Configure políticas de acesso
npx supabase storage policy create yoobe-assets-prod "Public Access" \
  --policy "SELECT USING (bucket_id = 'yoobe-assets-prod')"
```

---

## 📊 **Monitoramento**

### **1. Logs Estruturados**
```typescript
// lib/logger.ts
import pino from 'pino'

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  formatters: {
    level: (label) => ({ level: label }),
    log: (object) => object
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  base: {
    service: 'yoobe-v3',
    version: '3.1.0'
  }
})
```

### **2. Métricas de Performance**
```typescript
// lib/metrics.ts
import { register, Counter, Histogram } from 'prom-client'

// Contadores
export const httpRequestsTotal = new Counter({
  name: 'http_requests_total',
  help: 'Total de requisições HTTP',
  labelNames: ['method', 'route', 'status']
})

// Histogramas
export const httpRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duração das requisições HTTP',
  labelNames: ['method', 'route']
})

// Endpoint de métricas
export async function GET() {
  return new Response(await register.metrics(), {
    headers: { 'Content-Type': 'text/plain' }
  })
}
```

### **3. Health Checks**
```typescript
// app/api/health/route.ts
export async function GET() {
  try {
    // Verifique banco de dados
    const { data: dbHealth } = await supabase
      .from('companies')
      .select('count')
      .limit(1)

    // Verifique storage
    const { data: storageHealth } = await supabase.storage
      .from('yoobe-assets')
      .list('', { limit: 1 })

    return NextResponse.json({
      success: true,
      data: {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: '3.1.0',
        services: {
          database: 'healthy',
          storage: 'healthy'
        }
      }
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: {
        status: 'unhealthy',
        message: error.message
      }
    }, { status: 503 })
  }
}
```

### **4. Alertas e Notificações**
```typescript
// lib/alerts.ts
export async function sendAlert(
  level: 'info' | 'warning' | 'error' | 'critical',
  message: string,
  context?: Record<string, any>
) {
  // Slack
  if (process.env.SLACK_WEBHOOK_URL) {
    await fetch(process.env.SLACK_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: `[${level.toUpperCase()}] ${message}`,
        attachments: context ? [{ fields: Object.entries(context).map(([k, v]) => ({ title: k, value: String(v), short: true })) }] : []
      })
    })
  }

  // Email
  if (process.env.ALERT_EMAIL) {
    // Implementar envio de email
  }

  // Log
  logger[level](message, context)
}
```

---

## 🔧 **Troubleshooting**

### **1. Problemas Comuns**

#### **Build Falha**
```bash
# Limpe cache
rm -rf .next
rm -rf node_modules
npm install

# Verifique versão do Node
node --version  # Deve ser 18.17.0+

# Verifique dependências
npm audit
npm outdated
```

#### **Erro de Banco**
```bash
# Verifique conexão
npx supabase status

# Reset do banco local
npx supabase db reset

# Verifique migrações
npx supabase migration list
```

#### **Erro de Deploy**
```bash
# Verifique logs
vercel logs

# Verifique variáveis de ambiente
vercel env ls

# Deploy forçado
vercel --force
```

### **2. Debug em Produção**
```typescript
// Adicione logs de debug
export async function POST(req: NextRequest) {
  logger.info('Iniciando requisição POST', {
    url: req.url,
    method: req.method,
    headers: Object.fromEntries(req.headers)
  })

  try {
    // ... lógica da API
    logger.info('Requisição processada com sucesso')
  } catch (error) {
    logger.error('Erro na requisição', {
      error: error.message,
      stack: error.stack
    })
    throw error
  }
}
```

### **3. Rollback**
```bash
# Vercel
vercel rollback

# Docker
docker tag yoobe-v3:previous yoobe-v3:latest
docker-compose up -d

# AWS ECS
aws ecs update-service \
  --cluster yoobe-cluster \
  --service yoobe-v3-service \
  --task-definition yoobe-v3:previous
```

---

## 📚 **Recursos Adicionais**

### **Scripts de Deploy**
```json
// package.json
{
  "scripts": {
    "deploy:vercel": "vercel --prod",
    "deploy:docker": "docker build -t yoobe-v3 . && docker run -d -p 3000:3000 yoobe-v3",
    "deploy:aws": "aws ecs update-service --cluster yoobe-cluster --service yoobe-v3-service --force-new-deployment",
    "health:check": "curl -f http://localhost:3000/api/health || exit 1"
  }
}
```

### **CI/CD Pipeline**
```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - run: npm run test
      - run: npm run deploy:vercel
        env:
          VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
```

---

## 🆘 **Suporte**

### **Canais de Ajuda**
- **Documentação:** Este guia
- **GitHub Issues:** [Problemas do projeto](https://github.com/seu-usuario/yoobe-v3/issues)
- **Email:** deploy@yoobe.com
- **Slack:** #deploy-support

### **Checklist de Deploy**
- [ ] Variáveis de ambiente configuradas
- [ ] Banco de dados migrado
- [ ] Testes passando
- [ ] Build bem-sucedido
- [ ] Deploy executado
- [ ] Health check passando
- [ ] Monitoramento configurado
- [ ] Backup configurado

---

**Última atualização:** Janeiro 2025  
**Versão do documento:** 3.1.0  
**Status:** Atualizado para v3.1.0
