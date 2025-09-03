# 🚀 Sistema de Documentação Inteligente - Guia de Consulta Rápida

## ⚡ **Comandos Essenciais**

### **Inicialização e Controle**
```bash
# Iniciar sistema
node scripts/init-smart-docs.js

# Testar sistema
node scripts/test-smart-docs.js

# Ver status via API
curl -X GET "http://localhost:3000/api/admin/smart-docs"
```

### **Controle via API**
```bash
# Iniciar
curl -X POST "http://localhost:3000/api/admin/smart-docs" \
  -d '{"action": "start", "userId": "dev"}'

# Parar
curl -X POST "http://localhost:3000/api/admin/smart-docs" \
  -d '{"action": "stop", "userId": "dev"}'

# Reiniciar
curl -X POST "http://localhost:3000/api/admin/smart-docs" \
  -d '{"action": "restart", "userId": "dev"}'
```

---

## 🔧 **Configurações Rápidas**

### **Configuração Básica**
```typescript
const config = {
  autoStart: true,
  autoUpdate: true,
  watchDirectories: ['app', 'lib', 'components'],
  logLevel: 'info'
}
```

### **Configuração Avançada**
```typescript
const config = {
  autoStart: true,
  autoUpdate: true,
  consistencyCheck: true,
  reportGeneration: true,
  watchDirectories: ['app', 'lib', 'components', 'supabase', 'types', 'hooks'],
  logLevel: 'debug',
  backupFrequency: 'daily',
  retentionDays: 30
}
```

---

## 📊 **Monitoramento**

### **Status do Sistema**
```bash
# Status completo
GET /api/admin/smart-docs

# Status com logs
GET /api/admin/smart-docs?includeLogs=true

# Status com ações
GET /api/admin/smart-docs?includeActions=true
```

### **Logs em Tempo Real**
```bash
# Logs recentes
GET /api/admin/smart-docs/logs?level=info&limit=100

# Logs de erro
GET /api/admin/smart-docs/logs?level=error

# Logs desde timestamp
GET /api/admin/smart-docs/logs?since=2024-01-15T00:00:00Z
```

### **Histórico de Ações**
```bash
# Todas as ações
GET /api/admin/smart-docs/actions

# Ações específicas
GET /api/admin/smart-docs/actions?action=start&status=success

# Ações por usuário
GET /api/admin/smart-docs/actions?userId=admin
```

---

## 💾 **Backup e Restore**

### **Backup**
```bash
# Listar backups
GET /api/admin/smart-docs/backup

# Criar backup
POST /api/admin/smart-docs/backup
{
  "description": "Backup antes de mudanças",
  "userId": "dev"
}

# Remover backup
DELETE /api/admin/smart-docs/backup
{
  "filename": "smart-docs-backup-2024-01-15T10-30-00Z.json"
}
```

### **Restore**
```bash
# Restore completo
POST /api/admin/smart-docs
{
  "action": "restore",
  "userId": "dev"
}
```

---

## 🚨 **Troubleshooting Rápido**

### **Problemas Comuns**

#### **Sistema não inicia**
```bash
# Verificar logs
tail -f logs/system.log

# Reiniciar
node scripts/init-smart-docs.js
```

#### **Monitoramento não funciona**
```bash
# Verificar diretórios
ls -la app/ lib/ components/

# Reiniciar monitoramento
curl -X POST "http://localhost:3000/api/admin/smart-docs" \
  -d '{"action": "restart", "userId": "dev"}'
```

#### **Documentação não atualiza**
```bash
# Verificar status
curl -X GET "http://localhost:3000/api/admin/smart-docs"

# Forçar atualização
curl -X POST "http://localhost:3000/api/admin/smart-docs" \
  -d '{"action": "update", "userId": "dev"}'
```

### **Reset de Emergência**
```bash
# Reset completo
curl -X DELETE "http://localhost:3000/api/admin/smart-docs"

# Restaurar de backup
curl -X POST "http://localhost:3000/api/admin/smart-docs" \
  -d '{"action": "restore", "userId": "dev"}'
```

---

## 📁 **Estrutura de Arquivos**

