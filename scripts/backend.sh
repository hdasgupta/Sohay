#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/../backend"
case "${1:-run}" in
  install) npm install ;;
  run) npm run dev ;;
  start) npm start ;;
  build) echo "Backend is Node/ESM; no compile step is required." ;;
  *) echo "Usage: $0 {install|run|start|build}"; exit 2 ;;
esac
