#!/usr/bin/env bash

# Yoobe v3 — Dev with ngrok
# - Abre túneis ngrok para o app (porta 3001 por padrão) e, opcionalmente, para o Supabase local (54321)
# - Atualiza .env.local com as URLs públicas
# - Inicia o Next.js em modo dev

set -euo pipefail

NO_SB=false
APP_PORT=${APP_PORT:-3001}
SB_PORT=${SB_PORT:-54321}

while [[ ${1-} ]]; do
  case "$1" in
    --no-supabase)
      NO_SB=true; shift ;;
    --port)
      APP_PORT="$2"; shift 2 ;;
    --sb-port)
      SB_PORT="$2"; shift 2 ;;
    -h|--help)
      cat <<EOF
Uso: bash scripts/dev-with-ngrok.sh [opções]

Opções:
  --no-supabase        Não cria túnel para Supabase local (use se seu Supabase for hospedado)
  --port <n>           Porta do app Next.js (padrão: 3001)
  --sb-port <n>        Porta do Supabase local (padrão: 54321)
  -h, --help           Mostra esta ajuda

Pré-requisitos:
  - ngrok instalado e autenticado (ngrok config add-authtoken <TOKEN>)
  - Node/Next instalados
  - Supabase local rodando (se não usar --no-supabase)
EOF
      exit 0 ;;
    *)
      echo "Argumento desconhecido: $1"; exit 1 ;;
  esac
done

if ! command -v ngrok >/dev/null 2>&1; then
  echo "[erro] ngrok não encontrado. Instale com: brew install ngrok (macOS) ou baixe em https://ngrok.com/download"
  exit 1
fi

if ! ngrok config check >/dev/null 2>&1; then
  echo "[erro] ngrok não autenticado. Rode: ngrok config add-authtoken <TOKEN>"
  exit 1
fi

CFG="$(mktemp -t ngrok-yoobe-XXXX.yml)"
{
  echo 'version: "2"'
  echo 'tunnels:'
  echo '  app:'
  echo '    proto: http'
  echo "    addr: ${APP_PORT}"
  if [ "$NO_SB" = false ]; then
    echo '  supabase:'
    echo '    proto: http'
    echo "    addr: ${SB_PORT}"
  fi
} > "$CFG"

echo "[info] Iniciando ngrok..."
ngrok start --all --config "$CFG" --log=stdout > /tmp/ngrok-yoobe.log 2>&1 &
NGROK_PID=$!

cleanup() {
  kill "$NGROK_PID" >/dev/null 2>&1 || true
  rm -f "$CFG" >/dev/null 2>&1 || true
}
trap cleanup EXIT

# Aguarda API do ngrok (localhost:4040)
for i in {1..40}; do
  if curl -sf localhost:4040/api/tunnels >/dev/null 2>&1; then break; fi
  sleep 1
done

JSON=$(curl -sf localhost:4040/api/tunnels || true)
if [ -z "$JSON" ]; then
  echo "[erro] Não foi possível acessar a API do ngrok (localhost:4040). Veja /tmp/ngrok-yoobe.log"; exit 1
fi

# Extrai URLs públicas usando Node (disponível no projeto)
APP_URL=$(node -e "const d=JSON.parse(process.argv[1]); const t=d.tunnels.find(t=>t.name==='app'); console.log(t?t.public_url:'');" "$JSON")
if [ -z "$APP_URL" ]; then
  echo "[erro] Falha ao obter URL do túnel do app. Veja /tmp/ngrok-yoobe.log"; exit 1
fi

if [ "$NO_SB" = false ]; then
  SB_URL=$(node -e "const d=JSON.parse(process.argv[1]); const t=d.tunnels.find(t=>t.name==='supabase'); console.log(t?t.public_url:'');" "$JSON")
  if [ -z "$SB_URL" ]; then
    echo "[erro] Falha ao obter URL do túnel do Supabase. Veja /tmp/ngrok-yoobe.log"; exit 1
  fi
else
  # Mantém a URL já definida, se existir
  SB_URL=${NEXT_PUBLIC_SUPABASE_URL-}
  if [ -z "$SB_URL" ] && [ -f .env.local ]; then
    SB_URL=$(grep '^NEXT_PUBLIC_SUPABASE_URL=' .env.local | cut -d= -f2- || true)
  fi
fi

# Backup e atualização do .env.local
cp .env.local ".env.local.bak.$(date +%s)" 2>/dev/null || true
node - <<'NODE' "$APP_URL" "$SB_URL"
const fs = require('fs');
const app = process.argv[1];
const sb  = process.argv[2] || '';
let lines = [];
try { lines = fs.readFileSync('.env.local','utf8').split(/\r?\n/); } catch {}
function set(k,v){ if(!v) return; let found=false; lines = lines.map(l => l.startsWith(k+'=') ? (found=true, `${k}=${v}`) : l); if(!found) lines.push(`${k}=${v}`); }
set('NEXT_PUBLIC_APP_URL', app);
set('NEXT_PUBLIC_SITE_URL', app);
if (sb) set('NEXT_PUBLIC_SUPABASE_URL', sb);
fs.writeFileSync('.env.local', lines.join('\n'));
NODE

echo ""
echo "URLs públicas:"
echo "  App:       $APP_URL"
if [ "$NO_SB" = false ]; then echo "  Supabase:  $SB_URL"; fi
echo ""
echo "[info] Iniciando Next.js (dev) na porta $APP_PORT..."
echo "[dica] Para encerrar, pressione Ctrl+C (o ngrok será encerrado automaticamente)."
echo ""

npm run dev -- -p "$APP_PORT"

