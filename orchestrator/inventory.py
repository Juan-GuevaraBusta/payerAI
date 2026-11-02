"""Inventario reproducible de binarios y skills. No guarda secretos."""

from __future__ import annotations

import os
import re
import shutil
import subprocess
from pathlib import Path

CANDIDATES = [
    "git",
    "python3",
    "node",
    "gh",
    "docker",
    "cursor",
    "agent",
    "cursor-agent",
    "claude",
    "codex",
    "gemini",
    "copilot",
    "aider",
    "opencode",
    "pi",
    "droid",
    "openhands",
    "amp",
]


def skill_roots() -> list[Path]:
    home = Path.home()
    roots = [
        home / ".cursor" / "skills-cursor",
        home / ".cursor" / "skills",
        home / ".claude" / "skills",
        home / ".agents" / "skills",
        home / ".cursor" / "plugins" / "cache" / "cursor-public",
        home / ".claude" / "plugins" / "cache",
        home / ".codex" / "skills",
        home / ".gemini" / "skills",
    ]
    return [root for root in roots if root.is_dir()]


def _version(binary: str) -> str:
    try:
        result = subprocess.run(
            [binary, "--version"],
            text=True,
            capture_output=True,
            timeout=8,
        )
    except (subprocess.TimeoutExpired, OSError) as exc:
        return f"no comprobada ({exc.__class__.__name__})"
    text = (result.stdout or result.stderr or "").strip().splitlines()
    return text[0][:200] if text else "sin salida"


def scan_binaries() -> list[dict]:
    rows = []
    for name in CANDIDATES:
        path = shutil.which(name)
        rows.append(
            {
                "name": name,
                "path": path or "",
                "version": _version(path) if path else "",
                "status": "disponible" if path else "no instalado",
            }
        )
    return rows


def _frontmatter(text: str) -> tuple[str, str]:
    name = ""
    description = ""
    if text.startswith("---"):
        end = text.find("\n---", 3)
        block = text[3:end] if end != -1 else text[3:1500]
        current = None
        chunks: dict[str, list[str]] = {"name": [], "description": []}
        for line in block.splitlines():
            match = re.match(r"^(name|description):\s*(.*)$", line)
            if match:
                current = match.group(1)
                chunks[current].append(match.group(2).strip().strip("\"'"))
                continue
            if current and (line.startswith(" ") or line.startswith(">") or line.startswith("|")):
                chunks[current].append(line.strip(" >|"))
                continue
            current = None
        name = " ".join(chunks["name"]).strip()
        description = re.sub(r"\s+", " ", " ".join(chunks["description"])).strip()
    if not name:
        for line in text.splitlines():
            if line.startswith("# "):
                name = line[2:].strip()
                break
    return name or "(sin nombre)", description[:240]


def scan_skills(roots: list[Path] | None = None) -> list[dict]:
    rows = []
    for root in roots if roots is not None else skill_roots():
        if not root.is_dir():
            continue
        for path in root.rglob("*"):
            if path.name.lower() not in {"skill.md", "skills.md"}:
                continue
            if "node_modules" in path.parts or ".git" in path.parts:
                continue
            try:
                text = path.read_text(errors="replace")
            except OSError:
                continue
            name, description = _frontmatter(text)
            rows.append(
                {
                    "name": name,
                    "path": str(path),
                    "description": description,
                    "bytes": path.stat().st_size,
                }
            )
    rows.sort(key=lambda row: (row["name"].lower(), row["path"]))
    return rows


def render_markdown(binaries: list[dict], skills: list[dict]) -> str:
    lines = [
        "# Inventario de entorno",
        "",
        "Generado por `python3 -m orchestrator inventory`.",
        "Versiones tomadas de `--version`. No incluye tokens.",
        f"CPU visibles para un proceso local: {os.cpu_count()}.",
        "Ese numero no es un cupo de agentes ni una cuota de proveedor.",
        "",
        "## Binarios",
        "",
        "| Nombre | Estado | Version | Ruta |",
        "| --- | --- | --- | --- |",
    ]
    for row in binaries:
        version = (row["version"] or "").replace("|", "/")
        lines.append(
            f"| {row['name']} | {row['status']} | {version} | `{row['path']}` |"
        )
    lines.extend(
        [
            "",
            "## Skills",
            "",
            "Cada fila sale del frontmatter del archivo. El cuerpo completo no esta copiado aqui.",
            "",
            "| Nombre | Bytes | Ruta | Descripcion |",
            "| --- | --- | --- | --- |",
        ]
    )
    for row in skills:
        desc = row["description"].replace("|", "/")
        lines.append(
            f"| {row['name']} | {row['bytes']} | `{row['path']}` | {desc} |"
        )
    lines.append("")
    return "\n".join(lines)
