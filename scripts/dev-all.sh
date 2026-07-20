#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "Starting core (:8000) + portal (:8001) + backoffice (:8002)…"
exec npx concurrently -n core,portal,bo -c green,blue,magenta \
  "npm run start:dev --prefix core" \
  "npm run dev -w portal" \
  "npm run dev -w backoffice"
