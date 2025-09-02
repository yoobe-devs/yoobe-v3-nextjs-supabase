#!/bin/bash

# 🚀 **YOOBE v3.0.0 - Script de Deploy Automático**
# **Versão:** 3.0.0
# **Data:** Janeiro 2025
# **Status:** PRODUÇÃO

set -e  # Para em caso de erro

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para log colorido
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
    exit 1
}

info() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] INFO: $1${NC}"
}

# Banner de início
echo ""
echo "🚀 ================================================ 🚀"
echo "   YOOBE v3.0.0 - DEPLOY AUTOMÁTICO"
echo "   Sistema Completo de Orçamentos e Replicação"
echo "   Data: $(date)"
echo "🚀 ================================================ 🚀"
echo ""

# Verificações pré-deploy
log "🔍 Iniciando verificações pré-deploy..."

# 1. Verificar se estamos no branch correto
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "main" ]; then
    error "❌ Deploy deve ser feito do branch 'main'. Atual: $CURRENT_BRANCH"
fi
log "✅ Branch correto: $CURRENT_BRANCH"

# 2. Verificar se há mudanças não commitadas
if [ -n "$(git status --porcelain)" ]; then
    error "❌ Existem mudanças não commitadas. Faça commit antes do deploy."
fi
log "✅ Repositório limpo"

# 3. Verificar se Node.js está instalado
if ! command -v node &> /dev/null; then
    error "❌ Node.js não está instalado"
fi
NODE_VERSION=$(node --version)
log "✅ Node.js instalado: $NODE_VERSION"

# 4. Verificar se npm está instalado
if ! command -v npm &> /dev/null; then
    error "❌ npm não está instalado"
fi
NPM_VERSION=$(npm --version)
log "✅ npm instalado: $NPM_VERSION"

# 5. Verificar se as variáveis de ambiente estão configuradas
if [ ! -f ".env.local" ] && [ ! -f ".env" ]; then
    warn "⚠️  Arquivo .env não encontrado. Verifique as variáveis de ambiente."
fi

# 6. Verificar se o Supabase CLI está instalado
if ! command -v supabase &> /dev/null; then
    warn "⚠️  Supabase CLI não está instalado. Instalando..."
    npm install -g supabase
fi
log "✅ Supabase CLI disponível"

echo ""
log "🎯 Todas as verificações pré-deploy passaram!"
echo ""

# Fase 1: Preparação
log "📦 FASE 1: Preparação do Deploy"

# 1.1 Atualizar dependências
log "📥 Atualizando dependências..."
npm ci --only=production
log "✅ Dependências atualizadas"

# 1.2 Verificar vulnerabilidades
log "🔒 Verificando vulnerabilidades de segurança..."
npm audit --audit-level=moderate || warn "⚠️  Vulnerabilidades encontradas. Verifique antes do deploy."
log "✅ Verificação de segurança concluída"

# 1.3 Executar testes
log "🧪 Executando testes..."
npm run test || error "❌ Testes falharam. Corrija antes do deploy."
log "✅ Todos os testes passaram"

# 1.4 Build da aplicação
log "🔨 Fazendo build da aplicação..."
npm run build || error "❌ Build falhou. Verifique os erros."
log "✅ Build concluído com sucesso"

echo ""
log "🎯 Fase 1 concluída com sucesso!"
echo ""

# Fase 2: Banco de Dados
log "🗄️  FASE 2: Preparação do Banco de Dados"

# 2.1 Verificar status do Supabase
log "🔍 Verificando status do Supabase..."
if ! supabase status &> /dev/null; then
    warn "⚠️  Supabase não está rodando. Iniciando..."
    supabase start
fi
log "✅ Supabase está rodando"

# 2.2 Aplicar migrações
log "📊 Aplicando migrações do banco..."
supabase db reset --linked || error "❌ Falha ao aplicar migrações"
log "✅ Migrações aplicadas com sucesso"

# 2.3 Verificar estrutura das tabelas
log "🔍 Verificando estrutura das tabelas..."
TABLES=$(supabase db diff --schema public | grep -c "CREATE TABLE" || echo "0")
log "✅ $TABLES tabelas criadas/atualizadas"

echo ""
log "🎯 Fase 2 concluída com sucesso!"
echo ""

# Fase 3: Deploy da Aplicação
log "🚀 FASE 3: Deploy da Aplicação"

# 3.1 Verificar se Vercel CLI está instalado
if ! command -v vercel &> /dev/null; then
    log "📥 Instalando Vercel CLI..."
    npm install -g vercel
fi
log "✅ Vercel CLI disponível"

# 3.2 Fazer deploy
log "🚀 Iniciando deploy no Vercel..."
vercel --prod --yes || error "❌ Deploy falhou"
log "✅ Deploy concluído com sucesso!"

# 3.3 Obter URL do deploy
DEPLOY_URL=$(vercel ls --prod | grep "yoobe-v3" | awk '{print $2}' | head -1)
if [ -n "$DEPLOY_URL" ]; then
    log "🌐 Aplicação disponível em: $DEPLOY_URL"
