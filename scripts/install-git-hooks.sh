#!/bin/bash

# Script para instalar hooks do Git para validação da documentação
# Este script configura hooks que verificam a qualidade da documentação

echo "🔧 Instalando hooks do Git para documentação técnica..."

# Verificar se estamos em um repositório Git
if [ ! -d ".git" ]; then
    echo "❌ Erro: Este diretório não é um repositório Git"
    echo "💡 Execute este script na raiz do repositório"
    exit 1
fi

# Criar diretório de hooks se não existir
HOOKS_DIR=".git/hooks"
if [ ! -d "$HOOKS_DIR" ]; then
    echo "❌ Erro: Diretório de hooks não encontrado"
    exit 1
fi

# Instalar pre-commit hook
PRE_COMMIT_HOOK="$HOOKS_DIR/pre-commit"
SCRIPT_HOOK="scripts/git-hooks/pre-commit"

if [ -f "$SCRIPT_HOOK" ]; then
    cp "$SCRIPT_HOOK" "$PRE_COMMIT_HOOK"
    chmod +x "$PRE_COMMIT_HOOK"
    echo "✅ Hook pre-commit instalado"
else
    echo "❌ Erro: Script do hook não encontrado: $SCRIPT_HOOK"
    exit 1
fi

# Criar hook post-commit para notificações
POST_COMMIT_HOOK="$HOOKS_DIR/post-commit"
cat > "$POST_COMMIT_HOOK" << 'EOF'
#!/bin/sh

# Git post-commit hook para notificações de documentação
# Este hook notifica sobre o status da documentação após cada commit

echo ""
echo "📚 Status da Documentação Técnica:"
echo "=================================="

# Verificar se a documentação foi modificada no commit
DOCS_CHANGED=$(git show --name-only --pretty=format: | grep -E '^docs/' | wc -l)

if [ "$DOCS_CHANGED" -gt 0 ]; then
    echo "✅ Documentação atualizada no commit"
    echo "📁 Arquivos modificados:"
    git show --name-only --pretty=format: | grep -E '^docs/'
else
    echo "ℹ️  Nenhuma mudança na documentação neste commit"
fi

# Verificar status geral da documentação
echo ""
echo "🔍 Verificação Rápida da Documentação:"

# Contar arquivos de documentação
DOC_COUNT=$(find docs/screens -name "*.md" | grep -v README.md | wc -l)
echo "📱 Telas documentadas: $DOC_COUNT/31"

# Verificar placeholders
PLACEHOLDERS=$(grep -r "{/\*.*\*/}" docs/screens/ | wc -l)
if [ "$PLACEHOLDERS" -gt 0 ]; then
    echo "⚠️  Placeholders pendentes: $PLACEHOLDERS"
    echo "💡 Execute: node scripts/generate-screen-docs.js"
else
    echo "✅ Sem placeholders pendentes"
fi

# Verificar screenshots
SCREENSHOTS_DIR="docs/screens/screenshots"
if [ -d "$SCREENSHOTS_DIR" ]; then
    SCREENSHOT_COUNT=$(find "$SCREENSHOTS_DIR" -name "*.png" | wc -l)
    echo "📸 Screenshots: $SCREENSHOT_COUNT"
    
    if [ "$SCREENSHOT_COUNT" -lt 5 ]; then
        echo "💡 Considere executar: node scripts/capture-screenshots.js"
    fi
else
    echo "📸 Screenshots: Diretório não encontrado"
    echo "💡 Execute: node scripts/capture-screenshots.js"
fi

echo ""
echo "📚 Para mais informações, consulte:"
echo "   - docs/DEVELOPER_GUIDE.md"
echo "   - docs/TEAM_TRAINING_GUIDE.md"
echo "   - docs/screens/README.md"
EOF

chmod +x "$POST_COMMIT_HOOK"
echo "✅ Hook post-commit instalado"

# Criar hook pre-push para validação final
PRE_PUSH_HOOK="$HOOKS_DIR/pre-push"
cat > "$PRE_PUSH_HOOK" << 'EOF'
#!/bin/sh

# Git pre-push hook para validação final da documentação
# Este hook verifica se a documentação está pronta para ser enviada

echo "🔍 Validação final da documentação antes do push..."

