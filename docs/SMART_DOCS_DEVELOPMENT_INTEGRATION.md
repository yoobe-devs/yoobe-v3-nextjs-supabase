# 🔄 Sistema de Documentação Inteligente - Integração com Desenvolvimento

## 🎯 **Visão Geral**

Este guia explica como **integrar o Sistema de Documentação Inteligente** com seu fluxo de desenvolvimento diário, maximizando a automação e prevenção de erros.

---

## 🚀 **Fluxo de Desenvolvimento Integrado**

### **1. Ciclo de Desenvolvimento com Sistema Inteligente**

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Desenvolvimento │    │   Sistema       │    │   Documentação  │
│   (Código)      │    │   Inteligente   │    │   Automática    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
    Modifica código      Detecta mudanças      Atualiza docs
         │                       │                       │
         ▼                       ▼                       ▼
    Salva arquivo        Analisa riscos        Gera changelog
         │                       │                       │
         ▼                       ▼                       ▼
    Commit Git           Sugere correções      Notifica mudanças
         │                       │                       │
         ▼                       ▼                       ▼
    Push/Pull            Aprende com erros     Mantém consistência
```

---

## ⚙️ **Configuração para Desenvolvimento**

### **1. Configuração Inicial do Projeto**

```bash
# 1. Navegar para o projeto
cd yoobe-v3

# 2. Iniciar sistema de documentação
node scripts/init-smart-docs.js

# 3. Verificar status
curl -X GET "http://localhost:3000/api/admin/smart-docs"
```

### **2. Configuração de Diretórios para Monitorar**

```typescript
// Configuração recomendada para desenvolvimento
const devConfig = {
  autoStart: true,
  autoUpdate: true,
  consistencyCheck: true,
  reportGeneration: true,
  watchDirectories: [
    'app',           // Páginas e componentes Next.js
    'lib',           // Bibliotecas e utilitários
    'components',    // Componentes React reutilizáveis
    'supabase',      // Migrações e configurações do banco
    'types',         // Definições de tipos TypeScript
    'hooks',         // Custom hooks React
    'middleware',    // Middleware Next.js
    'api'            // Rotas da API
  ],
  logLevel: 'info',      // 'debug' para desenvolvimento detalhado
  backupFrequency: 'daily',
  retentionDays: 7       // Menos dias para desenvolvimento
}
```

### **3. Aplicar Configuração**

```bash
# Aplicar configuração via API
curl -X PUT "http://localhost:3000/api/admin/smart-docs" \
  -H "Content-Type: application/json" \
  -d '{
    "autoStart": true,
    "autoUpdate": true,
    "consistencyCheck": true,
    "reportGeneration": true,
    "watchDirectories": ["app", "lib", "components", "supabase", "types", "hooks"],
    "logLevel": "info",
    "backupFrequency": "daily",
    "retentionDays": 7
  }'
```

---

## 🔄 **Integração com Git Workflow**

### **1. Pre-Commit Hooks**

```bash
# Criar arquivo .git/hooks/pre-commit
#!/bin/bash

echo "🔍 Sistema de Documentação Inteligente - Verificação Pré-Commit"

# Verificar se sistema está ativo
SYSTEM_STATUS=$(curl -s "http://localhost:3000/api/admin/smart-docs" | jq -r '.data.status.isInitialized')

if [ "$SYSTEM_STATUS" = "true" ]; then
    echo "✅ Sistema ativo - Executando verificações..."
    
    # Forçar análise de código
    curl -s -X POST "http://localhost:3000/api/admin/smart-docs" \
      -H "Content-Type: application/json" \
      -d '{"action": "analyze", "userId": "git-hook", "details": "Pre-commit analysis"}'
    
    # Aguardar análise
    sleep 2
    
    # Verificar se há problemas críticos
    ERRORS=$(curl -s "http://localhost:3000/api/admin/smart-docs/logs?level=error&limit=10" | jq -r '.data | length')
    
    if [ "$ERRORS" -gt 0 ]; then
        echo "⚠️  Encontrados $ERRORS erros críticos. Verifique logs antes de fazer commit."
        echo "📊 Ver logs: curl -X GET 'http://localhost:3000/api/admin/smart-docs/logs?level=error'"
        exit 1
    fi
    
    echo "✅ Verificações concluídas - Commit permitido"
