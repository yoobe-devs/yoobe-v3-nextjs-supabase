#!/usr/bin/env bash
set -euo pipefail

# Dispara um webhook interno para resetar o cache de API do Supabase
# Pré-requisitos:
#   - Defina a URL do webhook em SUPABASE_RESET_CACHE_WEBHOOK
#   - (Opcional) Defina o segredo em SUPABASE_RESET_CACHE_SECRET
#     Ele será enviado no header Authorization: Bearer <SEGREDO>

URL="${SUPABASE_RESET_CACHE_WEBHOOK:-}"
SECRET="${SUPABASE_RESET_CACHE_SECRET:-}"

if [[ -z "$URL" ]]; then
  echo "[erro] SUPABASE_RESET_CACHE_WEBHOOK não definido."
  echo "Defina-o para apontar para o seu endpoint interno de reset de cache"
  echo "Ex.: export SUPABASE_RESET_CACHE_WEBHOOK=\"https://<sua-api>/internal/supabase/reset-cache\""
  exit 2
fi

echo "[info] Chamando webhook de reset de cache: $URL"

H=("-H" "Content-Type: application/json")
if [[ -n "$SECRET" ]]; then
  H+=("-H" "Authorization: Bearer $SECRET")
fi

set +e
RESP=$(curl -sS -X POST "${H[@]}" --data '{"action":"reset-cache"}' "$URL")
CODE=$?
set -e

if [[ $CODE -ne 0 ]]; then
  echo "[erro] Falha ao chamar o webhook. curl exit=$CODE"
  exit $CODE
fi

echo "[ok] Webhook respondido: $RESP"

