import { spawnSync } from "node:child_process";
import { rmSync } from "node:fs";

rmSync(".codex-bees", { recursive: true, force: true });

const checks = [
  ["help", ["./src/index.js", "--help"]],
  ["version", ["./src/index.js", "--version"]],
  ["tools", ["./src/mcp.js", "--tools"]],
  ["plan", ["./src/index.js", "plan", "--task", "Add a doctor smoke check to the CLI"]],
  ["task-add", ["./src/index.js", "task:add", "--title", "smoke task", "--status", "todo"]],
  ["task-claim", ["./src/index.js", "task:claim", "--id", "task-1", "--by", "smoke-worker"]],
  ["task-block", ["./src/index.js", "task:block", "--id", "task-1", "--by", "smoke-worker", "--notes", "waiting on verifier"]],
  ["task-claim-from-blocked", ["./src/index.js", "task:claim", "--id", "task-1", "--by", "smoke-worker"]],
  ["task-review", ["./src/index.js", "task:review", "--id", "task-1", "--by", "smoke-worker"]],
  ["task-done", ["./src/index.js", "task:done", "--id", "task-1", "--by", "smoke-worker"]],
  ["task-list", ["./src/index.js", "task:list"]],
  ["task-update", ["./src/index.js", "task:update", "--id", "task-1", "--status", "done", "--notes", "verified by smoke"]],
  ["task-release-invalid", ["./src/index.js", "task:release", "--id", "task-1", "--by", "smoke-worker"], 1]
];

for (const [label, args, expectedStatus = 0] of checks) {
  const result = spawnSync("node", args, { encoding: "utf8" });
  if (result.status !== expectedStatus) {
    console.error(`[smoke:${label}] failed`);
    console.error(result.stderr || result.stdout);
    process.exit(result.status ?? 1);
  }
}

console.log("smoke: ok");
