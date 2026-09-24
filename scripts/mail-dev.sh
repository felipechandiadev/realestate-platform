#!/usr/bin/env bash
# Start Mailpit for local SMTP if nothing is already listening on :1025/:8025.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
UI_URL="${MAILPIT_UI_URL:-http://localhost:8025}"
SMTP_PORT="${MAILPIT_SMTP_PORT:-1025}"

mailpit_ui_up() {
  curl -sf -o /dev/null --connect-timeout 1 --max-time 2 "$UI_URL/" 2>/dev/null
}

smtp_port_open() {
  if command -v nc >/dev/null 2>&1; then
    nc -z localhost "$SMTP_PORT" 2>/dev/null
  else
    # Fallback: bash /dev/tcp
    (echo >/dev/tcp/localhost/"$SMTP_PORT") >/dev/null 2>&1
  fi
}

if mailpit_ui_up && smtp_port_open; then
  echo "Mailpit already running (SMTP :${SMTP_PORT}, UI ${UI_URL}) — skipping docker compose."
  exit 0
fi

if mailpit_ui_up || smtp_port_open; then
  echo "Warning: partial Mailpit bind (UI or SMTP). Free ports ${SMTP_PORT}/8025 or stop the other process, then retry."
  echo "  lsof -nP -iTCP:${SMTP_PORT} -sTCP:LISTEN"
  echo "  lsof -nP -iTCP:8025 -sTCP:LISTEN"
  exit 1
fi

cd "$ROOT"
echo "Starting Mailpit via docker compose…"
docker compose -f docker-compose.mail.yml up -d
echo "Mailpit ready — SMTP :${SMTP_PORT}, UI ${UI_URL}"
