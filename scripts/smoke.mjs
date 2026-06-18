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
  ["task-list", ["./src/index.js", "task:list"]],
  ["task-update", ["./src/index.js", "task:update", "--id", "task-1", "--status", "doing"]],
  ["task-release", ["./src/index.js", "task:release", "--id", "task-1", "--by", "smoke-worker"]]
];

for (const [label, args] of checks) {
  const result = spawnSync("node", args, { encoding: "utf8" });
  if (result.status !== 0) {
    console.error(`[smoke:${label}] failed`);
    console.error(result.stderr || result.stdout);
    process.exit(result.status ?? 1);
  }
}

console.log("smoke: ok");
