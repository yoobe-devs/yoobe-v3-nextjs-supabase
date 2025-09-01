# 🎮 Gamificação - Yoobe Platform

## 📋 Índice
- [Visão Geral](#visão-geral)
- [Plataformas Suportadas](#plataformas-suportadas)
- [Configuração](#configuração)
- [APIs](#apis)
- [Exemplos](#exemplos)
- [Troubleshooting](#troubleshooting)

---

## 🎯 Visão Geral

O sistema de gamificação da Yoobe Platform permite que empresas integrem pontos de reconhecimento, feedback e engajamento de equipes diretamente com a compra de brindes. Funcionários podem usar seus pontos acumulados para adquirir produtos na loja da empresa.

### 🏆 Benefícios

- **Engajamento**: Aumenta a participação em programas de reconhecimento
- **Retenção**: Melhora a retenção de talentos
- **Produtividade**: Incentiva comportamentos positivos
- **Satisfação**: Funcionários se sentem valorizados

---

## 🎪 Plataformas Suportadas

### ✅ Workvivo
**Foco**: Reconhecimento e recompensas

```typescript
interface WorkvivoConfig {
  apiKey: string
  baseUrl: string
  companyId: string
  features: {
    recognition: boolean
    rewards: boolean
    points: boolean
    leaderboards: boolean
  }
}
```

**Funcionalidades**:
- ✅ Sincronização de pontos
- ✅ Reconhecimento automático
- ✅ Leaderboards integrados
- ✅ Recompensas personalizadas

### ✅ Applause
**Foco**: Feedback e gamificação

```typescript
interface ApplauseConfig {
  apiKey: string
  baseUrl: string
  projectId: string
  features: {
    feedback: boolean
    gamification: boolean
    achievements: boolean
    badges: boolean
  }
}
```

**Funcionalidades**:
- ✅ Pontos por feedback
- ✅ Sistema de badges
- ✅ Achievements automáticos
- ✅ Gamificação de processos

### ✅ Human
**Foco**: Bem-estar e engajamento

```typescript
interface HumanConfig {
  apiKey: string
  baseUrl: string
  organizationId: string
  features: {
    wellness: boolean
    engagement: boolean
    challenges: boolean
    rewards: boolean
  }
}
```

**Funcionalidades**:
- ✅ Pontos por bem-estar
- ✅ Desafios de saúde
- ✅ Engajamento de equipes
- ✅ Recompensas por metas

---

## ⚙️ Configuração

### 1. Configuração no Admin Global

```bash
# Acesse as configurações de gamificação
http://localhost:3001/admin/integracoes
```

### 2. Configuração por Plataforma

#### Workvivo

```typescript
// Configuração Workvivo
const workvivoConfig = {
  apiKey: process.env.WORKVIVO_API_KEY,
  baseUrl: 'https://api.workvivo.com/v1',
  companyId: 'your_company_id',
  webhookUrl: 'https://api.yoobe.com/webhooks/workvivo',
  syncInterval: 300000, // 5 minutos
  features: {
    recognition: true,
    rewards: true,
    points: true,
    leaderboards: true
  }
}
```

#### Applause

```typescript
// Configuração Applause
const applauseConfig = {
  apiKey: process.env.APPLAUSE_API_KEY,
  baseUrl: 'https://api.applause.com/v1',
  projectId: 'your_project_id',
  webhookUrl: 'https://api.yoobe.com/webhooks/applause',
  syncInterval: 600000, // 10 minutos
  features: {
    feedback: true,
    gamification: true,
    achievements: true,
    badges: true
  }
}
```

#### Human

```typescript
// Configuração Human
const humanConfig = {
  apiKey: process.env.HUMAN_API_KEY,
  baseUrl: 'https://api.human.com/v1',
  organizationId: 'your_org_id',
  webhookUrl: 'https://api.yoobe.com/webhooks/human',
  syncInterval: 900000, // 15 minutos
  features: {
    wellness: true,
    engagement: true,
    challenges: true,
    rewards: true
  }
}
```

### 3. Configuração de Pontos

```typescript
// Configuração de conversão de pontos
const pointsConfig = {
  workvivo: {
    recognitionPoint: 10,    // 1 reconhecimento = 10 pontos
    rewardPoint: 50,         // 1 recompensa = 50 pontos
    leaderboardPoint: 5      // 1 posição = 5 pontos
  },
  applause: {
    feedbackPoint: 15,       // 1 feedback = 15 pontos
    achievementPoint: 100,   // 1 achievement = 100 pontos
    badgePoint: 25          // 1 badge = 25 pontos
  },
  human: {
    wellnessPoint: 20,       // 1 atividade = 20 pontos
    challengePoint: 200,     // 1 desafio = 200 pontos
    engagementPoint: 10      // 1 engajamento = 10 pontos
  }
}
```

---

## 🔌 APIs

### Sincronização de Pontos

#### GET /api/gamification/points/{userId}
```typescript
// Buscar pontos do usuário
GET /api/gamification/points/550e8400-e29b-41d4-a716-446655440040

// Resposta
{
  "success": true,
  "data": {
    "userId": "550e8400-e29b-41d4-a716-446655440040",
    "totalPoints": 1250,
    "breakdown": {
      "workvivo": 450,
      "applause": 300,
      "human": 500
    },
    "lastSync": "2024-01-17T10:30:00Z",
    "nextSync": "2024-01-17T10:35:00Z"
  }
}
```

#### POST /api/gamification/sync
```typescript
// Forçar sincronização
POST /api/gamification/sync
{
  "platform": "workvivo", // opcional
  "userId": "550e8400-e29b-41d4-a716-446655440040" // opcional
}

// Resposta
{
  "success": true,
  "data": {
    "syncedUsers": 45,
    "newPoints": 1250,
    "platforms": ["workvivo", "applause", "human"],
    "duration": "2.3s"
  }
}
```

### Webhooks

#### POST /api/webhooks/workvivo
```typescript
// Webhook Workvivo
POST /api/webhooks/workvivo
{
  "event": "recognition.created",
  "data": {
    "userId": "550e8400-e29b-41d4-a716-446655440040",
    "recognitionId": "rec_123",
    "points": 10,
    "message": "Excelente trabalho no projeto!"
  }
}
```

#### POST /api/webhooks/applause
```typescript
// Webhook Applause
POST /api/webhooks/applause
{
  "event": "feedback.submitted",
  "data": {
    "userId": "550e8400-e29b-41d4-a716-446655440040",
    "feedbackId": "fb_456",
    "points": 15,
    "category": "product_improvement"
  }
}
```

#### POST /api/webhooks/human
```typescript
// Webhook Human
POST /api/webhooks/human
{
  "event": "challenge.completed",
  "data": {
    "userId": "550e8400-e29b-41d4-a716-446655440040",
    "challengeId": "ch_789",
    "points": 200,
    "challengeName": "30 dias de exercícios"
  }
}
```

---

## 💡 Exemplos

### 1. Integração Workvivo

```typescript
// Serviço Workvivo
class WorkvivoService {
  private config: WorkvivoConfig

  constructor(config: WorkvivoConfig) {
    this.config = config
  }

  async syncUserPoints(userId: string): Promise<number> {
    try {
      // Buscar reconhecimentos
      const recognitions = await this.fetchRecognitions(userId)
      
      // Buscar recompensas
      const rewards = await this.fetchRewards(userId)
      
      // Calcular pontos
      const totalPoints = (recognitions.length * this.config.points.recognition) +
                         (rewards.length * this.config.points.reward)
      
      // Salvar no banco
      await this.saveUserPoints(userId, totalPoints, 'workvivo')
      
      return totalPoints
    } catch (error) {
      console.error('Erro ao sincronizar pontos Workvivo:', error)
      throw error
    }
  }

  private async fetchRecognitions(userId: string) {
    const response = await fetch(
      `${this.config.baseUrl}/recognitions?userId=${userId}`,
      {
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    )
    
    return response.json()
  }
}
```

### 2. Uso na Loja

```typescript
// Componente de pontos na loja
function PointsDisplay({ userId }: { userId: string }) {
  const [points, setPoints] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchPoints() {
      try {
        const response = await fetch(`/api/gamification/points/${userId}`)
        const data = await response.json()
        
        if (data.success) {
          setPoints(data.data.totalPoints)
        }
      } catch (error) {
        console.error('Erro ao buscar pontos:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPoints()
  }, [userId])

  if (loading) {
    return <div>Carregando pontos...</div>
  }

  return (
    <div className="points-display">
      <h3>Seus Pontos</h3>
      <div className="points-value">{points.toLocaleString()}</div>
      <div className="points-breakdown">
        <span>Workvivo: 450</span>
        <span>Applause: 300</span>
        <span>Human: 500</span>
      </div>
    </div>
  )
}
```

### 3. Checkout com Pontos

```typescript
// Processamento de checkout com pontos
async function processCheckoutWithPoints(orderData: OrderData) {
  try {
    // Verificar se tem pontos suficientes
    const userPoints = await fetchUserPoints(orderData.userId)
    const requiredPoints = orderData.items.reduce((total, item) => {
      return total + (item.points_cost * item.quantity)
    }, 0)

    if (userPoints < requiredPoints) {
      throw new Error('Pontos insuficientes')
    }

    // Criar pedido
    const order = await createOrder(orderData)

    // Deduzir pontos
    await deductPoints(orderData.userId, requiredPoints, {
      orderId: order.id,
      platform: 'mixed',
      description: `Compra na loja - Pedido #${order.id}`
    })

    // Enviar para fulfillment
    await sendToFulfillment(order)

    return order
  } catch (error) {
    console.error('Erro no checkout:', error)
    throw error
  }
}
```

---

## 🔧 Troubleshooting

### Problemas Comuns

#### 1. Pontos não sincronizando

```bash
# Verificar logs de sincronização
tail -f /var/log/yoobe/gamification-sync.log

# Forçar sincronização manual
curl -X POST http://localhost:3001/api/gamification/sync \
  -H "Content-Type: application/json" \
  -d '{"platform": "workvivo"}'
```

#### 2. Webhook não recebendo dados

```bash
# Verificar se o webhook está ativo
curl -X GET http://localhost:3001/api/webhooks/status

# Testar webhook manualmente
curl -X POST http://localhost:3001/api/webhooks/workvivo \
  -H "Content-Type: application/json" \
  -d '{"event": "test", "data": {"userId": "test"}}'
```

#### 3. Erro de autenticação

```bash
# Verificar credenciais
echo $WORKVIVO_API_KEY
echo $APPLAUSE_API_KEY
echo $HUMAN_API_KEY

# Testar conexão
curl -X GET https://api.workvivo.com/v1/health \
  -H "Authorization: Bearer $WORKVIVO_API_KEY"
```

### Logs do Sistema

```bash
# Logs de gamificação
pm2 logs yoobe-gamification

# Logs de webhooks
pm2 logs yoobe-webhooks

# Logs de sincronização
pm2 logs yoobe-sync
```

### Monitoramento

```bash
# Status das integrações
curl -X GET http://localhost:3001/api/gamification/status

# Métricas de pontos
curl -X GET http://localhost:3001/api/gamification/metrics

# Usuários com mais pontos
curl -X GET http://localhost:3001/api/gamification/leaderboard
```

---

## 📊 Métricas e Relatórios

### Dashboard de Gamificação

```typescript
// Métricas principais
interface GamificationMetrics {
  totalUsers: number
  totalPoints: number
  averagePointsPerUser: number
  topPlatform: string
  syncSuccessRate: number
  lastSyncTime: string
  nextSyncTime: string
}

// Relatórios disponíveis
const reports = {
  pointsByPlatform: 'Pontos por plataforma',
  pointsByUser: 'Pontos por usuário',
  pointsByTime: 'Pontos por período',
  conversionRate: 'Taxa de conversão',
  topUsers: 'Usuários com mais pontos',
  platformUsage: 'Uso das plataformas'
}
```

---

## 🚀 Próximas Funcionalidades

### v2.1.0 (Próxima)
- ✅ Webhooks em tempo real
- ✅ Dashboard avançado
- ✅ Relatórios detalhados
- ✅ Notificações push

### v2.2.0 (Futuro)
- 🤖 IA para recomendações
- 📱 Mobile app
- 🎯 Gamificação personalizada
- 🔄 Sincronização bidirecional

---

## 📞 Suporte

### Contatos

- **Email**: suporte@yoobe.com
- **Documentação**: https://docs.yoobe.com/gamification
- **Status**: https://status.yoobe.com

### Recursos Adicionais

- [API Reference](../API_REFERENCE.md)
- [Cubbo Integration](./CUBBO_INTEGRATION.md)
- [Platform Overview](./PLATFORM_OVERVIEW.md)

---

## 🎉 Conclusão

O sistema de gamificação da Yoobe Platform oferece uma solução completa para integração com plataformas populares de reconhecimento e engajamento. Com APIs robustas e webhooks em tempo real, sua empresa pode criar uma experiência única de recompensas para seus funcionários.

**Versão atual**: v2.0.0  
**Última atualização**: Janeiro 2024  
**Status**: ✅ Produção
