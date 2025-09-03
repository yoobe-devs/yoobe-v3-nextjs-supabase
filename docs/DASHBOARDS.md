# 📊 Dashboards e Métricas (v3)

Métricas executivas e operacionais por empresa com base em consultas agregadas.

## Fontes
- `app/api/gestor/stats/route.ts`: KPIs do gestor
- Notificações/Auditoria para atividades recentes

## Recomendações
- SWR/ISR para caching
- Canais em tempo real para eventos críticos

### Exemplo de consumo (cliente)
```ts
const res = await fetch(`/api/gestor/stats?company_id=${companyId}`)
const { stats } = await res.json()
```

## Referências de código
- `app/gestor/dashboard/page.tsx`
- `app/api/gestor/stats/route.ts`

---
Última atualização: v3.1.0
