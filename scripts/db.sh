#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/../backend"
case "${1:-apply}" in
  apply) node scripts/apply-schema.js ;;
  reset) psql "$DATABASE_URL" -f scripts/reset-schema.sql && node scripts/apply-schema.js ;;
  seed) node scripts/seed-admin.js ;;
  maintenance) node scripts/nightly-maintenance.js ;;
  *) echo "Usage: $0 {apply|reset|seed|maintenance}"; exit 2 ;;
esac
