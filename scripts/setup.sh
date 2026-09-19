#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cp -n "$ROOT/backend/.env.example" "$ROOT/backend/.env" 2>/dev/null || true
cp -n "$ROOT/frontend/.env.example" "$ROOT/frontend/.env" 2>/dev/null || true
chmod +x "$ROOT/scripts"/*.sh
(cd "$ROOT/backend" && npm install)
(cd "$ROOT/frontend" && npm install)
echo "Setup complete. Fill backend/.env and frontend/.env, then run scripts/db.sh apply."
