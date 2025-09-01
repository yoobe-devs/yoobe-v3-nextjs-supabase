#!/bin/bash

echo "🚀 Deploy Yoobe Platform v2.0.0"

# Build da aplicação
echo "📦 Build da aplicação..."
npm run build

# Verificar se o build foi bem-sucedido
if [ $? -eq 0 ]; then
    echo "✅ Build concluído com sucesso!"
    
    # Deploy (configurar conforme sua plataforma)
    echo "🌐 Deploy..."
    # npm run deploy  # ou vercel --prod
    
    echo "🎉 Deploy concluído!"
else
    echo "❌ Erro no build"
    exit 1
fi
