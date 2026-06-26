#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { chmodSync, readdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const verbose = process.env.CODEX_BEES_GITHOOK_VERBOSE === "1";

try {
  const topLevel = execFileSync("git", ["rev-parse", "--show-toplevel"], {
    cwd: repoRoot,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "ignore"]
  }).trim();

  if (topLevel !== repoRoot) {
    log(`skip githook install outside repo root: ${repoRoot}`);
    process.exit(0);
  }

  execFileSync("git", ["config", "core.hooksPath", ".githooks"], {
    cwd: repoRoot,
    stdio: "ignore"
  });

  for (const entry of readdirSync(resolve(repoRoot, ".githooks"))) {
    chmodSync(resolve(repoRoot, ".githooks", entry), 0o755);
  }

  log("configured core.hooksPath=.githooks");
} catch {
  log("skip githook install; git repo metadata is unavailable");
}

function log(message) {
  if (verbose) {
    console.error(message);
  }
}
