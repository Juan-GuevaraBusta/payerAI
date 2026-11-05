#!/usr/bin/env bash
# Lanza un agente no interactivo en el worktree de una tarea del orquestador.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
TASK_ID="${1:?falta task_id}"
RUNNER="${2:-cursor-agent}"

export ORCH_ROLE=child

STATE="$ROOT/.orchestrator/state.json"
WORKTREE="$(python3 - <<PY
import json
from pathlib import Path
state = json.loads(Path("$STATE").read_text())
task = state["tasks"]["$TASK_ID"]
print(task.get("worktree") or "")
PY
)"
if [[ -z "$WORKTREE" || ! -d "$WORKTREE" ]]; then
  echo "no hay worktree para $TASK_ID; corre allocate o worktree primero" >&2
  exit 1
fi

export CI_ROOT="$WORKTREE"
cd "$WORKTREE"

PROMPT="$(python3 -m orchestrator --repo "$ROOT" prompt "$TASK_ID")"
LOG_DIR="$ROOT/.orchestrator/logs"
mkdir -p "$LOG_DIR"
LOG="$LOG_DIR/${TASK_ID}-$(date -u +%Y%m%dT%H%M%SZ).log"

case "$RUNNER" in
  cursor-agent)
    exec cursor-agent -p "$PROMPT" 2>&1 | tee "$LOG"
    ;;
  claude)
    exec claude -p "$PROMPT" 2>&1 | tee "$LOG"
    ;;
  *)
    echo "runner desconocido: $RUNNER (usa cursor-agent o claude)" >&2
    exit 1
    ;;
esac
