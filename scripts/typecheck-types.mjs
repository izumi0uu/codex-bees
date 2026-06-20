import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(SCRIPT_DIR, "..");
const cwd = process.cwd();
const args = process.argv.slice(2);
const npmCacheDir = process.env.npm_config_cache ?? join(tmpdir(), "codex-bees-smoke-npm-cache");

const compilerCandidates = [
  resolve(cwd, "node_modules", "typescript", "bin", "tsc"),
  resolve(REPO_ROOT, "node_modules", "typescript", "bin", "tsc")
];

function exitFrom(result) {
  if (typeof result.status === "number") {
    process.exit(result.status);
  }
  process.exit(1);
}

const localCompiler = compilerCandidates.find((candidate) => existsSync(candidate));

if (localCompiler) {
  exitFrom(
    spawnSync(process.execPath, [localCompiler, ...args], {
      stdio: "inherit"
    })
  );
}

mkdirSync(npmCacheDir, { recursive: true });

function runNpmExec(extraArgs = []) {
  return spawnSync(
    "npm",
    ["exec", "--yes", ...extraArgs, "--package", "typescript", "tsc", "--", ...args],
    {
      stdio: "inherit",
      env: {
        ...process.env,
        npm_config_cache: npmCacheDir
      }
    }
  );
}

const offlineResult = runNpmExec(["--offline"]);
if (offlineResult.status === 0) {
  process.exit(0);
}

exitFrom(runNpmExec());
