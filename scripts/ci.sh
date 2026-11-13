#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

python3 -m unittest tests.test_orchestrator -v
python3 scripts/check_docs.py
python3 scripts/check_repo.py

if [ -f pnpm-lock.yaml ]; then
  if ! command -v pnpm >/dev/null 2>&1; then
    echo "pnpm no está instalado" >&2
    exit 1
  fi
  pnpm -s lint
  pnpm -s typecheck
  pnpm -s test
  pnpm -s build
fi
