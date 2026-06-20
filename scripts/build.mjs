import { copyFileSync, mkdirSync, readdirSync, rmSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

function copySourceModules() {
  for (const entry of readdirSync("src")) {
    if (!entry.endsWith(".js")) {
      continue;
    }
    copyFileSync(join("src", entry), join("dist", entry));
  }
}

function verifyDistCommand(label, args) {
  const result = spawnSync("node", args, { encoding: "utf8" });
  if (result.status !== 0) {
    console.error(`[build:${label}] failed`);
    console.error(result.stderr || result.stdout);
    process.exit(result.status ?? 1);
  }
}

rmSync("dist", { recursive: true, force: true });
mkdirSync("dist", { recursive: true });
copySourceModules();
copyFileSync("scripts/smoke.mjs", "dist/smoke.mjs");

verifyDistCommand("dist-help", ["./dist/index.js", "--help"]);
verifyDistCommand("dist-tools", ["./dist/mcp.js", "--tools"]);

console.log("built");
