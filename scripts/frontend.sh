#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/../frontend"
case "${1:-run}" in
  install) npm install ;;
  run) npm run dev ;;
  build) npm run build ;;
  preview) npm run preview ;;
  *) echo "Usage: $0 {install|run|build|preview}"; exit 2 ;;
esac