else
    echo "⚠️  Sistema inativo - Pulando verificações"
fi
```

### **2. Post-Commit Hooks**

```bash
# Criar arquivo .git/hooks/post-commit
#!/bin/bash

echo "📝 Sistema de Documentação Inteligente - Atualização Pós-Commit"

# Verificar se sistema está ativo
SYSTEM_STATUS=$(curl -s "http://localhost:3000/api/admin/smart-docs" | jq -r '.data.status.isInitialized')

if [ "$SYSTEM_STATUS" = "true" ]; then
    echo "✅ Sistema ativo - Atualizando documentação..."
    
    # Obter informações do commit
    COMMIT_HASH=$(git rev-parse HEAD)
    COMMIT_MSG=$(git log -1 --pretty=%B)
    COMMIT_AUTHOR=$(git log -1 --pretty=%an)
    
    # Atualizar documentação baseada no commit
    curl -s -X POST "http://localhost:3000/api/admin/smart-docs" \
      -H "Content-Type: application/json" \
      -d "{
        \"action\": \"update_docs\",
        \"userId\": \"$COMMIT_AUTHOR\",
        \"details\": \"Commit: $COMMIT_HASH - $COMMIT_MSG\",
        \"metadata\": {
          \"commitHash\": \"$COMMIT_HASH\",
          \"commitMessage\": \"$COMMIT_MSG\",
          \"commitAuthor\": \"$COMMIT_AUTHOR\"
        }
      }"
    
    echo "✅ Documentação atualizada automaticamente"
else
    echo "⚠️  Sistema inativo - Documentação não atualizada"
fi
```

### **3. Pre-Push Hooks**

```bash
# Criar arquivo .git/hooks/pre-push
#!/bin/bash

echo "🚀 Sistema de Documentação Inteligente - Verificação Pré-Push"

# Verificar se sistema está ativo
SYSTEM_STATUS=$(curl -s "http://localhost:3000/api/admin/smart-docs" | jq -r '.data.status.isInitialized')

if [ "$SYSTEM_STATUS" = "true" ]; then
    echo "✅ Sistema ativo - Executando verificações finais..."
    
    # Criar backup antes do push
    curl -s -X POST "http://localhost:3000/api/admin/smart-docs/backup" \
      -H "Content-Type: application/json" \
      -d "{
        \"description\": \"Backup antes do push - $(date)\",
        \"userId\": \"git-hook\"
      }"
    
    # Verificar consistência
    CONSISTENCY=$(curl -s "http://localhost:3000/api/admin/smart-docs" | jq -r '.data.status.documentation.consistency')
    
    if [ "$CONSISTENCY" != "true" ]; then
        echo "⚠️  Inconsistências detectadas entre código e documentação"
        echo "📊 Verificar: curl -X GET 'http://localhost:3000/api/admin/smart-docs'"
        echo "🔄 Corrigir: curl -X POST 'http://localhost:3000/api/admin/smart-docs' -d '{\"action\": \"fix_consistency\"}'"
        exit 1
    fi
    
    echo "✅ Verificações finais concluídas - Push permitido"
else
    echo "⚠️  Sistema inativo - Pulando verificações"
fi
```

---

## 🧪 **Integração com Testes**

### **1. Antes dos Testes**

```typescript
// test-setup.ts
import { SmartDocumentationSystem } from '@/lib/smart-docs-system'

beforeAll(async () => {
  // Iniciar sistema de documentação para testes
  const smartDocs = SmartDocumentationSystem.getInstance()
  await smartDocs.initialize({
    autoStart: false,
    autoUpdate: false,
    consistencyCheck: true,
    reportGeneration: false,
    watchDirectories: ['app', 'lib', 'components'],
    logLevel: 'debug'
  })
  
  // Iniciar monitoramento
  await smartDocs.startMonitoring()
})