# Verificar se todos os arquivos obrigatórios existem
REQUIRED_FILES=(
    "docs/screens/README.md"
    "docs/DEVELOPER_GUIDE.md"
    "docs/SCREENSHOT_GUIDE.md"
    "docs/EXECUTIVE_SUMMARY.md"
    "docs/TEAM_TRAINING_GUIDE.md"
)

MISSING_FILES=0
for file in "${REQUIRED_FILES[@]}"; do
    if [ ! -f "$file" ]; then
        echo "❌ Arquivo obrigatório faltando: $file"
        MISSING_FILES=$((MISSING_FILES + 1))
    fi
done

if [ "$MISSING_FILES" -gt 0 ]; then
    echo ""
    echo "❌ $MISSING_FILES arquivos obrigatórios estão faltando"
    echo "💡 Execute: node scripts/generate-screen-docs.js"
    exit 1
fi

# Verificar se há placeholders não preenchidos
PLACEHOLDERS=$(grep -r "{/\*.*\*/}" docs/screens/ | wc -l)

if [ "$PLACEHOLDERS" -gt 0 ]; then
    echo "⚠️  $PLACEHOLDERS placeholders não preenchidos na documentação"
    echo "💡 Considere executar: node scripts/generate-screen-docs.js"
    echo ""
    echo "❓ Deseja continuar mesmo assim? (y/N)"
    read -r response
    if [[ ! "$response" =~ ^[Yy]$ ]]; then
        echo "🚫 Push cancelado"
        exit 1
    fi
fi

# Verificar cobertura da documentação
DOC_COUNT=$(find docs/screens -name "*.md" | grep -v README.md | wc -l)

if [ "$DOC_COUNT" -lt 30 ]; then
    echo "⚠️  Baixa cobertura de documentação: $DOC_COUNT/31 telas"
    echo "💡 Considere executar: node scripts/generate-screen-docs.js"
    echo ""
    echo "❓ Deseja continuar mesmo assim? (y/N)"
    read -r response
    if [[ ! "$response" =~ ^[Yy]$ ]]; then
        echo "🚫 Push cancelado"
        exit 1
    fi
fi

echo "✅ Documentação validada com sucesso!"
echo "🚀 Pronto para fazer push"
EOF

chmod +x "$PRE_PUSH_HOOK"
echo "✅ Hook pre-push instalado"

# Criar arquivo de configuração
GIT_CONFIG=".git/hooks/documentation-hooks.conf"
cat > "$GIT_CONFIG" << 'EOF'
# Configuração dos hooks de documentação técnica
# Instalado em: $(date)

HOOKS_INSTALLED=true
INSTALLATION_DATE=$(date)
VERSION=1.0.0

# Hooks instalados:
# - pre-commit: Verifica documentação antes do commit
# - post-commit: Notifica status após commit
# - pre-push: Validação final antes do push

# Para desinstalar, remova os arquivos:
# - .git/hooks/pre-commit
# - .git/hooks/post-commit
# - .git/hooks/pre-push
# - .git/hooks/documentation-hooks.conf
EOF

echo "✅ Arquivo de configuração criado"

# Verificar instalação
echo ""
echo "🔍 Verificando instalação dos hooks..."

if [ -x "$PRE_COMMIT_HOOK" ] && [ -x "$POST_COMMIT_HOOK" ] && [ -x "$PRE_PUSH_HOOK" ]; then
    echo "✅ Todos os hooks foram instalados com sucesso!"
    echo ""
    echo "📚 Hooks instalados:"
    echo "   - pre-commit: Validação antes do commit"
    echo "   - post-commit: Notificações após commit"
    echo "   - pre-push: Validação final antes do push"
    echo ""
    echo "🚀 Os hooks agora verificarão automaticamente a documentação!"
    echo ""
    echo "💡 Para testar, tente fazer um commit:"
    echo "   git add . && git commit -m 'Teste dos hooks'"
    echo ""
    echo "📖 Para mais informações, consulte:"
    echo "   - docs/DEVELOPER_GUIDE.md"
    echo "   - docs/TEAM_TRAINING_GUIDE.md"
else
    echo "❌ Erro na instalação dos hooks"
    exit 1
fi
