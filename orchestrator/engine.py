"""Estado, worktrees e integración. Sin tope artificial de tres agentes."""

from __future__ import annotations

import fcntl
import json
import os
import re
import subprocess
from contextlib import contextmanager
from datetime import datetime, timezone
from pathlib import Path

MASTER_NAME = "MASTER_PROMPT_FINANCIAL_OPERATIONS.md"
# None: no hay cupo fijo. Quien lance procesos de pago debe pasar max_slots.
DEFAULT_MAX_SLOTS = None
TERMINAL_DEPS = {"MERGED", "DONE"}
SENSITIVE_RISKS = {"alto", "critico"}
SENSITIVE_TOKENS = {
    "auth",
    "authorization",
    "autorizacion",
    "permission",
    "permissions",
    "permiso",
    "permisos",
    "payment",
    "payments",
    "pago",
    "pagos",
    "bank",
    "banks",
    "banco",
    "bancaria",
    "bancario",
    "ledger",
    "tenant",
    "tenants",
    "multitenant",
    "multitenancy",
    "multiempresa",
    "secret",
    "secrets",
    "secreto",
    "secretos",
    "seguridad",
    "security",
}
ID_RE = re.compile(r"^[A-Za-z0-9][A-Za-z0-9._-]{0,40}$")


class OrchestratorError(Exception):
    def __init__(self, message: str, code: str = "error"):
        super().__init__(message)
        self.code = code


def now() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat()


def orch_dir(repo: Path) -> Path:
    path = repo / ".orchestrator"
    path.mkdir(parents=True, exist_ok=True)
    return path


def state_path(repo: Path) -> Path:
    return orch_dir(repo) / "state.json"


def _short_has(arg: str, letter: str) -> bool:
    return arg.startswith("-") and not arg.startswith("--") and letter in arg[1:]


def forbid(args: list[str]) -> None:
    if not args:
        raise OrchestratorError("comando git vacio")
    cmd = args[0]
    if cmd == "push":
        for arg in args[1:]:
            if (
                arg == "--no-verify"
                or arg.startswith("--force")
                or arg.startswith("+")
                or _short_has(arg, "f")
            ):
                raise OrchestratorError("push forzado prohibido", "forbidden")
    if cmd == "reset" and "--hard" in args:
        raise OrchestratorError("reset --hard prohibido", "forbidden")
    if cmd == "clean":
        flags = args[1:]
        force = any(arg == "--force" or _short_has(arg, "f") for arg in flags)
        directories = any(_short_has(arg, "d") for arg in flags)
        if force and directories:
            raise OrchestratorError("git clean destructivo prohibido", "forbidden")


def run_git(args: list[str], cwd: Path, env: dict | None = None, check: bool = True) -> subprocess.CompletedProcess:
    forbid(args)
    merged = os.environ.copy()
    if env:
        merged.update(env)
    result = subprocess.run(
        ["git", *args],
        cwd=cwd,
        env=merged,
        text=True,
        capture_output=True,
    )
    if check and result.returncode != 0:
        detail = (result.stderr or result.stdout or "").strip()
        raise OrchestratorError(detail or f"git {' '.join(args)} fallo")
    return result


def porcelain(cwd: Path) -> str:
    result = run_git(["status", "--porcelain"], cwd, check=True)
    return result.stdout.strip()


def current_branch(cwd: Path) -> str:
    result = run_git(["branch", "--show-current"], cwd)
    return result.stdout.strip()


def rev(cwd: Path, ref: str = "HEAD") -> str:
    return run_git(["rev-parse", ref], cwd).stdout.strip()


def branch_exists(repo: Path, name: str) -> bool:
    result = run_git(["rev-parse", "--verify", "--quiet", name], repo, check=False)
    return result.returncode == 0


def worktrees_ignored(repo: Path) -> bool:
    # `.worktrees` no coincide con el patron `.worktrees/` hasta que el
    # directorio existe. Se comprueba un path interno.
    result = run_git(["check-ignore", "-q", ".worktrees/x"], repo, check=False)
    return result.returncode == 0


def load_state(repo: Path) -> dict:
    path = state_path(repo)
    if not path.exists():
        return {"version": 1, "tasks": {}}
    return json.loads(path.read_text())


def save_state(repo: Path, state: dict) -> None:
    path = state_path(repo)
    tmp = path.with_suffix(".json.tmp")
    tmp.write_text(json.dumps(state, indent=2, ensure_ascii=False) + "\n")
    tmp.replace(path)


def log_event(repo: Path, kind: str, **data) -> None:
    line = json.dumps({"ts": now(), "kind": kind, **data}, ensure_ascii=False)
    with (orch_dir(repo) / "log.jsonl").open("a") as handle:
        handle.write(line + "\n")