```
yoobe-v3/
├── lib/
│   ├── error-memory.ts          # Sistema de memória de erros
│   ├── error-prevention.ts      # Sistema de prevenção
│   ├── intelligent-docs.ts      # Gerador de documentação
│   ├── docs-monitor.ts          # Monitor de mudanças
│   └── smart-docs-system.ts     # Sistema principal
├── scripts/
│   ├── init-smart-docs.js       # Inicialização
│   └── test-smart-docs.js       # Testes
├── docs/
│   ├── SMART_DOCS_SYSTEM_COMPLETE.md    # Documentação completa
│   ├── SMART_DOCS_GUIDE.md              # Guia de uso
│   └── SMART_DOCS_QUICK_REFERENCE.md    # Este arquivo
└── backups/                     # Backups automáticos
```

---

## 🔍 **Endpoints da API**

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `GET` | `/api/admin/smart-docs` | Status do sistema |
| `POST` | `/api/admin/smart-docs` | Executar ações |
| `PUT` | `/api/admin/smart-docs` | Atualizar configuração |
| `DELETE` | `/api/admin/smart-docs` | Reset do sistema |
| `GET` | `/api/admin/smart-docs/logs` | Logs do sistema |
| `GET` | `/api/admin/smart-docs/actions` | Histórico de ações |
| `GET` | `/api/admin/smart-docs/backup` | Listar backups |
| `POST` | `/api/admin/smart-docs/backup` | Criar backup |
| `DELETE` | `/api/admin/smart-docs/backup` | Remover backup |

---

## 📋 **Ações Disponíveis**

| Ação | Descrição | Exemplo |
|------|-----------|---------|
| `start` | Inicia o sistema | `{"action": "start", "userId": "dev"}`
| `stop` | Para o sistema | `{"action": "stop", "userId": "dev"}`
| `restart` | Reinicia o sistema | `{"action": "restart", "userId": "dev"}`
| `backup` | Cria backup | `{"action": "backup", "userId": "dev"}`
| `restore` | Restaura de backup | `{"action": "restore", "userId": "dev"}`

---

## ⚙️ **Configurações Importantes**

### **Diretórios Monitorados**
- `app/` - Páginas e componentes Next.js
- `lib/` - Bibliotecas e utilitários
- `components/` - Componentes React
- `supabase/` - Migrações e configurações

### **Níveis de Log**
- `debug` - Informações detalhadas
- `info` - Informações gerais
- `warn` - Avisos e alertas
- `error` - Erros e falhas

### **Frequência de Backup**
- `hourly` - A cada hora
- `daily` - Diariamente
- `weekly` - Semanalmente

---

## 💡 **Dicas Rápidas**

### **Desenvolvimento**
1. **Inicie o sistema** antes de começar a codar
2. **Configure diretórios** que você vai modificar
3. **Monitore logs** para ver mudanças detectadas
4. **Faça backup** antes de mudanças grandes

### **Produção**
1. **Configure backup automático** diário
2. **Monitore performance** regularmente
3. **Verifique logs** periodicamente
4. **Teste restore** em ambiente de staging

### **Debugging**
1. **Use logLevel debug** para informações detalhadas
2. **Verifique status** via API
3. **Monitore ações** em tempo real
4. **Use reset** em caso de problemas

---

## 📞 **Suporte Rápido**

### **Documentação Completa**
- **`SMART_DOCS_SYSTEM_COMPLETE.md`** - Documentação completa
- **`SMART_DOCS_GUIDE.md`** - Guia detalhado de uso

### **Comandos de Diagnóstico**
```bash
# Status completo
curl -X GET "http://localhost:3000/api/admin/smart-docs"

# Logs recentes
curl -X GET "http://localhost:3000/api/admin/smart-docs/logs?level=info"

# Histórico de ações
curl -X GET "http://localhost:3000/api/admin/smart-docs/actions"

# Listar backups
curl -X GET "http://localhost:3000/api/admin/smart-docs/backup"
```

### **Contatos de Emergência**
- **Logs**: Verificar arquivos de log
- **Status**: API de status do sistema
- **Reset**: DELETE /api/admin/smart-docs
- **Restore**: POST com action "restore"

---

*Guia de consulta rápida - Sistema de Documentação Inteligente v3.1.0*