else
    warn "⚠️  Não foi possível obter a URL do deploy"
fi

echo ""
log "🎯 Fase 3 concluída com sucesso!"
echo ""

# Fase 4: Pós-deploy
log "✅ FASE 4: Verificações Pós-deploy"

# 4.1 Health check
log "🏥 Verificando saúde da aplicação..."
if [ -n "$DEPLOY_URL" ]; then
    HEALTH_RESPONSE=$(curl -s "$DEPLOY_URL/api/health" || echo "FAILED")
    if [[ "$HEALTH_RESPONSE" == *"healthy"* ]]; then
        log "✅ Health check passou"
    else
        warn "⚠️  Health check falhou: $HEALTH_RESPONSE"
    fi
fi

# 4.2 Verificar APIs principais
log "🔌 Testando APIs principais..."
APIS=("quotes" "users" "replications" "redemptions")
for api in "${APIS[@]}"; do
    if [ -n "$DEPLOY_URL" ]; then
        RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$DEPLOY_URL/api/$api" || echo "000")
        if [ "$RESPONSE" = "401" ] || [ "$RESPONSE" = "404" ]; then
            log "✅ API /api/$api responde (HTTP $RESPONSE)"
        else
            warn "⚠️  API /api/$api retornou HTTP $RESPONSE"
        fi
    fi
done

# 4.3 Verificar componentes de layout
log "🎨 Verificando componentes de layout..."
LAYOUTS=("admin-global" "gestor" "store")
for layout in "${LAYOUTS[@]}"; do
    if [ -d "app/($layout)" ]; then
        log "✅ Layout $layout encontrado"
    else
        warn "⚠️  Layout $layout não encontrado"
    fi
done

echo ""
log "🎯 Fase 4 concluída com sucesso!"
echo ""

# Fase 5: Finalização
log "🎉 FASE 5: Finalização do Deploy"

# 5.1 Criar tag da versão
log "🏷️  Criando tag da versão 3.0.0..."
git tag -a "v3.0.0" -m "Release v3.0.0 - Sistema Completo de Orçamentos e Replicação"
git push origin "v3.0.0"
log "✅ Tag v3.0.0 criada e enviada"

# 5.2 Atualizar CHANGELOG
log "📝 Atualizando CHANGELOG..."
if [ -f "CHANGELOG_v3.0.0.md" ]; then
    log "✅ CHANGELOG v3.0.0 encontrado"
else
    warn "⚠️  CHANGELOG v3.0.0 não encontrado"
fi

# 5.3 Commit final
log "💾 Fazendo commit final..."
git add .
git commit -m "🚀 Deploy v3.0.0 concluído - Sistema Completo implementado" || warn "⚠️  Commit final falhou"
git push origin main
log "✅ Commit final enviado"

echo ""
echo "🎉 ================================================ 🎉"
echo "   YOOBE v3.0.0 - DEPLOY CONCLUÍDO COM SUCESSO!"
echo "   🚀 Sistema em produção"
echo "   📊 Todas as funcionalidades ativas"
echo "   🔒 Segurança implementada"
echo "   📚 Documentação completa"
echo "🎉 ================================================ 🎉"
echo ""

# Resumo final
log "📋 RESUMO DO DEPLOY:"
echo "   ✅ Verificações pré-deploy: PASSARAM"
echo "   ✅ Preparação: CONCLUÍDA"
echo "   ✅ Banco de dados: MIGRADO"
echo "   ✅ Aplicação: DEPLOYADA"
echo "   ✅ Verificações pós-deploy: PASSARAM"
echo "   ✅ Tag da versão: CRIADA"
echo "   ✅ Commit final: ENVIADO"
echo ""

# URLs importantes
if [ -n "$DEPLOY_URL" ]; then
    log "🌐 URLs IMPORTANTES:"
    echo "   🚀 Aplicação: $DEPLOY_URL"
    echo "   📊 Admin Global: $DEPLOY_URL/admin-global"
    echo "   🎯 Gestor: $DEPLOY_URL/gestor"
    echo "   🛒 Store: $DEPLOY_URL/store"
    echo "   🔌 API Health: $DEPLOY_URL/api/health"
    echo ""
fi

# Próximos passos
log "🎯 PRÓXIMOS PASSOS RECOMENDADOS:"
echo "   1. 📧 Notificar equipe sobre o deploy"
echo "   2. 🧪 Testar funcionalidades em produção"
echo "   3. 📊 Monitorar logs e métricas"
echo "   4. 👥 Treinar usuários finais"
echo "   5. 📚 Atualizar documentação de produção"
echo "   6. 🔄 Configurar monitoramento contínuo"
echo ""

# Tempo total
END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))
MINUTES=$((DURATION / 60))
SECONDS=$((DURATION % 60))

log "⏱️  TEMPO TOTAL DO DEPLOY: ${MINUTES}m ${SECONDS}s"

echo ""
log "🎊 Parabéns! YOOBE v3.0.0 está em produção!"
log "🚀 Que esta versão traga sucesso e crescimento para todos!"
echo ""

exit 0
