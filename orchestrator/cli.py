"""CLI del orquestador. No lanza modelos de pago salvo un runner explicito."""

from __future__ import annotations

import argparse
import json
import os
from pathlib import Path

from orchestrator.engine import (
    DEFAULT_MAX_SLOTS,
    OrchestratorError,
    add_task,
    allocate,
    approve_task,
    create_worktree,
    doctor,
    install_hooks,
    integrate_task,
    load_state,
    product_guard,
    push_base,
    push_task,
    release_worktree,
    render_prompt,
    review_task,
)
from orchestrator.inventory import render_markdown, scan_binaries, scan_skills, skill_roots


def _repo(value: str) -> Path:
    return Path(value).resolve()


def _print_task(task: dict) -> None:
    print(f"{task['id']} {task['status']} rama={task.get('branch')} riesgo={task['risk']}")


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(prog="orchestrator")
    parser.add_argument("--repo", default=".")
    sub = parser.add_subparsers(dest="cmd", required=True)

    sub.add_parser("doctor")
    sub.add_parser("product-guard")
    sub.add_parser("status")

    add = sub.add_parser("task-add")
    add.add_argument("task_id")
    add.add_argument("--title", required=True)
    add.add_argument("--owns", action="append", default=[])
    add.add_argument("--risk", default="bajo")
    add.add_argument("--base", default="main")
    add.add_argument("--depends", action="append", default=[])
    add.add_argument("--validate")

    claim = sub.add_parser("allocate")
    claim.add_argument("--max-slots", type=int, default=None)

    one = sub.add_parser("worktree")
    one.add_argument("task_id")
    review = sub.add_parser("review")
    review.add_argument("task_id")
    approve = sub.add_parser("approve")
    approve.add_argument("task_id")
    approve.add_argument("--approver", default=os.environ.get("ORCH_APPROVER", "humano-local"))
    integrate = sub.add_parser("integrate")
    integrate.add_argument("task_id")
    release = sub.add_parser("release")
    release.add_argument("task_id")
    prompt = sub.add_parser("prompt")
    prompt.add_argument("task_id")

    push = sub.add_parser("push")
    push.add_argument("task_id")
    push.add_argument("--remote", default="origin")
    base = sub.add_parser("push-base")
    base.add_argument("task_id")
    base.add_argument("--remote", default="origin")
    sub.add_parser("install-hooks")

    inventory = sub.add_parser("inventory")
    inventory.add_argument("--write")

    args = parser.parse_args(argv)
    repo = _repo(args.repo)
    try:
        if args.cmd == "doctor":
            print(json.dumps(doctor(repo), indent=2))
        elif args.cmd == "product-guard":
            product_guard(repo)
            print("master presente")
        elif args.cmd == "status":
            state = load_state(repo)
            if not state["tasks"]:
                print("sin tareas")
            for task in state["tasks"].values():
                _print_task(task)
        elif args.cmd == "task-add":
            task = add_task(
                repo,
                args.task_id,
                args.title,
                args.owns,
                args.risk,
                args.base,
                args.depends,
                args.validate,
            )
            _print_task(task)
        elif args.cmd == "allocate":
            slots = DEFAULT_MAX_SLOTS if args.max_slots is None else args.max_slots
            created = allocate(repo, slots)
            print(" ".join(created) if created else "ninguna")
        elif args.cmd == "worktree":
            _print_task(create_worktree(repo, args.task_id))
        elif args.cmd == "review":
            _print_task(review_task(repo, args.task_id))
        elif args.cmd == "approve":
            _print_task(approve_task(repo, args.task_id, args.approver))
        elif args.cmd == "integrate":
            _print_task(integrate_task(repo, args.task_id))
        elif args.cmd == "release":
            _print_task(release_worktree(repo, args.task_id))
        elif args.cmd == "prompt":
            print(render_prompt(repo, args.task_id))
        elif args.cmd == "push":
            push_task(repo, args.task_id, args.remote)
            print("push de rama de trabajo")
        elif args.cmd == "push-base":
            push_base(repo, args.task_id, args.remote)
            print("push de rama base")
        elif args.cmd == "install-hooks":
            print(install_hooks(repo))
        elif args.cmd == "inventory":
            text = render_markdown(scan_binaries(), scan_skills(skill_roots()))
            if args.write:
                Path(args.write).write_text(text)
                print(args.write)
            else:
                print(text)
        return 0
    except OrchestratorError as exc:
        print(f"{exc.code}: {exc}")
        if exc.code == "needs_human":
            return 2
        if exc.code in {"blocked", "conflict", "busy"}:
            return 3
        return 1