@contextmanager
def _lock(repo: Path, name: str):
    handle = (orch_dir(repo) / name).open("a+")
    try:
        fcntl.flock(handle.fileno(), fcntl.LOCK_EX | fcntl.LOCK_NB)
    except BlockingIOError as exc:
        handle.close()
        raise OrchestratorError("integracion ocupada", "busy") from exc
    try:
        yield
    finally:
        fcntl.flock(handle.fileno(), fcntl.LOCK_UN)
        handle.close()


def state_lock(repo: Path):
    return _lock(repo, "state.lock")


def integration_lock(repo: Path):
    return _lock(repo, "integrate.lock")


def child_role() -> bool:
    return os.environ.get("ORCH_ROLE") == "child"


def require_integrator() -> None:
    if child_role():
        raise OrchestratorError(
            "un agente hijo no integra ni pushea la rama principal",
            "forbidden",
        )


def product_guard(repo: Path) -> None:
    master = repo / MASTER_NAME
    if not master.is_file():
        hint = ""
        if (repo / "docs" / "documento-maestro.md").is_file():
            hint = " Existe docs/documento-maestro.md, y no sustituye ese nombre."
        raise OrchestratorError(
            f"No se puede leer {MASTER_NAME}. No hay cambios de producto.{hint}",
            "blocked",
        )
    if not master.read_text(encoding="utf-8").strip():
        raise OrchestratorError(
            f"{MASTER_NAME} esta vacio. No hay cambios de producto.",
            "blocked",
        )


def path_is_sensitive(path: str) -> bool:
    parts = re.split(r"[^a-z0-9]+", path.lower())
    return any(part in SENSITIVE_TOKENS for part in parts if part)


def overlaps(left: str, right: str) -> bool:
    a = [p for p in Path(left).as_posix().split("/") if p and p != "."]
    b = [p for p in Path(right).as_posix().split("/") if p and p != "."]
    if not a or not b:
        return True
    n = min(len(a), len(b))
    return a[:n] == b[:n]


def outside_owns(owns: list[str], files: list[str]) -> list[str]:
    if not owns:
        return []
    return [path for path in files if not any(overlaps(owned, path) for owned in owns)]


def ownership_conflict(tasks: dict, task_id: str, owns: list[str]) -> str | None:
    for other_id, other in tasks.items():
        if other_id == task_id or other.get("status") != "RUNNING":
            continue
        other_owns = other.get("owns") or []
        if not owns or not other_owns:
            return other_id
        for mine in owns:
            for theirs in other_owns:
                if overlaps(mine, theirs):
                    return other_id
    return None


def deps_met(state: dict, task: dict) -> bool:
    tasks = state["tasks"]
    return all(tasks.get(dep, {}).get("status") in TERMINAL_DEPS for dep in task.get("depends_on", []))


def refresh_ready(state: dict) -> None:
    for task in state["tasks"].values():
        if task["status"] in {"BACKLOG", "READY"}:
            task["status"] = "READY" if deps_met(state, task) else "BACKLOG"


def _cycle(tasks: dict, start: str, deps: list[str]) -> bool:
    seen = set()

    def walk(node: str) -> bool:
        if node == start:
            return True
        if node in seen or node not in tasks:
            return False
        seen.add(node)
        return any(walk(dep) for dep in tasks[node].get("depends_on", []))

    return any(walk(dep) for dep in deps)


def add_task(
    repo: Path,
    task_id: str,
    title: str,
    owns: list[str],
    risk: str,
    base: str,
    depends_on: list[str] | None = None,
    validate_cmd: str | None = None,
) -> dict:
    if not ID_RE.match(task_id):
        raise OrchestratorError(f"id invalido: {task_id}")
    if risk not in {"bajo", "medio", "alto", "critico"}:
        raise OrchestratorError(f"riesgo invalido: {risk}")
    if not branch_exists(repo, base):
        raise OrchestratorError(f"la rama base {base} no existe")
    depends_on = depends_on or []
    if task_id in depends_on:
        raise OrchestratorError("el DAG tiene un ciclo")
    with state_lock(repo):
        state = load_state(repo)
        if task_id in state["tasks"]:
            raise OrchestratorError(f"la tarea {task_id} ya existe")
        missing = [dep for dep in depends_on if dep not in state["tasks"]]
        if missing:
            raise OrchestratorError(f"dependencias inexistentes: {', '.join(missing)}")
        if _cycle(state["tasks"], task_id, depends_on):
            raise OrchestratorError("el DAG tiene un ciclo")
        task = {
            "id": task_id,
            "title": title,
            "status": "BACKLOG",
            "owns": owns,
            "risk": risk,
            "base": base,
            "depends_on": depends_on,
            "validate_cmd": validate_cmd,
            "branch": None,
            "worktree": None,
            "checks": [],
            "human_approved": False,
            "block_reason": None,
            "sha": None,
        }
        state["tasks"][task_id] = task
        refresh_ready(state)
        save_state(repo, state)
        log_event(repo, "task_add", task=task_id, risk=risk)
        return task


