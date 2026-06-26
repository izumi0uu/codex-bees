#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

import { parsePrePushRefs, planPrePush } from "./pre-push-rules.mjs";

if (process.env.CODEX_BEES_SKIP_PREPUSH === "1") {
  console.log("[pre-push] skipped via CODEX_BEES_SKIP_PREPUSH=1");
  process.exit(0);
}

const currentBranch = getCurrentBranch();
const refs = getRefs();
const plan = planPrePush({ currentBranch, refs });

console.log(`[pre-push] ${plan.reason}`);

if (!plan.ok) {
  process.exit(1);
}

if (process.env.CODEX_BEES_PREPUSH_DRY_RUN === "1") {
  for (const command of plan.commands) {
    console.log(`[pre-push] would run: ${command}`);
  }
  process.exit(0);
}

for (const command of plan.commands) {
  console.log(`[pre-push] running: ${command}`);
  execFileSync("sh", ["-lc", command], { stdio: "inherit" });
}

function getCurrentBranch() {
  if (process.env.CODEX_BEES_PREPUSH_CURRENT_BRANCH) {
    return process.env.CODEX_BEES_PREPUSH_CURRENT_BRANCH;
  }

  return execFileSync("git", ["branch", "--show-current"], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "inherit"]
  }).trim();
}

function getRefs() {
  if (process.env.CODEX_BEES_PREPUSH_STDIN_FILE) {
    return parsePrePushRefs(readFileSync(process.env.CODEX_BEES_PREPUSH_STDIN_FILE, "utf8"));
  }

  if (process.env.CODEX_BEES_PREPUSH_STDIN_TEXT) {
    return parsePrePushRefs(process.env.CODEX_BEES_PREPUSH_STDIN_TEXT);
  }

  const stdin = readFileSync(process.stdin.fd, "utf8");
  return parsePrePushRefs(stdin);
}
