import { spawnSync } from "node:child_process";

const checks = [
  ["help", ["./src/index.js", "--help"]],
  ["version", ["./src/index.js", "--version"]],
  ["tools", ["./src/mcp.js", "--tools"]]
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