def slug(text: str) -> str:
    value = re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")
    return value[:40] or "tarea"


def create_worktree(repo: Path, task_id: str) -> dict:
    if not worktrees_ignored(repo):
        raise OrchestratorError(
            "Agrega .worktrees/ a .gitignore antes de crear worktrees.",
            "blocked",
        )
    with state_lock(repo):
        state = load_state(repo)
        task = state["tasks"].get(task_id)
        if task is None:
            raise OrchestratorError(f"no existe la tarea {task_id}")
        refresh_ready(state)
        if task["status"] != "READY":
            raise OrchestratorError(f"{task_id} esta en {task['status']}, no en READY")
        conflict = ownership_conflict(state["tasks"], task_id, task.get("owns") or [])
        if conflict:
            task["block_reason"] = f"ownership en conflicto con {conflict}"
            save_state(repo, state)
            raise OrchestratorError(task["block_reason"], "blocked")
        branch = f"agent/{task_id}-{slug(task['title'])}"
        if branch_exists(repo, branch):
            raise OrchestratorError(f"la rama {branch} ya existe")
        path = repo / ".worktrees" / task_id
        if path.exists():
            raise OrchestratorError(f"el worktree {path} ya existe")
        path.parent.mkdir(parents=True, exist_ok=True)
        run_git(["worktree", "add", "-b", branch, str(path), task["base"]], repo)
        task["branch"] = branch
        task["worktree"] = str(path)
        task["status"] = "RUNNING"
        task["block_reason"] = None
        save_state(repo, state)
        log_event(repo, "worktree", task=task_id, branch=branch, worktree=str(path))
        return task


def allocate(repo: Path, max_slots: int | None = DEFAULT_MAX_SLOTS) -> list[str]:
    state = load_state(repo)
    refresh_ready(state)
    created = []
    ready = [task_id for task_id, task in state["tasks"].items() if task["status"] == "READY"]
    for task_id in ready:
        if max_slots is not None and len(created) >= max_slots:
            break
        try:
            create_worktree(repo, task_id)
        except OrchestratorError as exc:
            if exc.code != "blocked":
                raise
            continue
        created.append(task_id)
    return created


def changed_files(repo: Path, base: str, branch: str) -> list[str]:
    result = run_git(["diff", "--name-only", f"{base}...{branch}"], repo)
    return [line for line in result.stdout.splitlines() if line]


def _run_validate(worktree: Path, command: str) -> tuple[str, str]:
    result = subprocess.run(command, cwd=worktree, shell=True, text=True, capture_output=True)
    output = (result.stdout + result.stderr).strip()
    return ("PASS" if result.returncode == 0 else "FAIL", output[-500:])


def review_task(repo: Path, task_id: str) -> dict:
    with state_lock(repo):
        state = load_state(repo)
        task = state["tasks"].get(task_id)
        if task is None:
            raise OrchestratorError(f"no existe la tarea {task_id}")
        if task["status"] != "RUNNING":
            raise OrchestratorError(f"{task_id} no esta RUNNING")
        worktree = Path(task["worktree"])
        if porcelain(worktree):
            raise OrchestratorError("el worktree tiene cambios sin commit", "blocked")
        checks = []
        if task.get("validate_cmd"):
            result, evidence = _run_validate(worktree, task["validate_cmd"])
            checks.append({"name": "validate_cmd", "result": result, "evidence": evidence})
        else:
            checks.append({"name": "validate_cmd", "result": "BLOCKED", "evidence": "no hay comando"})
        files = changed_files(repo, task["base"], task["branch"])
        outside = outside_owns(task.get("owns") or [], files)
        if outside:
            checks.append({"name": "owns", "result": "FAIL", "evidence": ", ".join(outside)})
        sensitive = task["risk"] in SENSITIVE_RISKS or any(path_is_sensitive(item) for item in files)
        task["checks"] = checks
        task["sensitive_diff"] = sensitive
        failed = any(item["result"] != "PASS" for item in checks)
        if failed:
            task["status"] = "BLOCKED" if any(item["result"] == "BLOCKED" for item in checks) else "FAILED"
            task.pop("reviewed_sha", None)
        elif sensitive:
            task["reviewed_sha"] = rev(worktree)
            task["status"] = "NEEDS_HUMAN_REVIEW"
        else:
            task["reviewed_sha"] = rev(worktree)
            task["status"] = "APPROVED"
        save_state(repo, state)
        log_event(repo, "review", task=task_id, status=task["status"], sensitive=sensitive)
        return task


