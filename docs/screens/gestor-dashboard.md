# 👥 Tela: Dashboard do Gestor

## 🎯 Identificação e Finalidade

**Nome da Tela**: Dashboard do Gestor  
**Rota**: `/gestor/dashboard`  
**Objetivo Funcional**: Fornecer visão geral da empresa para gestores, com métricas de funcionários, produtos, orçamentos e pedidos  
**Público-Alvo**: Gestores de empresa, administradores de loja, supervisores  
**Regra de Negócio**: Dashboard específico por empresa (multi-tenancy) com foco em operações diárias e gestão de equipe

## 📋 Campos e Comportamentos

### Campos Exibidos

#### Estatísticas Principais (Cards)
- **Total de Usuários**: 156 funcionários cadastrados
- **Total de Produtos**: 89 produtos ativos
- **Total de Orçamentos**: 23 orçamentos em andamento
- **Total de Pedidos**: 67 pedidos processados
- **Usuários Ativos**: 142 funcionários ativos
- **Orçamentos Pendentes**: 5 aguardando aprovação
- **Pedidos Concluídos**: 58 pedidos finalizados
- **Receita**: R$ 12.450,00 total

#### Atividade Recente
- **ID**: Identificador único da atividade
- **Tipo**: user, quote, order, product
- **Ação**: Descrição da atividade realizada
- **Usuário**: Nome do funcionário responsável
- **Tempo**: Tempo relativo da ocorrência

#### Ações Rápidas
- **Novo Produto**: Botão para cadastrar produto
- **Novo Funcionário**: Botão para cadastrar funcionário
- **Ver Detalhes**: Links para visualizações específicas

### Comportamentos Dinâmicos

#### Estados dos Dados
- **Dados Estáticos**: Estatísticas carregadas via useState
- **Atividades**: Lista de atividades recentes
- **Responsividade**: Layout adaptativo para diferentes telas

#### Interações
- **Hover Effects**: Cards com efeitos visuais
- **Navegação**: Links para telas específicas
- **Botões de Ação**: Acesso rápido a funcionalidades

## 🔌 Integrações Técnicas

### APIs Chamadas
- **Dados Mockados**: Estatísticas e atividades são simuladas localmente
- **Futuras Integrações**:
  - `/api/gestor/stats/{companyId}` - Métricas da empresa
  - `/api/gestor/activity/{companyId}` - Atividades recentes
  - `/api/gestor/users/{companyId}` - Lista de funcionários

### Componentes Utilizados
```tsx
// UI Components
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

// Icons
import { 
  Users, Package, FileText, ShoppingCart,
  TrendingUp, Plus, Eye
} from 'lucide-react'

// Navigation
import Link from 'next/link'
```

### Hooks e Lógica
- **useState**: Controle de estado dos dados
- **Funções Utilitárias**:
  - `getActivityIcon()`: Retorna ícone baseado no tipo
  - `getActivityColor()`: Retorna cor baseada no tipo

## 🚀 Fluxo e Navegação

### Origem
- **Login Gestor**: Após autenticação bem-sucedida
- **Menu Lateral**: Link "Dashboard" no menu de navegação
- **Outras Telas**: Botão "Voltar ao Dashboard"

### Destino
- **Usuários**: `/gestor/usuarios` - Gestão de funcionários
- **Produtos**: `/gestor/produtos` - Gestão de produtos
- **Orçamentos**: `/gestor/orcamentos` - Sistema de orçamentos
- **Pedidos**: `/gestor/pedidos` - Acompanhamento de pedidos

### Comportamentos Esperados

#### Ao Carregar a Página
1. Verifica autenticação do gestor
2. Carrega dados da empresa específica
3. Renderiza dashboard com métricas
4. Exibe atividades recentes

#### Ao Clicar em Botão de Ação
1. Navega para tela específica
2. Passa contexto da empresa
3. Mantém estado de navegação

#### Ao Visualizar Atividades
1. Exibe detalhes da atividade
2. Permite ações contextuais
3. Atualiza em tempo real

## 📸 Screenshot e Interface

