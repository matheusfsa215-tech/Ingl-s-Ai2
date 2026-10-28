#!/usr/bin/env bash
# =====================================================================
# Fluentia · deploy assistido (Neon + Vercel) em um comando
#
#   bash scripts/deploy.sh
#
# O que faz, pela ordem:
#   1. pede a DATABASE_URL (string DIRETA do Neon, sem -pooler)
#   2. confirma a ligação e mostra o que falta
#   3. aplica o schema (drizzle-kit push)
#   4. verifica tabelas e coluna messages.meta
#   5. faz deploy de produção na Vercel
#      - se tiveres VERCEL_TOKEN, corre sem interação e define DATABASE_URL
#        (pooled) nos três ambientes automaticamente
#      - sem token, abre o login normal da Vercel no browser
#
# Pré-requisitos: Node.js LTS instalado, na pasta do projeto.
# =====================================================================
set -euo pipefail

cd "$(dirname "$0")/.."
green() { printf "\033[32m%s\033[0m\n" "$1"; }
yellow() { printf "\033[33m%s\033[0m\n" "$1"; }
red() { printf "\033[31m%s\033[0m\n" "$1"; }

echo "=============================================="
green " Fluentia · assistente de deploy"
echo "=============================================="

if ! command -v node >/dev/null 2>&1; then
  red "Node.js não encontrado. Instala a versão LTS em nodejs.org e volta a correr."
  exit 1
fi
echo "✓ Node $(node -v) · npm $(npm -v)"

# ---------------------------------------------------------------- 1. base
if [ -z "${DATABASE_URL:-}" ]; then
  echo
  echo "Neon → Connect → DESLIGA 'Connection pooling' → copia a connection string."
  read -r -p "Cola aqui a DATABASE_URL direta: " DATABASE_URL
fi

case "$DATABASE_URL" in
  *-pooler*) yellow "⚠ Esta é a string 'pooled'. Para criar tabelas devia ser a direta (sem -pooler). Continuo, mas se falhar usa a direta." ;;
esac

export DATABASE_URL
echo
echo "→ A verificar a base…"
node scripts/check-db.mjs || yellow "A base ainda não está pronta (vamos criar as tabelas a seguir)."

# ------------------------------------------------------------ 2. schema
echo
echo "→ A aplicar o schema (drizzle-kit push)…"
npx --yes drizzle-kit@0.31.10 push --config drizzle.config.prod.ts

echo
echo "→ A confirmar o resultado…"
if node scripts/check-db.mjs; then
  green "✓ Base de dados pronta."
else
  red "✕ A base continua incompleta. Alternativa sem terminal: cola drizzle/init-neon.sql no SQL Editor do Neon."
  exit 1
fi

# ----------------------------------------------------------- 3. destino
POOLED_URL="${POOLED_DATABASE_URL:-$DATABASE_URL}"
case "$POOLED_URL" in
  *-pooler*) : ;;
  *) yellow "⚠ não recebi a string pooled: a Vercel vai usar a direta. Funciona, mas o recomendado é a pooled (env POOLED_DATABASE_URL)." ;;
esac

echo
echo "→ Build local (garante que compila antes de publicar)…"
npm run build

echo
if [ -n "${VERCEL_TOKEN:-}" ]; then
  echo "→ A publicar com VERCEL_TOKEN (sem interação)…"
  VERCEL="npx --yes vercel@latest"
  $VERCEL link --yes --token "$VERCEL_TOKEN" >/dev/null 2>&1 || true
  for env in production preview development; do
    $VERCEL env rm DATABASE_URL "$env" --yes --token "$VERCEL_TOKEN" >/dev/null 2>&1 || true
    printf '%s' "$POOLED_URL" | $VERCEL env add DATABASE_URL "$env" --token "$VERCEL_TOKEN" >/dev/null 2>&1 || \
      yellow "⚠ não consegui definir DATABASE_URL em $env (define manualmente no painel)."
  done
  if [ -n "${OPENAI_API_KEY:-}" ]; then
    for env in production preview development; do
      printf '%s' "$OPENAI_API_KEY" | $VERCEL env add OPENAI_API_KEY "$env" --token "$VERCEL_TOKEN" >/dev/null 2>&1 || true
    done
  fi
  $VERCEL deploy --prod --yes --token "$VERCEL_TOKEN"
else
  yellow "Sem VERCEL_TOKEN: abre o login da Vercel. Aceita os valores por omissão (Next.js)."
  echo "Depois do primeiro link, define a variável no painel:"
  echo "  Vercel → Settings → Environment Variables → DATABASE_URL (pooled) → Redeploy"
  npx --yes vercel@latest --prod
fi

echo
green "✓ Concluído."
echo "Confirma em: https://o-teu-dominio.vercel.app/api/health  e  /diagnostico"
echo "Telemóvel: desinstala a app antiga + limpa dados do site no Chrome antes de reinstalar."