def approve_task(repo: Path, task_id: str, approver: str) -> dict:
    require_integrator()
    if not approver.strip():
        raise OrchestratorError("falta el revisor humano")
    with state_lock(repo):
        state = load_state(repo)
        task = state["tasks"].get(task_id)
        if task is None:
            raise OrchestratorError(f"no existe la tarea {task_id}")
        if task["status"] != "NEEDS_HUMAN_REVIEW":
            raise OrchestratorError(f"{task_id} no espera revision humana")
        if any(item["result"] != "PASS" for item in task.get("checks", [])):
            raise OrchestratorError("los checks no pasan", "blocked")
        task["human_approved"] = True
        task["approver"] = approver
        task["approved_at"] = now()
        task["status"] = "APPROVED"
        save_state(repo, state)
        log_event(repo, "human_approve", task=task_id, approver=approver)
        return task


def integrate_task(repo: Path, task_id: str) -> dict:
    require_integrator()
    with integration_lock(repo):
        if porcelain(repo):
            raise OrchestratorError("el arbol principal esta sucio", "blocked")
        with state_lock(repo):
            state = load_state(repo)
            task = state["tasks"].get(task_id)
            if task is None:
                raise OrchestratorError(f"no existe la tarea {task_id}")
            if task["status"] == "NEEDS_HUMAN_REVIEW":
                raise OrchestratorError("hace falta revision humana", "needs_human")
            if task["status"] != "APPROVED":
                raise OrchestratorError(
                    f"{task_id} esta en {task['status']}; no se integra",
                    "blocked",
                )
            if task.get("sensitive_diff") and not task.get("human_approved"):
                raise OrchestratorError("hace falta revision humana", "needs_human")
            if current_branch(repo) != task["base"]:
                raise OrchestratorError(
                    f"el integrador debe estar en {task['base']}",
                    "blocked",
                )
            if porcelain(Path(task["worktree"])):
                raise OrchestratorError("el worktree sigue sucio", "blocked")
            worktree = Path(task["worktree"])
            reviewed_sha = task.get("reviewed_sha")
            branch_sha = rev(worktree)
            if not reviewed_sha:
                raise OrchestratorError(
                    f"{task_id} no tiene SHA revisado; vuelve a correr review",
                    "blocked",
                )
            if branch_sha != reviewed_sha:
                task["status"] = "FAILED"
                task["block_reason"] = (
                    f"la rama cambio despues del review ({reviewed_sha[:7]} -> {branch_sha[:7]})"
                )
                save_state(repo, state)
                log_event(repo, "review_drift", task=task_id, expected=reviewed_sha, actual=branch_sha)
                raise OrchestratorError(task["block_reason"], "blocked")
            outside = outside_owns(
                task.get("owns") or [],
                changed_files(repo, task["base"], task["branch"]),
            )
            if outside:
                task["status"] = "FAILED"
                task["block_reason"] = "fuera de owns: " + ", ".join(outside)
                save_state(repo, state)
                log_event(repo, "owns", task=task_id, files=outside)
                raise OrchestratorError(task["block_reason"], "blocked")
            before = rev(repo)
            merge = run_git(
                ["merge", "--no-ff", "--no-edit", "-m", f"Integra {task_id}: {task['title']}", task["branch"]],
                repo,
                check=False,
            )
            if merge.returncode != 0:
                run_git(["merge", "--abort"], repo, check=False)
                task["status"] = "CONFLICT"
                task["block_reason"] = (merge.stderr or merge.stdout or "conflicto").strip()
                save_state(repo, state)
                log_event(repo, "conflict", task=task_id)
                if porcelain(repo):
                    raise OrchestratorError("el merge quedo sucio tras abortar", "failed")
                raise OrchestratorError(task["block_reason"], "conflict")
            task["status"] = "MERGED"
            task["sha"] = rev(repo)
            task["merged_from"] = before
            refresh_ready(state)
            save_state(repo, state)
            log_event(repo, "merge", task=task_id, sha=task["sha"])
            return task


