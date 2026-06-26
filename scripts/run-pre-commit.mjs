#!/usr/bin/env node
import { execFileSync } from "node:child_process";

import { planPreCommit } from "./pre-commit-rules.mjs";

if (process.env.CODEX_BEES_SKIP_PRECOMMIT === "1") {
  console.log("[pre-commit] skipped via CODEX_BEES_SKIP_PRECOMMIT=1");
  process.exit(0);
}

const currentBranch = getCurrentBranch();
const stagedPaths = getStagedPaths();
const plan = planPreCommit({ currentBranch, stagedPaths });

console.log(`[pre-commit] ${plan.reason}`);

if (!plan.ok) {
  process.exit(1);
}

if (plan.commands.length === 0) {
  process.exit(0);
}

if (process.env.CODEX_BEES_PRECOMMIT_DRY_RUN === "1") {
  for (const command of plan.commands) {
    console.log(`[pre-commit] would run: ${command}`);
  }
  process.exit(0);
}

for (const command of plan.commands) {
  console.log(`[pre-commit] running: ${command}`);
  execFileSync("sh", ["-lc", command], { stdio: "inherit" });
}

function getStagedPaths() {
  if (process.env.CODEX_BEES_PRECOMMIT_STAGED_FILES) {
    return process.env.CODEX_BEES_PRECOMMIT_STAGED_FILES.split("\n");
  }

  const output = execFileSync(
    "git",
    ["diff", "--cached", "--name-only", "--diff-filter=ACMR"],
    {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "inherit"]
    }
  );

  return output.split("\n");
}

function getCurrentBranch() {
  if (process.env.CODEX_BEES_PRECOMMIT_CURRENT_BRANCH) {
    return process.env.CODEX_BEES_PRECOMMIT_CURRENT_BRANCH;
  }

  return execFileSync("git", ["branch", "--show-current"], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "inherit"]
  }).trim();
}