### Layout da Tela
```
┌─────────────────────────────────────────────────────────────┐
│ 👥 Dashboard do Gestor                                     │
│ Bem-vindo de volta! Aqui está o resumo da sua empresa.    │
│ [Novo Produto] [Novo Funcionário]                         │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐          │
│ │ 👥 156  │ │ 📦 89   │ │ 📋 23   │ │ 🛒 67   │          │
│ │Usuários │ │Produtos │ │Orçament.│ │ Pedidos │          │
│ │ 142 at. │ │         │ │ 5 pend. │ │58 concl.│          │
│ └─────────┘ └─────────┘ └─────────┘ └─────────┘          │
│ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐          │
│ │ 📈 R$   │ │ 👁️ Ver │ │ 👁️ Ver │ │ 👁️ Ver │          │
│ │12.450,00│ │Detalhes│ │Detalhes│ │Detalhes│          │
│ │Receita  │ │         │ │         │ │         │          │
│ └─────────┘ └─────────┘ └─────────┘ └─────────┘          │
├─────────────────────────────────────────────────────────────┤
│ 📊 Atividade Recente                                       │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 👥 Novo funcionário cadastrado                          │ │
│ │ João Silva | 2 horas atrás                             │ │
│ └─────────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 📋 Orçamento aprovado                                   │ │
│ │ Maria Santos | 4 horas atrás                           │ │
│ └─────────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 🛒 Pedido enviado                                        │ │
│ │ Pedro Costa | 6 horas atrás                            │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Elementos Visuais
- **Header**: Título principal com descrição e botões de ação
- **Cards de Métricas**: 8 cards com estatísticas principais
- **Seção de Atividades**: Lista cronológica de eventos recentes
- **Ícones Contextuais**: Representação visual de cada categoria
- **Cores por Tipo**: Diferenciação visual por categoria de atividade

## 🧪 Dados de Teste

### Estrutura dos Dados
```typescript
interface GestorStats {
  totalUsers: number
  totalProducts: number
  totalQuotes: number
  totalOrders: number
  activeUsers: number
  pendingQuotes: number
  completedOrders: number
  revenue: string
}

interface RecentActivity {
  id: number
  type: 'user' | 'quote' | 'order' | 'product'
  action: string
  user: string
  time: string
}
```

### Dados Mockados
- **Usuários**: 156 total, 142 ativos
- **Produtos**: 89 produtos ativos
- **Orçamentos**: 23 total, 5 pendentes
- **Pedidos**: 67 total, 58 concluídos
- **Receita**: R$ 12.450,00

## 🔄 Histórico da Funcionalidade

### Timeline de Evolução

| Data | Versão | Tipo | Descrição |
|------|--------|------|-----------|
| 2025-09-02 | v3.1.0 | 🚀 Feature | Dashboard completo para gestores com multi-tenancy |
| 2025-08-25 | v2.9.8 | ✨ Melhorias | Adição de métricas de receita e conversão |
| 2025-08-15 | v2.9.5 | 🛠️ Refactor | Otimização de performance e responsividade |
| 2025-08-01 | v2.9.0 | 🚀 Feature | Sistema de atividades recentes em tempo real |
| 2025-07-20 | v2.8.0 | 🐛 Fix | Correção de bugs de carregamento de dados |

## 🚀 Melhorias Futuras Sugeridas

### Funcionalidades
1. **Gráficos Interativos**: Charts para métricas de crescimento
2. **Filtros de Período**: Seleção de datas para análises
3. **Export de Relatórios**: PDF, CSV das métricas
4. **Alertas**: Notificações para métricas críticas
5. **Personalização**: Widgets configuráveis por gestor

### Técnicas
1. **Real-time Updates**: WebSockets para dados em tempo real
2. **Caching**: Redis para otimização de performance
3. **Analytics**: Integração com ferramentas de business intelligence
4. **Responsividade**: Melhorias para tablets e mobile
5. **Acessibilidade**: ARIA labels e navegação por teclado

## 🔗 Relacionamentos

### Telas Relacionadas
- **Usuários**: Gestão completa de funcionários
- **Produtos**: Catálogo e estoque da empresa
- **Orçamentos**: Sistema de aprovação e gestão
- **Pedidos**: Processamento e acompanhamento
- **Relatórios**: Analytics avançados da empresa

### Integrações
- **Sistema de Autenticação**: Verificação de permissões por empresa
- **Multi-tenancy**: Isolamento de dados por empresa
- **Base de Dados**: Consultas específicas por tenant
- **Sistema de Notificações**: Alertas e avisos da empresa
- **Audit Log**: Rastreamento de ações dos gestores

## 📊 Métricas de Performance

### Indicadores Chave
- **Tempo de Carregamento**: < 1.5 segundos
- **Disponibilidade**: 99.9%
- **Usuários Simultâneos**: Suporte a 50+ gestores por empresa
- **Atualizações**: Dados atualizados a cada 3 minutos

### Monitoramento
- **Uptime**: Verificação contínua de disponibilidade
- **Performance**: Métricas de renderização e API
- **Erros**: Logs de erros e exceções
- **Usuários**: Analytics de uso por empresa

## 🏢 Contexto Multi-Tenant

### Isolamento de Dados
- **Empresa ID**: Cada gestor vê apenas dados da sua empresa
- **RLS**: Row Level Security na base de dados
- **Permissões**: Controle granular por função e empresa
- **Auditoria**: Rastreamento de todas as ações por tenant

### Escalabilidade
- **Arquitetura**: Suporte a múltiplas empresas simultâneas
- **Performance**: Otimizações específicas por tenant
- **Backup**: Estratégias de backup isoladas por empresa
- **Compliance**: Conformidade com regulamentações por região