def release_worktree(repo: Path, task_id: str) -> dict:
    require_integrator()
    with state_lock(repo):
        state = load_state(repo)
        task = state["tasks"].get(task_id)
        if task is None:
            raise OrchestratorError(f"no existe la tarea {task_id}")
        if task["status"] != "MERGED":
            raise OrchestratorError("solo se libera una tarea ya integrada")
        worktree = Path(task["worktree"])
        if worktree.exists() and porcelain(worktree):
            raise OrchestratorError("no libero un worktree sucio", "blocked")
        if worktree.exists():
            run_git(["worktree", "remove", str(worktree)], repo)
        task["status"] = "DONE"
        refresh_ready(state)
        save_state(repo, state)
        log_event(repo, "release", task=task_id)
        return task


def push_ref(repo: Path, ref: str, remote: str, *, allow_base: bool) -> None:
    require_integrator()
    if ref in {"main", "master"} and not allow_base:
        raise OrchestratorError("un push de agente no actualiza la rama principal", "forbidden")
    run_git(["push", remote, ref], repo)


def push_task(repo: Path, task_id: str, remote: str = "origin") -> None:
    state = load_state(repo)
    task = state["tasks"].get(task_id)
    if task is None or not task.get("branch"):
        raise OrchestratorError(f"no hay rama para {task_id}")
    push_ref(repo, task["branch"], remote, allow_base=False)
    log_event(repo, "push_branch", task=task_id, branch=task["branch"], remote=remote)


def push_base(repo: Path, task_id: str, remote: str = "origin") -> None:
    state = load_state(repo)
    task = state["tasks"].get(task_id)
    if task is None or task["status"] not in {"MERGED", "DONE"}:
        raise OrchestratorError("la base solo se pushea despues de integrar")
    push_ref(repo, task["base"], remote, allow_base=True)
    log_event(repo, "push_base", task=task_id, base=task["base"], remote=remote)


def publish_task(repo: Path, task_id: str, remote: str = "origin") -> None:
    """Sube la rama de la tarea y la base. Sin remoto, el cambio no esta terminado."""
    require_integrator()
    url = run_git(["remote", "get-url", remote], repo, check=False)
    if url.returncode != 0 or not url.stdout.strip():
        raise OrchestratorError(
            f"no hay remoto {remote}; el cambio queda sin publicar",
            "blocked",
        )
    push_task(repo, task_id, remote)
    push_base(repo, task_id, remote)
    log_event(repo, "publish", task=task_id, remote=remote)


def install_hooks(repo: Path) -> Path:
    source = Path(__file__).resolve().parent / "hooks" / "pre-push"
    common = Path(run_git(["rev-parse", "--git-common-dir"], repo).stdout.strip())
    if not common.is_absolute():
        common = (repo / common).resolve()
    dest_dir = common / "hooks"
    dest_dir.mkdir(parents=True, exist_ok=True)
    dest = dest_dir / "pre-push"
    dest.write_text(source.read_text())
    dest.chmod(0o755)
    log_event(repo, "install_hooks", hook=str(dest))
    return dest


def render_prompt(repo: Path, task_id: str) -> str:
    task = load_state(repo)["tasks"].get(task_id)
    if task is None:
        raise OrchestratorError(f"no existe la tarea {task_id}")
    owns = ", ".join(task.get("owns") or ["(repo completo: exclusivo)"])
    return "\n".join(
        [
            f"# Tarea {task['id']}",
            "",
            f"Lee {MASTER_NAME} si existe. No contradigas ese documento.",
            "No empieces el producto financiero si esta tarea es de orquestacion.",
            "",
            "## Tarea",
            task["title"],
            "",
            "## Aislamiento",
            f"- Rama exclusiva: {task.get('branch')}",
            f"- Worktree exclusivo: {task.get('worktree')}",
            f"- Puedes editar solo: {owns}",
            "- No edites el arbol de otro agente.",
            "- No hagas commit ni push a la rama principal.",
            "- No hagas merge, force-push, reset --hard ni clean destructivo.",
            "- ORCH_ROLE=child",
            "",
            "## Validacion",
            task.get("validate_cmd") or "(sin comando; no inventes un PASS)",
            "",
            "## Reporte",
            "Devuelve supuestos, decisiones, archivos, commits, tests, riesgos y bloqueos.",
            "",
        ]
    )


def doctor(repo: Path) -> dict:
    head = run_git(["rev-parse", "--verify", "HEAD"], repo, check=False)
    branch = current_branch(repo) if head.returncode == 0 else None
    return {
        "branch": branch,
        "has_commit": head.returncode == 0,
        "master_present": (repo / MASTER_NAME).is_file(),
        "worktrees_ignored": worktrees_ignored(repo),
        "dirty": bool(porcelain(repo)) if head.returncode == 0 else None,
        "default_max_slots": DEFAULT_MAX_SLOTS,
    }
