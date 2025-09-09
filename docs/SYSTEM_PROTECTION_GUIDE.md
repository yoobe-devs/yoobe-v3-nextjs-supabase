# 🛡️ Guia de Proteção e Monitoramento do Sistema

**Versão:** 3.1.0  
**Última atualização:** 27/01/2025  
**Status:** ✅ Ativo

---

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Sistema de Proteção do Middleware](#sistema-de-proteção-do-middleware)
3. [Sistema de Monitoramento de MCPs](#sistema-de-monitoramento-de-mcps)
4. [APIs de Monitoramento](#apis-de-monitoramento)
5. [Dashboard de Monitoramento](#dashboard-de-monitoramento)
6. [Configuração e Personalização](#configuração-e-personalização)
7. [Troubleshooting](#troubleshooting)
8. [Melhores Práticas](#melhores-práticas)

---

## 🎯 Visão Geral

O sistema de proteção e monitoramento da Yoobe v3.1.0 foi desenvolvido para garantir a estabilidade, segurança e performance do middleware e dos MCPs (Model Context Protocols). O sistema inclui:

- **Proteção do Middleware**: Rate limiting, health checks, auditoria e tratamento de erros
- **Monitoramento de MCPs**: Tracking de operações, métricas de performance e status de saúde
- **APIs de Monitoramento**: Endpoints para verificar status e métricas
- **Dashboard Visual**: Interface para monitoramento em tempo real

---

## 🛡️ Sistema de Proteção do Middleware

### Funcionalidades

#### 1. **Rate Limiting**

- Limite de requisições por IP (configurável)
- Janela de tempo personalizável
- Bloqueio automático de IPs suspeitos

#### 2. **Health Checks**

- Verificação automática de saúde do middleware
- Detecção de degradação de performance
- Status em tempo real (healthy/degraded/unhealthy)

#### 3. **Auditoria Completa**

- Log de todas as requisições
- Tracking de redirecionamentos
- Registro de eventos de segurança

#### 4. **Tratamento de Erros**

- Captura e log de erros
- Integração com sistema de memória de erros
- Prevenção de falhas em cascata

### Configuração

```typescript
// lib/middleware-protection.ts
const config: MiddlewareConfig = {
  enableMetrics: true,
  enableAudit: true,
  enableErrorLogging: true,
  enableRateLimit: true,
  maxRequestsPerMinute: 100,
  enableHealthCheck: true,
  healthCheckInterval: 60000,
}
```

### Uso no Middleware

```typescript
// middleware.ts
import { withMiddlewareProtection } from '@/lib/middleware-protection'

function middlewareLogic(request: NextRequest) {
  // Sua lógica de middleware aqui
  return NextResponse.next()
}

export const middleware = withMiddlewareProtection(middlewareLogic)
```

---

## 🔍 Sistema de Monitoramento de MCPs

### MCPs Monitorados

1. **MCP_DOCKER** - Operações GitHub, Stripe, Docker
2. **context7** - Busca de documentação
3. **gemini-mcp-tool** - Análises e geração de conteúdo
4. **playwright** - Automação de browser
5. **spec-kit** - Gerenciamento de especificações
6. **yoobe-v3-filesystem** - Acesso ao sistema de arquivos

### Métricas Coletadas

- **Requisições**: Total, sucessos, falhas
- **Performance**: Tempo médio de resposta
- **Status**: Healthy, degraded, unhealthy
- **Operações Ativas**: Tracking em tempo real

### Configuração por MCP

```typescript
// lib/mcp-monitoring.ts
const mcpConfig: MCPConfig = {
  name: 'MCP_DOCKER',
  type: 'docker',
  enabled: true,
  maxRequestsPerMinute: 50,
  timeout: 30000,
  retryAttempts: 3,
  healthCheckInterval: 60000,
}
```

### Uso com MCPs

```typescript
import { withMCPMonitoring } from '@/lib/mcp-monitoring'

const monitoredFunction = withMCPMonitoring(
  'MCP_DOCKER',
  'github_operation',
  async (repo: string) => {
    // Sua operação MCP aqui
    return await mcpOperation(repo)
  }
)
```

---

## 🔌 APIs de Monitoramento

### 1. Health Check

**Endpoint:** `GET /api/system/health`

**Resposta:**

```json
{
  "success": true,
  "data": {
    "timestamp": "2025-09-08T22:00:00.000Z",
    "overall": "healthy",
    "middleware": {
      "status": "healthy",
      "lastCheck": 1738012800000,
      "metrics": {
        "totalRequests": 1250,
        "blockedRequests": 5,
        "redirects": 45,
        "errors": 2,
        "averageResponseTime": 150
      }
    },
    "mcps": {
      "summary": {
        "totalMCPs": 6,
        "healthyMCPs": 5,
        "degradedMCPs": 1,
        "unhealthyMCPs": 0,
        "activeOperations": 3
      },
      "details": {
        /* métricas por MCP */
      }
    },
    "activeOperations": [
      /* operações ativas */
    ]
  }
}
```

### 2. Métricas

**Endpoint:** `GET /api/system/metrics`

**Resposta:**

```json
{
  "success": true,
  "data": {
    "timestamp": "2025-09-08T22:00:00.000Z",
    "summary": {
      "totalRequests": 1250,
      "totalMCPRequests": 340,
      "totalErrors": 7,
      "errorRate": 0.56,
      "activeOperations": 3
    },
    "middleware": {
      /* métricas do middleware */
    },
    "mcps": {
      /* métricas por MCP */
    },
    "activeOperations": [
      /* operações ativas */
    ]
  }
}
```

### 3. Ações de Gerenciamento

**Endpoint:** `POST /api/system/metrics`

**Ações disponíveis:**

- `reset_middleware` - Resetar métricas do middleware
- `reset_mcp` - Resetar métricas dos MCPs
- `cleanup_operations` - Limpar operações antigas

---

## 📊 Dashboard de Monitoramento

### Acesso

**URL:** `/admin/system-monitoring`

**Permissões:** Apenas administradores

### Funcionalidades

#### 1. **Status Geral**

- Status do sistema (healthy/degraded/unhealthy)
- Última verificação
- Indicadores visuais

#### 2. **Métricas do Middleware**

- Total de requisições
- Requisições bloqueadas
- Redirecionamentos
- Erros
- Tempo médio de resposta

#### 3. **Status dos MCPs**

- Contagem por status
- Operações ativas
- Métricas detalhadas por MCP

#### 4. **Operações Ativas**

- Lista de operações em execução
- Duração
- Metadados

#### 5. **Ações de Gerenciamento**

- Reset de métricas
- Limpeza de operações
- Auto-refresh configurável

---

## ⚙️ Configuração e Personalização

### Variáveis de Ambiente

```bash
# Middleware Protection
MIDDLEWARE_RATE_LIMIT=100
MIDDLEWARE_HEALTH_CHECK_INTERVAL=60000
MIDDLEWARE_ENABLE_AUDIT=true

# MCP Monitoring
MCP_HEALTH_CHECK_INTERVAL=60000
MCP_MAX_RETRY_ATTEMPTS=3
MCP_DEFAULT_TIMEOUT=30000
```

### Personalização de Configurações

```typescript
// Atualizar configuração do middleware
middlewareProtection.updateConfig({
  maxRequestsPerMinute: 200,
  enableRateLimit: true,
})

// Atualizar configuração de MCP
mcpMonitoring.updateMCPConfig('MCP_DOCKER', {
  maxRequestsPerMinute: 100,
  timeout: 45000,
})
```

---

## 🔧 Troubleshooting

### Problemas Comuns

#### 1. **Middleware em Loop**

**Sintomas:** Redirecionamentos infinitos
**Solução:**

- Verificar se `/auth/login` está nas rotas públicas
- Limpar cache do Next.js (`.next`)
- Verificar parâmetros de redirect

#### 2. **MCP Não Respondendo**

**Sintomas:** Status "unhealthy" no dashboard
**Solução:**

- Verificar conectividade
- Verificar configuração do MCP
- Resetar métricas do MCP

#### 3. **Rate Limit Excessivo**

**Sintomas:** Muitas requisições bloqueadas
**Solução:**

- Aumentar limite por minuto
- Verificar se há ataques
- Implementar whitelist de IPs

### Logs e Debugging

```typescript
// Verificar status de saúde
const health = middlewareProtection.getHealthStatus()
console.log('Middleware Status:', health)

// Verificar métricas dos MCPs
const mcpMetrics = mcpMonitoring.getAllMetrics()
console.log('MCP Metrics:', mcpMetrics)

// Verificar operações ativas
const operations = mcpMonitoring.getActiveOperations()
console.log('Active Operations:', operations)
```

---

## 📚 Melhores Práticas

### 1. **Monitoramento Contínuo**

- Configure alertas para status "unhealthy"
- Monitore taxa de erro regularmente
- Verifique operações longas

### 2. **Configuração de Rate Limits**

- Ajuste limites baseado no tráfego
- Implemente whitelist para IPs confiáveis
- Monitore tentativas de abuso

### 3. **Health Checks**

- Configure intervalos apropriados
- Monitore tempo de resposta
- Implemente alertas automáticos

### 4. **Tratamento de Erros**

- Sempre logue erros detalhadamente
- Implemente retry logic para MCPs
- Mantenha base de conhecimento de erros atualizada

### 5. **Performance**

- Monitore tempo de resposta médio
- Identifique gargalos
- Otimize configurações baseado em métricas

---

## 🔗 Links Relacionados

- [Guia de MCPs](./MCP_COMPLETE_GUIDE.md)
- [Sistema de Auditoria](./AUDIT_SYSTEM.md)
- [Prevenção de Erros](./ERROR_PREVENTION.md)
- [API Reference](./API_REFERENCE.md)

---

## 📞 Suporte

Para dúvidas ou problemas com o sistema de proteção e monitoramento:

1. Verifique os logs do sistema
2. Consulte o dashboard de monitoramento
3. Revise este guia
4. Entre em contato com a equipe de desenvolvimento

---

**Sistema de Proteção e Monitoramento - Yoobe v3.1.0**  
_Desenvolvido para garantir máxima estabilidade e segurança_
