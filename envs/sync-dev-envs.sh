#!/usr/bin/env bash
# Sync example env files into app env files (does not overwrite unless --force)
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
FORCE=0
[[ "${1:-}" == "--force" ]] && FORCE=1

sync_one() {
  local src="$1" dest="$2"
  if [[ -f "$dest" && "$FORCE" -ne 1 ]]; then
    echo "skip (exists): $dest"
    return
  fi
  cp "$src" "$dest"
  echo "wrote $dest"
}

sync_one "$ROOT/envs/portal.env.example" "$ROOT/portal/.env.local"
sync_one "$ROOT/envs/backoffice.env.example" "$ROOT/backoffice/.env.local"
sync_one "$ROOT/envs/core.env.example" "$ROOT/core/.env.example"

# If core/.env exists and --force, update PORT / URLs in place via rewrite of known keys
if [[ -f "$ROOT/core/.env" && "$FORCE" -eq 1 ]]; then
  echo "note: core/.env exists — set PORT=8000, PORTAL_URL, BACKOFFICE_URL manually if needed"
  echo "      see envs/core.env.example"
fi