afterAll(async () => {
  // Parar sistema após testes
  const smartDocs = SmartDocumentationSystem.getInstance()
  await smartDocs.stopMonitoring()
})
```

### **2. Durante os Testes**

```typescript
// test-utils.ts
export async function checkCodeQuality(filePath: string) {
  const smartDocs = SmartDocumentationSystem.getInstance()
  
  // Analisar arquivo específico
  const analysis = await smartDocs.analyzeFile(filePath)
  
  // Verificar se há problemas críticos
  const criticalIssues = analysis.issues.filter(issue => issue.severity === 'critical')
  
  if (criticalIssues.length > 0) {
    throw new Error(`Problemas críticos detectados em ${filePath}: ${criticalIssues.map(i => i.description).join(', ')}`)
  }
  
  return analysis
}

// Uso nos testes
describe('Code Quality', () => {
  it('should not have critical issues', async () => {
    const analysis = await checkCodeQuality('app/api/users/route.ts')
    expect(analysis.issues.filter(i => i.severity === 'critical')).toHaveLength(0)
  })
})
```

### **3. Após os Testes**

```typescript
// test-teardown.ts
afterEach(async () => {
  // Verificar se documentação está consistente após cada teste
  const smartDocs = SmartDocumentationSystem.getInstance()
  const status = await smartDocs.getSystemStatus()
  
  if (!status.documentation.consistency) {
    console.warn('⚠️  Inconsistências detectadas na documentação após teste')
    
    // Tentar corrigir automaticamente
    await smartDocs.fixConsistency()
  }
})
```

---

## 🔍 **Monitoramento em Tempo Real**

### **1. Dashboard de Desenvolvimento**

```typescript
// components/DevDashboard.tsx
import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { RefreshCw, AlertTriangle, CheckCircle } from 'lucide-react'

