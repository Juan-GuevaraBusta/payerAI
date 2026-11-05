#!/usr/bin/env python3
"""Valida enlaces relativos, marcadores de conflicto y artefactos versionados."""

from __future__ import annotations

import os
import re
import subprocess
import sys
from pathlib import Path
from urllib.parse import unquote

ROOT = Path(__file__).resolve().parents[1]
EXCLUDED_DIRS = {".git", ".worktrees", ".orchestrator", "__pycache__", ".venv", "node_modules"}
LINK_RE = re.compile(r"\]\(([^)]+)\)")
CONFLICT_MARKERS = ("<<<<<<<", ">>>>>>>")


def repo_root() -> Path:
    return Path(os.environ.get("CI_ROOT", ROOT)).resolve()


def iter_markdown_files(root: Path):
    root = root.resolve()
    for path in sorted(root.rglob("*.md")):
        try:
            rel_parts = path.resolve().relative_to(root).parts
        except ValueError:
            continue
        if any(part in EXCLUDED_DIRS for part in rel_parts):
            continue
        yield path


def check_links(path: Path, root: Path) -> list[str]:
    errors = []
    text = path.read_text(encoding="utf-8")
    for lineno, line in enumerate(text.splitlines(), 1):
        for raw in LINK_RE.findall(line):
            target = raw.strip()
            if target.startswith("<") and target.endswith(">"):
                target = target[1:-1]
            if not target or target.startswith(("#", "http://", "https://", "mailto:", "tel:")):
                continue
            target = target.split()[0]
            target = target.split("#", 1)[0].split("?", 1)[0]
            target = unquote(target)
            if not target:
                continue
            candidate = (root / target.lstrip("/")) if target.startswith("/") else (path.parent / target)
            if not candidate.resolve().exists():
                errors.append(f"{path.relative_to(root)}:{lineno}: enlace roto -> {raw}")
    return errors


def check_conflicts(path: Path, root: Path) -> list[str]:
    errors = []
    text = path.read_text(encoding="utf-8")
    for lineno, line in enumerate(text.splitlines(), 1):
        if line.startswith(CONFLICT_MARKERS):
            errors.append(f"{path.relative_to(root)}:{lineno}: marcador de conflicto")
    return errors


def check_tracked(root: Path) -> list[str]:
    result = subprocess.run(
        ["git", "-C", str(root), "ls-files", "-z"],
        capture_output=True,
        text=True,
        check=False,
    )
    if result.returncode != 0:
        return [f"no se pudo leer git ls-files: {result.stderr.strip()}"]
    errors = []
    for rel in result.stdout.split("\0"):
        if not rel:
            continue
        path = Path(rel)
        if (
            path.name == ".DS_Store"
            or "__pycache__" in path.parts
            or path.suffix == ".pyc"
            or rel.startswith(".orchestrator/")
            or rel.startswith(".worktrees/")
        ):
            errors.append(f"artefacto versionado: {rel}")
    return errors


def main() -> int:
    root = repo_root()
    files = list(iter_markdown_files(root))
    errors = []
    for path in files:
        errors.extend(check_links(path, root))
        errors.extend(check_conflicts(path, root))
    errors.extend(check_tracked(root))
    if errors:
        print("Errores de documentación:")
        for error in errors:
            print(f"- {error}")
        return 1
    print(f"OK: {len(files)} archivos Markdown, enlaces relativos y artefactos versionados.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
