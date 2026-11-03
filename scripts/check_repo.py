#!/usr/bin/env python3
"""Comprueba el estado mínimo del repositorio que espera el orquestador."""

from __future__ import annotations

import json
import os
import subprocess
import sys


def main() -> int:
    result = subprocess.run(
        [sys.executable, "-m", "orchestrator", "doctor"],
        capture_output=True,
        text=True,
        check=False,
    )
    if result.returncode != 0:
        print(result.stderr or result.stdout)
        return 1
    data = json.loads(result.stdout)
    errors = []
    if not data.get("has_commit"):
        errors.append("no hay commit")
    if not data.get("worktrees_ignored"):
        errors.append(".worktrees no está en .gitignore")
    if os.environ.get("CI") == "true" and data.get("dirty"):
        errors.append("el árbol de trabajo está sucio")
    if errors:
        print("doctor: " + ", ".join(errors))
        return 1
    print(
        "doctor OK: rama={branch} commit={has_commit} worktrees_ignored={worktrees_ignored}".format(
            **data
        )
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
