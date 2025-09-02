#!/bin/bash

# Script para configurar as variáveis de ambiente do Supabase local

echo "Configurando variáveis de ambiente para Supabase local..."

# Criar arquivo .env.local
cat > .env.local << EOF
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0

# Supabase Service Role Key (for server-side operations)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU

# Database URL
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:54322/postgres

# Email Configuration (Inbucket for local development)
SMTP_HOST=127.0.0.1
SMTP_PORT=54325
SMTP_USER=test
SMTP_PASS=test

# Google OAuth (to be configured)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3001
NEXT_PUBLIC_SITE_URL=http://localhost:3001
EMAIL_DEV_FALLBACK=true
EOF

echo "✅ Arquivo .env.local criado com sucesso!"
echo "📧 Inbucket (emails) disponível em: http://127.0.0.1:54324"
echo "🔗 Supabase Studio disponível em: http://127.0.0.1:54323"


