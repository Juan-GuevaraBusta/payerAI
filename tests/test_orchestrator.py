import os
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from orchestrator.cli import main
from orchestrator.engine import (
    DEFAULT_MAX_SLOTS,
    MASTER_NAME,
    OrchestratorError,
    add_task,
    allocate,
    approve_task,
    create_worktree,
    forbid,
    install_hooks,
    integrate_task,
    load_state,
    product_guard,
    publish_task,
    push_base,
    review_task,
    run_git,
)

ENV = {
    "GIT_AUTHOR_NAME": "orchestrator-test",
    "GIT_AUTHOR_EMAIL": "orchestrator-test@example.com",
    "GIT_COMMITTER_NAME": "orchestrator-test",
    "GIT_COMMITTER_EMAIL": "orchestrator-test@example.com",
}


class OrchestratorTest(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.repo = Path(self.tmp.name) / "repo"
        self.repo.mkdir()
        self._saved = {key: os.environ.get(key) for key in ENV}
        os.environ.update(ENV)
        self.git(["init", "-b", "main"])
        (self.repo / ".gitignore").write_text(".orchestrator/\n.worktrees/\n")
        (self.repo / "README.md").write_text("base\n")
        self.git(["add", ".gitignore", "README.md"])
        self.git(["commit", "-m", "base"])

    def tearDown(self):
        subprocess.run(["git", "-C", str(self.repo), "merge", "--abort"], check=False, capture_output=True)
        listed = subprocess.run(
            ["git", "-C", str(self.repo), "worktree", "list", "--porcelain"],
            text=True,
            capture_output=True,
            check=False,
        )
        for line in listed.stdout.splitlines():
            if not line.startswith("worktree "):
                continue
            path = line.split(" ", 1)[1]
            if Path(path).resolve() == self.repo.resolve():
                continue
            subprocess.run(
                ["git", "-C", str(self.repo), "worktree", "remove", "--force", path],
                check=False,
                capture_output=True,
            )
        for key, value in self._saved.items():
            if value is None:
                os.environ.pop(key, None)
            else:
                os.environ[key] = value
        self.tmp.cleanup()

    def git(self, args, cwd=None):
        result = subprocess.run(
            ["git", *args],
            cwd=cwd or self.repo,
            env={**os.environ, **ENV},
            text=True,
            capture_output=True,
        )
        if result.returncode != 0:
            raise AssertionError(result.stderr or result.stdout)
        return result

    def write_commit(self, root: Path, rel: str, content: str, message: str):
        path = root / rel
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(content)
        self.git(["add", rel], cwd=root)
        self.git(["commit", "-m", message], cwd=root)

    def test_slots_are_not_capped_at_three(self):
        self.assertIsNone(DEFAULT_MAX_SLOTS)
        for index in range(5):
            add_task(self.repo, f"T{index}", f"area {index}", [f"area{index}"], "bajo", "main", validate_cmd="true")
        first = allocate(self.repo, 4)
        self.assertEqual(len(first), 4)
        rest = allocate(self.repo, None)
        self.assertEqual(len(rest), 1)
        paths = [Path(load_state(self.repo)["tasks"][task_id]["worktree"]) for task_id in [*first, *rest]]
        self.assertEqual(len(set(paths)), 5)

    def test_worktrees_do_not_share_files(self):
        add_task(self.repo, "A", "lado a", ["lado-a"], "bajo", "main", validate_cmd="true")
        add_task(self.repo, "B", "lado b", ["lado-b"], "bajo", "main", validate_cmd="true")
        created = allocate(self.repo, None)
        self.assertEqual(created, ["A", "B"])
        state = load_state(self.repo)
        left = Path(state["tasks"]["A"]["worktree"])
        right = Path(state["tasks"]["B"]["worktree"])
        (left / "solo-a.txt").write_text("a")
        self.assertFalse((right / "solo-a.txt").exists())
        self.assertNotEqual(left.resolve(), right.resolve())

    def test_overlapping_ownership_is_serial(self):
        add_task(self.repo, "A", "docs", ["docs"], "bajo", "main", validate_cmd="true")
        add_task(self.repo, "B", "docs nested", ["docs/sub"], "bajo", "main", validate_cmd="true")
        created = allocate(self.repo, None)
        self.assertEqual(created, ["A"])
        state = load_state(self.repo)
        self.assertEqual(state["tasks"]["B"]["status"], "READY")
        self.assertIn("A", state["tasks"]["B"]["block_reason"])

    def test_low_risk_merge_unblocks_dependency(self):
        add_task(self.repo, "T1", "nota", ["docs"], "bajo", "main", validate_cmd="true")
        add_task(self.repo, "T2", "sigue", ["other"], "bajo", "main", ["T1"], validate_cmd="true")
        self.assertEqual(allocate(self.repo, None), ["T1"])
        worktree = Path(load_state(self.repo)["tasks"]["T1"]["worktree"])
        self.write_commit(worktree, "docs/a.txt", "uno\n", "nota")
        self.assertEqual(review_task(self.repo, "T1")["status"], "APPROVED")
        merged = integrate_task(self.repo, "T1")
        self.assertEqual(merged["status"], "MERGED")
        self.assertEqual((self.repo / "docs" / "a.txt").read_text(), "uno\n")
        self.assertEqual(load_state(self.repo)["tasks"]["T2"]["status"], "READY")
        create_worktree(self.repo, "T2")
        second = Path(load_state(self.repo)["tasks"]["T2"]["worktree"])
        self.assertEqual((second / "docs" / "a.txt").read_text(), "uno\n")

    def test_review_rejects_files_outside_owns(self):
        add_task(self.repo, "O", "docs", ["docs"], "bajo", "main", validate_cmd="true")
        worktree = Path(create_worktree(self.repo, "O")["worktree"])
        self.write_commit(worktree, "docs/ok.txt", "ok\n", "dentro")
        self.write_commit(worktree, "other/no.txt", "no\n", "fuera")
        before = self.git(["rev-parse", "HEAD"]).stdout.strip()
        reviewed = review_task(self.repo, "O")
        self.assertEqual(reviewed["status"], "FAILED")
        owns = next(item for item in reviewed["checks"] if item["name"] == "owns")
        self.assertEqual(owns["result"], "FAIL")
        self.assertIn("other/no.txt", owns["evidence"])
        with self.assertRaises(OrchestratorError) as caught:
            integrate_task(self.repo, "O")
        self.assertEqual(caught.exception.code, "blocked")
        self.assertEqual(self.git(["rev-parse", "HEAD"]).stdout.strip(), before)

    def test_integrate_rejects_commit_after_approval(self):
        add_task(self.repo, "P2", "docs", ["docs"], "bajo", "main", validate_cmd="true")
        worktree = Path(create_worktree(self.repo, "P2")["worktree"])
        self.write_commit(worktree, "docs/ok.txt", "ok\n", "dentro")
        self.assertEqual(review_task(self.repo, "P2")["status"], "APPROVED")
        self.write_commit(worktree, "other/later.txt", "no\n", "despues")
        before = self.git(["rev-parse", "HEAD"]).stdout.strip()
        with self.assertRaises(OrchestratorError) as caught:
            integrate_task(self.repo, "P2")
        self.assertEqual(caught.exception.code, "blocked")
        self.assertIn("other/later.txt", str(caught.exception))
        self.assertEqual(load_state(self.repo)["tasks"]["P2"]["status"], "FAILED")
        self.assertEqual(self.git(["rev-parse", "HEAD"]).stdout.strip(), before)

    def test_high_risk_and_sensitive_path_need_human(self):
        add_task(self.repo, "H", "politica", ["docs"], "alto", "main", validate_cmd="true")
        worktree = Path(create_worktree(self.repo, "H")["worktree"])
        self.write_commit(worktree, "docs/nota.txt", "x\n", "nota")
        self.assertEqual(review_task(self.repo, "H")["status"], "NEEDS_HUMAN_REVIEW")
        with self.assertRaises(OrchestratorError) as caught:
            integrate_task(self.repo, "H")
        self.assertEqual(caught.exception.code, "needs_human")
        approve_task(self.repo, "H", "revisor-prueba")
        self.assertEqual(integrate_task(self.repo, "H")["status"], "MERGED")

        add_task(self.repo, "S", "cuenta", ["src"], "bajo", "main", validate_cmd="true")
        sensitive = Path(create_worktree(self.repo, "S")["worktree"])
        self.write_commit(sensitive, "src/auth/policy.py", "regla\n", "auth")
        self.assertEqual(review_task(self.repo, "S")["status"], "NEEDS_HUMAN_REVIEW")

    def test_conflict_does_not_change_main(self):
        add_task(self.repo, "C", "readme", ["README.md"], "bajo", "main", validate_cmd="true")
        worktree = Path(create_worktree(self.repo, "C")["worktree"])
        self.write_commit(worktree, "README.md", "desde-agente\n", "agente")
        self.write_commit(self.repo, "README.md", "desde-main\n", "main")
        review_task(self.repo, "C")
        before = self.git(["rev-parse", "HEAD"]).stdout.strip()
        with self.assertRaises(OrchestratorError) as caught:
            integrate_task(self.repo, "C")
        self.assertEqual(caught.exception.code, "conflict")
        self.assertEqual(self.git(["rev-parse", "HEAD"]).stdout.strip(), before)
        self.assertEqual((self.repo / "README.md").read_text(), "desde-main\n")
        self.assertEqual(self.git(["status", "--porcelain"]).stdout, "")
        self.assertEqual(load_state(self.repo)["tasks"]["C"]["status"], "CONFLICT")

    def test_dirty_main_blocks_integrate(self):
        add_task(self.repo, "D", "docs", ["docs"], "bajo", "main", validate_cmd="true")
        worktree = Path(create_worktree(self.repo, "D")["worktree"])
        self.write_commit(worktree, "docs/a.txt", "a\n", "a")
        review_task(self.repo, "D")
        (self.repo / "README.md").write_text("sucio\n")
        with self.assertRaises(OrchestratorError) as caught:
            integrate_task(self.repo, "D")
        self.assertEqual(caught.exception.code, "blocked")

    def test_destructive_git_is_refused_before_running(self):
        for args in (["push", "--force", "origin", "main"], ["reset", "--hard"], ["clean", "-fd"]):
            with self.assertRaises(OrchestratorError) as caught:
                run_git(args, self.repo)
            self.assertEqual(caught.exception.code, "forbidden")

    def test_forbid_blocks_disguised_destructive_git(self):
        denied = (
            ["push", "-uf", "origin", "main"],
            ["push", "--force-with-lease=main", "origin", "main"],
            ["push", "--force-if-includes"],
            ["push", "--no-verify", "origin", "main"],
            ["push", "origin", "+main"],
            ["push", "-f", "origin", "main"],
            ["clean", "-f", "-d"],
            ["clean", "--force", "-d"],
            ["clean", "--force", "--dry-run", "-d"],
            ["clean", "-df"],
            ["reset", "--hard", "HEAD"],
        )
        for args in denied:
            with self.assertRaises(OrchestratorError) as caught:
                forbid(args)
            self.assertEqual(caught.exception.code, "forbidden", args)
        allowed = (
            ["push", "origin", "main"],
            ["push", "-u", "origin", "HEAD"],
            ["push", "origin", "HEAD:main"],
            ["clean", "-f"],
            ["clean", "--force"],
            ["clean", "-n", "-d"],
            ["reset", "HEAD"],
            ["rebase", "--onto", "main"],
            ["commit", "-m", "x"],
        )
        for args in allowed:
            forbid(args)

    def test_child_cannot_integrate_push_or_publish(self):
        add_task(self.repo, "B", "base hija", ["docs"], "bajo", "main", validate_cmd="true")
        worktree = Path(create_worktree(self.repo, "B")["worktree"])
        self.write_commit(worktree, "docs/b.txt", "b\n", "b")
        self.assertEqual(review_task(self.repo, "B")["status"], "APPROVED")
        integrate_task(self.repo, "B")

        os.environ["ORCH_ROLE"] = "child"
        try:
            with self.assertRaises(OrchestratorError) as integrate_caught:
                integrate_task(self.repo, "missing")
            self.assertEqual(integrate_caught.exception.code, "forbidden")
            with self.assertRaises(OrchestratorError) as push_caught:
                push_base(self.repo, "B")
            self.assertEqual(push_caught.exception.code, "forbidden")
            with self.assertRaises(OrchestratorError) as publish_caught:
                publish_task(self.repo, "B")
            self.assertEqual(publish_caught.exception.code, "forbidden")
        finally:
            os.environ.pop("ORCH_ROLE", None)

    def test_integration_lock_is_exclusive(self):
        code = (
            "import sys, time\n"
            "from pathlib import Path\n"
            "sys.path.insert(0, sys.argv[1])\n"
            "from orchestrator.engine import integration_lock\n"
            "with integration_lock(Path(sys.argv[2])):\n"
            "    print('locked', flush=True)\n"
            "    time.sleep(8)\n"
        )
        proc = subprocess.Popen(
            [sys.executable, "-c", code, str(ROOT), str(self.repo)],
            text=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
        )
        try:
            ready = proc.stdout.readline().strip()
            if ready != "locked":
                error = proc.stderr.read().strip()
                self.fail(f"el hijo no tomo el lock: {error or ready}")
            with self.assertRaises(OrchestratorError) as caught:
                integrate_task(self.repo, "missing")
            self.assertEqual(caught.exception.code, "busy")
        finally:
            proc.kill()
            proc.wait(timeout=5)
            proc.stdout.close()
            proc.stderr.close()

    def test_hook_blocks_non_ff_and_agent_push_to_main(self):
        bare = Path(self.tmp.name) / "bare.git"
        self.git(["init", "--bare", "-b", "main", str(bare)])
        self.git(["remote", "add", "origin", str(bare)])
        install_hooks(self.repo)
        self.git(["push", "origin", "main"])
        self.git(["branch", "old"])
        self.write_commit(self.repo, "README.md", "main2\n", "main2")
        self.git(["push", "origin", "main"])
        self.git(["checkout", "-b", "rewritten", "old"])
        self.write_commit(self.repo, "README.md", "reescrito\n", "reescrito")
        remote_before = subprocess.run(
            ["git", "--git-dir", str(bare), "rev-parse", "main"],
            text=True,
            capture_output=True,
            check=True,
        ).stdout.strip()
        rejected = subprocess.run(
            ["git", "push", "--force", "origin", "rewritten:main"],
            cwd=self.repo,
            env={**os.environ, **ENV},
            text=True,
            capture_output=True,
        )
        self.assertNotEqual(rejected.returncode, 0)
        self.assertIn("no fast-forward", rejected.stderr)
        remote_after = subprocess.run(
            ["git", "--git-dir", str(bare), "rev-parse", "main"],
            text=True,
            capture_output=True,
            check=True,
        ).stdout.strip()
        self.assertEqual(remote_after, remote_before)
        self.git(["checkout", "main"])

        add_task(self.repo, "P", "push", ["docs"], "bajo", "main", validate_cmd="true")
        worktree = Path(create_worktree(self.repo, "P")["worktree"])
        self.write_commit(worktree, "docs/p.txt", "p\n", "p")
        to_main = subprocess.run(
            ["git", "push", "origin", "HEAD:main"],
            cwd=worktree,
            env={**os.environ, **ENV},
            text=True,
            capture_output=True,
        )
        self.assertNotEqual(to_main.returncode, 0)
        self.assertIn("worktree de agente", to_main.stderr)
        feature = subprocess.run(
            ["git", "push", "-u", "origin", "HEAD"],
            cwd=worktree,
            env={**os.environ, **ENV},
            text=True,
            capture_output=True,
        )
        self.assertEqual(feature.returncode, 0, feature.stderr)

    def test_publish_pushes_branch_and_base(self):
        bare = Path(self.tmp.name) / "bare.git"
        self.git(["init", "--bare", "-b", "main", str(bare)])
        self.git(["remote", "add", "origin", str(bare)])
        install_hooks(self.repo)
        add_task(self.repo, "U", "nota", ["docs"], "bajo", "main", validate_cmd="true")
        worktree = Path(create_worktree(self.repo, "U")["worktree"])
        self.write_commit(worktree, "docs/u.txt", "publicado\n", "nota")
        review_task(self.repo, "U")
        integrate_task(self.repo, "U")
        publish_task(self.repo, "U")
        remote_main = subprocess.run(
            ["git", "--git-dir", str(bare), "rev-parse", "main"],
            text=True,
            capture_output=True,
            check=True,
        ).stdout.strip()
        self.assertEqual(remote_main, self.git(["rev-parse", "HEAD"]).stdout.strip())
        shown = subprocess.run(
            ["git", "--git-dir", str(bare), "show", "main:docs/u.txt"],
            text=True,
            capture_output=True,
            check=True,
        )
        self.assertEqual(shown.stdout, "publicado\n")

    def test_cli_integrate_merges_without_remote(self):
        add_task(self.repo, "L", "local", ["docs"], "bajo", "main", validate_cmd="true")
        worktree = Path(create_worktree(self.repo, "L")["worktree"])
        self.write_commit(worktree, "docs/l.txt", "local\n", "nota")
        self.assertEqual(review_task(self.repo, "L")["status"], "APPROVED")
        code = main(["--repo", str(self.repo), "integrate", "L"])
        self.assertEqual(code, 0)
        self.assertEqual(load_state(self.repo)["tasks"]["L"]["status"], "MERGED")
        self.assertEqual((self.repo / "docs" / "l.txt").read_text(), "local\n")

    def test_cli_integrate_does_not_push(self):
        bare = Path(self.tmp.name) / "bare.git"
        self.git(["init", "--bare", "-b", "main", str(bare)])
        self.git(["remote", "add", "origin", str(bare)])
        self.git(["push", "origin", "main"])
        remote_before = subprocess.run(
            ["git", "--git-dir", str(bare), "rev-parse", "main"],
            text=True,
            capture_output=True,
            check=True,
        ).stdout.strip()
        add_task(self.repo, "R", "remoto", ["docs"], "bajo", "main", validate_cmd="true")
        worktree = Path(create_worktree(self.repo, "R")["worktree"])
        self.write_commit(worktree, "docs/r.txt", "remoto\n", "nota")
        self.assertEqual(review_task(self.repo, "R")["status"], "APPROVED")
        local_before = self.git(["rev-parse", "HEAD"]).stdout.strip()
        code = main(["--repo", str(self.repo), "integrate", "R"])
        self.assertEqual(code, 0)
        self.assertEqual(load_state(self.repo)["tasks"]["R"]["status"], "MERGED")
        self.assertNotEqual(self.git(["rev-parse", "HEAD"]).stdout.strip(), local_before)
        remote_after = subprocess.run(
            ["git", "--git-dir", str(bare), "rev-parse", "main"],
            text=True,
            capture_output=True,
            check=True,
        ).stdout.strip()
        self.assertEqual(remote_after, remote_before)
        branch = load_state(self.repo)["tasks"]["R"]["branch"]
        missing = subprocess.run(
            ["git", "--git-dir", str(bare), "rev-parse", branch],
            text=True,
            capture_output=True,
        )
        self.assertNotEqual(missing.returncode, 0)

    def test_publish_without_remote_is_blocked(self):
        add_task(self.repo, "N", "sin remoto", ["docs"], "bajo", "main", validate_cmd="true")
        worktree = Path(create_worktree(self.repo, "N")["worktree"])
        self.write_commit(worktree, "docs/n.txt", "n\n", "n")
        self.assertEqual(review_task(self.repo, "N")["status"], "APPROVED")
        integrate_task(self.repo, "N")
        with self.assertRaises(OrchestratorError) as caught:
            publish_task(self.repo, "N")
        self.assertEqual(caught.exception.code, "blocked")

    def test_missing_validation_does_not_pass(self):
        add_task(self.repo, "V", "sin test", ["docs"], "bajo", "main")
        worktree = Path(create_worktree(self.repo, "V")["worktree"])
        self.write_commit(worktree, "docs/v.txt", "v\n", "v")
        self.assertEqual(review_task(self.repo, "V")["status"], "BLOCKED")

    def test_failing_validation_does_not_pass(self):
        add_task(self.repo, "F", "validacion falla", ["docs"], "bajo", "main", validate_cmd="false")
        worktree = Path(create_worktree(self.repo, "F")["worktree"])
        self.write_commit(worktree, "docs/f.txt", "f\n", "f")
        reviewed = review_task(self.repo, "F")
        self.assertEqual(reviewed["status"], "FAILED")
        validate = next(item for item in reviewed["checks"] if item["name"] == "validate_cmd")
        self.assertEqual(validate["result"], "FAIL")
        with self.assertRaises(OrchestratorError) as caught:
            integrate_task(self.repo, "F")
        self.assertEqual(caught.exception.code, "blocked")

    def test_dirty_worktree_blocks_review(self):
        add_task(self.repo, "W", "worktree sucio", ["docs"], "bajo", "main", validate_cmd="true")
        worktree = Path(create_worktree(self.repo, "W")["worktree"])
        (worktree / "docs").mkdir(exist_ok=True)
        (worktree / "docs" / "sin-commit.txt").write_text("x\n")
        with self.assertRaises(OrchestratorError) as caught:
            review_task(self.repo, "W")
        self.assertEqual(caught.exception.code, "blocked")
        self.assertEqual(load_state(self.repo)["tasks"]["W"]["status"], "RUNNING")

    def test_self_dependency_is_rejected(self):
        with self.assertRaises(OrchestratorError):
            add_task(self.repo, "Z", "ciclo", ["docs"], "bajo", "main", ["Z"])

    def test_product_guard_and_doctor(self):
        with self.assertRaises(OrchestratorError) as caught:
            product_guard(self.repo)
        self.assertEqual(caught.exception.code, "blocked")
        (self.repo / MASTER_NAME).write_text("fuente\n")
        product_guard(self.repo)
        self.assertEqual(main(["--repo", str(self.repo), "doctor"]), 0)


if __name__ == "__main__":
    unittest.main()
