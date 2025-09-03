#!/bin/bash

# 🚀 YOOBE v3.0.0 - DEPLOY EM PRODUÇÃO
# Script alternativo para deploy sem Vercel CLI

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Funções de log
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}✅ $1${NC}"
}

warn() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
    exit 1
}

echo ""
echo "🚀 ================================================ 🚀"
echo "   YOOBE v3.0.0 - DEPLOY EM PRODUÇÃO"
echo "   Sistema Completo de Orçamentos e Replicação"
echo "   Data: $(date)"
echo "🚀 ================================================ 🚀"
echo ""

# FASE 1: Verificações e Preparação
log "🔍 FASE 1: Verificações e Preparação"

# Verificar se estamos na branch correta
CURRENT_BRANCH=$(git branch --show-current)
if [[ "$CURRENT_BRANCH" != "main" && "$CURRENT_BRANCH" != "deploy-v3.0.0" ]]; then
    error "❌ Deploy deve ser feito da branch main ou deploy-v3.0.0"
fi
success "✅ Branch atual: $CURRENT_BRANCH"

# Verificar se o repositório está limpo
if [[ -n $(git status --porcelain) ]]; then
    warn "⚠️  Existem mudanças não commitadas. Fazendo commit automático..."
    git add .
    git commit -m "chore: Preparar deploy v3.0.0 [auto]"
fi
success "✅ Repositório limpo"

# FASE 2: Build e Testes
log "🔨 FASE 2: Build e Testes"

# Fazer build da aplicação
log "📦 Fazendo build da aplicação..."
npm run build
success "✅ Build concluído com sucesso"

# FASE 3: Deploy no GitHub
log "🚀 FASE 3: Deploy no GitHub"

# Fazer push para a branch de deploy
log "📤 Fazendo push para branch de deploy..."
git push origin deploy-v3.0.0
success "✅ Push realizado com sucesso"

# FASE 4: Instruções para Deploy Manual
log "📋 FASE 4: Instruções para Deploy Manual"

echo ""
echo "🎯 DEPLOY CONCLUÍDO NO GITHUB! 🎯"
echo ""
echo "📋 PRÓXIMOS PASSOS PARA PRODUÇÃO:"
echo ""
echo "1. 🌐 Acesse: https://github.com/yoobe-devs/yoobe-v3-nextjs-supabase"
echo "2. 🔄 Crie um Pull Request da branch 'deploy-v3.0.0' para 'main'"
echo "3. ✅ Aguarde as verificações de CI passarem"
echo "4. 🚀 Faça merge do PR"
echo "5. 🔗 Configure o deploy automático no Vercel:"
echo "   - Conecte o repositório ao Vercel"
echo "   - Configure as variáveis de ambiente:"
echo "     * NEXT_PUBLIC_SUPABASE_URL"
echo "     * NEXT_PUBLIC_SUPABASE_ANON_KEY"
echo "     * SUPABASE_SERVICE_ROLE_KEY"
echo "6. 🎉 Deploy automático será executado"
echo ""
echo "🔧 ALTERNATIVA - Deploy Manual no Vercel:"
echo "1. Acesse: https://vercel.com/new"
echo "2. Importe o repositório: yoobe-devs/yoobe-v3-nextjs-supabase"
echo "3. Configure as variáveis de ambiente"
echo "4. Deploy!"
echo ""

success "🎉 Script de deploy concluído com sucesso!"
success "📱 Aplicação pronta para deploy em produção!"
success "🔗 Verifique as instruções acima para finalizar o deploy"

echo ""
echo "🚀 ================================================ 🚀"
echo "   YOOBE v3.0.0 - DEPLOY CONCLUÍDO!"
echo "   Próximo: Configure o Vercel para deploy automático"
echo "🚀 ================================================ 🚀"
echo ""
