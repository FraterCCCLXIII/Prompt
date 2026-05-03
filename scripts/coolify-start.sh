#!/bin/sh
set -eu

export DATABASE_URL="${DATABASE_URL:-file:/data/prompt.db}"
export BIND_HOST="${BIND_HOST:-0.0.0.0}"
export PORT="${PORT:-3000}"

case "$DATABASE_URL" in
  file:*)
    database_path="${DATABASE_URL#file:}"
    database_dir="$(dirname "$database_path")"
    mkdir -p "$database_dir"
    ;;
esac

npm run prisma:deploy
npm run start -- -H "$BIND_HOST" -p "$PORT"
