# 🚀 Sistema de Monitoramento e Disponibilidade

Este documento descreve o sistema completo de monitoramento e disponibilidade implementado na Yoobe v3.1.0.

## 📋 Visão Geral

O sistema de monitoramento garante que a aplicação esteja sempre disponível através de:

- **APIs públicas de health check** (sem autenticação)
- **Monitoramento automático** com verificações periódicas
- **Recuperação automática** em caso de falhas
- **Scripts de disponibilidade** para manter o sistema ativo

## 🔗 APIs e Dashboards Disponíveis

### 1. Dashboard Público de Monitoramento

```bash
GET /monitor
```

**Descrição:** Interface visual completa de monitoramento sem necessidade de autenticação.

**Características:**

- Status em tempo real do sistema
- Métricas de uptime, requisições e taxa de erro
- Health checks automáticos
- Atualização automática a cada 30 segundos
- Interface responsiva e intuitiva

### 2. Health Check Público

```bash
GET /api/system/health-public
```

**Resposta:**

```json
{
  "timestamp": "2025-09-09T01:21:52.912Z",
  "status": "healthy",
  "services": {
    "middleware": {
      "status": "healthy",
      "available": true
    },
    "mcps": {
      "status": "healthy",
      "available": true
    }
  },
  "uptime": 559.627264917,
  "version": "3.1.0",
  "environment": "development"
}
```

### 2. Métricas Públicas

```bash
GET /api/system/metrics-public
```

**Resposta:**

```json
{
  "timestamp": "2025-09-09T01:21:13.816Z",
  "summary": {
    "totalRequests": 1250,
    "totalErrors": 5,
    "errorRate": 0.4,
    "activeOperations": 3,
    "uptime": 520.531715208
  },
  "middleware": {
    /* métricas do middleware */
  },
  "mcps": {
    /* métricas dos MCPs */
  },
  "activeOperations": [
    /* operações ativas */
  ]
}
```

### 3. Status do Sistema

```bash
GET /api/system/status
```

**Resposta:**

```json
{
  "timestamp": "2025-09-09T01:21:44.058Z",
  "status": "healthy",
  "services": {
    "middleware": true,
    "mcps": true,
    "database": true,
    "apis": true
  },
  "uptime": 562.465787208,
  "lastCheck": "2025-09-09T01:21:44.058Z",
  "checks": {
    "total": 4,
    "passed": 4,
    "failed": 0
  },
  "healthChecks": [
    /* detalhes dos health checks */
  ],
  "isHealthy": true
}
```

## 🛠️ Scripts de Monitoramento

### Comandos NPM Disponíveis

```bash
# Verificar saúde do sistema
npm run health

# Verificar status completo
npm run status

# Iniciar monitoramento contínuo
npm run monitor

# Iniciar desenvolvimento com monitoramento
npm run dev:monitored
```

### Acesso aos Dashboards

```bash
# Dashboard público (sem autenticação)
http://localhost:3000/monitor

# Dashboard administrativo (requer login)
http://localhost:3000/admin/system-monitoring

# APIs diretas
http://localhost:3000/api/system/health-public
http://localhost:3000/api/system/metrics-public
http://localhost:3000/api/system/status
```

### Script de Disponibilidade

```bash
# Executar script de disponibilidade
node scripts/ensure-system-availability.js
```

## 🔧 Configuração

### Arquivo de Configuração

O sistema usa `system-monitor.config.js` para configurações:

```javascript
module.exports = {
  healthCheck: {
    interval: 30000, // 30 segundos
    timeout: 10000, // 10 segundos
    maxRetries: 3,
  },
  endpoints: [
    {
      name: 'Health Check API',
      url: '/api/system/health-public',
      expectedStatus: 200,
      critical: true,
    },
    // ... outros endpoints
  ],
}
```

## 📊 Monitoramento Automático

### SystemMonitor Class

Localizada em `lib/system-monitor.ts`, executa:

- **Verificações periódicas** a cada 30 segundos (dev) / 1 minuto (prod)
- **Health checks** em múltiplos endpoints
- **Recuperação automática** em caso de falhas
- **Logs detalhados** de todas as operações

### Endpoints Monitorados

- `/api/system/health-public` - Health check
- `/api/system/metrics-public` - Métricas
- `/api/system/status` - Status do sistema
- `/` - Aplicação principal
- `/docs` - Documentação

## 🚨 Estratégias de Recuperação

Quando falhas são detectadas, o sistema executa:

1. **Limpeza de cache** do Next.js
2. **Reinicialização de serviços** críticos
3. **Verificação de conectividade** de rede
4. **Verificação de recursos** do sistema
5. **Reinicialização completa** se necessário

## 📈 Métricas e Alertas

### Thresholds Configurados

- **Taxa de erro**: 10%
- **Tempo de resposta**: 5 segundos
- **Uptime**: 95%

### Status Possíveis

- `healthy` - Sistema funcionando normalmente
- `degraded` - Alguns serviços com problemas
- `unhealthy` - Sistema com falhas críticas

## 🔍 Troubleshooting

### Problemas Comuns

1. **APIs retornando 500**

   - Verificar se o servidor está rodando
   - Verificar logs de erro
   - Executar `npm run health`

2. **Monitoramento não iniciando**

   - Verificar permissões do script
   - Verificar configuração
   - Executar `npm run monitor`

3. **Recuperação automática falhando**
   - Verificar recursos do sistema
   - Verificar conectividade
   - Reiniciar manualmente

### Comandos de Diagnóstico

```bash
# Verificar saúde
curl -s http://localhost:3000/api/system/health-public | jq .

# Verificar status
curl -s http://localhost:3000/api/system/status | jq .

# Verificar métricas
curl -s http://localhost:3000/api/system/metrics-public | jq .
```

## 📚 Documentação Relacionada

- [Sistema de Proteção](./app/docs/SYSTEM_PROTECTION/page.tsx)
- [APIs de Sistema](./app/api/system/)
- [Configuração](./system-monitor.config.js)
- [Scripts](./scripts/ensure-system-availability.js)

## 🚀 Uso em Produção

Para usar em produção:

1. **Configurar variáveis de ambiente**:

   ```bash
   NODE_ENV=production
   ```

2. **Iniciar com monitoramento**:

   ```bash
   npm run dev:monitored
   ```

3. **Configurar alertas** (opcional):
   - Integrar com sistemas de monitoramento externos
   - Configurar notificações por email/Slack
   - Configurar dashboards de métricas

## 📝 Logs

Os logs do sistema são salvos em:

- **Console**: Logs em tempo real
- **Arquivo**: `logs/system-monitor.log` (configurável)
- **Rotação**: Máximo 10MB, 5 arquivos

## 🔄 Atualizações

Para atualizar o sistema de monitoramento:

1. Atualizar configuração em `system-monitor.config.js`
2. Reiniciar o monitor: `npm run monitor`
3. Verificar status: `npm run status`

---

**Versão**: 3.1.0  
**Última atualização**: Setembro 2025  
**Status**: ✅ Ativo e Funcionando
