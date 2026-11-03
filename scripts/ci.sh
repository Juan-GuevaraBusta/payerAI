#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

python3 -m unittest tests.test_orchestrator -v
python3 scripts/check_docs.py
python3 scripts/check_repo.py
