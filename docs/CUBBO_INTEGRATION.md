# Integração Cubbo - Yoobe Platform

## Visão Geral

A integração com Cubbo é o sistema principal de fulfillment da Yoobe Platform, responsável por gerenciar estoque, pedidos e logística para todas as lojas.

## Configuração

### 1. Credenciais da API

```bash
# Variáveis de ambiente necessárias
CUBBO_API_KEY=your_cubbo_api_key_here
CUBBO_BASE_URL=https://api.cubbo.com/v1
```

### 2. Configuração no Admin

1. Acesse `/admin/integracoes`
2. Configure as credenciais da Cubbo
3. Teste a conexão
4. Ative a sincronização automática

## Funcionalidades

### Gestão de Produtos

- **Sincronização Automática**: Produtos são sincronizados automaticamente com Cubbo
- **Gestão de Estoque**: Controle centralizado do estoque
- **Preços**: Sincronização de preços e disponibilidade

### Gestão de Pedidos

- **Criação Automática**: Pedidos são criados automaticamente na Cubbo
- **Rastreamento**: Status de entrega em tempo real
- **Fulfillment**: Processamento automático de pedidos

### Logs e Monitoramento

- **Logs de Sincronização**: Registro completo de todas as operações
- **Status de Integração**: Monitoramento em tempo real
- **Alertas**: Notificações de problemas

## APIs Disponíveis

### Produtos

```typescript
// Criar produto
POST /api/admin/cubbo-sync
{
  "type": "product",
  "action": "create",
  "data": {
    "name": "Produto Exemplo",
    "sku": "PROD001",
    "price": 99.90,
    "stock": 100
  }
}

// Sincronizar produtos
POST /api/admin/cubbo-sync
{
  "type": "products",
  "action": "sync"
}
```

### Estoque

```typescript
// Atualizar estoque
POST /api/admin/cubbo-sync
{
  "type": "inventory",
  "action": "update",
  "data": {
    "sku": "PROD001",
    "quantity": 50
  }
}
```

### Pedidos

```typescript
// Sincronizar pedidos
POST /api/admin/cubbo-sync
{
  "type": "orders",
  "action": "sync"
}
```

## Troubleshooting

### Problemas Comuns

1. **Erro de Autenticação**
   - Verifique se a API key está correta
   - Confirme se a URL base está correta

2. **Sincronização Falhando**
   - Verifique os logs em `/admin/integracoes`
   - Confirme se o produto existe na Cubbo

3. **Estoque Não Atualizado**
   - Aguarde alguns minutos para sincronização
   - Verifique se o SKU está correto

### Logs

Os logs de sincronização estão disponíveis em:
- **Tabela**: `product_sync_log`
- **Interface**: `/admin/integracoes`

## Suporte

Para suporte técnico:
- **Documentação Cubbo**: https://developers.cubbo.com/
- **Email**: suporte@yoobe.com
- **Status**: https://status.cubbo.com/