export function DevDashboard() {
  const [status, setStatus] = useState<any>(null)
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const loadStatus = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/smart-docs?includeLogs=true')
      const data = await response.json()
      if (data.success) {
        setStatus(data.data.status)
        setLogs(data.data.logs || [])
      }
    } catch (error) {
      console.error('Erro ao carregar status:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadStatus()
    // Atualizar a cada 30 segundos
    const interval = setInterval(loadStatus, 30000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* Status do Sistema */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Status do Sistema
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Sistema:</span>
              <Badge className={status?.isInitialized ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                {status?.isInitialized ? "Ativo" : "Inativo"}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span>Monitoramento:</span>
              <Badge className={status?.monitoring?.isRunning ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                {status?.monitoring?.isRunning ? "Ativo" : "Inativo"}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span>Uptime:</span>
              <span className="text-sm font-medium">{status?.performance?.uptime || "0s"}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Qualidade do Código */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            Qualidade do Código
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Erros na Memória:</span>
              <span className="text-sm font-medium">{status?.errorMemory?.totalErrors || 0}</span>
            </div>
            <div className="flex justify-between">
              <span>Padrões de Risco:</span>
              <span className="text-sm font-medium">{status?.prevention?.highRiskPatterns || 0}</span>
            </div>
            <div className="flex justify-between">
              <span>Consistência:</span>
              <Badge className={status?.documentation?.consistency ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                {status?.documentation?.consistency ? "OK" : "Inconsistente"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Logs Recentes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5 text-blue-600" />
            Logs Recentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {logs.slice(0, 5).map((log, index) => (
              <div key={index} className="text-sm p-2 bg-gray-50 rounded">
                <div className="flex justify-between">
                  <span className={`text-xs px-2 py-1 rounded ${
                    log.level === 'error' ? 'bg-red-100 text-red-800' :
                    log.level === 'warn' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {log.level.toUpperCase()}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <p className="mt-1 text-gray-700">{log.message}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Controles */}
      <Card className="md:col-span-2 lg:col-span-3">
        <CardHeader>
          <CardTitle>Controles Rápidos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button onClick={loadStatus} disabled={loading} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Atualizar Status
            </Button>
            <Button 
              onClick={() => fetch('/api/admin/smart-docs', { method: 'POST', body: JSON.stringify({ action: 'backup', userId: 'dev' }) })}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Criar Backup
            </Button>
            <Button 
              onClick={() => fetch('/api/admin/smart-docs', { method: 'POST', body: JSON.stringify({ action: 'fix_consistency', userId: 'dev' }) })}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700"
            >
              Corrigir Consistência
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
```

### **2. Notificações em Tempo Real**

```typescript
// hooks/useSmartDocsNotifications.ts
import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'

export function useSmartDocsNotifications() {
  const [lastNotification, setLastNotification] = useState<string>('')

  useEffect(() => {
    const checkNotifications = async () => {
      try {
        // Verificar logs recentes
        const response = await fetch('/api/admin/smart-docs/logs?level=warn,error&limit=5')
        const data = await response.json()
        
        if (data.success && data.data.length > 0) {
          const latestLog = data.data[0]
          
          // Evitar notificações duplicadas
          if (latestLog.id !== lastNotification) {
            setLastNotification(latestLog.id)
            
            // Mostrar notificação baseada no nível
            if (latestLog.level === 'error') {
              toast.error(`🚨 ${latestLog.message}`, {
                duration: 10000,
                position: 'top-right'
              })
            } else if (latestLog.level === 'warn') {
              toast.warning(`⚠️ ${latestLog.message}`, {
                duration: 8000,
                position: 'top-right'
              })
            }
          }
        }
      } catch (error) {
        console.error('Erro ao verificar notificações:', error)
      }
    }

    // Verificar a cada 10 segundos
    const interval = setInterval(checkNotifications, 10000)
    
    // Verificação inicial
    checkNotifications()
    
    return () => clearInterval(interval)
  }, [lastNotification])

  return { lastNotification }
}
```

---

## 📊 **Relatórios de Desenvolvimento**

### **1. Relatório Diário**

```typescript
// scripts/generate-daily-report.js
import { SmartDocumentationSystem } from '@/lib/smart-docs-system'

async function generateDailyReport() {
  const smartDocs = SmartDocumentationSystem.getInstance()
  
  // Gerar relatório do dia
  const report = await smartDocs.generateDailyReport()
  
  // Salvar relatório
  const fs = require('fs')
  const path = require('path')
  
  const reportDir = path.join(process.cwd(), 'reports')
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true })
  }
  
  const today = new Date().toISOString().split('T')[0]
  const reportPath = path.join(reportDir, `daily-report-${today}.md`)
  
  fs.writeFileSync(reportPath, report)
  
  console.log(`📊 Relatório diário gerado: ${reportPath}`)
  
  return reportPath
}

// Executar se chamado diretamente
if (require.main === module) {
  generateDailyReport()
    .then(path => console.log(`✅ Relatório salvo em: ${path}`))
    .catch(error => console.error('❌ Erro ao gerar relatório:', error))
}

module.exports = { generateDailyReport }
```

### **2. Relatório de Sprint**

```typescript
// scripts/generate-sprint-report.js
import { SmartDocumentationSystem } from '@/lib/smart-docs-system'

async function generateSprintReport(sprintStart: string, sprintEnd: string) {
  const smartDocs = SmartDocumentationSystem.getInstance()
  
  // Gerar relatório do sprint
  const report = await smartDocs.generateSprintReport(sprintStart, sprintEnd)
  
  // Salvar relatório
  const fs = require('fs')
  const path = require('path')
  
  const reportDir = path.join(process.cwd(), 'reports', 'sprints')
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true })
  }
  
  const sprintName = `sprint-${sprintStart}-to-${sprintEnd}`
  const reportPath = path.join(reportDir, `${sprintName}-report.md`)
  
  fs.writeFileSync(reportPath, report)
  
  console.log(`📊 Relatório de sprint gerado: ${reportPath}`)
  
  return reportPath
}

// Executar se chamado diretamente
if (require.main === module) {
  const args = process.argv.slice(2)
  if (args.length !== 2) {
    console.error('Uso: node generate-sprint-report.js <sprint-start> <sprint-end>')
    console.error('Exemplo: node generate-sprint-report.js 2024-01-01 2024-01-15')
    process.exit(1)
  }
  
  generateSprintReport(args[0], args[1])
    .then(path => console.log(`✅ Relatório salvo em: ${path}`))
    .catch(error => console.error('❌ Erro ao gerar relatório:', error))
}

module.exports = { generateSprintReport }
```

---

## 🔧 **Configuração de Ambiente**

### **1. Variáveis de Ambiente**

```bash
# .env.local
NEXT_PUBLIC_SMART_DOCS_ENABLED=true
SMART_DOCS_LOG_LEVEL=info
SMART_DOCS_BACKUP_FREQUENCY=daily
SMART_DOCS_RETENTION_DAYS=7
SMART_DOCS_WATCH_DIRECTORIES=app,lib,components,supabase,types,hooks
```

### **2. Configuração de Desenvolvimento**

```typescript
// lib/smart-docs-config.ts
export const smartDocsConfig = {
  development: {
    autoStart: true,
    autoUpdate: true,
    consistencyCheck: true,
    reportGeneration: true,
    watchDirectories: ['app', 'lib', 'components', 'supabase', 'types', 'hooks'],
    logLevel: 'debug',
    backupFrequency: 'daily',
    retentionDays: 7,
    pollingInterval: 5000, // 5 segundos para desenvolvimento
    maxLogEntries: 1000
  },
  production: {
    autoStart: true,
    autoUpdate: true,
    consistencyCheck: true,
    reportGeneration: true,
    watchDirectories: ['app', 'lib', 'components', 'supabase'],
    logLevel: 'info',
    backupFrequency: 'daily',
    retentionDays: 30,
    pollingInterval: 30000, // 30 segundos para produção
    maxLogEntries: 10000
  }
}

export function getConfig() {
  const env = process.env.NODE_ENV || 'development'
  return smartDocsConfig[env as keyof typeof smartDocsConfig]
}
```

---

## 🎯 **Melhores Práticas**

### **1. Durante o Desenvolvimento**

1. **Mantenha o sistema ativo** enquanto desenvolve
2. **Configure diretórios** que você vai modificar
3. **Monitore logs** para detectar problemas rapidamente
4. **Faça backup** antes de mudanças grandes
5. **Use pre-commit hooks** para verificação automática

### **2. Antes do Commit**

1. **Verifique status** do sistema
2. **Analise código** para problemas
3. **Corrija inconsistências** na documentação
4. **Teste funcionalidades** básicas
5. **Crie backup** se necessário

### **3. Após o Deploy**

1. **Verifique consistência** da documentação
2. **Monitore performance** do sistema
3. **Analise logs** para problemas
4. **Atualize configurações** se necessário
5. **Gere relatórios** de status

---

## 🚨 **Troubleshooting de Desenvolvimento**

### **1. Sistema não detecta mudanças**

```bash
# Verificar se monitoramento está ativo
curl -X GET "http://localhost:3000/api/admin/smart-docs"

# Verificar diretórios monitorados
curl -X GET "http://localhost:3000/api/admin/smart-docs" | jq '.data.config.watchDirectories'

# Reiniciar monitoramento
curl -X POST "http://localhost:3000/api/admin/smart-docs" \
  -d '{"action": "restart", "userId": "dev"}'
```

### **2. Documentação não atualiza**

```bash
# Verificar se sistema está ativo
curl -X GET "http://localhost:3000/api/admin/smart-docs"

# Forçar atualização
curl -X POST "http://localhost:3000/api/admin/smart-docs" \
  -d '{"action": "update_docs", "userId": "dev"}'

# Verificar logs de erro
curl -X GET "http://localhost:3000/api/admin/smart-docs/logs?level=error"
```

### **3. Problemas de Performance**

```bash
# Verificar uso de recursos
curl -X GET "http://localhost:3000/api/admin/smart-docs" | jq '.data.status.performance'

# Ajustar intervalo de polling
curl -X PUT "http://localhost:3000/api/admin/smart-docs" \
  -d '{"pollingInterval": 10000}'

# Reduzir diretórios monitorados
curl -X PUT "http://localhost:3000/api/admin/smart-docs" \
  -d '{"watchDirectories": ["app", "lib"]}'
```

---

## 🎉 **Conclusão**

A **integração do Sistema de Documentação Inteligente** com seu fluxo de desenvolvimento oferece:

✅ **Automação completa** da documentação  
✅ **Prevenção proativa** de erros  
✅ **Monitoramento em tempo real** do código  
✅ **Integração transparente** com Git  
✅ **Relatórios automáticos** de qualidade  
✅ **Backup inteligente** antes de mudanças  

### **Próximos Passos**

1. **Configure** o sistema seguindo este guia
2. **Integre** com seus hooks do Git
3. **Monitore** o desenvolvimento em tempo real
4. **Aproveite** a automação para focar no código
5. **Gere relatórios** para acompanhar a qualidade

---

*Guia de Integração com Desenvolvimento - Sistema de Documentação Inteligente v3.0.0*
