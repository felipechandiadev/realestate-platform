#!/usr/bin/env bash
# Redeploy local del repositorio ya clonado en el VPS.
# No hace git pull ni push. Solo:
#  1) corta procesos PM2
#  2) hace build desde cada carpeta
#  3) arranca con los puertos/vars del .env actual
#
# Uso:
#   bash deploy/redeploy-local.sh
#   PM2_CORE=core PM2_PORTAL=portal PM2_BACKOFFICE=backoffice bash deploy/redeploy-local.sh

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

# En este VPS los procesos reales usan nombres del proyecto, no los genéricos del repo.
PM2_CORE="${PM2_CORE:-rlst-core}"
PM2_PORTAL="${PM2_PORTAL:-rlst-portal}"
PM2_BACKOFFICE="${PM2_BACKOFFICE:-rlst-backoffice}"

echo "==> Repo: $ROOT_DIR"
echo "==> Node: $(node -v)"
echo "==> PM2 names: $PM2_CORE | $PM2_PORTAL | $PM2_BACKOFFICE"

echo "==> Stop PM2 targets"
for name in "$PM2_CORE" "$PM2_PORTAL" "$PM2_BACKOFFICE"; do
  if pm2 show "$name" >/dev/null 2>&1; then
    echo "Stopping $name"
    pm2 stop "$name" >/dev/null 2>&1 || true
    pm2 delete "$name" >/dev/null 2>&1 || true
  fi
done

echo "==> Build core"
cd "$ROOT_DIR/core"
if [[ -f .env ]]; then
  set -a
  source .env
  set +a
fi
if [[ ! -x "node_modules/.bin/nest" ]]; then
  echo "Nest CLI not found in core; installing dependencies first..."
  npm install --legacy-peer-deps
fi
if [[ ! -x "node_modules/.bin/nest" ]]; then
  echo "ERROR: Nest CLI still missing after install. Review core dependencies and lockfile."
  exit 1
fi
npm run build
pm2 start "node dist/main" --name "$PM2_CORE"

echo "==> Build portal"
cd "$ROOT_DIR"
if ! npm exec --workspace portal -- next --version >/dev/null 2>&1; then
  echo "Next workspace portal not available; installing monorepo dependencies first..."
  npm install --legacy-peer-deps
fi
if ! npm exec --workspace portal -- next --version >/dev/null 2>&1; then
  echo "ERROR: Next CLI still missing after monorepo install. Review workspace dependencies and lockfile."
  exit 1
fi
cd "$ROOT_DIR/portal"
if [[ -f .env.local ]]; then
  set -a
  source .env.local
  set +a
fi
npm run build
PORT=8001 HOST=0.0.0.0 pm2 start "npm run start" --name "$PM2_PORTAL"

echo "==> Build backoffice"
cd "$ROOT_DIR"
if ! npm exec --workspace backoffice -- next --version >/dev/null 2>&1; then
  echo "Next workspace backoffice not available; installing monorepo dependencies first..."
  npm install --legacy-peer-deps
fi
if ! npm exec --workspace backoffice -- next --version >/dev/null 2>&1; then
  echo "ERROR: Next CLI still missing after monorepo install. Review workspace dependencies and lockfile."
  exit 1
fi
cd "$ROOT_DIR/backoffice"
if [[ -f .env.local ]]; then
  set -a
  source .env.local
  set +a
fi
npm run build
PORT=8002 HOST=0.0.0.0 pm2 start "npm run start" --name "$PM2_BACKOFFICE"

echo "==> PM2 status"
pm2 list

echo "==> Local redeploy completado"
