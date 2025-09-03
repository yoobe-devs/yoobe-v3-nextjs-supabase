#!/usr/bin/env bash
set -euo pipefail

if ! curl -sf localhost:4040/api/tunnels >/dev/null 2>&1; then
  echo "[erro] API do ngrok não está acessível em localhost:4040. ngrok está rodando?"
  exit 1
fi

JSON=$(curl -sf localhost:4040/api/tunnels)

APP_URL=$(node -e "const d=JSON.parse(process.argv[1]); const t=d.tunnels.find(t=>t.name==='app'); console.log(t?t.public_url:'');" "$JSON")
SB_URL=$(node -e "const d=JSON.parse(process.argv[1]); const t=d.tunnels.find(t=>t.name==='supabase'); console.log(t?t.public_url:'');" "$JSON")

echo "Túneis detectados:"
echo "  App:       ${APP_URL:-<não encontrado>}"
echo "  Supabase:  ${SB_URL:-<não encontrado>}"

ok=0
if [ -n "$APP_URL" ]; then
  echo "\n[verificando] App (${APP_URL})"
  curl -IsS "$APP_URL" | head -n1 || true
  # Tenta health endpoint se existir
  if curl -sf "$APP_URL/api/health" >/dev/null 2>&1; then
    echo "[ok] /api/health respondeu"
  fi
  ok=$((ok+1))
fi

if [ -n "$SB_URL" ]; then
  echo "\n[verificando] Supabase (${SB_URL})"
  # GoTrue health
  curl -IsS "$SB_URL/auth/v1/health" | head -n1 || true
  ok=$((ok+1))
fi

if [ $ok -eq 0 ]; then
  echo "\n[falha] Não foi possível validar nenhum túnel."
  exit 1
else
  echo "\n[resumo] Verificação concluída. Se os status foram 200/301/302 está tudo ok."
fi

